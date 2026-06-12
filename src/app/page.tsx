'use client';

import { useCallback, useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Header from '@/components/Header';
import Panel from '@/components/Panel';
import ThreadList from '@/components/ThreadList';
import ThreadPreview from '@/components/ThreadPreview';
import { fetchThreadPreviews, type ThreadPreview as ThreadPreviewData } from '@/lib/db';

export default function HomePage() {
  const [previews, setPreviews] = useState<ThreadPreviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setPreviews(await fetchThreadPreviews());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'スレッドの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Header />
      {loading ? (
        <Panel>
          <Box sx={{ fontSize: 14, color: '#333' }}>読み込み中...</Box>
        </Panel>
      ) : error ? (
        <Panel>
          <Box sx={{ color: '#cc0000', fontSize: 14 }}>{error}</Box>
        </Panel>
      ) : (
        <>
          <Panel>
            <ThreadList threads={previews.map((p) => p.thread)} />
          </Panel>
          {previews.map((preview) => (
            <Panel key={preview.thread.id}>
              <ThreadPreview preview={preview} onPosted={load} />
            </Panel>
          ))}
        </>
      )}
    </Container>
  );
}
