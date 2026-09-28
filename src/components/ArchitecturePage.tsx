import React from 'react';
import { ArrowLeft, Layers, Cpu, ShieldCheck, Database, Terminal, Award, GitBranch, ArrowRight } from 'lucide-react';
import { AppRoute } from './Navbar.tsx';

interface ArchitecturePageProps {
  onBack: () => void;
  onPlanTrip: () => void;
}

export const ArchitecturePage: React.FC<ArchitecturePageProps> = ({ onBack, onPlanTrip }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Layers className="w-4 h-4" />
            <span>Technical Deep Dive</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Multi-Agent System Architecture
          </h2>
          <p className="text-xs text-slate-400">
            Design principles, deterministic constraints, and technical interview explanations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <button
            onClick={onPlanTrip}
            className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Plan a Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Cpu className="w-4 h-4" />
            <span>1. Agent Specialization (Decoupled Roles)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Rather than forcing a single LLM prompt to search flights, hotels, crowd densities, calculate complex arithmetic, and output schedules all at once (which leads to context drift and hallucinated budgets), the architecture decouples tasks into specialized autonomous agents:
          </p>
          <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
            <li><strong className="text-white">Orchestrator:</strong> Workflow coordinator and fallback director</li>
            <li><strong className="text-white">Flight Agent:</strong> Multi-modal transit and duration scoring</li>
            <li><strong className="text-white">Hotel Agent:</strong> Distance, amenity, and review sentiment matching</li>
            <li><strong className="text-white">Activity Agent:</strong> Category diversity & crowd level filtering</li>
            <li><strong className="text-white">Itinerary Agent:</strong> Chronological time slot assembly</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>2. Deterministic Budget Gate (0% Math Hallucination)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            LLMs are autoregressive token predictors, not calculators. In this system, all financial calculations are executed by deterministic code:
          </p>
          <div className="p-3 rounded-xl bg-slate-950/80 font-mono text-[11px] text-slate-300 border border-slate-800/80 space-y-1">
            <div>Subtotal = Transport + Stays + Activities + Food + Transit + Misc</div>
            <div>Contingency = Round(Subtotal * 0.05)</div>
            <div>Total = Subtotal + Contingency</div>
            <div>WithinBudget = Total &lt;= UserBudget</div>
          </div>
          <p className="text-xs text-slate-400">
            If the budget is exceeded, the Orchestrator identifies the primary outlier and triggers a 3-pass automated fallback loop.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <GitBranch className="w-4 h-4" />
            <span>3. Provider Abstraction (Adapter Pattern)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            External booking APIs are separated behind provider interfaces (<code className="text-amber-300">TravelProvider</code>, <code className="text-cyan-300">AccommodationProvider</code>, <code className="text-emerald-300">ActivityProvider</code>).
          </p>
          <p className="text-xs text-slate-400">
            The app toggles seamlessly between reliable verified demo mode data and live third-party connectors (Amadeus, Skyscanner, Google Places) without altering core agent logic.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Database className="w-4 h-4" />
            <span>4. Production Cloud & Schema Design</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The project includes full SQLAlchemy relational models for PostgreSQL, strict Pydantic v2 validation contracts, and Docker Compose configuration.
          </p>
          <p className="text-xs text-slate-400">
            Includes 15 automated unit tests covering scoring algorithms, nights math, and constraint loops with a 100% pass rate.
          </p>
        </div>
      </div>

      {/* Interview Q&A Section */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
          <Award className="w-5 h-5" />
          <span>Top Technical Interview Takeaways</span>
        </div>
        
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <strong className="text-white">Q: How do you prevent LLMs from inventing fake prices?</strong>
            <p className="text-slate-400">
              A: Agents are forbidden from free-form price generation. Prices are retrieved strictly through provider service layers, normalized into typed schemas, and then evaluated using deterministic scoring weights.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <strong className="text-white">Q: Why did you implement selective component regeneration?</strong>
            <p className="text-slate-400">
              A: If a user likes their flight and itinerary but wants a cheaper hotel, regenerating the entire trip produces cognitive fatigue and wastes LLM tokens. Targeted regeneration only invokes the Hotel Agent and Budget Validator while preserving the rest of the plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
