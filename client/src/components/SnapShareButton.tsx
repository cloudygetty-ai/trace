import { useEffect, useRef } from 'react';

// Snapchat Creative Kit (web). Snap reads OG tags from `shareUrl`, so it must be a
// public, server-rendered page — use lostDogShareUrl() rather than an SPA route.
const SDK_ID = 'snapkit-creative-kit-sdk';
const SDK_SRC = 'https://sdk.snapkit.com/js/v1/create.js';

declare global {
  interface Window {
    snap?: { creativekit: { initalizeShareButtons: (els: HTMLCollectionOf<Element> | Element[]) => void } };
    snapKitInit?: () => void;
  }
}

const pending = new Set<HTMLElement>();

function init(el: HTMLElement) {
  // Snap's API really is spelled "initalize".
  if (window.snap?.creativekit) { window.snap.creativekit.initalizeShareButtons([el]); return; }
  pending.add(el);
  window.snapKitInit = () => {
    window.snap?.creativekit.initalizeShareButtons(Array.from(pending));
    pending.clear();
  };
  if (!document.getElementById(SDK_ID)) {
    const s = document.createElement('script');
    s.id = SDK_ID; s.src = SDK_SRC; s.async = true;
    document.head.appendChild(s);
  }
}

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/api\/?$/, '');
export const lostDogShareUrl = (dogId: string) => `${API_ORIGIN}/s/${dogId}`;

export default function SnapShareButton({ shareUrl, className = '' }: { shareUrl: string; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.shareUrl = shareUrl;
    init(el);
    return () => { pending.delete(el); };
  }, [shareUrl]);

  return (
    <button
      ref={ref}
      type="button"
      data-share-url={shareUrl}
      aria-label="Share to Snapchat"
      className={`snapchat-share-button h-12 px-5 w-full rounded-xl flex items-center justify-center gap-2
        bg-[#FFFC00] text-black font-sans font-bold text-[13px] tracking-wide
        shadow-[0_3px_12px_rgba(0,0,0,.12)] active:scale-[.97] transition-all ${className}`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="#fff" stroke="#000" strokeWidth="1.2" strokeLinejoin="round"
          d="M12 2.5c3.1 0 5.4 2.4 5.4 5.5v2.2c.5.2 1.2.1 1.7-.2.4-.2.9.3.6.7-.4.6-1.4 1-2.1 1.3.4 1.6 2 3 4 3.5.4.1.4.7 0 .9-.7.3-1.5.4-2 .6-.2.4-.2 1-.6 1.1-.6.1-1.4-.2-2.3 0-1.1.3-1.9 1.9-4.7 1.9s-3.6-1.6-4.7-1.9c-.9-.2-1.7.1-2.3 0-.4-.1-.4-.7-.6-1.1-.5-.2-1.3-.3-2-.6-.4-.2-.4-.8 0-.9 2-.5 3.6-1.9 4-3.5-.7-.3-1.7-.7-2.1-1.3-.3-.4.2-.9.6-.7.5.3 1.2.4 1.7.2V8c0-3.1 2.3-5.5 5.4-5.5z"/>
      </svg>
      Share to Snapchat
    </button>
  );
}
