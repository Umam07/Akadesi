import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getPengumumanData, markPengumumanRead } from '../../../server/functions/academicFn'
import { useState } from 'react'
import { Bell, ChevronDown, ChevronUp, MailOpen, Mail } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/mahasiswa/pengumuman')({
  loader: async () => {
    return await getPengumumanData()
  },
  component: PengumumanPage,
})

function PengumumanPage() {
  const { announcements } = Route.useLoaderData()
  const router = useRouter()

  // Local state to track which announcements are expanded
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  // Local state to track read status on-the-fly for smooth animation
  const [localReadIds, setLocalReadIds] = useState<string[]>([])

  const toggleExpand = async (id: string, isRead: boolean) => {
    // Toggle expand state
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )

    // Mark as read if not already read
    if (!isRead && !localReadIds.includes(id)) {
      setLocalReadIds((prev) => [...prev, id])
      try {
        await markPengumumanRead({ data: { pengumumanId: id } })
        router.invalidate() // Sync database cache
      } catch (err) {
        console.error('Gagal menandai dibaca:', err)
      }
    }
  }

  // Format date
  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB'
  }

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-8 w-full rise-in">
      {/* Page Header */}
      <div>
        <h2 className="demo-title display-title text-2xl md:text-3xl font-bold">
          Pengumuman Kampus
        </h2>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)] font-medium">
          Dapatkan berita, agenda kegiatan, dan pengumuman penting terbaru dari fakultas.
        </p>
      </div>

      {/* Announcements Stack */}
      {announcements.length > 0 ? (
        <div className="flex flex-col gap-4">
          {announcements.map((ann) => {
            const isExpanded = expandedIds.includes(ann.id)
            const isRead = ann.read || localReadIds.includes(ann.id)

            return (
              <div
                key={ann.id}
                className={`demo-card border transition-all p-0 overflow-hidden ${
                  isExpanded
                    ? 'border-[var(--lagoon-deep)] shadow-[0_6px_20px_rgba(23,58,64,0.04)] bg-[var(--surface-strong)]'
                    : 'border-[var(--line)] bg-[var(--surface-strong)] hover:border-[var(--sea-ink-soft)]'
                }`}
              >
                {/* Header Section (clickable) */}
                <div
                  onClick={() => toggleExpand(ann.id, isRead)}
                  className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Mail status icon */}
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                      isRead
                        ? 'bg-[var(--sand)] text-[var(--sea-ink-soft)] border-[var(--line)]'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {isRead ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                          {formatDate(ann.diterbitkanPada)}
                        </span>
                        {!isRead && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                            Baru
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[var(--sea-ink)] mt-1.5 leading-snug">
                        {ann.judul}
                      </h3>
                    </div>
                  </div>

                  <div className="text-[var(--sea-ink-soft)] pt-1 sm:pt-0">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>

                {/* Content Section (expandable) */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[var(--line)]/50 pt-4 bg-[var(--foam)]/30 rise-in">
                    <p className="text-sm text-[var(--sea-ink)] leading-relaxed whitespace-pre-wrap">
                      {ann.isi}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="demo-panel border border-dashed border-[var(--sea-ink-soft)]/30 rounded-xl text-center py-20 px-6 bg-white/40 max-w-lg mx-auto">
          <Bell className="h-12 w-12 text-[var(--sea-ink-soft)]/30 mx-auto mb-4" />
          <h4 className="font-bold text-[var(--sea-ink)] text-lg">Tidak ada pengumuman</h4>
          <p className="text-xs text-[var(--sea-ink-soft)] mt-1.5 leading-relaxed">
            Saat ini tidak ada info pengumuman akademik terbaru dari prodi atau fakultas.
          </p>
        </div>
      )}
    </div>
  )
}
