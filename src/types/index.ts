
export type Resource = {
  id: string; // The unique document ID from Firestore (slug)
  title: string;
  category: string[];
  subject: string[];
  class?: string; // Optional since it may not be present for all streams
  stream: string[]; // Changed to array to support multiple streams
  imageUrl: string;
  viewPdfUrl?: string; // Optional URL for viewing the PDF
  pdfUrl: string;
  createdAt: string; // Should be an ISO string
  isComingSoon?: boolean;
  visibility?: 'private' | 'public';
};
