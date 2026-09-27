import { useSearchParams } from 'react-router-dom';

/** Carry a client's selected project through discovery, profiles and galleries. */
export function useRequirementLink() {
  const [params] = useSearchParams();
  const requirement = params.get('requirement');
  return (path: string) =>
    requirement ? `${path}?requirement=${encodeURIComponent(requirement)}` : path;
}
