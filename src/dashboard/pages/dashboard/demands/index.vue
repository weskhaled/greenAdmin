<script setup lang="ts">
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { api as apiServices } from '~/common/composables'

const router = useRouter()
const search = ref('')
const props = defineProps<{ id: string }>()

const routes = [
  {
    path: 'dashboard-index',
    breadcrumbName: 'Dashboard',
  },
  {
    path: 'dashboard-demands',
    breadcrumbName: 'Demandes de recherche',
  },
]
const dataDemands = ref<any>(null)
const columns = ref([
  {
    title: 'mission',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
  },
  {
    title: 'Etat',
    dataIndex: 'state',
    key: 'state',
    sorter: true,
    filters: [
      { text: 'validé', value: 'validé' },
      { text: 'refusé', value: 'refusé' },
      { text: 'en cours', value: 'en cours' },
    ],
    align: 'center',
  },
  {
    title: 'Création',
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: true,
  },
  {
    title: 'Action',
    key: 'operation',
    fixed: 'right',
    width: 200,
    align: 'center',
  },
])
const getDemands = async() => {
  const { data, error } = await apiServices('/demands/').json()
  data && !error.value && (dataDemands.value = data.value.demands)
}
onMounted(() => {
  getDemands()
})
</script>

<template>
  <div>
    <a-page-header
      class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
      title="Demandes" :breadcrumb="{ routes }" sub-title="Liste des demandes de recherche"
    >
      <template #tags>
        <a-tag color="blue">
          Running
        </a-tag>
      </template>
      <template #extra>
        <a-input-search
          v-model:value="search" allow-clear placeholder="rechercher :" :loading="!dataDemands"
          :disabled="!search.length && dataDemands && dataDemands.length === 0" enter-button class="!w-55"
        >
          <template v-if="false" #suffix>
            <a-tooltip title="scroll to device">
              <a-button type="link" size="small">
                <template #icon>
                  <span class="i-carbon-auto-scroll anticon block text-sm text-opacity-10" />
                </template>
              </a-button>
            </a-tooltip>
          </template>
        </a-input-search>
        <!--
        <a-button key="2">
          Operation
        </a-button>

        <a-button key="1" type="primary" @click="() => { selectedUser = null, visibleUserFormModal = true }">
          Ajouter un Admin
        </a-button>-->
        <!--
        <a-dropdown key="more">
          <a-button class="!border-none !px-1" type="link">
            <span class="i-carbon-overflow-menu-horizontal inline-block anticon text-lg !align-top" />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
                  1st menu item
                </a>
              </a-menu-item>
              <a-menu-item>
                <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
                  2nd menu item
                </a>
              </a-menu-item>
              <a-menu-item>
                <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
                  3rd menu item
                </a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        -->
      </template>
    </a-page-header>
    <div class="drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
      <a-table :loading="!dataDemands" size="small" :data-source="dataDemands || []" :columns="columns">
        <template #bodyCell="{ record, column, text }">
          <template v-if="column.dataIndex === 'state'">
            <a-tag v-if="text === 'validé'" color="green">
              validé
            </a-tag>
            <a-tag v-else-if="text === 'refusé'" color="red">
              refusé
            </a-tag>
            <a-tag v-else color="blue">
              en cours
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'createdAt'">
            {{ dayjs(text).format('DD/MM/YYYY HH:mm') }}
          </template>
          <template v-if="column.key === 'operation'">
            <a-button
              size="small" class="mr-1 inline-block" type="link"
              @click="() => { router.push(`/dashboard/missions/${record.id_mission}`) }"
            >
              <span class="i-carbon-view inline-block" />
            </a-button>
            <a-button
              size="small" class="mr-1 inline-block" type="link"
              @click="() => { router.push(`/dashboard/demands/search/${record._id}`) }"
            >
              <span class="i-carbon-search inline-block" />
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>
<style lang="less">
.pagination-container {
  height: 420px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &__list {
    height: 370px;
    overflow: auto;

    &-suffix {
      margin-right: 20px;
    }
  }
}
</style>
<route lang="yaml">
meta:
  layout: admin
  siderMenu:
    name: dashboard.demands.index
    index: 1
    parentName: dashboard.demands.parent
    link: dashboard-demands
    classes: test for classes
    icon: i-carbon:ticket
    childOf: null
</route>
