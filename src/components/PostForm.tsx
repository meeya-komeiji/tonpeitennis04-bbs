'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import RichTextEditor, {
  type RichTextEditorHandle,
} from '@/components/RichTextEditor';
import { createPost } from '@/lib/db';
import { isHtmlEmpty } from '@/lib/sanitize';

/** 親（ThreadView 等）から命令的に操作するためのハンドル */
export type PostFormHandle = {
  /** コメント欄の先頭に `>>no` のアンカーを挿入し、フォーカスする */
  insertAnchor: (no: number) => void;
};

type PostFormProps = {
  threadId: string;
  onPosted: () => void;
};

/** スレッドへの返信投稿フォーム */
const PostForm = forwardRef<PostFormHandle, PostFormProps>(function PostForm(
  { threadId, onPosted },
  ref
) {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  // 投稿成功後にエディタDOMをクリアするための再マウント用キー
  const [editorKey, setEditorKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const editorRef = useRef<RichTextEditorHandle>(null);

  useImperativeHandle(ref, () => ({
    insertAnchor: (no: number) => {
      editorRef.current?.insertTextAtStart(`>>${no} `);
    },
  }));

  const handleSubmit = async () => {
    if (isHtmlEmpty(body)) {
      setError('コメントを入力してください');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createPost(threadId, { name, body });
      setBody('');
      setEditorKey((k) => k + 1);
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
      <RichTextEditor
        ref={editorRef}
        key={editorKey}
        value={body}
        onChange={setBody}
        placeholder="コメント"
        minHeight={100}
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
});

export default PostForm;
