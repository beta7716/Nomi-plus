import React from 'react'
import { Group, Text } from '@mantine/core'
import { DesignPagination, DesignSelect } from '../../../../design'
import { cn } from '../../../../utils/cn'
import { PAGE_SIZE_OPTIONS } from './modelCatalog.constants'

export function ModelCatalogTableFooter({
  total,
  page,
  pageSize,
  onChangePage,
  onChangePageSize,
}: {
  total: number
  page: number
  pageSize: number
  onChangePage: (next: number) => void
  onChangePageSize: (next: number) => void
}): JSX.Element | null {
  if (total <= 0) return null
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <Group className={cn('stats-model-catalog-table-footer flex-wrap items-center justify-between gap-3 mt-3')} justify="space-between" align="center" mt="sm" gap="sm" wrap="wrap">
      <Text size="xs" c="dimmed">
        共 {total} 条
      </Text>
      <Group className={cn('stats-model-catalog-table-footer-controls flex-wrap items-center gap-3')} gap="sm" align="center" wrap="wrap">
        <DesignSelect
          value={String(pageSize)}
          data={PAGE_SIZE_OPTIONS}
          onChange={(value) => onChangePageSize(Number.parseInt(String(value || pageSize), 10))}
          allowDeselect={false}
          w={100}
        />
        <DesignPagination
          value={Math.min(page, totalPages)}
          onChange={onChangePage}
          total={totalPages}
          size="sm"
        />
      </Group>
    </Group>
  )
}
