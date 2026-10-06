import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Upload, Download, Trash2, Edit3, X, FileText, FileCheck, HardDrive, Shield, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { getMyDocuments, uploadDocument, updateDocument, deleteDocument, downloadDocumentFile } from '../../api/documentApi';
import { formatDate } from '../../utils/formatDate';
import { fileKind } from '../../utils/insurance';
import LoadingSpinner from '../../components/LoadingSpinner';

const KIND_META = {
  image: { label: 'Photo', Icon: ImageIcon, tone: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  pdf: { label: 'PDF', Icon: FileText, tone: 'bg-red-500/10 border-red-500/20 text-red-400' },
  doc: { label: 'Document', Icon: FileText, tone: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  file: { label: 'File', Icon: FileIcon, tone: 'bg-slate-500/10 border-slate-500/20 text-slate-400' },
};

const DOCUMENT_GUIDE = [
  { icon: '🪪', title: "Driver's licence", note: 'Valid licence of the main driver' },
  { icon: '📄', title: 'Vehicle registration', note: 'Registration certificate (CR)' },
  { icon: '🛡️', title: 'Policy certificate', note: 'Proof of your cover' },
  { icon: '📸', title: 'Damage photos', note: 'Vehicle and scene, from several angles' },
  { icon: '👮', title: 'Police report', note: 'For accidents and theft' },
  { icon: '🔧', title: 'Repair estimate', note: 'Quotation from a garage' },
];

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editName, setEditName] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const startEdit = (doc) => {
    setEditingDoc(doc);
    setEditName(doc.fileName);
    setEditFile(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const nameChanged = editName.trim() !== '' && editName.trim() !== editingDoc.fileName;
    if (!nameChanged && !editFile) {
      toast.info('Change the name or choose a replacement file first');
      return;
    }
    setEditSaving(true);
    const formData = new FormData();
    if (nameChanged) formData.append('fileName', editName.trim());
    if (editFile) formData.append('file', editFile);
    try {
      await updateDocument(editingDoc.id, formData);
      toast.success('Document updated');
      setEditingDoc(null);
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update document');
    } finally {
      setEditSaving(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await getMyDocuments();
      setDocuments(res.data.data);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await uploadDocument(formData);
      toast.success('Document uploaded successfully');
      setFile(null);
      const input = document.getElementById('fileInput');
      if (input) input.value = '';
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(id);
      toast.success('Document deleted');
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to delete document');
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
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Shield className="w-6 h-6" />
            </span>
            Document Vault
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Securely upload and manage driving licenses, vehicle titles, and proof of loss documents
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold self-start">
          <HardDrive className="w-4 h-4 text-blue-400" />
          <span>{documents.length} File{documents.length === 1 ? '' : 's'} Stored</span>
        </div>
      </div>

      {/* Upload Box */}
      <div className="card-glass border border-slate-800 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <form onSubmit={handleUpload} className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-400" />
            Upload New File
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1">
              <input 
                id="fileInput"
                type="file" 
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:cursor-pointer file:transition-all cursor-pointer bg-slate-900/60 border border-slate-700/80 rounded-xl p-1.5 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button 
              type="submit" 
              disabled={!file || uploading} 
              className="btn-primary disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shrink-0 py-2.5"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Encrypting & Uploading...' : 'Upload Document'}
            </button>
          </div>
          {file && (
            <p className="text-xs text-blue-400 flex items-center gap-1.5 pt-1">
              <FileCheck className="w-3.5 h-3.5" /> Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </form>
      </div>

      {/* What insurers usually ask for */}
      <div className="card border border-slate-800">
        <h2 className="text-sm font-bold text-white mb-1">Documents insurers usually ask for</h2>
        <p className="text-xs text-slate-500 mb-4">Keep these ready to speed up policy checks and claims.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DOCUMENT_GUIDE.map(d => (
            <div key={d.title} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xl">{d.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200">{d.title}</p>
                <p className="text-[11px] text-slate-500 truncate">{d.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Saved Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => {
            const kind = KIND_META[fileKind(doc.fileName, doc.mimeType)];
            const KindIcon = kind.Icon;
            return (
            <div
              key={doc.id}
              className="card card-hover group flex flex-col justify-between p-5"
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-3 rounded-xl border group-hover:scale-105 transition-transform shrink-0 ${kind.tone}`}>
                  <KindIcon className="w-6 h-6" />
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors" title={doc.fileName}>
                    {doc.fileName}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Uploaded {formatDate(doc.uploadedAt)}
                  </p>
                  <span className="badge-blue mt-2">{kind.label}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                  title="Download / View"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startEdit(doc)}
                  className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                  title="Edit document"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            );
          })}

          {documents.length === 0 && (
            <div className="col-span-full card text-center py-12 border-dashed border-slate-800">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-300">No documents uploaded yet</p>
              <p className="text-xs text-slate-500 mt-1">Upload your identity, vehicle registration, or claims receipts above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in border border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Edit Document</h3>
              <button onClick={() => setEditingDoc(null)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">File name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={255}
                  className="input-field"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">If you leave out the extension (like .pdf), the current one is kept.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Replace file (optional)</label>
                <input
                  type="file"
                  onChange={(e) => setEditFile(e.target.files[0] || null)}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:cursor-pointer cursor-pointer bg-slate-900/60 border border-slate-700/80 rounded-xl p-1.5 focus:outline-none"
                />
                {editFile && (
                  <p className="text-xs text-blue-400 mt-1.5">
                    New file: {editFile.name} ({(editFile.size / 1024).toFixed(1)} KB) will replace the stored one.
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={editSaving} className="btn-primary flex items-center gap-2">
                  {editSaving
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                    : <Edit3 className="w-4 h-4" />}
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditingDoc(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
