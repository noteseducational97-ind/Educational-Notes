
export type Resource = {
  id: string; // The unique document ID from Firestore (slug)
  title: string;
  content: string; // Detailed description or content of the resource
  category: string[];
  subject: string[];
  class?: string; // Optional since it may not be present for all streams
  stream: string[]; // Changed to array to support multiple streams
  imageUrl: string;
  pdfUrl: string; // For download
  viewPdfUrl: string; // For embedded view
  createdAt: string; // Should be an ISO string
  isComingSoon?: boolean;
  visibility?: 'private' | 'public';
};
