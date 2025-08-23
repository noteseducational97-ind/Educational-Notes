
'use client';

type PdfPreviewProps = {
    url: string;
    title: string;
}

export default function PdfPreview({ url, title }: PdfPreviewProps) {
    return (
        <div className="border rounded-lg overflow-hidden h-[800px] relative">
            <iframe 
                src={url}
                className="w-full h-full"
                title={`${title} PDF Preview`}
                allowFullScreen
            />
            <div 
                className="absolute inset-0" 
                onContextMenu={(e) => e.preventDefault()}
            ></div>
        </div>
    );
}
