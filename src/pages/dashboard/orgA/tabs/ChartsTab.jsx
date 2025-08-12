import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const getBarColor = (status) => {
  if (status === 'P') return '#fbc02d'; // yellow
  if (status === 'A') return '#66bb6a'; // green
  if (status === 'D') return '#ef5350'; // red
  return '#42a5f5'; // default blue
};

// Helper to prettify report types
const prettifyReportType = (str) => {
  if (!str) return 'Unknown';
  return str
    .replace(/[_\-]/g, ' ')         
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
};

const ChartsTab = () => {
  const [chartData, setChartData] = useState([]);
  const [reportTypeMap, setReportTypeMap] = useState({}); // NEW: key -> clean report type
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);

const sanitizeReportName = (reportName, barangayNames) => {
  let sanitized = reportName.toLowerCase();
  let firstIndex = -1;

  barangayNames.forEach((brgyName) => {
    // Split barangay name into words, get first word only
    const firstWord = brgyName.toLowerCase().split(' ')[0];
    const idx = sanitized.indexOf(firstWord);

    if (idx !== -1) {
      if (firstIndex === -1 || idx < firstIndex) {
        firstIndex = idx;
      }
    }
  });

  if (firstIndex !== -1) {
    sanitized = sanitized.substring(0, firstIndex);
  }

  // Remove extension like .pdf
  sanitized = sanitized.replace(/\.[^.]+$/, '');

  // Clean up underscores, dashes, parens, and multiple spaces
  sanitized = sanitized.replace(/[\(\)_\-]/g, ' ');
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Capitalize nicely
  sanitized = sanitized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return sanitized || 'Unknown Report Type';
};


  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barangays`);
        if (!res.ok) throw new Error('Failed to fetch barangays');
        const data = await res.json();
        setBarangays(data);
        return data;
      } catch (err) {
        console.error('❌ Failed to load barangays:', err);
        setBarangays([]);
        return [];
      }
    };

    const fetchAllReports = async (barangaysData) => {
      try {
        const token = JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reports?page=1&limit=9999`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || 'Failed to load reports');
        }
        const json = await res.json();
        //console.log('📦 All reports fetched:', json.data);

        const barangayNames = barangaysData.map(b => b.name);

        const counts = {};
        const typeMap = {}; // key -> cleaned report type

    json.data.forEach((report) => {
  const brgyId = report.barangay || 'Unknown';
  const brgyName = barangaysData.find(b => b.id === brgyId)?.name || brgyId;
  const sanitizedType = sanitizeReportName(report.report_name || '', barangayNames);
  const status = report.report_status || 'P';

  // LOG IT BABE 👀
  //console.log('🔥 Report Name:', report.report_name, '| Sanitized Report Type:', sanitizedType);

  if (!counts[brgyName]) counts[brgyName] = {};
  const key = `${sanitizedType}_${status}`;
  if (!counts[brgyName][key]) counts[brgyName][key] = 0;
  counts[brgyName][key] += 1;

  // Save prettified report type for tooltip
  typeMap[key] = prettifyReportType(sanitizedType);
});

        const formattedData = Object.entries(counts).map(([barangayName, reports]) => ({
          barangay: barangayName,
          ...reports,
        }));

        setChartData(formattedData);
        setReportTypeMap(typeMap); // Set the map here for tooltip use
      } catch (err) {
        console.error('❌ Error fetching all reports:', err);
      } finally {
        setLoading(false);
      }
    };

    (async () => {
      const barangaysData = await fetchBarangays();
      await fetchAllReports(barangaysData);
    })();
  }, []);

  const allKeys = [...new Set(chartData.flatMap(d => Object.keys(d).filter(k => k !== 'barangay')))];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const statusMap = {
      P: 'Pending',
      A: 'Approved',
      D: 'Denied / Rejected',
    };

    return (
      <Paper sx={{ p: 1 }}>
        <Typography sx={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}>
          {label}
        </Typography>
        {payload.map((p, idx) => {
          const [rawReportType, status] = p.name.split('_');
          // Use our cleaned reportType from the map here:
          const reportType = reportTypeMap[p.name] || 'Unknown';
          const statusText = statusMap[status] || status;

          return (
            <Typography
              key={idx}
              sx={{ fontFamily: 'Roboto, sans-serif', fontSize: 13 }}
            >
              {reportType} ({statusText}): {p.value}
            </Typography>
          );
        })}
      </Paper>
    );
  };

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, p: 3, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <BarChartIcon fontSize="medium" />
          <Typography variant="h5" fontWeight="bold">
            Reports per Barangay (by Status & Report Type)
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading chart...
          </Typography>
        ) : (
          <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="barangay"
                  style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                {allKeys.map((key) => {
                  const status = key.split('_').pop();
                  return (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId={key.split('_')[0]}
                      fill={getBarColor(status)}
                      name={key}
                    />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ChartsTab;
