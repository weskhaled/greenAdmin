<script setup lang="ts">import { message } from 'ant-design-vue'

const props = defineProps<{
  languages: {
    type: Array<any>
    required: false
    default: []
  }
  modelValue: {
    type: Array<any>
    required: false
    default: []
  }
}>()
const emit = defineEmits(['update:modelValue', 'addLanguage', 'removeLanguage', 'updateLanguage'])
const data = useVModel(props, 'modelValue', emit)
enum LEVELS {
  BASIC = 'Notions',
  CONVERSATIONAL = 'Capacité professionnelle limitée',
  FLUENT = 'Capacité professionnelle complète',
  NATIVE = 'Bilingue ou natif',
}
const columns = [
  {
    title: 'langue',
    dataIndex: 'name',
    width: '25%',
  },
  {
    title: 'niveau',
    dataIndex: 'level',
    width: '40%',
  },
  {
    title: 'opération',
    dataIndex: 'operation',
  },
]
interface DataItem {
  key: string
  name: string
  level: number
}

const levels = [
  { label: 'Notions', value: 'BASIC' },
  { label: 'Capacité professionnelle limitée', value: 'CONVERSATIONAL' },
  { label: 'Capacité professionnelle complète', value: 'FLUENT' },
  { label: 'Bilingue ou natif', value: 'NATIVE' },
]

const dataSource = ref(data.value.map(l => ({ ...l, key: l.name })))
const editableData: UnwrapRef<Record<string, DataItem>> = reactive({})

const add = () => {
  const hasOne = dataSource.value.find(l => l.key === 'new')
  if (!hasOne) {
    const newData = {
      key: 'new',
      name: undefined,
      level: undefined,
      editableData: true,
    }
    editableData.new = { ...newData }
    dataSource.value.push(newData)
  }
}
const edit = (key: string) => {
  editableData[key] = { ...dataSource.value.filter(item => key === item.key)[0] }
}
const save = (key: string) => {
  const { level, name } = editableData[key]

  if (level && name) {
    if (editableData[key].key !== 'new')
      emit('updateLanguage', { language: { level, name } })

    else
      emit('addLanguage', { language: { level, name } })
  }
  else {
    message.error('please fill input')
  }
}
const remove = (key: string) => {
  const language = dataSource.value.find(l => l.name === key)
  if (language !== 'new')
    emit('removeLanguage', { language })
}
const cancel = (key: string) => {
  delete editableData[key]
}
onMounted(() => {
  !data.value.length && add()
})
</script>

<template>
  <div>
    <a-table :columns="columns" :data-source="dataSource" bordered>
      <template #bodyCell="{ column, text, record, index }">
        <template v-if="['name', 'level'].includes(column.dataIndex)">
          <div>
            <template v-if="editableData[record.key]">
              <a-select
                v-if="column.dataIndex == 'name'"
                v-model:value="editableData[record.key][column.dataIndex]"
                class="w-full"
                placeholder="Choisir un langue"
                :options="props.languages"
              />
              <a-select
                v-else-if="column.dataIndex == 'level'"
                v-model:value="editableData[record.key][column.dataIndex]"
                class="w-full"
                placeholder="Choisir un niveau"
                :options="levels"
              />
            </template>
            <template v-else>
              {{ LEVELS[text] }}
            </template>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <span v-if="editableData[record.key]">
              <a-typography-link class="mr-4" @click="save(record.key)">Enregistrer</a-typography-link>
              <a-popconfirm title="Sure to cancel?" @confirm="cancel(record.key)">
                <a-typography-link class="mr-4">Retour</a-typography-link>
              </a-popconfirm>
            </span>
            <span v-else>
              <a-typography-link class="mr-4" @click="edit(record.key)">Modifier</a-typography-link>
              <a-popconfirm cancel-text="retour" title="Voulez vous vraiment supprimer" @confirm="remove(record.key)">
                <a-typography-link class="mr-4">Supprimer</a-typography-link>
              </a-popconfirm>
              <a-typography-link v-if="index === dataSource.length - 1" class="mr-4" @click="add">Ajouter</a-typography-link>
            </span>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>
