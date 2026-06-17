'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '@/shared/lib/cn';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

function BoldIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <path d='M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z' />
      <path d='M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z' />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <line x1='19' y1='4' x2='10' y2='4' />
      <line x1='14' y1='20' x2='5' y2='20' />
      <line x1='15' y1='4' x2='9' y2='20' />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <line x1='8' y1='6' x2='21' y2='6' />
      <line x1='8' y1='12' x2='21' y2='12' />
      <line x1='8' y1='18' x2='21' y2='18' />
      <line x1='3' y1='6' x2='3.01' y2='6' />
      <line x1='3' y1='12' x2='3.01' y2='12' />
      <line x1='3' y1='18' x2='3.01' y2='18' />
    </svg>
  );
}

export function RichTextEditor({ value, onChange, placeholder, label, error, disabled }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[110px] max-w-none px-3.5 py-2.5 text-sm text-[#1e2364] outline-none',
          'prose prose-sm prose-p:my-1 prose-ul:my-1',
          disabled && 'opacity-50 cursor-not-allowed'
        ),
      },
    },
  });

  const toolbarBtn = (active: boolean) =>
    cn(
      'flex size-7 items-center justify-center rounded-md transition-colors',
      active
        ? 'bg-[#00a8f1] text-white'
        : 'text-[#6b7196] hover:bg-[#f0f2fa] hover:text-[#1e2364]'
    );

  return (
    <div className='flex flex-col gap-1.5'>
      {label ? (
        <label className='px-1 text-[13px] font-bold tracking-[-0.01em] text-[#1e2364]'>
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          'overflow-hidden rounded-[14px] border border-[#d9ddea] bg-white transition-[border-color,box-shadow]',
          'focus-within:border-[#00a8f1] focus-within:ring-[3px] focus-within:ring-[rgba(0,168,241,0.20)]',
          error && 'border-red-400 focus-within:border-red-400 focus-within:ring-red-200/50'
        )}
      >
        <div className='flex items-center gap-0.5 border-b border-[#d9ddea] bg-[#f8f9fc] px-2 py-1.5'>
          <button
            type='button'
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={toolbarBtn(editor?.isActive('bold') ?? false)}
            aria-label='Bold'
            disabled={disabled}
          >
            <BoldIcon />
          </button>
          <button
            type='button'
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={toolbarBtn(editor?.isActive('italic') ?? false)}
            aria-label='Italic'
            disabled={disabled}
          >
            <ItalicIcon />
          </button>
          <button
            type='button'
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={toolbarBtn(editor?.isActive('bulletList') ?? false)}
            aria-label='Bullet list'
            disabled={disabled}
          >
            <ListIcon />
          </button>
        </div>

        <div onClick={() => editor?.commands.focus()}>
          {!value && !editor?.isFocused && placeholder ? (
            <p className='pointer-events-none absolute px-3.5 py-2.5 text-sm text-[rgba(30,35,100,0.4)]'>
              {placeholder}
            </p>
          ) : null}
          <EditorContent editor={editor} />
        </div>
      </div>

      {error ? <p className='px-1 text-xs text-red-500'>{error}</p> : null}
    </div>
  );
}
