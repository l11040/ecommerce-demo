'use client';

import { useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Editor as ToastEditorComponent } from '@toast-ui/react-editor';
import { toast } from 'sonner';
import '@toast-ui/editor/dist/toastui-editor.css';

const ToastEditor = dynamic(
  () => import('@toast-ui/react-editor').then((module) => module.Editor),
  { ssr: false },
);

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:40003').replace(/\/$/, '');

type AlignDirection = 'left' | 'center' | 'right';
type ToastEditorNode = {
  isBlock: boolean;
  type: { name: string };
  attrs: Record<string, unknown>;
  marks: unknown[];
};

type ToastEditorState = {
  selection: {
    empty: boolean;
    from: number;
    to: number;
    $from: {
      depth: number;
      node: (depth: number) => ToastEditorNode;
      before: (depth: number) => number;
    };
  };
  doc: {
    nodesBetween: (
      from: number,
      to: number,
      callback: (node: ToastEditorNode, pos: number) => void,
    ) => void;
  };
  tr: {
    doc: {
      nodeAt: (pos: number) => ToastEditorNode | null;
    };
    setNodeMarkup: (
      pos: number,
      type: ToastEditorNode['type'],
      attrs: Record<string, unknown>,
      marks: unknown[],
    ) => void;
    scrollIntoView: () => unknown;
  };
};

type ToastEditorDispatch = (transaction: unknown) => void;

const ALIGN_COMMANDS: Record<AlignDirection, string> = {
  left: 'alignLeft',
  center: 'alignCenter',
  right: 'alignRight',
};

const ALIGNABLE_NODE_TYPES = new Set(['paragraph', 'heading', 'blockQuote', 'listItem']);

function normalizeUploadSrcToAbsolute(html: string): string {
  if (!html) return html;

  return html.replace(
    /(<img[^>]*\ssrc=['"])(\/uploads\/[^'"]+)(['"][^>]*>)/gi,
    (_, prefix: string, srcPath: string, suffix: string) =>
      `${prefix}${API_BASE_URL}${srcPath}${suffix}`,
  );
}

type HtmlEditorProps = {
  value: string;
  onChange: (nextValue: string) => void;
  onUploadImage?: (
    file: File,
  ) => Promise<{
    path?: string;
    url?: string;
  }>;
  placeholder?: string;
  height?: string;
};

function pickHtmlAttrs(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const attrs: Record<string, string> = {};
  const raw = value as Record<string, unknown>;
  Object.entries(raw).forEach(([key, attrValue]) => {
    if (typeof attrValue === 'string') {
      attrs[key] = attrValue;
    }
  });

  return attrs;
}

function collectAlignTargetPositions(state: ToastEditorState): number[] {
  const positions = new Set<number>();
  const { selection } = state;

  if (selection.empty) {
    for (let depth = selection.$from.depth; depth > 0; depth -= 1) {
      const node = selection.$from.node(depth);
      if (node.isBlock) {
        positions.add(selection.$from.before(depth));
        break;
      }
    }

    return Array.from(positions);
  }

  state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (node.isBlock && node.type.name !== 'doc') {
      positions.add(pos);
    }
  });

  return Array.from(positions);
}

function applyWysiwygBlockAlignment(
  state: ToastEditorState,
  dispatch: ToastEditorDispatch,
  align: AlignDirection,
): boolean {
  if (!dispatch) {
    return false;
  }

  const tr = state.tr;
  let changed = false;
  const positions = collectAlignTargetPositions(state);

  positions.forEach((pos) => {
    const node = tr.doc.nodeAt(pos);
    if (!node || !ALIGNABLE_NODE_TYPES.has(node.type.name)) {
      return;
    }

    const currentAttrs = node.attrs as Record<string, unknown>;
    const currentHtmlAttrs = pickHtmlAttrs(currentAttrs.htmlAttrs);
    if (currentHtmlAttrs.align === align) {
      return;
    }

    const nextAttrs = {
      ...currentAttrs,
      htmlAttrs: {
        ...currentHtmlAttrs,
        align,
      },
    };

    tr.setNodeMarkup(pos, node.type, nextAttrs, node.marks);
    changed = true;
  });

  if (!changed) {
    return false;
  }

  dispatch(tr.scrollIntoView());
  return true;
}

const ALIGN_EDITOR_PLUGIN = () => ({
  wysiwygCommands: {
    [ALIGN_COMMANDS.left]: (
      _payload: unknown,
      state: ToastEditorState,
      dispatch: ToastEditorDispatch,
      view: { focus: () => void },
    ) => {
      view.focus();
      return applyWysiwygBlockAlignment(state, dispatch, 'left');
    },
    [ALIGN_COMMANDS.center]: (
      _payload: unknown,
      state: ToastEditorState,
      dispatch: ToastEditorDispatch,
      view: { focus: () => void },
    ) => {
      view.focus();
      return applyWysiwygBlockAlignment(state, dispatch, 'center');
    },
    [ALIGN_COMMANDS.right]: (
      _payload: unknown,
      state: ToastEditorState,
      dispatch: ToastEditorDispatch,
      view: { focus: () => void },
    ) => {
      view.focus();
      return applyWysiwygBlockAlignment(state, dispatch, 'right');
    },
  },
});

const EDITOR_PLUGINS = [ALIGN_EDITOR_PLUGIN];

export function HtmlEditor({
  value,
  onChange,
  onUploadImage,
  placeholder = 'HTML 내용을 입력하세요.',
  height = '320px',
}: HtmlEditorProps) {
  const editorRef = useRef<ToastEditorComponent>(null);
  const normalizedValue = normalizeUploadSrcToAbsolute(value);

  const toolbarItems = useMemo(
    () => [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task', 'indent', 'outdent'],
      ['table', 'image', 'link'],
      ['code', 'codeblock'],
      [
        {
          name: ALIGN_COMMANDS.left,
          command: ALIGN_COMMANDS.left,
          tooltip: '왼쪽 정렬',
          className: 'toastui-editor-toolbar-icons align-left',
        },
        {
          name: ALIGN_COMMANDS.center,
          command: ALIGN_COMMANDS.center,
          tooltip: '가운데 정렬',
          className: 'toastui-editor-toolbar-icons align-center',
        },
        {
          name: ALIGN_COMMANDS.right,
          command: ALIGN_COMMANDS.right,
          tooltip: '오른쪽 정렬',
          className: 'toastui-editor-toolbar-icons align-right',
        },
      ],
    ],
    [],
  );

  useEffect(() => {
    const instance = editorRef.current?.getInstance();
    if (!instance) {
      return;
    }

    const current = instance.getHTML();
    if (current !== normalizedValue) {
      instance.setHTML(normalizedValue || '');
    }
  }, [normalizedValue]);

  async function handleAddImageBlob(
    blob: Blob | File,
    callback: (url: string, altText?: string) => void,
  ) {
    if (!onUploadImage) {
      return false;
    }

    try {
      const uploadFile =
        blob instanceof File
          ? blob
          : new File([blob], `editor-image-${Date.now()}.png`, {
              type: blob.type || 'image/png',
            });

      const uploaded = await onUploadImage(uploadFile);
      const url = uploaded.url ?? uploaded.path;

      if (!url) {
        throw new Error('업로드된 이미지 URL이 없습니다.');
      }

      callback(url, uploadFile.name);
      return false;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '에디터 이미지 업로드에 실패했습니다.';
      toast.error('에디터 이미지 업로드 실패', { description: message });
      return false;
    }
  }

  return (
    <div className="rounded-md border border-slate-300">
      <ToastEditor
        ref={editorRef}
        initialValue={normalizedValue}
        previewStyle="vertical"
        initialEditType="wysiwyg"
        toolbarItems={toolbarItems}
        plugins={EDITOR_PLUGINS}
        hideModeSwitch
        useCommandShortcut
        height={height}
        placeholder={placeholder}
        hooks={
          onUploadImage
            ? {
                addImageBlobHook: handleAddImageBlob,
              }
            : undefined
        }
        onChange={() => {
          const instance = editorRef.current?.getInstance();
          if (!instance) {
            return;
          }
          onChange(instance.getHTML());
        }}
      />
    </div>
  );
}
