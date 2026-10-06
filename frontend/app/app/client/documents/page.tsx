'use client';
import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { AlertCircle, CheckCircle2, Download, FileText, Trash2, Upload } from 'lucide-react';
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/Page';
import { Spinner } from '@/components/ui/Spinner';
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
      // The API answers with a short-lived signed link to the file.
      const { download_url } = await apiGet(`/api/v1/documents/${id}/download/`);
      const a = document.createElement('a');
      a.href = download_url;
      a.download = name;
      a.rel = 'noopener';
      a.click();
    } catch (e) {
      setError('Failed to download document');
    }
  }

  return (
    <ClientLayout>
      <PageHeader
        title="Documents"
        description="Upload, sign and manage your legal documents."
        actions={
          <button onClick={() => setShowUpload(!showUpload)} className="btn btn-primary">
            <Upload size={18} /> Upload document
          </button>
        }
      />

      {error && (
        <div role="alert" className="notice notice-error mb-6">
          <AlertCircle size={18} className="mt-0.5 flex-none" />
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="notice notice-success mb-6">
          <CheckCircle2 size={18} className="mt-0.5 flex-none" />
          {success}
        </div>
      )}

      {showUpload && (
        <form onSubmit={handleUpload} className="card rise-in mb-10 space-y-5 p-6">
          <h2 className="title-3">Upload a document</h2>
          <label
            htmlFor="file-input"
            className="block cursor-pointer rounded-2xl border-2 border-dashed border-[#c5cfdc] p-8 text-center transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <Upload size={30} className="mx-auto mb-3 text-blue-600" />
            <span className="block font-semibold text-ink">Choose a file to upload</span>
            <span className="mt-1 block text-sm text-mute">PDF, DOC or DOCX, up to 10 MB</span>
            <input
              id="file-input"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx"
              className="sr-only"
            />
          </label>
          {selectedFile && (
            <div className="notice notice-info">
              <FileText size={18} className="mt-0.5 flex-none" />
              <span className="min-w-0 truncate">
                <span className="font-semibold">Selected:</span> {selectedFile.name}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={!selectedFile || uploading} className="btn btn-primary flex-1">
              {uploading && <Spinner />}
              {uploading ? 'Uploading…' : 'Upload document'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUpload(false);
                setSelectedFile(null);
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section>
        <h2 className="title-3 mb-5 text-[1.35rem]">Your documents</h2>
        {loading ? (
          <div className="flex justify-center p-12 text-blue-600" role="status" aria-label="Loading">
            <Spinner size={30} />
          </div>
        ) : documents.length === 0 ? (
          <EmptyState icon={FileText} title="No documents yet" text="Documents you upload or receive will be kept here, privately." />
        ) : (
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li key={doc.id} className="card flex items-center justify-between gap-4 p-5">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={22} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-ink">{doc.name}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="text-sm text-mute">Uploaded {new Date(doc.uploaded_date).toLocaleDateString()}</span>
                      <StatusBadge status={doc.status === 'pending' ? 'pending signature' : doc.status} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-none items-center gap-1">
                  <button
                    onClick={() => handleDownload(doc.id, doc.name)}
                    className="grid h-11 w-11 place-items-center rounded-xl text-mute transition-colors hover:bg-paper hover:text-ink"
                    aria-label={`Download ${doc.name}`}
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="grid h-11 w-11 place-items-center rounded-xl text-mute transition-colors hover:bg-[#fef3f2] hover:text-[#b42318]"
                    aria-label={`Delete ${doc.name}`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </ClientLayout>
  );
}
