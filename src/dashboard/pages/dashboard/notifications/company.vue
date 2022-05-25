<script setup lang="ts">
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { api as apiServices } from '~/common/composables'

const search = ref('')
const selectedNotif = ref(null)
const visibleNotifAdminFormModal = ref(false)
const sizeCompanies = ref([])
const activitiesName = ref([])
const activitiesCode = ref([])

sizeCompanies.value = [{
  value: '0',
  label: '1 personne',
},
{
  value: '1',
  label: 'Entre 1 et 10',
},
{
  value: '2',
  label: 'Entre 11 et 49',
},
{
  value: '3',
  label: 'Entre 50 et 249',
},
{
  value: '4',
  label: 'Entre 250 et 999',
},
{
  value: '5',
  label: 'Entre 1000 et 4999',
},
{
  value: '6',
  label: 'Plus de 5000',
}]
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
    path: 'dashboard-notifications-company',
    breadcrumbName: 'notifications company',
  },
]
const dataAdmins = ref<any>(null)
const columns = ref([
  {
    title: 'utilisateurs',
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
  const { data, error } = await apiServices('/notification-company/unchecked/').json()
  data && !error.value && (dataAdmins.value = data.value)
}
const getFormData = async() => {
  const { data: dataActivities, error: errorActivities } = await apiServices('/api/sector-activity/').json()
  if (dataActivities && !errorActivities.value) {
    activitiesName.value = dataActivities.value.filter(a => a.name)
    activitiesCode.value = dataActivities.value.filter(a => a.code)
  }
}

onMounted(() => {
  getNotifs()
  getFormData()
})
const validateOrUnvalidateNotif = async(notification) => {
  const params = { username: notification.username, changes: notification.changes }
  if (!notification.checked) {
    const { data: docAdmin, error } = await apiServices(`/notification-company/check/${notification._id}`).patch(params).json()
    docAdmin.value && !error.value && (message.success(docAdmin.value?.message))
    getNotifs()
  }
  else {
    const { data: docAdmin, error } = await apiServices(`/notification-company/uncheck/${notification._id}`).patch(params).json()
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
      title="Notifications entreprises" :breadcrumb="{ routes }" sub-title="Liste des notifications"
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
      <label v-if="formStateChanges.changes.name"><b>Nom : </b> {{ formStateChanges.changes.name }} <br></label>
      <label v-if="formStateChanges.changes.address"><b>Taille de l'entreprise : </b>{{ sizeCompanies[formStateChanges.changes.address]?.label }}<br></label>
      <label v-if="formStateChanges.changes.sector_activity"><b>Adresse supplémentaire :</b>{{ activitiesName[activitiesCode.indexOf(formStateChanges.changes.sector_activity)] }}<br></label>

      <label v-if="formStateChanges.changes.social_reason"><b>Raison Sociale : </b>{{ formStateChanges.changes.social_reason }}<br></label>
      <label v-if="formStateChanges.changes.siret"><b>SIRET : </b>{{ formStateChanges.changes.siret }}<br></label>
      <label v-if="formStateChanges.changes.tva_intracom"><b>TVA : </b>{{ formStateChanges.changes.tva_intracom }}<br></label>
      <label v-if="formStateChanges.changes.address"><b>Adresse : </b>{{ formStateChanges.changes.address }}<br></label>
      <label v-if="formStateChanges.changes.address_plus"><b>Adresse supplémentaire : </b>{{ formStateChanges.changes.address_plus }}<br></label>

      <label v-if="formStateChanges.changes.lastName"><b>Nom : </b>{{ formStateChanges.changes.lastName }}<br></label>
      <label v-if="formStateChanges.changes.firstName"><b>Prénom : </b>{{ formStateChanges.changes.firstName }}<br></label>
      <label v-if="formStateChanges.changes.email"><b>Email : </b>{{ formStateChanges.changes.email }}<br></label>
      <label v-if="formStateChanges.changes.send_compta"><b>Envoi à la comptabilité : </b>{{ formStateChanges.changes.send_compta ? 'Oui' : 'Non' }}<br></label>

      <label v-if="formStateChanges.changes.state"><b>Etat : </b>
        <div v-if="formStateChanges.changes.state === 'profil'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Profil
        </a-tag>
        </div>
        <div v-else-if="formStateChanges.changes.state === 'facturation'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Facturation
        </a-tag>
        </div>
        <div v-else-if="formStateChanges.changes.state === 'comptable'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Comptabilité
        </a-tag>
        </div>
        <div v-else-if="formStateChanges.changes.state === 'mention'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Mention légale
        </a-tag>
        </div>
        <div v-else-if="formStateChanges.changes.state === 'iban'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          IBAN
        </a-tag>
        </div>
        <div v-else-if="formStateChanges.changes.state === 'iban-us'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Compte bancaire US
        </a-tag>
        </div>
        <div v-else-if="formStateChanges.changes.state === 'iban-ca'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Compte bancaire Canadien
        </a-tag>
        </div>
        <div v-else-if="formStateChanges.changes.state === 'iban-others'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Compte BIC/SWIFT
        </a-tag>
        </div>
        <div v-else="formStateChanges.changes.state === 'documents'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Documents
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
    name: dashboard.notifications.company
    link: dashboard-notifications-company
    classes: test for classes
    icon: i-carbon-notification
    childOf: dashboard-notifications-posts
</route>
