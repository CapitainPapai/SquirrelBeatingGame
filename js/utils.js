export function formatCoins(n) {
  const v = Math.max(0, Math.round(Number(n) || 0));
  if (v < 10000) return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (v < 1e6) return `${(v / 1e3).toFixed(v < 1e5 ? 1 : 0).replace('.', ',')}K`;
  if (v < 1e9) return `${(v / 1e6).toFixed(2).replace('.', ',')}M`;
  return `${(v / 1e9).toFixed(2).replace('.', ',')}B`;
}

export function formatPercent(x, digits = 1) {
  const v = x * 100;
  if (v >= 10) return `${Math.round(v)}%`;
  if (v >= 1) return `${v.toFixed(1).replace('.', ',')}%`;
  return `${v.toFixed(2).replace('.', ',')}%`;
}

export function formatDuration(sec) {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s} с`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return `${m}:${String(r).padStart(2, '0')}`;
  const h = Math.floor(m / 60);
  return `${h} ч ${m % 60} мин`;
}

export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
