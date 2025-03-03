<template>
    <div class="login-form">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="identifier">Identifier:</label>
          <input
            type="text"
            id="identifier"
            v-model="identifier"
            placeholder="Enter your identifier"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            class="form-control"
          />
        </div>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          <span v-if="loading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="success" class="success-message">
        {{ success }}
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'LoginForm',
    data() {
      return {
        identifier: '',
        password: '',
        error: '',
        success: '',
        loading: false
      };
    },
    methods: {
      login() {
        // Clear previous messages
        this.error = '';
        this.success = '';
        
        // Basic validation
        if (!this.identifier || !this.password) {
          this.error = 'Please fill in both the identifier and password.';
          return;
        }
        
        this.loading = true;
        
        axios
          .post('http://localhost:1337/api/auth/local', {
            identifier: this.identifier,
            password: this.password
          })
          .then(response => {
            console.log('Logged in successfully:', response.data);
            this.success = 'Login successful! Redirecting...';
            // Store the authentication token
            localStorage.setItem('authToken', response.data.jwt);
            // Redirect to App.vue
            this.$router.push('/sample-dashboard');
          })
          .catch(err => {
            console.error('Login error:', err);
            this.error = 'Oops! Login failed. Please check your credentials and try again.';
          })
          .finally(() => {
            this.loading = false;
          });
      }
    }
  };
  </script>
  
  <style scoped>
  .login-form {
    max-width: 400px;
    margin: 40px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fafafa;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .form-group {
    margin-bottom: 15px;
  }
  .form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .btn {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    font-size: 16px;
    cursor: pointer;
  }
  .btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  .error-message {
    color: #d9534f;
    margin-top: 15px;
    text-align: center;
  }
  .success-message {
    color: #5cb85c;
    margin-top: 15px;
    text-align: center;
  }
  </style>
  