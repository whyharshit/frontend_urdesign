import { useDemo } from './useDemo';
import type { Professional } from '../types/domain';

export function useOwnProfile() {
  const { state, dispatch, ready, storageError } = useDemo();
  const profile = state.providers.find((p) => p.id === state.ownId)!;
  const update = (patch: Partial<Professional>) =>
    dispatch({ type: 'profile', profile: { ...profile, ...patch } });
  return { profile, update, ready, storageError };
}
