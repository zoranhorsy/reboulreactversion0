import React from 'react';
import { cn } from '@/lib/utils';

interface ProductTagsProps {
    tags: string[];
    className?: string;
}

export function ProductTags({ tags, className }: ProductTagsProps) {
    return (
        <div className={cn(className)}>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <div 
                        key={tag} 
                        className="bg-[#7257fa] text-white px-2 py-1 rounded-full text-xs font-semibold"
                    >
                        {tag}
                    </div>
                ))}
            </div>
        </div>
    );
}

