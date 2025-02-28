interface Document {
  pageContent: string;
  metadata: Record<string, unknown>;
}

export function combineDocuments(docs: Document[]): string {
  return docs.map((doc) => doc.pageContent).join("\n\n");
}
