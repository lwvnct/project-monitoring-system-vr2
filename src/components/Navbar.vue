<template>
  <v-app-bar app color="dark-green">
    <!-- Left Section with Logo and Title -->
    <div class="d-flex align-center" style="margin-left: 20px">
      <v-img
        src="@/assets/Caraga_State_University_1.png"
        alt="Caraga State University"
        contain
        max-height="75"
        class="mr-4"
        style="min-width: 80px"
      ></v-img>
      <v-toolbar-title class="white--text title-style">
        Project Monitoring System
      </v-toolbar-title>
    </div>

    <v-spacer></v-spacer>

    <!-- Right Section with Navigation Buttons -->
    <div class="d-flex align-center pr-4">
      <v-btn text class="white--text button-style" to="/">Dashboard</v-btn>
      <v-btn text class="white--text button-style" to="/projects">Projects</v-btn>
      <v-btn text class="white--text button-style" to="/reports">Reports</v-btn>
      <v-btn text class="white--text button-style" to="/settings">Settings</v-btn>
    </div>
  </v-app-bar>
</template>

<script>
export default {
  name: "NavBar",
  props: {
    navbarColor: {
      type: String,
      default: "dark-green"
    }
  }
};
</script>

<style scoped>
.dark-green {
  background-color: #006400 !important;
}

.title-style {
  font-family: 'Lexend', sans-serif !important;
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.button-style {
  font-family: 'Lexend', sans-serif !important;
  font-weight: 300;
  letter-spacing: 0.3px;
}

/* Add this in your main CSS file or within a <style> tag without scoped */
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap');
</style>