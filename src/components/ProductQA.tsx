import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Question = {
  id: number;
  question: string;
  answer?: string;
};

type ProductQAProps = {
  questions?: Question[];
};

export function ProductQA({ questions = [] }: ProductQAProps) {
  const [newQuestion, setNewQuestion] = useState("");

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim()) {
      // Here you would typically send the new question to your backend
      console.log("New question submitted:", newQuestion);
      setNewQuestion("");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Questions et réponses</h2>
      {questions.length > 0 ? (
        <div className="space-y-4 mb-6">
          {questions.map((q) => (
            <div key={q.id} className="border-b pb-4">
              <p className="font-semibold">Q: {q.question}</p>
              {q.answer && <p className="mt-2">R: {q.answer}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-6">Aucune question pour le moment.</p>
      )}
      <form onSubmit={handleSubmitQuestion} className="space-y-2">
        <Textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Posez une question sur ce produit"
          rows={3}
        />
        <Button type="submit">Envoyer la question</Button>
      </form>
    </div>
  );
}
