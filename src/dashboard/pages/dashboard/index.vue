<script setup lang="ts">
import { rejects } from 'assert'
import type Dayjs from 'dayjs'
import dayjs from 'dayjs'
import { TransitionPresets, useDateFormat, useNow, useTransition } from '@vueuse/core'

import { mdAndLarger, sideCollapsed } from '~/common/stores'
import { urlSearchParams } from '~/common/composables'

const router = useRouter()
const { t } = useI18n()
const { isFullscreen, toggle: toggleFullScreen } = useFullscreen(document.body)

const { coords, isSupported } = useGeolocation()
const [asideCollapsed, toggleAsideCollapsed] = useToggle()
</script>

<template>
  <div class="flex w-full relative !flex-col-reverse !md:flex-row p-0">
    <p>
      <em text-sm opacity-75>{{ t('intro.desc') }}</em>
    </p>
  </div>
</template>
<style lang="less">
.vue-map-container {
  width: 100%;
  height: 100%;
}

.device-history-table {
  .ant-tabs-nav {
    @apply bg-zinc-100 dark:bg-dark-500;
  }

  .ant-tabs-content {
    @apply h-full;
  }
}
</style>
<route lang="yaml">
meta:
  layout: admin
  siderMenu:
    name: dashboard.index
    index: 0
    link: dashboard
    classes: test for classes
    icon: i-carbon-meter
    childOf: null
</route>
