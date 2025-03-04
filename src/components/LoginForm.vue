<template>
  <div class="login-form">
    <div class="header">
      <img src="@/assets/Caraga_State_University_1.png" alt="Caraga State University Logo" class="logo">
      <div class="header-text">
        <h1>Caraga State University</h1>
        <p>Competence, Service, and Uprightness</p>
      </div>
    </div>
    <!-- Login form -->
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="identifier" class="label-with-icon">
          Name
          <v-icon small class="icon-spacing">mdi-account</v-icon>
        </label>
        <input
          type="text"
          id="identifier"
          v-model="identifier"
          placeholder="csugeneralservices"
          class="form-control"
        />
      </div>
      <div class="form-group">
        <label for="password" class="label-with-icon">
          Password
          <v-icon small class="icon-spacing">mdi-lock</v-icon>
        </label>
        <div class="password-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="password"
            placeholder="********"
            class="form-control"
          />
          <button type="button" @click="togglePasswordVisibility" class="toggle-password">
            <v-icon>{{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
          </button>
        </div>
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
      loading: false,
      showPassword: false
    };
  },
  methods: {
    login() {
      // Clear previous error and success messages
      this.error = '';
      this.success = '';
      
      // Validate input fields
      if (!this.identifier || !this.password) {
        this.error = 'Please fill in both the identifier and password.';
        return;
      }
      
      this.loading = true;
      
      // Send login request to the server
      axios
        .post('http://localhost:1337/api/auth/local', {
          identifier: this.identifier,
          password: this.password
        })
        .then(response => {
          console.log('Logged in successfully:', response.data);
          this.success = 'Login successful! Redirecting...';
          // Store the authentication token in local storage
          localStorage.setItem('authToken', response.data.jwt);
          // Redirect to the dashboard
          this.$router.push('/sample-dashboard');
        })
        .catch(err => {
          console.error('Login error:', err);
          this.error = 'Oops! Login failed. Please check your credentials and try again.';
        })
        .finally(() => {
          this.loading = false;
        });
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }
  }
};
</script>

<style scoped>
.login-form {
  max-width: 450px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fafafa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.logo {
  max-width: 15%;
  height: auto;
  margin-right: 10px;
}
.header-text {
  text-align: left;
}
.header-text h1 {
  font-size: 1.5rem;
  margin: 0;
}
.header-text p {
  font-size: 1rem;
  margin: 0;
  color: #555;
}
.form-group {
  margin-bottom: 15px;
}
.label-with-icon {
  display: flex;
  align-items: center;
}
.icon-spacing {
  margin-left: 5px;
}
.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.password-wrapper {
  position: relative;
}
.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
}
.btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #066913;
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
/* Center the form in the middle */
.login-form {
  padding:30px;
  margin: auto;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
}
</style>
