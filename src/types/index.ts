export type Resource = {
  id: string; // The unique document ID from Firestore (slug)
  title: string;
  content: string; // Detailed description or content of the resource
  category: string[];
  subject: string[];
  class?: string; // Optional since it may not be present for all streams
  stream: string[]; // Changed to array to support multiple streams
  imageUrl?: string;
  pdfUrl: string; 
  viewPdfUrl: string; // For the embedded preview
  createdAt: string; // Should be an ISO string
  isComingSoon?: boolean;
  visibility?: 'private' | 'public';
};

export type Message = {
    role: 'user' | 'assistant';
    content: string;
    image?: string;
    generatedImage?: string;
    createdAt: Date;
    suggestions?: string[];
}

export type Chat = {
    id: string;
    title: string;
    updatedAt: string;
}

export type AdmissionForm = {
    id: string;
    title: string;
    className: string;
    subject: 'Physics' | 'Chemistry';
    year: string;
    startMonth: string;
    description: string;
    isDemoEnabled: boolean;
    demoTenureDays?: number;
    totalFees: number;
    advanceFees: number;
    upiId: string;
    upiNumber: string;
    createdAt: string; // Should be an ISO string
    updatedAt?: string;
};

export type AdmissionApplication = {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  studentPhone: string;
  address: string;
  category: string;
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  parentPhone: string;
  previousSchool: string;
  board: string;
  percentage: string;
  paymentMode?: string;
  submittedAt: string; // ISO string
};
