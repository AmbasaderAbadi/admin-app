import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
export * from './auth.store'
export * from './dashboard.store'
export * from './users.store'
export * from './providers.store'
export * from './services.store'
export * from './bookings.store'
export * from './payments.store'
export * from './settings.store'