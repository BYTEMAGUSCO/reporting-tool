import { useState, useEffect } from 'react'; 

const PAGE_LIMIT = 8;
const CACHE_DURATION = 3 * 60 * 1000; // 3 mins

const useCachedAccounts = ({type, fetcherFn}) => {
  const [allAccounts, setAllAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAccounts = async (targetPage = 1, force = false) => {
    const session = JSON.parse(sessionStorage.getItem('session'));
    const token = session?.access_token;
    if (!token) return;

    const cacheKey = `${type}_cache_${targetPage}`;
    const cached = JSON.parse(sessionStorage.getItem(cacheKey));
    const now = Date.now();

    if (cached && !force && now - cached.timestamp < CACHE_DURATION) {
      setAllAccounts(cached.accounts || []);
      setTotalPages(cached.totalPages || 1);
      setPage(targetPage);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { accounts, total } = await fetcherFn(token, targetPage, PAGE_LIMIT);
      const totalPages = Math.ceil(total / PAGE_LIMIT);

      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ accounts, totalPages, timestamp: now })
      );

      setAllAccounts(accounts);
      setTotalPages(totalPages);
      setPage(targetPage);
    } catch (err) {
      console.error(`❌ Error loading ${type} accounts:`, err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(1);
  }, []);

  return {
    allAccounts,
    isLoading,
    page,
    totalPages,
    fetchAccounts,
  };
};

export default useCachedAccounts;
