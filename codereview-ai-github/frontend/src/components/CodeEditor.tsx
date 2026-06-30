import Editor, { type OnMount } from '@monaco-editor/react';
import { useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Spinner } from '@/components/ui/Spinner';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  height?: string | number;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  language,
  onChange,
  onSubmit,
  height = '100%',
  readOnly = false,
}: CodeEditorProps) {
  const { theme } = useTheme();
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;

  const handleMount: OnMount = (editor, monaco) => {
    // Keyboard shortcut: Ctrl/Cmd + Enter triggers a review.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      submitRef.current?.();
    });
  };

  return (
    <Editor
      height={height}
      language={language}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      onMount={handleMount}
      loading={<Spinner className="h-7 w-7" />}
      options={{
        readOnly,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, monospace',
        lineNumbers: 'on',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        automaticLayout: true,
        tabSize: 2,
        padding: { top: 14, bottom: 14 },
        roundedSelection: true,
        cursorBlinking: 'smooth',
        renderLineHighlight: 'all',
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      }}
    />
  );
}
