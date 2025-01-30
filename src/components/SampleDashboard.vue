<template>
  <v-container fluid class="pa-0">
    <v-row class="ma-0">
      <v-col cols="12" class="pa-2">
        <v-text-field
          v-model="search"
          label="Search projects"
          prepend-icon="mdi-magnify"
          clearable
          outlined
          dense
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row class="ma-0">
      <v-col
        v-for="project in filteredProjects"
        :key="project.name"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="pa-2"
      >
        <v-card class="mx-auto project-card" elevation="2">
          <v-card-title class="subtitle-1 font-weight-bold">{{ project.name }}</v-card-title>
          <v-card-subtitle>{{ project.location }}</v-card-subtitle>
          <v-card-text>
            <v-chip
              :color="getStatusColor(project.status)"
              text-color="white"
              small
              class="mb-2"
            >
              {{ project.status }}
            </v-chip>
            <v-list dense>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon small>mdi-calendar-start</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-subtitle>Start: {{ formatDate(project.start_date) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon small>mdi-calendar-end</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-subtitle>Due: {{ formatDate(project.due_date) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-progress-linear
              :value="project.progress"
              :color="getProgressColor(project.progress)"
              height="20"
              striped
            >
              <template v-slot:default="{ value }">
                <strong>{{ Math.ceil(value) }}%</strong>
              </template>
            </v-progress-linear>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" text small>View Details</v-btn>
            <v-spacer></v-spacer>
            <v-btn icon small @click="project.showMore = !project.showMore">
              <v-icon>{{ project.showMore ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </v-card-actions>
          <v-expand-transition>
            <div v-show="project.showMore">
              <v-divider></v-divider>
              <v-card-text class="text-caption">
                <p>Project Manager: {{ project.manager }}</p>
                <p>Budget: ${{ project.budget.toLocaleString() }}</p>
                <p>Description: {{ project.description }}</p>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'SampleDashboard',
  data() {
    return {
      search: '',
      projects: [
        {
          name: "CCIS Building Repair",
          status: "Ongoing",
          location: "CCIS",
          start_date: "2025-01-01",
          due_date: "2025-02-01",
          progress: 65,
          showMore: false,
          manager: "John Doe",
          budget: 500000,
          description: "Comprehensive repair and renovation of the CCIS building."
        },
        {
          name: "Library Expansion",
          status: "Upcoming",
          location: "Library",
          start_date: "2025-03-01",
          due_date: "2025-05-01",
          progress: 10,
          showMore: false,
          manager: "Jane Smith",
          budget: 1200000,
          description: "Expansion of the library to accommodate more resources and study areas."
        },
        {
          name: "Student Center Renovation",
          status: "Delayed",
          location: "Student Center",
          start_date: "2024-11-15",
          due_date: "2025-03-15",
          progress: 40,
          showMore: false,
          manager: "Bob Johnson",
          budget: 800000,
          description: "Renovation of the student center to improve facilities and services."
        },
        {
          name: "Science Lab Upgrade",
          status: "Completed",
          location: "Science Building",
          start_date: "2024-09-01",
          due_date: "2024-12-31",
          progress: 100,
          showMore: false,
          manager: "Alice Brown",
          budget: 350000,
          description: "Upgrading equipment and facilities in the science laboratories."
        },
        {
          name: "Sports Complex Extension",
          status: "Ongoing",
          location: "Sports Area",
          start_date: "2025-02-15",
          due_date: "2025-08-15",
          progress: 30,
          showMore: false,
          manager: "Charlie Davis",
          budget: 1500000,
          description: "Extending the sports complex with new facilities and equipment."
        },
        {
          name: "Campus Wi-Fi Upgrade",
          status: "Upcoming",
          location: "Entire Campus",
          start_date: "2025-05-01",
          due_date: "2025-06-30",
          progress: 0,
          showMore: false,
          manager: "Eva Green",
          budget: 250000,
          description: "Upgrading campus-wide Wi-Fi infrastructure for better connectivity."
        },
        {
          name: "Dormitory Renovation",
          status: "Ongoing",
          location: "Student Housing",
          start_date: "2025-01-15",
          due_date: "2025-04-30",
          progress: 55,
          showMore: false,
          manager: "Frank White",
          budget: 900000,
          description: "Renovating student dormitories to improve living conditions."
        },
        {
          name: "Green Energy Initiative",
          status: "Upcoming",
          location: "Campus-wide",
          start_date: "2025-06-01",
          due_date: "2025-12-31",
          progress: 5,
          showMore: false,
          manager: "Grace Lee",
          budget: 2000000,
          description: "Implementing solar panels and other green energy solutions across campus."
        },
        {
          name: "Parking Lot Expansion",
          status: "Delayed",
          location: "North Campus",
          start_date: "2024-10-01",
          due_date: "2025-02-28",
          progress: 20,
          showMore: false,
          manager: "Henry Clark",
          budget: 600000,
          description: "Expanding parking facilities to accommodate increased student population."
        },
        {
          name: "Art Center Construction",
          status: "Ongoing",
          location: "South Campus",
          start_date: "2025-03-15",
          due_date: "2026-01-15",
          progress: 15,
          showMore: false,
          manager: "Irene Foster",
          budget: 3000000,
          description: "Construction of a new art center for visual and performing arts."
        }
      ],
    };
  },
  computed: {
    filteredProjects() {
      const searchLower = this.search.toLowerCase();
      return this.projects.filter(project => 
        project.name.toLowerCase().includes(searchLower) ||
        project.location.toLowerCase().includes(searchLower) ||
        project.status.toLowerCase().includes(searchLower) ||
        project.manager.toLowerCase().includes(searchLower)
      );
    }
  },
  methods: {
    getStatusColor(status) {
      const colors = {
        ongoing: 'green',
        upcoming: 'blue',
        delayed: 'orange',
        completed: 'grey'
      };
      return colors[status.toLowerCase()] || 'primary';
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
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
.project-card {
  transition: all 0.3s ease;
}
.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}
</style>