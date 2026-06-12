'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import { TEXT_COLORS } from '@/lib/sanitize';

/** 親（PostForm 等）から命令的に操作するためのハンドル */
export type RichTextEditorHandle = {
  /** コメント欄の先頭にテキストを挿入し、フォーカスを当てる（アンカー挿入用） */
  insertTextAtStart: (text: string) => void;
  focus: () => void;
};

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

/**
 * 投稿フォーム用の軽量リッチテキストエディタ。
 * contentEditable + execCommand で選択テキストに装飾を適用する。
 * 出力HTMLは保存時・描画時にサニタイズされる前提（@/lib/sanitize）。
 */
const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor({ value, onChange, placeholder, minHeight = 120 }, ref) {
    const editorRef = useRef<HTMLDivElement>(null);

    // 親が value を空に戻したとき（投稿後のクリア等）だけ DOM を同期する。
    // 入力のたびに innerHTML を書き換えるとキャレット位置が飛ぶため、
    // 通常の入力中は DOM を直接ソースとして扱い同期しない。
    useEffect(() => {
      const el = editorRef.current;
      if (el && value === '' && el.innerHTML !== '') {
        el.innerHTML = '';
      }
    }, [value]);

    const emit = () => {
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      insertTextAtStart: (text: string) => {
        const el = editorRef.current;
        if (!el) return;
        el.focus();
        const textNode = document.createTextNode(text);
        el.insertBefore(textNode, el.firstChild);
        // 挿入テキストの直後にキャレットを移動する
        const range = document.createRange();
        range.setStartAfter(textNode);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        emit();
      },
    }));

    const exec = (command: string, arg?: string) => {
      editorRef.current?.focus();
      // 装飾を <font> ではなく CSS（span style）で出力させる
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand(command, false, arg);
      emit();
    };

    return (
      <Box sx={{ mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.5,
            border: '1px solid #ccc',
            borderBottom: 'none',
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            bgcolor: '#f5f5f5',
            px: 0.5,
            py: 0.25,
          }}
          // ツールバー操作で選択範囲（フォーカス）が外れないようにする
          onMouseDown={(e) => e.preventDefault()}
        >
          <Tooltip title="太字">
            <IconButton size="small" onClick={() => exec('bold')} aria-label="太字">
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="斜体">
            <IconButton size="small" onClick={() => exec('italic')} aria-label="斜体">
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="下線">
            <IconButton
              size="small"
              onClick={() => exec('underline')}
              aria-label="下線"
            >
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: 1, height: 20, bgcolor: '#ccc', mx: 0.5 }} />

          {TEXT_COLORS.map((c) => (
            <Tooltip key={c.value} title={`文字色: ${c.label}`}>
              <IconButton
                size="small"
                onClick={() => exec('foreColor', c.value)}
                aria-label={`文字色: ${c.label}`}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: c.value,
                    border: '1px solid #999',
                  }}
                />
              </IconButton>
            </Tooltip>
          ))}
        </Box>

        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          data-placeholder={placeholder}
          sx={{
            minHeight,
            border: '1px solid #ccc',
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            bgcolor: '#fff',
            p: 1,
            fontSize: 14,
            lineHeight: 1.7,
            outline: 'none',
            overflowWrap: 'anywhere',
            '&:empty:before': {
              content: 'attr(data-placeholder)',
              color: '#999',
            },
          }}
        />
      </Box>
    );
  }
);

export default RichTextEditor;
