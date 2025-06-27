import { useState, useEffect } from "react";

export function useDocumentId() {
  const [documentId, setDocumentId] = useState<string | null>(null);

  useEffect(() => {
    const newDocumentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setDocumentId(newDocumentId);
  }, []);

  return documentId;
}
