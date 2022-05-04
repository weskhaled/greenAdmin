<script setup lang="ts">
import generatedRoutes from 'virtual:generated-pages'
import { MenuItem, SubMenu } from 'ant-design-vue'

import { isDark } from '~/common/composables'
import { mdAndLarger, sideCollapsed } from '~/common/stores'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const menuItems = computed(() => {
  const groupedMenu = generatedRoutes.filter(r => r.meta?.siderMenu).map(r => ({ routeName: r.name, requiresAuth: r.meta?.requiresAuth, path: r.path, ...r.meta?.siderMenu })).reduce((result, currentValue) => {
  // If an array already present for key, push it to the array. Else create an array and push the object
    (result[currentValue.childOf] = result[currentValue.childOf] || []).push(
      currentValue,
    )
    // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
    return result
  }, {})

  return groupedMenu.null.map(pr => ({
    ...pr,
    children: groupedMenu[pr.routeName] ? ([{ ...{ ...pr, index: 0, childOf: pr.routeName } }, ...groupedMenu[pr.routeName]] || [{ ...{ ...pr, childOf: pr.routeName } }]).sort((a, b) => a.index < b.index ? -1 : (a.index > b.index ? 1 : 0)) : undefined,
  })).sort((a, b) => a.index < b.index ? -1 : (a.index > b.index ? 1 : 0))
})
const selectedKeysSider = ref<string[]>([])
const openKeySider = ref<string[]>([])
onMounted(() => {
  const activeMenu = generatedRoutes.find(gr => gr.path === route.path)?.name as string
  const openedMenu = menuItems.value.filter(r => r.children).map(cr => cr.children).flat().find(gr => gr.path === route.path)?.childOf as string
  activeMenu && selectedKeysSider.value.push(activeMenu)
  openedMenu && openKeySider.value.push(openedMenu)
})
</script>

<template>
  <a-layout-sider
    class="z-42 md:rounded-none rounded-b-sm overflow-hidden" :collapsed="sideCollapsed" :trigger="null"
    collapsed-width="60"
    width="240"
  >
    <a-menu
      v-model:selectedKeys="selectedKeysSider" v-model:openKeys="openKeySider" :inline-indent="24"
      :theme="isDark ? 'dark' : 'light'" :mode="mdAndLarger ? 'inline' : 'horizontal'" :style="{ height: '100%' }"
      class="!dark:border-r-1px !dark:border-white/5 !pt-2" @click="({ key }) => $router.push({ name: key })"
    >
      <component :is="parent.children ? SubMenu : MenuItem" v-for="parent in menuItems" :key="parent.link">
        <template v-if="parent.children" #title>
          <span>
            <span :class="parent.parentIcon || parent.icon" class="inline-block anticon text-lg" />
            <span>{{ t(`sidebarMenu.${parent.parentName}`) }}</span>
          </span>
        </template>
        <template v-if="parent.children">
          <component :is="MenuItem" v-for="item in parent.children" :key="item.link">
            <span class>
              <span :class="item.icon" class="inline-block anticon text-lg" />
              <span>{{ t(`sidebarMenu.${item.name}`) }}</span>
            </span>
          </component>
        </template>
        <span v-else class>
          <span :class="parent.icon" class="inline-block anticon text-lg" />
          <span>{{ t(`sidebarMenu.${parent.name}`) }}</span>
        </span>
      </component>
    </a-menu>
  </a-layout-sider>
</template>
<style lang="less">
.ant-menu-inline .ant-menu-item:first-child {
  @apply  !mt-0;
}

.ant-menu.ant-menu-vertical.ant-menu-root {

  >.ant-menu-item,
  .ant-menu-submenu.ant-menu-submenu-vertical,
  .ant-menu-vertical .ant-menu-submenu-title,
  .ant-menu-vertical>.ant-menu-submenu>.ant-menu-submenu-title {
    &:first-child {
      @apply  !mt-0;
    }

    // @apply  !h-55px !leading-55px;
  }
}

.ant-menu-submenu-title,
.ant-menu-vertical>.ant-menu-item,
.ant-menu-vertical>.ant-menu-item:not(.ant-menu-item-only-child),
.ant-menu-vertical-left>.ant-menu-item,
.ant-menu-vertical-right>.ant-menu-item,
.ant-menu-inline:not(.ant-menu-sub)>.ant-menu-item {
  @apply  !h-50px !leading-50px;
}

.ant-menu.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
  @apply  !bg-green-300/10 relative;

  &:before {
    content: "";
    @apply block absolute w-full rounded-2xl bg-[#129c44];
    top: calc(10%);
    height: calc(80%);
    right: calc(100% - 5px);
  }
}
.ant-tooltip.ant-menu-inline-collapsed-tooltip.ant-tooltip-placement-right {
  .anticon {
    @apply mr-1;
  }
}
</style>
