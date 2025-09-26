import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
  disabled = false,
  minHeight = '200px',
  maxHeight = '400px',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isChangingRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || !editorRef.current || quillRef.current) return;

    // Create a container for the editor
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ];

    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: toolbarOptions,
      },
    });

    quillRef.current = quill;

    // Remove any duplicate toolbars
    const toolbars = containerRef.current.querySelectorAll('.ql-toolbar');
    if (toolbars.length > 1) {
      for (let i = 1; i < toolbars.length; i++) {
        toolbars[i].remove();
      }
    }

    // Set initial content
    if (value && value !== '<p><br></p>' && value !== '') {
      quill.root.innerHTML = value;
    }

    // Handle content changes
    quill.on('text-change', () => {
      if (!isChangingRef.current) {
        const html = quill.root.innerHTML;
        onChange(html === '<p><br></p>' ? '' : html);
      }
    });

    // Cleanup
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  // Update content when value changes externally
  useEffect(() => {
    if (!quillRef.current || !value) return;

    const quill = quillRef.current;
    const currentHtml = quill.root.innerHTML;

    if (value !== currentHtml && value !== '<p><br></p>') {
      isChangingRef.current = true;
      quill.root.innerHTML = value;
      isChangingRef.current = false;
    }
  }, [value]);

  // Update disabled state
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!disabled);
    }
  }, [disabled]);

  return (
    <div ref={containerRef} className="rich-text-editor-wrapper">
      <style>
        {`
          .rich-text-editor-wrapper .ql-toolbar.ql-snow {
            border: 1px solid #e5e7eb;
            border-bottom: none;
            border-radius: 0.375rem 0.375rem 0 0;
            background: white;
          }
          
          .rich-text-editor-wrapper .ql-toolbar.ql-snow + .ql-toolbar.ql-snow {
            display: none !important;
          }
          
          .rich-text-editor-wrapper .ql-container.ql-snow {
            border: 1px solid #e5e7eb;
            border-radius: 0 0 0.375rem 0.375rem;
            background: white;
          }
          
          .rich-text-editor-wrapper .ql-editor {
            min-height: ${minHeight};
            max-height: ${maxHeight};
            overflow-y: auto;
            font-family: inherit;
          }
          
          .rich-text-editor-wrapper .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
          }
        `}
      </style>
      <div ref={editorRef} className="bg-white" />
    </div>
  );
};
