import React, { useState, useEffect, useCallback } from 'react';
import { Video, Mic, FileText, Eye, Download, Info } from 'lucide-react';
import { getAppointmentMedia } from '../../api/appointmentMedia.api';
import Modal from '../common/Modal';
import Button from '../common/Button';

const AppointmentMediaViewer = ({ appointmentId, showEmptyState = true }) => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePreview, setActivePreview] = useState(null); // { url, type, name }

  const fetchMedia = useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    try {
      const response = await getAppointmentMedia(appointmentId);
      if (response.success && response.data) {
        setMediaList(response.data);
      }
    } catch (err) {
      console.error('Failed to load appointment media:', err);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMediaTypeFromMime = (mimeType) => {
    if (!mimeType) return 'file';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  };

  if (loading) {
    return (
      <div className="py-4 text-left">
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">
          Appointment Media
        </span>
        <div className="text-ui-xs font-bold text-neutral-500 uppercase tracking-widest animate-pulse">
          Loading attached media files...
        </div>
      </div>
    );
  }

  if (mediaList.length === 0) {
    if (!showEmptyState) return null;
    return (
      <div className="py-4 text-left">
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">
          Appointment Media
        </span>
        <div className="text-ui-xs text-neutral-400 font-medium italic">
          No media files uploaded for this appointment.
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 text-left flex flex-col gap-3">
      <div>
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
          Attached Media Files ({mediaList.length})
        </span>
        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mt-0.5">
          Patient uploaded photos, clinical videos, or audio recordings.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-1">
        {mediaList.map((media) => {
          const type = getMediaTypeFromMime(media.fileType);
          const isUploaderPatient = media.uploadedBy === 'patient';

          return (
            <div
              key={media._id}
              className="bg-white border border-neutral-200 rounded-lg overflow-hidden flex flex-col hover:shadow-level-1 transition-all group"
            >
              {/* Media Preview Box */}
              <div className="aspect-video bg-neutral-100 flex items-center justify-center relative overflow-hidden border-b border-neutral-150">
                {type === 'image' ? (
                  <img
                    src={media.cloudinaryUrl}
                    alt={media.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : type === 'video' ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <Video size={28} className="text-white" />
                  </div>
                ) : type === 'audio' ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-indigo-900 flex items-center justify-center">
                    <Mic size={28} className="text-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center">
                    <FileText size={28} className="text-neutral-500" />
                  </div>
                )}

                {/* Overlay Action */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setActivePreview({ url: media.cloudinaryUrl, type, name: media.fileName })}
                    className="bg-white hover:bg-neutral-100 text-neutral-900 p-2 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    title="View file"
                  >
                    <Eye size={16} />
                  </button>
                  <a
                    href={media.cloudinaryUrl}
                    download={media.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white hover:bg-neutral-100 text-neutral-900 p-2 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
                    title="Download file"
                  >
                    <Download size={16} />
                  </a>
                </div>

                {/* Uploader Indicator Badge */}
                <span className={`absolute top-2 left-2 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md text-white shadow-sm ${
                  isUploaderPatient ? 'bg-primary' : 'bg-success'
                }`}>
                  {media.uploadedBy}
                </span>
              </div>

              {/* Media Details */}
              <div className="p-3 flex flex-col gap-1 select-none flex-grow">
                <p className="text-ui-sm font-bold text-neutral-900 truncate" title={media.fileName}>
                  {media.fileName}
                </p>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium">
                  <span>{formatFileSize(media.fileSize)}</span>
                  <span>{new Date(media.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                {media.description && (
                  <p className="text-[10px] text-neutral-600 italic mt-1 border-t border-neutral-100 pt-1 leading-snug line-clamp-2">
                    "{media.description}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Video / Audio Preview Modal */}
      {activePreview && (
        <Modal
          isOpen={!!activePreview}
          onClose={() => setActivePreview(null)}
          title={activePreview.name.toUpperCase()}
        >
          <div className="flex flex-col items-center gap-4">
            {activePreview.type === 'image' && (
              <div className="w-full bg-neutral-950 rounded-lg overflow-hidden flex items-center justify-center max-h-[70vh]">
                <img
                  src={activePreview.url}
                  alt={activePreview.name}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
            )}

            {activePreview.type === 'video' && (
              <div className="w-full bg-neutral-950 rounded-lg overflow-hidden flex items-center justify-center max-h-[70vh]">
                <video
                  src={activePreview.url}
                  controls
                  className="max-w-full max-h-[60vh]"
                  autoPlay
                />
              </div>
            )}

            {activePreview.type === 'audio' && (
              <div className="w-full py-8 px-4 bg-neutral-50 rounded-lg flex flex-col items-center justify-center border border-neutral-200">
                <Mic size={48} className="text-primary mb-4 animate-bounce" />
                <audio
                  src={activePreview.url}
                  controls
                  className="w-full max-w-md"
                  autoPlay
                />
              </div>
            )}

            {activePreview.type === 'file' && (
              <div className="w-full py-8 px-4 bg-neutral-50 rounded-lg flex flex-col items-center justify-center border border-neutral-200">
                <FileText size={48} className="text-neutral-400 mb-2" />
                <p className="text-ui-sm text-neutral-600 font-bold uppercase tracking-wide mb-4">
                  Preview not available for this file type
                </p>
                <a
                  href={activePreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="primary" fullWidth>
                    Open in New Tab
                  </Button>
                </a>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <a
                href={activePreview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="secondary" fullWidth>
                  Open Original
                </Button>
              </a>
              <Button
                variant="ghost"
                onClick={() => setActivePreview(null)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AppointmentMediaViewer;
