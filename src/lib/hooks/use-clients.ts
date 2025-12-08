import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useClients() {
  const { data, error, isLoading } = useSWR('/api/admin/clients', fetcher);

  return {
    clients: data?.clients,
    isLoading,
    isError: error,
  };
}
