<script setup lang="ts">
import { Form } from 'ant-design-vue'

interface Props {
  skill?: Ref<any>
}

const props = withDefaults(defineProps<Props>(), {
  skill: () => ref(null),
})
const emit = defineEmits(['updateOrCreateSkill'])

const { t } = useI18n()
const useForm = Form.useForm

const modelRef = reactive({
  _id: undefined,
  name: '',
})
const rulesRef = reactive({
  name: [
    {
      required: true,
      message: 'Saisir le nom de la compétence',
    },
  ],
})
const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)
const onSubmit = () => {
  validate()
    .then(() => {
      emit('updateOrCreateSkill', { ...toRaw(modelRef), _id: props.skill?._id || undefined })
    })
    .catch((err) => {
      console.log('error', err)
    })
}
const resetForm = () => {
  console.log('props ', props.skill)

  if (props.skill) {
    const { name, _id } = props.skill
    modelRef._id = _id
    modelRef.name = name
  }
  else {
    modelRef.name = ''
    resetFields()
  }
}
watch(() => props.skill, () => {
  resetForm()
})
</script>

<template>
  <a-modal width="55%" destroy-on-close @after-close="resetFields()">
    <template #title>
      <span>
        {{ skill ? `Modifier ${skill.name}` : 'Création' }}
      </span>
    </template>
    <a-form layout="vertical">
      <div>
        <a-form-item label="Nom" name="name" v-bind="validateInfos.name">
          <a-input v-model:value="modelRef.name" placeholder="catégorie de métier" />
        </a-form-item>
      </div>
    </a-form>

    <template #footer>
      <a-form-item class="m-0">
        <a-button type="primary" danger @click="resetForm">
          Réinitialiser
        </a-button>
        <a-button type="primary" @click.prevent="onSubmit">
          {{ skill ? 'Modifier' : 'Créer' }}
        </a-button>
      </a-form-item>
    </template>
  </a-modal>
</template>
<style lang="less">
</style>
