import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BlockIcon from '@mui/icons-material/Block';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const getBarColor = (status) => {
  if (status === 'P') return '#fbc02d'; // yellow
  if (status === 'A') return '#66bb6a'; // green
  if (status === 'D') return '#ef5350'; // red
  return '#42a5f5'; // default blue
};

const prettifyReportType = (str) => {
  if (!str) return 'Unknown';
  return str
    .replace(/[_\-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
};

// 🔢 Animated counter component
const AnimatedCounter = ({ target, color }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 500;
    const step = Math.ceil(target / 20);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, duration / 20);
    return () => clearInterval(timer);
  }, [target]);
  return (
    <Typography
      variant="h4"
      fontWeight="bold"
      color={color}
      sx={{ fontSize: '2rem', transition: '0.3s ease' }}
    >
      {count}
    </Typography>
  );
};

const ChartsTab = () => {
  const [chartData, setChartData] = useState([]);
  const [filteredChartData, setFilteredChartData] = useState([]);
  const [reportTypeMap, setReportTypeMap] = useState({});
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [selectedBarangay, setSelectedBarangay] = useState('All');
  const [rawReports, setRawReports] = useState([]); // store raw fetched data

  const sanitizeReportName = (reportName, barangayNames) => {
    let sanitized = reportName.toLowerCase();
    let firstIndex = -1;

    barangayNames.forEach((brgyName) => {
      const firstWord = brgyName.toLowerCase().split(' ')[0];
      const idx = sanitized.indexOf(firstWord);
      if (idx !== -1) {
        if (firstIndex === -1 || idx < firstIndex) firstIndex = idx;
      }
    });

    if (firstIndex !== -1) sanitized = sanitized.substring(0, firstIndex);
    sanitized = sanitized.replace(/\.[^.]+$/, '');
    sanitized = sanitized.replace(/[\(\)_\-]/g, ' ');
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    sanitized = sanitized
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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
        setRawReports(json.data || []); // keep original dataset
        const barangayNames = barangaysData.map((b) => b.name);

        const counts = {};
        const typeMap = {};
        let approvedTotal = 0;
        let pendingTotal = 0;
        let rejectedTotal = 0;

        json.data.forEach((report) => {
          const brgyId = report.barangay || 'Unknown';
          const brgyName = barangaysData.find((b) => b.id === brgyId)?.name || brgyId;
          const sanitizedType = sanitizeReportName(report.report_name || '', barangayNames);
          const status = report.report_status || 'P';

          if (!counts[brgyName]) counts[brgyName] = {};
          const key = `${sanitizedType}_${status}`;
          if (!counts[brgyName][key]) counts[brgyName][key] = 0;
          counts[brgyName][key] += 1;
          typeMap[key] = prettifyReportType(sanitizedType);

          if (status === 'A') approvedTotal++;
          else if (status === 'P') pendingTotal++;
          else if (status === 'D') rejectedTotal++;
        });

        setGlobalStats({
          approved: approvedTotal,
          pending: pendingTotal,
          rejected: rejectedTotal,
        });

        const formattedData = Object.entries(counts).map(([barangayName, reports]) => ({
          barangay: barangayName,
          ...reports,
        }));

        setChartData(formattedData);
        setReportTypeMap(typeMap);
        setFilteredChartData(formattedData); // initial view = all
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

  // ✅ Update chart + counters dynamically when filtering
  useEffect(() => {
    if (!rawReports.length) return;

    if (selectedBarangay === 'All') {
      // Count across all barangays
      const approved = rawReports.filter((r) => r.report_status === 'A').length;
      const pending = rawReports.filter((r) => r.report_status === 'P').length;
      const rejected = rawReports.filter((r) => r.report_status === 'D').length;
      setGlobalStats({ approved, pending, rejected });
      setFilteredChartData(chartData);
    } else {
      // Filter reports for specific barangay
      const filtered = rawReports.filter(
        (r) =>
          (r.barangay_name || r.barangay) === selectedBarangay ||
          barangays.find((b) => b.name === selectedBarangay)?.id === r.barangay
      );
      const approved = filtered.filter((r) => r.report_status === 'A').length;
      const pending = filtered.filter((r) => r.report_status === 'P').length;
      const rejected = filtered.filter((r) => r.report_status === 'D').length;

      setGlobalStats({ approved, pending, rejected });
      setFilteredChartData(chartData.filter((d) => d.barangay === selectedBarangay));
    }
  }, [selectedBarangay, rawReports, chartData, barangays]);

  const allKeys = [
    ...new Set(chartData.flatMap((d) => Object.keys(d).filter((k) => k !== 'barangay'))),
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const statusMap = { P: 'Pending', A: 'Approved', D: 'Denied / Rejected' };

    return (
      <Paper sx={{ p: 1 }}>
        <Typography sx={{ fontWeight: 500 }}>{label}</Typography>
        {payload.map((p, idx) => {
          const [rawReportType, status] = p.name.split('_');
          const reportType = reportTypeMap[p.name] || 'Unknown';
          const statusText = statusMap[status] || status;
          return (
            <Typography key={idx} sx={{ fontSize: 13 }}>
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
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <BarChartIcon fontSize="medium" />
          <Typography variant="h5" fontWeight="bold">
            Reports Overview ({selectedBarangay === 'All' ? 'All Barangays' : selectedBarangay})
          </Typography>
        </Stack>

        {/* 💫 Dynamic Counters Section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <DoneAllIcon sx={{ fontSize: 40, mb: 1 }} />
              <AnimatedCounter target={globalStats.approved} color="white" />
              <Typography>Approved Reports</Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #facc15, #eab308)',
              color: 'black',
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <HourglassEmptyIcon sx={{ fontSize: 40, mb: 1 }} />
              <AnimatedCounter target={globalStats.pending} color="black" />
              <Typography>Pending Reports</Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <BlockIcon sx={{ fontSize: 40, mb: 1 }} />
              <AnimatedCounter target={globalStats.rejected} color="white" />
              <Typography>Rejected Reports</Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* 🧭 Filter Dropdown */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Filter by Barangay</InputLabel>
          <Select
            value={selectedBarangay}
            label="Filter by Barangay"
            onChange={(e) => setSelectedBarangay(e.target.value)}
          >
            <MenuItem value="All">All Barangays</MenuItem>
            {barangays.map((b) => (
              <MenuItem key={b.id} value={b.name}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading chart...
          </Typography>
        ) : (
          <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="barangay" />
                <YAxis allowDecimals={false} />
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
