'use client';

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import LinkIcon from '@mui/icons-material/Link';
import { classifyUrl, displayHost } from '@/lib/linkify';

// X(Twitter) の widgets.js をページで一度だけ読み込むためのローダ。
type TwttrWidgets = { widgets: { load: (el?: HTMLElement) => void } };
declare global {
  interface Window {
    twttr?: TwttrWidgets;
  }
}

let widgetsPromise: Promise<void> | null = null;
function loadTwitterWidgets(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.twttr?.widgets) return Promise.resolve();
  if (widgetsPromise) return widgetsPromise;
  widgetsPromise = new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
  return widgetsPromise;
}

/** 16:9 の iframe 埋め込み（YouTube / Google Maps 共通） */
function EmbedFrame({ src, title }: { src: string; title: string }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 480,
        aspectRatio: '16 / 9',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Box
        component="iframe"
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
      />
    </Box>
  );
}

/** X(Twitter) のツイート埋め込み。widgets.js で blockquote を描画する */
function TweetEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLQuoteElement>(null);
  useEffect(() => {
    let cancelled = false;
    loadTwitterWidgets().then(() => {
      if (!cancelled && ref.current) {
        window.twttr?.widgets.load(ref.current.parentElement ?? undefined);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [url]);
  return (
    <Box sx={{ maxWidth: 480, '& .twitter-tweet': { margin: '0 !important' } }}>
      <blockquote ref={ref} className="twitter-tweet" data-dnt="true">
        <a href={url}>{url}</a>
      </blockquote>
    </Box>
  );
}

/** 汎用URL用のドメイン名付き軽量カード */
function GenericCard({ url }: { url: string }) {
  const { ui, panel } = useTheme();
  return (
    <Card
      variant="outlined"
      sx={{ maxWidth: 480, borderColor: panel.border, bgcolor: ui.fieldBg }}
    >
      <CardActionArea
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5 }}
      >
        <LinkIcon sx={{ color: ui.muted, fontSize: 20, flexShrink: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{ color: ui.heading, fontSize: 13, fontWeight: 'bold', lineHeight: 1.3 }}
          >
            {displayHost(url)}
          </Typography>
          <Typography
            noWrap
            sx={{ color: ui.muted, fontSize: 12, lineHeight: 1.3 }}
            title={url}
          >
            {url}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}

/** 本文中の1つのURLに対するプレビュー（種類で出し分け） */
export default function LinkPreview({ url }: { url: string }) {
  const link = classifyUrl(url);
  let content;
  if (link.kind === 'youtube' && link.embedUrl) {
    content = <EmbedFrame src={link.embedUrl} title="YouTube" />;
  } else if (link.kind === 'gmaps' && link.embedUrl) {
    content = <EmbedFrame src={link.embedUrl} title="Google Maps" />;
  } else if (link.kind === 'twitter') {
    content = <TweetEmbed url={url} />;
  } else {
    content = <GenericCard url={url} />;
  }
  return <Box sx={{ mt: 0.75 }}>{content}</Box>;
}
