import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  School,
  Users,
  TrendingUp,
  AlertTriangle,
  Award,
  Search,
  CheckCircle2,
  Plane,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { SAMPLE_COHORT_DATA } from '../../data/classroomCohortData';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { TeamLogo } from '../common/TeamLogo';

interface ClassroomCockpitProps {
  onBackToHub: () => void;
}

export const ClassroomCockpit: React.FC<ClassroomCockpitProps> = ({ onBackToHub }) => {
  const cohort = SAMPLE_COHORT_DATA;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = cohort.students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.archetype.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 select-none text-left">
      {/* Top Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card rounded-3xl p-6 border border-white/10 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-telemetry px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
              INSTITUTIONAL COCKPIT · B2B2C
            </span>
            <span className="label-telemetry px-2 py-0.5 rounded-full bg-white/06 text-zinc-300 border border-white/10">
              {cohort.institution}
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
            Educator Flight Telemetry: {cohort.cohortName}
          </h1>
          <p className="text-xs text-[#A7ABB4]">
            Real-time cohort performance analytics, failure traps, and learning progress tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <TeamLogo size="sm" showText={true} />
          <Button
            variant="secondary"
            size="sm"
            onClick={onBackToHub}
          >
            Return to Hub
          </Button>
        </div>
      </div>

      {/* Primary Cohort Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Students */}
        <div className="glass-card p-4 rounded-2xl border border-[#27272A]">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Active Cadets</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-numeric text-white">
            {cohort.totalStudents}
          </div>
          <span className="text-[10px] text-zinc-500 block">Class Enrollment</span>
        </div>

        {/* Average Pre-IQ */}
        <div className="glass-card p-4 rounded-2xl border border-[#27272A]">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <Award className="w-4 h-4 text-zinc-400" />
            <span>Avg Baseline IQ</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-numeric text-zinc-300">
            {cohort.averagePreIQ} / 100
          </div>
          <span className="text-[10px] text-zinc-500 block">Pre-Flight Test</span>
        </div>

        {/* Average Post-IQ */}
        <div className="glass-card p-4 rounded-2xl border border-[#27272A]">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
            <span>Avg Post-Sim IQ</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-numeric text-[#22C55E]">
            {cohort.averagePostIQ} / 100
          </div>
          <span className="text-[10px] text-zinc-500 block">Post-Simulator Run</span>
        </div>

        {/* Cohort Improvement Delta */}
        <div className="glass-card p-4 rounded-2xl border border-[#22C55E]/40 bg-[#22C55E]/10">
          <div className="flex items-center gap-1.5 text-[#22C55E] text-xs font-bold mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Learning Gain</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-numeric text-[#22C55E]">
            +{cohort.averageDeltaPercent}% Delta
          </div>
          <span className="text-[10px] text-[#22C55E]/80 block">Empirical Proof</span>
        </div>
      </div>

      {/* Failure Trap & Risk Distribution Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Failure Trap Alert */}
        <GlassCard className="p-5 rounded-3xl border border-amber-500/40 bg-amber-950/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>CRITICAL COHORT BLIND SPOT DETECTED</span>
          </div>
          <h3 className="text-base font-black text-white">
            {cohort.topFailureTrap}
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Telemetry indicates that <strong>68% of young adults</strong> fall for unverified Telegram crypto pump groups and predatory instant loan apps during their initial simulation run. FinQuest’s Flight Coach successfully corrected this on subsequent retries.
          </p>
          <div className="pt-2 text-[11px] font-bold text-amber-300">
            💡 Recommended Lecture Topic: Digital Financial Fraud & RBI Lending Guidelines.
          </div>
        </GlassCard>

        {/* Risk Distribution Card */}
        <GlassCard className="p-5 rounded-3xl border border-[#27272A] space-y-3">
          <span className="text-xs font-bold text-zinc-400 block">
            Cohort Financial Risk Heatmap:
          </span>

          <div className="space-y-2 font-numeric text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-[#22C55E]">Low Risk / Supercruise ({cohort.riskDistribution.lowRisk} students)</span>
                <span className="text-[#22C55E]">57%</span>
              </div>
              <div className="h-2 bg-[#18181D] rounded-full overflow-hidden">
                <div className="h-full bg-[#22C55E] rounded-full" style={{ width: '57%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-amber-400">Moderate Drag ({cohort.riskDistribution.moderateRisk} students)</span>
                <span className="text-amber-400">26%</span>
              </div>
              <div className="h-2 bg-[#18181D] rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '26%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-orange-400">High Risk ({cohort.riskDistribution.highRisk} students)</span>
                <span className="text-orange-400">12%</span>
              </div>
              <div className="h-2 bg-[#18181D] rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-red-400">Critical Debt Spiral ({cohort.riskDistribution.criticalDebt} students)</span>
                <span className="text-red-400">5%</span>
              </div>
              <div className="h-2 bg-[#18181D] rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Flight League Leaderboard Table */}
      <GlassCard className="p-5 sm:p-6 rounded-3xl border border-[#27272A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF5E1E]" />
              <span>Flight League: Ranked by Resilience & IQ Improvement</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Students ranked by learning growth rather than raw initial wealth
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student or archetype..."
              className="bg-white/05 border border-white/12 text-xs text-white placeholder-zinc-500 pl-8 pr-3 py-1.5 rounded-xl outline-none focus:border-[#FF5E1E] transition-colors"
            />
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#27272A] text-zinc-400 uppercase font-numeric text-[10px]">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Pre-Flight IQ</th>
                <th className="py-2.5 px-3">Post-Flight IQ</th>
                <th className="py-2.5 px-3">Learning Delta</th>
                <th className="py-2.5 px-3">Decision DNA</th>
                <th className="py-2.5 px-3">Flight Status</th>
                <th className="py-2.5 px-3 text-right">Resilience Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/50 font-numeric">
              {filteredStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-bold text-zinc-500">#{idx + 1}</td>
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 text-[11px] flex items-center justify-center text-zinc-300">
                      {student.name.charAt(0)}
                    </span>
                    <span>{student.name}</span>
                  </td>
                  <td className="py-3 px-3 text-zinc-400">{student.preFlightIQ}</td>
                  <td className="py-3 px-3 font-bold text-white">{student.postFlightIQ}</td>
                  <td className="py-3 px-3 font-black text-[#22C55E]">
                    +{student.deltaIQ} pts
                  </td>
                  <td className="py-3 px-3 text-zinc-300">{student.archetype}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        student.flightStatus === 'smooth'
                          ? 'bg-[#22C55E]/15 text-[#22C55E]'
                          : student.flightStatus === 'turbulent'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {student.flightStatus === 'smooth' ? 'Smooth Landing' : student.flightStatus === 'turbulent' ? 'Turbulent' : 'Crash Landing'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-[#FF5E1E]">
                    {student.resilienceScore}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

