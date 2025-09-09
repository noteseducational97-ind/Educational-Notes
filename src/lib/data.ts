
import type { Tool } from '@/app/admin/tools/page';
import type { Teacher } from '@/app/admin/teachers/page';

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


export const initialTeachers: Teacher[] = [
  {
    id: 'pravin-khachane',
    name: 'Pravin Khachane',
    education: 'M.Sc., B.Ed.',
    className: 'Shree Coaching Classes',
    subject: 'Physics',
    mobile: '9876543210',
    experience: '30+ years',
    since: '1994',
    description: 'With over 30 years of teaching experience, Pravin Sir is a visionary in science education. His ability to simplify complex physics concepts has made him a beloved mentor.',
  },
  {
    id: 'mangesh-shete',
    name: 'Mangesh Shete',
    education: 'M.Sc., B.Ed.',
    className: 'ChemStar Chemistry Classes',
    subject: 'Chemistry',
    mobile: '9876543211',
    experience: '30+ years',
    since: '1994',
    description: 'A master of chemistry, Mangesh Sir has spent three decades nurturing curiosity and confidence. His empathetic approach continues to inspire thousands.',
  }
];
