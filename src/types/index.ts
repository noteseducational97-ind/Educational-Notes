export type Resource = {
  id: string; // The unique document ID from Firestore (slug)
  title: string;
  description: string;
  content: string;
  category: 'Notes' | 'PYQ' | 'Syllabus';
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'History' | 'Computer Science';
  class: 'class9' | 'class10' | 'class11' | 'class12';
  stream: 'All' | 'Science' | 'Commerce' | 'Arts';
  imageUrl: string;
  pdfUrl?: string;
  downloadUrl?: string;
  createdAt: string; // Should be an ISO string
};
