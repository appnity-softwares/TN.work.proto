import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useEmployees() {
  const { data, error, isLoading } = useSWR('/api/admin/employees', fetcher);

  return {
    employees: data?.employees,
    isLoading,
    isError: error,
  };
}
