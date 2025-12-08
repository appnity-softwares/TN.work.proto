import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useWorkLogs() {
  const { data, error, isLoading } = useSWR('/api/admin/work', fetcher);

  return {
    workLogs: data?.workLogs,
    isLoading,
    isError: error,
  };
}
