import React from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Controller } from "react-hook-form";
import conf from "../../conf/conf";

export default function RTE({ name, control, label, defaultValue = "" }) {
  return (
    <div className="w-full">
      {label && <label className="inline-block mb-1 pl-1 dark:text-slate-300">{label}</label>}

      <Controller
        name={name || "content"}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { onChange, value } }) => (
          <Editor
            apiKey={conf.tinymceApiKey || 'no-preview'}
            value={value}
            initialValue={defaultValue}
            init={{
              initialValue: defaultValue,
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
            onEditorChange={(content) => {
              if (import.meta.env.DEV) {
                console.log("Editor Content:", content);
              }
              onChange(content);
            }}
          />
        )}
      />
    </div>
  );
}
