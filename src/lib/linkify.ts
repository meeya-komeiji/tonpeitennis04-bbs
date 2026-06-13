/**
 * 本文中の URL 検出・種類判定ユーティリティ。
 *
 * - サニタイズ済みHTML内の http(s) URL を <a> タグへ変換する（描画時に実行）。
 * - 本文から URL を抽出し、種類（YouTube / Google Maps / X(Twitter) / 汎用）を
 *   判定して、埋め込み用の情報を返す。実際の埋め込み描画は LinkPreview が行う。
 *
 * iframe 等の埋め込みはサニタイズ済みHTMLには混ぜず、抽出した URL を元に
 * React コンポーネントとして描画する方針（XSS対策のため）。
 */

/** プレビューの種類 */
export type LinkKind = 'youtube' | 'gmaps' | 'twitter' | 'generic';

export type ClassifiedLink = {
  /** 元のURL（デコード済み） */
  url: string;
  kind: LinkKind;
  /** kind に応じた埋め込み用URL（youtube/gmaps の iframe src）。汎用では undefined */
  embedUrl?: string;
};

// http(s) URL のマッチ。空白・タグ境界・引用符で区切る。
// サニタイズ済みHTML内では & が &amp; 等にエンコードされているが、
// それらの文字（&, ;, # など）は除外していないためそのまま含まれる。
const URL_RE = /https?:\/\/[^\s<>"']+/g;

/** URL末尾に付きやすい句読点・閉じ括弧を取り除く */
function trimTrailing(url: string): string {
  return url.replace(/[.,!?)\]}>]+$/, '');
}

/** よく使うHTMLエンティティをデコードしてプレーンテキスト化する */
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * サニタイズ済みHTML内の http(s) URL を <a>（新規タブ）に変換する。
 * マッチ文字列にはエンコード済みエンティティ（&amp; など）が含まれうるが、
 * href 属性・表示テキストの双方で正しく解釈されるためそのまま使う。
 */
export function linkifyUrls(html: string): string {
  return html.replace(URL_RE, (raw) => {
    const trimmed = trimTrailing(raw);
    const trailing = raw.slice(trimmed.length);
    return `<a href="${trimmed}" target="_blank" rel="noopener noreferrer" class="res-link">${trimmed}</a>${trailing}`;
  });
}

/**
 * 本文HTMLから http(s) URL を抽出する（重複は除き、出現順を保つ）。
 * 埋め込みプレビューの描画対象に使う。
 */
export function extractUrls(html: string): string[] {
  const text = htmlToText(html);
  const matches = text.match(URL_RE) ?? [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const m of matches) {
    const url = trimTrailing(m);
    if (!seen.has(url)) {
      seen.add(url);
      result.push(url);
    }
  }
  return result;
}

function safeParse(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function hostMatches(host: string, names: string[]): boolean {
  const h = host.toLowerCase().replace(/^www\./, '');
  return names.some((n) => h === n || h.endsWith(`.${n}`));
}

/** YouTube URL から動画IDを取り出す（watch / youtu.be / shorts / embed 対応） */
function youtubeId(u: URL): string | null {
  if (hostMatches(u.hostname, ['youtu.be'])) {
    const id = u.pathname.split('/').filter(Boolean)[0];
    return id ?? null;
  }
  if (hostMatches(u.hostname, ['youtube.com'])) {
    const v = u.searchParams.get('v');
    if (v) return v;
    const parts = u.pathname.split('/').filter(Boolean);
    if ((parts[0] === 'shorts' || parts[0] === 'embed') && parts[1]) {
      return parts[1];
    }
  }
  return null;
}

/** Google Maps URL から埋め込み用のクエリ（座標 or 場所名）を取り出す */
function gmapsQuery(u: URL): string | null {
  const q = u.searchParams.get('q');
  if (q) return q;
  // /maps/place/<NAME>/@lat,lng,zoom 形式
  const at = u.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) return `${at[1]},${at[2]}`;
  const place = u.pathname.match(/\/place\/([^/]+)/);
  if (place) return decodeURIComponent(place[1].replace(/\+/g, ' '));
  return null;
}

/** URL を種類判定し、埋め込み用URLを付けて返す */
export function classifyUrl(url: string): ClassifiedLink {
  const u = safeParse(url);
  if (!u || (u.protocol !== 'http:' && u.protocol !== 'https:')) {
    return { url, kind: 'generic' };
  }

  const ytId = youtubeId(u);
  if (ytId) {
    return {
      url,
      kind: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${encodeURIComponent(ytId)}`,
    };
  }

  if (
    hostMatches(u.hostname, ['google.com', 'goo.gl']) &&
    (u.pathname.includes('/maps') || u.hostname.toLowerCase().startsWith('maps.'))
  ) {
    const q = gmapsQuery(u);
    if (q) {
      return {
        url,
        kind: 'gmaps',
        embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`,
      };
    }
    return { url, kind: 'gmaps' };
  }
  if (hostMatches(u.hostname, ['maps.google.com', 'maps.app.goo.gl'])) {
    const q = gmapsQuery(u);
    return {
      url,
      kind: 'gmaps',
      embedUrl: q
        ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`
        : undefined,
    };
  }

  if (hostMatches(u.hostname, ['twitter.com', 'x.com']) && /\/status\/\d+/.test(u.pathname)) {
    return { url, kind: 'twitter' };
  }

  return { url, kind: 'generic' };
}

/** 表示用ドメイン名（www. を除いたホスト名） */
export function displayHost(url: string): string {
  const u = safeParse(url);
  return u ? u.hostname.replace(/^www\./, '') : url;
}
