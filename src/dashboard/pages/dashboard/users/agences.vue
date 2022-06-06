<script setup lang="ts">
import { message } from 'ant-design-vue'
import { defineComponent, reactive, ref, toRefs } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import dayjs from 'dayjs'
import { api as apiServices } from '~/common/composables'
import { currentUser } from '~/common/stores'

const searchText = ref('')
const router = useRouter()

const selectedUser = ref(null)
const visibleUserFormModal = ref(false)
const routes = [
  {
    path: 'dashboard-index',
    breadcrumbName: 'Dashboard',
  },
  {
    path: 'dashboard-users-agences',
    breadcrumbName: 'Agences',
  },
]
const dataUsers = ref<any>(null)
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
    title: 'Solution Innovante',
    dataIndex: 'nameAgence',
    key: 'nameAgence',
    align: 'center',
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.nameAgence.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus()
        }, 100)
      }
    },
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    align: 'center',
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
    title: 'Visibilité',
    dataIndex: 'visibility',
    key: 'visibility',
    filters: [
      { text: 'Visible', value: 1 },
      { text: 'Invisible', value: 0 },
    ],
    align: 'center',
    onFilter: (value, record) =>
      record.visibility === value,
  },
  {
    title: 'Tel.',
    dataIndex: 'phone',
    key: 'phone',
    align: 'center',
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.phone.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus()
        }, 100)
      }
    },
  },
  {
    title: 'Verif. email',
    dataIndex: 'email_verification',
    key: 'email_verification',
    filters: [
      { text: 'Oui', value: 1 },
      { text: 'Non', value: 0 },
    ],
    align: 'center',
    onFilter: (value, record) =>
      record.email_verification === value,
  },
  {
    title: 'Val. Doc.',
    dataIndex: 'documents_val',
    key: 'documents_val',
    filters: [
      { text: 'Oui', value: true },
      { text: 'Non', value: false },
    ],
    align: 'center',
    onFilter: (value, record) =>
      record.documents_val === value,
  },
  {
    title: 'Validation',
    dataIndex: 'validated',
    key: 'validated',
    filters: [
      { text: 'Oui', value: true },
      { text: 'Non', value: false },
    ],
    align: 'center',
    onFilter: (value, record) =>
      record.validated === value,
  },
  {
    title: 'Confidentialité',
    dataIndex: 'confidentiality',
    key: 'confidentiality',
    filters: [
      { text: 'Oui', value: true },
      { text: 'Non', value: false },
    ],
    align: 'center',
    onFilter: (value, record) =>
      record.validated === value,
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
]
const getUsers = async() => {
  const { data, error } = await apiServices('/agence/all').json()
  data && !error.value && (dataUsers.value = data.value)
}
onMounted(() => {
  getUsers()
})
const updateOrCreateUser = async(dataUser) => {
  if (dataUser._id) {
    const userId = dataUser._id
    delete dataUser._id
    const { data: updateUser, error } = await apiServices(`/agence/update-agence/${userId}`).patch(dataUser).json()
    updateUser.value && !error.value && (message.success(updateUser.value.message))
  }
  getUsers()
  visibleUserFormModal.value = false
}
const deleteUser = async(userId) => {
  const { data: deleteUser, error } = await apiServices(`/agence/delete-agence/${userId}`).patch().json()
  deleteUser.value && !error.value && (message.success(deleteUser.value?.message))
  getUsers()
}
const blockOrUnblockUser = async(userId, validated) => {
  if (validated) {
    const { data: blockUser, error } = await apiServices(`/agence/block-agence/${userId}`).patch().json()
    blockUser.value && !error.value && (message.success(blockUser.value?.message))
    getUsers()
  }
  else {
    const { data: blockUser, error } = await apiServices(`/agence/unblock-agence/${userId}`).patch().json()
    blockUser.value && !error.value && (message.success(blockUser.value?.message))
    getUsers()
  }
}
const validateOrUnvalidateUser = async(userId, doc_validated) => {
  if (doc_validated) {
    const { data: docUser, error } = await apiServices(`/agence/unvalidate-document-agence/${userId}`).patch().json()
    docUser.value && !error.value && (message.success(docUser.value?.message))
    getUsers()
  }
  else {
    const { data: docUser, error } = await apiServices(`/agence/validate-document-agence/${userId}`).patch().json()
    docUser.value && !error.value && (message.success(docUser.value?.message))
    getUsers()
  }
}
</script>

<template>
  <div>
    <a-page-header
      class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
      title="Solutions Innovantes" :breadcrumb="{ routes }" sub-title="Liste des solutions innovantes"
    >
      <template #tags>
        <a-tag color="blue">
          Running
        </a-tag>
      </template>
    </a-page-header>
    <div class="drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
      <a-table :loading="!dataUsers" size="small" :data-source="dataUsers || []" :columns="columns">
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
              @click="() => { router.push(`/dashboard/users/agence/${record._id}`) }"
            >
              <span class="i-carbon-edit inline-block" />
            </a-button>
            <a-popconfirm v-if="currentUser && currentUser.role === 'Root'" title="êtes vous sûr ?" ok-text="Oui" cancel-text="Non" @confirm="blockOrUnblockUser(record._id,record.validated)">
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
    name: dashboard.users.agences
    link: dashboard-users-agences
    classes: test for classes
    icon: i-carbon-events
    childOf: dashboard-users-freelancers
</route>
