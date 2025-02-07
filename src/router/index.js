import Vue from 'vue';
import Router from 'vue-router';
import SampleDashboard from '../components/SampleDashboard.vue';
import ProjectDashboard from '../components/ProjectDashboard.vue';
import OriginalContract from '../components/OriginalContract.vue';
import ProjectDetails from '../components/ProjectDetails.vue';

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
    {
      path: '/project-details/:documentId',
      name: 'ProjectDetails',
      component: ProjectDetails
    },
    // Add other routes as necessary
  ]
});
