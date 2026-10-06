import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
    >
      <div className="card w-full max-w-sm animate-in border border-slate-700 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-center gap-3">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
