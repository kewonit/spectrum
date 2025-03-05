import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItemType[];
  className?: string;
}

export function Breadcrumbs({
  items,
  className,
}: BreadcrumbsProps) {
  // Updated to match the site theme with a more subtle appearance
  // Changed bg-white/80 to bg-white/60 for better theme integration
  // Added border-gray-200/50 for a subtle border that matches theme
  const containerClass = `flex items-center text-sm text-gray-600 px-4 py-3 
    bg-white/60 backdrop-blur-sm border border-gray-200/50
    rounded-lg mb-6 shadow-sm ${className || ''}`;

  return (
    <nav className={containerClass}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            )}
            
            {item.href ? (
              <Link 
                href={item.href} 
                // Updated link style to match theme - using blue-600 for better contrast
                className="hover:text-blue-600 hover:underline transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              // Made active item more pronounced with slightly darker color
              <span className="font-medium text-gray-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
