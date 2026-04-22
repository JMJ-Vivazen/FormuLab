import { useStore } from '../store/useStore'
import { StatusBadge } from '../components/StatusBadge'
import { ScoreRing } from '../components/ScoreRing'
import { Link } from 'react-router-dom'
import { FlaskConical, TestTube2, MessageSquare, TrendingUp, Clock, CheckCircle2, AlertCircle, GitMerge, Package, Lock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { GateStage } from '../types'

const GATE_STAGES: { stage: GateStage; label: string }[] = [
  { stage: 'G0', label: 'Intake' },
  { stage: 'G1', label: 'Feasibility' },
  { stage: 'G2', label: 'Design Inputs' },
  { stage: 'G3', label: 'Prototype' },
  { stage: 'G4', label: 'Freeze' },
  { stage: 'G5', label: 'Tech Transfer' },
  { stage: 'G6', label: 'Launch Ready' },
]

export function Dashboard() {
  const { projects, formulations, samples, feedback, gateReviews, materials } = useStore()

  const activeProjects = projects.filter((p) => p.status === 'active')
  const inTestingForms = formulations.filter((f) => f.status === 'in-testing')
  const pendingFeedback = samples.filter((s) => s.status === 'in-review')
  const avgScore = feedback.length
    ? (feedback.reduce((sum, f) => sum + f.overallScore, 0) / feedback.length).toFixed(1)
    : '—'
  const frozenFormulas = formulations.filter((f) => f.frozen).length
  const materialsPendingCoa = materials.filter((m) => m.coaStatus === 'pending' || m.coaStatus === 'received').length
  const openConditions = gateReviews.filter((g) => g.decision === 'GO with Conditions' && g.conditionDueDate).length
  const holdProjects = projects.filter((p) =>
    gateReviews.some((g) => g.projectId === p.id && g.decision === 'HOLD')
  ).length

  const recentActivity = [
    ...formulations.map((f) => ({
      id: f.id, type: 'formulation' as const,
      label: `${f.versionLabel} — ${f.name}`,
      project: projects.find((p) => p.id === f.projectId)?.name ?? '?',
      date: f.createdAt,
      status: f.status,
      link: `/projects/${f.projectId}`,
    })),
    ...feedback.map((fb) => ({
      id: fb.id, type: 'feedback' as const,
      label: `Feedback from ${fb.reviewerName}`,
      project: projects.find((p) => p.id === fb.projectId)?.name ?? '?',
      date: fb.date,
      status: 'submitted' as const,
      link: `/feedback`,
    })),
    ...gateReviews.map((g) => ({
      id: g.id, type: 'gate' as const,
      label: `${g.gate} — ${g.decision}`,
      project: projects.find((p) => p.id === g.projectId)?.name ?? '?',
      date: g.createdAt,
      status: g.decision,
      link: `/projects/${g.projectId}`,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  const stats = [
    { label: 'Active Projects', value: activeProjects.length, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'In Testing', value: inTestingForms.length, icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Awaiting Feedback', value: pendingFeedback.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg Feedback Score', value: avgScore, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Frozen Formulas', value: frozenFormulas, icon: Lock, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Open Conditions', value: openConditions, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Projects on HOLD', value: holdProjects, icon: GitMerge, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Materials Pending COA', value: materialsPendingCoa, icon: Package, color: 'text-slate-600', bg: 'bg-slate-50' },
  ]

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-400 mt-1">R&D QMS pipeline overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
            <div className="text-sm text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Stage-Gate Pipeline */}
      <div className="mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Stage-Gate Pipeline</h2>
          <Link to="/projects" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View projects →</Link>
        </div>
        <div className="grid grid-cols-7 divide-x divide-slate-100">
          {GATE_STAGES.map(({ stage, label }) => {
            const count = projects.filter((p) => p.stage === stage).length
            const projectsAtStage = projects.filter((p) => p.stage === stage)
            return (
              <div key={stage} className="px-3 py-4 text-center">
                <div className="text-xs font-bold text-slate-600 mb-0.5">{stage}</div>
                <div className="text-xs text-slate-400 mb-3">{label}</div>
                <div className={`text-2xl font-bold mb-2 ${count > 0 ? 'text-indigo-700' : 'text-slate-300'}`}>{count}</div>
                <div className="space-y-1">
                  {projectsAtStage.map((p) => (
                    <Link key={p.id} to={`/projects/${p.id}`} className="block text-xs text-indigo-600 hover:text-indigo-800 truncate" title={p.name}>
                      {p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-700">Active Projects</h2>
              <Link to="/projects" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View all →</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {activeProjects.length === 0 && (
                <p className="px-5 py-8 text-center text-slate-400 text-sm">No active projects</p>
              )}
              {activeProjects.map((proj) => {
                const projForms = formulations.filter((f) => f.projectId === proj.id)
                const latestForm = projForms.sort((a, b) => b.versionNumber - a.versionNumber)[0]
                const projFeedback = feedback.filter((f) => f.projectId === proj.id)
                const avgProjScore = projFeedback.length
                  ? projFeedback.reduce((s, f) => s + f.overallScore, 0) / projFeedback.length
                  : 0
                const latestGate = gateReviews
                  .filter((g) => g.projectId === proj.id)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

                return (
                  <Link key={proj.id} to={`/projects/${proj.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
                      <FlaskConical size={18} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors truncate">{proj.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {proj.projectCode} · {proj.category} · {projForms.length} version{projForms.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={proj.stage} />
                      {proj.formulaFrozen && (
                        <span className="flex items-center gap-1 text-xs text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                          <Lock size={10} /> Frozen
                        </span>
                      )}
                      {latestGate && <StatusBadge status={latestGate.decision} />}
                      {latestForm && <StatusBadge status={latestForm.status} />}
                      {avgProjScore > 0 && <ScoreRing score={parseFloat(avgProjScore.toFixed(1))} size={44} />}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50">
              <h2 className="font-semibold text-slate-700">Recent Activity</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {recentActivity.map((item) => (
                <Link key={item.id} to={item.link} className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className={`mt-0.5 shrink-0 ${
                    item.type === 'formulation' ? 'text-indigo-400' :
                    item.type === 'gate' ? 'text-violet-400' : 'text-green-400'
                  }`}>
                    {item.type === 'formulation' ? <FlaskConical size={14} /> :
                     item.type === 'gate' ? <GitMerge size={14} /> :
                     <MessageSquare size={14} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-slate-700 font-medium truncate">{item.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.project}</div>
                    <div className="text-xs text-slate-300 mt-0.5">{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formulation Status Pipeline */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Formulation Status Pipeline</h2>
          <Link to="/formulations" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View all →</Link>
        </div>
        <div className="grid grid-cols-5 divide-x divide-slate-100">
          {(['draft', 'in-testing', 'approved', 'rejected', 'archived'] as const).map((status) => {
            const count = formulations.filter((f) => f.status === status).length
            const icons = {
              draft: <FlaskConical size={16} className="text-slate-400" />,
              'in-testing': <TestTube2 size={16} className="text-blue-500" />,
              approved: <CheckCircle2 size={16} className="text-green-500" />,
              rejected: <AlertCircle size={16} className="text-red-500" />,
              archived: <Clock size={16} className="text-gray-400" />,
            }
            return (
              <div key={status} className="px-5 py-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">{icons[status]}<StatusBadge status={status} /></div>
                <div className="text-2xl font-bold text-slate-800">{count}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sample Control Summary */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Sample Control (QP-245)</h2>
          <Link to="/samples" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View all →</Link>
        </div>
        <div className="grid grid-cols-4 divide-x divide-slate-100">
          {[
            { label: 'Class A', count: samples.filter((s) => s.sampleClass === 'A').length, color: 'text-slate-600' },
            { label: 'Class B', count: samples.filter((s) => s.sampleClass === 'B').length, color: 'text-blue-600' },
            { label: 'Class C', count: samples.filter((s) => s.sampleClass === 'C').length, color: 'text-orange-600' },
            { label: 'Active RSLNs', count: samples.filter((s) => !['consumed', 'destroyed', 'closed'].includes(s.lifecycleStatus)).length, color: 'text-indigo-600' },
          ].map(({ label, count, color }) => (
            <div key={label} className="px-5 py-5 text-center">
              <div className={`text-2xl font-bold ${color}`}>{count}</div>
              <div className="text-sm text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
