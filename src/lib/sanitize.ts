/**
 * 投稿本文のリッチテキスト（HTML）サニタイズ。
 *
 * エディタが出力するごく限られた装飾（太字・斜体・下線・プリセット色）だけを
 * 許可するアローリスト方式。保存時・描画時の双方で通すことで XSS を防ぐ。
 * DOMPurify 等は導入せず、対象タグが狭いため自前で実装している。
 */

export type TextColor = { label: string; value: string };

/**
 * 文字色プリセット（初期4色）。
 * 既存UIの配色に合わせており、ここに追加/削除するだけで増減できる。
 */
export const TEXT_COLORS: TextColor[] = [
  { label: '黒', value: '#000000' },
  { label: '赤', value: '#cc0000' },
  { label: '青', value: '#1a0dab' },
  { label: '緑', value: '#008000' },
];

/** 子要素ごと完全に破棄するタグ */
const DROP_CONTENT_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'TEMPLATE',
  'LINK',
  'META',
]);

/** そのまま残すタグ。これ以外はタグを外して中身（テキスト）だけ残す */
const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'SPAN', 'DIV', 'P']);

function hexToRgbNorm(hex: string): string | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `rgb(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255})`;
}

function normalizeColor(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, '');
}

/** 正規化した色文字列 → 正規のhex値。許可色だけを通すための対応表 */
function buildColorMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of TEXT_COLORS) {
    const hex = c.value.toLowerCase();
    map.set(hex, hex);
    const rgb = hexToRgbNorm(hex);
    if (rgb) map.set(rgb, hex);
  }
  return map;
}

const COLOR_MAP = buildColorMap();

/** span の inline style から許可された装飾だけを写す（色はプリセットのみ） */
function applySafeStyles(src: HTMLElement, dest: HTMLElement): void {
  const color = src.style.color;
  if (color) {
    const canon = COLOR_MAP.get(normalizeColor(color));
    if (canon) dest.style.color = canon;
  }
  const fw = src.style.fontWeight;
  if (fw === 'bold' || parseInt(fw, 10) >= 600) dest.style.fontWeight = 'bold';
  if (src.style.fontStyle === 'italic') dest.style.fontStyle = 'italic';
  const td = src.style.textDecorationLine || src.style.textDecoration;
  if (td && td.includes('underline')) dest.style.textDecoration = 'underline';
}

function walk(src: Node, dest: HTMLElement): void {
  src.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      dest.appendChild(document.createTextNode(node.textContent ?? ''));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    const tag = el.tagName;

    if (DROP_CONTENT_TAGS.has(tag)) return;

    if (tag === 'FONT' || ALLOWED_TAGS.has(tag)) {
      const outTag = tag === 'FONT' ? 'span' : tag.toLowerCase();
      const cleanEl = document.createElement(outTag);

      if (tag === 'FONT') {
        const color = el.getAttribute('color') ?? '';
        const canon = color ? COLOR_MAP.get(normalizeColor(color)) : undefined;
        if (canon) cleanEl.style.color = canon;
      } else if (tag === 'SPAN') {
        applySafeStyles(el, cleanEl);
      }

      walk(el, cleanEl);
      dest.appendChild(cleanEl);
      return;
    }

    // 許可外のタグはタグだけ外して中身を残す（a / img / 未知タグ等）
    walk(el, dest);
  });
}

/**
 * 投稿本文HTMLを安全な装飾だけに絞り込む。
 * DOMが無い環境（SSR等）ではタグを除去したテキストにフォールバックする。
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  if (typeof document === 'undefined') {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/[<>]/g, '');
  }
  const root = document.createElement('div');
  root.innerHTML = html;
  const clean = document.createElement('div');
  walk(root, clean);
  return clean.innerHTML;
}

/** 装飾だけで中身（テキスト）が空かどうか。フォーム送信の空チェック用 */
export function isHtmlEmpty(html: string): boolean {
  if (!html) return true;
  if (typeof document === 'undefined') {
    return (
      html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/ /g, ' ')
        .trim() === ''
    );
  }
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent ?? '').replace(/ /g, ' ').trim() === '';
}
