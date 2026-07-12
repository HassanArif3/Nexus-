import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Trash2, Share2, Eye } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getDocuments, uploadDocument, deleteDocument } from '../../services/documentService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const data = await getDocuments();
      if (data.success) {
        setDocuments(data.data.documents);
      }
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('category', 'other');

    setUploading(true);
    try {
      await uploadDocument(formData);
      toast.success('Document uploaded successfully');
      fetchDocs();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      toast.success('Document archived');
      fetchDocs();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="text-gray-600">Manage your startup's important files</p>
        </div>
        
        <div className="relative">
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            onChange={handleUpload}
            accept=".pdf,.docx,.xlsx,.pptx"
            disabled={uploading}
          />
          <Button leftIcon={<Upload size={18} />}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document list */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
            </CardHeader>
            <CardBody>
              {loading ? <p>Loading...</p> : documents.length === 0 ? <p className="text-gray-500 py-4">No documents found.</p> : (
                <div className="space-y-2">
                  {documents.map((doc: any) => (
                    <div
                      key={doc._id}
                      className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      <div className="p-2 bg-primary-50 rounded-lg mr-4">
                        <FileText size={24} className="text-primary-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {doc.title}
                          </h3>
                          <Badge variant="secondary" size="sm">{doc.status}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{doc.category}</span>
                          <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          aria-label="Preview"
                          onClick={() => navigate(`/documents/${doc._id}`)}
                        >
                          <Eye size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-error-600 hover:text-error-700"
                          aria-label="Delete"
                          onClick={() => handleDelete(doc._id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};