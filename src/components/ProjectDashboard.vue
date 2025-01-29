<template>
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
          <v-card-text>
            {{ project.description }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'ProjectDashboard',
  data() {
    return {
      search: '',
      projects: [
        { name: 'Project 1', description: 'Description 1' },
        { name: 'Project 2', description: 'Description 2' },
        { name: 'Project 3', description: 'Description 3' },
      ],
    };
  },
  computed: {
    filteredProjects() {
      return this.projects.filter(project => 
        project.name.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },
};
</script>

<style scoped>
</style>