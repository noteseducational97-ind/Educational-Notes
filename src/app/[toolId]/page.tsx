
'use client';

import { useParams, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { initialTools } from '@/lib/data';
import type { Tool } from '../admin/tools/page';
import ComingSoonPage from '../coming-soon/page';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ToolPage() {
    const params = useParams();
    const toolId = params.toolId as string;
    const [tool, setTool] = useState<Tool | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedTools = sessionStorage.getItem('managed-tools');
            const allTools = storedTools ? JSON.parse(storedTools) : initialTools;
            const foundTool = allTools.find((t: Tool) => t.id === toolId);
            setTool(foundTool || null);
            setLoading(false);
        }
    }, [toolId]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!tool) {
        notFound();
    }

    if (tool.isComingSoon) {
        return <ComingSoonPage />;
    }

    // This is where you would render the actual tool component
    // For now, we'll just show a placeholder
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Tool: {tool.title}</h1>
            <p>This is where the actual tool would be rendered.</p>
        </div>
    );
}
