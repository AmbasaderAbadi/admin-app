<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' 
import { loginAdmin } from '../api/auth' 
import http from '../api/http';

const router = useRouter()

// Credentials
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const forgotMessage = ref('')

// Persistent data for 2FA step
const loginEmail = ref('')
const tempToken = ref('') // ✅ Store temp token from login

// 2FA PIN
const loginStep = ref('credentials')
const pin = ref('')
const isPasswordVisible = ref(false) 

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const validateForm = () => {
  error.value = ''
  if (!email.value.trim()) { error.value = 'Email is required'; return false }
  if (!password.value.trim()) { error.value = 'Password is required'; return false }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { error.value = 'Invalid email format'; return false }
  return true
}

const handleLogin = async () => {
  if (loginStep.value === 'credentials') {
    if (!validateForm()) return
    loading.value = true
    forgotMessage.value = ''
    try {
      const res = await loginAdmin(email.value, password.value)
      
      if (res?.twoFactorRequired && res.twoFactorMethod === 'pin') {
        loginEmail.value = email.value
        tempToken.value = res.token // ✅ Save temp token
        loginStep.value = '2fa-pin'
        pin.value = ''
        error.value = ''
      } else if (res?.token) {
        completeLogin(res)
      } else {
        error.value = 'Unexpected response from server'
      }
    } catch (err) {
      error.value = err?.message || 'Login failed. Check your credentials.'
    } finally {
      loading.value = false
    }
  } else if (loginStep.value === '2fa-pin') {
    if (!/^\d{6}$/.test(pin.value)) {
      error.value = 'PIN must be exactly 6 digits';
      return;
    }
    
    const pinNumber = parseInt(pin.value, 10);
    loading.value = true;
    
    try {
      // ✅ Create a new HTTP instance with temp token
      const verifyHttp = http.create();
      verifyHttp.defaults.headers.common['Authorization'] = `Bearer ${tempToken.value}`;
      
      const verifyRes = await verifyHttp.post('/auth/2fa/pin/verify', {
        email: loginEmail.value,
        pin: pinNumber
      });
      
      completeLogin(verifyRes.data);
    } catch (err) {
      console.error('PIN Verification Error:', err.response?.data || err.message);
      error.value = err?.response?.data?.message || 'Invalid PIN. Please try again.';
    } finally {
      loading.value = false;
    }
  }
}

const completeLogin = (res) => {
  localStorage.setItem('admin_token', res.token)
  localStorage.setItem('admin_user', JSON.stringify(res.user || {}))
  router.push('/dashboard')
}

const handleForgotPassword = () => {
  forgotMessage.value = ''
  error.value = ''
  if (!forgotEmail.value.trim()) { 
    forgotMessage.value = 'Enter your email address'
    return 
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.value)) {
    forgotMessage.value = 'Please enter a valid email address.'
    return
  }
  
  forgotMessage.value = `If an account exists for ${forgotEmail.value}, a reset link was sent.`
  forgotEmail.value = ''
  setTimeout(() => {
    forgotMessage.value = ''
    if (!error.value) showForgotPassword.value = false
  }, 5000)
}

const backToLogin = () => {
  loginStep.value = 'credentials'
  error.value = ''
}
</script>

<template>
  <!-- Split Screen Container -->
  <div class="split-screen-container">
    <!-- Left Panel -->
    <div class="description-panel">
      <div class="panel-content">
        <h2 class="panel-title">Welcome to the Admin Portal.</h2>
        <p class="panel-text">Manage users, content, and system settings efficiently and securely.</p>
        <div class="infinity-icon">
          <img src="../assets/Infinity Booking Logo Enhanced.png" width="505px" height="300px" alt="App Logo" class="logo" />
        </div>
      </div>
    </div>

    <!-- Login Form -->
    <div class="form-container">
      <div class="login-card">
        <img src="../assets/Infinity Booking Logo Enhanced.png" alt="App Logo" class="logo" width="50px" height="50px" />
        
        <!-- Header -->
        <h1 class="card-title">
          {{
            showForgotPassword 
              ? 'Reset Password' 
              : loginStep === '2fa-pin' 
                ? 'Two-Factor Authentication' 
                : 'Sign In to Admin Portal'
          }}
        </h1>
        <p class="card-subtitle">
          {{
            showForgotPassword 
              ? 'Enter your email below to get a reset link.' 
              : loginStep === '2fa-pin'
                ? 'Enter your 6-digit security PIN'
                : 'Welcome back! Please enter your details.'
          }}
        </p>

        <!-- Messages -->
        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="forgotMessage" class="success-msg">{{ forgotMessage }}</p>

        <!-- Login Form -->
        <form 
          v-if="!showForgotPassword" 
          @submit.prevent="handleLogin" 
          class="auth-form"
        >
          <!-- Credentials Step -->
          <template v-if="loginStep === 'credentials'">
            <label for="email-input">Email Address</label>
            <div class="input-field">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9EABB4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <input 
                id="email-input" 
                v-model="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                :disabled="loading"
              >
            </div>

            <label for="password-input">Password</label>
            <div class="input-field password-field">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9EABB4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <input 
                id="password-input" 
                v-model="password" 
                :type="isPasswordVisible ? 'text' : 'password'" 
                placeholder="Enter your password" 
                required 
                :disabled="loading"
              >
              <svg 
                class="eye-icon" 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#9EABB4" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                @click="togglePasswordVisibility"
              >
                <template v-if="isPasswordVisible">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a18.5 18.5 0 0 1-2.93 2.55"></path>
                  <path d="M2 2l20 20"></path>
                  <path d="M6.71 6.71l6.01 6.01"></path>
                  <path d="M12 17.5s-4 4-11 4"></path>
                </template>
                <template v-else>
                  <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </template>
              </svg>
            </div>
            
            <p class="forgot-link" @click="showForgotPassword = true">Forgot Password?</p>
          </template>

          <!-- 2FA PIN Step -->
          <template v-else-if="loginStep === '2fa-pin'">
            <label for="pin-input">6-Digit PIN</label>
            <div class="input-field">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9EABB4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 22v-4M4 12H2m20 0h-2M7 7l-3-3m18 18l-3-3M7 17l-3 3m18-18l-3 3"/></svg>
              <input 
                id="pin-input"
                v-model="pin" 
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="••••••"
                @input="pin = pin.replace(/\D/g, '').slice(0, 6)"
                :disabled="loading"
                autocomplete="off"
              >
            </div>
            <p class="forgot-link back-link" @click="backToLogin">← Back to Login</p>
          </template>
          
          <button 
            type="submit" 
            :disabled="loading || (loginStep === '2fa-pin' && pin.length !== 6)" 
            class="sign-in-btn"
          >
            {{ 
              loading 
                ? 'Processing...' 
                : loginStep === '2fa-pin' 
                  ? 'Verify PIN' 
                  : 'Sign In' 
            }}
          </button>
        </form>

        <!-- Forgot Password Form -->
        <form v-else @submit.prevent="handleForgotPassword" class="auth-form">
          <label for="forgot-email-input">Email Address</label>
          <div class="input-field">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9EABB4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <input id="forgot-email-input" v-model="forgotEmail" type="email" placeholder="you@example.com" required>
          </div>
          
          <button type="submit" class="sign-in-btn">
            Send Reset Link
          </button>
          <p class="forgot-link back-link" @click="showForgotPassword = false">← Back to Sign In</p>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
/* ... your existing styles ... */

/* Add PIN input styles */
#pin-input {
  letter-spacing: 8px;
  font-size: 24px;
  text-align: center;
}

/* Keep all your existing CSS unchanged */
* { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
    font-family: 'Inter', sans-serif;
}

body, html, #app { 
    height: 100%; 
}

.split-screen-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
    background-color: #f7f9fa;
}

.description-panel {
    display: none;
    flex: 1;
    background-color: #2c3e50;
    color: white;
    padding: 60px;
    align-items: center;
    justify-content: center;
    text-align: center;
    flex-direction: column;
}

.panel-content {
    max-width: 350px;
}

.panel-title {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 20px;
    line-height: 1.2;
}

.panel-text {
    font-size: 1.1rem;
    font-weight: 300;
    margin-bottom: 40px;
}

.infinity-icon {
    opacity: 0.8;
}

.form-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.login-card {
    background: white;
    padding: 40px;
    border-radius: 8px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    text-align: center;
}

.logo {
    display: block;
    margin: 0 auto 20px auto;
    color: #2c3e50;
}

.card-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 8px;
}

.card-subtitle {
    font-size: 1rem;
    color: #6c757d;
    margin-bottom: 25px;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

label {
    align-self: flex-start;
    font-size: 0.9rem;
    font-weight: 600;
    color: #495057;
    margin-top: 10px;
}

.input-field {
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid #ced4da;
    border-radius: 6px;
    padding-left: 12px;
    transition: all 0.2s;
    background-color: white;
}

.input-field:focus-within {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.input-field svg {
    flex-shrink: 0;
    margin-right: 10px;
    color: #9EABB4;
}

input {
    flex-grow: 1;
    border: none;
    outline: none;
    padding: 12px 10px 12px 0;
    font-size: 1rem;
    color: #343a40;
    background-color: transparent;
    width: 100%;
}

.password-field input {
    padding-right: 40px;
}

.eye-icon {
    position: absolute;
    right: 12px;
    cursor: pointer;
    padding: 5px;
    margin: -5px;
}

.forgot-link {
    font-size: 0.9rem;
    font-weight: 500;
    color: #007bff;
    cursor: pointer;
    text-align: right;
    margin-bottom: 20px;
    transition: color 0.2s;
}

.forgot-link:hover {
    color: #0056b3;
    text-decoration: underline;
}

.back-link {
    text-align: center;
    margin-top: 15px;
    margin-bottom: 0;
}

.sign-in-btn {
    padding: 12px;
    border-radius: 6px;
    border: none;
    background-color: #2c3e50;
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
}

.sign-in-btn:hover:not(:disabled) {
    background-color: #34495e;
}

.sign-in-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.error-msg, .success-msg {
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 20px;
    text-align: left;
    font-size: 0.9rem;
    font-weight: 500;
}

.error-msg {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.success-msg {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

@media (min-width: 900px) {
    .description-panel {
        display: flex;
    }
    .form-container {
        flex: 1;
    }
}

@media (max-width: 600px) {
    .login-card {
        padding: 25px 20px;
    }

    .card-title {
        font-size: 1.6rem;
    }
}
</style>