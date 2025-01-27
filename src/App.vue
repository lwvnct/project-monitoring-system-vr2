<template>
  <v-app>
    <!-- Navigation Bar -->
    <v-app-bar app :color="navbarColor">
      <v-toolbar-title class="black--text">Project Monitoring System</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text class="black--text" to="/">Dashboard</v-btn>
      <v-btn text class="black--text" to="/projects">Projects</v-btn>
      <v-btn text class="black--text" to="/reports">Reports</v-btn>
      <v-btn text class="black--text" to="/settings">Settings</v-btn>
    </v-app-bar>

    <!-- Main Layout -->
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="search"
              label="Search projects"
              prepend-icon="mdi-magnify"
              clearable
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="4" v-for="project in filteredProjects" :key="project.name">
            <v-card class="mx-auto" max-width="400">
              <v-card-title class="headline">{{ project.name }}</v-card-title>
              <v-card-subtitle>{{ project.location }}</v-card-subtitle>
              <v-card-text>
                <v-chip :color="getStatusColor(project.status)" text-color="white" class="mb-2">
                  {{ project.status }}
                </v-chip>
                <v-list dense>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-calendar-start</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Start Date: {{ formatDate(project.start_date) }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-calendar-end</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Due Date: {{ formatDate(project.due_date) }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-progress-check</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Progress: {{ project.progress }}%</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <v-progress-linear
                  :value="project.progress"
                  :color="getProgressColor(project.progress)"
                  height="25"
                  striped
                >
                  <strong>{{ project.progress }}%</strong>
                </v-progress-linear>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" text>View Details</v-btn>
                <v-spacer></v-spacer>
                <v-btn icon @click="project.showMore = !project.showMore">
                  <v-icon>{{ project.showMore ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
              </v-card-actions>
              <v-expand-transition>
                <div v-show="project.showMore">
                  <v-divider></v-divider>
                  <v-card-text>
                    This is where you can add more details about the project.
                  </v-card-text>
                </div>
              </v-expand-transition>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-footer app>
      <v-col class="text-center">
        &copy; 2025 Project Monitoring System. All Rights Reserved.
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      navbarColor: '#69F0AE',
      projects: [
        {
          name: "CCIS Building Repair",
          status: "Ongoing",
          location: "CCIS",
          start_date: "2025-01-01",
          due_date: "2025-02-01",
          progress: 65,
          showMore: false,
        },
        {
          name: "Library Expansion",
          status: "Upcoming",
          location: "Library",
          start_date: "2025-03-01",
          due_date: "2025-05-01",
          progress: 10,
          showMore: false,
        },
        {
          name: "Student Center Renovation",
          status: "Delayed",
          location: "Student Center",
          start_date: "2024-11-15",
          due_date: "2025-03-15",
          progress: 40,
          showMore: false,
        },
        {
          name: "Science Lab Upgrade",
          status: "Completed",
          location: "Science Building",
          start_date: "2024-09-01",
          due_date: "2024-12-31",
          progress: 100,
          showMore: false,
        },
        {
          name: "Sports Complex Extension",
          status: "Ongoing",
          location: "Sports Area",
          start_date: "2025-02-15",
          due_date: "2025-08-15",
          progress: 30,
          showMore: false,
        },
        {
          name: "Campus Wi-Fi Upgrade",
          status: "Upcoming",
          location: "Entire Campus",
          start_date: "2025-05-01",
          due_date: "2025-06-30",
          progress: 0,
          showMore: false,
        },
      ],
      search: "",
    };
  },
  computed: {
    filteredProjects() {
      return this.projects.filter(project => 
        project.name.toLowerCase().includes(this.search.toLowerCase()) ||
        project.location.toLowerCase().includes(this.search.toLowerCase()) ||
        project.status.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },
  methods: {
    getStatusColor(status) {
      switch (status.toLowerCase()) {
        case 'ongoing':
          return 'green';
        case 'upcoming':
          return 'blue';
        case 'delayed':
          return 'orange';
        case 'completed':
          return 'grey';
        default:
          return 'primary';
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    getProgressColor(progress) {
      if (progress < 30) return 'red';
      if (progress < 70) return 'orange';
      return 'green';
    }
  }
};
</script>

<style scoped>
.v-card {
  transition: all 0.3s;
}
.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
</style>