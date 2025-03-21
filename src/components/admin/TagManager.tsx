import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TagManagerProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

export function TagManager({ tags, onChange }: TagManagerProps) {
    const [newTag, setNewTag] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const addTag = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent form submission
        e.preventDefault();
        
        if (!newTag.trim()) {
            setError("Le tag est requis");
            return;
        }
        
        // Vérifier si le tag existe déjà
        if (tags.includes(newTag.trim())) {
            setError("Ce tag existe déjà");
            return;
        }
        
        onChange([...tags, newTag.trim()]);
        setNewTag('');
        setError(null);
    };

    const removeTag = (index: number) => {
        const updatedTags = tags.filter((_, i) => i !== index);
        onChange(updatedTags);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addTag(e);
        }
    };

    return (
        <div className="space-y-4">
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1 bg-white/60 text-xs flex items-center gap-1">
                            {tag}
                            <button
                                onClick={() => removeTag(index)}
                                className="ml-1 rounded-full hover:bg-white/40 h-4 w-4 inline-flex items-center justify-center"
                                type="button"
                            >
                                <X className="h-2.5 w-2.5" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            
            <div className="bg-white/40 rounded-lg border border-border/40 p-2 sm:p-3 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ajouter un tag"
                            className="border-input/40 h-8 sm:h-9 text-sm bg-white/50"
                        />
                        {error && (
                            <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                                <AlertCircle className="h-3 w-3" /> {error}
                            </span>
                        )}
                    </div>
                    <Button 
                        onClick={addTag}
                        type="button"
                        className="h-8 sm:h-9 rounded-full bg-primary/90 hover:bg-primary"
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Ajouter
                    </Button>
                </div>
            </div>
            
            {tags.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-1">
                    Aucun tag ajouté
                </div>
            )}
        </div>
    );
} 