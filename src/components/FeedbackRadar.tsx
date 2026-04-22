import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts'
import type { Feedback } from '../types'

interface Props {
  feedbackList: Feedback[]
}

const ATTRS = ['taste', 'aroma', 'appearance', 'texture', 'aftertaste', 'overall']
const LABELS: Record<string, string> = {
  taste: 'Taste', aroma: 'Aroma', appearance: 'Appearance',
  texture: 'Texture', aftertaste: 'Aftertaste', overall: 'Overall',
}

export function FeedbackRadar({ feedbackList }: Props) {
  if (!feedbackList.length) return (
    <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No feedback yet</div>
  )

  const data = ATTRS.map((attr) => {
    const vals = feedbackList.map((f) => f.ratings[attr] ?? 0).filter((v) => v > 0)
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    return { attr: LABELS[attr] ?? attr, value: parseFloat(avg.toFixed(1)) }
  })

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="attr" tick={{ fontSize: 12, fill: '#64748b' }} />
        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickCount={3} />
        <Radar name="Avg Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
        <Tooltip formatter={(v) => [`${v}/10`, 'Avg Score']} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
