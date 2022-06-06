<script setup lang="ts">
import { message } from 'ant-design-vue'
import { reactive, ref } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { api as apiServices } from '~/common/composables'

const searchText = ref('')
const selectedJob = ref(null)
const visibleJobFormModal = ref(false)
const routes = [
  {
    path: 'dashboard-index',
    breadcrumbName: 'Dashboard',
  },
  {
    path: 'dashboard-jobs',
    breadcrumbName: 'Catégories de métiers',
  },
]
const dataJobs = ref<any>(null)
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
const columns = ref([
  {
    title: 'Catégorie de métiers',
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
  },
  {
    title: 'Action',
    key: 'operation',
    fixed: 'right',
    width: 200,
    align: 'center',
  },
])
const getJobs = async() => {
  const { data, error } = await apiServices('/jobs/').json()
  data && !error.value && (dataJobs.value = data.value)
}
onMounted(() => {
  getJobs()
})
const updateOrCreateJob = async(dataJob) => {
  if (dataJob._id) {
    const jobId = dataJob._id
    delete dataJob._id
    const { data: updateJob, error } = await apiServices(`/jobs/${jobId}`).patch(dataJob).json()
    updateJob.value && !error.value && (message.success(updateJob.value.message))
  }
  else {
    const { data: createJob, error } = await apiServices('/jobs/add-job').post(dataJob).json()
    createJob.value && !error.value && (message.success(createJob.value.message))
    if (error.value)
      message.error(createJob.value.message)
  }
  getJobs()
  visibleJobFormModal.value = false
}
const deleteJob = async(jobId) => {
  const { data: deleteJob, error } = await apiServices(`/jobs/${jobId}`).delete().json()
  deleteJob.value && !error.value && (message.success(deleteJob.value?.message))
  getJobs()
}

</script>

<template>
  <div>
    <a-page-header
      class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
      title="Catégories de métiers" :breadcrumb="{ routes }" sub-title="Liste des catégories de métiers"
    >
      <template #tags>
        <a-tag color="blue">
          Running
        </a-tag>
      </template>
      <template #extra>
        <a-button key="1" type="primary" @click="() => { selectedJob = null, visibleJobFormModal = true }">
          Ajouter une catégorie
        </a-button>
      </template>
    </a-page-header>
    <div class="drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
      <a-table :loading="!dataJobs" size="small" :data-source="dataJobs || []" :columns="columns">
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
          <template v-if="column.key === 'operation'">
            <a-button
              size="small" class="mr-1 inline-block" type="link"
              @click="() => {selectedJob = record, visibleJobFormModal = true }"
            >
              <span class="i-carbon-edit inline-block" />
            </a-button>
            <a-popconfirm title="êtes vous sûr ?" ok-text="Oui" cancel-text="Non" @confirm="deleteJob(record._id)">
              <a-button size="small" class="mr-1 inline-block" type="link" danger>
                <span key="delete" class="i-carbon-delete inline-block" />
              </a-button>
            </a-popconfirm>
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
  <job-form-modal
    v-model:visible="visibleJobFormModal"
    :job="selectedJob" @after-close="() => selectedJob = null"
    @update-or-create-job="updateOrCreateJob"
  />
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
    name: dashboard.jobs.index
    index: 1
    parentName: dashboard.jobs.parent
    link: dashboard-jobs
    classes: test for classes
    icon: i-carbon:industry
    childOf: null
    roles: [Root, Admin]
</route>
