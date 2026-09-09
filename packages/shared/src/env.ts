export const env = (name: string, fallback: string): string => process.env[name] ?? fallback;

export function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n)) throw new Error(`env ${name} must be an integer, got ${raw}`);
  return n;
}
