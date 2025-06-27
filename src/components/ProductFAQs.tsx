import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

interface ProductFAQsProps {
  faqs: FAQ[];
}

export function ProductFAQs({ faqs }: ProductFAQsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">FAQ</CardTitle>
      </CardHeader>
      <CardContent>
        {faqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {faqs.slice(0, 3).map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-sm text-gray-600">Aucune FAQ disponible.</p>
        )}
      </CardContent>
    </Card>
  );
}
