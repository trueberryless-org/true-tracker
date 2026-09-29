<script setup lang="ts">
import { CheckIcon, CirclePlusIcon, Search } from '@lucide/vue'
import { ListboxContent, ListboxFilter, ListboxGroup, ListboxItem, ListboxRoot } from 'reka-ui'

const CLEAR_VALUE = '__clear__'

const { facets, options, title } = defineProps<{
  facets: Map<string, number>
  options: FilterOption[]
  title: string
}>()
const selected = defineModel<string[] | undefined>({ required: true })
const search = ref('')

const selectedValues = computed(() => new Set(selected.value ?? []))
const visibleOptions = computed(() =>
  options.filter((option) => option.label.toLowerCase().includes(search.value.trim().toLowerCase())),
)
const selectedOptions = computed(() => options.filter((option) => selectedValues.value.has(option.value)))

function toggleOption(value: string) {
  if (value === CLEAR_VALUE) {
    selected.value = undefined
    return
  }
  const next = new Set(selectedValues.value)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  selected.value = next.size ? [...next] : undefined
}

const itemClass =
  'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="h-8 border-dashed">
        <CirclePlusIcon class="mr-2 h-4 w-4" aria-hidden="true" />
        {{ title }}
        <template v-if="selectedValues.size > 0">
          <Separator orientation="vertical" class="mx-2 h-4" />
          <Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
            {{ selectedValues.size }}
            <span class="sr-only">selected</span>
          </Badge>
          <div class="hidden space-x-1 lg:flex">
            <Badge v-if="selectedValues.size > 2" variant="secondary" class="rounded-sm px-1 font-normal">
              {{ selectedValues.size }} selected
            </Badge>
            <template v-else>
              <Badge
                v-for="option in selectedOptions"
                :key="option.value"
                variant="secondary"
                class="rounded-sm px-1 font-normal"
              >
                {{ option.label }}
              </Badge>
            </template>
          </div>
        </template>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0" align="start">
      <ListboxRoot
        :model-value="[...selectedValues]"
        multiple
        :aria-label="`Filter by ${title}`"
        class="bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md"
        @update:model-value="() => {}"
      >
        <div class="flex items-center border-b px-3">
          <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
          <ListboxFilter
            v-model="search"
            auto-focus
            :placeholder="title"
            :aria-label="`Search ${title}`"
            class="placeholder:text-muted-foreground flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <ListboxContent class="max-h-[300px] overflow-x-hidden overflow-y-auto">
          <div v-if="visibleOptions.length === 0" class="py-6 text-center text-sm" role="status">No results found.</div>
          <ListboxGroup class="text-foreground overflow-hidden p-1">
            <ListboxItem
              v-for="option in visibleOptions"
              :key="option.value"
              :value="option.value"
              :class="itemClass"
              @select.prevent="toggleOption(option.value)"
            >
              <div
                :class="
                  cn(
                    'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                    selectedValues.has(option.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'opacity-50 [&_svg]:invisible',
                  )
                "
                aria-hidden="true"
              >
                <CheckIcon class="h-4 w-4" />
              </div>
              <component
                :is="option.icon"
                v-if="option.icon"
                class="text-muted-foreground mr-2 h-4 w-4"
                aria-hidden="true"
              />
              <span>{{ option.label }}</span>
              <span
                v-if="facets.get(option.value)"
                class="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs"
                :aria-label="`${facets.get(option.value)} rows`"
              >
                {{ facets.get(option.value) }}
              </span>
            </ListboxItem>
          </ListboxGroup>
          <template v-if="selectedValues.size > 0">
            <div class="bg-border -mx-1 h-px" role="separator" />
            <ListboxGroup class="text-foreground overflow-hidden p-1">
              <ListboxItem
                :value="CLEAR_VALUE"
                :class="cn(itemClass, 'justify-center text-center')"
                @select.prevent="toggleOption(CLEAR_VALUE)"
              >
                Clear filters
              </ListboxItem>
            </ListboxGroup>
          </template>
        </ListboxContent>
      </ListboxRoot>
    </PopoverContent>
  </Popover>
</template>
