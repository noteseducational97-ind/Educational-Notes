

'use server';

import { db } from '@/lib/firebase/admin';
import type { AdmissionForm, AdmissionApplication } from '@/types';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { sendSms } from '@/lib/sms';


const transformGoogleDriveUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    if (url.includes("drive.google.com/file/d/")) {
        const fileId = url.split('/d/')[1].split('/')[0];
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    return url;
};

// A function to upload a file to Firebase Storage (or any other service)
// and return the public URL. This is a placeholder and needs real implementation.
async function uploadFileAndGetURL(file: { name: string }, path: string): Promise<string> {
    // In a real app, you would use Firebase Admin SDK for Storage here
    // For now, we'll just return a placeholder URL based on the file name
    console.log(`Simulating upload for: ${file.name} to path: ${path}`);
    
    // This is NOT a real URL. Replace with actual upload logic.
    // Using a valid placeholder service to avoid "Invalid URL" errors.
    const seed = Math.random().toString(36).substring(7);
    return `https://i.ibb.co/C0SkCsc/Pay-Tm-Success-Page-Template-For-Blogger-And-Word-Press-Googles-Adsense-Approval-Trick.png`;
}


export async function addAdmissionForm(data: Omit<AdmissionForm, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = db.collection('admissionForms').doc();
    
    const transformedImageUrl = transformGoogleDriveUrl(data.imageUrl);

    await docRef.set({
        ...data,
        imageUrl: transformedImageUrl,
        id: docRef.id,
        createdAt: new Date(),
    });

    revalidatePath('/admin/admission');
    revalidatePath('/admission');
}

export async function getAdmissionForms(): Promise<AdmissionForm[]> {
    try {
        const snapshot = await db.collection('admissionForms').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
            const updatedAt = (data.updatedAt as Timestamp)?.toDate().toISOString() || undefined;
            return {
                ...data,
                id: doc.id,
                createdAt,
                updatedAt,
            } as AdmissionForm;
        });
    } catch (error) {
        console.error("Failed to fetch admission forms:", error);
        return [];
    }
}

export async function getAdmissionFormById(id: string): Promise<AdmissionForm | null> {
    const doc = await db.collection('admissionForms').doc(id).get();
    if (!doc.exists) {
        return null;
    }
    const data = doc.data();
    if (!data) return null;

    const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
    const updatedAt = (data.updatedAt as Timestamp)?.toDate().toISOString() || undefined;
    
    return {
        ...data,
        id: doc.id,
        createdAt,
        updatedAt,
    } as AdmissionForm;
}

export async function updateAdmissionForm(id: string, data: Partial<Omit<AdmissionForm, 'id' | 'createdAt'>>) {
    const transformedImageUrl = transformGoogleDriveUrl(data.imageUrl);
    await db.collection('admissionForms').doc(id).update({
        ...data,
        imageUrl: transformedImageUrl,
        updatedAt: new Date(),
    });
    revalidatePath(`/admin/admission/edit/${id}`);
    revalidatePath('/admin/admission');
    revalidatePath('/admission');
    revalidatePath(`/admission/${id}`);
}

export async function deleteAdmissionForm(id: string) {
    if (!id) {
        throw new Error('Form ID is required for deletion.');
    }
    await db.collection('admissionForms').doc(id).delete();
    revalidatePath('/admin/admission');
    revalidatePath('/admission');
}

export async function submitAdmissionApplication(formId: string, applicationData: any): Promise<{formId: string, applicationId: string}> {
  if (!formId) {
    throw new Error('Form ID is required.');
  }

  const formDetails = await getAdmissionFormById(formId);
  if (!formDetails) {
    throw new Error('Admission form not found.');
  }
  
  // The screenshot is used for client-side extraction but not stored.
  // We remove it from the data that gets saved to Firestore.
  const { paymentScreenshot, ...restOfData } = applicationData;

  const applicationRef = db.collection('admissionForms').doc(formId).collection('applications').doc();
  await applicationRef.set({
    ...restOfData,
    paymentScreenshot: null, // Ensure screenshot URL is not saved
    submittedAt: new Date(),
    id: applicationRef.id,
  });

  // Send notification to teacher
  if (formDetails.contactNo) {
      try {
          const message = `New admission for ${formDetails.title}: ${applicationData.fullName}.`;
          await sendSms(formDetails.contactNo, message);
      } catch (error) {
          // Log the error but don't fail the entire submission if SMS fails
          console.error(`Failed to send SMS for application ${applicationRef.id}:`, error);
      }
  }

  return { formId, applicationId: applicationRef.id };
}

export async function getApplicationsForForm(formId: string): Promise<AdmissionApplication[]> {
    if (!formId) {
        return [];
    }
    const snapshot = await db.collection('admissionForms').doc(formId).collection('applications')
        .orderBy('submittedAt', 'desc').get();
    
    if (snapshot.empty) {
        return [];
    }
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const submittedAt = (data.submittedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
        return {
            ...data,
            id: doc.id,
            submittedAt,
        } as AdmissionApplication;
    });
}

export async function getApplicationById(formId: string, applicationId: string): Promise<AdmissionApplication | null> {
    const doc = await db.collection('admissionForms').doc(formId).collection('applications').doc(applicationId).get();
    if (!doc.exists) {
        return null;
    }
    const data = doc.data();
    if (!data) return null;

    const submittedAt = (data.submittedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
    
    return {
        ...data,
        id: doc.id,
        submittedAt,
    } as AdmissionApplication;
}

export async function getApplicationsForUser(userId: string): Promise<{ form: AdmissionForm; application: AdmissionApplication }[]> {
    try {
        const applicationsSnapshot = await db.collectionGroup('applications').where('userId', '==', userId).get();
        if (applicationsSnapshot.empty) {
            return [];
        }

        const results = await Promise.all(applicationsSnapshot.docs.map(async (doc) => {
            const applicationData = doc.data() as Omit<AdmissionApplication, 'id' | 'submittedAt'>;
            const submittedAt = (doc.createTime as Timestamp)?.toDate().toISOString() || new Date().toISOString();
            const application = { ...applicationData, id: doc.id, submittedAt } as AdmissionApplication;

            const formRef = doc.ref.parent.parent;
            if (!formRef) return null;

            const formDoc = await formRef.get();
            if (!formDoc.exists) return null;

            const formData = formDoc.data() as Omit<AdmissionForm, 'id' | 'createdAt' | 'updatedAt'>;
            const formCreatedAt = (formDoc.createTime as Timestamp)?.toDate().toISOString() || new Date().toISOString();
            const formUpdatedAt = (formDoc.updateTime as Timestamp)?.toDate().toISOString() || undefined;

            const form = { 
                ...formData, 
                id: formDoc.id, 
                createdAt: formCreatedAt, 
                updatedAt: formUpdatedAt 
            } as AdmissionForm;

            return { form, application };
        }));

        return results.filter((result): result is { form: AdmissionForm; application: AdmissionApplication } => result !== null);
    } catch (error: any) {
        if (error.code === 'FAILED_PRECONDITION') {
            console.error(
                'Firestore query failed. This is likely due to a missing index. ' +
                'Please check the Firebase console for a link to create the required index. ' +
                'The query requiring an index is a collectionGroup query on "applications" with a filter on "userId".'
            );
        } else {
            console.error('Failed to fetch user applications:', error);
        }
        return [];
    }
}

export async function deleteApplication(formId: string, applicationId: string) {
    if (!formId || !applicationId) {
        throw new Error('Form ID and Application ID are required for deletion.');
    }
    await db.collection('admissionForms').doc(formId).collection('applications').doc(applicationId).delete();
    revalidatePath(`/admin/admission/applications/${formId}`);
}
