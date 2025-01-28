<template>
  <v-app-bar app :color="navbarColor">
    <v-toolbar-title class="black--text">Project Monitoring System</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn text class="black--text" to="/">Dashboard</v-btn>
    <v-btn text class="black--text" to="/projects">Projects</v-btn>
    <v-btn text class="black--text" to="/reports">Reports</v-btn>
    <v-btn text class="black--text" to="/settings">Settings</v-btn>
  </v-app-bar>
</template>

<script>
export default {
  name: "NavBar",
  props: {
    navbarColor: {
      type: String,
      default: "#69F0AE", // Default navbar color
    },
  },
};
</script>

<style scoped>
</style>
