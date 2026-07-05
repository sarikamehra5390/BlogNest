import React from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Controller } from "react-hook-form";

// control will pass on the control of this component to whosoever is calling

export default function RTE({ name, control, label, defaultValue = "" }) {
  return (
    <div className="w-full">
      {label && <label className="inline-block mb-1 pl-1">{label}</label>}

      <Controller
        name={name || "content"}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { onChange, value } }) => (
          <Editor
            apiKey="gb83lxt21r5o89wcsfko5wa6irq5tbwlhk58273u5u8zpmpc"
            value={value}
            initialValue={defaultValue}
            init={{
              initialValue: defaultValue,
              height: 500,
              menubar: true,
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
                "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",

              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
            onEditorChange={(content) => {
              console.log("Editor Content:", content);
              onChange(content);
            }}
          />
        )}
      />
    </div>
  );
}
