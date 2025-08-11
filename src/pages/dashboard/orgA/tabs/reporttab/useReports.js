import { useState, useEffect, useCallback } from 'react';
import { showErrorAlert } from '@/services/alert';

const useReports = (userRole, userBarangay, page, activeTab) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  // Map tabs to report_status codes
  const statusMap = {
    0: 'P', // Pending
    1: 'A', // Approved
    2: 'D', // Denied/Rejected
  };

  const fetchReports = useCallback(
    async (pageNumber = 1) => {
      if (!userRole) return;
      setLoading(true);
      setError(null);
      try {
        const token = JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reports?page=${pageNumber}&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || 'Failed to load reports');
        }
        const json = await res.json();

    let filteredReports = [];

    if (userRole === 'S' || userRole === 'D') {
    // Supers and 'D' get ALL reports
    filteredReports = json.data || [];
    } else if (userBarangay) {
    // Everyone else only their barangay reports
    filteredReports = (json.data || []).filter(report => report.barangay === userBarangay);
    }



        // Filter by active tab status properly
        const tabStatus = statusMap[activeTab];
        const tabFilteredReports = filteredReports.filter(r => r.report_status === tabStatus);

        setReports(tabFilteredReports);
        setTotalPages(json.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.message || 'Unknown error');
        await showErrorAlert(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [userRole, userBarangay, activeTab]
  );

  useEffect(() => {
    fetchReports(page);
  }, [fetchReports, page]);

  return { reports, loading, error, totalPages, fetchReports };
};

export default useReports;
