<script setup lang="ts">
import { EllipsisIcon } from '@lucide/vue'

const { editTo, label, viewTo } = defineProps<{ editTo?: string; label: string; viewTo: string }>()
</script>

<template>
  <div class="flex justify-end">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" class="data-[state=open]:bg-muted flex h-8 w-8 p-0">
          <EllipsisIcon class="h-4 w-4" aria-hidden="true" />
          <span class="sr-only">Open menu for {{ label }}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-[160px]">
        <DropdownMenuItem as-child>
          <NuxtLink :to="viewTo">View</NuxtLink>
        </DropdownMenuItem>
        <DropdownMenuItem v-if="editTo" as-child>
          <NuxtLink :to="editTo">Edit</NuxtLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
