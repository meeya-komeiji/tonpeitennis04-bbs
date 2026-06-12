'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
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
    const { ui } = useTheme();

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
            gap: 0.75,
            border: `1px solid ${ui.editorBorder}`,
            borderBottom: 'none',
            borderTopLeftRadius: ui.editorRadius,
            borderTopRightRadius: ui.editorRadius,
            bgcolor: ui.editorToolbarBg,
            px: 1,
            py: 0.5,
          }}
          // ツールバー操作で選択範囲（フォーカス）が外れないようにする
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* 装飾ボタン（太字・斜体・下線） */}
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            {[
              { label: '太字', command: 'bold', Icon: FormatBoldIcon },
              { label: '斜体', command: 'italic', Icon: FormatItalicIcon },
              { label: '下線', command: 'underline', Icon: FormatUnderlinedIcon },
            ].map(({ label, command, Icon }) => (
              <Tooltip key={command} title={label}>
                <IconButton
                  size="small"
                  onClick={() => exec(command)}
                  aria-label={label}
                  sx={{
                    borderRadius: 1.5,
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      color: 'text.primary',
                    },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              </Tooltip>
            ))}
          </Box>

          <Box
            sx={{ alignSelf: 'stretch', width: '1px', my: 0.25, bgcolor: ui.editorBorder }}
          />

          {/* 文字色スウォッチ */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {TEXT_COLORS.map((c) => (
              <Tooltip key={c.value} title={`文字色: ${c.label}`}>
                <ButtonBase
                  onClick={() => exec('foreColor', c.value)}
                  aria-label={`文字色: ${c.label}`}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: c.value,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.18)',
                    transition: 'transform .12s ease, box-shadow .12s ease',
                    '&:hover': {
                      transform: 'scale(1.15)',
                      boxShadow:
                        'inset 0 0 0 1px rgba(0,0,0,0.28), 0 0 0 3px rgba(0,0,0,0.06)',
                    },
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>

        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          data-placeholder={placeholder}
          sx={{
            minHeight,
            border: `1px solid ${ui.editorBorder}`,
            borderBottomLeftRadius: ui.editorRadius,
            borderBottomRightRadius: ui.editorRadius,
            bgcolor: ui.fieldBg,
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
