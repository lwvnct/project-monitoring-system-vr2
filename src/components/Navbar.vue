<template>
  <v-app>
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
        <v-btn text class="button-style" to="/" exact>
          <v-icon left>mdi-view-dashboard</v-icon>
          Dashboard
        </v-btn>
        <v-btn text class="button-style" to="/projects">
          <v-icon left>mdi-folder-multiple</v-icon>
          Projects
        </v-btn>
        <v-btn text class="button-style" to="/reports">
          <v-icon left>mdi-file-chart</v-icon>
          Reports
        </v-btn>
      </div>

      <!-- User Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-avatar color="grey lighten-2" size="32">
              <v-img src="@/assets/Caraga_State_University_1.png" alt="User Avatar"></v-img>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-avatar>
              <v-img src="@/assets/Caraga_State_University_1.png"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium">John Doe</v-list-item-title>
              <v-list-item-subtitle>john.doe@example.com</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item to="/profile">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item to="/settings">
            <v-list-item-icon>
              <v-icon>mdi-cog</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="logout">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Mobile Menu Button -->
      <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" app right temporary>
      <v-list nav dense>
        <v-list-item-group
          v-model="selectedItem"
          color="dark-green"
        >
          <v-list-item to="/" exact>
            <v-list-item-icon>
              <v-icon>mdi-view-dashboard</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item>
          <v-list-item to="/projects">
            <v-list-item-icon>
              <v-icon>mdi-folder-multiple</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Projects</v-list-item-title>
          </v-list-item>
          <v-list-item to="/reports">
            <v-list-item-icon>
              <v-icon>mdi-file-chart</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Reports</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
export default {
  name: "NavBar",
  data() {
    return {
      drawer: false,
      selectedItem: 0,
    };
  },
  methods: {
    logout() {
      // Add your logout logic here
      this.$store.dispatch('auth/logout');
      this.$router.push('/login');
    },
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
</style>