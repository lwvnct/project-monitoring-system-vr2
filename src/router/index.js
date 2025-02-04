import Vue from 'vue';
import Router from 'vue-router';
import SampleDashboard from '../components/SampleDashboard.vue';
import ProjectDashboard from '../components/ProjectDashboard.vue';
import OriginalContract from '../components/OriginalContract.vue';

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
    {
      path: '/original-contract',
      name: 'OriginalContract',
      component: OriginalContract
    },
    // Add other routes as necessary
  ]
});
