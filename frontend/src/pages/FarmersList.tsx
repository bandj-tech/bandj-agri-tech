import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  TablePagination,
  Stack,
  InputLabel,
  FormControl,
  Skeleton,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFarmers } from "../hooks/useFarmers";
import CreateFarmerDialog from "../components/CreateFarmerDialog";
import { useQueryClient } from "@tanstack/react-query";
import PageShell from "../components/PageShell";

export default function FarmersList() {
  const nav = useNavigate();
  const { data, isLoading, isError } = useFarmers();
  const qc = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const regions = useMemo(() => {
    const list = new Set<string>();
    data?.farmers?.forEach((f) => {
      if (f.region) list.add(f.region);
    });
    return Array.from(list);
  }, [data]);

  const filtered = useMemo(() => {
    const items = data?.farmers ?? [];
    return items.filter((f) => {
      const matchesSearch =
        search.trim() === "" ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.phone_number.includes(search);
      const matchesRegion = region === "all" || f.region === region;
      return matchesSearch && matchesRegion;
    });
  }, [data, search, region]);

  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <PageShell
      header={(
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} mb={2}>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontFamily: '"Playfair Display", "Times New Roman", serif', letterSpacing: 0.3 }}
            >
              Farmers
            </Typography>
            <Typography color="text.secondary">Manage farmer profiles and locations.</Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <TextField size="small" placeholder="Search by name or phone" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: { sm: 250 } }} />
            <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 160 } }}>
              <InputLabel id="region-label">Region</InputLabel>
              <Select labelId="region-label" value={region} label="Region" onChange={(e) => setRegion(e.target.value)}>
                <MenuItem value="all">All regions</MenuItem>
                {regions.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ width: { xs: "100%", sm: "auto" } }}>Add Farmer</Button>
          </Stack>
        </Stack>
      )}
    >

      <CreateFarmerDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ["farmers"] });
          setCreateOpen(false);
        }}
      />

      {isMobile ? (
        <Stack spacing={1.5}>
          {isLoading && Array.from({ length: rowsPerPage }).map((_, i) => (
            <Card key={i} sx={{ border: "1px solid #eadfce", borderRadius: 2 }}>
              <CardContent>
                <Skeleton width="55%" />
                <Skeleton width="45%" />
                <Skeleton width="35%" />
              </CardContent>
            </Card>
          ))}
          {isError && <Paper sx={{ p: 2 }}>Error loading farmers</Paper>}
          {!isLoading && !isError && paged.map((f) => (
            <Card key={f.id} sx={{ border: "1px solid #eadfce", borderRadius: 2 }}>
              <CardContent sx={{ display: "grid", gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{f.name}</Typography>
                <Typography variant="body2" color="text.secondary">{f.phone_number}</Typography>
                <Typography variant="body2">{f.region} - {f.district}</Typography>
                <Typography variant="caption" color="text.secondary">{f.created_at ? new Date(f.created_at).toLocaleString() : ""}</Typography>
                <Box mt={0.5}>
                  <Button size="small" onClick={() => nav(`/farmers/${f.id}`)}>View details</Button>
                </Box>
              </CardContent>
            </Card>
          ))}
          {!isLoading && !isError && !paged.length && (
            <Paper sx={{ p: 2 }}>
              <Typography color="text.secondary">No farmers found.</Typography>
            </Paper>
          )}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ p: 0, borderRadius: 2, border: "1px solid #eadfce", overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>District</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width="60%" /></TableCell>
                  <TableCell><Skeleton width="50%" /></TableCell>
                  <TableCell><Skeleton width="40%" /></TableCell>
                  <TableCell><Skeleton width="40%" /></TableCell>
                  <TableCell><Skeleton width="30%" /></TableCell>
                </TableRow>
              ))}
              {isError && <TableRow><TableCell colSpan={5}>Error loading farmers</TableCell></TableRow>}
              {paged.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell onClick={() => nav(`/farmers/${f.id}`)} style={{ cursor: "pointer" }}>{f.name}</TableCell>
                  <TableCell onClick={() => nav(`/farmers/${f.id}`)} style={{ cursor: "pointer" }}>{f.phone_number}</TableCell>
                  <TableCell onClick={() => nav(`/farmers/${f.id}`)} style={{ cursor: "pointer" }}>{f.region}</TableCell>
                  <TableCell onClick={() => nav(`/farmers/${f.id}`)} style={{ cursor: "pointer" }}>{f.district}</TableCell>
                  <TableCell onClick={() => nav(`/farmers/${f.id}`)} style={{ cursor: "pointer" }}>{f.created_at ? new Date(f.created_at).toLocaleString() : ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </PageShell>
  );
}

