import { useState } from "react";
import { Box, Typography, Chip, IconButton, Stack } from "@mui/material";
import { FiCopy, FiShare2 } from "react-icons/fi";
import { motion } from "framer-motion";
import type { Recommendation } from "../types";
import { useNotify } from "../contexts/NotificationProvider";

export default function RecommendationCard({ recommendation, collapsedLines = 3 }: { recommendation: Recommendation; collapsedLines?: number; }) {
  const [expanded, setExpanded] = useState(false);
  const notify = useNotify();

  const copy = async () => {
    await navigator.clipboard?.writeText(recommendation.content || "");
    notify({ message: "Recommendation copied", severity: "success" });
  };

  const share = () => {
    // placeholder share behavior
    notify({ message: "Share action (placeholder)", severity: "info" });
  };

  return (
    <motion.div whileHover={{ translateY: -4 }} style={{ display: "block" }}>
      <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Chip label={recommendation.recommendation_type ?? "recommendation"} size="small" color="primary" />
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={copy} aria-label="copy rec"><FiCopy /></IconButton>
            <IconButton size="small" onClick={share} aria-label="share rec"><FiShare2 /></IconButton>
          </Stack>
        </Stack>

        <Box mt={1}>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", overflow: "hidden", display: expanded ? "block" : "-webkit-box", WebkitLineClamp: expanded ? "none" : collapsedLines, WebkitBoxOrient: "vertical" }}>
            {recommendation.content ?? "No recommendation available."}
          </Typography>
          {recommendation.content && recommendation.content.length > 240 && (
            <Typography variant="caption" color="primary" sx={{ cursor: "pointer", mt: 1 }} onClick={() => setExpanded((s) => !s)}>
              {expanded ? "Show less" : "Read more"}
            </Typography>
          )}
        </Box>
      </Box>
    </motion.div>
  );
}


