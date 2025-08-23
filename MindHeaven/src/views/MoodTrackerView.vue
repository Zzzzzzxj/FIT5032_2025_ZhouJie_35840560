<template>
  <section class="wrap">
    <header class="head">
      <h1>Mood Tracker</h1>
      <div class="head__actions">
        <Button icon="pi pi-file-pdf" label="Export PDF" @click="onExportPdf" />
      </div>
    </header>
    <p class="muted">
      Track your daily mood (1–10), jot notes and triggers. In sustained low mood (e.g., ≤ 3), consider contacting professional support.
    </p>

    <!-- 表单 -->
    <Card class="card-panel">
      <template #title>New Entry</template>
      <template #content>
        <div class="grid2">
          <div>
            <label class="lbl">Date</label>
            <Calendar v-model="entry.date" dateFormat="yy-mm-dd" showIcon class="wfull" />
          </div>
          <div>
            <label class="lbl">Mood (1-10)</label>
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

    <Message v-if="lowStreak >= 3" severity="warn" :closable="false" class="warn">
      We noticed several low-mood days in a row. Consider your self-care plan and reaching out to support resources.
    </Message>

    <!-- 我的记录 -->
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
          paginator
          :rows="10"
          sortMode="multiple"
          :filters="filters"
          filterDisplay="row"
          :globalFilterFields="['dateStr','moodStr','notes','triggersStr']"
          responsiveLayout="scroll"
          class="datatable"
        >
          <Column field="dateStr" header="Date" sortable style="min-width:9rem" />
          <Column field="mood" header="Mood" sortable style="min-width:6rem">
            <template #body="{ data }">
              <Tag :value="data.mood" :severity="moodColor(data.mood)" />
            </template>
          </Column>
          <Column field="notes" header="Notes" filter style="min-width:14rem" />
          <Column field="triggersStr" header="Triggers" filter style="min-width:12rem" />
          <Column header="Actions" :exportable="false" style="min-width:8rem">
            <template #body="{ data }">
              <div class="row-actions">
                <Button icon="pi pi-trash" rounded text severity="danger" @click="removeEntry(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 摘要 -->
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
import { exportMoodSummaryPdf } from '@/utils/exportPdf'
import Card from 'primevue/card'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { runValidators, required, intRange, maxLen } from '@/utils/validators'
import { sanitizeText } from '@/utils/sanitize'

const toast = useToast()

// 表单
const entry = reactive({ date: new Date(), mood: 7, notes: '', triggersRaw: '' })
function resetEntry() {
  entry.date = new Date()
  entry.mood = 7
  entry.notes = ''
  entry.triggersRaw = ''
}

// —— 保存（唯一版本，包含校验 + 安全）——
function saveEntry() {
  if (!store.isLoggedIn.value) {
    toast.add({
      severity: 'info',
      summary: 'Sign in required',
      detail: 'Guest mode is read-only.',
      life: 2200
    })
    return
  }

  // 校验：情绪 1–10，备注最长 500
  const errMood = runValidators(entry.mood, [required, intRange(1, 10)])
  const errNotes = runValidators(entry.notes, [maxLen(500)])
  if (errMood !== true) {
    return toast.add({ severity: 'warn', summary: 'Mood', detail: errMood, life: 2200 })
  }
  if (errNotes !== true) {
    return toast.add({ severity: 'warn', summary: 'Notes', detail: errNotes, life: 2200 })
  }

  // 安全：去除潜在 XSS
  const cleanNotes = sanitizeText(entry.notes)
  const cleanTriggers = (entry.triggersRaw || '')
    .split(',')
    .map(s => sanitizeText(s))
    .filter(Boolean)

  const ts = entry.date ? new Date(entry.date).getTime() : Date.now()
  const row = {
    id: 'm_' + ts,
    userId: store.currentUser.value?.uid,
    date: ts,
    mood: Math.max(1, Math.min(10, Number(entry.mood))),
    notes: cleanNotes,
    triggers: cleanTriggers
  }

  store.moodEntries.value = [row, ...(store.moodEntries.value || [])]
  toast.add({ severity: 'success', summary: 'Saved', life: 1600 })
  resetEntry()
}

// 低分连续天数（最近 7 天）
const lowStreak = computed(() => {
  const list = (store.moodEntries.value || []).slice().sort((a, b) => b.date - a.date)
  let s = 0
  for (const r of list) {
    const diff = (Date.now() - r.date) / 86400000
    if (diff > 7) break
    if (r.mood <= 3) s++
    else break
  }
  return s
})

// 全局过滤 / 范围
const globalFilter = ref('')
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  notes: { value: null, matchMode: 'contains' },
  triggersStr: { value: null, matchMode: 'contains' }
})
watch(globalFilter, v => { filters.value.global.value = v || null })

const rangeOptions = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 }
]
const rangeDays = ref(30)
const rangeLabel = computed(() => rangeOptions.find(o => o.value === rangeDays.value)?.label || 'Custom')

// 过滤后的记录
const filteredEntries = computed(() => {
  const uid = store.currentUser.value?.uid
  const cutoff = Date.now() - rangeDays.value * 86400000
  return (store.moodEntries.value || [])
    .filter(r => (uid ? r.userId === uid : false))
    .filter(r => r.date >= cutoff)
    .map(r => ({
      ...r,
      dateStr: new Date(r.date).toISOString().slice(0, 10),
      moodStr: String(r.mood),
      triggersStr: (r.triggers || []).join(', ')
    }))
    .sort((a, b) => b.date - a.date)
})

// 颜色与删除
function moodColor(m) {
  if (m >= 8) return 'success'
  if (m <= 3) return 'danger'
  if (m <= 5) return 'warn'
  return 'info'
}
function removeEntry(row) {
  store.moodEntries.value = (store.moodEntries.value || []).filter(r => r.id !== row.id)
  toast.add({ severity: 'info', summary: 'Deleted', life: 1400 })
}

// 统计
const stats = computed(() => {
  const arr = filteredEntries.value.map(r => r.mood)
  if (!arr.length) return { avg: null, min: null, max: null }
  const avg = Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
  return { avg, min: Math.min(...arr), max: Math.max(...arr) }
})

// PDF 导出
function onExportPdf() {
  exportMoodSummaryPdf(
    {
      title: 'Mood Summary',
      period: rangeLabel.value,
      avg: stats.value.avg,
      min: stats.value.min,
      max: stats.value.max,
      notes: 'This summary is for self-reflection only and is not medical advice.'
    },
    `mood_summary_${new Date().toISOString().slice(0, 10)}.pdf`
  )
}
</script>

<style scoped>
.wrap{ max-width: 1100px; margin: 0 auto; padding: 24px 16px 40px; }
.head{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
.head h1{ margin:0; color:#135; font-size: 24px; }
.head__actions{ display:flex; gap:8px; flex-wrap: wrap; }
.muted{ color:#667; margin: 6px 0 14px; }
.tiny{ font-size: 12px; }
.card-panel{ box-shadow:0 6px 20px rgba(0,0,0,.06); border-radius:14px; }
.grid2{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
.span2{ grid-column: span 2; }
.lbl{ display:block; font-size:13px; color:#345; margin-bottom:4px; }
.wfull{ width:100%; }
.right{ display:flex; justify-content:flex-end; gap:8px; margin-top: 10px; }
.warn{ box-shadow:0 4px 14px rgba(255,170,0,.15); border-radius:14px; }
.filters{ display:grid; grid-template-columns: 1fr 220px; gap:12px; margin-bottom:10px; }
.w220{ width:220px; }
.datatable{ font-size: 14px; }
.row-actions{ display:flex; gap:6px; }
.summary{ display:grid; grid-template-columns: repeat(4,1fr); gap:10px; margin-top: 14px; }
.sum-card{ background:#fff; border-radius:12px; padding:12px 14px; box-shadow:0 4px 16px rgba(0,0,0,.06); text-align:center; }
.sum-title{ color:#456; font-size:13px; }
.sum-val{ color:#123; font-weight:700; font-size:18px; margin-top:4px; }
@media (max-width: 760px){
  .grid2{ grid-template-columns:1fr; } .span2{ grid-column:1; }
  .filters{ grid-template-columns:1fr; } .w220{ width:auto; }
  .summary{ grid-template-columns:1fr 1fr; }
}
</style>
