'use client'

interface Props {
  label: string
  value: string
  sub?: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

const colors = {
  blue:   'bg-blue-50 border-blue-100 text-blue-600 text-blue-700 text-blue-500',
  green:  'bg-green-50 border-green-100 text-green-600 text-green-700 text-green-500',
  purple: 'bg-purple-50 border-purple-100 text-purple-600 text-purple-700 text-purple-500',
  orange: 'bg-orange-50 border-orange-100 text-orange-600 text-orange-700 text-orange-500',
  red:    'bg-red-50 border-red-100 text-red-600 text-red-700 text-red-500',
}

export default function StatCard({ label, value, sub, color }: Props) {
  const [bg, border, labelC, valC, subC] = colors[color].split(' ')
  return (
    <div className={`${bg} rounded-xl p-3 border ${border}`}>
      <p className={`text-xs font-medium ${labelC}`}>{label}</p>
      <p className={`text-xl font-bold ${valC} mt-0.5 truncate`}>{value}</p>
      {sub && <p className={`text-xs ${subC} mt-1`}>{sub}</p>}
    </div>
  )
}
