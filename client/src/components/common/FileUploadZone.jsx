import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, X, CheckCircle2, AlertTriangle } from 'lucide-react';

const FileUploadZone = ({
  label,
  accept = 'image/*,application/pdf',
  maxSizeMB = 5,
  onFileSelect,
  selectedFile = null,
  previewUrl = null,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Revoke object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  // Handle local file selection
  const processFile = (file) => {
    setError(null);

    if (!file) return;

    // Check size limit
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setError(`File size exceeds the ${maxSizeMB}MB limit.`);
      return;
    }

    // Check file type matches accept string
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    const isAccepted = acceptedTypes.some((type) => {
      if (type.endsWith('/*')) {
        // e.g. image/* -> matches image/png, image/jpeg
        const prefix = type.slice(0, -2);
        return fileType.startsWith(prefix);
      }
      if (type.startsWith('.')) {
        // e.g. .pdf -> matches name ending in .pdf
        return fileName.endsWith(type);
      }
      return fileType === type;
    });

    if (!isAccepted) {
      setError('Invalid file type. Only JPEG, PNG, and PDF files are allowed.');
      return;
    }

    // If file is an image, generate a local preview URL
    if (fileType.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
    } else {
      setObjectUrl(null);
    }

    onFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleZoneClick = () => {
    fileInputRef.current.click();
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine what preview to render
  const renderPreview = () => {
    // If we have a local selected file
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        return (
          <div className="relative mt-2 w-28 h-28 rounded-lg overflow-hidden border border-slate-200">
            <img src={objectUrl} alt="local preview" className="w-full h-full object-cover" />
          </div>
        );
      } else {
        // PDF or other doc
        return (
          <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm">
            <FileText size={20} className="text-red-500 shrink-0" />
            <span className="truncate max-w-[200px] font-medium">{selectedFile.name}</span>
            <span className="text-sm text-slate-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
        );
      }
    }

    // If no local file but we have a remote preview URL (existing doc)
    if (previewUrl) {
      const isPdf = previewUrl.toLowerCase().endsWith('.pdf') || previewUrl.includes('/raw/upload/');
      if (!isPdf) {
        return (
          <div className="relative mt-2 w-28 h-28 rounded-lg overflow-hidden border border-slate-200">
            <img src={previewUrl} alt="remote preview" className="w-full h-full object-cover" />
          </div>
        );
      } else {
        return (
          <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm">
            <FileText size={20} className="text-red-500 shrink-0" />
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-medium hover:underline truncate max-w-[220px]"
              onClick={(e) => e.stopPropagation()}
            >
              View Uploaded PDF Document
            </a>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="w-full">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-primary bg-blue-50/30'
            : selectedFile || previewUrl
            ? 'border-emerald-200 bg-emerald-50/10 hover:border-emerald-300'
            : 'border-slate-300 bg-white hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile || previewUrl ? (
          <div className="flex flex-col items-center">
            <CheckCircle2 size={36} className="text-emerald-500 mb-2" />
            <p className="text-sm font-normal text-emerald-800">File Selected Successfully</p>
            {renderPreview()}
            <button
              type="button"
              onClick={handleRemove}
              className="mt-4 inline-flex items-center gap-1 text-sm font-normal text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full transition-all"
            >
              <X size={12} /> Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud
              size={36}
              className={`mb-2 transition-transform duration-200 ${
                isDragActive ? 'text-primary scale-110' : 'text-slate-400'
              }`}
            />
            <p className="text-sm font-medium text-slate-600">
              Drag & drop file here, or <span className="text-primary font-normal">browse</span>
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Supports JPEG, PNG, PDF up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-sm text-rose-600 font-medium">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
