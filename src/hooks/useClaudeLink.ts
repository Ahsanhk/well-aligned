'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '@/lib/api-client';
import { toastError } from '@/store/toast';
import type { ApiToken, CreatedApiToken, IntegrationStatus } from '@/types';

export function useClaudeLink() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [tokensLoaded, setTokensLoaded] = useState(false);
  const [created, setCreated] = useState<CreatedApiToken | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    try {
      setStatus(await api.integrationStatus());
      setStatusError(null);
    } catch (error) {
      setStatusError(errorMessage(error));
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  const loadTokens = useCallback(async () => {
    try {
      setTokens(await api.listTokens());
    } catch (error) {
      toastError(errorMessage(error));
    } finally {
      setTokensLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
    void loadTokens();
  }, [loadStatus, loadTokens]);

  const createToken = useCallback(async (name: string) => {
    setIsCreating(true);
    try {
      const token = await api.createToken(name);
      setCreated(token);
      setTokens((current) => [{ id: token.id, name: token.name, lastUsedAt: token.lastUsedAt, createdAt: token.createdAt }, ...current]);
      return true;
    } catch (error) {
      toastError(errorMessage(error));
      return false;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const revokeToken = useCallback(async (tokenId: string) => {
    let previous: ApiToken[] = [];
    setTokens((current) => {
      previous = current;
      return current.filter((token) => token.id !== tokenId);
    });
    setCreated((current) => (current?.id === tokenId ? null : current));
    try {
      await api.deleteToken(tokenId);
    } catch (error) {
      setTokens(previous);
      toastError(errorMessage(error));
    }
  }, []);

  return { status, statusError, isCheckingStatus, reloadStatus: loadStatus, tokens, tokensLoaded, created, isCreating, createToken, revokeToken };
}
