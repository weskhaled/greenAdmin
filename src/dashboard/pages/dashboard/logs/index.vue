<script setup lang="ts">
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { api as apiServices } from '~/common/composables'

const search = ref('')
const selectedLog = ref(null)
const visibleLogFormModal = ref(false)
const routes = [
  {
    path: 'dashboard-index',
    breadcrumbName: 'Dashboard',
  },
  {
    path: 'dashboard-logs',
    breadcrumbName: 'Logs',
  },
]
const dataLogs = ref<any>(null)
const columns = ref([
  {
    title: 'Message',
    dataIndex: 'message',
    key: 'message',
    sorter: true,
    align: 'center',
  },
  {
    title: 'Validation',
    dataIndex: 'checked',
    key: 'checked',
    sorter: true,
    filters: [
      { text: 'Oui', value: 'true' },
      { text: 'Non', value: 'false' },
    ],
    align: 'center',
  },
  {
    title: 'Création',
    dataIndex: 'timestamp',
    key: 'timestamp',
    sorter: true,
    align: 'center',

  },
  {
    title: 'Action',
    key: 'operation',
    fixed: 'right',
    width: 200,
    align: 'center',
  },
])
const getLogs = async() => {
  const { data, error } = await apiServices('/logs/').json()
  data && !error.value && (dataLogs.value = data.value)
}
const checkOrUncheckLog = async(logId, checked) => {
  if (checked) {
    const { data: uncheckLog, error } = await apiServices(`/logs/uncheck/${logId}`).patch().json()
    uncheckLog.value && !error.value && (message.success(uncheckLog.value?.message))
    getLogs()
  }
  else {
    const { data: checkLog, error } = await apiServices(`/logs/check/${logId}`).patch().json()
    checkLog.value && !error.value && (message.success(checkLog.value?.message))
    getLogs()
  }
}
onMounted(() => {
  getLogs()
})

</script>

<template>
  <div>
    <a-page-header
      class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
      title="Journalisations" :breadcrumb="{ routes }" sub-title="Liste des erreurs"
    >
      <template #tags>
        <a-tag color="blue">
          Running
        </a-tag>
      </template>
      <template #extra>
        <a-input-search
          v-model:value="search" allow-clear placeholder="rechercher :" :loading="!dataLogs"
          :disabled="!search.length && dataLogs && dataLogs.length === 0" enter-button class="!w-55"
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
      <a-table :loading="!dataLogs" size="small" :data-source="dataLogs || []" :columns="columns">
        <template #bodyCell="{ record, column, text }">
          <template v-if="column.dataIndex === 'checked'">
            <a-tag :color="text === true ? 'green' : 'red'">
              {{ text === true ? 'Oui' : 'Non' }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'timestamp'">
            {{ dayjs(text).format('DD/MM/YYYY HH:mm') }}
          </template>
          <template v-if="column.key === 'operation'">
            <a-button
              size="small" class="mr-1 inline-block" type="link"
              @click="() => {selectedLog = record, visibleLogFormModal = true }"
            >
              <span class="i-carbon-view inline-block" />
            </a-button>
            <a-popconfirm title="êtes vous sûr ?" ok-text="Oui" cancel-text="Non" @confirm="checkOrUncheckLog(record._id,record.checked)">
              <a-button v-if="text.checked == true" size="small" class="mr-1 inline-block" type="link" warn>
                <span class="i-carbon-misuse-outline inline-block" />
              </a-button>
              <a-button v-else size="small" class="mr-1 inline-block" type="link" warn>
                <span class="i-carbon-checkmark-outline inline-block" />
              </a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <a-modal
    v-model:visible="visibleLogFormModal"
    width="40%"
    title="Détails"
    footer=""
  >
    <div>
      <label v-if="selectedLog.meta.ip"><b>IP : </b> {{ selectedLog.meta.ip }} <br></label>
      <label v-if="selectedLog.meta.userAgent"><b>Agent : </b> {{ selectedLog.meta.userAgent }} <br></label>
      <label v-if="selectedLog.meta.url"><b>URL API : </b> {{ selectedLog.meta.url }} <br></label>
      <label v-if="selectedLog.meta.headers"><b>Headers : </b><br> {{ selectedLog.meta.headers }} <br></label>
      <label v-if="selectedLog.meta.body"><b>Body : </b><br> {{ selectedLog.meta.body }} <br></label>
      <label v-if="selectedLog.meta.err"><b>Erreur : </b><br> {{ selectedLog.meta.err }} <br></label>
    </div>
  </a-modal>
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
    name: dashboard.logs.index
    index: 1
    parentName: dashboard.logs.parent
    link: dashboard-logs
    classes: test for classes
    icon: i-carbon:blog
    childOf: null
    roles: [Root]
</route>
