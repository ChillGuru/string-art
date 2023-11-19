import { useQuery } from '@tanstack/react-query';

import { getAllCodesQuery } from '@/modules/Codes/queries';

export function AdminPage() {
  const getCodes = useQuery(getAllCodesQuery);
  return <div />;
}
