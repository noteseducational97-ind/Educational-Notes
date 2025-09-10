
import type { Tool } from '@/app/admin/tools/page';

export const initialTools: Tool[] = [
    {
        id: 'admission-form',
        title: 'Admission Form',
        description: 'A tool for creating and studying with Admission Form.',
        href: '/admission',
        visibility: 'public',
        isComingSoon: false,
    },
    {
        id: 'test-generator',
        title: 'AI Test Generator',
        description: 'Automatically create practice tests from any of our study notes to challenge yourself.',
        href: '/tools/test-generator',
        visibility: 'private',
        isComingSoon: false,
    }
];
