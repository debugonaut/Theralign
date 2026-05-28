import React, { useState } from 'react';
import { triggerBatchSummariesAPI } from '../../api/ai.api';
import { Sparkles, Loader2, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAITools = () => {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleBatchGenerate = async () => {
    setGenerating(true);
    setResult(null);
    setError(null);
    const toastId = toast.loading('Generating profile summaries in sequential batches...');

    try {
      const res = await triggerBatchSummariesAPI();
      
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.processed === 0) {
          toast.success('All eligible verified doctor profiles are already summarized!', { id: toastId });
        } else {
          toast.success(`Successfully summarized profiles for ${res.data.successful} doctors!`, { id: toastId });
        }
      } else {
        setError(res.message || 'Batch summary generation failed.');
        toast.error('Batch summary generation failed', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      setError('A network exception occurred while processing the request.');
      toast.error('A network error occurred during batch generation', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 space-y-8 select-none bg-slate-900 text-slate-100 min-h-screen">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Sparkles className="text-primary animate-pulse" size={24} />
          AI Operational Control Console
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Administer platform-wide AI generation pipelines, trigger sequential profiling summaries, and audit cache coverage states.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Control Card */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-left space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Doctor Profile Summarizer</h3>
              <p className="text-xs text-slate-500 font-medium">Scans the directory for verified doctors lacking summaries and triggers copywriting pipelines.</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Pipeline Specifications</h4>
            <ul className="text-xs text-slate-450 space-y-2 list-disc list-inside font-medium leading-relaxed">
              <li>Processes doctors in **sequential batches of 50** to respect OpenAI API rate limits.</li>
              <li>Applies a mandatory **300ms throttle delay** between active model completions.</li>
              <li>Only processes verified clinician profiles with biographies containing at least **30 characters**.</li>
              <li>Persists outputs inside the database (`aiSummary` cache) to avoid duplicate API fees.</li>
            </ul>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleBatchGenerate}
              disabled={generating}
              className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-extrabold text-xs tracking-wider uppercase inline-flex items-center gap-2 select-none cursor-pointer shadow-lg shadow-primary/10 transition-all"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white text-white" />
                  Trigger Batch Summaries
                </>
              )}
            </button>
          </div>

          {/* Execution outputs */}
          {result && (
            <div className="mt-6 border border-slate-800 bg-slate-900/40 rounded-2xl p-6 text-left space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-emerald-400 w-5 h-5" />
                <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Pipeline Execution Complete</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Processed</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">{result.processed}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Successful</span>
                  <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">{result.successful}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Failed</span>
                  <span className="text-2xl font-extrabold text-rose-500 mt-1 block">{result.failed}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex gap-3 text-left">
              <AlertTriangle className="text-rose-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Execution Pipeline Aborted</h5>
                <p className="text-xs text-rose-300 font-medium mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Info Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-left space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-800">
            ✨ Platform Insights
          </h3>

          <div className="space-y-4">
            <div>
              <h5 className="text-xs font-bold text-slate-200">Real-time Caching Mode</h5>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                By default, the platform lazily compiles a clinician summary on their first public profile visit. Caching eliminates redundant network round-trips.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-200">Legal Compliance Oversight</h5>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Platform disclaimers are hardcoded directly into clinical modules to prevent model hallucinatory wording, mitigating regulatory liability.
              </p>
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
              <p className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wide">Developer Tip</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">
                To reset cached bio descriptions during testing, you can delete specific fields directly from Mongoose arrays or update profiles via MongoDB Atlas console channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAITools;
