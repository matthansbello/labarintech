import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRef } from 'react';

interface ToolbarProps {
  editor: Editor;
  onImageSelection: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Toolbar({ editor, onImageSelection }: ToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  if (!editor) {
    return null;
  }
  
  const ToolbarButton = ({ 
    icon, 
    title, 
    action, 
    isActive 
  }: { 
    icon: string, 
    title: string, 
    action: () => void, 
    isActive?: boolean 
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            className={`p-2 ${isActive ? 'bg-muted' : ''}`}
            onClick={action}
          >
            <i className={icon}></i>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  
  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-300 p-2 bg-gray-50 dark:bg-gray-800">
      <ToolbarButton 
        icon="ri-bold" 
        title="Bold (Ctrl+B)" 
        action={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      />
      <ToolbarButton 
        icon="ri-italic" 
        title="Italic (Ctrl+I)" 
        action={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      />
      <ToolbarButton 
        icon="ri-underline" 
        title="Underline (Ctrl+U)" 
        action={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
      />
      
      <div className="h-6 border-r border-gray-300 mx-1"></div>
      
      <ToolbarButton 
        icon="ri-h-1" 
        title="Heading 1" 
        action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
      />
      <ToolbarButton 
        icon="ri-h-2" 
        title="Heading 2" 
        action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
      />
      <ToolbarButton 
        icon="ri-h-3" 
        title="Heading 3" 
        action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
      />
      
      <div className="h-6 border-r border-gray-300 mx-1"></div>
      
      <ToolbarButton 
        icon="ri-list-unordered" 
        title="Bullet List" 
        action={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      />
      <ToolbarButton 
        icon="ri-list-ordered" 
        title="Numbered List" 
        action={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      />
      
      <div className="h-6 border-r border-gray-300 mx-1"></div>
      
      <ToolbarButton 
        icon="ri-double-quotes-l" 
        title="Block Quote" 
        action={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
      />
      <ToolbarButton 
        icon="ri-code-box-line" 
        title="Code Block" 
        action={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
      />
      
      <div className="h-6 border-r border-gray-300 mx-1"></div>
      
      <ToolbarButton 
        icon="ri-image-line" 
        title="Insert Image" 
        action={() => {
          if (imageInputRef.current) {
            imageInputRef.current.click();
          }
        }}
      />
      <ToolbarButton 
        icon="ri-link" 
        title="Insert Link" 
        action={() => {
          const url = window.prompt('Enter URL');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        isActive={editor.isActive('link')}
      />
      
      <div className="h-6 border-r border-gray-300 mx-1"></div>
      
      <ToolbarButton 
        icon="ri-format-clear" 
        title="Clear Formatting" 
        action={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      />
      
      <input
        type="file"
        ref={imageInputRef}
        onChange={onImageSelection}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
}
