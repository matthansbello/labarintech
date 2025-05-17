import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date | number) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function calculateReadingTime(content: string) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  return readingTime === 0 ? 1 : readingTime;
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function getArticleExcerpt(content: string, maxLength = 150) {
  // Remove HTML tags if present
  const plainText = content.replace(/<[^>]+>/g, '');
  return truncateText(plainText, maxLength);
}

export function getCategoryColor(category: string) {
  const categoryColors = {
    'Programming': 'bg-blue-100 text-blue-800',
    'AI': 'bg-indigo-100 text-indigo-800',
    'Mobile': 'bg-purple-100 text-purple-800',
    'Hardware': 'bg-gray-100 text-gray-800',
    'Startups': 'bg-green-100 text-green-800',
    'Education': 'bg-yellow-100 text-yellow-800',
    'FEATURE': 'bg-primary text-white'
  };
  
  return categoryColors[category] || 'bg-gray-100 text-gray-800';
}

export function getStatusColor(status: string) {
  const statusColors = {
    'draft': 'bg-yellow-100 text-yellow-800',
    'pending_review': 'bg-orange-100 text-orange-800',
    'approved': 'bg-blue-100 text-blue-800',
    'published': 'bg-green-100 text-green-800',
    'scheduled': 'bg-purple-100 text-purple-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}
