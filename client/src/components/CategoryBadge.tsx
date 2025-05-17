import { getCategoryColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export default function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colorClass = getCategoryColor(category);
  
  return (
    <span className={cn("text-xs font-medium px-2.5 py-1 rounded", colorClass, className)}>
      {category.toUpperCase()}
    </span>
  );
}
