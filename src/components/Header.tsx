import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-bold tracking-tight">
          <Link
            to="/"
            className="group inline-flex items-center gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline transition-all duration-200 hover:border-[var(--sea-ink-soft)]"
          >
            <svg
              className="h-4.5 w-4.5 text-[var(--sea-ink)] transition-transform duration-200 group-hover:scale-95"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-10 9h3v8h14v-8h3L12 3z" />
              <path d="M9 17h6" />
              <path d="M9 13h6" />
            </svg>
            <span className="tracking-tight">Akadesi</span>
          </Link>
        </h2>

        <div className="ml-auto order-3 flex flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-none sm:pb-0">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            About
          </Link>
        </div>
      </nav>
    </header>
  )
}
