/** 日時を 2026/06/12 16:24 形式に整形 */
export function formatDate(date: Date | null): string {
  if (!date) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}/${p(date.getMonth() + 1)}/${p(date.getDate())} ` +
    `${p(date.getHours())}:${p(date.getMinutes())}`
  );
}
