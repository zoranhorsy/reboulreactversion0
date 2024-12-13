import { useEffect, useRef } from 'react';
import anime from 'animejs';

interface ProductReview {
    rating: number;
    comment: string;
}

interface ProductReviewsProps {
    productId: number;
    initialReviews: ProductReview[];
    onAddReview: (review: ProductReview) => void;
}

const animateStars = (container: HTMLElement) => {
    anime({
        targets: container.querySelectorAll('.star'),
        opacity: [0, 1],
        scale: [0.5, 1],
        delay: anime.stagger(100),
        duration: 500,
        easing: 'easeOutElastic(1, .8)'
    });
};

export function ProductReviews({ productId, initialReviews, onAddReview }: ProductReviewsProps) {
    const starsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (starsContainerRef.current) {
            animateStars(starsContainerRef.current);
        }
    }, []);

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
                    ★
                </span>
            );
        }
        return stars;
    };


    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Avis clients</h2>
            <div ref={starsContainerRef} className="flex">
                {initialReviews.map((review, index) => (
                    <div key={index} className="flex items-center mr-4">
                        {renderStars(review.rating)}
                        <p className="ml-2">{review.comment}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={(e) => {
                e.preventDefault();
                const rating = parseInt((document.getElementById('rating') as HTMLInputElement).value, 10);
                const comment = (document.getElementById('comment') as HTMLInputElement).value;
                onAddReview({ rating, comment });
            }}>
                <label htmlFor="rating">Note:</label>
                <select id="rating">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
                <br/>
                <label htmlFor="comment">Commentaire:</label>
                <textarea id="comment"></textarea>
                <br/>
                <button type="submit">Ajouter un avis</button>
            </form>
        </div>
    );
}

