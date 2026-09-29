<script setup lang="ts">
const { confirmLabel = 'Continue', showCancel = true } = defineProps<{ confirmLabel?: string; showCancel?: boolean }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ confirm: [] }>()

function confirm() {
  open.value = false
  emit('confirm')
}
</script>

<template>
  <Dialog v-model:open="open">
    <slot name="trigger" />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>
          <slot />
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose v-if="showCancel" as-child>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button @click="confirm">{{ confirmLabel }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
