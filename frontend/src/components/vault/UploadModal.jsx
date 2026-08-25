import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { documentService } from '../../services/documentService';
import {
  UploadCloud,
  File,
  X,
  Lock,
  Calendar,
  Folder,
  Tag,
  AlertCircle,
  CheckCircle2,
  Layers
} from 'lucide-react';

export const UploadModal = ({ isOpen, onClose, onSuccess, categories = [], folders = [] }) => {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 1);
  const [folderId, setFolderId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedFiles([]);
    setTitle('');
    setCategoryId(categories[0]?.id || 1);
    setFolderId('');
    setExpiryDate('');
    setNotes('');
    setTagInput('');
    setTags([]);
    setError('');
  };

  const handleFileChange = (e) => {
    if (activeTab === 'single') {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    } else {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (activeTab === 'single') {
      const file = e.dataTransfer.files[0];
      if (file) {
        setSelectedFile(file);
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } else {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (t) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'single' && !selectedFile) {
      setError('Please choose a document to encrypt and upload.');
      return;
    }
    if (activeTab === 'bulk' && selectedFiles.length === 0) {
      setError('Please choose at least one file for bulk upload.');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'single') {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (title) formData.append('title', title);
        formData.append('categoryId', categoryId);
        if (folderId) formData.append('folderId', folderId);
        if (expiryDate) formData.append('expiryDate', expiryDate);
        if (notes) formData.append('notes', notes);
        tags.forEach((tag) => formData.append('tags', tag));

        await documentService.uploadDocument(formData);
      } else {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('files', file));
        formData.append('categoryId', categoryId);
        if (folderId) formData.append('folderId', folderId);

        await documentService.bulkUpload(formData);
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document. Please check file format and size.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Secure Vault Document Upload" maxWidth="max-w-2xl">
      {/* Upload mode tabs */}
      <div className="flex border-b border-slate-800 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`pb-2.5 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'single'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Single Document
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`pb-2.5 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'bulk'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" /> Bulk Upload
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={activeTab === 'bulk'}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-inner">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-sm font-semibold text-white">
            {activeTab === 'single'
              ? selectedFile
                ? selectedFile.name
                : 'Click or drag document to encrypt & upload'
              : selectedFiles.length > 0
              ? `${selectedFiles.length} files selected`
              : 'Click or drag multiple files to upload'}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Supported: PDF, JPG, PNG, DOC, DOCX up to 50 MB
          </p>
        </div>

        {activeTab === 'single' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Health Insurance Policy 2026"
              required
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        )}

        {/* Categories & Folders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Folder (Optional)
            </label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            >
              <option value="" className="bg-slate-900 text-white">
                No Folder (Root)
              </option>
              {folders.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeTab === 'single' && (
          <>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Tags (Press Enter to add)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"
                  >
                    #{t}
                    <button type="button" onClick={() => handleRemoveTag(t)}>
                      <X className="w-3 h-3 hover:text-white" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="e.g. Tax2026, Vital, Renewal"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Personal Notes (Encrypted)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                placeholder="Add confidential notes or recovery instructions..."
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm resize-none"
              />
            </div>
          </>
        )}

        {/* Security callout */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-emerald-500/20 flex items-center gap-3">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-slate-400">
            Files are validated with Apache Tika and encrypted on disk with <strong className="text-slate-200">AES-256-GCM</strong> authenticated cipher.
          </p>
        </div>

        {/* Submit */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 transition-all shadow-md shadow-emerald-500/20"
          >
            {loading ? 'Encrypting & Storing...' : 'Encrypt & Save Document'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
