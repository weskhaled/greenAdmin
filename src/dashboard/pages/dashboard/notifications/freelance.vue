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
    path: 'dashboard-notifications-freelance',
    breadcrumbName: 'notifications freelance',
  },
]
const dataAdmins = ref<any>(null)
const columns = ref([
  {
    title: 'utilisateurs',
    dataIndex: 'username',
    key: 'username',
    sorter: true,
    align: 'center',
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
  const { data, error } = await apiServices('/notification-freelance/unchecked/').json()
  data && !error.value && (dataAdmins.value = data.value)
}
onMounted(() => {
  getNotifs()
})
const validateOrUnvalidateNotif = async(notification) => {
  const params = { username: notification.username, changes: notification.changes }
  if (!notification.checked) {
    const { data: docAdmin, error } = await apiServices(`/notification-freelance/check/${notification._id}`).patch(params).json()
    docAdmin.value && !error.value && (message.success(docAdmin.value?.message))
    getNotifs()
  }
  else {
    const { data: docAdmin, error } = await apiServices(`/notification-freelance/uncheck/${notification._id}`).patch(params).json()
    docAdmin.value && !error.value && (message.success(docAdmin.value?.message))
    getNotifs()
  }
}
const filterDate = async() => {
  dataAdmins.value.filter(
    j => j.date >= formStatePeriod.dateBegin && j.date >= formStatePeriod.dateEnd,
  )
}
</script>

<template>
  <div>
    <a-page-header
      class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
      title="Notifications freelance" :breadcrumb="{ routes }" sub-title="Liste des notifications"
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
      <label v-if="formStateChanges.changes.address"><b>Adresse : </b> {{ formStateChanges.changes.address }} <br></label>
      <label v-if="formStateChanges.changes.address_plus"><b>Adresse supplémentaire : </b> {{ formStateChanges.changes.address_plus }} <br></label>
      <label v-if="formStateChanges.changes.legal_form"><b>Forme Légale : </b> {{ formStateChanges.changes.legal_form }} <br></label>

      <label v-if="formStateChanges.changes.lastname"><b>Nom : </b> {{ formStateChanges.changes.lastname }} <br></label>
      <label v-if="formStateChanges.changes.firstname"><b>Prénom : </b> {{ formStateChanges.changes.firstname }} <br></label>
      <label v-if="formStateChanges.changes.birthday"><b>Date de naissance : </b> {{ dayjs(formStateChanges.changes.birthday).format('DD/MM/YYYY HH:mm') }}<br></label>
      <label v-if="formStateChanges.changes.city_of_birth"><b>Ville de naissance : </b> {{ formStateChanges.changes.city_of_birth }} <br></label>
      <label v-if="formStateChanges.changes.country_of_birth"><b>Pays de naissance : </b> {{ formStateChanges.changes.country_of_birth }} <br></label>
      <label v-if="formStateChanges.changes.nationality"><b>Nationalité : </b> {{ formStateChanges.changes.nationality }} <br></label>

      <label v-if="formStateChanges.changes.taxe"><b>Taxe : </b> {{ formStateChanges.changes.taxe }} % <br></label>

      <label v-if="formStateChanges.changes.sas"><b>SAS : </b> {{ formStateChanges.changes.sas }} <br></label>
      <label v-if="formStateChanges.changes.siret"><b>SIRET : </b> {{ formStateChanges.changes.siret }} <br></label>
      <label v-if="formStateChanges.changes.rcs"><b>RCS : </b> {{ formStateChanges.changes.rcs }} <br></label>
      <label v-if="formStateChanges.changes.naf"><b>NAF : </b> {{ formStateChanges.changes.naf }} <br></label>
      <label v-if="formStateChanges.changes.tva_intracom"><b>TVA intracom : </b> {{ formStateChanges.changes.tva_intracom }} <br></label>
      <label v-if="formStateChanges.changes.days"><b>Nb. de jours : </b> {{ formStateChanges.changes.days }} <br></label>

      <label v-if="formStateChanges.changes.type_iban"><b>Type IBAN : </b> {{ formStateChanges.changes.type_iban }} <br></label>
      <label v-if="formStateChanges.changes.cb_iban_name_lastname"><b>Nom et prénom : </b> {{ formStateChanges.changes.cb_iban_name_lastname }} <br></label>
      <label v-if="formStateChanges.changes.cb_iban_address_holder"><b>Adresse : </b> {{ formStateChanges.changes.cb_iban_address_holder }} <br></label>
      <label v-if="formStateChanges.changes.cb_iban_postal"><b>Code postal : </b> {{ formStateChanges.changes.cb_iban_postal }} <br></label>
      <label v-if="formStateChanges.changes.cb_iban_city"><b>Ville : </b> {{ formStateChanges.changes.cb_iban_city }} <br></label>
      <label v-if="formStateChanges.changes.cb_iban_country"><b>Pays : </b> {{ formStateChanges.changes.
        cb_iban_country
      }} <br></label>
      <label v-if="formStateChanges.changes.cb_iban_iban"><b>IBAN : </b> {{ formStateChanges.changes.
        cb_iban_iban
      }} <br></label>
      <label v-if="formStateChanges.changes.cb_iban_region"><b>Région : </b> {{ formStateChanges.changes.cb_iban_region }} <br></label>
      <label v-if="formStateChanges.changes.cb_iban_account_number"><b>Numéro de compte : </b> {{ formStateChanges.changes.
        cb_iban_account_number
      }} <br></label>
      <label v-if="formStateChanges.changes.cb_iban_aba_transit_number"><b>ABA Transit number : </b> {{ formStateChanges.changes.
        cb_iban_aba_transit_number
      }} <br></label>
      <label
        v-if="formStateChanges.changes.
          cb_iban_account_type
        "
      ><b>Type de compte : </b> {{ formStateChanges.changes.cb_iban_account_type }} <br></label>
      <label
        v-if="formStateChanges.changes.
          cb_iban_branch_code
        "
      ><b>Code guichet : </b> {{ formStateChanges.changes.cb_iban_branch_code }} <br></label>
      <label
        v-if="formStateChanges.changes.
          cb_iban_number_institution
        "
      ><b>Numéro institution : </b> {{ formStateChanges.changes.cb_iban_number_institution }} <br></label>
      <label
        v-if="formStateChanges.changes.
          cb_iban_bank_name
        "
      ><b>Nom de la banque : </b> {{ formStateChanges.changes.cb_iban_bank_name }} <br></label>

      <label v-if="formStateChanges.changes.cb_iban_bic_swift"><b>BIC/SWIFT : </b> {{ formStateChanges.changes.cb_iban_bic_swift }} <br></label>
      <label v-if="formStateChanges.changes.cb_iban_account_country"><b>Pays du compte : </b> {{ formStateChanges.changes.
        cb_iban_account_country
      }} <br></label>
      <label v-if="formStateChanges.changes.filename && formStateChanges.changes.idFreelancer"><b><a-button size="small" class="mr-1 inline-block" type="link" warn>
        <span class="i-carbon-view inline-block" @click.prevent="$router.push(`/dashboard/users/freelence/${formStateChanges.changes.idFreelancer}`)" />
      </a-button></b><br></label>

      <label v-if="formStateChanges.changes.state"><b>Etat :</b>
        <div v-if="formStateChanges.changes.state === 'details'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Détails
        </a-tag>
        </div>
        <div v-else-if="formStateChanges.changes.state === 'representation'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Représentation légale
        </a-tag>
        </div>
        <div v-else-if="formStateChanges.changes.state === 'taxe'"><a-tag
          class="text-xs ml-2 leading-5"
          color="#05f"
        >
          Taxe
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
    name: dashboard.notifications.freelance
    link: dashboard-notifications-freelance
    classes: test for classes
    icon: i-carbon-notification
    childOf: dashboard-notifications-posts
</route>
