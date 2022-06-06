<script setup lang="ts">
import dayjs from 'dayjs'
import { Form, message } from 'ant-design-vue'
import type { RuleObject } from 'ant-design-vue/es/form'
import SwiperCore, { Controller, Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { currentUser } from '~/common/stores'
import 'swiper/css/pagination'

import { api as apiServices } from '~/common/composables'

const useForm = Form.useForm
SwiperCore.use([Controller, Pagination])
const controlledSwiper = ref(null)
const boolTrue = ref(true)

const setDevisSwiper = (swiper) => {
  controlledSwiper.value = swiper
}
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}
const props = defineProps<{ id: string }>()
const jobs = ref([])
const visiblePaymentFormModal = ref(false)
const offers = ref([])
const offersLabel = ref([])
const offersId = ref([])
const jobsName = ref([])
const jobsId = ref([])
const languages = ref([])
const levels = ref([])
const skills = ref([])
const freqTexts = ref([])
const showPriceArray = ref([])
const showSuppMonthArray = ref([])
const mission = ref(null)
const profile = ref(null)
const sended = ref(false)
const sendRefuseDevis = ref(false)
const visibleModalSendDevis = ref(false)
const visibleModalSendDevisAgence = ref(false)
const profileEntrepriseLoading = ref(false)
const showUpdateBloc = ref(false)
const devis = ref([])
const users = ref([])
const unpayedAmounts = ref([])
const diff = reactive<any>({
  amount: 0,
})
const spinningValue = ref(true)
const modelRefDevis = reactive({
  id: null,
  id_company: undefined,
  id_mission: undefined,
  dateBegin: null,
  dateEnd: null,
  tasks: [],
  total: 0,
  tva: 20,
  totalTva: 0,
  totalGreen: 0,
  totalGreenTva: 0,
  totalUser: 0,
  offer: undefined,
  id_offer: undefined,
})
let indexBloc = null
const rulesDevis = reactive({
  dateBegin: [
    {
      required: true,
      message: 'Choisissez la date de début',
    },
  ],
  dateEnd: [
    {
      validator: async(_rule: RuleObject, value: string) => {
        if (!value)
          return Promise.reject('Choisissez la date de fin')
        else if (modelRefDevis.dateBegin != null && value < modelRefDevis.dateBegin)
          return Promise.reject('La date de fin doit être supérieur à la date de début')
        else
          return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
})
const { resetFields, validate, validateInfos: devisValidateInfos } = useForm(modelRefDevis, rulesDevis)

const formStateBloc = reactive<Record<string, any>>({
  description: '',
  cost_per_hour: 50,
  nb_hours: 1,
})
const getOffers = async() => {
  const { data: dataOffers, error: errorOffers } = await apiServices(`/agence/offers/${props.id}`).json()
  if (dataOffers && !errorOffers.value) {
    offers.value = dataOffers
    offersLabel.value = dataOffers.filter(j => j._id && j.name).map(j => ({
      value: j._id,
      label: j.name,
    }))
    offersId.value = dataOffers.map(o => o._id)
  }
  else { message.error(errorOffers.value) }
}
const getTotal = async() => {
  modelRefDevis.total = 0
  await modelRefDevis.tasks.map((el) => {
    modelRefDevis.total += el.nb_hours * el.cost_per_hour
  })

  modelRefDevis.totalTva = modelRefDevis.total + modelRefDevis.total * (modelRefDevis.tva / 100)
  modelRefDevis.totalGreen = modelRefDevis.total * 0.1
  modelRefDevis.totalGreenTva = modelRefDevis.totalGreen + modelRefDevis.totalGreen * (modelRefDevis.tva / 100)
  modelRefDevis.totalUser = modelRefDevis.totalTva - modelRefDevis.totalGreenTva
}
const applicateTva = () => {
  modelRefDevis.totalTva = modelRefDevis.total + modelRefDevis.total * (modelRefDevis.tva / 100)
  modelRefDevis.totalGreenTva = modelRefDevis.totalGreen + modelRefDevis.totalGreen * (modelRefDevis.tva / 100)
  modelRefDevis.totalUser = modelRefDevis.totalTva - modelRefDevis.totalGreenTva
}
const addBloc = () => {
  const task = {
    description: formStateBloc.description,
    cost_per_hour: formStateBloc.cost_per_hour,
    nb_hours: formStateBloc.nb_hours,
  }
  modelRefDevis.tasks.push(task)
  getTotal()
}

const updateBloc = (item: any, index: number) => {
  formStateBloc.description = item.description,
  formStateBloc.cost_per_hour = item.cost_per_hour,
  formStateBloc.nb_hours = item.nb_hours,
  indexBloc = index
  showUpdateBloc.value = true
  getTotal()
}
const deleteBloc = (item: any, index: number) => {
  modelRefDevis.tasks.splice(index, 1)
  getTotal()
}

const updateTask = () => {
  modelRefDevis.tasks[indexBloc] = formStateBloc
  showUpdateBloc.value = false
  indexBloc = null
  getTotal()
}

const formStateMission = reactive<Record<string, any>>({
  title_profile: '',
  id_company: '',
  level: '',
  jobCat: undefined,
  skillsNeeded: [],
  skillsAppreciated: [],
  languages: [],
  name: '',
  description: '',
  skills: [],
  dateBegin: null,
  objectif: '',
  price_per_day: 0,
  period_per_month: 1,
  show_price: true,
  work_frequence: 0,
  telework: false,
  nb_days_telework: 0,
  local_city: '',
  comments: '',
  document: null,
  supp_month: true,
  budget: 0,
  freelancers: [],
  id_agence: null,
})
levels.value = [{
  value: 'Junior',
  label: 'Junior',
}, {
  value: 'Intermédiaire',
  label: 'Intermédiaire',
}, {
  value: 'Senior',
  label: 'Senior',
}]

showPriceArray.value = [{
  value: true,
  label: 'Oui',
}, {
  value: false,
  label: 'Non',
}]
showSuppMonthArray.value = [{
  value: true,
  label: 'plus d\'un mois',
}, {
  value: false,
  label: 'moins d\'un mois',
}]
freqTexts.value = ['1 jour/semaine', '2 jours/semaine', '3 jours/semaine', '4 jours/semaine', '5 jours/semaine']

const calcWorkFreq = (params: number, toSlide = true) => {
  if (toSlide) {
    if (params === 0)
      return 0
    else if (params === 1)
      return 25
    else if (params === 2)
      return 50
    else if (params === 3)
      return 75
    else if (params === 4)
      return 100
  }
  else {
    if (params === 0)
      return 0
    else if (params === 25)
      return 1
    else if (params === 50)
      return 2
    else if (params === 75)
      return 3
    else if (params === 100)
      return 4
  }
}

const onFinish = async(values: any) => {
  console.log('finished')
}
const getDevis = async(idCompany: any) => {
  const { data: dataDevisByMissionId, error: errorDevisByMissionId } = await apiServices(`/missions/devis-by-id/${idCompany}/${props.id}`).json()
  if (dataDevisByMissionId && !errorDevisByMissionId.value) {
    devis.value = dataDevisByMissionId.value.devises
    users.value = dataDevisByMissionId.value.users
    unpayedAmounts.value = dataDevisByMissionId.value.unpayedAmounts
  }
  else { message.error(errorDevisByMissionId.value) }
}

const getFormData = async() => {
  const { data: dataJobs, error: errorJobs } = await apiServices('/jobs/').json()
  dataJobs.value && !errorJobs.value && (jobs.value = dataJobs.value.filter(j => j._id && j.name).map(j => ({
    value: j._id,
    label: j.name,
  })))
  const { data: dataLanguages, error: errorLanguages } = await apiServices('/api/languages/').json()
  dataLanguages.value && !errorLanguages.value && (languages.value = dataLanguages.value.map(j => ({
    value: j.name,
    label: j.name,
  })))
  const { data: dataSkills, error: errorSkills } = await apiServices('/skills/').json()
  dataSkills.value && !errorSkills.value && (skills.value = dataSkills.value.map(j => ({
    value: j.name,
    label: j.name,
  })))

  const { data: dataMission, error: errorMission } = await apiServices(`/missions/get/${props.id}`).json()
  if (dataMission.value && !errorMission.value) {
    mission.value = dataMission.value.mission
    profile.value = dataMission.value.profile
    if (mission.value.id_agence)
      formStateMission.id_agence = mission.value?.id_agence
    if (mission.value.freelancers)
      formStateMission.freelancers = mission.value?.freelancers
    formStateMission.id_company = mission.value?.id_company
    formStateMission.title_profile = profile.value?.title_profile
    formStateMission.jobCat = profile.value?.jobCat
    formStateMission.level = profile.value?.level
    formStateMission.skillsNeeded = profile.value?.skillsNeeded
    formStateMission.skillsAppreciated = profile.value?.skillsAppreciated
    formStateMission.languages = profile.value?.languages
    formStateMission.name = mission.value?.name
    formStateMission.objectif = mission.value?.objectif
    formStateMission.description = mission.value?.description
    formStateMission.supp_month = mission.value?.supp_month
    formStateMission.dateBegin = mission.value?.dateBegin
    formStateMission.budget = mission.value?.budget
    formStateMission.price_per_day = mission.value?.price_per_day
    formStateMission.show_price = mission.value?.show_price
    formStateMission.work_frequence = calcWorkFreq(mission.value?.work_frequence)
    formStateMission.nb_days_telework = calcWorkFreq(mission.value?.nb_days_telework)
    formStateMission.telework = mission.value?.telework
    formStateMission.period_per_month = mission.value?.period_per_month
    formStateMission.local_city = mission.value?.local_city
    formStateMission.document = mission.value?.document
    spinningValue.value = false
  }
  else { message.error(errorMission.value) }

  getDevis(formStateMission.id_company)
}

onMounted(async() => {
  getFormData()
})

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}
</script>

<template>
  <a-page-header
    v-if="profile?.freelancer"
    class="!bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px"
    :title="`Freelance : ${profile?.freelancer?.lastName} ${profile?.freelancer?.firstName}`"
  >
    <template #tags>
      <a-tag v-if="profile?.freelancer?.validated" color="green">
        Compte validé
      </a-tag>
      <a-tag v-else color="red">
        Compte non validé
      </a-tag>
    </template>
  </a-page-header>
  <div class="drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
    <!--== Start Login Area Wrapper ==-->
    <section class="account-login-area !bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
      <div class="container pt-5">
        <a-skeleton v-if="!formStateMission && !devis" avatar active :paragraph="{ rows: 15 }" />
        <div v-else class>
          <div class="pt-0">
            <div class>
              <a-card title="Devis" :bordered="false" class="rounded-sm font-bold">
                <a-spin v-if="spinningValue" class="mx-auto" />
                <div v-else>
                  <swiper
                    :modules="[Controller]"
                    :slides-per-view="4" class="p-3"
                    :pagination="{
                      clickable: true,
                    }"
                    :grab-cursor="true"
                    @swiper="setDevisSwiper"
                  >
                    <swiper-slide
                      v-for="(item, index) in devis"
                      :key="index"
                    >
                      <div v-if="item.id_freelance">
                        <a-badge-ribbon v-if="item.confirmed && item.confirmed == true" class="mr-2" color="green" text="accepté">
                          <a-card class="mr-2" hoverable>
                            <a-card-meta :title="`Freelance : ${users[index].firstName} ${users[index].lastName}`">
                              <template #description>
                                <div class="flex items-center justify-center">
                                  <a-avatar
                                    :src="users[index].image"
                                    shape="square"
                                    :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 120, xxl: 160 }"
                                  />
                                </div>
                                <br>
                                <div class="flex">
                                  <a-progress
                                    :stroke-color="{
                                      '0%': '#108ee9',
                                      '100%': '#87d068',
                                    }" :percent="unpayedAmounts[index]"
                                  />
                                </div>
                                <br>
                                <div class="flex items-center">
                                  <span class=" mr-1.5" />
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Date de début :</b>
                                  </span>
                                  {{ dayjs(item.dateBegin).format("DD-MM-YYYY") }}
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Date de fin :</b>
                                  </span>
                                  {{ dayjs(item.dateEnd).format("DD-MM-YYYY") }}
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Total HT:</b>
                                  </span>
                                  {{ item.total }} €
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Total TTC :</b>
                                  </span>
                                  {{ item.totalTva }} €
                                </div>
                                <div v-if="item.state == 'terminé'">
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      <b>Etat :</b>
                                    </span>
                                    <a-tag
                                      class="text-xs ml-2 leading-5"
                                      color="#080"
                                    >
                                      Répondu
                                    </a-tag>
                                  </div>
                                </div>
                                <div v-else-if="item.state == 'en cours'">
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      <b>Etat :</b>
                                    </span>
                                    <a-tag
                                      class="text-xs ml-2 leading-5"
                                      color="#05f"
                                    >
                                      En cours
                                    </a-tag>
                                  </div>
                                </div>
                                <div v-else>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      <b>Etat :</b>
                                    </span>
                                    <a-tag
                                      class="text-xs ml-2 leading-5"
                                      color="#D00"
                                    >
                                      Répondu
                                    </a-tag>
                                  </div>
                                </div>
                              </template>
                            </a-card-meta>
                          </a-card>
                        </a-badge-ribbon>
                        <a-badge-ribbon v-else-if="item.confirmed == false" class="mr-2" color="red" text="refusé">
                          <a-card class="mr-2" hoverable>
                            <a-card-meta :title="`Freelance : ${users[index].firstName} ${users[index].lastName}`">
                              <template #description>
                                <div class="flex items-center justify-center">
                                  <a-avatar
                                    :src="users[index].image"
                                    shape="square"
                                    :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 120, xxl: 160 }"
                                  />
                                </div>
                                <br>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Date de début :</b>
                                  </span>
                                  {{ dayjs(item.dateBegin).format("DD-MM-YYYY") }}
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Date de fin :</b>
                                  </span>
                                  {{ dayjs(item.dateEnd).format("DD-MM-YYYY") }}
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Total HT:</b>
                                  </span>
                                  {{ item.total }} €
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Total TTC :</b>
                                  </span>
                                  {{ item.totalTva }} €
                                </div>
                                <div v-if="item.state == 'terminé'">
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      <b>Etat : </b>
                                    </span>
                                    <a-tag
                                      class="text-xs ml-2 leading-5"
                                      color="#080"
                                    >
                                      Répondu
                                    </a-tag>
                                  </div>
                                </div>
                                <div v-else-if="item.state == 'en cours'">
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      <b>Etat :</b>
                                    </span>
                                    <a-tag
                                      class="text-xs ml-2 leading-5"
                                      color="#05f"
                                    >
                                      En cours
                                    </a-tag>
                                  </div>
                                </div>
                                <div v-else>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      <b>Etat</b>
                                    </span>
                                    <a-tag
                                      class="text-xs ml-2 leading-5"
                                      color="#D00"
                                    >
                                      Répondu
                                    </a-tag>
                                  </div>
                                </div>
                              </template>
                            </a-card-meta>
                          </a-card>
                        </a-badge-ribbon>
                        <a-card v-else class="mr-2" hoverable>
                          <a-card-meta :title="`Freelance : ${users[index].firstName} ${users[index].lastName}`">
                            <template #description>
                              <div class="flex items-center justify-center">
                                <a-avatar
                                  :src="users[index].image"
                                  shape="square"
                                  :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 120, xxl: 160 }"
                                />
                              </div>
                              <br>
                              <div class="flex items-center">
                                <span class=" mr-1.5">
                                  <b>Date de début :</b>
                                </span>
                                {{ dayjs(item.dateBegin).format("DD-MM-YYYY") }}
                              </div>
                              <div class="flex items-center">
                                <span class=" mr-1.5">
                                  <b>Date de fin :</b>
                                </span>
                                {{ dayjs(item.daetEnd).format("DD-MM-YYYY") }}
                              </div>
                              <div class="flex items-center">
                                <span class=" mr-1.5">
                                  <b>Total HT:</b>
                                </span>
                                {{ item.total }} €
                              </div>
                              <div class="flex items-center">
                                <span class=" mr-1.5">
                                  <b>Total TTC :</b>
                                </span>
                                {{ item.totalTva }} €
                              </div>
                              <div v-if="item.state == 'terminé'">
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Etat :</b>
                                  </span>
                                  <a-tag
                                    class="text-xs ml-2 leading-5"
                                    color="#080"
                                  >
                                    Répondu
                                  </a-tag>
                                </div>
                              </div>
                              <div v-else-if="item.state == 'en cours'">
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Etat :</b>
                                  </span>
                                  <a-tag
                                    class="text-xs ml-2 leading-5"
                                    color="#05f"
                                  >
                                    En cours
                                  </a-tag>
                                </div>
                              </div>
                              <div v-else>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Etat :</b>
                                  </span>
                                  <a-tag
                                    class="text-xs ml-2 leading-5"
                                    color="#D00"
                                  >
                                    Répondu
                                  </a-tag>
                                </div>
                              </div>
                            </template>
                          </a-card-meta>
                        </a-card>
                      </div>
                      <div v-else>
                        <a-badge-ribbon v-if="item.confirmed" class="mr-2" color="green" text="accepté">
                          <a-card class="mr-2" hoverable>
                            <a-card-meta :title="`Agence : ${users[index].nameAgence}`">
                              <template #description>
                                <div class="flex items-center justify-center">
                                  <a-avatar
                                    :src="users[index].image"
                                    shape="square"
                                    :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 120, xxl: 160 }"
                                  />
                                </div>
                                <br>
                                <div class="flex">
                                  <a-card :bordered="false" class="bg-white" :body-style="{padding: '5px'}">
                                    <a-progress
                                      :stroke-color="{
                                        '0%': '#108ee9',
                                        '100%': '#87d068',
                                      }" :percent="unpayedAmounts[index]"
                                    />
                                  </a-card>
                                </div>
                                <br>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Solution innovante :</b>
                                  </span>
                                  {{ item.offer.name }}
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Date de début :</b>
                                  </span>
                                  {{ dayjs(item.dateBegin).format("DD-MM-YYYY") }}
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Date de fin :</b>
                                  </span>
                                  {{ dayjs(item.dateEnd).format("DD-MM-YYYY") }}
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Total HT:</b>
                                  </span>
                                  {{ item.total }} €
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Total TTC :</b>
                                  </span>
                                  {{ item.totalTva }} €
                                </div>
                                <div v-if="item.state == 'terminé'">
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      <b>Etat :</b>
                                    </span>
                                    <a-tag
                                      class="text-xs ml-2 leading-5"
                                      color="#080"
                                    >
                                      Répondu
                                    </a-tag>
                                  </div>
                                </div>
                                <div v-else-if="item.state == 'en cours'">
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      <b>Etat :</b>
                                    </span>
                                    <a-tag
                                      class="text-xs ml-2 leading-5"
                                      color="#05f"
                                    >
                                      En cours
                                    </a-tag>
                                  </div>
                                </div>
                                <div v-else>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      <b>Etat :</b>
                                    </span>
                                    <a-tag
                                      class="text-xs ml-2 leading-5"
                                      color="#D00"
                                    >
                                      Répondu
                                    </a-tag>
                                  </div>
                                </div>
                              </template>
                            </a-card-meta>
                          </a-card>
                        </a-badge-ribbon>
                        <a-badge-ribbon v-else-if="item.confirmed == false" class="mr-2" color="red" text="refusé">
                          <a-card class="mr-2" hoverable>
                            <a-card-meta :title="`Agence : ${users[index].nameAgence}`">
                              <template #description>
                                <div class="flex items-center justify-center">
                                  <a-avatar
                                    :src="users[index].image"
                                    shape="square"
                                    :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 120, xxl: 160 }"
                                  />
                                </div>
                                <br>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Solution innovante :</b>
                                  </span>
                                  {{ item.offer.name }}
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Date de début :</b>
                                  </span>
                                  {{ item.dateBegin }}
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Date de fin :</b>
                                  </span>
                                  {{ item.dateEnd }}
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Total HT:</b>
                                  </span>
                                  {{ item.total }} €
                                </div>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Total TTC :</b>
                                  </span>
                                  {{ item.totalTva }} €
                                </div>
                                <div v-if="item.state == 'terminé'">
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      <b>Etat : </b>
                                    </span>
                                    <a-tag
                                      class="text-xs ml-2 leading-5"
                                      color="#080"
                                    >
                                      Répondu
                                    </a-tag>
                                  </div>
                                </div>
                                <div v-else-if="item.state == 'en cours'">
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      <b>Etat :</b>
                                    </span>
                                    <a-tag
                                      class="text-xs ml-2 leading-5"
                                      color="#05f"
                                    >
                                      En cours
                                    </a-tag>
                                  </div>
                                </div>
                                <div v-else>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      <b>Etat</b>
                                    </span>
                                    <a-tag
                                      class="text-xs ml-2 leading-5"
                                      color="#D00"
                                    >
                                      Répondu
                                    </a-tag>
                                  </div>
                                </div>
                              </template>
                            </a-card-meta>
                          </a-card>
                        </a-badge-ribbon>
                        <a-card v-else class="mr-2" hoverable>
                          <a-card-meta :title="`Agence : ${users[index].nameAgence}`">
                            <template #description>
                              <div class="flex items-center justify-center">
                                <a-avatar
                                  :src="users[index].image"
                                  shape="square"
                                  :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 120, xxl: 160 }"
                                />
                              </div>
                              <br>
                              <div class="flex items-center">
                                <span class=" mr-1.5">
                                  <b>Solution innovante :</b>
                                </span>
                                {{ item.offer.name }}
                              </div>
                              <div class="flex items-center">
                                <span class=" mr-1.5">
                                  <b>Date de début :</b>
                                </span>
                                {{ item.dateBegin }}
                              </div>
                              <div class="flex items-center">
                                <span class=" mr-1.5">
                                  <b>Date de fin :</b>
                                </span>
                                {{ item.dateEnd }}
                              </div>
                              <div class="flex items-center">
                                <span class=" mr-1.5">
                                  <b>Total HT:</b>
                                </span>
                                {{ item.total }} €
                              </div>
                              <div class="flex items-center">
                                <span class=" mr-1.5">
                                  <b>Total TTC :</b>
                                </span>
                                {{ item.totalTva }} €
                              </div>
                              <div v-if="item.state == 'terminé'">
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Etat :</b>
                                  </span>
                                  <a-tag
                                    class="text-xs ml-2 leading-5"
                                    color="#080"
                                  >
                                    Répondu
                                  </a-tag>
                                </div>
                              </div>
                              <div v-else-if="item.state == 'en cours'">
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Etat :</b>
                                  </span>
                                  <a-tag
                                    class="text-xs ml-2 leading-5"
                                    color="#05f"
                                  >
                                    En cours
                                  </a-tag>
                                </div>
                              </div>
                              <div v-else>
                                <div class="flex items-center">
                                  <span class=" mr-1.5">
                                    <b>Etat :</b>
                                  </span>
                                  <a-tag
                                    class="text-xs ml-2 leading-5"
                                    color="#D00"
                                  >
                                    Répondu
                                  </a-tag>
                                </div>
                              </div>
                            </template>
                          </a-card-meta>
                        </a-card>
                      </div>
                    </swiper-slide>
                  </swiper>
                </div>
              </a-card>
            </div>
            <div class="pt-0">
              <div class>
                <a-card title="Détails de la Mission" :bordered="false" class="rounded-sm font-bold">
                  <a-spin v-if="spinningValue" class="mx-auto" />
                  <a-form
                    v-else
                    :model="formStateMission"
                    v-bind="formItemLayout"
                    @finish-failed="onFinishFailed"
                    @finish="onFinish"
                  >
                    <a-form-item class="font-bold" name="name" label="Nom de la mission :">
                      <label class="font-normal">{{ formStateMission.name }}</label>
                    </a-form-item>
                    <a-form-item class="font-bold" name="objectif" label="Objectif :">
                      <label class="font-normal">{{ formStateMission.objectif }}</label>
                    </a-form-item>
                    <a-form-item class="font-bold" name="description" label="Description">
                      <label class="font-normal">{{ formStateMission.description }}</label>
                    </a-form-item>
                  </a-form>
                </a-card>
              </div>
              <div class>
                <a-card title="Profil recherché" :bordered="false" class="rounded-sm font-bold">
                  <a-spin v-if="spinningValue" class="mx-auto" />
                  <div v-else>
                    <div v-if="formStateMission">
                      <a-form
                        :model="formStateMission"
                        v-bind="formItemLayout"
                        @finish-failed="onFinishFailed"
                        @finish="onFinish"
                      >
                        <a-form-item class="font-bold" name="name" label="profile :">
                          <label class="font-normal">{{ formStateMission.title_profile }}</label>
                        </a-form-item>
                        <a-form-item class="font-bold" name="jobCat" label="Catégorie de métier :">
                          <label class="font-normal">{{ jobsName?.[jobsId?.indexOf(formStateMission?.jobCat)] }}</label>
                        </a-form-item>
                        <a-form-item class="font-bold" name="level" label="Niveau du freelance">
                          <label class="font-normal">{{ formStateMission.level }}</label>
                        </a-form-item>
                        <a-form-item class="font-bold" name="skillsNeeded" label="Compétences requises :">
                          <a-list
                            size="small"
                            item-layout="horizontal"
                            :data-source="formStateMission.skillsNeeded.filter(s => s).map(s => ({ title: s }))"
                          >
                            <template #renderItem="{ item: skill }">
                              <a-list-item>
                                <div class="flex items-center">
                                  <span
                                    class="i-carbon-ai-status-complete inline-block text-green-400 text-lg mr-2.5"
                                  />
                                  <span class="text-sm">{{ skill.title }}</span>
                                </div>
                              </a-list-item>
                            </template>
                          </a-list>
                        </a-form-item>
                        <a-form-item class="font-bold" name="skillsAppreciated" label="Compétences appréciées :">
                          <a-list
                            size="small"
                            item-layout="horizontal"
                            :data-source="formStateMission.skillsAppreciated.filter(s => s).map(s => ({ title: s }))"
                          >
                            <template #renderItem="{ item: skill }">
                              <a-list-item>
                                <div class="flex items-center">
                                  <span
                                    class="i-carbon-ai-status inline-block text-green-400 text-lg mr-2.5"
                                  />
                                  <span class=" text-sm">{{ skill.title }}</span>
                                </div>
                              </a-list-item>
                            </template>
                          </a-list>
                        </a-form-item>
                        <a-form-item class="font-bold" name="languages" label="Langues :">
                          <a-list
                            size="small"
                            item-layout="horizontal"
                            :data-source="formStateMission.languages.filter(s => s).map(s => ({ title: s }))"
                          >
                            <template #renderItem="{ item: lang }">
                              <a-list-item>
                                <div class="flex items-center">
                                  <span
                                    class="i-carbon-user-speaker inline-block text-green-400 text-lg mr-2.5"
                                  />
                                  <span class=" text-sm">{{ lang.title }}</span>
                                </div>
                              </a-list-item>
                            </template>
                          </a-list>
                        </a-form-item>
                      </a-form>
                    </div>
                  </div>
                </a-card>
              </div>
              <div class>
                <a-card title="Condition" :bordered="false" class="rounded-sm font-bold">
                  <a-spin v-if="spinningValue" class="mx-auto" />
                  <div v-else>
                    <div v-if="formStateMission">
                      <a-form
                        :model="formStateMission"
                        v-bind="formItemLayout"
                        @finish-failed="onFinishFailed"
                        @finish="onFinish"
                      >
                        <div v-if="formStateMission.supp_month">
                          <a-form-item class="font-bold" name="supp_month" label="Durée de la mission :">
                            <label class="font-normal">plus d'un mois</label>
                          </a-form-item>
                          <a-form-item class="font-bold" name="period_per_month" label="Nombre de mois estimé :">
                            <label class="font-normal">{{ formStateMission.period_per_month }}</label>
                          </a-form-item>
                          <a-form-item class="font-bold" name="pricer_per_day" label="Le tarif du freelance €/Jour :">
                            <label class="font-normal">{{ formStateMission.price_per_day }}</label>
                          </a-form-item>
                          <a-form-item name="work_frequence" class="font-bold" label="Fréquence / semaine">
                            <a-slider
                              v-model:value="formStateMission.work_frequence"
                              :step="null"
                              :disabled="boolTrue"
                              :tip-formatter="null"
                              :marks="{
                                0: '1 jour',
                                25: '2 jours',
                                50: '3 jours',
                                75: '4 jours',
                                100: '5 jours'
                              }"
                            />
                          </a-form-item>
                        </div>
                        <div v-else>
                          <a-form-item class="font-bold" name="supp_month" label="Durée de la mission :">
                            <label class="font-normal">moins d'un mois</label>
                          </a-form-item>
                          <a-form-item class="font-bold" name="budget" label="Budget :">
                            <label class="font-normal">{{ formStateMission.budget }} €</label>
                          </a-form-item>
                        </div>
                        <a-form-item class="font-bold" name="dateBegin" label="Date de début :">
                          <label class="font-normal">
                            <span
                              class="i-carbon-time inline-block text-gray-700 text-xs mr-0.5"
                            />
                            <span>
                              {{
                                dayjs(formStateMission.dateBegin).format("DD-MM-YYYY")
                              }}
                            </span>
                          </label>
                        </a-form-item>
                        <div v-if="formStateMission.telework">
                          <a-form-item class="font-bold" name="telework" label="Télétravail :">
                            <label class="font-normal"><a-tag
                              class="text-xs ml-2 leading-5"
                              color="#080"
                            >
                              Oui
                            </a-tag></label>
                          </a-form-item>
                          <a-form-item name="nb_days_telework" class="font-bold" label="Fréquence télétravail / semaine">
                            <a-slider
                              v-model:value="formStateMission.nb_days_telework"
                              :step="null"
                              :disabled="boolTrue"
                              :tip-formatter="null"
                              :marks="{
                                0: '1 jour',
                                25: '2 jours',
                                50: '3 jours',
                                75: '4 jours',
                                100: '5 jours'
                              }"
                            />
                          </a-form-item>
                        </div>
                        <div v-else>
                          <a-form-item class="font-bold" name="telework" label="Télétravail :">
                            <label class="font-normal"><a-tag
                              class="text-xs ml-2 leading-5"
                              color="#D00"
                            >
                              Non
                            </a-tag></label>
                          </a-form-item>
                        </div>
                        <a-form-item class="font-bold" name="local_city" label="Emplacement de la mission :">
                          <label class="font-normal">{{ formStateMission.local_city }}</label>
                        </a-form-item>
                        <div class="row">
                          <a-button
                            v-if="currentUser?.role === 'Freelancer' && formStateMission.id_agence == null "
                            class="btn-theme m-2"
                            @click="() => { resetFields(); modelRefDevis.id = undefined; visibleModalSendDevis = true }"
                          >
                            Envoyer un Devis
                          </a-button>
                          <a-button
                            v-if="currentUser?.role === 'Agence' && formStateMission.freelancers.length == 0 && formStateMission.id_agence == null"
                            class="btn-theme m-2"
                            @click="() => { resetFields(); modelRefDevis.id = undefined; visibleModalSendDevisAgence = true;getOffers() }"
                          >
                            Envoyer un Devis
                          </a-button>
                        </div>
                      </a-form>
                    </div>
                  </div>
                </a-card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!--== End Login Area Wrapper ==-->
  </div>
</template>
<style lang="less">
.swiper-wrapper {
  display: flex;
}
.ant-tabs-tab {
  @apply px-4;
}
.ant-tabs-top > .ant-tabs-nav {
  @apply mb-7;
}
.ant-tabs-content-holder {
  @apply rounded-sm;
}
.steps-content {
  margin-top: 12px;
  border: 1px dashed #e9e9e9;
  border-radius: 6px;
  background-color: #fafafa;
  min-height: 200px;
}
.ant-tabs-tab{
  padding: 20px;
  font-size: 16px;
  font-weight: bold;
}
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
</route>
