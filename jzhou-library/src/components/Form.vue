<template>
  <div class="p-component page-wrapper">
    <div class="main-content-area">
      <h1 class="text-center mb-4">User Information Form</h1>
      <form @submit.prevent="submitForm" class="p-fluid">
        <div class="grid formgrid p-fluid">
          <div class="col-12 md:col-6 field">
            <label for="username">Username</label>
            <InputText id="username" v-model="formData.username"
              @blur="() => validateName(true)"
              @input="() => validateName(false)"
              :class="{ 'p-invalid': errors.username }"
            />
            <small class="p-error">{{ errors.username }}</small>
          </div>

          <div class="col-12 md:col-6 field">
            <label for="password">Password</label>
            <Password id="password" v-model="formData.password"
              toggleMask
              :feedback="false"
              @blur="() => validatePassword(true)"
              @input="() => validatePassword(false)"
              :class="{ 'p-invalid': errors.password }"
            />
            <small class="p-error">{{ errors.password }}</small>
          </div>

          <div class="col-12 md:col-6 field">
            <div class="field-checkbox">
              <Checkbox id="isAustralian" v-model="formData.isAustralian"
                :binary="true"
                @blur="() => validateResident(true)"
                @input="() => validateResident(false)"
                :class="{ 'p-invalid': errors.resident && !formData.isAustralian }"
              />
              <label for="isAustralian">Australian resident?</label>
            </div>
            <small class="p-error">{{ errors.resident }}</small>
          </div>

          <div class="col-12 md:col-6 field">
            <label for="gender">Gender</label>
            <Dropdown id="gender" v-model="formData.gender"
              :options="genderOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="-- Select --"
              @blur="() => validateGender(true)"
              @change="() => validateGender(false)"
              :class="{ 'p-invalid': errors.gender }"
            />
            <small class="p-error">{{ errors.gender }}</small>
          </div>

          <div class="col-12 field">
            <label for="reason">Reason for joining</label>
            <Textarea id="reason" v-model="formData.reason"
              rows="3"
              autoResize
              @blur="() => validateReason(true)"
              @input="() => validateReason(false)"
              :class="{ 'p-invalid': errors.reason }"
            />
            <small class="p-error">{{ errors.reason }}</small>
          </div>
        </div>

        <div class="flex justify-content-center mt-4">
          <Button type="submit" label="Submit" class="p-button-primary mr-2" />
          <Button type="button" label="Clear" class="p-button-secondary" @click="clearForm" />
        </div>
      </form>

      <div class="mt-5" v-if="submittedUsers.length">
        <h2 class="text-center mb-4">Submitted Users</h2>
        <DataTable
          :value="submittedUsers"
          :paginator="true"
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20]"
          sortMode="multiple"
          responsiveLayout="scroll"
          :globalFilterFields="['username', 'gender', 'reason']"
        >
          <template #header>
            <div class="datatable-header">
              <span class="datatable-title">User Information</span>
              <span class="p-input-icon-left search-input-wrapper">
                <i class="pi pi-search" />
                <InputText
                  v-model="globalFilter"
                  placeholder="Search users..."
                  @input="onGlobalFilter"
                />
              </span>
            </div>
          </template>

          <Column field="id" header="No." :sortable="true" style="width: 80px">
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>

          <Column field="username" header="Username" :sortable="true">
            <template #body="slotProps">
              <span>{{ slotProps.data.username }}</span>
            </template>
          </Column>

          <Column field="password" header="Password" :sortable="true">
            <template #body="slotProps">
              <span class="password-display">{{ maskPassword(slotProps.data.password) }}</span>
            </template>
          </Column>

          <Column field="isAustralian" header="Australian Resident" :sortable="true">
            <template #body="slotProps">
              <span :class="slotProps.data.isAustralian ? 'status-true' : 'status-false'">
                <i :class="slotProps.data.isAustralian ? 'pi pi-check' : 'pi pi-times'"></i>
                {{ slotProps.data.isAustralian ? 'Yes' : 'No' }}
              </span>
            </template>
          </Column>

          <Column field="gender" header="Gender" :sortable="true">
            <template #body="slotProps">
              <span>{{ translateGender(slotProps.data.gender) }}</span>
            </template>
          </Column>

          <Column field="reason" header="Reason for Joining" :sortable="true">
            <template #body="slotProps">
              <span class="reason-text">{{ truncateText(slotProps.data.reason, 50) }}</span>
            </template>
          </Column>

          <Column header="Actions" style="width: 120px">
            <template #body="slotProps">
              <Button
                icon="pi pi-trash"
                class="p-button-danger p-button-sm"
                @click="deleteUser(slotProps.data.id)"
                v-tooltip.top="'Delete User'"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';


const formData = ref({
  username: '',
  password: '',
  isAustralian: false,
  reason: '',
  gender: ''
})

const submittedUsers = ref([])
const globalFilter = ref('')

const genderOptions = ref([
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' }
]);

const submitForm = () => {
  validateName(true);
  validatePassword(true);
  validateResident(true);
  validateGender(true);
  validateReason(true);

  const hasError = Object.values(errors.value).some(error => error !== null);
  if (!hasError) {
    const newUser = {
      id: Date.now(),
      ...formData.value,
      submittedAt: new Date().toLocaleString()
    };
    submittedUsers.value.push(newUser);
    clearForm();
  }
};

const clearForm = () => {
  formData.value = {
    username: '',
    password: '',
    isAustralian: false,
    reason: '',
    gender: ''
  }
  Object.keys(errors.value).forEach(key => {
    errors.value[key] = null;
  });
}

const deleteUser = (userId) => {
  submittedUsers.value = submittedUsers.value.filter(user => user.id !== userId);
}

const maskPassword = (password) => {
  return '*'.repeat(password.length);
}

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

const translateGender = (gender) => {
  const translations = {
    'male': 'Male',
    'female': 'Female',
    'other': 'Other'
  };
  return translations[gender] || gender;
}

const onGlobalFilter = (event) => {
  globalFilter.value = event.target.value;
}


const errors = ref({
  username: null,
  password: null,
  resident: null,
  gender: null,
  reason: null,
});

const validateName = (blur) => {
  if (formData.value.username.length < 3) {
    if (blur) errors.value.username = "Username must be at least 3 characters";
  } else {
    errors.value.username = null;
  }
};

const validatePassword = (blur) => {
  const password = formData.value.password;
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),?.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    if (blur) errors.value.password = 'Password must be at least 8 characters long.';
  } else if (!hasUppercase) {
    if (blur) errors.value.password = "Password must contain at least one uppercase letter.";
  } else if (!hasLowercase) {
    if (blur) errors.value.password = "Password must contain at least one lowercase letter.";
  } else if (!hasNumber) {
    if (blur) errors.value.password = "Password must contain at least one number.";
  } else if (!hasSpecialChar) {
    if (blur) errors.value.password = "Password must contain at least one special character.";
  } else {
    errors.value.password = null;
  }
};

const validateResident = (blur) => {
  if (!formData.value.isAustralian) {
    if (blur) errors.value.resident = "You must confirm your residency status.";
  } else {
    errors.value.resident = null;
  }
};

const validateGender = (blur) => {
  if (!formData.value.gender) {
    if (blur) errors.value.gender = "Gender selection is required.";
  } else {
    errors.value.gender = null;
  }
};

const validateReason = (blur) => {
  if (formData.value.reason.length < 10) {
    if (blur) errors.value.reason = "Reason must contain at least 10 characters.";
  } else {
    errors.value.reason = null;
  }
};
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

.main-content-area {
  max-width: 900px;
  width: 100%;
  padding: 0;
  border: none;
  box-shadow: none;
  background-color: transparent;
}

.p-error {
  color: var(--red-500, #ef4444);
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
  min-height: 1.25em;
}

.p-button-primary {
    background-color: var(--primary-color, #275FDA);
    border-color: var(--primary-color, #275FDA);
}
.p-button-primary:hover {
    background-color: var(--primary-600, #1e4bb3);
    border-color: var(--primary-600, #1e4bb3);
}

.p-button-secondary {
    background-color: var(--surface-400, #6c757d);
    border-color: var(--surface-400, #6c757d);
}
.p-button-secondary:hover {
    background-color: var(--surface-500, #5a6268);
    border-color: var(--surface-500, #5a6268);
}

.p-button-danger {
    background-color: var(--red-500, #dc3545);
    border-color: var(--red-500, #dc3545);
}
.p-button-danger:hover {
    background-color: var(--red-600, #c82333);
    border-color: var(--red-600, #c82333);
}

.field-checkbox {
  display: flex;
  align-items: center;
  margin-top: 1rem;
  min-height: 1.25em;
}
.field-checkbox .p-checkbox {
  margin-right: 0.5rem;
}

.grid.formgrid > .field {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
}

.field label {
    display: block;
    margin-bottom: 0.25rem;
}

.grid.formgrid {
  align-items: flex-start;
}

.password-display {
  font-family: monospace;
  letter-spacing: 2px;
}

.reason-text {
  max-width: 200px;
  word-wrap: break-word;
}

.status-true {
  color: green;
  font-weight: bold;
}

.status-false {
  color: red;
  font-weight: bold;
}

:deep(.p-datatable) {
  border: none;
  border-radius: 0;
  box-shadow: none;
  width: 100%;
}

:deep(.p-datatable-header) {
  background: none;
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: none;
  border-right: none;
  border-top: none;
}

.datatable-title {
  font-size: 16px;
  font-weight: bold;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
}

.search-input-wrapper .pi {
  margin-right: 5px;
  color: #666;
}

:deep(.p-inputtext) {
  padding: 5px 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 14px;
}

:deep(.p-datatable-thead > tr > th) {
  background: none;
  color: #333;
  font-weight: bold;
  border: none;
  border-bottom: 1px solid #ddd;
  text-align: left;
  padding: 8px 10px;
}

:deep(.p-datatable-tbody > tr > td) {
  border: none;
  border-bottom: 1px solid #eee;
  padding: 8px 10px;
  text-align: left;
}

:deep(.p-datatable-tbody > tr:nth-child(even)) {
  background-color: #f9f9f9;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: #e0e0e0;
}

:deep(.p-paginator) {
  background: none;
  border-top: 1px solid #ddd;
  padding: 10px;
  justify-content: center;
  border-bottom: none;
  border-left: none;
  border-right: none;
}

.pi-check {
  color: var(--green-500, #22c55e);
}

.pi-times {
  color: var(--red-500, #ef4444);
}
</style>