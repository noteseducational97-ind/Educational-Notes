
'use client';
import { useEffect, useState } from 'react';

export default function TermsPage() {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="w-full bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16 md:py-20">
        <div className="prose prose-lg dark:prose-invert mx-auto">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Terms of Service</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">Last updated: {date}</p>

            <div className="mt-10 space-y-8 text-muted-foreground">
                <p>Welcome to Educational Notes!</p>
                <p>These terms and conditions outline the rules and regulations for the use of Educational Notes's Website. By accessing this website we assume you accept these terms and conditions. Do not continue to use Educational Notes if you do not agree to take all of the terms and conditions stated on this page.</p>
                
                <h2 className="text-2xl font-semibold !mt-12 !mb-4 text-foreground">1. License</h2>
                <p>Unless otherwise stated, Educational Notes and/or its licensors own the intellectual property rights for all material on Educational Notes. All intellectual property rights are reserved. You may access this from Educational Notes for your own personal use subjected to restrictions set in these terms and conditions.</p>
                
                <h2 className="text-2xl font-semibold !mt-12 !mb-4 text-foreground">2. Content Liability</h2>
                <p>This is a placeholder for your Terms of Service. You should replace this with your own terms. We shall not be hold responsible for any content that appears on your Website. You agree to protect and defend us against all claims that is rising on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.</p>
                
                <h2 className="text-2xl font-semibold !mt-12 !mb-4 text-foreground">3. Reservation of Rights</h2>
                <p>We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amen these terms and conditions and it’s linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.</p>

                <h2 className="text-2xl font-semibold !mt-12 !mb-4 text-foreground">4. Contact Information</h2>
                <p>If you have any queries regarding any of our terms, please contact us.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
