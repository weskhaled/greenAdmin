<script setup lang="ts">
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { api as apiServices } from '~/common/composables'

const search = ref('')
const selectedNotif = ref(null)
const visibleNotifAdminFormModal = ref(false)

const formStateChanges = reactive<Record<string, any>>({
  changes: null,
})
const formStatePeriod = reactive<Record<string, any>>({
  dateBegin: null,
  dateEnd: null,
})
const showChanges = (changes: any) => {
  formStateChanges.changes = changes
  visibleNotifAdminFormModal.value = true
}
const routes = [
  {
    path: 'dashboard-index',
    breadcrumbName: 'Dashboard',
  },
  {
    path: 'dashboard-notifications-admin',
    breadcrumbName: 'notifications admin',
  },
]
const dataAdmins = ref<any>(null)
const columns = ref([
  {
    title: 'administrateur ou éditeur',
    dataIndex: 'username',
    key: 'username',
    sorter: true,
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    sorter: true,
    align: 'center',

  },
  {
    title: 'Visibilité',
    dataIndex: 'checked',
    key: 'checked',
    sorter: true,
    align: 'center',
    filters: [
      { text: 'Vu', value: 'true' },
      { text: 'Non vu', value: 'false' },
    ],
  },
  {
    title: 'Création',
    dataIndex: 'createdAt',
    key: 'createdAt',
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
const getNotifs = async() => {
  const { data, error } = await apiServices('/notification-posts/unchecked').json()
  data && !error.value && (dataAdmins.value = data.value)
}
onMounted(() => {
  getNotifs()
})
const validateOrUnvalidateNotif = async(notification) => {
  const params = { username: notification.username, changes: notification.changes }
  if (!notification.checked) {
    const { data: docAdmin, error } = await apiServices(`/notification-posts/check/${notification._id}`).patch(params).json()
    docAdmin.value && !error.value && (message.success(docAdmin.value?.message))
    getNotifs()
  }
  else {
    const { data: docAdmin, error } = await apiServices(`/notification-posts/uncheck/${notification._id}`).patch(params).json()
    docAdmin.value && !error.value && (message.success(docAdmin.value?.message))
    getNotifs()
  }
}
const filterDate = async() => {
  console.log('in filter')
  dataAdmins.value.filter(
    j => j.date >= formStatePeriod.dateBegin && j.date >= formStatePeriod.dateEnd,
  )
}
</script>

<template>
  <div>
    <a-page-header
      class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
      title="Notifications administrateurs" :breadcrumb="{ routes }" sub-title="Liste des notifications"
    >
      <template #tags>
        <a-tag color="blue">
          Running
        </a-tag>
      </template>
      <template #extra>
        <a-date-picker
          v-model:value="formStatePeriod.dateBegin"
          class="!w-55" value-format="YYYY-MM-DD"
          :disabled-date="(current: Dayjs) => current && current > dayjs().endOf('day')"
        />
        <a-date-picker
          v-model:value="formStatePeriod.dateEnd"
          class="!w-55" value-format="YYYY-MM-DD"
          :disabled-date="(current: Dayjs) => current && current > dayjs().endOf('day')"
        />
        <a-button
          size="small" class="mr-1 inline-block" type="link"
          @click.prevent="filterDate()"
        >
          <span class="i-carbon-search inline-block" />
        </a-button>
        <a-input-search
          v-model:value="search" allow-clear placeholder="rechercher :" :loading="!dataAdmins"
          :disabled="!search.length && dataAdmins && dataAdmins.length === 0" enter-button class="!w-55"
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
      <a-table :loading="!dataAdmins" size="small" :data-source="dataAdmins || []" :columns="columns">
        <template #bodyCell="{ record, column, text }">
          <template v-if="column.dataIndex === 'checked'">
            <a-tag :color="text === true ? 'green' : 'red'">
              {{ text === true ? 'Vu' : 'Non vu' }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'createdAt'">
            {{ dayjs(text).format('DD/MM/YYYY HH:mm') }}
          </template>
          <template v-if="column.dataIndex === 'date'">
            {{ dayjs(text).format('DD/MM/YYYY HH:mm') }}
          </template>
          <template v-if="column.key === 'operation'">
            <a-button
              size="small" class="mr-1 inline-block" type="link"
              @click.prevent="showChanges(record.changes)"
            >
              <span class="i-carbon-view inline-block" />
            </a-button>

            <a-popconfirm title="êtes vous sûr ?" ok-text="Oui" cancel-text="Non" @confirm="validateOrUnvalidateNotif(record)">
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
    v-model:visible="visibleNotifAdminFormModal"
    width="40%"
    title="Modifications"
    footer=""
  >
    <div>
      <label v-if="formStateChanges.changes.title"><b>Titre :</b> {{ formStateChanges.changes.title }} <br></label>
      <label v-if="formStateChanges.changes.author"><b>Auteur :</b> {{ formStateChanges.changes.author }} <br></label>
      <label v-if="formStateChanges.changes.resume"><b>Résumé :</b> {{ formStateChanges.changes.resume }} <br></label>
      <label v-if="formStateChanges.changes.content"><b>Contenu :</b> {{ formStateChanges.changes.content }} <br></label>
      <label v-if="formStateChanges.changes.url_fb"><b>Lien FB :</b> {{ formStateChanges.changes.url_fb }} <br></label>
      <label v-if="formStateChanges.changes.url_instagram"><b>Lien Instagram :</b> {{ formStateChanges.changes.url_instagram }} <br></label>
      <label v-if="formStateChanges.changes.url_twitter"><b>Lien Twitter :</b> {{ formStateChanges.changes.url_twitter }} <br></label>
      <label v-if="formStateChanges.changes.url_linkedin"><b>Lien Linkedin :</b> {{ formStateChanges.changes.url_linkedin }} <br></label>
      <label v-if="formStateChanges.changes.state"><b>Etat :</b>
        <div v-if="formStateChanges.changes.state === 'created'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Création
        </a-tag>
        </div>
        <div v-else-if="formStateChanges.changes.state === 'updated'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Modification
        </a-tag>
        </div>
        <div v-else-if="formStateChanges.changes.state === 'published'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Publié
        </a-tag>
        </div>
        <div v-else-if="formStateChanges.changes.state === 'bloqued'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Bloqué
        </a-tag>
        </div>
      </label>
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
    name: dashboard.notifications.posts
    index: 1
    parentName: dashboard.notifications.parent
    link: dashboard-notifications-posts
    classes: test for classes
    icon: i-carbon-notification
    childOf: null
</route>
