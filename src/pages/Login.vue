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
// New state variable to manage password visibility
const isPasswordVisible = ref(false) 

// Function to toggle password visibility
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const validateForm = () => {
  error.value = ''; // Clear existing errors
  if (!email.value.trim()) { error.value = 'Email is required'; return false }
  if (!password.value.trim()) { error.value = 'Password is required'; return false }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { error.value = 'Invalid email format'; return false }
  return true
}

const handleLogin = async () => {
  if (!validateForm()) return
  loading.value = true
  forgotMessage.value = '' // Clear success messages on login attempt
  try {
    // Assuming loginAdmin is available globally or imported correctly in the real environment
    // Note: The imports for 'vue-router' and '../api/auth' are kept for API compatibility.
    const res = await loginAdmin(email.value, password.value) 
    if (res?.token) {
      // Storing token and user data as per original code
      localStorage.setItem('admin_token', res.token)
      localStorage.setItem('admin_user', JSON.stringify(res.user || {}))
      router.push('/dashboard')
    } else error.value = 'Unexpected response from server'
  } catch (err) {
    error.value = err?.message || 'Login failed. Check your credentials.'
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  forgotMessage.value = ''
  error.value = ''
  if (!forgotEmail.value.trim()) { forgotMessage.value = 'Enter your email address'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.value)) {
    forgotMessage.value = 'Please enter a valid email address.';
    return;
  }
  
  // This is a simulated success message, as the actual API call is imported
  forgotMessage.value = `If an account exists for ${forgotEmail.value}, a reset link was sent.`
  
  forgotEmail.value = ''
  setTimeout(() => {
    forgotMessage.value = ''
    if (!error.value) showForgotPassword.value = false
  }, 5000)
}
</script>

<template>
  <!-- New Split Screen Container -->
  <div class="split-screen-container">

    <!-- Left Side: Description/Branding Panel (Hidden on small screens) -->
    <div class="description-panel">
        <div class="panel-content">
            <h2 class="panel-title">Welcome to the Admin Portal.</h2>
            <p class="panel-text">Manage users, content, and system settings efficiently and securely. This side is for branding and information.</p>
            <div class="infinity-icon">
                <!-- Larger, centered infinity icon for the branding panel -->
                <img src="../assets/Infinity Booking Logo Enhanced.png" width="505px" height="300px" alt="App Logo" class="logo" />
            </div>
        </div>
    </div>

    <!-- Right Side: Login Form Container -->
    <div class="form-container">
      <div class="login-card">
        <!-- Logo: Simple Infinity Symbol SVG -->
        <img src="../assets/Infinity Booking Logo Enhanced.png" alt="App Logo" class="logo" width="50px" height="50px" />
        
        <!-- Header -->
        <h1 class="card-title">{{ showForgotPassword ? 'Reset Password' : 'Sign In to Admin Portal' }}</h1>
        <p class="card-subtitle">
          {{ showForgotPassword ? 'Enter your email below to get a reset link.' : 'Welcome back! Please enter your details.' }}
        </p>

        <!-- Message Area -->
        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="forgotMessage" class="success-msg">{{ forgotMessage }}</p>

        <!-- Login Form -->
        <form v-if="!showForgotPassword" @submit.prevent="handleLogin" class="auth-form">
          <label for="email-input">Email Address</label>
          <div class="input-field">
            <!-- Email Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9EABB4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <input id="email-input" v-model="email" type="email" placeholder="you@example.com" required :disabled="loading">
          </div>

          <label for="password-input">Password</label>
          <div class="input-field password-field">
            <!-- Lock Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9EABB4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <input 
              id="password-input" 
              v-model="password" 
              :type="isPasswordVisible ? 'text' : 'password'" 
              placeholder="Enter your password" 
              required 
              :disabled="loading"
            >
            <!-- Toggle Icon: Shows Eye if password is hidden, Shows Eye-Off if password is visible -->
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
                <!-- Eye Off Icon (Slashed eye) -->
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a18.5 18.5 0 0 1-2.93 2.55"></path>
                <path d="M2 2l20 20"></path>
                <path d="M6.71 6.71l6.01 6.01"></path>
                <path d="M12 17.5s-4 4-11 4"></path>
              </template>
              <template v-else>
                <!-- Eye Icon (Visible eye) -->
                <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </template>
            </svg>
          </div>
          
          <p class="forgot-link" @click="showForgotPassword = true">Forgot Password?</p>
          
          <button type="submit" :disabled="loading" class="sign-in-btn">
            {{ loading ? 'Signing In...' : 'Sign In' }}
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
/* 1. Base Reset and Container */
* { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
    font-family: 'Inter', sans-serif;
}

body, html, #app { 
    height: 100%; 
}

/* Reworked Layout: Two-column on desktop, one-column on mobile */
.split-screen-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
    background-color: #f7f9fa; /* Light background for the overall page */
}

/* Left Side Panel - Description/Branding */
.description-panel {
    display: none; /* Hidden by default on mobile */
    flex: 1; /* Takes up 50% on desktop */
    background-color: #2c3e50; /* Dark primary color for branding */
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

/* Right Side: Login Form Container */
.form-container {
    flex: 1; /* Takes up 100% on mobile, 50% on desktop */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

/* 2. Login Card */
.login-card {
    background: white;
    padding: 40px;
    border-radius: 8px; 
    width: 100%;
    max-width: 420px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); 
    text-align: center;
}

/* 3. Header and Logo */
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

/* 4. Form Styling (No changes needed) */
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

/* Custom styles for the clickable eye icon */
.eye-icon {
    position: absolute;
    right: 12px;
    cursor: pointer;
    padding: 5px; /* Increase hit area for touch */
    margin: -5px; /* Offset the padding to keep it visually correct */
}
/* Revert margin only for the SVG itself if necessary, but the padding trick is better */


/* 5. Links and Buttons (No changes needed) */
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

/* 6. Messages (No changes needed) */
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

/* 7. Responsive Adjustments */
@media (min-width: 900px) {
    /* Show Description Panel and create two columns */
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
