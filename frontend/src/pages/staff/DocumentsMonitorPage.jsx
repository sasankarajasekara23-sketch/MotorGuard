import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Download, FileText, FolderSync, HardDrive } from 'lucide-react';
import { getAllDocuments, downloadDocumentFile } from '../../api/documentApi';
import { formatDate } from '../../utils/formatDate';
import LoadingSpinner from '../../components/LoadingSpinner';

const DocumentsMonitorPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await getAllDocuments();
      setDocuments((res.data.data || []).sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await downloadDocumentFile(doc.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download document');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <FolderSync className="w-6 h-6" />
            </span>
            Document Repository Monitor
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit and verify all policyholder file attachments, claims proofs, and vehicle registration papers
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold self-start">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <span>{documents.length} Files Tracked</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">File Description</th>
                <th className="table-header">Uploaded By</th>
                <th className="table-header">Timestamp</th>
                <th className="table-header text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {documents.map(d => (
                <tr key={d.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-white truncate max-w-sm" title={d.fileName}>
                        {d.fileName}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell text-sm text-slate-300 font-medium">
                    {d.uploadedBy || 'System User'}
                  </td>
                  <td className="table-cell text-xs text-slate-400">
                    {formatDate(d.uploadedAt)}
                  </td>
                  <td className="table-cell text-right">
                    <button
                      onClick={() => handleDownload(d)}
                      className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5 hover:text-cyan-400"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-500 text-sm">
                    No documents present in repository.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentsMonitorPage;
