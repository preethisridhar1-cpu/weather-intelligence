import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { AeroSightReport } from '../types';
import {
  Sparkles,
  ShieldAlert,
  Clock,
  Shirt,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  FileText,
  LayoutDashboard,
  HeartPulse,
} from 'lucide-react';

interface AeroSightReportCardProps {
  report: AeroSightReport;
}

export const AeroSightReportCard: React.FC<AeroSightReportCardProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'markdown'>('dashboard');

  const handleCopy = () => {
    navigator.clipboard.writeText(report.rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const feasibility = report.personalImpact.activityFeasibility;
  const feasibilityScore = report.personalImpact.feasibilityScore || 75;

  const getFeasibilityConfig = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'excellent':
        return {
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          icon: CheckCircle2,
          bgGlow: 'from-emerald-500/20 to-teal-500/5',
          meterBg: 'bg-emerald-500',
        };
      case 'poor':
        return {
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          icon: XCircle,
          bgGlow: 'from-rose-500/20 to-red-500/5',
          meterBg: 'bg-rose-500',
        };
      default:
        return {
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          icon: AlertTriangle,
          bgGlow: 'from-amber-500/20 to-orange-500/5',
          meterBg: 'bg-amber-500',
        };
    }
  };

  const feasMeta = getFeasibilityConfig(feasibility);
  const FeasIcon = feasMeta.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                AeroSight AI Advisory Engine
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ACTIVE REPORT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Context: <span className="text-slate-200 font-semibold">{report.personalImpact.activityName}</span>
            </p>
          </div>
        </div>

        {/* View Switcher & Copy Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Interactive
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'markdown'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Strict Response Format
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Copy Strict Response Text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Report
              </>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'markdown' ? (
        /* Strict Raw Markdown View Mode */
        <div className="p-6 bg-slate-950 font-mono text-sm text-slate-200 space-y-4 overflow-x-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              Strict Response Output Format
            </span>
            <span className="text-[11px] text-slate-500">Formated as requested</span>
          </div>
          <div className="markdown-body space-y-4">
            <Markdown>{report.rawMarkdown}</Markdown>
          </div>
        </div>
      ) : (
        /* Interactive Dashboard Cards View */
        <div className="p-6 space-y-6 bg-slate-900/60">
          {/* Section 1: Weather Snapshot */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌤️</span>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Weather Snapshot
                </h4>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                {report.snapshot.condition}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-slate-400">Location & Timeframe:</span>
                <p className="text-sm font-bold text-slate-100 mt-0.5">
                  {report.snapshot.locationAndTime}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Temperature & Feel:</span>
                <p className="text-sm font-bold text-cyan-300 mt-0.5">
                  {report.snapshot.temperature}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-2">
              <span className="text-cyan-400 font-bold">Key Metrics:</span>
              <span>{report.snapshot.keyMetricsSummary}</span>
            </div>
          </div>

          {/* Section 2: Personal Impact & Advisory */}
          <div className={`bg-gradient-to-br ${feasMeta.bgGlow} border border-slate-800 rounded-xl p-5 space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Personal Impact & Advisory
                </h4>
              </div>

              {/* Feasibility Rating Badge */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${feasMeta.color}`}>
                <FeasIcon className="w-4 h-4" />
                <span>Feasibility: {feasibility}</span>
              </div>
            </div>

            {/* Feasibility Meter Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Activity Compatibility Index</span>
                <span className="text-slate-200">{feasibilityScore}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${feasMeta.meterBg}`}
                  style={{ width: `${feasibilityScore}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Outfit Recommendation */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Shirt className="w-4 h-4 text-cyan-400" />
                  <span>Outfit Recommendation</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {report.personalImpact.outfitRecommendation}
                </p>
              </div>

              {/* Health & Safety Notice */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  <span>Health & Safety Notice</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {report.personalImpact.healthNotice}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Optimal Time Windows */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <span className="text-xl">⏱️</span>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Optimal Time Windows
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(report.optimalTimeWindows || []).map((win, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> {win.timeRange}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        win.status === 'optimal'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : win.status === 'acceptable'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {win.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{win.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Weather Risk & Mitigation */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-rose-500/20 pb-3 text-rose-300">
              <span className="text-xl">⚠️</span>
              <h4 className="text-sm font-bold uppercase tracking-wider">
                Weather Risk & Mitigation
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">
                  Potential Risks:
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {report.weatherRisk.potentialRisks}
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-cyan-400 font-semibold block mb-1">
                  Suggested Action:
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {report.weatherRisk.suggestedAction}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
