import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Question {
    id: number;
    question: string;
    answer?: string;
}

interface ProductQuestionsProps {
    questions: Question[];
}

export function ProductQuestions({ questions }: ProductQuestionsProps) {
    const latestQuestion = questions.length > 0 ? questions[0] : null;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Questions fréquentes</CardTitle>
            </CardHeader>
            <CardContent>
                {latestQuestion ? (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">{latestQuestion.question}</p>
                        {latestQuestion.answer ? (
                            <p className="text-sm text-gray-600">{latestQuestion.answer.slice(0, 100)}...</p>
                        ) : (
                            <p className="text-sm text-gray-600">Pas encore de réponse.</p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-600">Aucune question pour le moment.</p>
                )}
            </CardContent>
        </Card>
    );
}

