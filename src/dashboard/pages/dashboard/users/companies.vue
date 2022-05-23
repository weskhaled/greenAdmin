<script setup lang="ts">
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { api as apiServices } from '~/common/composables'

const search = ref('')
const router = useRouter()

const selectedUser = ref(null)
const visibleUserFormModal = ref(false)
const routes = [
  {
    path: 'dashboard-index',
    breadcrumbName: 'Dashboard',
  },
  {
    path: 'dashboard-users-companies',
    breadcrumbName: 'Entreprises',
  },
]
const dataUsers = ref<any>(null)
const columns = ref([
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: true,
  },
  {
    title: 'Visibilité',
    dataIndex: 'visibility',
    key: 'visibility',
    sorter: true,
    filters: [
      { text: 'Visible', value: 'true' },
      { text: 'Invisible', value: 'false' },
    ],
    align: 'center',
  },
  {
    title: 'Tel.',
    dataIndex: 'phone',
    key: 'phone',
    sorter: true,
    align: 'center',
  },
  {
    title: 'Verif. email',
    dataIndex: 'email_verification',
    key: 'email_verification',
    sorter: true,
    filters: [
      { text: 'Oui', value: 'true' },
      { text: 'Non', value: 'false' },
    ],
    align: 'center',
  },
  {
    title: 'Val. Doc.',
    dataIndex: 'documents_val',
    key: 'documents_val',
    sorter: true,
    filters: [
      { text: 'Oui', value: 'true' },
      { text: 'Non', value: 'false' },
    ],
    align: 'center',
  },
  {
    title: 'Validation',
    dataIndex: 'validated',
    key: 'validated',
    sorter: true,
    filters: [
      { text: 'Oui', value: 'true' },
      { text: 'Non', value: 'false' },
    ],
    align: 'center',
  },
  {
    title: 'Confidentialité',
    dataIndex: 'confidentiality',
    key: 'confidentiality',
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
  },
  {
    title: 'Actions',
    key: 'operation',
    fixed: 'right',
    width: 200,
    align: 'center',
  },
])
const getUsers = async() => {
  const { data, error } = await apiServices('/company/all').json()
  data && !error.value && (dataUsers.value = data.value)
}
onMounted(() => {
  getUsers()
})
const updateOrCreateUser = async(dataUser) => {
  if (dataUser._id) {
    const userId = dataUser._id
    delete dataUser._id
    const { data: updateUser, error } = await apiServices(`/company/update-company/${userId}`).patch(dataUser).json()
    updateUser.value && !error.value && (message.success(updateUser.value.message))
  }
  getUsers()
  visibleUserFormModal.value = false
}
const deleteUser = async(userId) => {
  const { data: deleteUser, error } = await apiServices(`/company/delete-company/${userId}`).patch().json()
  deleteUser.value && !error.value && (message.success(deleteUser.value?.message))
  getUsers()
}
const blockOrUnblockUser = async(userId, validated) => {
  if (validated) {
    const { data: blockUser, error } = await apiServices(`/company/block-company/${userId}`).patch().json()
    blockUser.value && !error.value && (message.success(blockUser.value?.message))
    getUsers()
  }
  else {
    const { data: blockUser, error } = await apiServices(`/company/unblock-company/${userId}`).patch().json()
    blockUser.value && !error.value && (message.success(blockUser.value?.message))
    getUsers()
  }
}
const validateOrUnvalidateUser = async(userId, doc_validated) => {
  if (doc_validated) {
    const { data: docUser, error } = await apiServices(`/company/documents-unvalidated/${userId}`).patch().json()
    docUser.value && !error.value && (message.success(docUser.value?.message))
    getUsers()
  }
  else {
    const { data: docUser, error } = await apiServices(`/company/documents-validated/${userId}`).patch().json()
    docUser.value && !error.value && (message.success(docUser.value?.message))
    getUsers()
  }
}
</script>

<template>
  <div>
    <a-page-header
      class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
      title="Entreprises" :breadcrumb="{ routes }" sub-title="Liste des entreprises"
    >
      <template #tags>
        <a-tag color="blue">
          Running
        </a-tag>
      </template>
      <template #extra>
        <a-input-search
          v-model:value="search" allow-clear placeholder="rechercher :" :loading="!dataUsers"
          :disabled="!search.length && dataUsers && dataUsers.length === 0" enter-button class="!w-55"
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
      <a-table :loading="!dataUsers" size="small" :data-source="dataUsers || []" :columns="columns">
        <template #bodyCell="{ record, column, text }">
          <template v-if="column.dataIndex === 'visibility'">
            <a-tag :color="text === 1 ? 'green' : 'red'">
              {{ text === 1 ? 'visible' : 'invisible' }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'email_verification'">
            <a-tag :color="text == 1 ? 'green' : 'red'">
              {{ text == 1 ? 'Oui' : 'Non' }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'documents_val'">
            <a-tag :color="text === true ? 'green' : 'red'">
              {{ text === true ? 'Oui' : 'Non' }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'confidentiality'">
            <a-tag :color="text === true ? 'green' : 'red'">
              {{ text === true ? 'Oui' : 'Non' }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'validated'">
            <a-tag :color="text === true ? 'green' : 'red'">
              {{ text === true ? 'Oui' : 'Non' }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'level'">
            <a-tag color="blue">
              {{ text }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'createdAt'">
            {{ dayjs(text).format('DD/MM/YYYY HH:mm') }}
          </template>
          <template v-if="column.key === 'operation'">
            <a-button
              size="small" class="mr-1 inline-block" type="link"
              @click="() => { router.push(`/dashboard/users/companie/${record._id}`) }"
            >
              <span class="i-carbon-edit inline-block" />
            </a-button>
            <a-popconfirm title="êtes vous sûr ?" ok-text="Oui" cancel-text="Non" @confirm="blockOrUnblockUser(record._id,record.validated)">
              <a-button v-if="text.validated == true" size="small" class="mr-1 inline-block" type="link" warn>
                <span class="i-carbon-locked inline-block" />
              </a-button>
              <a-button v-else size="small" class="mr-1 inline-block" type="link" warn>
                <span class="i-carbon-unlocked inline-block" />
              </a-button>
            </a-popconfirm>
            <a-popconfirm title="êtes vous sûr ?" ok-text="Oui" cancel-text="Non" @confirm="validateOrUnvalidateUser(record._id,record.documents_val)">
              <a-button v-if="text.documents_val == true" size="small" class="mr-1 inline-block" type="link" warn>
                <span class="i-carbon-misuse-outline inline-block" />
              </a-button>
              <a-button v-else size="small" class="mr-1 inline-block" type="link" warn>
                <span class="i-carbon-checkmark-outline inline-block" />
              </a-button>
            </a-popconfirm>
            <a-popconfirm title="êtes vous sûr ?" ok-text="Oui" cancel-text="Non" @confirm="deleteUser(record._id)">
              <a-button size="small" class="mr-1 inline-block" type="link" danger>
                <span key="delete" class="i-carbon-delete inline-block" />
              </a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <user-form-modal
    v-model:visible="visibleUserFormModal"
    :user="selectedUser" @after-close="() => selectedUser = null"
    @update-or-create-user="updateOrCreateUser"
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
    name: dashboard.users.companies
    link: dashboard-users-companies
    classes: test for classes
    icon: i-carbon-user-role
    childOf: dashboard-users-freelancers
</route>
