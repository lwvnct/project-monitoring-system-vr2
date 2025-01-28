<template>
  <v-app>
    <!-- Navigation Bar -->
    <NavBar :navbarColor="navbarColor" />

    <!-- Main Content Area -->
    <v-main>
      <router-view /> <!-- This will render either Dashboard or ProjectDashboard depending on the route -->
    </v-main>

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
import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from '../components/Dashboard.vue';
import ProjectDashboard from '../components/ProjectDashboard.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/project-dashboard',
      name: 'ProjectDashboard',
      component: ProjectDashboard
    },
    // Add other routes as necessary
  ]
});
