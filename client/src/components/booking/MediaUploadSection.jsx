import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Video, Mic, FileText, Eye, Lightbulb, Paperclip } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MediaUploadSection = ({
  appointmentId,
  uploadedMedia = [],
  onMediaUpload,
  onMediaDelete,
  loading = false,
  disabled = false,
}) => {
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const ALLOWED_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/webp'],
    video: ['video/mp4', 'video/quicktime'],
    audio: ['audio/mpeg', 'audio/mp4'],
  };

  const ALL_ALLOWED_TYPES = Object.values(ALLOWED_TYPES).flat();
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  const MAX_FILES = 5;

  const canUploadMore = uploadedMedia.length < MAX_FILES;

  const validateFile = (file) => {
    if (!ALL_ALLOWED_TYPES.includes(file.type)) {
      toast.error('Unsupported file type. Allowed: JPG, PNG, WEBP (images), MP4, MOV (video), MP3, M4A (audio).');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      toast.error(`File too large: ${sizeMB}MB. Maximum: 25MB`);
      return false;
    }

    if (uploadedMedia.length >= MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} media files per appointment.`);
      return false;
    }

    return true;
  };

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!validateFile(file)) return;
    await onMediaUpload(file);
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files);
    e.target.value = '';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getMediaTypeFromMime = (mimeType) => {
    if (ALLOWED_TYPES.image.includes(mimeType)) return 'image';
    if (ALLOWED_TYPES.video.includes(mimeType)) return 'video';
    if (ALLOWED_TYPES.audio.includes(mimeType)) return 'audio';
    return null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-4 py-4 px-0">
      <div className="flex flex-col gap-1 text-left">
        <div className="flex items-center gap-1.5 text-neutral-500">
          <Paperclip size={14} className="text-neutral-500 shrink-0" />
          <label className="text-[10px] font-black uppercase tracking-widest">
            Condition Media (Optional)
          </label>
        </div>
        <p className="text-ui-xs text-neutral-600 font-medium leading-relaxed mt-1">
          Help your doctor prepare — share photos, videos, or audio describing your condition before the session. 
          <br />
          Max 5 files, 25MB each.
        </p>
      </div>

      {canUploadMore ? (
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-all duration-200 select-none
            ${dragging
              ? 'border-accent bg-accent/5 scale-[1.01]'
              : 'border-neutral-200 bg-neutral-50 hover:border-primary hover:bg-primary/2'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleInputChange}
            accept={ALL_ALLOWED_TYPES.join(',')}
            disabled={disabled || loading}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-2">
            <Upload
              size={24}
              className={`${dragging ? 'text-accent' : 'text-neutral-400'}`}
            />
            <div>
              <p className="text-ui-sm font-bold text-neutral-900">
                {dragging ? 'Drop files here' : 'Drag files or click to upload'}
              </p>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                JPG, PNG, WEBP, MP4, MOV, MP3, M4A
              </p>
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin mb-2">⏳</div>
                <p className="text-ui-xs font-bold text-neutral-600">Uploading...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-ui-sm font-bold text-yellow-900">Maximum files reached</p>
            <p className="text-[11px] text-yellow-800 font-medium mt-0.5">
              You've uploaded {MAX_FILES} media files. Delete one to upload more.
            </p>
          </div>
        </div>
      )}

      {uploadedMedia.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              Uploaded Media ({uploadedMedia.length}/{MAX_FILES})
            </span>
            <span className="text-[10px] font-bold text-success flex items-center gap-1">
              <CheckCircle size={14} /> Ready
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {uploadedMedia.map((media) => {
              const mediaType = getMediaTypeFromMime(media.fileType);
              return (
                <div
                  key={media._id || media.tempId}
                  className="relative group bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-level-1 transition-shadow"
                >
                  <div className="aspect-square bg-neutral-100 flex items-center justify-center relative overflow-hidden">
                    {mediaType === 'image' ? (
                      <img
                        src={media.cloudinaryUrl}
                        alt={media.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : mediaType === 'video' ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <Video size={32} className="text-white" />
                      </div>
                    ) : mediaType === 'audio' ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                        <Mic size={32} className="text-white" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <FileText size={32} className="text-neutral-400" />
                      </div>
                    )}

                    {media.cloudinaryUrl && (
                      <a
                        href={media.cloudinaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <Eye size={24} className="text-white" />
                      </a>
                    )}
                  </div>

                  <div className="p-2 border-t border-neutral-100">
                    <p className="text-[10px] font-bold text-neutral-900 truncate">
                      {media.fileName}
                    </p>
                    <p className="text-[9px] text-neutral-500 font-medium">
                      {formatFileSize(media.fileSize)}
                    </p>
                  </div>

                  <button
                    onClick={() => onMediaDelete(media._id || media.tempId)}
                    disabled={loading}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {uploadedMedia.length === 0 && (
        <div className="bg-[#F7FAFC] border border-neutral-200 rounded-lg p-4 flex gap-3 text-left">
          <Lightbulb size={16} className="text-[#D69E2E] shrink-0 mt-0.5" />
          <p className="text-ui-xs text-neutral-600 font-medium leading-relaxed">
            <strong>Tip:</strong> Uploading media helps your doctor understand your condition better and prepare 
            an effective treatment plan. Examples: photos of swelling, videos of movements, audio descriptions.
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaUploadSection;
