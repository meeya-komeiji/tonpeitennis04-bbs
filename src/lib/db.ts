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

export const DEFAULT_NAME = '名無しさん';

export type Thread = {
  id: string;
  title: string;
  resCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type Post = {
  id: string;
  no: number;
  name: string;
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

/** 更新日時の新しい順にスレッド一覧を取得 */
export async function fetchThreads(max = 100): Promise<Thread[]> {
  const q = query(
    collection(db, 'threads'),
    orderBy('updatedAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toThread(d.id, d.data()));
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

/** 単一スレッドを取得（存在しなければ null） */
export async function fetchThread(threadId: string): Promise<Thread | null> {
  const ref = doc(db, 'threads', threadId);
  const snap = await getDoc(ref);
  return snap.exists() ? toThread(snap.id, snap.data()) : null;
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

/** 新規スレッド作成（1レス目を同時に作成）。作成したスレッドIDを返す */
export async function createThread(input: {
  title: string;
  name: string;
  body: string;
}): Promise<string> {
  const title = input.title.trim();
  const name = input.name.trim() || DEFAULT_NAME;
  const body = input.body.trim();

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
  const body = input.body.trim();
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
