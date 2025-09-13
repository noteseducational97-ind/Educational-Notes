
'use server';
import { deleteAdmissionForm, deleteApplication } from "@/lib/firebase/admissions";


export async function deleteAdmissionFormAction(id: string) {
    if (!id) {
        return { success: false, error: 'Form ID is required.' };
    }
    
    try {
        await deleteAdmissionForm(id);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Something went wrong on the server.' };
    }
}

export async function deleteApplicationAction(formId: string, applicationId: string) {
    if (!formId || !applicationId) {
        return { success: false, error: 'Form ID and Application ID are required.' };
    }
    
    try {
        await deleteApplication(formId, applicationId);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Something went wrong on the server.' };
    }
}
