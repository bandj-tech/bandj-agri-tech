import { useState } from "react";
import { Box, Typography, Paper, Button, Stack, IconButton, Chip } from "@mui/material";
import { FiCopy } from "react-icons/fi";
import type { SMSLog } from "../types";
import { useNotify } from "../contexts/NotificationProvider";

export default function SMSLogs({ logs }: { logs: SMSLog[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const notify = useNotify();

  const visible = logs.slice(0, page * pageSize);

  const copy = async (text: string) => {
    await navigator.clipboard?.writeText(text);
    notify({ message: "Message copied", severity: "success" });
  };

  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="h6">SMS Logs</Typography>
      <Box mt={1}>
        <Stack spacing={1}>
          {visible.map((l) => (
            <Box key={l.id} mb={0}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack>
                  <Typography variant="body2" color="text.secondary">{l.direction.toUpperCase()} • {new Date(l.created_at ?? "").toLocaleString()}</Typography>
                  <Typography>{l.message}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip label={l.direction} size="small" color={l.direction === "inbound" ? "secondary" : "default"} />
                  <IconButton size="small" onClick={() => copy(l.message)}><FiCopy /></IconButton>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>

        {visible.length < logs.length && (
          <Box mt={2} textAlign="center">
            <Button variant="outlined" onClick={() => setPage((p) => p + 1)}>Load more</Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
}