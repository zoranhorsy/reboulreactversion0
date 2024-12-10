import React from 'react';

type FAQItem = {
    question: string;
    answer: string;
};

type ProductFAQProps = {
    faqs?: FAQItem[]
}

export function ProductFAQ({ faqs = [] }: ProductFAQProps) {
    return (
        <div>
            {faqs && faqs.length > 0 ? (
                faqs.map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4">
                        <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                        <p className="text-gray-700">{faq.answer}</p>
                    </div>
                ))
            ) : (
                <p>Aucune question fréquente disponible pour le moment.</p>
            )}
        </div>
    );
}

