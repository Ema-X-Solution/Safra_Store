import { Facebook, Instagram, Twitter, Linkedin, Ghost } from "lucide-react";

export const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a8 8 0 0 1-5-1.5z" />
  </svg>
);

export const SnapchatIcon = ({ className }: { className?: string }) => (
  <Ghost className={className} />
);

export { Facebook as FacebookIcon, Instagram as InstagramIcon, Twitter as TwitterIcon, Linkedin as LinkedinIcon };
