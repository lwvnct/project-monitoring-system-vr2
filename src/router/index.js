import Vue from 'vue';
import Router from 'vue-router';
import SampleDashboard from '../components/SampleDashboard.vue';
import ProjectDashboard from '../components/ProjectDashboard.vue';
import OriginalContract from '../components/OriginalContract.vue';
import ProjectDetails from '../components/ProjectDetails.vue';
import WorkAccomplished from '@/components/WorkAccomplished.vue';
import WeeklyProgressReport from '@/components/WeeklyProgessReport.vue';
import ViewWeeklyProgressReport from '@/components/ViewWeeklyProgressReport.vue';
import LoginForm from '@/components/LoginForm.vue';

Vue.use(Router);

const router = new Router({
  mode: 'history', // Use history mode for cleaner URLs
  routes: [
    {
      path: '/',
      name: 'LoginForm',
      component: LoginForm
    },
    {
      path: '/sample-dashboard',
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
    {
      path: '/work-accomplished/:documentId',
      name: 'WorkAccomplished',
      component: WorkAccomplished
    },
    {
      path: '/weekly-progress/:documentId',
      name: 'WeeklyProgressReport',
      component: WeeklyProgressReport
    },
    {
      path: '/view-weekly-progress/:documentId',
      name: 'ViewWeeklyProgressReport',
      component: ViewWeeklyProgressReport
    },
    // Add other routes as necessary
  ]
});

// Function to check if the user is authenticated
function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

// Global navigation guard
router.beforeEach((to, from, next) => {
  if (to.name !== 'LoginForm' && !isAuthenticated()) {
    next({ name: 'LoginForm' });
  } else {
    next();
  }
});

export default router;
