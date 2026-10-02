// Share successful/in-flight preparation, but never keep a failed background request.
export function createLevelPreparer(fetchDocument: typeof fetch = fetch, timeoutMs = 60000) {
  const preparations = new Map<string, Promise<void>>();

  function prepare(url: string, levelId: number, force = false): Promise<void> {
    const key = `${levelId}:${url}`;
    const previous = preparations.get(key);
    if (previous && !force) {
      // A foreground launch can join a background request just before it fails.
      return previous.catch(() => prepare(url, levelId, true));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const task = (async () => {
      const response = await fetchDocument(url, {
        cache: force ? 'reload' : 'default',
        credentials: 'same-origin',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Level ${levelId} request failed: ${response.status}`);
      const text = await response.text();
      const root = text.match(/<div\b[^>]*\sid\s*=\s*(["'])warm-glass-level\1[^>]*>/i)?.[0];
      const documentLevel = root?.match(/\sdata-level-id\s*=\s*(["'])(\d+)\1/i)?.[2];
      if (documentLevel !== String(levelId))
        throw new Error(`Level ${levelId} document is invalid`);
    })().finally(() => clearTimeout(timeout));

    preparations.set(key, task);
    void task.catch(() => {
      // An older failed request must not remove a newer forced retry.
      if (preparations.get(key) === task) preparations.delete(key);
    });
    return task;
  }

  return prepare;
}

export function canPrefetchLevel(network: {
  onLine: boolean;
  connection?: { saveData?: boolean; effectiveType?: string };
}): boolean {
  return (
    network.onLine &&
    !network.connection?.saveData &&
    !['slow-2g', '2g'].includes(network.connection?.effectiveType ?? '')
  );
}
