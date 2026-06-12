'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { createPost } from '@/lib/db';

/** スレッドへの返信投稿フォーム */
export default function PostForm({
  threadId,
  onPosted,
}: {
  threadId: string;
  onPosted: () => void;
}) {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!body.trim()) {
      setError('コメントを入力してください');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createPost(threadId, { name, body });
      setBody('');
      onPosted();
    } catch (e) {
      setError(e instanceof Error ? e.message : '投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 2, maxWidth: 560 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ bgcolor: '#fff', mb: 1 }}
      />
      <TextField
        fullWidth
        multiline
        minRows={4}
        placeholder="コメント"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        sx={{ bgcolor: '#fff', mb: 1 }}
      />
      {error && (
        <Box sx={{ color: '#cc0000', fontSize: 13, mb: 1 }}>{error}</Box>
      )}
      <Button
        variant="contained"
        color="inherit"
        onClick={handleSubmit}
        disabled={submitting}
        sx={{ bgcolor: '#666', color: '#fff', '&:hover': { bgcolor: '#555' } }}
      >
        {submitting ? '投稿中...' : '投稿する'}
      </Button>
    </Box>
  );
}
