<script setup lang="ts">
import { PopoverClose } from 'reka-ui'

const {
  confirmLabel = 'Confirm',
  title,
  variant = 'default',
} = defineProps<{
  confirmLabel?: string
  title: string
  variant?: ButtonVariants['variant']
}>()
const open = ref(false)
const emit = defineEmits<{ confirm: [] }>()
const titleId = useId()

function confirm() {
  open.value = false
  emit('confirm')
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverContent class="w-80 space-y-3" align="start" :aria-labelledby="titleId">
      <p :id="titleId" class="text-sm font-semibold">{{ title }}</p>
      <div class="text-muted-foreground space-y-2 text-sm">
        <slot />
      </div>
      <div class="flex justify-end gap-2">
        <PopoverClose as-child>
          <Button variant="outline" size="sm">Cancel</Button>
        </PopoverClose>
        <Button size="sm" :variant="variant" @click="confirm">{{ confirmLabel }}</Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
