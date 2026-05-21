import React from 'react'
import { Group, Loader, Table, Text, Tooltip } from '@mantine/core'
import { IconKey, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { DesignButton, DesignSwitch, DesignTextInput, IconActionButton } from '../../../../design'
import { cn } from '../../../../utils/cn'
import type { ModelCatalogVendorDto } from './deps'
import { ApiKeyStatusBadge, EnabledBadge } from './ModelCatalogBadges'
import { ModelCatalogTableFooter } from './ModelCatalogTableFooter'
import { includesSearchText, paginateItems } from './modelCatalog.utils'

export function ModelCatalogVendorsSection({
  loading,
  vendors,
  onCreateVendor,
  onEditVendor,
  onDeleteVendor,
  onOpenVendorApiKey,
}: {
  loading: boolean
  vendors: ModelCatalogVendorDto[]
  onCreateVendor: () => void
  onEditVendor: (vendor: ModelCatalogVendorDto) => void
  onDeleteVendor: (vendor: ModelCatalogVendorDto) => void
  onOpenVendorApiKey: (vendor: ModelCatalogVendorDto) => void
}): JSX.Element {
  const [keywordInput, setKeywordInput] = React.useState('')
  const [keyword, setKeyword] = React.useState('')
  const [enabledOnlyInput, setEnabledOnlyInput] = React.useState(false)
  const [enabledOnly, setEnabledOnly] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredVendors = React.useMemo(() => {
    let items = [...vendors]
    if (enabledOnly) items = items.filter((vendor) => !!vendor.enabled)
    if (keyword) {
      items = items.filter((vendor) =>
        includesSearchText([vendor.key, vendor.name, vendor.baseUrlHint, vendor.authType], keyword),
      )
    }
    return items
  }, [enabledOnly, keyword, vendors])

  const pagedVendors = React.useMemo(
    () => paginateItems(filteredVendors, page, pageSize),
    [filteredVendors, page, pageSize],
  )

  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredVendors.length / pageSize))
    if (page > totalPages) setPage(totalPages)
  }, [filteredVendors.length, page, pageSize])

  const submitSearch = React.useCallback(() => {
    setKeyword(keywordInput)
    setEnabledOnly(enabledOnlyInput)
    setPage(1)
  }, [enabledOnlyInput, keywordInput])

  const resetSearch = React.useCallback(() => {
    setKeywordInput('')
    setKeyword('')
    setEnabledOnlyInput(false)
    setEnabledOnly(false)
    setPage(1)
  }, [])

  return (
    <div className={cn('stats-model-catalog-vendors-panel')}>
      <Group className={cn('stats-model-catalog-vendor-search flex-wrap items-end gap-3')} gap="sm" wrap="wrap" align="flex-end">
        <DesignTextInput
          className={cn('stats-model-catalog-vendor-search-keyword')}
          label="搜索"
          placeholder="搜索厂商 key / 名称 / BaseUrl"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.currentTarget.value)}
          leftSection={<IconSearch size={14} />}
          w={320}
        />
        <DesignSwitch
          className={cn('stats-model-catalog-vendor-search-enabled')}
          checked={enabledOnlyInput}
          onChange={(event) => setEnabledOnlyInput(event.currentTarget.checked)}
          label="仅看启用厂商"
          mb={4}
        />
        <Group className={cn('stats-model-catalog-vendor-search-actions')} gap={8} mb={4}>
          <DesignButton className={cn('stats-model-catalog-vendor-search-submit')} size="xs" onClick={submitSearch}>
            查询
          </DesignButton>
          <DesignButton className={cn('stats-model-catalog-vendor-search-reset')} size="xs" variant="subtle" onClick={resetSearch}>
            重置
          </DesignButton>
          <DesignButton className={cn('stats-model-catalog-vendor-create')} size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={onCreateVendor}>
            新增厂商
          </DesignButton>
        </Group>
      </Group>

      <div className={cn('stats-model-catalog-vendors-table-wrap overflow-x-auto')}>
        <Table className={cn('stats-model-catalog-vendors-table')} striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 140 }}>Key</Table.Th>
              <Table.Th style={{ width: 180 }}>名称</Table.Th>
              <Table.Th style={{ width: 90 }}>状态</Table.Th>
              <Table.Th style={{ width: 110 }}>API Key</Table.Th>
              <Table.Th style={{ width: 160 }}>鉴权</Table.Th>
              <Table.Th>BaseUrl Hint</Table.Th>
              <Table.Th style={{ width: 160 }}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading && !vendors.length ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Group className={cn('stats-model-catalog-loading')} gap="xs" align="center">
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed">加载中…</Text>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ) : !pagedVendors.length ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text className={cn('stats-model-catalog-empty')} size="sm" c="dimmed">暂无厂商</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              pagedVendors.map((vendor) => (
                <Table.Tr key={vendor.key}>
                  <Table.Td>
                    <Text size="sm" fw={600}>{vendor.key}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{vendor.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <EnabledBadge enabled={!!vendor.enabled} />
                  </Table.Td>
                  <Table.Td>
                    <ApiKeyStatusBadge hasApiKey={Boolean(vendor.hasApiKey)} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{String(vendor.authType || 'bearer')}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" style={{ wordBreak: 'break-all' }}>{(vendor.baseUrlHint || '').trim() || '—'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group className={cn('stats-model-catalog-vendor-row-actions flex-nowrap justify-end gap-1.5')} gap={6} justify="flex-end" wrap="nowrap">
                      <Tooltip label="设置系统级全局 API Key（不回显）" withArrow>
                        <IconActionButton size="sm" variant="light" aria-label="vendor-api-key" onClick={() => onOpenVendorApiKey(vendor)} icon={<IconKey size={14} />} />
                      </Tooltip>
                      <DesignButton size="xs" variant="light" onClick={() => onEditVendor(vendor)}>编辑</DesignButton>
                      <IconActionButton size="sm" variant="light" color="red" aria-label="delete-vendor" onClick={() => void onDeleteVendor(vendor)} icon={<IconTrash size={14} />} />
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>

      <ModelCatalogTableFooter
        total={filteredVendors.length}
        page={page}
        pageSize={pageSize}
        onChangePage={setPage}
        onChangePageSize={(next) => {
          setPageSize(next)
          setPage(1)
        }}
      />
    </div>
  )
}
