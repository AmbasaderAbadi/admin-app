<template>
  <div class="booking-rules-container">
    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <span>←</span>
      </button>
      <h1>Booking Rules</h1>
      <button class="save-btn" @click="saveSettings">
        Save Changes
      </button>
    </div>

    <!-- Loading & Error States -->
    <div v-if="loading" class="status-message">Loading booking rules...</div>
    <div v-else-if="error" class="status-message error">{{ error }}</div>

    <!-- Booking Rules Form -->
    <div v-else class="rules-form">
      <!-- Booking Duration Limits -->
      <div class="section">
        <h2>⏱️ Booking Duration</h2>
        <div class="form-group">
          <label>Minimum Booking Duration (minutes)</label>
          <input v-model.number="rules.minDuration" type="number" min="1" max="1440" />
          <p class="help-text">Shortest allowed booking duration (e.g., 30 for 30 minutes)</p>
        </div>

        <div class="form-group">
          <label>Maximum Booking Duration (minutes)</label>
          <input v-model.number="rules.maxDuration" type="number" min="1" max="1440" />
          <p class="help-text">Longest allowed booking duration (e.g., 480 for 8 hours)</p>
        </div>
      </div>

      <!-- Advance Booking Limits -->
      <div class="section">
        <h2>📅 Advance Booking</h2>
        <div class="form-group">
          <label>Max Days in Advance</label>
          <input v-model.number="rules.maxAdvanceDays" type="number" min="1" max="365" />
          <p class="help-text">How far in advance customers can book (e.g., 30 for 30 days)</p>
        </div>

        <div class="form-group">
          <label>Min Hours Before Booking</label>
          <input v-model.number="rules.minHoursBefore" type="number" min="0" max="720" />
          <p class="help-text">Minimum hours before booking start time (0 = book immediately)</p>
        </div>
      </div>

      <!-- Cancellation Rules -->
      <div class="section">
        <h2>🚫 Cancellation Policy</h2>
        <div class="form-group">
          <label>Free Cancellation Window (hours)</label>
          <input v-model.number="rules.cancellationWindow" type="number" min="0" max="720" />
          <p class="help-text">Hours before booking when cancellation is free (0 = no free cancellation)</p>
        </div>

        <div class="form-group">
          <label>Cancellation Fee (%)</label>
          <input v-model.number="rules.cancellationFee" type="number" min="0" max="100" />
          <p class="help-text">Percentage fee for cancellations outside free window (0 = no fee)</p>
        </div>
      </div>

      <!-- Service Limits -->
      <div class="section">
        <h2>🔧 Service Limits</h2>
        <div class="form-group">
          <label>Max Services Per Provider</label>
          <input v-model.number="rules.maxServicesPerProvider" type="number" min="1" max="100" />
          <p class="help-text">Maximum number of services a provider can offer</p>
        </div>

        <div class="form-group">
          <label>Max Bookings Per Provider (daily)</label>
          <input v-model.number="rules.maxDailyBookings" type="number" min="1" max="100" />
          <p class="help-text">Maximum bookings allowed per provider per day</p>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="section">
        <h2>🔔 Notifications</h2>
        <div class="form-group">
          <label>Booking Reminder (hours before)</label>
          <input v-model.number="rules.reminderHours" type="number" min="0" max="72" />
          <p class="help-text">Send reminder X hours before booking (0 = no reminders)</p>
        </div>

        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="rules.notifyOnBooking" />
            Send confirmation email on booking
          </label>
          <label>
            <input type="checkbox" v-model="rules.notifyOnCancellation" />
            Send notification on cancellation
          </label>
          <label>
            <input type="checkbox" v-model="rules.notifyOnUpdate" />
            Send notification on schedule updates
          </label>
        </div>
      </div>

      <!-- Payment Settings -->
      <div class="section">
        <h2>💳 Payment Rules</h2>
        <div class="form-group">
          <label>Payment Due</label>
          <select v-model="rules.paymentDue">
            <option value="immediate">Immediately (at booking)</option>
            <option value="before">Before service</option>
            <option value="during">During service</option>
            <option value="after">After service</option>
          </select>
        </div>

        <div class="form-group">
          <label>Deposit Required (%)</label>
          <input v-model.number="rules.depositRequired" type="number" min="0" max="100" />
          <p class="help-text">Percentage deposit required to confirm booking (0 = no deposit)</p>
        </div>

        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="rules.allowPartialPayment" />
            Allow partial payment plans
          </label>
          <label>
            <input type="checkbox" v-model="rules.allowRefunds" />
            Enable automatic refunds
          </label>
        </div>
      </div>

      <!-- Availability Settings -->
      <div class="section">
        <h2>🕐 Availability Rules</h2>
        <div class="form-group">
          <label>Default Availability (hours/day)</label>
          <input v-model.number="rules.defaultAvailability" type="number" min="1" max="24" />
          <p class="help-text">Default working hours per day for new providers</p>
        </div>

        <div class="form-group">
          <label>Max Concurrent Bookings</label>
          <input v-model.number="rules.maxConcurrentBookings" type="number" min="1" max="20" />
          <p class="help-text">Maximum bookings a provider can have simultaneously</p>
        </div>

        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="rules.allowOverlapping" />
            Allow overlapping bookings (same time slots)
          </label>
          <label>
            <input type="checkbox" v-model="rules.allowSameDayBooking" />
            Allow same-day bookings
          </label>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button class="btn btn-secondary" @click="resetToDefaults">Reset to Defaults</button>
        <button class="btn btn-primary" @click="saveSettings">Save Changes</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import http from '../../../core/api/http';

const router = useRouter();

// Reactive State
const rules = ref({
  minDuration: 30,
  maxDuration: 480,
  maxAdvanceDays: 30,
  minHoursBefore: 2,
  cancellationWindow: 24,
  cancellationFee: 0,
  maxServicesPerProvider: 10,
  maxDailyBookings: 20,
  reminderHours: 24,
  notifyOnBooking: true,
  notifyOnCancellation: true,
  notifyOnUpdate: true,
  paymentDue: 'immediate',
  depositRequired: 0,
  allowPartialPayment: false,
  allowRefunds: true,
  defaultAvailability: 8,
  maxConcurrentBookings: 1,
  allowOverlapping: false,
  allowSameDayBooking: true
});

const loading = ref(false);
const error = ref('');

// Fetch Initial Data
onMounted(() => {
  fetchBookingRules();
});

const fetchBookingRules = async () => {
  loading.value = true;
  error.value = '';
  try {
    // ✅ Use your backend's endpoint for booking rules
    const response = await http.get('/infinity-booking/settings/booking-rules');
    rules.value = { ...rules.value, ...response.data };
  } catch (err) {
    console.error('Failed to fetch booking rules:', err);
    error.value = 'Failed to load booking rules. Using defaults.';
    // Keep default values if fetch fails
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  loading.value = true;
  error.value = '';
  try {
    // ✅ Use your backend's endpoint to save booking rules
    await http.put('/infinity-booking/settings/booking-rules', rules.value);
    alert('Booking rules updated successfully!');
  } catch (err) {
    console.error('Failed to save booking rules:', err);
    error.value = err?.response?.data?.message || 'Failed to save booking rules. Please try again.';
  } finally {
    loading.value = false;
  }
};

const resetToDefaults = () => {
  if (confirm('Reset all booking rules to default values?')) {
    rules.value = {
      minDuration: 30,
      maxDuration: 480,
      maxAdvanceDays: 30,
      minHoursBefore: 2,
      cancellationWindow: 24,
      cancellationFee: 0,
      maxServicesPerProvider: 10,
      maxDailyBookings: 20,
      reminderHours: 24,
      notifyOnBooking: true,
      notifyOnCancellation: true,
      notifyOnUpdate: true,
      paymentDue: 'immediate',
      depositRequired: 0,
      allowPartialPayment: false,
      allowRefunds: true,
      defaultAvailability: 8,
      maxConcurrentBookings: 1,
      allowOverlapping: false,
      allowSameDayBooking: true
    };
  }
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.booking-rules-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  max-width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e5ff;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.back-btn,
.save-btn {
  background: none;
  border: 1px solid #e0e5ff;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.back-btn {
  color: #333;
}

.back-btn:hover {
  background-color: #f0f0f0;
}

.save-btn {
  background-color: #4285f4;
  color: white;
}

.save-btn:hover {
  background-color: #3367d6;
}

.status-message {
  text-align: center;
  padding: 20px;
  color: #666;
}

.status-message.error {
  color: #ff5252;
}

.rules-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #5a6cff;
}

.help-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-secondary {
  background: #eee;
  border: none;
  color: #333;
}

.btn-secondary:hover {
  background: #ddd;
}

.btn-primary {
  background: #4285f4;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #3367d6;
}

/* Responsive */
@media (max-width: 768px) {
  .booking-rules-container {
    padding: 12px;
  }
  
  .header h1 {
    font-size: 20px;
  }
  
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .save-btn {
    width: 100%;
    text-align: center;
  }
  
  .section {
    padding: 16px;
  }
  
  .section h2 {
    font-size: 16px;
  }
  
  .form-group input,
  .form-group select {
    font-size: 14px;
    padding: 8px 12px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    text-align: center;
    padding: 10px;
  }
}
</style>