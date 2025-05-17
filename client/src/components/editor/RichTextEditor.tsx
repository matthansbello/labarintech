import { useEditor, EditorContent } from '@tiptap/react';
import { defaultExtensions, handleImageUpload } from '@/lib/editor';
import Toolbar from './Toolbar';
import { Skeleton } from '@/components/ui/skeleton';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onUpdate?: (html: string) => void;
  placeholder?: string;
  autofocus?: boolean;
  editable?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  onUpdate,
  placeholder = 'Start writing your article...',
  autofocus = false,
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      ...defaultExtensions
    ],
    content,
    autofocus,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      if (onUpdate) {
        onUpdate(html);
      }
    },
  });
  
  const handleImageSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      const imageUrl = await handleImageUpload(file);
      
      if (imageUrl) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };
  
  if (!editor) {
    return (
      <div className="border rounded-lg">
        <Skeleton className="h-12 rounded-t-lg" />
        <Skeleton className="h-64 rounded-b-lg" />
      </div>
    );
  }
  
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {editable && (
        <Toolbar 
          editor={editor} 
          onImageSelection={handleImageSelection} 
        />
      )}
      <EditorContent 
        editor={editor} 
        className={`prose prose-sm lg:prose-base dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none ${!editable ? 'pointer-events-none' : ''}`} 
      />
    </div>
  );
}
