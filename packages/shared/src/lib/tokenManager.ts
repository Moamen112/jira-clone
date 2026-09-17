import { STORAGE_KEYS } from '../services/storageService';
import type { AuthTokens, TokenStorageAdapter } from './types';

/**
 * Owns the in-memory auth state for one API client and optionally mirrors it
 * to platform storage. Keeping this class free of browser/mobile globals makes
 * the shared package safe to import in either application.
 */
export class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private storageAdapter: TokenStorageAdapter | null;
  private initialization: Promise<void> | null = null;
  private persistenceQueue: Promise<void> = Promise.resolve();
  private revision = 0;

  public constructor(storageAdapter: TokenStorageAdapter | null = null) {
    this.storageAdapter = storageAdapter;
  }

  /** Configures persistence before the client starts making requests. */
  public setStorageAdapter(adapter: TokenStorageAdapter | null): void {
    if (this.storageAdapter === adapter) return;

    this.storageAdapter = adapter;
    this.initialization = null;
    this.revision += 1;
  }

  /**
   * Loads persisted tokens once. Request interceptors await this method so an
   * app cannot accidentally send its first request before AsyncStorage loads.
   */
  public initialize(): Promise<void> {
    if (!this.initialization) {
      this.initialization = this.loadFromStorage();
    }

    return this.initialization;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /** Exposes a session version used to discard refresh results after logout/login. */
  public getRevision(): number {
    return this.revision;
  }

  /** Updates memory immediately, then waits for both persistence writes. */
  public async setTokens(tokens: AuthTokens): Promise<void> {
    this.revision += 1;
    this.accessToken = tokens.accessToken;

    if (tokens.refreshToken !== undefined) {
      this.refreshToken = tokens.refreshToken;
    }

    const adapter = this.storageAdapter;
    if (!adapter) return;

    const writes: Array<() => void | Promise<void>> = [
      () => adapter.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
    ];

    if (tokens.refreshToken !== undefined) {
      writes.push(
        tokens.refreshToken
          ? () => adapter.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken as string)
          : () => adapter.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      );
    }

    await this.persist(writes);
  }

  /** Applies a refresh result only if no login/logout occurred in the meantime. */
  public async setTokensIfCurrent(
    tokens: AuthTokens,
    expectedRevision: number
  ): Promise<boolean> {
    if (this.revision !== expectedRevision) return false;

    await this.setTokens(tokens);
    return true;
  }

  /** Clears memory first so no later request can reuse an invalid token. */
  public async clearTokens(): Promise<void> {
    this.revision += 1;
    this.accessToken = null;
    this.refreshToken = null;

    const adapter = this.storageAdapter;
    if (!adapter) return;

    await this.persist([
      () => adapter.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      () => adapter.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  }

  private async loadFromStorage(): Promise<void> {
    // If login was called without awaiting it, finish that queued write before
    // reading so initialization cannot load the previous persisted session.
    await this.persistenceQueue;

    const adapter = this.storageAdapter;
    if (!adapter) return;

    // A login/logout performed during these reads wins over stale storage data.
    const revisionBeforeRead = this.revision;

    try {
      const [storedAccessToken, storedRefreshToken] = await Promise.all([
        Promise.resolve(adapter.getItem(STORAGE_KEYS.ACCESS_TOKEN)),
        Promise.resolve(adapter.getItem(STORAGE_KEYS.REFRESH_TOKEN)),
      ]);

      if (this.storageAdapter !== adapter || this.revision !== revisionBeforeRead) return;

      this.accessToken = storedAccessToken;
      this.refreshToken = storedRefreshToken;
    } catch {
      // Storage may be unavailable (private mode, locked keychain, etc.). The
      // client can still operate with its in-memory token state.
    }
  }

  /**
   * Serializes mutations so a slow delete cannot erase a newer login. Storage
   * failures remain non-fatal because the in-memory session is still usable.
   */
  private persist(operations: Array<() => void | Promise<void>>): Promise<void> {
    const persistence = this.persistenceQueue.then(() =>
      Promise.all(
        operations.map(async (operation) => {
          try {
            await operation();
          } catch {
            // Platform storage can be temporarily unavailable; keep memory valid.
          }
        })
      ).then(() => undefined)
    );

    this.persistenceQueue = persistence;
    return persistence;
  }
}
