<template>
  <section class="wrap">
    <div class="section-header">
      <h1 class="page-title">Mood Tracker</h1>
      <p class="page-desc">Track your daily mood, jot notes and triggers.</p>
      <div class="head__actions" style="margin-top:10px; display:flex; gap:8px; justify-content:center;">
        <Button icon="pi pi-file-pdf" label="Export PDF" @click="onExportPdf" />
        <Button icon="pi pi-envelope" label="Send via Email" @click="onSendEmail" />
      </div>
    </div>

    <Message v-if="lowStreak >= 3" severity="warn" :closable="false" class="warn">
      We noticed several low-mood days in a row. Consider your self-care plan and reaching out to support resources.
    </Message>

    <Card class="card-panel">
      <template #title>New Entry</template>
      <template #content>
        <div class="grid2">
          <div>
            <label class="lbl">Date</label>
            <Calendar v-model="entry.date" dateFormat="yy-mm-dd" showIcon class="wfull"/>
          </div>
          <div>
            <label class="lbl">Mood (1–10)</label>
            <InputText v-model.number="entry.mood" type="number" min="1" max="10" class="wfull" />
          </div>
          <div class="span2">
            <label class="lbl">Notes</label>
            <Textarea v-model="entry.notes" rows="3" class="wfull" autoResize placeholder="What influenced your mood today?" />
          </div>
          <div class="span2">
            <label class="lbl">Triggers (comma separated)</label>
            <InputText v-model="entry.triggersRaw" placeholder="sleep, workload, exercise" class="wfull" />
          </div>
        </div>
        <div class="right">
          <Button label="Clear" severity="secondary" @click="resetEntry" />
          <Button label="Save" icon="pi pi-check" @click="saveEntry" />
        </div>
      </template>
    </Card>

    <Card class="card-panel">
      <template #title>My Entries</template>
      <template #content>
        <div class="filters">
          <div class="fcol">
            <label class="lbl">Global search</label>
            <InputText v-model="globalFilter" placeholder="Search notes / triggers…" class="wfull" />
          </div>
          <div class="fcol w220">
            <label class="lbl">Range</label>
            <Dropdown v-model="rangeDays" :options="rangeOptions" optionLabel="label" optionValue="value" class="wfull" />
          </div>
        </div>

        <DataTable
          :value="filteredEntries"
          paginator :rows="10"
          sortMode="multiple"
          :filters="filters"
          filterDisplay="row"
          :globalFilterFields="['dateStr','moodStr','notes','triggersStr']"
          responsiveLayout="scroll"
          class="datatable"
        >
          <Column field="dateStr" header="Date" sortable style="min-width:9rem" />
          <Column field="mood" header="Mood" sortable style="min-width:6rem">
            <template #body="{ data }"><Tag :value="data.mood" :severity="moodColor(data.mood)" /></template>
          </Column>
          <Column field="notes" header="Notes" filter style="min-width:14rem" />
          <Column field="triggersStr" header="Triggers" filter style="min-width:12rem" />
        </DataTable>
      </template>
    </Card>

    <Card class="card-panel">
      <template #title>Mood Trend</template>
      <template #content>
        <p class="muted" style="margin-top:-4px;">Line chart of your mood over the selected period.</p>
        <Chart type="line" :data="chartData" :options="chartOptions" style="width:100%;" />
      </template>
    </Card>

    <div class="summary">
      <div class="sum-card"><div class="sum-title">Period</div><div class="sum-val">{{ rangeLabel }}</div></div>
      <div class="sum-card"><div class="sum-title">Average</div><div class="sum-val">{{ stats.avg ?? '-' }}</div></div>
      <div class="sum-card"><div class="sum-title">Min</div><div class="sum-val">{{ stats.min ?? '-' }}</div></div>
      <div class="sum-card"><div class="sum-title">Max</div><div class="sum-val">{{ stats.max ?? '-' }}</div></div>
    </div>
    <p class="muted tiny">This summary is for self-reflection only and is not medical advice.</p>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { store } from '@/store'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import Calendar from 'primevue/calendar'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Chart from 'primevue/chart'
import jsPDF from 'jspdf'
import { exportMoodSummaryPdf } from '@/utils/exportPdf'
import { runValidators, required, intRange, maxLen } from '@/utils/validators'
import { sanitizeText } from '@/utils/sanitize'

const toast = useToast()

const API_EMAIL = 'https://mindhaven-api.jzho0194.workers.dev/api/email'
const ALLOWED_TEST_EMAIL = 'jzho0194@student.monash.edu'

// 表单
const entry = reactive({ date: new Date(), mood: 7, notes: '', triggersRaw: '' })
function resetEntry(){ entry.date = new Date(); entry.mood = 7; entry.notes=''; entry.triggersRaw='' }

function saveEntry(){
  if (!store.isLoggedIn.value){
    toast.add({severity:'info', summary:'Sign in required', detail:'Guest mode is read-only.', life:2200})
    return
  }
  const errMood = runValidators(entry.mood, [required, intRange(1,10)])
  const errNotes = runValidators(entry.notes, [maxLen(500)])
  if (errMood !== true)  return toast.add({ severity:'warn', summary:'Mood',  detail:errMood,  life:2200 })
  if (errNotes !== true) return toast.add({ severity:'warn', summary:'Notes', detail:errNotes, life:2200 })

  const cleanNotes = sanitizeText(entry.notes)
  const cleanTriggers = (entry.triggersRaw || '').split(',').map(s=>sanitizeText(s)).filter(Boolean)

  const ts = entry.date ? new Date(entry.date).getTime() : Date.now()
  const row = {
    id:'m_'+ts,
    userId:store.currentUser.value?.uid,
    date:ts,
    mood:Number(entry.mood),
    notes: cleanNotes,
    triggers: cleanTriggers
  }
  store.moodEntries.value = [row, ...(store.moodEntries.value||[])]
  toast.add({severity:'success', summary:'Saved', life:1600})
  resetEntry()
}

const lowStreak = computed(() => {
  const list = (store.moodEntries.value||[]).slice().sort((a,b)=>b.date-a.date)
  let s=0
  for (const r of list){
    const diff=(Date.now()-r.date)/86400000
    if (diff>7) break
    if (r.mood<=3) s++; else break
  }
  return s
})

// 数据表过滤
const globalFilter = ref('')
const filters = ref({
  global:{value:null, matchMode:'contains'},
  notes:{value:null, matchMode:'contains'},
  triggersStr:{value:null, matchMode:'contains'}
})
watch(globalFilter, v => { filters.value.global.value = v || null })

const rangeOptions = [
  {label:'Last 7 days', value:7},
  {label:'Last 30 days', value:30},
  {label:'Last 90 days', value:90}
]
const rangeDays = ref(30)
const rangeLabel = computed(()=> rangeOptions.find(o=>o.value===rangeDays.value)?.label || 'Custom')

const filteredEntries = computed(()=>{
  const uid = store.currentUser.value?.uid
  const cutoff = Date.now() - rangeDays.value*86400000
  return (store.moodEntries.value||[])
    .filter(r => (uid ? r.userId===uid : false))
    .filter(r => r.date>=cutoff)
    .map(r => ({
      ...r,
      dateStr:new Date(r.date).toISOString().slice(0,10),
      moodStr:String(r.mood),
      triggersStr:(r.triggers||[]).join(', ')
    }))
    .sort((a,b)=>a.date-b.date) 
})

const chartData = computed(() => ({
  labels: filteredEntries.value.map(r => r.dateStr),
  datasets: [{
    label: 'Mood',
    data: filteredEntries.value.map(r => r.mood),
    borderWidth: 2,
    fill: false,
    tension: 0.25,
    pointRadius: 3,
  }]
}))

const chartOptions = computed(() => ({
  maintainAspectRatio: false,
  aspectRatio: 2,
  scales: {
    y: { min: 1, max: 10, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,.08)' } },
    x: { grid: { display: false } }
  },
  plugins: { legend: { display: false }, tooltip: { intersect: false, mode: 'index' } }
}))

function moodColor(m){ if (m>=8) return 'success'; if (m<=3) return 'danger'; if (m<=5) return 'warn'; return 'info' }
const stats = computed(()=>{
  const arr=filteredEntries.value.map(r=>r.mood)
  if(!arr.length) return {avg:null,min:null,max:null}
  const avg=Math.round((arr.reduce((a,b)=>a+b,0)/arr.length)*10)/10
  return {avg,min:Math.min(...arr),max:Math.max(...arr)}
})

function onExportPdf(){
  exportMoodSummaryPdf({
    title:'Mood Summary',
    period:rangeLabel.value,
    avg:stats.value.avg,
    min:stats.value.min,
    max:stats.value.max,
    notes:'This summary is for self-reflection only and is not medical advice.'
  }, `mood_summary_${new Date().toISOString().slice(0,10)}.pdf`)
}

function smallPdfBase64(){
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  doc.setFontSize(18); doc.text('Mood Summary', 40, 60)
  doc.setFontSize(12)
  doc.text(`Period: ${rangeLabel.value}`, 40, 90)
  doc.text(`Average: ${stats.value.avg ?? '-'}`, 40, 110)
  doc.text(`Min: ${stats.value.min ?? '-'}`, 40, 130)
  doc.text(`Max: ${stats.value.max ?? '-'}`, 40, 150)
  doc.setFontSize(10)
  doc.text('Note: This summary is for self-reflection only and is not medical advice.', 40, 180, { maxWidth: 500 })
  return doc.output('datauristring').split(',')[1]
}

async function onSendEmail(){
  try {
    const to = ALLOWED_TEST_EMAIL 
    const base64 = smallPdfBase64()

    const res = await fetch(API_EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject: 'Your Mood Summary',
        html: '<p>Please find attached your mood summary.</p>',
        attachments: [{ filename: 'mood_summary.pdf', content: base64 }]
      })
    })

    let data; const ct = res.headers.get('content-type')||''
    data = ct.includes('application/json') ? await res.json().catch(()=>null) : { ok:false }

    if (res.ok && data?.ok) {
      toast.add({ severity:'success', summary:'Email sent', life:2200 })
    } else {
      throw new Error(data?.error || `HTTP ${res.status} ${res.statusText}`)
    }
  } catch (err) {
    toast.add({ severity:'error', summary:'Email failed', detail:String(err?.message||err), life:4000 })
  }
}
</script>

<style scoped>
.wrap{ max-width: 1100px; margin: 0 auto; padding: 24px 16px 40px; }
.warn{ box-shadow:0 4px 14px rgba(255,170,0,.15); border-radius:14px; }

.card-panel{ box-shadow:0 6px 20px rgba(0,0,0,.06); border-radius:14px; }
.grid2{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
.span2{ grid-column: span 2; }
.lbl{ display:block; font-size:13px; color:#345; margin-bottom:4px; }
.wfull{ width:100%; }
.right{ display:flex; justify-content:flex-end; gap:8px; margin-top: 10px; }

.filters{ display:grid; grid-template-columns: 1fr 220px; gap:12px; margin-bottom:10px; }
.w220{ width:220px; }
.datatable{ font-size: 14px; }

.summary{ display:grid; grid-template-columns: repeat(4,1fr); gap:10px; margin-top: 14px; }
.sum-card{ background:#fff; border-radius:12px; padding:12px 14px; box-shadow:0 4px 16px rgba(0,0,0,.06); text-align:center; }
.sum-title{ color:#456; font-size:13px; }
.sum-val{ color:#123; font-weight:700; font-size:18px; margin-top:4px; }

.p-card:has(> .p-card-body) { overflow: hidden; }
.p-card .p-card-body { height: 100%; }
.p-card .p-card-content { height: 360px; } 

@media (max-width: 760px){
  .grid2{ grid-template-columns:1fr; } .span2{ grid-column:1; }
  .filters{ grid-template-columns:1fr; } .w220{ width:auto; }
  .summary{ grid-template-columns:1fr 1fr; }
  .p-card .p-card-content { height: 300px; }
}
</style>
/demostrate
