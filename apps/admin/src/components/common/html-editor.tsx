'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Editor as ToastEditorComponent } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

const ToastEditor = dynamic(
  () => import('@toast-ui/react-editor').then((module) => module.Editor),
  { ssr: false },
);

type HtmlEditorProps = {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  height?: string;
};

export function HtmlEditor({
  value,
  onChange,
  placeholder = 'HTML 내용을 입력하세요.',
  height = '320px',
}: HtmlEditorProps) {
  const editorRef = useRef<ToastEditorComponent>(null);

  useEffect(() => {
    const instance = editorRef.current?.getInstance();
    if (!instance) {
      return;
    }

    const current = instance.getHTML();
    if (current !== value) {
      instance.setHTML(value || '');
    }
  }, [value]);

  return (
    <div className="rounded-md border border-slate-300">
      <ToastEditor
        ref={editorRef}
        initialValue={value}
        previewStyle="vertical"
        initialEditType="wysiwyg"
        hideModeSwitch
        useCommandShortcut
        height={height}
        placeholder={placeholder}
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
