<script setup lang="ts">
const props = defineProps<{
  socials: any
}>()

</script>

<template>
  <div class="flex mt-3">
    <a
      v-for="(social, index) in socials"
      :key="index"
      :href="social.link"
      :class="!social.link && 'hidden'"
    >
      <span :class="`${social.icon} text-2xl block ${social.classes}`" />
    </a>
  </div>
</template>
