import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDocumentMetadata, getDocumentPreviewUrl, uploadSignature } from '../services/documentService';
import toast from 'react-hot-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export const DocumentPreviewPage = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  useEffect(() => {
    fetchDoc();
  }, [id]);

  const fetchDoc = async () => {
    try {
      const data = await getDocumentMetadata(id!);
      if (data.success) {
        setDoc(data.data.document);
      }
    } catch (err) {
      toast.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('signatureImage', file);

    try {
      await uploadSignature(id!, formData);
      toast.success('Signature uploaded successfully');
      fetchDoc();
    } catch (err) {
      toast.error('Failed to upload signature');
    }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  if (loading) return <div className="p-6">Loading document...</div>;
  if (!doc) return <div className="p-6">Document not found</div>;

  const previewUrl = getDocumentPreviewUrl(id!);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{doc.title}</h1>
          <p className="text-gray-500">{doc.category} • {doc.status}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6 flex flex-col items-center p-4">
        {doc.mimeType === 'application/pdf' ? (
           <div className="flex flex-col items-center w-full overflow-auto h-[600px] border bg-gray-100 dark:bg-gray-900">
             <Document
               file={previewUrl}
               onLoadSuccess={onDocumentLoadSuccess}
               loading={<p>Loading PDF...</p>}
             >
               <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={true} 
                  renderAnnotationLayer={true} 
               />
             </Document>
             
             {numPages && (
               <div className="flex items-center gap-4 mt-4 bg-white dark:bg-gray-800 p-2 rounded shadow absolute bottom-12">
                 <button 
                   disabled={pageNumber <= 1} 
                   onClick={previousPage}
                   className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                 >
                   Previous
                 </button>
                 <span>
                   Page {pageNumber} of {numPages}
                 </span>
                 <button 
                   disabled={pageNumber >= numPages} 
                   onClick={nextPage}
                   className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                 >
                   Next
                 </button>
               </div>
             )}
           </div>
        ) : (
           <div className="flex flex-col items-center justify-center h-[600px]">
             <p className="mb-4">Preview not available for this file type.</p>
             <a href={previewUrl} download className="px-4 py-2 bg-blue-600 text-white rounded">Download File</a>
           </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Signatures</h2>
        <div className="mb-4">
          <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleSignatureUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>
        
        {doc.signatures && doc.signatures.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {doc.signatures.map((sig: any, index: number) => (
              <div key={index} className="border p-4 rounded">
                <img src={sig.signatureImageUrl} alt="Signature" className="h-16 object-contain mb-2" />
                <p className="text-xs text-gray-500">Signed At: {new Date(sig.signedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No signatures yet.</p>
        )}
      </div>
    </div>
  );
};
