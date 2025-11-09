<template>
  <div class="general-container">
    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <span>←</span>
      </button>
      <h1>General Settings</h1>
    </div>

    <!-- App Overview Section -->
    <div class="section">
      <h2>🚀 App Overview</h2>
      <p class="section-description">
        Infinity Booking is a comprehensive service booking platform that connects customers with service providers.
        Our admin panel provides full control over users, bookings, payments, and system configuration.
      </p>
      
      <div class="app-features">
        <div class="feature-card">
          <div class="feature-icon">👥</div>
          <h3>User Management</h3>
          <p>Manage customers and service providers with full CRUD operations and status control.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📅</div>
          <h3>Booking System</h3>
          <p>Real-time booking management with status tracking and provider assignment.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💳</div>
          <h3>Payment Processing</h3>
          <p>Secure payment handling with transaction history and refund capabilities.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⚙️</div>
          <h3>System Configuration</h3>
          <p>Customize app behavior, enable maintenance mode, and manage service categories.</p>
        </div>
      </div>
    </div>

    <!-- Getting Started Section -->
    <div class="section">
      <h2>🎯 Getting Started</h2>
      <div class="getting-started-steps">
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Add Service Categories</h3>
            <p>Go to <strong>Services</strong> to create service categories (e.g., Barber, Massage, Cleaning).</p>
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Manage Service Providers</h3>
            <p>Approve or reject provider applications in the <strong>Providers</strong> section.</p>
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Monitor Bookings</h3>
            <p>Track and manage customer bookings in real-time from the <strong>Bookings</strong> dashboard.</p>
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>Configure System Settings</h3>
            <p>Customize app behavior through <strong>Settings</strong> → <strong>General</strong> and <strong>Booking Rules</strong>.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Best Practices Section -->
    <div class="section">
      <h2>✨ Best Practices</h2>
      <div class="best-practices-grid">
        <div class="practice-card">
          <div class="practice-icon">🔒</div>
          <h3>Security</h3>
          <ul>
            <li>Enable Two-Factor Authentication for all admin accounts</li>
            <li>Use strong, unique passwords</li>
            <li>Regularly review user activity logs</li>
          </ul>
        </div>
        <div class="practice-card">
          <div class="practice-icon">📊</div>
          <h3>Data Management</h3>
          <ul>
            <li>Approve only verified service providers</li>
            <li>Regularly clean up inactive accounts</li>
            <li>Backup critical data weekly</li>
          </ul>
        </div>
        <div class="practice-card">
          <div class="practice-icon">⚡</div>
          <h3>Performance</h3>
          <ul>
            <li>Enable maintenance mode during updates</li>
            <li>Optimize service categories for better search</li>
            <li>Monitor system performance regularly</li>
          </ul>
        </div>
        <div class="practice-card">
          <div class="practice-icon">👥</div>
          <h3>User Experience</h3>
          <ul>
            <li>Respond to booking requests promptly</li>
            <li>Keep provider information up-to-date</li>
            <li>Collect and act on customer feedback</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Keyboard Shortcuts Section -->
    <div class="section">
      <h2>⌨️ Keyboard Shortcuts</h2>
      <div class="shortcuts-grid">
        <div class="shortcut-item">
          <span class="shortcut-key">Ctrl + K</span>
          <span>Open search</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-key">Esc</span>
          <span>Close modals</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-key">Ctrl + S</span>
          <span>Save forms</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-key">?</span>
          <span>Show help</span>
        </div>
      </div>
    </div>

    <!-- Support Section -->
    <div class="section support-section">
      <h2>❓ Need Help?</h2>
      <p class="support-description">
        Our support team is here to help you get the most out of Infinity Booking.
      </p>
      <div class="support-options">
        <div class="support-option">
          <div class="option-icon">📚</div>
          <div>
            <h3>Documentation</h3>
            <p>Comprehensive guides and tutorials</p>
            <a href="#" class="support-link">View Documentation</a>
          </div>
        </div>
        <div class="support-option">
          <div class="option-icon">💬</div>
          <div>
            <h3>Live Chat</h3>
            <p>Real-time support during business hours</p>
            <a href="#" class="support-link">Start Chat</a>
          </div>
        </div>
        <div class="support-option">
          <div class="option-icon">📧</div>
          <div>
            <h3>Email Support</h3>
            <p>support@infinitybooking.com</p>
            <a href="mailto:support@infinitybooking.com" class="support-link">Send Email</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.general-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e5ff;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f0f0f0;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

/* Section Styles */
.section {
  background: white;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.section:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.section h2 {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-description {
  font-size: 16px;
  color: #495057;
  line-height: 1.6;
  margin-bottom: 24px;
}

/* App Features */
.app-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 16px;
}

.feature-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #dee2e6;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.feature-card p {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}

/* Getting Started */
.getting-started-steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.step-number {
  width: 36px;
  height: 36px;
  background: #4285f4;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 4px;
}

.step-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.step-content p {
  font-size: 15px;
  color: #495057;
  line-height: 1.5;
  margin: 0;
}

/* Best Practices */
.best-practices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 16px;
}

.practice-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e9ecef;
}

.practice-icon {
  font-size: 32px;
  margin-bottom: 16px;
  display: block;
  color: #4285f4;
}

.practice-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

.practice-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.practice-card li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
  color: #495057;
  font-size: 14px;
}

.practice-card li:before {
  content: "•";
  color: #4285f4;
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 8px;
  font-size: 18px;
}

/* Keyboard Shortcuts */
.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 16px;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.shortcut-key {
  background: #2c3e50;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 14px;
  margin-bottom: 12px;
  font-weight: 500;
}

.shortcut-item span:last-child {
  color: #495057;
  font-size: 14px;
}

/* Support Section */
.support-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.support-section h2 {
  color: white;
}

.support-description {
  color: #e2e8f0;
  font-size: 16px;
  margin-bottom: 32px;
  text-align: center;
}

.support-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 16px;
}

.support-option {
  display: flex;
  gap: 16px;
  background: rgba(255, 255, 255, 0.1);
  padding: 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.option-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.support-option h3 {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.support-option p {
  color: #cbd5e0;
  font-size: 14px;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.support-link {
  color: #63b3ed;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.support-link:hover {
  color: #4299e1;
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .general-container {
    padding: 16px;
  }
  
  .header {
    margin-bottom: 24px;
    padding-bottom: 12px;
  }
  
  .header h1 {
    font-size: 24px;
  }
  
  .section {
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .section h2 {
    font-size: 20px;
  }
  
  .app-features,
  .best-practices-grid,
  .support-options {
    grid-template-columns: 1fr;
  }
  
  .step-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .step-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .support-section .support-option {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .shortcut-item {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .back-btn {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }
  
  .header h1 {
    font-size: 20px;
  }
  
  .section {
    padding: 16px;
  }
  
  .feature-card,
  .practice-card {
    padding: 16px;
  }
  
  .feature-icon {
    font-size: 36px;
  }
  
  .step-content h3 {
    font-size: 16px;
  }
  
  .step-content p {
    font-size: 14px;
  }
}
</style>