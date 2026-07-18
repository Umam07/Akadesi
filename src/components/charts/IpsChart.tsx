import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface SemesterIps {
  semesterAjaran: string
  ips: number
  totalSks: number
}

interface IpsChartProps {
  data: SemesterIps[]
}

// Short label for semester axis
function shortLabel(semesterAjaran: string): string {
  const [years, type] = semesterAjaran.split(' ')
  const [y1, y2] = years.split('/')
  const short = type === 'Ganjil' ? 'G' : 'P'
  return `${y1.slice(-2)}/${y2.slice(-2)} ${short}`
}

// Grade quality labels
function ipsLabel(ips: number): string {
  if (ips >= 3.5) return 'Cumlaude'
  if (ips >= 3.0) return 'Sangat Memuaskan'
  if (ips >= 2.75) return 'Memuaskan'
  if (ips >= 2.0) return 'Cukup'
  return 'Kurang'
}

// Use a generic object for tooltip props to avoid recharts version issues
interface TooltipContentProps {
  active?: boolean
  payload?: ReadonlyArray<{ value?: number | string; name?: string }>
  label?: string
}

// Custom tooltip styled with Akadesi tokens (inline styles for portability)
function CustomTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null
  const ips = typeof payload[0]?.value === 'number' ? payload[0].value : undefined
  const sks = typeof payload[1]?.value === 'number' ? payload[1].value : undefined

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.96)',
        border: '1px solid rgba(23,58,64,0.14)',
        borderRadius: '0.85rem',
        padding: '0.75rem 1rem',
        boxShadow: '0 8px 24px rgba(23,58,64,0.12)',
        minWidth: 160,
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#416166', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p style={{ margin: '6px 0 2px', fontSize: 22, fontWeight: 800, color: '#173a40', lineHeight: 1 }}>
        {ips !== undefined ? ips.toFixed(2) : '—'}
      </p>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#2f6a4a' }}>
        {ips !== undefined ? ipsLabel(ips) : ''}
      </p>
      {sks !== undefined && (
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#416166', fontWeight: 500 }}>
          {sks} SKS diambil
        </p>
      )}
    </div>
  )
}

export function IpsChart({ data }: IpsChartProps) {
  const chartData = data.map((d) => ({
    label: shortLabel(d.semesterAjaran),
    ips: d.ips,
    sks: d.totalSks,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart
        data={chartData}
        margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(23,58,64,0.08)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fontWeight: 600, fill: '#416166', fontFamily: 'Manrope, sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 4]}
          ticks={[0, 1, 2, 3, 4]}
          tick={{ fontSize: 10, fill: '#416166', fontFamily: 'Manrope, sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        {/* Reference lines for grade thresholds */}
        <ReferenceLine y={3.5} stroke="rgba(47,106,74,0.2)" strokeDasharray="4 4" />
        <ReferenceLine y={3.0} stroke="rgba(47,106,74,0.12)" strokeDasharray="4 4" />
        <ReferenceLine y={2.0} stroke="rgba(196,71,71,0.15)" strokeDasharray="4 4" />

        <Tooltip
          content={(props) => <CustomTooltip {...(props as unknown as TooltipContentProps)} />}
          cursor={{ fill: 'rgba(79,184,178,0.06)' }}
        />

        {/* Bar for IPS value */}
        <Bar
          dataKey="ips"
          name="IPS"
          fill="rgba(79,184,178,0.35)"
          stroke="#328f97"
          strokeWidth={1}
          radius={[6, 6, 0, 0]}
          maxBarSize={52}
        />

        {/* Line overlay */}
        <Line
          type="monotone"
          dataKey="ips"
          name="Tren IPS"
          stroke="#2f6a4a"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#2f6a4a', stroke: '#fff', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#2f6a4a', stroke: '#fff', strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
