import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";

/* =========================
   TYPES
========================= */

type FormatGroup = "big" | "7";

interface FormatStat {
  format_group: FormatGroup;
  total: number;
}

interface TopItem {
  name: string;
  total: number;
}

interface Stats {
  releases: number;
  artists: number;
  labels: number;
  formats: FormatStat[];
  topGenres: TopItem[];
  topLabels: TopItem[];
  topArtists: TopItem[];
}

/* =========================
   COMPONENTS
========================= */

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card sx={{ borderRadius: 3, p: 2, flex: "1 1 200px", minWidth: 150 }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
}

function TopList({ title, items }: { title: string; items: TopItem[] }) {
  return (
    <Card sx={{ borderRadius: 3, p: 2, flex: "1 1 250px", minWidth: 200 }}>
      <CardContent>
        <Typography variant="h6" mb={1}>
          {title}
        </Typography>
        {items.map((item, index) => (
          <Typography key={index}>
            {index + 1}. {item.name} ({item.total})
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
}

/* =========================
   PAGE
========================= */

export default function StatsPage() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  console.info('stats', stats)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/stats`);
        if (!response.ok) throw new Error("Erreur API");

        const data: Stats = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Typography textAlign="center" mt={5}>
        Impossible de charger les stats
      </Typography>
    );
  }

  // Mapping formats
  const formatMap: Record<FormatGroup, number> = {
    big: 0,
    "7": 0,
  };
  stats.formats.forEach((f) => {
    formatMap[f.format_group] = f.total;
  });

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        📊 Dashboard
      </Typography>

      {/* GLOBAL STATS */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <StatCard title="Releases ALL" value={stats.releases} />
        <StatCard title="Releases 33T" value={formatMap.big} />
        <StatCard title="Releases 45T" value={formatMap["7"]} />
        <StatCard title="Artists" value={stats.artists} />
        <StatCard title="Labels" value={stats.labels} />
        
      </Box>

      {/* TOP LISTS */}
      <Box display="flex" flexWrap="wrap" gap={2}>
        <TopList title="Top Genres" items={stats.topGenres} />
        <TopList title="Top Labels" items={stats.topLabels} />
        <TopList title="Top Artists" items={stats.topArtists} />
      </Box>
    </Box>
  );
}