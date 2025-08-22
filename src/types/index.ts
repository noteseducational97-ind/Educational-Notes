
export type Resource = {
  id: string; // The unique document ID from Firestore (slug)
  title: string;
  description: string;
  content: string;
  category: string[]; // Changed to array
  subject: string[]; // Changed to array
  class?: string; // Optional since it may not be present for all streams
  stream: string;
  imageUrl: string;
  pdfUrl: string; // No longer optional
  createdAt: string; // Should be an ISO string
};
