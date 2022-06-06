<script setup lang="ts">
import { Form, message } from 'ant-design-vue'
import type { RuleObject } from 'ant-design-vue/es/form'
import SwiperCore, { Controller, Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css/pagination'

import { api as apiServices } from '~/common/composables'

const controlledSwiper = ref(null)
const offerSwiper = ref(null)
const setControlledSwiper = (swiper) => {
  controlledSwiper.value = swiper
}
const setOfferSwiper = (swiper) => {
  offerSwiper.value = swiper
}
SwiperCore.use([Controller, Pagination])
const useForm = Form.useForm
const currentStep = ref(0)
const profileEntrepriseLoading = ref(false)
const jobs = ref([])
const jobsName = ref([])
const jobsId = ref([])
const languages = ref([])
const levels = ref([])
const skills = ref([])
const freelancers = ref([])
const agences = ref([])
const offers = ref([])
const freelancersNeeded = ref([])
const freelancersAppreciated = ref([])
const freelancersLoading = ref(false)
const agencesLoading = ref(false)
const activeKey = ref('1')
const priceRange = ref([50, 99999])
const offersUnfiltred = ref([])

const formStateRequiredProfile = reactive<Record<string, any>>({
  title_profile: '',
  level: '',
  jobCat: undefined,
  skillsNeeded: [],
  skillsAppreciated: [],
  languages: [],
  name: '',
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
const formStateFilter = reactive<Record<string, any>>({
  min: 50,
  max: 99999,
})
const rulesRequiredProfile = reactive({
  title_profile: [
    {
      required: true,
      message: 'Saisir l\'intitulé de poste ',
    },
  ],
  level: [
    {
      required: true,
      validator: async(_rule: RuleObject, value: string) => {
        if (currentStep.value == 0) {
          if (!value || !levels.value.map(l => l.value).includes(value))
            return Promise.reject(new Error('Veuillez saisir votre niveau'))
          else
            return Promise.resolve()
        }
        else { return Promise.resolve() }
      },
      trigger: 'blur',
    },
  ],
  jobCat: [
    {
      required: true,
      message: 'choisir la catégorie de métier du profil recherché',
    },
  ],
  skillsNeeded: [
    {
      validator: async(_rule: RuleObject, value: any) => {
        if (currentStep.value == 0) {
          if (value.length < 2)
            return Promise.reject(new Error('Veuillez saisir au minimum 2 compétences'))
          else
            return Promise.resolve()
        }
        else { return Promise.resolve() }
      },
    },
  ],
  skillsAppreciated: [
    {
      validator: async(_rule: RuleObject, value: any) => {
        if (currentStep.value == 0) {
          if (value.length < 3)
            return Promise.reject(new Error('Veuillez saisir au minimum 3 compétences'))
          else if (value.length > 12)
            return Promise.reject(new Error('Veuillez saisir au maximum 12 compétences'))

          else
            return Promise.resolve()
        }
        else { return Promise.resolve() }
      },
    },
  ],
})
const { resetFields, validate, validateInfos: requiredProfileValidateInfos } = useForm(formStateRequiredProfile, rulesRequiredProfile)

const searchProfile = async() => {
  await validate()
    .then(async() => {
      profileEntrepriseLoading.value = true
      const params = toRaw(formStateRequiredProfile)
      const { data: dataSearch, error: errorSearch } = await apiServices('/freelancer/required-profile/').post(params).json()

      if (dataSearch.value && !errorSearch.value) {
        freelancers.value = dataSearch.value.freelancers
        freelancersNeeded.value = dataSearch.value.freelancersNeeded
        freelancersAppreciated.value = dataSearch.value.freelancersAppreciated
      }
    }).catch((err) => {
      message.error(err)
      profileEntrepriseLoading.value = false
    }).finally(() => profileEntrepriseLoading.value = false)
}
const filterAll = async() => {
  offers.value = offersUnfiltred.value
  if (priceRange.value[1] === formStateFilter.max)
    offers.value = await offers.value.filter(j => j.price >= priceRange.value[0])

  else
    offers.value = await offers.value.filter(j => j.price >= priceRange.value[0] && j.price <= priceRange.value[1])
}

const onFinish = async(values: any) => {
  console.log('finished')
}
const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
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
}
const searchProfileAgence = async() => {
  profileEntrepriseLoading.value = true
  const params = toRaw({ jobCat: formStateRequiredProfile.jobCat, minPrice: 50, maxPrice: 99999 })
  const { data: dataSearchAgence, error: errorSearchAgence } = await apiServices('/agence/required-profile/').post(params).json()
  if (dataSearchAgence.value && !errorSearchAgence.value) {
    agences.value = dataSearchAgence.value.agences
    offers.value = dataSearchAgence.value.offers
    offersUnfiltred.value = dataSearchAgence.value.offers
    formStateFilter.min = 50
    formStateFilter.max = 99999
    priceRange.value = [50, 99999]
    profileEntrepriseLoading.value = false
  }
  else {
    message.error(errorSearchAgence.value)
    profileEntrepriseLoading.value = false
  }
}
onMounted(async() => {
  getFormData()
})
</script>

<template>
  <div class="drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
    <!--== Start Login Area Wrapper ==-->
    <section class="account-login-area !bg-white !dark:bg-dark-600 !p-4 !mb-4 drop-shadow-sm drop-shadow-dark-100/1 rounded-1px">
      <div class="container pt-5">
        <a-skeleton v-if="!jobs" active :paragraph="{ rows: 15 }" />
        <div v-else class>
          <div class="pt-0">
            <a-tabs v-model:activeKey="activeKey" class="mt-0">
              <a-tab-pane key="1" tab="Recherche Freelance">
                <div class>
                  <a-card title="Freelance correspondants" :bordered="false" class="rounded-sm">
                    <a-spin v-if="freelancersLoading" class="mx-auto" />
                    <div v-else>
                      <h3>Profils Correspondants</h3>
                      <div v-if="freelancers && freelancers?.length">
                        <swiper
                          :modules="[Controller]"
                          :slides-per-view="4" class="p-3"
                          :pagination="{
                            clickable: true,
                          }"
                          :grab-cursor="true"
                          @swiper="setControlledSwiper"
                        >
                          <swiper-slide
                            v-for="(item, index) in freelancers"
                            :key="index"
                          >
                            <a-card class="mr-2" hoverable>
                              <template #actions>
                                <router-link key="show" class="i-ant-design-user-outlined inline-block" :to="`/freelancers/${item._id}`" />
                              </template>
                              <a-card-meta :title="item.title_profile">
                                <template #description>
                                  <div class="flex items-center justify-center">
                                    <a-avatar
                                      :src="item?.image"
                                      shape="square"
                                      :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 120, xxl: 160 }"
                                    />
                                  </div>
                                  <br>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      Nom et prénom:
                                    </span>
                                    {{ item.firstName }} {{ item.lastName }}
                                  </div>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      Email:
                                    </span>
                                    <span class="i-carbon-email text-xl inline-block mr-1" />
                                    {{ item.email }}
                                  </div>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      Téléphone:
                                    </span>
                                    <span class="i-carbon-phone text-xl inline-block mr-1" />
                                    {{ item?.phone }}
                                  </div>
                                </template>
                              </a-card-meta>
                            </a-card>
                          </swiper-slide>
                        </swiper>
                      </div>
                      <a-result
                        v-else
                        status="404"
                        title="aucun freelance ne corresponds. veuillez effectuer vos recherches"
                      />
                      <h3>Profils ayant les compétences souhaitées</h3>
                      <div v-if="freelancersNeeded && freelancersNeeded?.length">
                        <swiper
                          :modules="[Controller]"
                          :slides-per-view="4" class="p-3"
                          :pagination="{
                            clickable: true,
                          }"
                          :grab-cursor="true"
                          @swiper="setControlledSwiper"
                        >
                          <swiper-slide
                            v-for="(item, index) in freelancersNeeded"
                            :key="index"
                          >
                            <a-card class="mr-2" hoverable>
                              <template #actions>
                                <router-link key="show" class="i-ant-design-user-outlined inline-block" :to="`/freelancers/${item._id}`" />
                              </template>
                              <a-card-meta :title="item.title_profile">
                                <template #description>
                                  <div class="flex items-center justify-center">
                                    <a-avatar
                                      :src="item?.image"
                                      shape="square"
                                      :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 120, xxl: 160 }"
                                    />
                                  </div>
                                  <br>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      Nom et prénom:
                                    </span>
                                    {{ item.firstName }} {{ item.lastName }}
                                  </div>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      Email:
                                    </span>
                                    <span class="i-carbon-email text-xl inline-block mr-1" />
                                    {{ item.email }}
                                  </div>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      Téléphone:
                                    </span>
                                    <span class="i-carbon-phone text-xl inline-block mr-1" />
                                    {{ item?.phone }}
                                  </div>
                                </template>
                              </a-card-meta>
                            </a-card>
                          </swiper-slide>
                        </swiper>
                      </div>
                      <a-result
                        v-else
                        status="404"
                        title="aucun freelance ne corresponds. veuillez effectuer vos recherches"
                      />
                      <h3>Profils ayant les compétences aprréciées</h3>

                      <div v-if="freelancersAppreciated && freelancersAppreciated?.length">
                        <swiper
                          :modules="[Controller]"
                          :slides-per-view="4" class="p-3"
                          :pagination="{
                            clickable: true,
                          }"
                          :grab-cursor="true"
                          @swiper="setControlledSwiper"
                        >
                          <swiper-slide
                            v-for="(item, index) in freelancersAppreciated"
                            :key="index"
                          >
                            <a-card class="mr-2" hoverable>
                              <template #actions>
                                <router-link key="show" class="i-ant-design-user-outlined inline-block" :to="`/freelancers/${item._id}`" />
                              </template>
                              <a-card-meta :title="item.title_profile">
                                <template #description>
                                  <div class="flex items-center justify-center">
                                    <a-avatar
                                      :src="item?.image"
                                      shape="square"
                                      :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 120, xxl: 160 }"
                                    />
                                  </div>
                                  <br>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      Nom et prénom:
                                    </span>
                                    {{ item.firstName }} {{ item.lastName }}
                                  </div>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      Email:
                                    </span>
                                    <span class="i-carbon-email text-xl inline-block mr-1" />
                                    {{ item.email }}
                                  </div>
                                  <div class="flex items-center">
                                    <span class=" mr-1.5">
                                      Téléphone:
                                    </span>
                                    <span class="i-carbon-phone text-xl inline-block mr-1" />
                                    {{ item?.phone }}
                                  </div>
                                </template>
                              </a-card-meta>
                            </a-card>
                          </swiper-slide>
                        </swiper>
                      </div>
                      <a-result
                        v-else
                        status="404"
                        title="aucun freelance ne corresponds. veuillez effectuer vos recherches"
                      />
                    </div>
                  </a-card>
                </div>
              </a-tab-pane>
              <a-tab-pane key="2" tab="Recherche de solution innovante">
                <div class>
                  <a-card title="Solution innovante correspondantes" :bordered="false" class="rounded-sm">
                    <a-spin v-if="agencesLoading" class="mx-auto" />
                    <div v-else>
                      <div v-if="agences && agences.length > 0" class="row justify-content-between">
                        <a-skeleton v-if="!agences" avatar active :paragraph="{ rows: 15 }" />
                        <div class="min-h-70 flex items-center justify-center">
                          <a-spin v-if="agencesLoading" class="mx-auto" />
                          <div v-else>
                            <h1>Solutions innovantes :</h1>
                            <br>
                            <div class="grid gap-4 grid-cols-4 items-stretch">
                              <div v-for="(item, index) in agences" :key="index" class="">
                                <!--== Start Team Item ==-->
                                <div class="team-item">
                                  <div class="thumb">
                                    <a-avatar
                                      :src="item?.image"
                                      shape="square"
                                      :size="{ xs: 160, sm: 160, md: 160, lg: 160, xl: 160, xxl: 160 }"
                                    />
                                  </div>
                                  <div class="content">
                                    <h4 class="title">
                                      <routrer-link :to="`/profile/${item._id}`">
                                        {{ item.firstName }} {{ item.lastName }}
                                      </routrer-link>
                                    </h4>
                                    <h5 class="sub-title">
                                      {{ item.nameAgence }}
                                    </h5>
                                    <a-tag class="sub-title" color="green">
                                      + {{ item.phone }}
                                    </a-tag>
                                    <br>
                                    <router-link class="btn-theme mt-2 btn-white btn-sm" :to="`/agences/${item._id}`">
                                      Voir profile
                                    </router-link>
                                  </div>
                                  <!--== End Team Item ==-->
                                </div>
                              </div>
                            </div>
                            <h1>Offres :</h1>
                            <br>
                            <div class="row justify-content-between">
                              <div class="col-xl-2">
                                <div class="blog-sidebar blog-sidebar-right">
                                  <div class="widget-item">
                                    <div class="widget-title">
                                      <h3 class="title">
                                        Filtres
                                      </h3>
                                    </div>
                                    <div class="widget-body">
                                      <div>
                                        <h3><b>Prix</b></h3>
                                        <a-slider v-model:value="priceRange" max="99999" range @change="filterAll($event)" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div class="col-xl-10">
                                <div v-if="offers && offers.length > 0">
                                  <br>
                                  <swiper
                                    :modules="[Controller]"
                                    :slides-per-view="2" class="p-3"
                                    :pagination="{
                                      clickable: true,
                                    }"
                                    :grab-cursor="true"
                                    @swiper="setOfferSwiper"
                                  >
                                    <swiper-slide
                                      v-for="(item, index) in offers"
                                      :key="index"
                                    >
                                      <a-card class="mr-2" hoverable>
                                        <template #actions>
                                          <router-link key="show" class="i-ant-design-user-outlined inline-block" :to="`/agence/${item.id_agence}`" />
                                        </template>
                                        <a-card-meta :title="item.title_profile">
                                          <template #description>
                                            <br>
                                            <div class="flex items-center">
                                              <span class=" mr-1.5">
                                                Nom :
                                              </span>
                                              {{ item.name }}
                                            </div>
                                            <div v-if="item.show_price" class="flex items-center">
                                              <span class=" mr-1.5">
                                                Prix :
                                              </span>
                                              <a-tag
                                                class="text-xs ml-2 leading-5"
                                                color="#080"
                                              >
                                                {{ item.price }}
                                              </a-tag>
                                            </div>
                                            <div v-else class="flex items-center">
                                              <span class=" mr-1.5">
                                                <a-tag
                                                  class="text-xs ml-2 leading-5"
                                                  color="#D00"
                                                >
                                                  Prix non affiché
                                                </a-tag>
                                              </span>
                                              {{ item.price }}
                                            </div>
                                            <br>
                                            <div class="flex items-center bloc">
                                              <a-card-meta title="Description:">
                                                <template #description>
                                                  {{ item.description }}
                                                </template>
                                              </a-card-meta>
                                            </div>
                                          </template>
                                        </a-card-meta>
                                      </a-card>
                                    </swiper-slide>
                                  </swiper>
                                </div>
                                <a-result
                                  v-else
                                  status="404"
                                  title="aucune solution innovante ne corresponds"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <a-result
                        v-else
                        status="404"
                        title="aucune solution innovante ne corresponds. veuillez effectuer vos recherches"
                      />
                    </div>
                  </a-card>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
          <div class="pt-0">
            <div class>
              <a-card title="Recherche d'une solution Innovante :" :bordered="false" class="rounded-sm">
                <div class="p-4">
                  <div class="max-w-md mx-auto">
                    <a-form
                      v-if="activeKey==2"
                      layout="vertical"
                      :label-col="{ span: 24 }"
                      :wrapper-col="{ span: 24 }"
                      :model="formStateRequiredProfile"
                      @finish-failed="onFinishFailed"
                      @finish="onFinish"
                    >
                      <a-form-item
                        name="jobCat" label="Choisir une catégorie de métier"
                        v-bind="requiredProfileValidateInfos.jobCat"
                      >
                        <a-select
                          v-model:value="formStateRequiredProfile.jobCat"
                          placeholder="Choisir une catégorie de métier"
                          :options="jobs"
                        />
                      </a-form-item>
                      <a-form-item :wrapper-col="{ offset: 0, span: 24 }">
                        <a-button type="primary" block :loading="profileEntrepriseLoading" @click="searchProfileAgence">
                          Rechercher
                        </a-button>
                      </a-form-item>
                    </a-form>
                    <a-form
                      v-if="activeKey==1"
                      layout="vertical"
                      :label-col="{ span: 24 }"
                      :wrapper-col="{ span: 24 }"
                      :model="formStateRequiredProfile"
                      @finish-failed="onFinishFailed"
                      @finish="onFinish"
                    >
                      <a-form-item
                        name="title_profile"
                        label="Titre de profil"
                        v-bind="requiredProfileValidateInfos.title_profile"
                      >
                        <a-input v-model:value="formStateRequiredProfile.title_profile" />
                      </a-form-item>
                      <a-form-item
                        name="jobCat" label="Choisir une catégorie de métier"
                        v-bind="requiredProfileValidateInfos.jobCat"
                      >
                        <a-select
                          v-model:value="formStateRequiredProfile.jobCat"
                          placeholder="Choisir une catégorie de métier"
                          :options="jobs"
                        />
                      </a-form-item>
                      <a-form-item
                        name="level" label="Choisir un niveau"
                        v-bind="requiredProfileValidateInfos.level"
                      >
                        <a-select
                          v-model:value="formStateRequiredProfile.level"
                          placeholder="Choisir un niveau"
                          :options="levels"
                        />
                      </a-form-item>
                      <a-form-item
                        name="Coméptence" label="Séléctionner les compétences requises"
                        v-bind="requiredProfileValidateInfos.skillsNeeded"
                      >
                        <a-select
                          v-model:value="formStateRequiredProfile.skillsNeeded"
                          mode="tags"
                          style="width: 100%"
                          :token-separators="[',']"
                          placeholder="Séléctionner les compétences requises"
                          :options="skills"
                        />
                      </a-form-item>
                      <a-form-item
                        name="Coméptence" label="Séléctionner les compétences appréciées "
                        v-bind="requiredProfileValidateInfos.skillsAppreciated"
                      >
                        <a-select
                          v-model:value="formStateRequiredProfile.skillsAppreciated"
                          mode="tags"
                          style="width: 100%"
                          :token-separators="[',']"
                          placeholder="Séléctionner les compétences requises"
                          :options="skills"
                        />
                      </a-form-item>
                      <a-form-item name="languages" label="Langues maîtrisées">
                        <a-select
                          v-model:value="formStateRequiredProfile.languages"
                          mode="tags"
                          style="width: 100%"
                          :token-separators="[',']"
                          placeholder="Séléctionner les langues maitrisés"
                          :options="languages"
                        />
                      </a-form-item>
                      <a-form-item :wrapper-col="{ offset: 0, span: 24 }">
                        <a-button type="primary" block :loading="profileEntrepriseLoading" @click="searchProfile">
                          Rechercher
                        </a-button>
                      </a-form-item>
                    </a-form>
                  </div>
                </div>
              </a-card>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!--== End Login Area Wrapper ==-->
  </div>
</template>
<style lang="less">
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
.ant-card-meta-title {
    text-align: center !important;
    font-weight: bold;
}
.ant-card {
  word-break: break-word;
  text-align: justify;
}
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
  siderMenu:
    name: dashboard.search.index
    index: 1
    parentName: dashboard.search.parent
    link: dashboard-search
    classes: test for classes
    icon: i-carbon:notebook-reference
    childOf: null
    roles: [Root, Admin]
</route>
