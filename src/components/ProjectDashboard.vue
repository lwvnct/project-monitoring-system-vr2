<template>
    <v-container>
      <v-row>
        <v-col cols="12" md="4" v-for="project in projects" :key="project.name">
          <v-card class="glass-card">
            <v-card-title>{{ project.name }}</v-card-title>
            <v-card-subtitle>{{ project.location }}</v-card-subtitle>
            <v-card-text>
              <div>Status: {{ project.status }}</div>
              <div>Start Date: {{ formatDate(project.start_date) }}</div>
              <div>Due Date: {{ formatDate(project.due_date) }}</div>
              <div>Overall Progress: {{ project.overall_progress }}%</div>
              <v-progress-linear :value="project.overall_progress" color="aqua"></v-progress-linear>
              <div v-for="deliverable in project.deliverables" :key="deliverable.name">
                <div>{{ deliverable.name }}: {{ deliverable.progress }}%</div>
                <v-progress-linear :value="deliverable.progress" color="aqua"></v-progress-linear>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn color="aqua" text>View Details</v-btn>
              <v-spacer></v-spacer>
              <v-btn icon @click="project.showMore = !project.showMore">
                <v-icon>{{ project.showMore ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </v-card-actions>
            <v-expand-transition>
              <div v-show="project.showMore">
                <v-divider></v-divider>
                <!-- Additional project details can go here -->
              </div>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    name: 'Dashboard',
    data() {
      return {
        projects: [
          {
            name: "CCIS Building Repair",
            status: "Ongoing",
            location: "CCIS",
            start_date: "2025-01-01",
            due_date: "2025-02-01",
            overall_progress: 50,
            deliverables: [
              { name: "Roof Repair", progress: 70 },
              { name: "Painting", progress: 30 },
            ],
            showMore: false,
          },
          {
            name: "Library Expansion",
            status: "Upcoming",
            location: "Library",
            start_date: "2025-03-01",
            due_date: "2025-05-01",
            overall_progress: 0,
            deliverables: [
              { name: "Foundation", progress: 0 },
              { name: "Framing", progress: 0 },
            ],
            showMore: false,
          },
        ],
      };
    },
    methods: {
      formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      },
      getProgressColor(progress) {
        if (progress < 30) return 'red';
        if (progress < 70) return 'orange';
        return 'green';
      },
    },
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
  .glass-card {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  </style>