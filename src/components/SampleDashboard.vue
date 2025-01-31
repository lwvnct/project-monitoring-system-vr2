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
        :key="project.documentId"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="pa-2"
      >
        <v-card class="mx-auto project-card ms-5" elevation="2">
          <v-card-title class="subtitle-1 font-weight-bold">{{ project.projectName }}</v-card-title>
          <v-card-subtitle>{{ project.projectLocation }}</v-card-subtitle>
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
                  <v-list-item-subtitle>Start: {{ formatDate(project.startDate) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon small>mdi-calendar-end</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-subtitle>Due: {{ formatDate(project.dueDate) }}</v-list-item-subtitle>
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
                <p>Project Budget: ${{ project.totalProjectAmount.toLocaleString() }}</p>
                <p>Project Duration: {{ project.projectDuration }} days</p>
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
      projects: []
    };
  },
  computed: {
    filteredProjects() {
      const searchLower = this.search.toLowerCase();
      return this.projects.filter(project => 
        project.projectName.toLowerCase().includes(searchLower) ||
        project.projectLocation.toLowerCase().includes(searchLower) ||
        project.sourceOfFund.toLowerCase().includes(searchLower)
      );
    }
  },
  methods: {
    async fetchProjects() {
      try {
        const response = await fetch("http://localhost:1337/api/header-per-project-sections?populate=*");
        const data = await response.json();
        
        this.projects = data.data.map(section => {
          const project = section.project;
          const totalWtPercent = section.project_item_modifieds.reduce((sum, item) => sum + item.wt_percent, 0);
          
          return {
            documentId: project.documentId,
            projectName: project.projectName,
            projectLocation: project.projectLocation,
            startDate: project.startDate,
            dueDate: project.dueDate,
            sourceOfFund: project.sourceOfFund,
            totalProjectAmount: project.totalProjectAmount,
            projectDuration: project.projectDuration,
            progress: totalWtPercent,
            showMore: false
          };
        });
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
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
  },
  mounted() {
    this.fetchProjects();
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