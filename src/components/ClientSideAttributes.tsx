"use client";

import { useEffect } from "react";

export function ClientSideAttributes() {
  useEffect(() => {
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    document.body.setAttribute("data-demoway-document-id", documentId);
    document.body.style.cssText = "";

    return () => {
      document.body.removeAttribute("data-demoway-document-id");
      document.body.style.cssText = "";
    };
  }, []);

  return null;
}
