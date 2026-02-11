import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  Button,
  Avatar,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getSoilTests, getSMSLogs, getFarmers, getFarmerDevices } from "../api/mockApi";
import DeviceRegistration from "./DeviceRegistration";
import SoilTestDetail from "./SoilTestDetail";
import SMSLogs from "./SMSLogs";
import { FiCopy } from "react-icons/fi";
import { motion } from "framer-motion";
import RecommendationCard from "../components/RecommendationCard";
import PageShell from "../components/PageShell";

export default function FarmerDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: testsData, isLoading: testsLoading } = useQuery({
    queryKey: ["soil-tests", id],
    queryFn: () => getSoilTests(id!),
    enabled: !!id,
  });
  const { data: smsData, isLoading: smsLoading } = useQuery({
    queryKey: ["sms-logs", id],
    queryFn: () => getSMSLogs(id!),
    enabled: !!id,
  });
  const { data: devicesData, isLoading: devicesLoading } = useQuery({
    queryKey: ["devices", id],
    queryFn: () => getFarmerDevices(id!),
    enabled: !!id,
  });
  const { data: farmersData } = useQuery({
    queryKey: ["farmers"],
    queryFn: getFarmers,
  });

  const farmer = useMemo(() => farmersData?.farmers?.find((f) => f.id === id) ?? null, [farmersData, id]);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  return (
    <PageShell
      header={(
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={2} spacing={2}>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontFamily: '"Playfair Display", "Times New Roman", serif', letterSpacing: 0.3 }}
            >
              Farmer Detail
            </Typography>
            <Typography color="text.secondary">Profile, soil tests, and SMS activity.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => setRegisterOpen(true)}>Register Device</Button>
          </Stack>
        </Stack>
      )}
    >

      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Box sx={{ width: { xs: "100%", md: 440 } }}>
          <Paper sx={{ p: 2, mb: 2, border: "1px solid #eadfce", borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main" }}>{farmer?.name?.[0] ?? "F"}</Avatar>
              <Box>
                <Typography variant="h6">{farmer?.name ?? "Farmer"}</Typography>
                <Typography color="text.secondary">{farmer?.phone_number ?? "—"}</Typography>
              </Box>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2">Location</Typography>
            <Typography>{farmer ? `${farmer.region} — ${farmer.district}` : "—"}</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2">PIN</Typography>
              <Typography sx={{ fontWeight: 600 }}>{farmer?.pin ?? "—"}</Typography>
              <Tooltip title="Copy PIN">
                <IconButton size="small" onClick={() => navigator.clipboard?.writeText(farmer?.pin ?? "")}>
                  <FiCopy />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, mb: 2, border: "1px solid #eadfce", borderRadius: 2 }}>
            <Typography variant="subtitle2">Devices</Typography>
            <Box mt={1}>
              {devicesLoading ? (
                <Skeleton variant="rectangular" height={120} />
              ) : devicesData?.devices?.length ? (
                <Stack spacing={1}>
                  {devicesData.devices.map((device) => (
                    <Box key={device.id} sx={{ p: 1, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Device ID:</strong> {device.device_id}
                      </Typography>
                      <Typography variant="body2">
                        <strong>SIM Number:</strong> {device.sim_number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Registered: {new Date(device.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">No devices registered</Typography>
              )}
            </Box>
          </Paper>

          <Paper sx={{ p: 2, border: "1px solid #eadfce", borderRadius: 2 }}>
            <Typography variant="subtitle2">SMS Logs</Typography>
            <Box mt={1}>
              {smsLoading ? <Skeleton variant="rectangular" height={120} /> : <SMSLogs logs={smsData?.logs ?? []} />}
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: 1, minWidth: 360 }}>
          <Paper sx={{ p: 2, border: "1px solid #eadfce", borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">Soil Tests</Typography>
              <Typography color="text.secondary">{testsLoading ? "..." : (testsData?.tests?.length ?? 0)} total</Typography>
            </Stack>

            <Box mt={2} display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={2}>
              {testsLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rectangular" height={120} />)}
              {!testsLoading && testsData?.tests?.map((t) => (
                <motion.div whileHover={{ scale: 1.02 }} key={t.id}>
                  <Paper sx={{ p: 2, cursor: "pointer", border: "1px solid #efe6d8" }} onClick={() => setSelectedTest(t.id)}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">{new Date(t.timestamp).toLocaleString()}</Typography>
                      <Typography variant="h6">{t.location_name}</Typography>
                      <Typography color="text.secondary">pH: {t.ph} • Moisture: {t.moisture}%</Typography>
                      <Box mt={1}>
                        <RecommendationCard recommendation={t.recommendations?.[0] ?? { id: "n/a", recommendation_type: "none", content: "No recommendation available." }} collapsedLines={2} />
                      </Box>
                    </Stack>
                  </Paper>
                </motion.div>
              ))}

              {!testsLoading && (!testsData?.tests?.length) && <Typography color="text.secondary">No soil tests yet</Typography>}
            </Box>
          </Paper>
        </Box>
      </Box>

      <DeviceRegistration open={registerOpen} onClose={() => setRegisterOpen(false)} farmerId={id} />

      <Dialog open={!!selectedTest} onClose={() => setSelectedTest(null)} maxWidth="md" fullWidth>
        <DialogTitle>Soil Test Detail</DialogTitle>
        <DialogContent>
          {selectedTest && (
            <SoilTestDetail test={testsData!.tests.find((x) => x.id === selectedTest)!} />
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
