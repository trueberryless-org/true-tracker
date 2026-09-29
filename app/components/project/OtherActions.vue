<script setup lang="ts">
const { short = false } = defineProps<{ short?: boolean }>()
const emit = defineEmits<{ archive: []; delete: [] }>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm">Other Actions</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56">
      <DropdownMenuItem @select="emit('archive')">{{ short ? 'Archive' : 'Archive Project' }}</DropdownMenuItem>
      <DropdownMenuItem @select="emit('delete')">{{ short ? 'Delete' : 'Delete Project' }}</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
