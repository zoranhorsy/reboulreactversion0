import React from 'react';
import styled from 'styled-components';

interface ProductTagsProps {
    tags: string[];
}

const StyledWrapper = styled.div`
    .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .tag {
        background-color: var(--primary-color, #7257fa);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
    }
`;

export function ProductTags({ tags }: ProductTagsProps) {
    return (
        <StyledWrapper>
            <div className="tags-container">
                {tags.map((tag) => (
                    <div key={tag} className="tag">
                        {tag}
                    </div>
                ))}
            </div>
        </StyledWrapper>
    );
}

