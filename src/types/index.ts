export type Resource = {
  id: string; // The unique document ID from Firestore (slug)
  title: string;
  description: string;
  content: string;
  category: 'Question Bank' | 'Textbook Solutions' | 'Study Notes' | 'Video Tutorial';
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'History' | 'Computer Science';
  class: 'class9' | 'class10' | 'class11' | 'class12';
  stream: 'All' | 'Science' | 'Commerce' | 'Arts' | 'NEET' | 'JEE' | 'MHT-CET' | 'General';
  imageUrl: string;
  pdfUrl?: string;
  downloadUrl?: string;
};
