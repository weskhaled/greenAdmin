<script setup lang="ts">
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { api as apiServices } from '~/common/composables'

const search = ref('')
const selectedSub = ref(null)
const visibleJobFormModal = ref(false)
const routes = [
  {
    path: 'dashboard-index',
    breadcrumbName: 'Dashboard',
  },
  {
    path: 'dashboard-subscriptions',
    breadcrumbName: 'Abonnements',
  },
]
const dataSubs = ref<any>(null)
const columns = ref([
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: true,
    align: 'center',
  },
  {
    title: 'Activité',
    dataIndex: 'active',
    key: 'active',
    sorter: true,
    filters: [
      { text: 'Oui', value: 'true' },
      { text: 'Non', value: 'false' },
    ],
    align: 'center',
  },
  {
    title: 'Création',
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: true,
    align: 'center',
  },
])
const getSubs = async() => {
  const { data, error } = await apiServices('/subscriptions/').json()
  data && !error.value && (dataSubs.value = data.value)
}
onMounted(() => {
  getSubs()
})
</script>

<template>
  <div>
    <a-page-header
      class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
      title="Abonnements" :breadcrumb="{ routes }" sub-title="Liste des abonnements"
    >
      <template #tags>
        <a-tag color="blue">
          Running
        </a-tag>
      </template>
      <template #extra>
        <a-input-search
          v-model:value="search" allow-clear placeholder="rechercher :" :loading="!dataSubs"
          :disabled="!search.length && dataSubs && dataSubs.length === 0" enter-button class="!w-55"
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
      </template>
    </a-page-header>
    <div class="drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
      <a-table :loading="!dataSubs" size="small" :data-source="dataSubs || []" :columns="columns">
        <template #bodyCell="{ record, column, text }">
          <template v-if="column.dataIndex === 'active'">
            <a-tag v-if="text === true" color="green">
              Oui
            </a-tag>
            <a-tag v-else color="red">
              Non
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'createdAt'">
            {{ dayjs(text).format('DD/MM/YYYY HH:mm') }}
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
    name: dashboard.subscriptions.index
    index: 1
    parentName: dashboard.subscriptions.parent
    link: dashboard-subscriptions
    classes: test for classes
    icon: i-carbon:industry
    childOf: null
</route>
