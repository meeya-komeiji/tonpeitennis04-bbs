'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Header from '@/components/Header';
import Panel from '@/components/Panel';
import PostList from '@/components/PostList';
import PostForm, { type PostFormHandle } from '@/components/PostForm';
import { fetchThread, fetchPosts, type Thread, type Post } from '@/lib/db';

export default function ThreadView() {
  const searchParams = useSearchParams();
  const threadId = searchParams.get('id');

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const postFormRef = useRef<PostFormHandle>(null);

  const load = useCallback(async () => {
    if (!threadId) {
      setError('スレッドが指定されていません');
      setLoading(false);
      return;
    }
    try {
      const [t, p] = await Promise.all([
        fetchThread(threadId),
        fetchPosts(threadId),
      ]);
      if (!t) {
        setError('スレッドが見つかりません');
      } else {
        setThread(t);
        setPosts(p);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'スレッドの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Header />
      <Panel>
        {loading ? (
          <Box sx={{ fontSize: 14, color: '#333' }}>読み込み中...</Box>
        ) : error ? (
          <Box sx={{ color: '#cc0000', fontSize: 14 }}>{error}</Box>
        ) : (
          thread && (
            <>
              <Typography
                sx={{
                  color: '#cc0000',
                  fontWeight: 'bold',
                  fontSize: 17,
                  mb: 2,
                }}
              >
                {thread.title}
              </Typography>
              <PostList
                posts={posts}
                onReply={(no) => postFormRef.current?.insertAnchor(no)}
              />
              {threadId && (
                <PostForm
                  ref={postFormRef}
                  threadId={threadId}
                  onPosted={load}
                />
              )}
            </>
          )
        )}
      </Panel>
    </Container>
  );
}
