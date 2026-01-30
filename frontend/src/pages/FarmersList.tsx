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
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const regions = useMemo(() => {
    const list = new Set<string>();
    data?.farmers?.forEach((f) => list.add(f.region));
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

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField size="small" placeholder="Search by name or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="region-label">Region</InputLabel>
              <Select labelId="region-label" value={region} label="Region" onChange={(e) => setRegion(e.target.value)}>
                <MenuItem value="all">All regions</MenuItem>
                {regions.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={() => setCreateOpen(true)}>Add Farmer</Button>
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

      <TableContainer component={Paper} sx={{ p: 0, borderRadius: 2, border: "1px solid #eadfce" }}>
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

