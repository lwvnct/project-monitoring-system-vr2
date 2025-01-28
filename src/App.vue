<template>
  <v-app>
    <!-- Navigation Bar -->
    <NavBar :navbarColor="navbarColor" />

    <!-- Footer -->
    <SystemFooter />
  </v-app>
</template>

<script>
import NavBar from "./components/NavBar.vue";
import SystemFooter from "./components/SystemFooter.vue";

export default {
  name: "App",
  components: {
    NavBar,
    SystemFooter,
  },
  data() {
    return {
      navbarColor: "#69F0AE",
    };
  },
};
</script>

<style scoped>
</style>