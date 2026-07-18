import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'

interface GraduationRadialChartProps {
  totalSksLulus: number
  targetSks: number
}

export function GraduationRadialChart({ totalSksLulus, targetSks }: GraduationRadialChartProps) {
  const percent = Math.min((totalSksLulus / targetSks) * 100, 100)
  const remaining = targetSks - totalSksLulus

  const chartData = [{ value: percent, fill: '#328f97' }]

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Radial chart */}
      <div className="relative w-full" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="90%"
            startAngle={90}
            endAngle={-270}
            data={chartData}
            barSize={14}
          >
            {/* Background track */}
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            {/* Background circle (track) */}
            <RadialBar
              background={{ fill: '#e7f0e8' }}
              dataKey="value"
              angleAxisId={0}
              cornerRadius={8}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center label overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          <span
            style={{ fontSize: 28, fontWeight: 800, color: '#173a40', lineHeight: 1 }}
          >
            {percent.toFixed(0)}%
          </span>
          <span
            style={{ fontSize: 11, fontWeight: 600, color: '#416166', marginTop: 3 }}
          >
            Kelulusan
          </span>
        </div>
      </div>

      {/* Stats below chart */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div
          className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border"
          style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(23,58,64,0.14)' }}
        >
          <span style={{ fontSize: 20, fontWeight: 800, color: '#173a40', lineHeight: 1 }}>
            {totalSksLulus}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#416166', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            SKS Lulus
          </span>
        </div>
        <div
          className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border"
          style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(23,58,64,0.14)' }}
        >
          <span style={{ fontSize: 20, fontWeight: 800, color: remaining > 0 ? '#416166' : '#2f6a4a', lineHeight: 1 }}>
            {remaining > 0 ? remaining : '✓'}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#416166', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {remaining > 0 ? 'SKS Tersisa' : 'Selesai!'}
          </span>
        </div>
      </div>

      {/* Target label */}
      <p style={{ fontSize: 11, color: '#416166', fontWeight: 500, margin: 0, textAlign: 'center' }}>
        Target kelulusan: <strong style={{ color: '#173a40' }}>{targetSks} SKS</strong>
      </p>
    </div>
  )
}
