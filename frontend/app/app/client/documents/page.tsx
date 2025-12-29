'use client';
import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { FileText, Download, Trash2, Upload, Loader, CheckCircle2 } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';

type Document = {
  id: number;
  name: string;
  file_type: string;
  uploaded_date: string;
  size: number;
  status: 'pending' | 'signed' | 'executed';
};

export default function ClientDocumentsPage(): React.ReactNode {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        const res = await apiGet('/api/v1/documents/');
        setDocuments(res?.results || []);
      } catch (e: any) {
        setError('Failed to load documents');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDocuments();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      await apiPost('/api/v1/documents/', {
        name: selectedFile.name,
        file_type: selectedFile.type,
      });
      
      setSuccess('Document uploaded successfully!');
      setSelectedFile(null);
      setShowUpload(false);
      
      // Reload documents
      const res = await apiGet('/api/v1/documents/');
      setDocuments(res?.results || []);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError('Failed to upload document');
      console.error(e);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this document?')) return;

    try {
      await apiPost(`/api/v1/documents/${id}/delete/`, {});
      setDocuments(documents.filter(d => d.id !== id));
      setSuccess('Document deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError('Failed to delete document');
      console.error(e);
    }
  }

  async function handleDownload(id: number, name: string) {
    try {
      const response = await fetch(`/api/v1/documents/${id}/download/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('lc_token')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
    } catch (e) {
      setError('Failed to download document');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'executed':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'signed':
        return '✓ Signed';
      case 'executed':
        return '✓ Executed';
      default:
        return 'Pending Signature';
    }
  };

  return (
    <ClientLayout>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Documents</h1>
            <p className="text-lg text-lctextsecondary">Upload, sign, and manage legal documents</p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-6 py-3 bg-lcaccentclient text-white rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
          >
            <Upload size={20} />
            Upload Document
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">{success}</div>}

        {/* Upload Form */}
        {showUpload && (
          <div className="bg-white border-2 border-lcborder rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Upload Document</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-lcborder rounded-lg p-8 text-center cursor-pointer hover:border-lcaccentclient transition"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload size={32} className="mx-auto mb-2 text-lctextsecondary" />
                <p className="font-medium text-lctextprimary mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-lctextsecondary">PDF, DOC, DOCX up to 10MB</p>
                <input
                  id="file-input"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
              </div>
              {selectedFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm"><strong>Selected:</strong> {selectedFile.name}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="flex-1 py-2 bg-lcaccentclient text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading && <Loader size={18} className="animate-spin" />}
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpload(false);
                    setSelectedFile(null);
                  }}
                  className="px-6 py-2 border border-lcborder rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Documents List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Documents</h2>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader size={32} className="animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-lcborder rounded-lg p-12 text-center text-lctextsecondary">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-4">No documents yet</p>
              <button
                onClick={() => setShowUpload(true)}
                className="px-6 py-2 bg-lcaccentclient text-white rounded-lg font-medium hover:opacity-90 transition"
              >
                Upload Your First Document
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map(doc => (
                <div key={doc.id} className="bg-white border border-lcborder rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <FileText size={32} className="text-lctextsecondary mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-lctextprimary mb-1">{doc.name}</h3>
                        <p className="text-sm text-lctextsecondary mb-2">
                          Uploaded {new Date(doc.uploaded_date).toLocaleDateString()}
                        </p>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                          {getStatusLabel(doc.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={() => handleDownload(doc.id, doc.name)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-lctextsecondary hover:text-lctextprimary"
                        title="Download"
                      >
                        <Download size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition text-lctextsecondary hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
