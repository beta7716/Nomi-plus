import React from 'react'
import { cn } from '../../utils/cn'
import type { GenerationCanvasNode, NodeGroup } from '../generationCanvasV2/model/generationCanvasTypes'
import NodeItem from './NodeItem'

type Props = {
  group: NodeGroup
  nodes: GenerationCanvasNode[]
  selectedNodeIds: string[]
  onSelectNode?: (nodeId: string) => void
}

export default function GroupItem({ group, nodes, selectedNodeIds, onSelectNode }: Props): JSX.Element {
  const [expanded, setExpanded] = React.useState(!group.collapsed)

  return (
    <div className="rounded-md border border-nomi-line/70 bg-white/35">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-md',
          'text-[11px] text-nomi-ink-60 hover:text-nomi-ink hover:bg-nomi-ink-05',
        )}
        title={group.name}
      >
        <span className="w-3 text-[10px] text-nomi-ink-40" aria-hidden>{expanded ? '▾' : '▸'}</span>
        <span
          className="h-2.5 w-2.5 rounded-full border border-nomi-line shrink-0"
          style={{ backgroundColor: group.color || 'rgba(160, 132, 90, 0.18)' }}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate">{group.name}</span>
        <span className="shrink-0 tabular-nums text-[10px] text-nomi-ink-40">{nodes.length}</span>
      </button>
      {expanded ? (
        <div className="pb-1">
          {nodes.length ? nodes.map((node) => (
            <NodeItem
              key={node.id}
              node={node}
              depth={1}
              active={selectedNodeIds.includes(node.id)}
              onSelect={onSelectNode}
            />
          )) : (
            <div className="px-7 py-1.5 text-[11px] text-nomi-ink-30">空组</div>
          )}
        </div>
      ) : null}
    </div>
  )
}
