
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdmissionApplication } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';

type ApplicationDetailDialogProps = {
  application: AdmissionApplication | null;
  isOpen: boolean;
  onClose: () => void;
};

const DetailItem = ({ label, value }: { label: string, value?: string | null }) => {
    if (!value) return null;
    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p>{value}</p>
        </div>
    );
};

export default function ApplicationDetailDialog({ application, isOpen, onClose }: ApplicationDetailDialogProps) {
  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Application Details: {application.fullName}</DialogTitle>
          <DialogDescription>
            Submitted on {format(new Date(application.submittedAt), 'PPP p')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2 border-b pb-1">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Full Name" value={application.fullName} />
                <DetailItem label="Date of Birth" value={format(new Date(application.dateOfBirth), 'PPP')} />
                <DetailItem label="Gender" value={application.gender} />
                <DetailItem label="Student Phone" value={application.studentPhone} />
                <DetailItem label="Address" value={application.address} />
                <DetailItem label="Category" value={application.category} />
              </div>
            </section>
             <section>
              <h3 className="text-lg font-semibold mb-2 border-b pb-1">Parent Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Father's Name" value={application.fatherName} />
                <DetailItem label="Father's Occupation" value={application.fatherOccupation} />
                <DetailItem label="Mother's Name" value={application.motherName} />
                <DetailItem label="Parent Phone" value={application.parentPhone} />
              </div>
            </section>
            <section>
              <h3 className="text-lg font-semibold mb-2 border-b pb-1">Academic Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <DetailItem label="Previous School" value={application.previousSchool} />
                <DetailItem label="Board" value={application.board} />
                <DetailItem label="Percentage" value={application.percentage} />
              </div>
            </section>
            <section>
                <h3 className="text-lg font-semibold mb-2 border-b pb-1">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Payment Mode" value={application.paymentMode} />
                </div>
                 {application.paymentMode === 'Online' && (
                     <div className="mt-4 border-t pt-4">
                         <h4 className="font-medium mb-2">Extracted Online Payment Info:</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Sender Name" value={application.senderName} />
                            <DetailItem label="Amount" value={application.paymentAmount} />
                            <DetailItem label="Date" value={application.transactionDate} />
                            <DetailItem label="Time" value={application.transactionTime} />
                         </div>
                     </div>
                 )}
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
