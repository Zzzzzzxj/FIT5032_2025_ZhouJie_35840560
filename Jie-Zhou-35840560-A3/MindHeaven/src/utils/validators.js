// src/utils/validators.js
export const required = (v) => (v !== null && v !== undefined && String(v).trim() !== '') || 'This field is required.'
export const email = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) || 'Invalid email format.'
export const minLen = (n) => (v) => (String(v || '').trim().length >= n) || `Must be at least ${n} characters.`
export const maxLen = (n) => (v) => (String(v || '').trim().length <= n) || `Must be at most ${n} characters.`
export const intRange = (min, max) => (v) => {
  const num = Number(v)
  return Number.isInteger(num) && num >= min && num <= max || `Must be an integer between ${min} and ${max}.`
}
export function runValidators(value, validators = []) {
  for (const rule of validators) {
    const ok = rule(value)
    if (ok !== true) return ok 
  }
  return true
}
