
'use server';
import { deleteAdmissionForm } from "@/lib/firebase/admissions";


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
