import { useSession } from "next-auth/react";
import { getApiURL } from "../apiUrl";
import { SWRConfiguration } from "swr";
import { fetcher } from "../fetcher";
import useSWRImmutable from "swr/immutable";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export const useAlertQualityMetrics = (fields:string, options: SWRConfiguration = {}) => {
  const { data: session } = useSession();
  const apiUrl = getApiURL();
  const searchParams = useSearchParams();
  let filters = useMemo(() => {
    let params = searchParams?.toString();
    if (fields) {
      params = params ? `${params}&fields=${fields}` : `fields=${fields}`;
    }
    return params;
  }, [fields, searchParams]);
  // TODO: Proper type needs to be defined.
  return useSWRImmutable<Record<string, Record<string, any>>>(
    () => (session ? `${apiUrl}/alerts/quality/metrics${filters ? `?${filters}` : ""}` : null),
    (url) => fetcher(url, session?.accessToken),
    options
  );
};
