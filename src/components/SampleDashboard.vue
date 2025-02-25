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
          style="background-color: white; border-radius: 4px;"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row class="ma-0">
      <v-col
        v-for="project in filteredProjects"
        :key="project.documentId"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="pa-2"
      >
        <v-card class="mx-auto project-card" elevation="2">
          <v-card-subtitle class="subtitle-1 font-weight-bold">
            {{ project.projectLocation }}
          </v-card-subtitle>
          <v-card-text>
            <v-chip color="blue" text-color="white" small class="mb-2">
              {{ project.projectName }}
            </v-chip>
            <v-list dense>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon small>mdi-calendar-start</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    Start: {{ formatDate(project.startDate) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon small>mdi-calendar-end</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-subtitle>
                    Due: {{ formatDate(project.dueDate) }}
                  </v-list-item-subtitle>
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
                <strong>{{ value }}%</strong>
              </template>
            </v-progress-linear>
          </v-card-text>
          <v-card-actions>
            <!-- View Details Button (kept) -->
            <router-link :to="`/project-details/${project.documentId}`" class="icon-button">
              <v-btn color="primary" text small>View Details</v-btn>
            </router-link>

            <v-spacer></v-spacer>

            <!-- Accomplished Report Icon -->
            <router-link :to="`/work-accomplished/${project.documentId}`" class="icon-button">
              <v-btn icon small color="success">
                <v-icon>mdi-file-check</v-icon>
              </v-btn>
            </router-link>

            <!-- Weekly Progress Report Icon -->
            <router-link :to="`/weekly-progress/${project.documentId}`" class="icon-button">
              <v-btn icon small color="info">
                <v-icon>mdi-calendar-clock</v-icon>
              </v-btn>
            </router-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SampleDashboard',
  data() {
    return {
      // Set initial search value from localStorage, if available
      search: localStorage.getItem('searchText') || '',
      projects: []
    };
  },
  computed: {
    filteredProjects() {
      const searchLower = this.search.toLowerCase();
      return this.projects.filter(project =>
        project.projectName.toLowerCase().includes(searchLower) ||
        project.projectLocation.toLowerCase().includes(searchLower) ||
        (project.sourceOfFund && project.sourceOfFund.toLowerCase().includes(searchLower))
      );
    }
  },
  watch: {
    // Watch for changes in search and save to localStorage
    search(newVal) {
      localStorage.setItem('searchText', newVal);
    }
  },
  methods: {
    async fetchProjects() {
      try {
        const response = await axios.get('http://localhost:1337/api/header-per-project-sections?populate=*');
        const sectionsData = response.data.data;
        
        let projectsMap = new Map();

        sectionsData.forEach(section => {
          const projectData = section.project;
          if (!projectData) return;

          const projectName = projectData.projectName;
          if (!projectsMap.has(projectName)) {
            projectsMap.set(projectName, {
              documentId: projectData.documentId,
              projectName: projectName,
              projectLocation: projectData.projectLocation || "Unknown",
              startDate: projectData.startDate || null,
              dueDate: projectData.dueDate || null,
              sourceOfFund: projectData.sourceOfFund || '',
              totalProjectAmount: projectData.totalProjectAmount || 0,
              projectDuration: projectData.projectDuration || 0,
              progress: 0,
              showMore: false
            });
          }

          let totalWtPercent = section.project_item_modifieds?.reduce((sum, item) => sum + (item.wt_percent ?? 0), 0) || 0;
          projectsMap.get(projectName).progress += totalWtPercent;
        });

        this.projects = Array.from(projectsMap.values());
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    getProgressColor(progress) {
      if (progress < 30) return 'red';
      if (progress < 70) return 'orange';
      return 'green';
    }
  },
  mounted() {
    this.fetchProjects();
  }
};
</script>

<style scoped>
.project-card {
  transition: all 0.3s ease;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}
.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
}
.v-progress-linear {
  font-size: 14px;
  font-weight: bold;
}
.v-card-text {
  font-size: 14px;
}
.v-list-item-subtitle {
  color: #555;
  font-size: 13px;
}
.v-btn {
  text-transform: none;
}
.icon-button {
  text-decoration: none;
}
</style>
