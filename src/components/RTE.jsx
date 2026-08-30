import { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Controller } from "react-hook-form";
import conf from "../conf/conf";

export default function RTE({ name, control, label, defaultValue = "", rules }) {
  const [editorUnavailable, setEditorUnavailable] = useState(false);
  const hasApiKey = Boolean(conf.tinymceApiKey?.trim());

  return (
    <div className="w-full">
      {label && <label className="inline-block mb-1 pl-1 dark:text-slate-300">{label}</label>}

      <Controller
        name={name || "content"}
        control={control}
        defaultValue={defaultValue}
        rules={rules}
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <>
          {hasApiKey && !editorUnavailable ? <>
          <Editor
            apiKey={conf.tinymceApiKey}
            value={value || ""}
            init={{
              height: 650,
              menubar: false,
              branding:false,
              statusbar:false,
              resize:false,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | bold italic underline | forecolor backcolor | alignleft aligncenter alignright | bullist numlist | blockquote | link image | removeformat | code",

              content_style: `body { font-family: Inter, Arial, sans-serif; line-height: 1.7; padding: 1rem; background: ${typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff'}; color: ${typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a'}; } p { margin-bottom: 0.75rem; } h1,h2,h3 { margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 700; line-height: 1.3; } ul, ol { padding-left: 1.5rem; margin-bottom: 1rem; } blockquote { border-left: 4px solid #6366f1; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #64748b; } code { background: rgba(99,102,241,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; }`,
            }}
            onEditorChange={onChange}
            onBlur={onBlur}
            // A failed script load (for example, a blocked TinyMCE Cloud
            // request) should never prevent an author from saving their post.
            onInit={(_, editor) => {
              editor.on("SkinLoadError", () => setEditorUnavailable(true));
            }}
          />
          <button type="button" onClick={() => setEditorUnavailable(true)} className="mt-3 text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300">
            Use the plain-text editor instead
          </button>
          </> : <div className="space-y-2">
            <textarea
              value={value || ""}
              onChange={(event) => onChange(event.target.value)}
              onBlur={onBlur}
              rows={16}
              aria-describedby={`${name || "content"}-editor-note`}
              className="w-full resize-y rounded-xl border border-slate-200 bg-white p-4 font-sans leading-7 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Write your article here…"
            />
            <p id={`${name || "content"}-editor-note`} className="text-sm text-amber-700 dark:text-amber-300">
              {hasApiKey ? "The rich-text editor could not load. You can still write and save your article as plain text." : "Rich-text editing is unavailable until TinyMCE is configured. You can still write and save your article as plain text."}
            </p>
          </div>}
          {error && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{error.message}</p>}
          </>
        )}
      />
    </div>
  );
}
