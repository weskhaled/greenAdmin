<script setup lang="ts">
import { message } from 'ant-design-vue'
import { defineComponent, reactive, ref, toRefs } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { api as apiServices } from '~/common/composables'

const search = ref('')
const selectedSkill = ref(null)
const visibleSkillFormModal = ref(false)
const routes = [
  {
    path: 'dashboard-index',
    breadcrumbName: 'Dashboard',
  },
  {
    path: 'dashboard-skills',
    breadcrumbName: 'Compétences',
  },
]
const dataSkills = ref<any>(null)
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
    title: 'compétences professionelles',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
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
]
const getSkills = async() => {
  const { data, error } = await apiServices('/skills/').json()
  data && !error.value && (dataSkills.value = data.value)
}
onMounted(() => {
  getSkills()
})
const updateOrCreateSkill = async(dataSkill) => {
  if (dataSkill._id) {
    const skillId = dataSkill._id
    delete dataSkill._id
    const { data: updateSkill, error } = await apiServices(`/skills/${skillId}`).patch(dataSkill).json()
    updateSkill.value && !error.value && (message.success(updateSkill.value.message))
  }
  else {
    const { data: createSkill, error } = await apiServices('/skills/add-skill').post(dataSkill).json()
    createSkill.value && !error.value && (message.success(createSkill.value.message))
    if (error.value)
      message.error(createSkill.value.message)
  }
  getSkills()
  visibleSkillFormModal.value = false
}
const deleteSkill = async(skillId) => {
  const { data: deleteSkill, error } = await apiServices(`/skills/${skillId}`).delete().json()
  deleteSkill.value && !error.value && (message.success(deleteSkill.value?.message))
  getSkills()
}
</script>

<template>
  <div>
    <a-page-header
      class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
      title="Compétences" :breadcrumb="{ routes }" sub-title="Liste des compétences professionelles"
    >
      <template #tags>
        <a-tag color="blue">
          Running
        </a-tag>
      </template>
      <template #extra>
        <a-button key="1" type="primary" @click="() => { selectedSkill = null, visibleSkillFormModal = true }">
          Ajouter une compétence
        </a-button>
      </template>
    </a-page-header>
    <div class="drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
      <a-table :loading="!dataSkills" size="small" :data-source="dataSkills || []" :columns="columns">
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
              @click="() => {selectedSkill = record, visibleSkillFormModal = true }"
            >
              <span class="i-carbon-edit inline-block" />
            </a-button>
            <a-popconfirm title="êtes vous sûr ?" ok-text="Oui" cancel-text="Non" @confirm="deleteSkill(record._id)">
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
  <skill-form-modal
    v-model:visible="visibleSkillFormModal"
    :skill="selectedSkill" @after-close="() => selectedSkill = null"
    @update-or-create-skill="updateOrCreateSkill"
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
    name: dashboard.skills.index
    index: 1
    parentName: dashboard.skills.parent
    link: dashboard-skills
    classes: test for classes
    icon: i-carbon:skill-level-basic
    childOf: null
    roles: [Root, Admin]
</route>
