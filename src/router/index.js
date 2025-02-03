import Vue from 'vue';
import Router from 'vue-router';
import SampleDashboard from '../components/SampleDashboard.vue';
import ProjectDashboard from '../components/ProjectDashboard.vue';

Vue.use(Router);

export default new Router({
  mode: 'history', // Optional: Use history mode for cleaner URLs
  routes: [
    {
      path: '/',
      name: 'SampleDashboard',
      component: SampleDashboard
    },
    {
      path: '/project-dashboard',
      name: 'ProjectDashboard',
      component: ProjectDashboard
    },
    // Add other routes as necessary
  ]
});
