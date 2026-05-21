import React from 'react'
import { Divider, Group, Loader, Table, Text } from '@mantine/core'
import { IconCopyPlus, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { DesignButton, DesignSelect, DesignSwitch, DesignTextInput, IconActionButton } from '../../../../design'
import { cn } from '../../../../utils/cn'
import type { BillingModelKind, ModelCatalogModelDto } from './deps'
import { EnabledBadge } from './ModelCatalogBadges'
import { ModelCatalogTableFooter } from './ModelCatalogTableFooter'
import { KIND_OPTIONS } from './modelCatalog.constants'
import { defaultModelPricingCost, formatKind, formatVendor, includesSearchText, paginateItems } from './modelCatalog.utils'

export function ModelCatalogModelsSection({
  loading,
  models,
  vendorSelectData,
  isModelCapabilityEnabled,
  onCreateModel,
  onEditModel,
  onDuplicateModel,
  onDeleteModel,
}: {
  loading: boolean
  models: ModelCatalogModelDto[]
  vendorSelectData: Array<{ value: string; label: string }>
  isModelCapabilityEnabled: (model: ModelCatalogModelDto) => boolean
  onCreateModel: () => void
  onEditModel: (model: ModelCatalogModelDto) => void
  onDuplicateModel: (model: ModelCatalogModelDto) => void
  onDeleteModel: (model: ModelCatalogModelDto) => void
}): JSX.Element {
  const [keywordInput, setKeywordInput] = React.useState('')
  const [vendorFilterInput, setVendorFilterInput] = React.useState<string>('all')
  const [kindFilterInput, setKindFilterInput] = React.useState<BillingModelKind | 'all'>('all')
  const [enabledCapabilityOnlyInput, setEnabledCapabilityOnlyInput] = React.useState(false)

  const [keyword, setKeyword] = React.useState('')
  const [vendorFilter, setVendorFilter] = React.useState<string>('all')
  const [kindFilter, setKindFilter] = React.useState<BillingModelKind | 'all'>('all')
  const [enabledCapabilityOnly, setEnabledCapabilityOnly] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredModels = React.useMemo(() => {
    let items = [...models]
    if (vendorFilter !== 'all') items = items.filter((model) => model.vendorKey === vendorFilter)
    if (kindFilter !== 'all') items = items.filter((model) => model.kind === kindFilter)
    if (enabledCapabilityOnly) items = items.filter((model) => isModelCapabilityEnabled(model))
    if (keyword) {
      items = items.filter((model) =>
        includesSearchText([model.modelKey, model.modelAlias, model.labelZh, model.vendorKey], keyword),
      )
    }
    return items
  }, [enabledCapabilityOnly, isModelCapabilityEnabled, keyword, kindFilter, models, vendorFilter])

  const pagedModels = React.useMemo(
    () => paginateItems(filteredModels, page, pageSize),
    [filteredModels, page, pageSize],
  )

  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredModels.length / pageSize))
    if (page > totalPages) setPage(totalPages)
  }, [filteredModels.length, page, pageSize])

  const submitSearch = React.useCallback(() => {
    setKeyword(keywordInput)
    setVendorFilter(vendorFilterInput)
    setKindFilter(kindFilterInput)
    setEnabledCapabilityOnly(enabledCapabilityOnlyInput)
    setPage(1)
  }, [enabledCapabilityOnlyInput, keywordInput, kindFilterInput, vendorFilterInput])

  const resetSearch = React.useCallback(() => {
    setKeywordInput('')
    setVendorFilterInput('all')
    setKindFilterInput('all')
    setEnabledCapabilityOnlyInput(false)
    setKeyword('')
    setVendorFilter('all')
    setKindFilter('all')
    setEnabledCapabilityOnly(false)
    setPage(1)
  }, [])

  return (
    <>
      <Divider className={cn('stats-model-catalog-divider')} label="模型（Model）" labelPosition="left" />
      <Group className={cn('stats-model-catalog-model-search flex-wrap items-end gap-3')} gap="sm" wrap="wrap" align="flex-end">
        <DesignTextInput
          className={cn('stats-model-catalog-model-search-keyword')}
          label="模型名称"
          placeholder="搜索模型 Key / 别名 / 中文名"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.currentTarget.value)}
          leftSection={<IconSearch size={14} />}
          w={300}
        />
        <DesignSelect
          className={cn('stats-model-catalog-model-search-kind')}
          label="模型类型"
          value={kindFilterInput}
          onChange={(value) => setKindFilterInput(((value as BillingModelKind | 'all' | null) || 'all'))}
          data={[{ value: 'all', label: '全部类型' }, ...KIND_OPTIONS]}
          w={180}
        />
        <DesignSelect
          className={cn('stats-model-catalog-model-search-vendor')}
          label="厂商"
          value={vendorFilterInput}
          onChange={(value) => setVendorFilterInput(value || 'all')}
          data={vendorSelectData}
          searchable
          w={220}
        />
        <DesignSwitch
          className={cn('stats-model-catalog-model-search-capability')}
          checked={enabledCapabilityOnlyInput}
          onChange={(event) => setEnabledCapabilityOnlyInput(event.currentTarget.checked)}
          label="仅看已启用能力"
          mb={4}
        />
        <Group className={cn('stats-model-catalog-model-search-actions')} gap={8} mb={4}>
          <DesignButton className={cn('stats-model-catalog-model-search-submit')} size="xs" onClick={submitSearch}>
            查询
          </DesignButton>
          <DesignButton className={cn('stats-model-catalog-model-search-reset')} size="xs" variant="subtle" onClick={resetSearch}>
            重置
          </DesignButton>
          <DesignButton className={cn('stats-model-catalog-model-create')} size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={onCreateModel}>
            新增模型
          </DesignButton>
        </Group>
      </Group>

      <div className={cn('stats-model-catalog-models-table-wrap overflow-x-auto')}>
        <Table className={cn('stats-model-catalog-models-table')} striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 260 }}>模型 Key</Table.Th>
              <Table.Th style={{ width: 220 }}>别名（Public）</Table.Th>
              <Table.Th style={{ width: 220 }}>名称</Table.Th>
              <Table.Th style={{ width: 140 }}>厂商</Table.Th>
              <Table.Th style={{ width: 90 }}>类型</Table.Th>
              <Table.Th style={{ width: 120 }}>价格</Table.Th>
              <Table.Th style={{ width: 90 }}>状态</Table.Th>
              <Table.Th style={{ width: 156 }}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading && !models.length ? (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Group className={cn('stats-model-catalog-loading')} gap="xs" align="center">
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed">加载中…</Text>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ) : !pagedModels.length ? (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Text className={cn('stats-model-catalog-empty')} size="sm" c="dimmed">暂无模型</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              pagedModels.map((model) => (
                <Table.Tr key={`${model.vendorKey}:${model.modelKey}`}>
                  <Table.Td>
                    <Text size="sm" fw={600}>{model.modelKey}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{String((model.modelAlias || '').trim() || String(model.modelKey || '').trim() || '—')}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{model.labelZh}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{formatVendor(model.vendorKey)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatKind(model.kind)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {typeof model.pricing?.cost === 'number' ? Math.max(0, Math.floor(model.pricing.cost)) : defaultModelPricingCost(model.kind)}
                    </Text>
                    {!!model.pricing?.specCosts?.length && (
                      <Text size="xs" c="dimmed">
                        +{model.pricing.specCosts.length} 规格
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <EnabledBadge enabled={!!model.enabled} />
                  </Table.Td>
                  <Table.Td>
                    <Group className={cn('stats-model-catalog-model-row-actions flex-nowrap justify-end gap-1.5')} gap={6} justify="flex-end" wrap="nowrap">
                      <DesignButton size="xs" variant="light" onClick={() => onEditModel(model)}>编辑</DesignButton>
                      <IconActionButton size="sm" variant="light" aria-label="duplicate-model" onClick={() => onDuplicateModel(model)} icon={<IconCopyPlus size={14} />} />
                      <IconActionButton size="sm" variant="light" color="red" aria-label="delete-model" onClick={() => void onDeleteModel(model)} icon={<IconTrash size={14} />} />
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>

      <ModelCatalogTableFooter
        total={filteredModels.length}
        page={page}
        pageSize={pageSize}
        onChangePage={setPage}
        onChangePageSize={(next) => {
          setPageSize(next)
          setPage(1)
        }}
      />
    </>
  )
}
