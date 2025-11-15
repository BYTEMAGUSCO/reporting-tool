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
  const [allFiltered, setAllFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const statusMap = { 0: "P", 1: "A", 2: "D" };

  const fetchReports = useCallback(async () => {
    if (!userRole) return;
    if (!barangays.length) return;

    setLoading(true);
    setError(null);

    try {
      const session = JSON.parse(sessionStorage.getItem("session"));
      const token = session?.access_token ?? "";
      const userId = session?.user?.id ?? "";

      // 1️⃣ FETCH ALL FORMS
      const formsRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-forms?limit=9999`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formsJson = await formsRes.json();
      const allForms = formsJson.data || [];

      const formOwnerMap = {};
      allForms.forEach(f => {
        formOwnerMap[f.form_id] = f.added_by;
      });

      // 2️⃣ FETCH ALL REPORTS
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reports?limit=9999`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const json = await res.json();
      const rawReports = json.data || [];

      console.log("📥 RAW REPORTS →", rawReports);

      // DEBUG: Confirm if backend actually sends this field
      if (rawReports.length > 0) {
        console.log("🔍 forward_to_superadmin from backend:", rawReports[0].forward_to_superadmin);
      }

      // 3️⃣ FILTER BY FORM OWNER
      const ownerReports = rawReports.filter(r => formOwnerMap[r.form_id] === userId);

      // 4️⃣ Add barangay name
      const enriched = ownerReports.map((r) => ({
        ...r,
        barangay_name: findBarangayInFilename(r.report_name, barangays),
      }));

      let filtered = enriched;

      // ⭐ SUPERADMIN → ONLY SHOW FORWARDED REPORTS
      if (userRole === "S") {
        filtered = filtered.filter((r) => {
          // handle undefined/null
          return r.forward_to_superadmin === true;
        });
      }

      // ⭐ DILG filter by dropdown
      else if (userRole === "D") {
        if (userBarangay !== "All") {
          filtered = filtered.filter((r) => r.barangay_name === userBarangay);
        }
      }

      // ⭐ Barangay user sees only their barangay
      else {
        filtered = filtered.filter((r) => r.barangay_name === userBarangay);
      }

      // 7️⃣ STATUS FILTER
      const statusCode = statusMap[activeTab];
      filtered = filtered.filter((r) => r.report_status === statusCode);

      console.log("🎯 FINAL FILTERED:", filtered);

      // 🔟 PAGINATION
      setAllFiltered(filtered);
      const start = (page - 1) * 10;
      setReports(filtered.slice(start, start + 10));
      setTotalPages(Math.ceil(filtered.length / 10));

    } catch (err) {
      console.error("❌ ERROR in useReports:", err);
      setError(err.message);
      await showErrorAlert(err.message);
    } finally {
      setLoading(false);
    }
  }, [userRole, userBarangay, activeTab, page, barangays]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, allFiltered, loading, error, totalPages, fetchReports };
};

export default useReports;
