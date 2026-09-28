import React from 'react';
import { X, Layers, Cpu, ShieldCheck, Database, GitBranch, Terminal, Award } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[85vh] bg-[#0d121c] border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System Architecture & Interview Guide</h3>
              <p className="text-xs text-slate-400">
                Design decisions, agent coordination protocols, and deterministic validation guarantees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Multi-Agent Architecture */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>1. Why Multi-Agent Architecture?</span>
            </div>
            <p>
              Rather than forcing a single LLM prompt to research flights, find hotels, evaluate crowd density, calculate complex sums, and assemble itineraries in one huge hallucination-prone generation, the system decouples responsibilities into specialized autonomous agents:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong className="text-white">Orchestrator Agent:</strong> Coordinates workflows, resolves constraint violations, manages fallback loops.</li>
              <li><strong className="text-white">Flight / Transport Agent:</strong> Evaluates route timing, layovers, and price scoring.</li>
              <li><strong className="text-white">Accommodation Agent:</strong> Evaluates stays by distance to attractions and rating scores.</li>
              <li><strong className="text-white">Activity Agent:</strong> Curates experiences respecting crowd density preferences and interests.</li>
              <li><strong className="text-white">Budget Validator:</strong> Deterministic calculation engine ensuring hard budget constraints.</li>
              <li><strong className="text-white">Itinerary Agent:</strong> Synthesizes chronological day-by-day schedules with realistic transit buffers.</li>
            </ul>
          </div>

          {/* Section 2: Deterministic Budget Engine */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>2. Deterministic Arithmetic (No LLM Math Hallucination)</span>
            </div>
            <p>
              LLMs are probabilistic token predictors notoriously unreliable at arithmetic. In this system, all budgeting, contingency margins (5%), local transit costs, and food allocations are executed in pure deterministic code (Python and TypeScript). If a budget overrun is detected, the Orchestrator initiates an automated fallback loop to request cheaper alternatives from specific agents up to a maximum of 3 iterations.
            </p>
          </div>

          {/* Section 3: Observability & Tracing */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Terminal className="w-4 h-4" />
              <span>3. End-to-End Observability</span>
            </div>
            <p>
              Every decision, parallel tool call, scoring computation, and budget optimization pass emits structured trace logs with timestamps and severity levels (<code>INFO</code>, <code>SUCCESS</code>, <code>WARNING</code>). This provides total transparency during engineering reviews and live portfolio demonstrations.
            </p>
          </div>

          {/* Section 4: Production Cloud & Database Readiness */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>4. Database Schema & API Contracts</span>
            </div>
            <p>
              The system includes full SQLAlchemy models (PostgreSQL compatible) and strict Pydantic v2 schemas for:
              <code className="block mt-1 font-mono text-slate-400">
                users, trips, trip_preferences, transport_options, accommodations, activities, itineraries, budget_breakdowns
              </code>
              A Docker Compose pipeline provisions PostgreSQL alongside the FastAPI backend and React frontend.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <Award className="w-4 h-4" />
            <span>Ready for AIML Portfolio & Technical Interviews</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
