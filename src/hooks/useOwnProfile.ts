import { useDemo } from './useDemo';
import { OWN_PROVIDER_ID } from '../config/catalog';
import type { Professional } from '../types/domain';

export function useOwnProfile() {
  const { state, dispatch, ready, storageError } = useDemo();
  const profile = state.providers.find((p) => p.id === OWN_PROVIDER_ID)!;
  const update = (patch: Partial<Professional>) =>
    dispatch({ type: 'profile', profile: { ...profile, ...patch } });
  return { profile, update, ready, storageError };
}
