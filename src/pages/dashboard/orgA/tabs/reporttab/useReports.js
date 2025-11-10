import { useState, useEffect, useCallback } from 'react';
import { showErrorAlert } from '@/services/alert';

const findBarangayInFilename = (fileName, barangays) => {
  if (!barangays.length) return null;

  for (const b of barangays) {
    const n = b.name.replace(/ /g, "_");
    if (fileName.includes(n)) return b.name;
  }
  return null;
};

const useReports = (userRole, userBarangay, page, activeTab, barangays = []) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const statusMap = { 0: "P", 1: "A", 2: "D" };

  const fetchReports = useCallback(
    async () => {
      if (!userRole) return;

      console.log(`📌 Filter: ${userBarangay} | Tab: ${activeTab}`);

      setLoading(true);
      setError(null);

      try {
        const token =
          JSON.parse(sessionStorage.getItem("session"))?.access_token ?? "";

        // ✅ Fetch ALL reports (not paginated)
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reports?limit=9999`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || "Failed to load reports");
        }

        const json = await res.json();
        const raw = json.data || [];

        const enriched = raw.map((r) => ({
          ...r,
          barangay_name: findBarangayInFilename(r.report_name, barangays),
        }));

        let filtered = enriched;

        // ✅ Barangay filtering
        if (userRole === "S" || userRole === "D") {
          if (userBarangay !== "All") {
            filtered = filtered.filter((r) => r.barangay_name === userBarangay);
          }
        } else {
          filtered = filtered.filter((r) => r.barangay_name === userBarangay);
        }

        // ✅ Status filtering
        const statusCode = statusMap[activeTab];
        filtered = filtered.filter((r) => r.report_status === statusCode);

        // ✅ Client-side pagination
        const start = (page - 1) * 10;
        const end = start + 10;

        setReports(filtered.slice(start, end));
        setTotalPages(Math.ceil(filtered.length / 10));

      } catch (err) {
        console.error("❌ ERROR:", err.message);
        setError(err.message);
        await showErrorAlert(err.message);
      } finally {
        setLoading(false);
      }
    },

    [userRole, userBarangay, activeTab, page, barangays]
  );

  useEffect(() => {
    if (!userRole) return;
    if (!barangays.length) return;

    fetchReports();
  }, [fetchReports, barangays]);

  return { reports, loading, error, totalPages, fetchReports };
};

export default useReports;
