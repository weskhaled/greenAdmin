<script setup lang="ts">
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { api as apiServices } from '~/common/composables'
import { currentUser } from '~/common/stores'

const search = ref('')
const selectedUser = ref(null)
const visibleUserFormModal = ref(false)
const routes = [
  {
    path: 'dashboard-index',
    breadcrumbName: 'Dashboard',
  },
  {
    path: 'dashboard-editors',
    breadcrumbName: 'Éditeurs',
  },
]
const dataUsers = ref<any>(null)
const columns = ref([
  {
    title: 'Utilisateur',
    dataIndex: 'username',
    key: 'username',
    sorter: true,
    align: 'center',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: true,
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
    title: 'Prénom',
    dataIndex: 'firstName',
    key: 'firstName',
    sorter: true,
    align: 'center',
  },
  {
    title: 'Nom',
    dataIndex: 'lastName',
    key: 'lastName',
    sorter: true,
    align: 'center',
  },
  {
    title: 'Visibilité',
    dataIndex: 'visibility',
    key: 'visibility',
    sorter: true,
    align: 'center',
    filters: [
      { text: 'Visible', value: 'true' },
      { text: 'Invisible', value: 'false' },
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
    title: 'Actions',
    key: 'operation',
    fixed: 'right',
    width: 200,
  },
])
const getUsers = async() => {
  const { data, error } = await apiServices('/editor/').json()
  data && !error.value && (dataUsers.value = data.value)
}
onMounted(() => {
  getUsers()
})
const updateOrCreateUser = async(dataUser) => {
  if (dataUser._id) {
    const userId = dataUser._id
    delete dataUser._id
    const { data: updateUser, error } = await apiServices(`/editor/${userId}`).patch(dataUser).json()
    updateUser.value && !error.value && (message.success(updateUser.value.message))
  }
  else {
    const { data: createUser, error } = await apiServices('/editor/').post(dataUser).json()
    createUser.value && !error.value && (message.success(createUser.value.messager))
    if (error.value)
      message.error(createUser.value.message)
  }
  getUsers()
  visibleUserFormModal.value = false
}
const deleteUser = async(userId) => {
  const { data: deleteUser, error } = await apiServices(`/editor/${userId}`).delete().json()
  deleteUser.value && !error.value && (message.success(deleteUser.value?.message))
  getUsers()
}
</script>

<template>
  <div>
    <a-page-header
      class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
      title="" :breadcrumb="{ routes }" sub-title="Liste des admins"
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
        -->
        <a-button key="1" type="primary" @click="() => { selectedUser = null, visibleUserFormModal = true }">
          Ajouter un Éditeur
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
      <a-table :loading="!dataUsers" size="small" :data-source="dataUsers || []" :columns="columns">
        <template #bodyCell="{ record, column, text }">
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
              Modifier
            </a-button>
            <a-popconfirm title="êtes vous sûr ?" ok-text="Oui" cancel-text="Non" @confirm="deleteUser(record._id)">
              <a-button size="small" class="mr-1 inline-block" type="link" danger>
                Supprimer
              </a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <editor-form-modal
    v-model:visible="visibleUserFormModal"
    :user="selectedUser" @after-close="() => selectedUser = null"
    @update-or-create-editor="updateOrCreateUser"
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
    name: dashboard.admins.editors
    link: dashboard-admins-editors
    classes: test for classes
    icon: i-carbon-user-role
    childOf: dashboard-admins
</route>
