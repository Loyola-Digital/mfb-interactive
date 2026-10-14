import { validateContent, type Content } from '../../shared/content.ts';

export type LoadResult = { ok: true; content: Content } | { ok: false; error: string };

export async function loadContent(fetchFn: typeof fetch = fetch): Promise<LoadResult> {
  try {
    const res = await fetchFn('/content/missions.json', { cache: 'no-cache' });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, content: validateContent(await res.json()) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
