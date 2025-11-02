<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginAdmin } from '../api/auth'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const forgotMessage = ref('')

const validateForm = () => {
  if (!email.value.trim()) { error.value = 'Email is required'; return false }
  if (!password.value.trim()) { error.value = 'Password is required'; return false }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { error.value = 'Invalid email'; return false }
  return true
}

const handleLogin = async () => {
  error.value = ''
  if (!validateForm()) return
  loading.value = true
  try {
    const res = await loginAdmin(email.value, password.value)
    if (res?.token) {
      localStorage.setItem('admin_token', res.token)
      localStorage.setItem('admin_user', JSON.stringify(res.user || {}))
      router.push('/dashboard')
    } else error.value = 'Unexpected response from server'
  } catch (err) {
    error.value = err?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  forgotMessage.value = ''
  if (!forgotEmail.value.trim()) { forgotMessage.value = 'Enter email'; return }
  forgotMessage.value = `If an account exists for ${forgotEmail.value}, a reset link was sent.`
  forgotEmail.value = ''
  setTimeout(() => showForgotPassword.value = false, 5000)
}
</script>

<template>
  <div class="container">
    <div class="left">
      <h1>Infinite Booking</h1>
      <p>Manage your bookings, clients, and service providers efficiently with our modern dashboard.</p>
      <img src="https://cdn3d.iconscout.com/3d/premium/thumb/dashboard-analysis-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--data-chart-statistics-marketing-pack-business-illustrations-4050720.png" alt="Dashboard Illustration">
    </div>

    <div class="right">
      <div class="card">
        <h2>Admin Login</h2>
        <p v-if="!showForgotPassword">Enter your credentials to access the dashboard</p>
        <p v-else>Enter your email to reset password</p>

        <div v-if="!showForgotPassword" class="form">
          <input v-model="email" type="email" placeholder="Email address">
          <input v-model="password" type="password" placeholder="Password">
          <button @click="handleLogin" :disabled="loading">{{ loading ? 'Authenticating...' : 'Login →' }}</button>
          <p class="forgot" @click="showForgotPassword = true">Forgot password?</p>
        </div>

        <div v-else class="form">
          <input v-model="forgotEmail" type="email" placeholder="Email address">
          <button @click="handleForgotPassword">Send Reset Link</button>
          <p class="forgot" @click="showForgotPassword = false">← Back to login</p>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="forgotMessage" class="success">{{ forgotMessage }}</p>

        <p class="footer">© {{ new Date().getFullYear() }} Infinite Booking Admin Panel</p>
      </div>
    </div>

  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }

body, html, #app { height: 100%; }

.container {
  display: flex;
  min-height: 100vh;
  background-color: #f3f4f6; /* Light gray background */
}

.left {
  flex: 1;
  color: #111827; /* dark gray text */
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #e5e7eb; /* slightly lighter gray block */
}

.left h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

.left p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.left img {
  width: 80%;
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

.right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f3f4f6; /* match page background */
}

.card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.card h2 {
  color: #111827;
  font-size: 2rem;
  margin-bottom: 10px;
}

.card p { color: #6b7280; margin-bottom: 15px; }

.form { display: flex; flex-direction: column; gap: 15px; }

input {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  outline: none;
  font-size: 1rem;
}

button {
  padding: 12px;
  border-radius: 10px;
  border: none;
  background-color: #4f46e5;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover:not(:disabled) { transform: scale(1.03); }

button:disabled { opacity: 0.6; cursor: not-allowed; }

.forgot {
  color: #2563eb;
  cursor: pointer;
  text-align: right;
  font-size: 0.9rem;
}

.forgot:hover { text-decoration: underline; }

.error {
  background: #fee2e2;
  color: #b91c1c;
  padding: 10px;
  border-radius: 10px;
  margin-top: 10px;
}

.success {
  background: #dcfce7;
  color: #15803d;
  padding: 10px;
  border-radius: 10px;
  margin-top: 10px;
}

.footer {
  color: #9ca3af;
  font-size: 0.8rem;
  margin-top: 20px;
}

@media (max-width: 1024px) {
  .container { flex-direction: column; }
  .left { display: none; }
  .right { width: 100%; padding: 30px 20px; }
}
</style>
