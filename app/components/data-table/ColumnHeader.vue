<script setup lang="ts">
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, EyeOffIcon } from '@lucide/vue'

const {
  canHide = true,
  canSort = true,
  columnId,
  title,
} = defineProps<{
  canHide?: boolean
  canSort?: boolean
  columnId: string
  title: string
}>()
const sorting = defineModel<TableSorting | null>('sorting', { required: true })
const emit = defineEmits<{ hide: [] }>()

const direction = computed(() => (sorting.value?.id === columnId ? (sorting.value.desc ? 'desc' : 'asc') : null))
const directionLabel = computed(() => {
  if (direction.value === 'asc') return 'sorted ascending'
  if (direction.value === 'desc') return 'sorted descending'
  return 'not sorted'
})
</script>

<template>
  <div v-if="!canSort">{{ title }}</div>
  <div v-else class="flex items-center space-x-2">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="data-[state=open]:bg-accent -ml-3 h-8"
          :aria-label="`${title}, ${directionLabel}. Open column options`"
        >
          <span>{{ title }}</span>
          <ArrowDownIcon v-if="direction === 'desc'" class="text-primary-text ml-2 h-4 w-4" aria-hidden="true" />
          <ArrowUpIcon v-else-if="direction === 'asc'" class="text-primary-text ml-2 h-4 w-4" aria-hidden="true" />
          <ArrowUpDownIcon v-else class="text-primary-text ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem @select="sorting = { desc: false, id: columnId }">
          <ArrowUpIcon class="text-muted-foreground/70 mr-2 h-3.5 w-3.5" aria-hidden="true" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem @select="sorting = { desc: true, id: columnId }">
          <ArrowDownIcon class="text-muted-foreground/70 mr-2 h-3.5 w-3.5" aria-hidden="true" />
          Desc
        </DropdownMenuItem>
        <template v-if="canHide">
          <DropdownMenuSeparator />
          <DropdownMenuItem @select="emit('hide')">
            <EyeOffIcon class="text-muted-foreground/70 mr-2 h-3.5 w-3.5" aria-hidden="true" />
            Hide
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
