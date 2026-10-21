import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

export default function SignInPrompt({ open, onClose, returnTo = "/", action = "take part" }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const dialog = closeRef.current?.closest("[role=dialog]");
        const focusable = dialog?.querySelectorAll("button, a[href]");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="signin-prompt-title" aria-describedby="signin-prompt-copy" className="relative w-full max-w-md border border-slate-300 bg-white p-7 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-9">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close sign in prompt" className="absolute right-4 top-4 grid h-10 w-10 place-items-center text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><X size={19} /></button>
        <p className="page-kicker">Join the community</p>
        <h2 id="signin-prompt-title" className="font-editorial mt-3 pr-7 text-3xl font-semibold text-slate-950 dark:text-white">A little more with an account</h2>
        <p id="signin-prompt-copy" className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Sign in or create a free account to {action}. Your place in this story will be here when you return.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link to="/login" state={{ from: returnTo }} className="inline-flex min-h-11 flex-1 items-center justify-center bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">Sign in</Link>
          <Link to="/signup" state={{ from: returnTo }} className="inline-flex min-h-11 flex-1 items-center justify-center border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-100">Create account</Link>
        </div>
      </section>
    </div>
  );
}
