<script setup lang="ts">
import { message } from 'ant-design-vue'
import { api as apiServices } from '~/common/composables'

const search = ref('')
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
const columns = ref([
  {
    title: 'Catégorie de métiers',
    dataIndex: 'name',
    key: 'name',
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
        <a-input-search
          v-model:value="search" allow-clear placeholder="rechercher :" :loading="!dataJobs"
          :disabled="!search.length && dataJobs && dataJobs.length === 0" enter-button class="!w-55"
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
        -->
        <a-button key="1" type="primary" @click="() => { selectedJob = null, visibleJobFormModal = true }">
          Ajouter une catégorie
        </a-button>
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
      <a-table :loading="!dataJobs" size="small" :data-source="dataJobs || []" :columns="columns">
        <template #bodyCell="{ record, column, text }">
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
</route>
