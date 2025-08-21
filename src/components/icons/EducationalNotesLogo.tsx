import { SVGProps } from "react";

export function EducationalNotesLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="1em" 
      height="1em" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 6l10-4 10 4-10 4-10-4Z"/>
      <path d="M12 22V8"/>
      <path d="M6 18h12"/>
      <path d="M6 14h12"/>
      <path d="M6 10h12"/>
      <path d="M18 10a6 6 0 0 1-12 0"/>
      <path d="M20 18a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2Z"/>
    </svg>
  );
}
