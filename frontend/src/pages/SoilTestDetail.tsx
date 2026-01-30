import 'leaflet/dist/leaflet.css';
import { Paper, Typography, Box, Grid, Divider, IconButton, Tooltip, Stack, Chip } from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ScienceIcon from "@mui/icons-material/Science";
import type { SoilTest } from "../types";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid, LabelList } from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FiCopy } from "react-icons/fi";
import RecommendationCard from "../components/RecommendationCard";

export default function SoilTestDetail({ test }: { test: SoilTest }) {
  const hasNumber = (v: unknown): v is number => typeof v === "number" && !Number.isNaN(v);

  const phInsight = (() => {
    if (!hasNumber(test.ph)) return { label: "pH not recorded", detail: "No pH value was provided." };
    if (test.ph < 5.5) return { label: "Strongly acidic", detail: "Most crops may struggle without liming." };
    if (test.ph < 6.0) return { label: "Acidic", detail: "Slightly acidic; many crops still perform well." };
    if (test.ph <= 7.5) return { label: "Optimal", detail: "Ideal range for most crops (6.0–7.5)." };
    if (test.ph <= 8.5) return { label: "Alkaline", detail: "Some nutrients become less available." };
    return { label: "Strongly alkaline", detail: "High pH can block nutrient uptake." };
  })();

  const moistureInsight = (() => {
    if (!hasNumber(test.moisture)) return { label: "Moisture not recorded", detail: "No moisture value was provided." };
    if (test.moisture < 20) return { label: "Very dry", detail: "Irrigation likely needed." };
    if (test.moisture < 40) return { label: "Dry", detail: "Below optimal moisture for most crops." };
    if (test.moisture <= 70) return { label: "Optimal", detail: "Good moisture range for growth." };
    if (test.moisture <= 80) return { label: "Wet", detail: "May reduce root oxygen." };
    return { label: "Very wet", detail: "Risk of waterlogging." };
  })();

  const tempInsight = (() => {
    if (!hasNumber(test.temperature)) return { label: "Temperature not recorded", detail: "No temperature value was provided." };
    if (test.temperature < 10) return { label: "Very cool", detail: "May slow germination and growth." };
    if (test.temperature < 18) return { label: "Cool", detail: "Growth could be slower for warm-season crops." };
    if (test.temperature <= 30) return { label: "Optimal", detail: "Good temperature range for most crops." };
    if (test.temperature <= 35) return { label: "Warm", detail: "Monitor moisture to avoid stress." };
    return { label: "Hot", detail: "Heat stress risk; keep soil moisture stable." };
  })();

  const overallStatus = (() => {
    const ph = test.ph;
    const moisture = test.moisture;
    if (!hasNumber(ph) && !hasNumber(moisture)) return { label: "Insufficient data", tone: "default" as const };
    const phGood = hasNumber(ph) && ph >= 6.0 && ph <= 7.5;
    const phExtreme = hasNumber(ph) && (ph < 5.5 || ph > 8.5);
    const moistureGood = hasNumber(moisture) && moisture >= 40 && moisture <= 70;
    const moistureExtreme = hasNumber(moisture) && (moisture < 20 || moisture > 80);

    if ((phGood || !hasNumber(ph)) && (moistureGood || !hasNumber(moisture))) {
      return { label: "Good", tone: "success" as const };
    }
    if (phExtreme || moistureExtreme) return { label: "Poor", tone: "error" as const };
    return { label: "Needs attention", tone: "warning" as const };
  })();

  const npk = [
    { key: "nitrogen", name: "Nitrogen (N)", value: test.nitrogen, color: "#f59e0b" },
    { key: "phosphorus", name: "Phosphorus (P)", value: test.phosphorus, color: "#22c55e" },
    { key: "potassium", name: "Potassium (K)", value: test.potassium, color: "#0ea5e9" },
  ];

  const formatValue = (val?: number) => (hasNumber(val) ? val.toFixed(1) : "—");
  const npkChart = npk.map((item) => ({
    name: item.name,
    value: hasNumber(item.value) ? item.value : 0,
    color: item.color,
    missing: !hasNumber(item.value),
  }));

  const copyRecommendation = async () => {
    const text = test.recommendations?.[0]?.content ?? "";
    await navigator.clipboard?.writeText(text);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Soil Test — {new Date(test.timestamp).toLocaleString()}</Typography>
          <Typography color="text.secondary" gutterBottom>{test.location_name || "Location not provided"}</Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid #eadfce",
              bgcolor: "rgba(255,255,255,0.7)",
            }}
          >
            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Overall soil status</Typography>
                <Chip label={overallStatus.label} color={overallStatus.tone} size="small" />
              </Box>
              <Divider />
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ScienceIcon fontSize="small" sx={{ color: "#0f766e" }} />
                  <Typography variant="subtitle2">pH interpretation</Typography>
                </Stack>
                <Typography sx={{ fontWeight: 600 }}>{phInsight.label}{hasNumber(test.ph) ? ` — ${test.ph.toFixed(2)}` : ""}</Typography>
                <Typography color="text.secondary">{phInsight.detail}</Typography>
              </Box>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <WaterDropIcon fontSize="small" sx={{ color: "#0ea5e9" }} />
                  <Typography variant="subtitle2">Moisture status</Typography>
                </Stack>
                <Typography sx={{ fontWeight: 600 }}>{moistureInsight.label}{hasNumber(test.moisture) ? ` — ${test.moisture.toFixed(1)}%` : ""}</Typography>
                <Typography color="text.secondary">{moistureInsight.detail}</Typography>
              </Box>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ThermostatIcon fontSize="small" sx={{ color: "#ef4444" }} />
                  <Typography variant="subtitle2">Temperature insight</Typography>
                </Stack>
                <Typography sx={{ fontWeight: 600 }}>{tempInsight.label}{hasNumber(test.temperature) ? ` — ${test.temperature.toFixed(1)}°C` : ""}</Typography>
                <Typography color="text.secondary">{tempInsight.detail}</Typography>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2">N-P-K</Typography>
          <Stack spacing={1.5} mt={1}>
            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, 1fr)" }} gap={1}>
              {npk.map((item) => (
                <Box key={item.key} sx={{ p: 1.5, borderRadius: 2, border: "1px solid #eadfce", bgcolor: "#fffaf1" }}>
                  <Typography variant="caption" color="text.secondary">{item.name}</Typography>
                  <Typography sx={{ fontWeight: 700, color: item.color }}>{formatValue(item.value)}</Typography>
                  <Typography variant="caption" color="text.secondary">Recorded value</Typography>
                </Box>
              ))}
            </Box>
            <Box height={180}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={npkChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ReTooltip
                    formatter={(value: number, _name, props) => {
                      const payload = props?.payload as { missing?: boolean } | undefined;
                      return payload?.missing ? ["Not recorded", "Value"] : [value, "Value"];
                    }}
                  />
                  <Bar dataKey="value">
                    {npkChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={entry.missing ? 0.25 : 0.9} />
                    ))}
                    <LabelList dataKey="value" position="top" formatter={(val: number) => (val === 0 ? "—" : val.toFixed(1))} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">Location</Typography>
            <Tooltip title="Copy recommendation">
              <IconButton size="small" onClick={copyRecommendation}><FiCopy /></IconButton>
            </Tooltip>
          </Box>

          <Box height={220} mt={1}>
            {typeof test.latitude === "number" && typeof test.longitude === "number" ? (
              <MapContainer center={[test.latitude, test.longitude]} zoom={13} style={{ height: "100%", borderRadius: 8 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[test.latitude, test.longitude]}>
                <Popup>
                    {test.location_name}<br />pH: {test.ph} • Moisture: {test.moisture}%
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <Box height="100%" display="flex" alignItems="center" justifyContent="center" color="text.secondary">No GPS coordinates</Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2">AI Recommendation</Typography>
          <Box mt={1}>
            <RecommendationCard recommendation={test.recommendations?.[0] ?? { id: "n/a", recommendation_type: "none", content: "No recommendation available." }} />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
