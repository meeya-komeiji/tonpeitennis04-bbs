'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createThread } from '@/lib/db';

/** 新規スレッド作成フォーム */
export default function NewThreadForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    if (!body.trim()) {
      setError('本文を入力してください');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const id = await createThread({ title, name, body });
      router.push(`/thread?id=${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'スレッド作成に失敗しました');
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 760 }}>
      <Typography
        sx={{ color: '#008000', fontWeight: 'bold', fontSize: 15, mb: 1.5 }}
      >
        - 新規スレッド作成 -
      </Typography>
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
        size="small"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ bgcolor: '#fff', mb: 1 }}
      />
      <TextField
        fullWidth
        multiline
        minRows={6}
        placeholder="本文"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        sx={{ bgcolor: '#fff', mb: 1 }}
      />
      {error && (
        <Box sx={{ color: '#cc0000', fontSize: 13, mb: 1 }}>{error}</Box>
      )}
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={submitting}
        sx={{ bgcolor: '#666', color: '#fff', '&:hover': { bgcolor: '#555' } }}
      >
        {submitting ? '作成中...' : '投稿する'}
      </Button>
    </Box>
  );
}
