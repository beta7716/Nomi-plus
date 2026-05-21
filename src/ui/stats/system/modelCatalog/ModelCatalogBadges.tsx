import { DesignBadge } from '../../../../design'
import { cn } from '../../../../utils/cn'

export function EnabledBadge({ enabled }: { enabled: boolean }): JSX.Element {
  return (
    <DesignBadge className={cn('stats-model-catalog-enabled-badge')} size="xs" color={enabled ? 'green' : 'gray'}>
      {enabled ? '启用' : '禁用'}
    </DesignBadge>
  )
}

export function ApiKeyStatusBadge({ hasApiKey }: { hasApiKey?: boolean }): JSX.Element {
  return (
    <DesignBadge className={cn('stats-model-catalog-apikey-badge')} size="xs" color={hasApiKey ? 'green' : 'gray'}>
      {hasApiKey ? 'Key 已配置' : 'Key 未配置'}
    </DesignBadge>
  )
}
