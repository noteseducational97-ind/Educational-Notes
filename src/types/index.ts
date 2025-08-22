
export type Resource = {
  id: string; // The unique document ID from Firestore (slug)
  title: string;
  description: string;
  content: string;
  category: string[];
  subject: string[];
  class?: string; // Optional since it may not be present for all streams
  stream: string[]; // Changed to array to support multiple streams
  imageUrl: string;
  pdfUrl: string;
  createdAt: string; // Should be an ISO string
};
