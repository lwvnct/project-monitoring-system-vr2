<template>
    <v-container fluid class="pa-0">
      <!-- Search Field -->
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
  
      <!-- Projects Cards -->
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
              <!-- View Details Button -->
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
  
              <!-- Delete Icon -->
              <v-btn icon small color="red" @click.stop="deleteProject(project)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Floating Action Button to open the wt_percent dialog -->
      <v-btn
        fab
        dark
        color="teal"
        class="floating-btn"
        @click="dialog = true"
      >
        <v-icon>mdi-chart-donut</v-icon>
      </v-btn>
  
      <!-- Dialog displaying the average wt_percent -->
      <v-dialog v-model="dialog" max-width="400">
        <v-card>
          <v-card-title class="headline">Average WT Percentage</v-card-title>
          <v-card-text class="text-center">
            <v-progress-circular
              :value="averageWtPercent"
              :rotate="360"
              :size="120"
              :width="15"
              :color="circularColor"
            >
              <span>{{ averageWtPercent }}%</span>
            </v-progress-circular>
            <p class="mt-4">Total wt_percent divided by the number of projects</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'Dashboard',
    data() {
      return {
        search: localStorage.getItem('searchText') || '',
        projects: [],
        dialog: false,
        totalWtPercentSum: 0, // Sum of wt_percent values
        projectsCount: 0      // Number of projects from the projects API
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
      },
      // Calculate average wt_percent by dividing total sum by number of projects
      averageWtPercent() {
        return this.projectsCount ? (this.totalWtPercentSum / this.projectsCount) : 0;
      },
      // Update the circular progress color based on the average wt_percent
      circularColor() {
        return this.getProgressColor(this.averageWtPercent);
      }
    },
    watch: {
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
                id: projectData.id, // Added project id for deletion
                documentId: projectData.documentId,
                projectName: projectName,
                projectLocation: projectData.projectLocation || "Unknown",
                startDate: projectData.startDate || null,
                dueDate: projectData.dueDate || null,
                sourceOfFund: projectData.sourceOfFund || '',
                totalProjectAmount: projectData.totalProjectAmount || 0,
                projectDuration: projectData.projectDuration || 0,
                progress: 0
              });
            }
  
            let totalWtPercentProject = section.project_item_modifieds?.reduce((sum, item) => sum + (item.wt_percent ?? 0), 0) || 0;
            projectsMap.get(projectName).progress += totalWtPercentProject;
          });
  
          this.projects = Array.from(projectsMap.values());
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      },
      async fetchProjectItems() {
        try {
          const response = await axios.get('http://localhost:1337/api/project-item-modifieds?populate=*');
          const items = response.data.data;
          // Sum up the wt_percent values from the API response
          this.totalWtPercentSum = items.reduce((sum, item) => sum + (item.wt_percent || 0), 0);
        } catch (error) {
          console.error("Error fetching project item modifieds:", error);
        }
      },
      async fetchProjectsCount() {
        try {
          const response = await axios.get('http://localhost:1337/api/projects?populate=*');
          const projectsData = response.data.data;
          this.projectsCount = projectsData.length;
        } catch (error) {
          console.error("Error fetching projects count:", error);
        }
      },
      async deleteProject(project) {
        if (!window.confirm(`Are you sure you want to delete project "${project.projectName}"? This action cannot be undone.`)) {
          return;
        }
        try {
          await axios.delete(`http://localhost:1337/api/projects/${project.documentId}`);
          alert('Project deleted successfully.');
          // Refresh data after deletion
          this.fetchProjects();
          this.fetchProjectItems();
          this.fetchProjectsCount();
        } catch (error) {
          console.error("Error deleting project:", error);
          alert('There was an error deleting the project.');
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
      this.fetchProjectItems();
      this.fetchProjectsCount();
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
  .floating-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100;
  }
  </style>
