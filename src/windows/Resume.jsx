import React, { useState, useMemo } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { WindowControls } from "#components/index.js";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { Download } from "lucide-react";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Resume = () => {
  const [numPages, setNumPages] = useState(null);

  const options = useMemo(() => ({
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'standard_fonts/',
  }), []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <>
      <div id="window-header">
        <WindowControls target={"resume"} />
        <h2>Resume.pdf</h2>

        <a
          href="files/resume.pdf"
          download
          className="cursor-pointer"
          title="Download resume"
        >
          <Download className="icon"/>
        </a>
      </div>

      <div className="flex justify-center overflow-auto h-[calc(100%-40px)] p-4 bg-gray-100">
        <Document 
          file="files/resume.pdf" 
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
          className="flex flex-col items-center"
          loading={<p className="py-10">Loading PDF...</p>}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page 
              key={`page_${index + 1}`} 
              pageNumber={index + 1} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              scale={1.2}
              className="mb-4 shadow-md"
            />
          ))}
        </Document>
      </div>
    </>
  );
};

const ResumeWindow = WindowWrapper(Resume, "resume");
export default ResumeWindow;