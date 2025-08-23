<template>
  <section class="wrap">
    <header class="head">
      <div>
        <h1>Resources</h1>
        <p class="muted">Browse articles, videos and support contacts.</p>
      </div>
    </header>

    <Card class="card-panel">
      <template #title>Resource Library</template>
      <template #content>
        <div class="filters">
          <div class="f-col">
            <label class="lbl">Global search</label>
            <InputText v-model="global" placeholder="Search title / type / description…" class="wfull" />
          </div>
          <div class="f-col">
            <label class="lbl">Type</label>
            <Dropdown v-model="typeFilter" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="All" class="wfull" />
          </div>
        </div>

        <DataTable
          :value="rows"
          paginator :rows="10"
          sortMode="multiple"
          :filters="filters"
          filterDisplay="row"
          :globalFilterFields="['title','type','description']"
          responsiveLayout="scroll"
          class="datatable"
          dataKey="id"
        >
          <Column field="title" header="Title" sortable filter filterPlaceholder="Search title" style="min-width:14rem" />
          <Column field="type" header="Type" sortable filter style="min-width:8rem">
            <template #body="{ data }">
              <Tag :value="data.type" :severity="typeColor(data.type)" />
            </template>
          </Column>
          <Column field="description" header="Description" filter style="min-width:16rem" />
          <Column field="date" header="Updated" sortable style="min-width:9rem" />
          <Column field="rating" header="Rating" sortable style="min-width:7rem">
            <template #body="{ data }">
              {{ formatRating(data) }}
            </template>
          </Column>
          <Column header="Actions" :exportable="false" style="min-width:9rem">
            <template #body="{ data }">
              <div class="row-actions">
                <Button icon="pi pi-eye" rounded text @click="viewResource(data)" />
                <Button icon="pi pi-star" rounded text severity="warn" @click="rateResource(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { store } from '@/store'
import Card from 'primevue/card'
import Tag from 'primevue/tag'

const global = ref('')
const typeFilter = ref(null)
const typeOptions = [
  { label: 'All', value: null },
  { label: 'article', value: 'article' },
  { label: 'video', value: 'video' },
  { label: 'contact', value: 'contact' }
]
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  title: { value: null, matchMode: 'contains' },
  type: { value: null, matchMode: 'contains' },
  description: { value: null, matchMode: 'contains' }
})
watch(global, v => { filters.value.global.value = v || null })
watch(typeFilter, v => { filters.value.type.value = v || null })

const rows = computed(() => (store.resources.value || []).map(r => ({ ...r })))

function typeColor(t) {
  if (t === 'article') return 'info'
  if (t === 'video') return 'success'
  if (t === 'contact') return 'danger'
  return 'secondary'
}
function formatRating(r){
  const count = r.ratingCount ?? 0
  const rate = r.rating ?? 0
  return `${rate.toFixed ? rate.toFixed(1) : rate} (${count})`
}
function viewResource(r) {
  r.views = (r.views ?? 0) + 1
  store.showAlert?.(`Opened "${r.title}"`, 'info')
}
function rateResource(r) {
  r.ratingCount = (r.ratingCount ?? 0) + 1
  r.rating = Number(((r.rating ?? 0) * (r.ratingCount - 1) + 5) / r.ratingCount) // 假设这次给5星
  store.showAlert?.(`Thanks for rating "${r.title}"`, 'success')
}
</script>

<style scoped>
.wrap{ max-width: 1100px; margin: 0 auto; padding: 24px 16px 40px; }
.head h1{ margin:0; color:#135; font-size: 24px; }
.muted{ color:#667; margin:6px 0 0; }
.card-panel{ box-shadow:0 6px 20px rgba(0,0,0,.06); border-radius:14px; }
.filters{ display:grid; grid-template-columns: 1fr 220px; gap:12px; margin-bottom: 10px; }
.lbl{ display:block; font-size:13px; color:#345; margin-bottom:4px; }
.wfull{ width:100%; }
.datatable{ font-size: 14px; }
.row-actions{ display:flex; gap:6px; }
@media (max-width: 640px){ .filters{ grid-template-columns: 1fr; } }
</style>
