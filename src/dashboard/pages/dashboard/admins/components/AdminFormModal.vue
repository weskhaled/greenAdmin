<script setup lang="ts">
import dayjs from 'dayjs'
import { Form } from 'ant-design-vue'

interface Props {
  user?: Ref<any>
}

const props = withDefaults(defineProps<Props>(), {
  user: () => ref(null),
})
const emit = defineEmits(['updateOrCreateAdmin'])

const { t } = useI18n()
const useForm = Form.useForm

const modelRef = reactive({
  _id: undefined,
  username: '',
  password: undefined,
  repeatPassword: undefined,
  email: '',
  lastName: '',
  firstName: '',
  phone: '',
})
const rulesRef = reactive({
  username: [
    {
      required: true,
      message: 'Saisir le nom d\'utilisateur',
    },
  ],
  password: [
    {
      required: true,
      validator: async(_rule: RuleObject, value: string) => {
        if (!value)
          return Promise.reject(new Error('veuillez resaisir votre mot de passe'))

        else if (value.length < 8)
          return Promise.reject(new Error('la longueure minimale est de 8 caractères'))
        else
          return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
  repeatPassword: [
    {
      required: true,
      validator: async(_rule: RuleObject, value: string) => {
        if (value === '')
          return Promise.reject(new Error('veuillez resaisir votre mot de passe'))

        else if (value !== modelRef.password)
          return Promise.reject(new Error('les mots de passes ne sont pas les mêmes'))

        else
          return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
  email: [
    {
      required: true,
      message: 'Saisir une adresse email valide',
    },
  ],
  lastName: [
    {
      required: true,
      message: 'Saisir un nom',
    },
  ],
  firstName: [
    {
      required: true,
      message: 'Saisir un prénom',
    },
  ],
  phone: [
    {
      required: true,
      validator: async(_rule: RuleObject, value: string) => {
        if (!value)
          return Promise.reject(new Error('Veuillez saisir un numéro de téléphone valide'))

        if (!Number.isInteger(+value)) {
          return Promise.reject(new Error('Veuillez saisir que des chiffres'))
        }
        else {
          if (value.length < 10)
          // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject(`${'le numéro doit contenir 10 chiffres'}`)
          else
            return Promise.resolve()
        }
      },
      trigger: 'blur',
    },
  ],
})
const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)
const onSubmit = () => {
  validate()
    .then(() => {
      emit('updateOrCreateAdmin', { ...toRaw(modelRef), _id: props.user?._id || undefined, email: props.user?.email || modelRef.email })
    })
    .catch((err) => {
      console.log('error', err)
    })
}
const resetForm = () => {
  if (props.user) {
    const { username, email, firstName, lastName, phone, _id } = props.user
    modelRef._id = _id
    modelRef.username = username
    modelRef.email = email
    modelRef.firstName = firstName
    modelRef.lastName = lastName
    modelRef.phone = phone
    modelRef.password = undefined
    modelRef.repeatPassword = undefined
  }
  else {
    modelRef.password = undefined
    modelRef.repeatPassword = undefined
    modelRef.firstName = ''
    modelRef.lastName = ''
    modelRef.phone = ''
    resetFields()
  }
}
watch(() => props.user, () => {
  resetForm()
})
</script>

<template>
  <a-modal width="55%" destroy-on-close @after-close="resetFields()">
    <template #title>
      <span>
        {{ user ? `Modifier ${user.username}` : 'Création' }}
      </span>
    </template>
    <a-form layout="vertical">
      <div>
        <a-form-item label="Nom d'utilisateur" name="username" v-bind="validateInfos.username">
          <a-input v-model:value="modelRef.username" />
        </a-form-item>
        <a-form-item label="E-mail" name="email" v-bind="validateInfos.email">
          <a-input v-model:value="modelRef.email" type="email" />
        </a-form-item>
        <a-form-item label="Téléphone" name="phone" v-bind="validateInfos.phone">
          <a-input v-model:value="modelRef.phone" />
        </a-form-item>
      </div>
      <div class="grid-cols-2 grid gap-4">
        <a-form-item label="Nom" name="lastName" v-bind="validateInfos.lastName">
          <a-input v-model:value="modelRef.lastName" />
        </a-form-item>
        <a-form-item label="Prénom" name="firstName" v-bind="validateInfos.firstName">
          <a-input v-model:value="modelRef.firstName" />
        </a-form-item>
      </div>
      <div class="grid-cols-2 grid gap-4">
        <a-form-item label="Mot de passe" name="password" v-bind="validateInfos.password">
          <a-input v-model:value="modelRef.password" type="password" />
        </a-form-item>
        <a-form-item label="Répéter mot de passe" name="repeatPassword" v-bind="validateInfos.repeatPassword">
          <a-input v-model:value="modelRef.repeatPassword" type="password" />
        </a-form-item>
      </div>
    </a-form>

    <template #footer>
      <a-form-item class="m-0">
        <a-button type="primary" danger @click="resetForm">
          Réinitialiser
        </a-button>
        <a-button type="primary" @click.prevent="onSubmit">
          {{ user ? 'Modifier' : 'Créer' }}
        </a-button>
      </a-form-item>
    </template>
  </a-modal>
</template>
<style lang="less">
</style>
