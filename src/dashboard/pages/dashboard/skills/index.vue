<script setup lang="ts">
import { message } from 'ant-design-vue'
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
const columns = ref([
  {
    title: 'compétences professionelles',
    dataIndex: 'name',
    key: 'name',
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
        <a-input-search
          v-model:value="search" allow-clear placeholder="rechercher :" :loading="!dataSkills"
          :disabled="!search.length && dataSkills && dataSkills.length === 0" enter-button class="!w-55"
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
        <a-button key="1" type="primary" @click="() => { selectedSkill = null, visibleSkillFormModal = true }">
          Ajouter une compétence
        </a-button>
      </template>
    </a-page-header>
    <div class="drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
      <a-table :loading="!dataSkills" size="small" :data-source="dataSkills || []" :columns="columns">
        <template #bodyCell="{ record, column, text }">
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
</route>
