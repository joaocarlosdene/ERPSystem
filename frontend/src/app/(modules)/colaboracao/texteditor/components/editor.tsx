"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";
import axios from "axios";

// Tipagem local do usuário
type User = {
  id: string;
  name: string;
};

// CKEditor React (SSR safe)
const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false }
);

// Import do build clássico atualizado (v42+)
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Templates
const templates = {
  contrato: "<h2>Contrato</h2><p>Preencha as informações do contrato aqui...</p>",
  relatorio: "<h2>Relatório</h2><p>Preencha as informações do relatório aqui...</p>",
};

type Props = {
  currentUser: User;
  collaborators?: User[];
};

export default function AdvancedEditor({ currentUser, collaborators = [] }: Props) {
  const [content, setContent] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string>("Nunca");

  // Autosave a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => saveContent(), 30000);
    return () => clearInterval(interval);
  }, [content]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // --- Salvar conteúdo (mock backend) ---
  const saveContent = async () => {
    try {
      await axios.post("/api/documents/save", { content, userId: currentUser.id });
      setLastSaved(new Date().toLocaleTimeString());
      console.log("Documento salvo!");
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // --- Export PDF ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    const text = content.replace(/<[^>]+>/g, "");
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 15, 20);
    doc.save("documento.pdf");
  };

  // --- Export DOCX ---
  const exportToDOCX = async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun(content.replace(/<[^>]+>/g, ""))],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "documento.docx");
  };

  // --- Inserir Template ---
  const insertTemplate = (template: keyof typeof templates) => setContent(templates[template]);

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} p-4 max-w-5xl mx-auto space-y-4 rounded`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <h2 className="text-xl font-semibold">Editor Corporativo</h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={toggleDarkMode}
            className="px-3 py-1 border rounded hover:bg-gray-700 hover:text-white transition"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <span className="text-sm">Último save: {lastSaved}</span>
        </div>
      </div>

      {/* Templates */}
      <div className="flex gap-2 flex-wrap">
        <button
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          onClick={() => insertTemplate("contrato")}
        >
          Contrato
        </button>
        <button
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
          onClick={() => insertTemplate("relatorio")}
        >
          Relatório
        </button>
      </div>

      {/* Export */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Exportar PDF
        </button>
        <button
          onClick={exportToDOCX}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Exportar DOCX
        </button>
      </div>

      {/* Colaboradores */}
      {collaborators.length > 0 && (
        <div className="flex gap-2 text-sm">
          Colaborando com: {collaborators.map(c => c.name).join(", ")}
        </div>
      )}

      {/* Editor */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded shadow p-2`}>
        <CKEditor
          editor={ClassicEditor as any}
          data={content}
          onChange={(_, editor: any) => setContent(editor.getData())}
          config={{
            toolbar: [
              "heading",
              "|",
              "bold",
              "italic",
              //"underline",
              //"strikethrough",
              "bulletedList",
              "numberedList",
              "blockQuote",
              "link",
              "insertTable",
              "imageUpload",
              "undo",
              "redo",
            ],
            image: {
              toolbar: ["imageTextAlternative", "imageStyle:full", "imageStyle:side"],
              upload: { types: ["jpeg", "png", "gif", "bmp", "webp"] },
            },
          }}
        />
      </div>
    </div>
  );
}
