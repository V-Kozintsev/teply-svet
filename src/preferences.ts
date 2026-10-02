export type Preferences = { sound: boolean; music: boolean };
export const storageKey = 'teply-svet.preferences.v1';

export function readPreferences(raw: string | null): Preferences {
  const defaults = { sound: true, music: true };
  try {
    const value: unknown = raw ? JSON.parse(raw) : null;
    if (!value || typeof value !== 'object') return defaults;
    const parsed = value as Record<string, unknown>;
    return {
      sound: typeof parsed.sound === 'boolean' ? parsed.sound : defaults.sound,
      music: typeof parsed.music === 'boolean' ? parsed.music : defaults.music,
    };
  } catch {
    return defaults;
  }
}
