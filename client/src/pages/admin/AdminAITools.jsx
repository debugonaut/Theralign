import React, { useState } from 'react';
import { triggerBatchSummariesAPI } from '../../api/ai.api';
import toast from 'react-hot-toast';
import SectionHeader from '../../components/common/SectionHeader';
import Card from '../../components/common/Card';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const AdminAITools = () => {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleBatchGenerate = async () => {
    setGenerating(true);
    setResult(null);
    setError(null);
    const toastId = toast.loading('Generating profile summaries sequentially...');

    try {
      const res = await triggerBatchSummariesAPI();
      
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.processed === 0) {
          toast.success('All eligible verified clinician profiles are already summarized!', { id: toastId });
        } else {
          toast.success(`Successfully compiled summaries for ${res.data.successful} doctors!`, { id: toastId });
        }
      } else {
        setError(res.message || 'Batch summary generation pipeline failed.');
        toast.error('Batch summary compilation failed.', { id: toastId });
      }
    } catch (err) {
      setError('A network exception occurred while processing the request.');
      toast.error('Network exception occurred during pipeline execution.', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 select-none text-neutral-900 bg-white">
      {/* Page Title */}
      <SectionHeader
        title="AI TOOLS"
        subtitle="PLATFORM-WIDE ARTIFICIAL INTELLIGENCE TEXT COMPILATION PIPELINES AND CACHE HEALTH INDEX."
      />

      {/* Main Container */}
      <div className="space-y-6 text-left">
        <span className="text-sm font-semibold text-neutral-500 uppercase tracking-widest block pb-2 border-b border-swiss-gray-250">
          DOCTOR PROFILE SUMMARIES
        </span>

        {/* Bordered Card, gray surface, repeating diagonal lines */}
        <Card
          surface="gray"
          pattern="diagonal"
          className="border-2 border-neutral-900 rounded-none shadow-none p-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* Left Description and Trigger (7 columns) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-ui-sm font-semibold text-accent uppercase tracking-widest block mb-2">
                  GENERATE AI SUMMARIES
                </span>
                <p className="text-ui-lg text-neutral-900 font-medium leading-relaxed">
                  Automatically generate high-quality clinical professional summaries for all verified doctors who do not yet have one. Processes up to 50 clinician profiles per sequential batch.
                </p>
              </div>

              <div className="border-t border-swiss-gray-250 pt-4">
                <button
                  onClick={handleBatchGenerate}
                  disabled={generating}
                  className="px-6 py-3.5 bg-neutral-900 text-white border-2 border-neutral-900 text-sm font-semibold uppercase tracking-widest hover:bg-neutral-900 transition-all select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {generating ? 'PROCESSING PIPELINE...' : 'GENERATE SUMMARIES →'}
                </button>
              </div>
            </div>

            {/* Right Execution Stats (5 columns) */}
            <div className="lg:col-span-5 w-full max-w-[1200px]">
              {result ? (
                <div className="border-2 border-neutral-900 bg-white p-6 space-y-4 animate-fade-in">
                  <span className="text-sm font-semibold text-success uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-neutral-200">
                    <CheckCircle2 className="w-4 h-4" /> PIPELINE RUN COMPLETE
                  </span>
                  
                  {/* Stats adjacent cells row */}
                  <div className="flex border border-neutral-900 divide-x border-collapse text-center">
                    <div className="flex-1 p-4 bg-neutral-50">
                      <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider block">PROCESSED</span>
                      <span className="text-2xl font-semibold text-neutral-900 swiss-numeric block mt-1">{result.processed}</span>
                    </div>
                    <div className="flex-1 p-4 bg-neutral-50">
                      <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider block">SUCCESSFUL</span>
                      <span className="text-2xl font-semibold text-success swiss-numeric block mt-1">{result.successful}</span>
                    </div>
                    <div className="flex-1 p-4 bg-neutral-50">
                      <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider block">FAILED</span>
                      <span className={`text-2xl font-black swiss-numeric block mt-1 ${
                        result.failed > 0 ? 'text-accent' : 'text-neutral-900'
                      }`}>
                        {result.failed}
                      </span>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="border-2 border-accent bg-white p-6 space-y-2 animate-fade-in">
                  <span className="text-sm font-semibold text-accent uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-neutral-200">
                    <AlertTriangle className="w-4 h-4" /> PIPELINE EXECUTION FAILED
                  </span>
                  <p className="text-sm text-swiss-gray-650 leading-relaxed font-medium">
                    {error}
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-500 p-6 text-center text-neutral-500 text-sm font-medium uppercase tracking-widest h-full flex flex-col justify-center items-center">
                  PIPELINE RUN STATISTICS WILL APPEAR UPON BATCH EXECUTION.
                </div>
              )}
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAITools;
