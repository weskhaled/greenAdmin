<script setup lang="ts">
import { isDark, urlSearchParams } from '~/common/composables'
import { currentUser, mdAndLarger, sideCollapsed, token } from '~/common/stores'

const { t, availableLocales, locale } = useI18n()
// const router = useRouter()
const { width } = useWindowSize()
</script>

<template>
  <a-layout-header
    :theme="isDark"
    class="layout-header header flex items-center drop-shadow-[0_0px_2px_rgba(0,0,0,0.15)] z-45 !h-55px !px-4"
    :class="isDark ? '!bg-dark-800' : '!bg-white'"
  >
    <div
      :class="'!w-56'"
      class="h-full ml-0 transition-all ease-out delay-0.2s flex items-center border-r-1 border-dark-100/5 dark:border-light-100/5"
    >
      <a href="" class="inline-block mr-2" @click.prevent="$router.push({name: 'dashboard'})">
        <a-badge-ribbon class="!text-10px !-top-2.2 !rounded-2px">
          <template #text>
            by greenPostive
          </template>
          <span
            class="bg-green-100 w-auto text-green-600 rounded-sm py-2 px-4 font-mono font-bold inline-block flex items-center text-1rem leading-6"
          >
            greenAdmin
          </span>
        </a-badge-ribbon>
      </a>
    </div>
    <button class="p-2">
      <span
        :class="sideCollapsed ? 'i-ant-design-menu-unfold-outlined' : 'i-ant-design-menu-fold-outlined'"
        class="block text-lg text-green-900 dark:text-green-200" @click="() => (sideCollapsed = !sideCollapsed)"
      />
    </button>

    <div class="ml-auto flex items-center h-full px-3">
      <DarkSwitch class="hidden sm:block" />
      <a-dropdown class="md:mx-2">
        <a-button
          type="link" :loading="!currentUser"
          class="!flex justify-between items-center leading-12 !px-0.5 dark:text-white dark:hover:text-light-800"
          @click.prevent
        >
          <span v-if="currentUser" class="capitalize mx-0.5">
            {{ currentUser.username }}
          </span>
          <div class="!flex items-center">
            <span class="i-ph-user-circle-duotone inline-block text-lg hidden md:block" />
            <span class="i-ph-caret-down inline-block !text-11px ml-1" />
          </div>
        </a-button>
        <template v-if="currentUser" #overlay>
          <a-menu>
            <a-menu-item>
              <a href="javascript:;" class="flex items-center text-md leading-8">
                <span class="i-ph-user-circle-duotone inline-block mr-1" />
                Profile
              </a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;" class="flex items-center text-md leading-8">
                <span class="i-carbon-settings inline-block mr-1" />
                Settings
              </a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;" class="flex items-center text-md leading-8" @click="() => token = null">
                <span class="i-carbon-logout inline-block mr-1" />
                Logout
              </a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <div class="hidden sm:flex">
        <a-dropdown class="mr-0">
          <a-button
            type="link" class="!flex items-center leading-12 !px-0.5 dark:text-white dark:hover:text-light-800"
            @click.prevent
          >
            <span class="inline-block text-md uppercase min-w-6">{{ locale }}</span>
            <span class="mx-0.5">
              <img
                :src="`https://api.iconify.design/circle-flags:${locale === 'en' ? 'us' : locale}.svg?width=15px&height=15px`"
                :alt="locale"
              >
            </span>
            <span class="i-ph-caret-down inline-block ml-1 !text-11px" />
          </a-button>
          <template #overlay>
            <a-menu class="max-h-55 overflow-y-auto">
              <a-menu-item v-for="availableLocale in availableLocales" :key="availableLocale" class="min-w-25">
                <a
                  href="javascript:;" class="flex items-center text-md pr-2 text-left leading-8"
                  @click="() => locale = availableLocale"
                >
                  <span class="inline-block mr-2">
                    <img
                      :src="`https://api.iconify.design/circle-flags:${availableLocale === 'en' ? 'us' : availableLocale}.svg?width=16px&height=16px`"
                      :alt="availableLocale"
                    >
                  </span>
                  <span class="text-md uppercase">
                    {{ availableLocale }}
                  </span>
                </a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </a-layout-header>
</template>
<style lang="less">
</style>
