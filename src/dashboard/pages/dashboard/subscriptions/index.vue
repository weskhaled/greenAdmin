<script setup lang="ts">
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { defineComponent, reactive, ref, toRefs } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
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
const state = reactive({
  searchText: '',
  searchedColumn: '',
})

const searchInput = ref()
const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm()
  state.searchText = selectedKeys[0]
  state.searchedColumn = dataIndex
}

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true })
  state.searchText = ''
}

const columns: TableColumnsType = [
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.email.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus()
        }, 100)
      }
    },
  },
  {
    title: 'Activité',
    dataIndex: 'active',
    key: 'active',
    filters: [
      { text: 'Oui', value: true },
      { text: 'Non', value: false },
    ],
    align: 'center',
    onFilter: (value, record) =>
      record.active === value,
  },
  {
    title: 'Création',
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
  },
]
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
    </a-page-header>
    <div class="drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
      <a-table :loading="!dataSubs" size="small" :data-source="dataSubs || []" :columns="columns">
        <template #bodyCell="{ record, column, text }">
          <span v-if="searchText && searchedColumn === column.dataIndex">
            <template
              v-for="(fragment, i) in text
                .toString()
                .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
            >
              <mark
                v-if="fragment.toLowerCase() === searchText.toLowerCase()"
                :key="i"
                class="highlight"
              >
                {{ fragment }}
              </mark>
              <template v-else>{{ fragment }}</template>
            </template>
          </span>
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
        <template
          #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        >
          <div style="padding: 8px">
            <a-input
              ref="searchInput"
              :placeholder="`Search ${column.dataIndex}`"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block"
              @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
              @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
            />
            <a-button
              type="primary"
              size="small"
              style="width: 90px; margin-right: 8px"
              @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              <template #icon>
                <SearchOutlined />
              </template>
            </a-button>
            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
              Initialiser
            </a-button>
          </div>
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
    roles: [Root, Admin]
</route>
