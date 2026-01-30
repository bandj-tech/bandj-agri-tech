import { Paper, Typography, Box, Stack, Avatar, Divider, Chip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useQuery } from "@tanstack/react-query";
import { getFarmers } from "../api/mockApi";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";

export default function Dashboard() {
  const { data: farmersData } = useQuery({ queryKey: ["farmers"], queryFn: getFarmers });

  const farmers = farmersData?.farmers ?? [];
  const totalFarmers = farmers.length;

  const newestFarmer = (() => {
    if (!farmers.length) return null;
    const valid = farmers.filter((f) => f.created_at);
    if (!valid.length) return null;
    return valid.reduce((latest, cur) => {
      const latestDate = new Date(latest.created_at ?? 0).getTime();
      const curDate = new Date(cur.created_at ?? 0).getTime();
      return curDate > latestDate ? cur : latest;
    });
  })();

  const farmersByRegion = (() => {
    const map = new Map<string, number>();
    farmers.forEach((f) => {
      const key = f.region?.trim() || "Unknown";
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count || a.region.localeCompare(b.region));
  })();

  const newestDate = newestFarmer?.created_at
    ? new Date(newestFarmer.created_at).toLocaleString()
    : "-";

  return (
    <PageShell
      header={(
        <Box mb={2}>
          <Chip label="Overview" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700 }} />
          <Typography
            variant="h4"
            sx={{
              mt: 1,
              fontFamily: '"Playfair Display", "Times New Roman", serif',
              letterSpacing: 0.3,
            }}
          >
            Farm Network Snapshot
          </Typography>
          <Typography color="text.secondary">
            High-level insight from the available Data.
          </Typography>
        </Box>
      )}
    >
      <Stack spacing={2}>

        <Box sx={{ display: "grid", gap: 16, gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" } }}>
          <motion.div whileHover={{ y: -4 }}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: "1px solid #eadfce" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "#0f766e" }}><PeopleIcon /></Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total Farmers</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{totalFarmers}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">All registered farmers</Typography>
            </Paper>
          </motion.div>

          <motion.div whileHover={{ y: -4 }}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: "1px solid #d9e9ff" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "#1d4ed8" }}><AccessTimeIcon /></Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Newest Farmer</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {newestFarmer?.name ?? "-"}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">{newestDate}</Typography>
            </Paper>
          </motion.div>

          <motion.div whileHover={{ y: -4 }}>
            <Paper sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e7f3ea" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "#16a34a" }}><PlaceIcon /></Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Regions Active</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{farmersByRegion.length}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">Unique regions in roster</Typography>
            </Paper>
          </motion.div>
        </Box>

        <Paper sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e6e1d6" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="flex-start">
            <Box sx={{ minWidth: { md: 220 } }}>
              <Typography
                variant="h6"
                sx={{ fontFamily: '"Playfair Display", "Times New Roman", serif', mb: 0.5 }}
              >
                Farmers by Region
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Simple distribution from the farmer registry.
              </Typography>
            </Box>
            <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />
            <Divider sx={{ display: { xs: "block", md: "none" } }} />
            <Box sx={{ width: "100%" }}>
              <Stack spacing={1}>
                {farmersByRegion.map((row) => (
                  <Box
                    key={row.region}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      alignItems: "center",
                      gap: 8,
                      p: 1,
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.6)",
                      border: "1px solid #f1ece1",
                    }}
                  >
                    <Typography>{row.region}</Typography>
                    <Chip label={row.count} sx={{ bgcolor: "#e2f5e9", color: "#166534", fontWeight: 700 }} />
                  </Box>
                ))}
                {!farmersByRegion.length && (
                  <Typography color="text.secondary">No farmers found.</Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </PageShell>
  );
}
