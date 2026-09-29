<script setup lang="ts">
import { ArrowLeftToLineIcon, ArrowRightToLineIcon, ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'

const { pageCount, pageSizes, total } = defineProps<{ pageCount: number; pageSizes: number[]; total: number }>()
const pageIndex = defineModel<number>('pageIndex', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const pageSizeValue = computed({
  get: () => String(pageSize.value),
  set: (value: string) => {
    pageSize.value = Number(value)
  },
})
const canPrevious = computed(() => pageIndex.value > 0)
const canNext = computed(() => pageIndex.value < pageCount - 1)
const firstRow = computed(() => pageIndex.value * pageSize.value + 1)
const lastRow = computed(() => Math.min(pageIndex.value * pageSize.value + pageSize.value, total))
</script>

<template>
  <nav class="flex items-center justify-between px-2" aria-label="Pagination">
    <div class="text-muted-foreground flex-1 text-sm" aria-live="polite">
      Showing {{ firstRow }} - {{ lastRow }} of {{ total }}
    </div>
    <div class="flex items-center space-x-6 lg:space-x-8">
      <div class="flex items-center space-x-2">
        <p id="rows-per-page-label" class="text-sm font-medium">Rows per page</p>
        <Select v-model="pageSizeValue">
          <SelectTrigger class="h-8 w-[70px]" aria-labelledby="rows-per-page-label">
            <SelectValue :placeholder="pageSizeValue" />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem v-for="size in pageSizes" :key="size" :value="String(size)">{{ size }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {{ pageIndex + 1 }} of {{ pageCount }}
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" class="hidden h-8 w-8 p-0 lg:flex" :disabled="!canPrevious" @click="pageIndex = 0">
          <span class="sr-only">Go to first page</span>
          <ArrowLeftToLineIcon class="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" class="h-8 w-8 p-0" :disabled="!canPrevious" @click="pageIndex--">
          <span class="sr-only">Go to previous page</span>
          <ChevronLeftIcon class="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" class="h-8 w-8 p-0" :disabled="!canNext" @click="pageIndex++">
          <span class="sr-only">Go to next page</span>
          <ChevronRightIcon class="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          class="hidden h-8 w-8 p-0 lg:flex"
          :disabled="!canNext"
          @click="pageIndex = pageCount - 1"
        >
          <span class="sr-only">Go to last page</span>
          <ArrowRightToLineIcon class="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  </nav>
</template>
