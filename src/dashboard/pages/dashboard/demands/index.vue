<script setup lang="ts">
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { defineComponent, reactive, ref, toRefs } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
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
    title: 'mission',
    dataIndex: 'name',
    key: 'name',
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.name.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus()
        }, 100)
      }
    },
    align: 'center',
  },
  {
    title: 'Etat',
    dataIndex: 'state',
    key: 'state',
    filters: [
      { text: 'validé', value: 'validé' },
      { text: 'refusé', value: 'refusé' },
      { text: 'en cours', value: 'en cours' },
    ],
    onFilter: (value, record) =>
      record.state === value,
    align: 'center',
  },
  {
    title: 'Création',
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
    sorter: true,
  },
  {
    title: 'Action',
    key: 'operation',
    fixed: 'right',
    width: 200,
    align: 'center',
  },
]
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
    </a-page-header>
    <div class="drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
      <a-table :loading="!dataDemands" size="small" :data-source="dataDemands || []" :columns="columns">
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
    name: dashboard.demands.index
    index: 1
    parentName: dashboard.demands.parent
    link: dashboard-demands
    classes: test for classes
    icon: i-carbon:ticket
    childOf: null
</route>
