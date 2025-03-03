<template>
  <v-app class="app">
    <!-- Navigation bar & drawer only visible if not on Login page -->
    <template v-if="$route.name !== 'LoginForm'">
      <v-app-bar app color="dark-green" dark elevation="4">
        <v-toolbar-title class="d-flex align-center title-style">
          <v-img
            src="@/assets/Caraga_State_University_1.png"
            alt="Logo"
            max-height="40"
            max-width="40"
            contain
            class="mr-2"
          ></v-img>
          <span class="d-none d-sm-flex">Project Monitoring System</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div class="d-none d-md-flex align-center pr-4">
          <v-btn text class="button-style" to="/sample-dashboard" exact>
            <v-icon left>mdi-view-dashboard</v-icon>
            Dashboard
          </v-btn>
          <v-btn text class="button-style" to="/project-dashboard">
            <v-icon left>mdi-folder-multiple</v-icon>
            Create Projects
          </v-btn>
          <!-- User Menu Dropdown -->
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn text class="button-style" v-bind="attrs" v-on="on">
                <v-icon left>mdi-account</v-icon>
                User
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="dialogUpdateCredentials = true">
                <v-list-item-icon>
                  <v-icon>mdi-account-edit</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Update Credentials</v-list-item-title>
              </v-list-item>
              <v-list-item @click="logout">
                <v-list-item-icon>
                  <v-icon>mdi-logout</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer"></v-app-bar-nav-icon>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer" app right temporary>
        <v-list nav dense>
          <v-list-item-group v-model="selectedItem" color="dark-green">
            <v-list-item to="/" exact>
              <v-list-item-icon>
                <v-icon>mdi-view-dashboard</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Dashboard</v-list-item-title>
            </v-list-item>
            <v-list-item to="/project-dashboard">
              <v-list-item-icon>
                <v-icon>mdi-folder-multiple</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Create Projects</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>
    </template>

    <v-main class="app">
      <router-view />
    </v-main>

    <template v-if="$route.name !== 'LoginForm'">
      <v-footer app>
        <v-col class="text-center">
          &copy; {{ new Date().getFullYear() }} Project Monitoring System. All Rights Reserved.
        </v-col>
      </v-footer>
    </template>

    <!-- Update Credentials Dialog -->
    <v-dialog v-model="dialogUpdateCredentials" max-width="500">
      <v-card>
        <v-card-title class="headline">Update Credentials</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="currentPassword"
            :append-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="toggleShowCurrentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            label="Current Password"
            outlined
          ></v-text-field>
          <v-text-field
            v-model="newPassword"
            :append-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="toggleShowNewPassword"
            :type="showNewPassword ? 'text' : 'password'"
            label="New Password"
            outlined
          ></v-text-field>
          <v-text-field
            v-model="confirmPassword"
            :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="toggleShowConfirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Confirm New Password"
            outlined
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="dialogUpdateCredentials = false">
            Cancel
          </v-btn>
          <v-btn text color="primary" @click="updateCredentials">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import axios from 'axios';

export default {
  name: "App",
  data() {
    return {
      drawer: false,
      selectedItem: 0,
      dialogUpdateCredentials: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false
    };
  },
  methods: {
    logout() {
      localStorage.removeItem('authToken');
      this.$router.push('/');
    },
    toggleShowCurrentPassword() {
      this.showCurrentPassword = !this.showCurrentPassword;
    },
    toggleShowNewPassword() {
      this.showNewPassword = !this.showNewPassword;
    },
    toggleShowConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    updateCredentials() {
      if (this.newPassword !== this.confirmPassword) {
        alert('New passwords do not match.');
        return;
      }
      // Update password using Strapi's built-in change-password endpoint.
      axios
        .post(
          'http://localhost:1337/api/auth/change-password',
          {
            currentPassword: this.currentPassword,
            password: this.newPassword,
            passwordConfirmation: this.confirmPassword,
          },
          {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('authToken'),
            },
          }
        )
        .then(() => {
          alert('Password updated successfully.');
          this.dialogUpdateCredentials = false;
        })
        .catch((passwordError) => {
          console.error('Password update error:', passwordError);
          alert('Failed to update password. Please check your current password and try again.');
        });
    }
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap");

.v-app-bar.dark-green {
  background-color: #006400 !important;
}

.title-style {
  font-family: "Lexend", sans-serif !important;
  font-weight: 500;
  font-size: 1.25rem;
}

.button-style {
  font-family: "Lexend", sans-serif !important;
  font-weight: 400;
  letter-spacing: 0.3px;
  text-transform: none;
}

.v-btn {
  text-transform: none;
}

@media (max-width: 600px) {
  .title-style {
    font-size: 1rem;
  }
}

/* Background Image */
.app {
  background-image: url('@/assets/caraga-state-university bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
