import React from 'react'
import { useWorkbenchStore } from '../workbenchStore'
import { cn } from '../../utils/cn'
import { buildClipFromGenerationNode } from '../generationCanvasV2/model/buildClipFromGenerationNode'
import { clientXToFrame } from './timelineEdit'
import {
  decodeTimelineGenerationNodeDragPayload,
  TIMELINE_GENERATION_NODE_DRAG_MIME,
} from './timelineDragPayload'
import TimelineClip from './TimelineClip'
import type { TimelineTrack as TimelineTrackData } from './timelineTypes'

type TimelineTrackProps = {
  track: TimelineTrackData
}

export default function TimelineTrack({ track }: TimelineTrackProps): JSX.Element {
  const timeline = useWorkbenchStore((state) => state.timeline)
  const addTimelineClipAtFrame = useWorkbenchStore((state) => state.addTimelineClipAtFrame)
  const setTimelinePlayhead = useWorkbenchStore((state) => state.setTimelinePlayhead)
  const clipsRef = React.useRef<HTMLDivElement | null>(null)
  const [dragOver, setDragOver] = React.useState(false)

  const resolveFrame = React.useCallback((clientX: number) => {
    const rect = clipsRef.current?.getBoundingClientRect()
    if (!rect) return 0
    return clientXToFrame(clientX, rect.left, timeline.scale)
  }, [timeline.scale])

  const handleDrop = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(false)
    const startFrame = resolveFrame(event.clientX)
    const generationNodePayload = decodeTimelineGenerationNodeDragPayload(event.dataTransfer.getData(TIMELINE_GENERATION_NODE_DRAG_MIME))
    if (generationNodePayload) {
      const clip = buildClipFromGenerationNode(generationNodePayload.node, {
        fps: timeline.fps,
        startFrame,
        resultId: generationNodePayload.resultId,
      })
      if (clip) addTimelineClipAtFrame(clip, clip.type, startFrame)
    }
  }, [addTimelineClipAtFrame, resolveFrame, timeline.fps])

  return (
    <div className={cn(
      'workbench-timeline-track',
      'w-full min-h-[52px] grid grid-cols-[var(--workbench-timeline-label-width)_minmax(0,1fr)]',
      'items-center mb-1.5 border-b-0',
    )} data-testid="timeline-track" data-track-type={track.type}>
      <div className={cn(
        'workbench-timeline-track__label',
        'sticky left-0 z-[3] flex items-center gap-[7px]',
        'min-w-0 min-h-[52px] pr-3 border-r-0 bg-transparent',
        'text-[var(--workbench-ink)] text-xs font-semibold',
      )}>
        <span className={cn(
          'workbench-timeline-track__type-dot',
          'flex-none w-2 h-2 rounded-full shadow-none',
          track.type === 'image' && 'bg-[var(--workbench-accent)]',
          track.type === 'video' && 'bg-[var(--workbench-video)]',
          track.type !== 'image' && track.type !== 'video' && 'bg-[var(--workbench-muted-soft)]',
        )} aria-hidden="true" />
        <span className={cn(
          'workbench-timeline-track__name',
          'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
        )}>{track.label}</span>
        <span className={cn(
          'workbench-timeline-track__count',
          'flex-none min-w-0 h-auto ml-auto px-1.5 py-px',
          'inline-grid place-items-center border-0 rounded-full',
          'bg-[var(--nomi-ink-05)] text-[var(--nomi-ink-40)]',
          'text-[10.5px] font-bold tabular-nums',
        )}>{track.clips.length}</span>
      </div>
      <div
        ref={clipsRef}
        className={cn(
          'workbench-timeline-track__clips',
          'relative min-h-[46px] overflow-hidden cursor-crosshair',
          'border border-[var(--nomi-line-soft)] rounded-[var(--nomi-radius-sm)]',
          'bg-[var(--nomi-ink-05)] transition-[background,box-shadow] duration-[140ms] ease-in-out',
          dragOver && 'bg-[var(--workbench-accent-soft)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--workbench-accent)_20%,transparent)]',
        )}
        style={{
          width: 'var(--workbench-timeline-content-width, 100%)',
          minWidth: 'var(--workbench-timeline-content-width, 100%)',
        }}
        data-drag-over={dragOver ? 'true' : 'false'}
        onClick={(event) => {
          setTimelinePlayhead(resolveFrame(event.clientX))
        }}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as globalThis.Node | null)) return
          setDragOver(false)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
        }}
        onDrop={handleDrop}
      >
        {track.clips.length === 0 ? (
          <div className={cn(
            'workbench-timeline-track__empty',
            'absolute inset-0 flex items-center justify-center',
            'border border-dashed border-[var(--nomi-line)] rounded-[var(--nomi-radius-sm)]',
            'text-[var(--nomi-ink-40)] leading-none text-[11px] font-medium pointer-events-none',
          )}>从生成区拖入素材</div>
        ) : null}
        {track.clips.map((clip) => (
          <TimelineClip key={clip.id} clip={clip} />
        ))}
      </div>
    </div>
  )
}
