<script setup lang="ts">
import { useJwt } from '@vueuse/integrations/useJwt'
import { api as apiServices } from '~/common/composables'
import { currentUser, isAuthenticated, token } from '~/common/stores'

const router = useRouter()

onMounted(async() => {
  if (token.value && token.value.length) {
    const { payload } = useJwt(token)
    const { _idConnected: userId } = unref(payload)
    if (userId) {
      const { data: dataUser, error } = await apiServices(`/admin/${userId}`).json()
      dataUser.value && !error.value && (currentUser.value = dataUser.value)
    }
    else { await router.push('/auth') }
  }
  else { await router.push('/auth') }
})

watch(
  isAuthenticated,
  async(value: any) => {
    if (!value)
      await router.push('/auth')
  },
  { immediate: true },
)

</script>
<template>
  <a-layout>
    <LayoutHeader />
    <a-layout class="!min-h-[calc(100vh-55px)] relative">
      <LayoutSider class="!absolute !top-0 !md:block !md:relative" />
      <a-layout>
        <a-layout-content class="!min-h-1/2 !md:h-full !w-full !md:w-auto">
          <div ref="mapContainerRef" class="overflow-hidden !h-full !w-full relative">
            <a-skeleton v-if="!currentUser" class="p-5" active />
            <router-view v-else />
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<style lang="less">
</style>
