import React from 'react'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCopy,
  IconCut,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react'
import { useWorkbenchStore } from '../workbenchStore'
import { WorkbenchIconButton } from '../../design'
import { cn } from '../../utils/cn'
import { computeTimelineDuration } from './timelineMath'
import TimelineTrack from './TimelineTrack'
import { frameToPixel, pixelToFrame, TIMELINE_MIN_SCALE, TIMELINE_MAX_SCALE } from './timelineEdit'

const WHEEL_ZOOM_FACTOR = 1.24

function formatRulerLabel(frame: number, fps: number): string {
  const totalSeconds = Math.floor(frame / fps)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function resolveTimelineRulerStep(fps: number, scale: number): number {
  const pixelsPerSecond = frameToPixel(fps, scale)
  if (pixelsPerSecond < 36) return fps * 10
  if (pixelsPerSecond < 72) return fps * 5
  if (pixelsPerSecond < 132) return fps * 2
  return fps
}

function resolveTimelineRulerEndFrame(params: {
  durationFrame: number
  playheadFrame: number
  fps: number
}): number {
  const fps = Math.max(1, params.fps)
  const minEditableFrame = fps * 120
  const trailingFrame = fps * 60
  return Math.max(
    minEditableFrame,
    params.durationFrame + trailingFrame,
    params.playheadFrame + trailingFrame,
  )
}

function buildTimelineRulerTicks(endFrame: number, fps: number, scale: number): Array<{ frame: number; label: string }> {
  const maxFrame = Math.max(0, endFrame)
  const step = resolveTimelineRulerStep(fps, scale)
  const ticks: Array<{ frame: number; label: string }> = []
  for (let frame = 0; frame <= maxFrame && ticks.length < 360; frame += step) {
    ticks.push({ frame, label: formatRulerLabel(frame, fps) })
  }
  return ticks
}

type TimelinePanelProps = {
  density?: 'compact' | 'full'
  regionLabel: string
  actionLabelPrefix: string
}

export default function TimelinePanel({ density = 'compact', regionLabel, actionLabelPrefix }: TimelinePanelProps): JSX.Element {
  const timeline = useWorkbenchStore((state) => state.timeline)
  const selectedClipId = useWorkbenchStore((state) => state.selectedTimelineClipId)
  const duplicateTimelineClip = useWorkbenchStore((state) => state.duplicateTimelineClip)
  const nudgeTimelineClip = useWorkbenchStore((state) => state.nudgeTimelineClip)
  const removeTimelineClip = useWorkbenchStore((state) => state.removeTimelineClip)
  const setTimelineZoom = useWorkbenchStore((state) => state.setTimelineZoom)
  const setTimelinePlayhead = useWorkbenchStore((state) => state.setTimelinePlayhead)
  const splitTimelineClip = useWorkbenchStore((state) => state.splitTimelineClip)
  const durationFrame = computeTimelineDuration(timeline)
  const rulerEndFrame = React.useMemo(
    () => resolveTimelineRulerEndFrame({
      durationFrame,
      playheadFrame: timeline.playheadFrame,
      fps: timeline.fps,
    }),
    [durationFrame, timeline.fps, timeline.playheadFrame],
  )
  const rulerTicks = React.useMemo(
    () => buildTimelineRulerTicks(rulerEndFrame, timeline.fps, timeline.scale),
    [rulerEndFrame, timeline.fps, timeline.scale],
  )
  const minScrollableWidth = 2400
  const rulerWidth = Math.max(frameToPixel(rulerEndFrame, timeline.scale), minScrollableWidth)
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, [contenteditable="true"]')) return
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        setTimelinePlayhead(timeline.playheadFrame + (event.key === 'ArrowLeft' ? -1 : 1))
        return
      }
      if (!selectedClipId) return
      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()
        removeTimelineClip(selectedClipId)
        return
      }
      if (event.key.toLowerCase() === 's') {
        event.preventDefault()
        splitTimelineClip(selectedClipId, timeline.playheadFrame)
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        duplicateTimelineClip(selectedClipId)
        return
      }
      if (event.shiftKey && (event.key === '<' || event.key === '>')) {
        event.preventDefault()
        nudgeTimelineClip(selectedClipId, event.key === '<' ? -1 : 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    duplicateTimelineClip,
    nudgeTimelineClip,
    removeTimelineClip,
    selectedClipId,
    setTimelinePlayhead,
    splitTimelineClip,
    timeline.playheadFrame,
  ])

  const handleRulerClick = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const nextFrame = pixelToFrame(event.clientX - rect.left, timeline.scale)
    setTimelinePlayhead(nextFrame)
  }, [setTimelinePlayhead, timeline.scale])

  return (
    <section
      className={cn(
        'workbench-timeline',
        'relative min-w-0 min-h-0 grid grid-rows-[minmax(0,1fr)]',
        'bg-[var(--workbench-surface-solid)] border-t border-[var(--workbench-border)]',
        'shadow-[0_-1px_0_rgba(255,255,255,0.72)]',
        density === 'full' ? 'px-[18px] py-[10px] pb-[14px]' : 'px-4 pt-3 pb-3',
      )}
      data-density={density}
      aria-label={regionLabel}
      style={{ '--workbench-timeline-content-width': `${rulerWidth}px` } as React.CSSProperties}
    >
      <div className={cn(
        'workbench-timeline__controls',
        'absolute top-[10px] right-4 z-[8] inline-flex items-center gap-0.5',
        'bg-[color-mix(in_oklch,var(--nomi-paper)_84%,transparent)]',
        'rounded-full backdrop-blur-[10px]',
      )}>
        <div className={cn(
          'workbench-timeline__right',
          'inline-flex items-center gap-0.5 min-w-0 p-0',
        )}>
          {selectedClipId ? (
            <div className={cn(
              'workbench-timeline__clip-tools',
              'inline-flex items-center gap-0.5 pr-0 border-r-0',
            )} aria-label="选中片段操作">
              <WorkbenchIconButton className={cn('workbench-timeline__tool', 'w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]')} label="向前微调片段" icon={<IconArrowLeft size={14} />} onClick={() => nudgeTimelineClip(selectedClipId, -1)} />
              <WorkbenchIconButton className={cn('workbench-timeline__tool', 'w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]')} label="分割片段" icon={<IconCut size={14} />} onClick={() => splitTimelineClip(selectedClipId, timeline.playheadFrame)} />
              <WorkbenchIconButton className={cn('workbench-timeline__tool', 'w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]')} label="复制片段" icon={<IconCopy size={14} />} onClick={() => duplicateTimelineClip(selectedClipId)} />
              <WorkbenchIconButton className={cn('workbench-timeline__tool', 'w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]')} label="向后微调片段" icon={<IconArrowRight size={14} />} onClick={() => nudgeTimelineClip(selectedClipId, 1)} />
            </div>
          ) : null}
          <WorkbenchIconButton className={cn('workbench-timeline__tool', 'w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]')} label={`${actionLabelPrefix}缩小时间轴`} icon={<IconMinus size={14} />} onClick={() => setTimelineZoom(timeline.scale / 1.25)} />
          <span className="text-[11px] opacity-60 min-w-[32px] text-center">{Math.round(timeline.scale * 100)}%</span>
          <WorkbenchIconButton className={cn('workbench-timeline__tool', 'w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]')} label="重置缩放" icon={<IconRefresh size={14} />} onClick={() => setTimelineZoom(1)} />
          <WorkbenchIconButton className={cn('workbench-timeline__tool', 'w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]')} label={`${actionLabelPrefix}放大时间轴`} icon={<IconPlus size={14} />} onClick={() => setTimelineZoom(timeline.scale * 1.25)} />
          <WorkbenchIconButton className={cn('workbench-timeline__tool', 'w-auto min-w-[30px] h-[var(--workbench-control-size)] px-2 inline-grid place-items-center border-0 rounded-[var(--workbench-control-radius)] bg-transparent text-[var(--workbench-muted)] shadow-none cursor-pointer hover:bg-[var(--workbench-hover)]')} label={`${actionLabelPrefix}删除选中片段`} icon={<IconTrash size={14} />} disabled={!selectedClipId} onClick={() => removeTimelineClip(selectedClipId)} />
        </div>
      </div>
      <div
        className={cn(
          'workbench-timeline__tracks',
          'relative min-w-0 min-h-0 block bg-transparent',
          'overflow-x-auto overflow-y-hidden pb-2',
          'scrollbar-thin scrollbar-color-transparent',
          'hover:scrollbar-color-[color-mix(in_srgb,var(--nomi-ink)_22%,transparent)]',
        )}
        onWheel={(e) => {
          if (!e.ctrlKey && !e.metaKey) return
          e.preventDefault()
          const factor = e.deltaY < 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR
          setTimelineZoom(Math.min(TIMELINE_MAX_SCALE, Math.max(TIMELINE_MIN_SCALE, timeline.scale * factor)))
        }}
      >
        <div className={cn(
          'workbench-timeline__ruler',
          'w-full grid grid-cols-[var(--workbench-timeline-label-width)_minmax(0,1fr)]',
          'h-[22px] mb-1.5 border-b border-[var(--nomi-line-soft)] bg-transparent',
        )}>
          <div className={cn(
            'workbench-timeline__ruler-spacer',
            'sticky left-0 z-[4] border-r-0 bg-transparent',
          )} aria-hidden="true" />
          <div
            className={cn(
              'workbench-timeline__ruler-content',
              'relative h-full cursor-pointer bg-transparent',
            )}
            style={{
              width: 'var(--workbench-timeline-content-width, 100%)',
              minWidth: 'var(--workbench-timeline-content-width, 100%)',
            }}
            aria-label="时间刻度"
            onClick={handleRulerClick}
          >
            {rulerTicks.map((tick) => (
              <span
                key={tick.frame}
                className={cn(
                  'workbench-timeline__ruler-tick',
                  'absolute left-0 top-0 w-0 h-full bg-transparent text-[var(--workbench-muted)]',
                  'after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-px after:h-[22px] after:bg-[var(--nomi-line)]',
                )}
                data-origin={tick.frame === 0 ? 'true' : 'false'}
                style={{ transform: `translateX(${frameToPixel(tick.frame, timeline.scale)}px)` }}
              >
                <span className={cn(
                  'workbench-timeline__ruler-label',
                  'absolute left-1.5 top-[3px] font-mono text-[10.5px] font-medium leading-none',
                  'text-[var(--nomi-ink-40)] whitespace-nowrap tabular-nums',
                )}>{tick.label}</span>
              </span>
            ))}
          </div>
        </div>
        <div
          className={cn(
            'workbench-timeline__playhead',
            'absolute top-0 bottom-0 left-[var(--workbench-timeline-label-width)] z-[6]',
            'w-px bg-[var(--workbench-accent)] shadow-[0_0_0_1px_rgba(0,122,255,0.08)]',
            'pointer-events-none',
            'before:content-[""] before:absolute before:-top-px before:left-1/2 before:w-[9px] before:h-[9px]',
            'before:border-2 before:border-[var(--nomi-paper)] before:rounded-full',
            'before:bg-[var(--workbench-accent)] before:shadow-[0_1px_2px_oklch(0_0_0/0.2)]',
            'before:-translate-x-1/2',
          )}
          style={{ transform: `translateX(${frameToPixel(timeline.playheadFrame, timeline.scale)}px)` }}
          aria-hidden="true"
        />
        {timeline.tracks.map((track) => (
          <TimelineTrack key={track.id} track={track} />
        ))}
      </div>
    </section>
  )
}
