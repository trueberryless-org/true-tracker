<script setup lang="ts">
const { user } = useTracker()
const currentTheme = computed(() => user.value?.settings.theme ?? 'default')
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="icon">
        <ThemeDiamond :title="`Color theme: ${currentTheme}`" color="current" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem v-for="theme in themes" :key="theme.value" class="group" @select="setColorTheme(theme.value)">
        <div class="flex items-center space-x-2">
          <ThemeDiamond :title="theme.label" :color="theme.value" />
          <div aria-hidden="true">{{ theme.label }}</div>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
