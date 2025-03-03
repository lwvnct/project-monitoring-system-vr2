<template>
  <v-app class="app">
    <!-- Navigation bar & drawer only visible if not on Login page -->
    <template v-if="$route.name !== 'LoginForm'">
      <!-- App Bar -->
      <v-app-bar app color="dark-green" dark elevation="4">
        <!-- Left Section with Logo and Title -->
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
  
        <!-- Right Section with Navigation Buttons -->
        <div class="d-none d-md-flex align-center pr-4">
          <v-btn text class="button-style" to="/sample-dashboard" exact>
            <v-icon left>mdi-view-dashboard</v-icon>
            Dashboard
          </v-btn>
          <v-btn text class="button-style" to="/project-dashboard">
            <v-icon left>mdi-folder-multiple</v-icon>
            Create Projects
          </v-btn>
          <!-- Uncomment and add additional navigation buttons as needed -->
          <!--
          <v-btn text class="button-style" to="/reports">
            <v-icon left>mdi-file-chart</v-icon>
            Reports
          </v-btn>
          -->
        </div>
  
        <!-- Mobile Menu Button -->
        <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer"></v-app-bar-nav-icon>
      </v-app-bar>
  
      <!-- Mobile Navigation Drawer -->
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
            <!-- Uncomment to add more links -->
            <!--
            <v-list-item to="/reports">
              <v-list-item-icon>
                <v-icon>mdi-file-chart</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Reports</v-list-item-title>
            </v-list-item>
            -->
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>
    </template>
  
    <!-- Main Content Area: This renders the current route's component -->
    <v-main class="app">
      <router-view />
    </v-main>
  
    <!-- Footer only visible when not on Login page -->
    <template v-if="$route.name !== 'LoginForm'">
      <v-footer app>
        <v-col class="text-center">
          &copy; {{ new Date().getFullYear() }} Project Monitoring System. All Rights Reserved.
        </v-col>
      </v-footer>
    </template>
  </v-app>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      drawer: false,
      selectedItem: 0,
    };
  },
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
