import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { sanitizeHtml } from './sanitize';

export const DEFAULT_NAME = '名無しさん';

/**
 * 開発環境専用スレッドの固定ドキュメントID（dev フラグと併せて識別に使う）。
 * Firestore は `__.*__` 形式のIDを予約しているため、その形式は使えない。
 */
export const DEV_THREAD_ID = 'dev-only-thread';

/** 開発環境（`npm start` / `next dev`）かどうか。本番ビルドでは false になる */
function isDevEnv(): boolean {
  return process.env.NODE_ENV === 'development';
}

export type Thread = {
  id: string;
  title: string;
  resCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  /** 開発環境専用スレッドなら true。本番では一覧表示・アクセスから除外する */
  dev: boolean;
};

export type Post = {
  id: string;
  no: number;
  name: string;
  /** 本文。リッチテキスト(HTML)。描画前に必ずサニタイズする */
  body: string;
  createdAt: Date | null;
};

/** トップページ用のスレッドプレビュー。先頭投稿＋最新数件を表示する */
export type ThreadPreview = {
  thread: Thread;
  /** 表示する投稿（レス番号の昇順）。posts[0] は必ず先頭投稿(no=1) */
  posts: Post[];
  /** posts[0] と posts[1] の間で省略された件数（0 なら省略なし） */
  omittedAfterFirst: number;
};

/** トップで各スレッドに表示する最新レスの件数 */
export const PREVIEW_RECENT = 5;

function tsToDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function toThread(id: string, data: DocumentData): Thread {
  return {
    id,
    title: typeof data.title === 'string' ? data.title : '(無題)',
    resCount: typeof data.resCount === 'number' ? data.resCount : 0,
    createdAt: tsToDate(data.createdAt),
    updatedAt: tsToDate(data.updatedAt),
    dev: data.dev === true,
  };
}

function toPost(id: string, data: DocumentData): Post {
  return {
    id,
    no: typeof data.no === 'number' ? data.no : 0,
    name: typeof data.name === 'string' && data.name ? data.name : DEFAULT_NAME,
    body: typeof data.body === 'string' ? data.body : '',
    createdAt: tsToDate(data.createdAt),
  };
}

/**
 * 開発環境専用スレッドを用意する（開発環境でのみ呼ぶ）。
 * 固定IDのスレッドが無ければ dev フラグ付きで作成する。べき等。
 * 実体はFirestoreに置き、本番では一覧表示・アクセス時にフィルタして隠す。
 */
export async function ensureDevThread(): Promise<void> {
  const threadRef = doc(db, 'threads', DEV_THREAD_ID);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(threadRef);
    if (snap.exists()) return;
    tx.set(threadRef, {
      title: '開発用スレッド',
      dev: true,
      resCount: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const firstPostRef = doc(collection(threadRef, 'posts'));
    tx.set(firstPostRef, {
      no: 1,
      name: DEFAULT_NAME,
      body: '開発環境専用のテストスレッドです。自由に投稿して動作確認できます。',
      createdAt: serverTimestamp(),
    });
  });
}

/** 更新日時の新しい順にスレッド一覧を取得。本番では開発専用スレッドを除外する */
export async function fetchThreads(max = 100): Promise<Thread[]> {
  // 開発環境では専用スレッドを用意してから一覧を取得する
  if (isDevEnv()) {
    await ensureDevThread();
  }
  const q = query(
    collection(db, 'threads'),
    orderBy('updatedAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  const threads = snap.docs.map((d) => toThread(d.id, d.data()));
  // 本番環境では開発専用スレッドを一覧から除外する
  return isDevEnv() ? threads : threads.filter((t) => !t.dev);
}

/** スレッドの先頭投稿＋最新 PREVIEW_RECENT 件を取得してプレビューを組み立てる */
async function fetchThreadPreview(thread: Thread): Promise<ThreadPreview> {
  const postsRef = collection(db, 'threads', thread.id, 'posts');

  // レスが先頭＋最新分に収まるなら全件取得して省略なしで表示する
  if (thread.resCount <= PREVIEW_RECENT + 1) {
    const snap = await getDocs(query(postsRef, orderBy('no', 'asc')));
    return {
      thread,
      posts: snap.docs.map((d) => toPost(d.id, d.data())),
      omittedAfterFirst: 0,
    };
  }

  // レスが多い場合は先頭投稿と最新 PREVIEW_RECENT 件のみ取得
  const [firstSnap, recentSnap] = await Promise.all([
    getDocs(query(postsRef, orderBy('no', 'asc'), limit(1))),
    getDocs(query(postsRef, orderBy('no', 'desc'), limit(PREVIEW_RECENT))),
  ]);
  const firstPost = firstSnap.docs.map((d) => toPost(d.id, d.data()))[0];
  const recent = recentSnap.docs
    .map((d) => toPost(d.id, d.data()))
    .reverse(); // 昇順に戻す

  const posts = firstPost ? [firstPost, ...recent] : recent;
  const omittedAfterFirst =
    firstPost && recent.length > 0 ? recent[0].no - firstPost.no - 1 : 0;

  return { thread, posts, omittedAfterFirst };
}

/** トップページ用に、更新日時の新しい順でスレッドのプレビュー一覧を取得 */
export async function fetchThreadPreviews(max = 100): Promise<ThreadPreview[]> {
  const threads = await fetchThreads(max);
  return Promise.all(threads.map(fetchThreadPreview));
}

/** 単一スレッドを取得（存在しなければ null）。本番では開発専用スレッドへのアクセスを遮断する */
export async function fetchThread(threadId: string): Promise<Thread | null> {
  const ref = doc(db, 'threads', threadId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const thread = toThread(snap.id, snap.data());
  // 本番環境では開発専用スレッドに直接URLでもアクセスできないようにする
  if (thread.dev && !isDevEnv()) return null;
  return thread;
}

/** スレッド内の投稿をレス番号順に取得 */
export async function fetchPosts(threadId: string): Promise<Post[]> {
  const q = query(
    collection(db, 'threads', threadId, 'posts'),
    orderBy('no', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPost(d.id, d.data()));
}

/** 来訪者カウンターの統計（累計と本日分） */
export type VisitStats = {
  /** 累計来訪者数 */
  total: number;
  /** 本日の来訪者数 */
  today: number;
};

/** ブラウザごとに「本日カウント済み」かを記録する localStorage キー */
const VISIT_KEY = 'meeya-bbs-visit-date';

/** 日本時間での今日の日付を YYYY-MM-DD 形式で返す */
function todayJst(): string {
  // en-CA ロケールは YYYY-MM-DD 形式を返す
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** カウンタードキュメントから表示用の統計を組み立てる（日付が変わっていれば本日分は 0） */
function toVisitStats(data: DocumentData | undefined, today: string): VisitStats {
  const total = typeof data?.total === 'number' ? data.total : 0;
  const sameDay = data?.date === today;
  const todayCount = sameDay && typeof data?.today === 'number' ? data.today : 0;
  return { total, today: todayCount };
}

/**
 * 来訪を記録して最新の統計を返す。
 * 同一ブラウザからの当日2回目以降はカウントせず、現在値の読み取りのみ行う
 * （リロードのたびに増えないよう、1日1人としてカウントする）。
 * 開発環境（ローカルホスト）ではカウントせず、現在値の読み取りのみ行う。
 */
export async function recordVisit(): Promise<VisitStats> {
  const today = todayJst();
  const ref = doc(db, 'counters', 'visits');

  // 開発環境では本番のカウンターを増やさないよう、読み取りのみ行う
  if (isDevEnv()) {
    const snap = await getDoc(ref);
    return toVisitStats(snap.exists() ? snap.data() : undefined, today);
  }

  let alreadyCounted = false;
  try {
    alreadyCounted = window.localStorage.getItem(VISIT_KEY) === today;
  } catch {
    // localStorage が使えない環境ではカウントする
  }

  if (alreadyCounted) {
    const snap = await getDoc(ref);
    return toVisitStats(snap.exists() ? snap.data() : undefined, today);
  }

  const stats = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists() ? snap.data() : undefined;
    const total = (typeof data?.total === 'number' ? data.total : 0) + 1;
    const sameDay = data?.date === today;
    const todayCount =
      (sameDay && typeof data?.today === 'number' ? data.today : 0) + 1;
    tx.set(ref, { total, today: todayCount, date: today });
    return { total, today: todayCount };
  });

  try {
    window.localStorage.setItem(VISIT_KEY, today);
  } catch {
    // 保存できなくてもカウント自体は成立しているので無視
  }

  return stats;
}

/** 新規スレッド作成（1レス目を同時に作成）。作成したスレッドIDを返す */
export async function createThread(input: {
  title: string;
  name: string;
  body: string;
}): Promise<string> {
  const title = input.title.trim();
  const name = input.name.trim() || DEFAULT_NAME;
  // 本文はリッチテキスト(HTML)。保存時にもサニタイズして安全な装飾のみ残す
  const body = sanitizeHtml(input.body);

  const threadRef = doc(collection(db, 'threads'));
  await runTransaction(db, async (tx) => {
    tx.set(threadRef, {
      title,
      resCount: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const firstPostRef = doc(collection(threadRef, 'posts'));
    tx.set(firstPostRef, {
      no: 1,
      name,
      body,
      createdAt: serverTimestamp(),
    });
  });
  return threadRef.id;
}

/** スレッドに返信を投稿。連番(no)はトランザクションで採番する。付与されたレス番号を返す */
export async function createPost(
  threadId: string,
  input: { name: string; body: string }
): Promise<number> {
  const name = input.name.trim() || DEFAULT_NAME;
  // 本文はリッチテキスト(HTML)。保存時にもサニタイズして安全な装飾のみ残す
  const body = sanitizeHtml(input.body);
  const threadRef = doc(db, 'threads', threadId);

  return runTransaction(db, async (tx) => {
    const threadSnap = await tx.get(threadRef);
    if (!threadSnap.exists()) {
      throw new Error('スレッドが見つかりません');
    }
    const current = threadSnap.data().resCount;
    const nextNo = (typeof current === 'number' ? current : 0) + 1;

    const postRef = doc(collection(threadRef, 'posts'));
    tx.set(postRef, {
      no: nextNo,
      name,
      body,
      createdAt: serverTimestamp(),
    });
    tx.update(threadRef, {
      resCount: nextNo,
      updatedAt: serverTimestamp(),
    });
    return nextNo;
  });
}
