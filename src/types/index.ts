
export type Resource = {
  id: string; // The unique document ID from Firestore (slug)
  title: string;
  content: string; // Detailed description or content of the resource
  category: string[];
  subject: string[];
  class?: string; // Optional since it may not be present for all streams
  stream: string[]; // Changed to array to support multiple streams
  imageUrl: string;
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
    teacherName: string;
    className: string;
    subject: string;
    year: string;
    startMonth: string;
    description: string;
    imageUrl?: string;
    isPasswordProtected?: boolean;
    password?: string;
    totalFees: number;
    advanceFees: number;
    contactNo?: string;
    paymentApp?: string;
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
  paymentScreenshot?: string;
  senderName?: string;
  paymentAmount?: string;
  transactionDate?: string;
  transactionTime?: string;
  submittedAt: string; // ISO string
};

export type Teacher = {
  id: string;
  name: string;
  education: string;
  className: string;
  subject: string;
  mobile?: string;
  experience: string;
  since: string;
  description: string;
  createdAt: string; // Should be an ISO string
  updatedAt?: string;
};
