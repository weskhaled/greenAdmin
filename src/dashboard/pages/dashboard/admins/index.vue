<script setup lang="ts">
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { reactive, ref } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { api as apiServices } from '~/common/composables'
import { currentUser } from '~/common/stores'
const searchText = ref('')

const selectedUser = ref(null)
const visibleUserFormModal = ref(false)
const routes = [
  {
    path: 'dashboard-index',
    breadcrumbName: 'Dashboard',
  },
  {
    path: 'dashboard-users',
    breadcrumbName: 'Administrateurs',
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
    title: 'Utilisateur',
    dataIndex: 'username',
    key: 'username',
    align: 'center',
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.username.toString().toLowerCase().includes(value.toLowerCase()),
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
    align: 'center',
    filters: [
      { text: 'Visible', value: 1 },
      { text: 'Invisible', value: 0 },
    ],
    onFilter: (value, record) =>
      record.visibility === value,
  },
  {
    title: 'Création',
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
    sorter: true,
  },
  {
    title: 'Rôle',
    dataIndex: 'role',
    align: 'center',
    key: 'role',
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.role.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus()
        }, 100)
      }
    },
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
  const { data, error } = await apiServices('/admin/').json()
  data && !error.value && (dataUsers.value = data.value)
}
onMounted(() => {
  getUsers()
})
const updateOrCreateAdmin = async(dataUser) => {
  if (dataUser._id) {
    const userId = dataUser._id
    delete dataUser._id
    if (currentUser.value.role === 'Root') {
      const { data: updateUser, error } = await apiServices(`/admin/update/${userId}`).patch(dataUser).json()
      updateUser.value && !error.value && (message.success(updateUser.value.message))
    }
    else {
      const { data: updateUser, error } = await apiServices(`/admin/${userId}`).patch(dataUser).json()
      updateUser.value && !error.value && (message.success(updateUser.value.message))
    }
  }
  else {
    const { data: createUser, error } = await apiServices('/admin/').post(dataUser).json()
    createUser.value && !error.value && (message.success('administrateur créé'))
    if (error.value)
      message.error(createUser.value.message)
  }
  getUsers()
  visibleUserFormModal.value = false
}
const deleteUser = async(userId) => {
  const { data: deleteUser, error } = await apiServices(`/admin/${userId}`).delete().json()
  deleteUser.value && !error.value && (message.success(deleteUser.value?.message))
  getUsers()
}
</script>

<template>
  <div>
    <a-page-header
      class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
      title="Admins" :breadcrumb="{ routes }" sub-title="Liste des admins"
    >
      <template #tags>
        <a-tag color="blue">
          Running
        </a-tag>
      </template>
      <template #extra>
        <a-button key="1" type="primary" @click="() => { selectedUser = null, visibleUserFormModal = true }">
          Ajouter un Admin
        </a-button>
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
          <template v-if="column.dataIndex === 'createdAt'">
            {{ dayjs(text).format('DD/MM/YYYY HH:mm') }}
          </template>
          <template v-if="column.key === 'operation'">
            <a-button
              size="small" class="mr-1 inline-block" type="link"
              @click="() => { selectedUser = record, visibleUserFormModal = true }"
            >
              <span class="i-carbon-edit inline-block" />
            </a-button>
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
  <admin-form-modal
    v-model:visible="visibleUserFormModal"
    :user="selectedUser" @after-close="() => selectedUser = null"
    @update-or-create-admin="updateOrCreateAdmin"
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
    name: dashboard.admins.index
    index: 1
    parentName: dashboard.admins.parent
    link: dashboard-admins
    classes: test for classes
    icon: i-ph-users-duotone
    childOf: null
    roles: [Root]
</route>
