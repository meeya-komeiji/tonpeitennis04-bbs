"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Panel from "./Panel";
import { recordVisit, type VisitStats } from "@/lib/db";

/** ラベル付きの数値表示。読み込み中は「…」を表示する */
function CounterItem({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  return (
    <Stack alignItems="center" spacing={0.25}>
      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "monospace",
          fontSize: 20,
          fontWeight: "bold",
          color: "text.primary",
          lineHeight: 1,
        }}
      >
        {value === undefined ? "…" : value.toLocaleString("ja-JP")}
      </Typography>
    </Stack>
  );
}

/** 掲示板タイトルの上に置く来訪者カウンター（累計・本日） */
export default function VisitCounter() {
  const [stats, setStats] = useState<VisitStats | null>(null);

  useEffect(() => {
    let active = true;
    recordVisit()
      .then((s) => {
        if (active) setStats(s);
      })
      .catch(() => {
        // カウンターの失敗はページ表示に影響させない
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Panel sx={{ p: 1.5 }}>
      <Stack
        direction="row"
        spacing={3}
        justifyContent="center"
        alignItems="center"
      >
        <CounterItem label="累計来訪者数" value={stats?.total} />
        <Box sx={{ width: "1px", alignSelf: "stretch", bgcolor: "divider" }} />
        <CounterItem label="今日の来訪者数" value={stats?.today} />
      </Stack>
    </Panel>
  );
}
