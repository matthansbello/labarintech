import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { uploadImage } from './firebase';

// Custom extension for auto-saving
const AutoSave = Extension.create({
  name: 'autosave',
  addOptions() {
    return {
      saveDelay: 2000,
      onUpdate: () => {},
    };
  },
  
  addStorage() {
    return {
      timeout: undefined,
    };
  },
  
  onCreate() {
    this.storage.timeout = undefined;
  },
  
  onUpdate() {
    const { saveDelay, onUpdate } = this.options;
    
    clearTimeout(this.storage.timeout);
    
    this.storage.timeout = setTimeout(() => {
      onUpdate(this.editor.getHTML());
    }, saveDelay);
  },
  
  onDestroy() {
    clearTimeout(this.storage.timeout);
  },
});

// Custom extension for markdown shortcuts
const MarkdownShortcuts = Extension.create({
  name: 'markdownShortcuts',
  addInputRules() {
    return [
      // Add custom markdown input rules here if needed
    ];
  },
});

// Default extensions for the editor
export const defaultExtensions = [
  StarterKit,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-primary underline',
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class: 'rounded-md max-w-full mx-auto my-4',
    },
  }),
  CodeBlock.configure({
    HTMLAttributes: {
      class: 'bg-muted p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto',
    },
  }),
  Placeholder.configure({
    placeholder: 'Start writing your article...',
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  AutoSave,
  MarkdownShortcuts,
];

// Helper function to handle image upload
export async function handleImageUpload(file: File) {
  try {
    const path = `images/${Date.now()}_${file.name}`;
    const url = await uploadImage(file, path);
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Export editor utility functions
export const editorUtils = {
  // Function to extract a plain text excerpt from editor content
  getPlainText(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  },
  
  // Function to count words in editor content
  countWords(html: string) {
    const plainText = this.getPlainText(html);
    return plainText.split(/\s+/).filter(Boolean).length;
  },
  
  // Function to calculate reading time
  calculateReadingTime(html: string) {
    const words = this.countWords(html);
    const wordsPerMinute = 200;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  },
};
