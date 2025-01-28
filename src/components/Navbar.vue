<template>
  <v-app>
    <v-app-bar app color="dark-green">
      <!-- Left Section with Title -->
      <v-toolbar-title class="white--text title-style">
        Project Monitoring System
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Right Section with Navigation Buttons -->
      <div class="d-flex align-center pr-4">
        <v-btn text class="white--text button-style" to="/">Dashboard</v-btn>
        <v-btn text class="white--text button-style" to="/projects">Projects</v-btn>
        <v-btn text class="white--text button-style" to="/reports">Reports</v-btn>
        <v-btn text class="white--text button-style" @click="drawer = !drawer">
          Settings
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Right Drawer -->
    <v-navigation-drawer v-model="drawer" app right temporary>
      <v-list>
        <!-- User Profile Section -->
        <v-list-item>
          <v-list-item-avatar>
            <v-img src="@/assets/Caraga_State_University_1.png"></v-img> <!-- Replace with your user image path -->
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold">John Doe</v-list-item-title>
            <v-list-item-subtitle>john.doe@example.com</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <!-- Logout Button -->
        <v-list-item @click="logout">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
export default {
  name: "NavBar",
  data() {
    return {
      drawer: false, // Controls the visibility of the drawer
    };
  },
  methods: {
    logout() {
      // Add your logout logic here
      alert("Logged out successfully!");
      this.drawer = false; // Close the drawer after logout
    },
  },
  props: {
    navbarColor: {
      type: String,
      default: "dark-green",
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap");

.dark-green {
  background-color: #006400 !important;
}

.title-style {
  font-family: "Lexend", sans-serif !important;
  font-weight: 500;
}

.button-style {
  font-family: "Lexend", sans-serif !important;
  font-weight: 300;
  letter-spacing: 0.3px;
}
</style>