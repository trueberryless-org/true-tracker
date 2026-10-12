<script setup lang="ts" generic="T">
import { SlidersHorizontalIcon } from '@lucide/vue'

const { columns, hidden } = defineProps<{ columns: TableColumn<T>[]; hidden: Set<string> }>()
const emit = defineEmits<{ toggle: [id: string, visible: boolean] }>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm" class="ml-auto hidden h-8 lg:flex">
        <SlidersHorizontalIcon class="mr-2 h-4 w-4" aria-hidden="true" />
        View
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[150px]">
      <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem
        v-for="column in columns"
        :key="column.id"
        class="capitalize"
        :model-value="!hidden.has(column.id)"
        @update:model-value="(value) => emit('toggle', column.id, Boolean(value))"
      >
        {{ column.id }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
