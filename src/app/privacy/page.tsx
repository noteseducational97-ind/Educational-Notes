
'use client';
import { useEffect, useState } from 'react';

export default function PrivacyPage() {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="w-full bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16 md:py-20">
        <div className="prose prose-lg dark:prose-invert mx-auto">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Privacy Policy</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">Last updated: {date}</p>

            <div className="mt-10 space-y-8 text-muted-foreground">
                <p>This is a placeholder for your Privacy Policy. It's important to be transparent with your users about what data you collect and how you use it. You should consult with a legal professional to draft a policy that is compliant with regulations like GDPR, CCPA, etc.</p>

                <h2 className="text-2xl font-semibold !mt-12 !mb-4 text-foreground">1. Information We Collect</h2>
                <p>Our website may collect personal information such as name, email address, and other contact details when you register for an account or sign in with a third-party service like Google. We also collect data you provide directly to us, such as profile information.</p>

                <h2 className="text-2xl font-semibold !mt-12 !mb-4 text-foreground">2. How We Use Your Information</h2>
                <p>We use the information we collect to provide, maintain, and improve our services, including to authenticate users, send important notices, and for internal purposes like auditing, data analysis, and research. We do not share your personal information with third parties except as described in this policy or with your consent.</p>

                <h2 className="text-2xl font-semibold !mt-12 !mb-4 text-foreground">3. Security</h2>
                <p>We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. We use security measures like encryption to protect your data.</p>

                <h2 className="text-2xl font-semibold !mt-12 !mb-4 text-foreground">4. Your Data Rights</h2>
                <p>You have the right to access, update, or delete your personal information. You can manage your account information through your profile settings or by contacting us directly.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
