import { IconTrash } from '@tabler/icons-react'
import { cn } from '../../utils/cn'
import { NomiLogoMark } from '../../design'
import type { LocalProjectSummary } from './localProjectStore'

type Props = {
  onOpenProject: (projectId: string) => void
  onDeleteProject: (project: LocalProjectSummary) => void
  onNewProject: () => void
  projects: LocalProjectSummary[]
}

function formatUpdatedAt(value: number): string {
  if (!Number.isFinite(value)) return ''
  const deltaMs = Math.max(0, Date.now() - value)
  const minutes = Math.floor(deltaMs / 60_000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return new Date(value).toLocaleDateString('zh-CN')
}

function ThumbnailMosaic({ urls }: { urls: string[] }): JSX.Element {
  if (urls.length === 0) {
    return <div className="absolute inset-0 bg-nomi-ink-05" />
  }
  if (urls.length === 1) {
    return <img className="absolute inset-0 w-full h-full object-cover block" src={urls[0]} alt="" />
  }
  const cells = urls.slice(0, 4)
  return (
    <div className={cn(
      'absolute inset-0 grid gap-px bg-nomi-line-soft',
      cells.length === 2 && 'grid-cols-2',
      cells.length === 3 && 'grid-cols-2 grid-rows-2 [&>*:first-child]:col-span-full',
      cells.length === 4 && 'grid-cols-2 grid-rows-2',
    )}>
      {cells.map((url, i) => (
        <img key={i} className="w-full h-full object-cover block" src={url} alt="" />
      ))}
    </div>
  )
}

export default function ProjectLibraryPage({ onOpenProject, onDeleteProject, onNewProject, projects }: Props): JSX.Element {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-nomi-bg text-nomi-ink font-nomi-sans text-[13px] leading-normal antialiased">
      <main className="flex-1 overflow-y-auto px-14 pt-[60px] pb-20 flex flex-col gap-5">

        {/* ── Header ── */}
        <section className="flex flex-col gap-2 mb-3">
          <h1 className="flex items-center gap-[11px] font-nomi-display text-[28px] font-normal tracking-[-0.022em] text-nomi-ink leading-none m-0">
            <NomiLogoMark size={28} />
            <span>No<span className="text-nomi-accent">m</span>i 项目库</span>
          </h1>
          <p className="m-0 pl-[39px] text-[13px] text-nomi-ink-40">新建一个项目，开始把你的创意变成作品。</p>
        </section>

        {/* ── Search ── */}
        <div className={cn(
          'flex items-center gap-2 h-9 max-w-[360px] px-3',
          'border border-nomi-line rounded-nomi-sm bg-nomi-paper',
          'transition-[border-color,box-shadow] duration-150',
          'focus-within:border-[color-mix(in_oklch,var(--nomi-accent)_50%,transparent)]',
          'focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--nomi-accent)_10%,transparent)]',
        )}>
          <svg className="shrink-0 text-[var(--nomi-ink-30)]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="flex-1 border-none bg-transparent font-inherit text-[13px] text-nomi-ink outline-none placeholder:text-[var(--nomi-ink-30)] [&::-webkit-search-cancel-button]:hidden"
            type="search"
            placeholder="搜索项目名称…"
            aria-label="搜索项目"
          />
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[14px]">

          {/* New project — first card, plain solid style */}
          <button
            className={cn(
              'group bg-nomi-paper border border-nomi-line rounded-nomi-lg overflow-hidden cursor-pointer text-left font-inherit',
              'transition-[box-shadow,transform,border-color] duration-150',
              'hover:shadow-nomi-md hover:border-[var(--nomi-ink-20)] hover:-translate-y-0.5',
              'active:translate-y-0 active:shadow-none',
            )}
            type="button"
            onClick={onNewProject}
          >
            <div className={cn(
              'aspect-video relative overflow-hidden',
              'flex items-center justify-center bg-nomi-bg transition-colors duration-150',
              'group-hover:bg-[color-mix(in_oklch,var(--nomi-accent)_6%,var(--nomi-bg))]',
            )}>
              <div className={cn(
                'w-10 h-10 rounded-full bg-nomi-paper border border-nomi-line',
                'grid place-items-center text-nomi-ink-40',
                'transition-[border-color,color,background] duration-150',
                'group-hover:bg-[color-mix(in_oklch,var(--nomi-accent)_10%,var(--nomi-paper))]',
                'group-hover:border-[color-mix(in_oklch,var(--nomi-accent)_40%,transparent)]',
                'group-hover:text-nomi-accent',
              )}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
            </div>
            <div className="px-[13px] pt-[10px] pb-3">
              <div className="text-[13px] font-medium text-nomi-ink-60 truncate mb-0.5 group-hover:text-nomi-accent">新建项目</div>
            </div>
          </button>

          {projects.map((project) => {
            const urls = project.thumbnailUrls || (project.thumbnail ? [project.thumbnail] : [])
            return (
              <div
                key={project.id}
                className={cn(
                  'group bg-nomi-paper border border-nomi-line rounded-nomi-lg overflow-hidden cursor-pointer text-left',
                  'transition-[box-shadow,transform,border-color] duration-150',
                  'hover:shadow-nomi-md hover:border-[var(--nomi-ink-20)] hover:-translate-y-0.5',
                  'active:translate-y-0 active:shadow-none',
                )}
                role="button"
                tabIndex={0}
                onClick={() => onOpenProject(project.id)}
                onKeyDown={(e) => e.key === 'Enter' && onOpenProject(project.id)}
              >
                <div
                  className="aspect-video relative overflow-hidden bg-nomi-ink-05"
                  style={urls.length === 0 && project.thumbStyle ? { background: project.thumbStyle } : undefined}
                >
                  <ThumbnailMosaic urls={urls} />
                  <div className={cn(
                    'absolute inset-0 bg-[oklch(0.12_0.01_80/0.3)] opacity-0 transition-opacity duration-150',
                    'flex items-center justify-center z-[2]',
                    'group-hover:opacity-100',
                  )}>
                    <button
                      className={cn(
                        'absolute top-[9px] right-[9px] w-[30px] h-[30px] rounded-nomi-sm border-none',
                        'bg-white/90 text-[#b42318] grid place-items-center cursor-pointer',
                        'transition-[background,color] duration-150',
                        'hover:bg-[#b42318] hover:text-white',
                      )}
                      type="button"
                      aria-label={`删除项目 ${project.name}`}
                      title="删除项目"
                      onClick={(e) => { e.stopPropagation(); onDeleteProject(project) }}
                    >
                      <IconTrash size={14} stroke={1.8} />
                    </button>
                    <button
                      className={cn(
                        'h-[30px] px-[14px] rounded-nomi-sm border-none',
                        'bg-white/90 text-nomi-ink font-inherit text-[12.5px] font-medium cursor-pointer',
                        'transition-colors duration-150 hover:bg-white',
                      )}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onOpenProject(project.id) }}
                    >
                      继续创作
                    </button>
                  </div>
                </div>
                <div className="px-[13px] pt-[10px] pb-3">
                  <div className="text-[13px] font-medium text-nomi-ink truncate mb-0.5">{project.name}</div>
                  <div className="text-[11.5px] text-nomi-ink-40">{formatUpdatedAt(project.updatedAt)}</div>
                </div>
              </div>
            )
          })}
        </div>

      </main>
    </div>
  )
}
