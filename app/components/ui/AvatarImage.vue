<script setup lang="ts">
import { AvatarImage, type AvatarImageProps } from 'reka-ui'

const props = defineProps<AvatarImageProps & { alt?: string }>()
</script>

<template>
  <AvatarImage v-bind="props" :alt="alt ?? ''" class="aspect-square h-full w-full" />
</template>
