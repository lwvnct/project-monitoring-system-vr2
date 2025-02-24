<template>
  <div>
    <table class="progress-table mx-auto mt-5">
      <!-- Project Header (using data from the first headerSection) -->
      <thead>
        <tr>
          <th colspan="13" class="table-title py-3">
            {{ project.projectName || 'Loading...' }}
          </th>
        </tr>
        <tr>
          <th class="vertical" rowspan="4">PROJECT</th>
          <th rowspan="2">Source of Fund:</th>
          <th rowspan="2" class="notBold">
            {{ project.sourceOfFund || 'Loading...' }}
          </th>
          <th rowspan="2">Project Duration:</th>
          <th rowspan="2" class="notBold">
            {{ project.projectDuration || 'Loading...' }}<br />
            <span class="smalltext">Working Days</span>
          </th>
          <th colspan="2">
            Start Date<br />
            <span class="notBold">{{ project.startDate || 'Loading...' }}</span>
          </th>
          <th colspan="2" rowspan="2">
            Project Location: <br />
            <span class="notBold">{{ project.projectLocation || 'Loading...' }}</span>
          </th>
        </tr>
        <tr>
          <th>
            Target Completion Date:<br />
            <span class="notBold">{{ project.dueDate || 'Loading...' }}</span>
          </th>
          <th>
            Actual Completion Date:<br />
            <span class="notBold">
              {{ project.actualCompletionDate || '--' }}
            </span>
          </th>
        </tr>
        <tr>
          <th colspan="13" class="smalltext">
            As of: _______________________
          </th>
        </tr>
        <tr>
          <th colspan="13" class="table-title">MATERIAL PROGRESS</th>
        </tr>
      </thead>

      <!-- WORK PROGRESS Section -->
      <thead>
        <tr>
          <!-- Vertical header spans 5 rows -->
          <th class="vertical" rowspan="5">WORK PROGRESS</th>
          <th class="bgcolor" rowspan="2">ITEM DESCRIPTION</th>
          <th class="bgcolor" rowspan="2">DELIVERY DATE</th>
          <th class="bgcolor" rowspan="2">WT%</th>
          <!-- THIS DATE ACTIVITY now displays both subDescription and its individual value -->
          <th class="bgcolor" rowspan="2">THIS DATE ACTIVITY</th>
          <th class="bgcolor" colspan="3">WORK PERCENTAGE</th>
          <th class="bgcolor" colspan="2" rowspan="2">PROBLEM ENCOUNTERED</th>
        </tr>
        <tr>
          <th class="bgcolor">% PREV</th>
          <th class="bgcolor">THIS DATE</th>
          <th class="bgcolor">REMAINING %</th>
        </tr>
        <!-- New row for each headerSection -->
        <tr v-for="header in headerSections" :key="header.id">
          <!-- ITEM DESCRIPTION -->
          <th class="notBold">
            {{ header.mainDescription || 'Loading...' }}
          </th>
          <!-- DELIVERY DATE (empty) -->
          <th></th>
          <!-- WT% Column -->
          <th class="wt-percent">
            {{ computeTotals(header).totalWTPercent !== null ? computeTotals(header).totalWTPercent : 'N/A' }}%
          </th>
          <!-- THIS DATE ACTIVITY column now displays subDescriptions with individual values -->
          <th class="notBold">{{ getThisDateActivity(header) }}</th>
          <!-- Empty cell before % PREV -->
          <th></th>
          <!-- % PREV Column -->
          <th class="prev-wt-percent">
            {{ computeTotals(header).totalPrevWTPercents !== null ? computeTotals(header).totalPrevWTPercents : 'N/A' }}%
          </th>
          <!-- REMAINING % Column -->
          <th class="remaining-percent">
            {{ header.remaining || 'Loading...' }}
          </th>
          <!-- PROBLEM ENCOUNTERED (empty) -->
          <th></th>
        </tr>
      </thead>

      <!-- MAN POWER PROGRESS Section -->
      <thead>
        <tr>
          <th colspan="13" class="table-title">MAN POWER PROGRESS</th>
        </tr>
        <tr>
          <th class="vertical">LABOR(BY ADMINISTRATION)</th>
          <th class="bgcolor">MANPOWER DESIGNATION</th>
          <th class="bgcolor">NO. OF MANPOWER</th>
          <th class="bgcolor">NAME OF PERSONEL</th>
          <th class="bgcolor" colspan="3">WORK DONE OR IN PROGRESS</th>
          <th class="bgcolor">BEFORE</th>
          <th class="bgcolor">AFTER</th>
        </tr>
      </thead>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "WeeklyProgressReport",
  data() {
    return {
      project: {},          // Project details (set from the first headerSection)
      headerSections: [],   // Array to hold all header sections
      isRemainingUpdated: false // Flag to ensure updateRemainingField runs only once
    };
  },
  mounted() {
    const documentId = this.$route.params.documentId;
    axios
      .get(
        `http://localhost:1337/api/header-per-project-sections?populate=*&filters[project][documentId][$eq]=${documentId}`
      )
      .then((response) => {
        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          this.headerSections = response.data.data;
          // Use the first headerSection's project details for the header
          if (this.headerSections[0] && this.headerSections[0].project) {
            this.project = this.headerSections[0].project;
          }
          // Update the "remaining" field in the API if not already updated
          if (!this.isRemainingUpdated) {
            this.updateRemainingField();
            this.isRemainingUpdated = true;
            localStorage.setItem('isRemainingUpdated', 'true');
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching project header data:", error);
      });
  },
  methods: {
    // Compute totals for WT% and % PREV columns
    computeTotals(header) {
      const items = header.items || [];
      const projectItemModifieds = header.project_item_modifieds || [];
      const totalWTPercent = items.reduce(
        (acc, item) => acc + (Number(item.wt_percent) || 0),
        0
      );
      const totalPrevWTPercents = projectItemModifieds.reduce(
        (acc, mod) => acc + (Number(mod.p_wt_percent) || 0),
        0
      );
      return { totalWTPercent, totalPrevWTPercents };
    },
    // Extract subDescriptions with their individual values for items with new EnteredQuantity
    getThisDateActivity(header) {
      if (!header.items || !header.project_item_modifieds) return '';
      const activities = header.project_item_modifieds
        .filter(mod => Number(mod.P_EnteredQuantity) > 0)
        .map(mod => {
          const matchingItem = header.items.find(item => item.itemno === mod.itemno);
          // Return a combined string with the subDescription and the individual value
          return matchingItem && matchingItem.subDescription 
            ? `${matchingItem.subDescription} (${mod.P_EnteredQuantity}%)` 
            : '';
        })
        .filter(text => text !== '');
      return activities.join(', ');
    },
    // Update the "remaining" field in the API
    updateRemainingField() {
      this.headerSections.forEach(header => {
        const totalWTPercent = this.computeTotals(header).totalWTPercent;
        axios
          .put(`http://localhost:1337/api/header-per-project-sections/${header.documentId}`, {
            data: {
              remaining: totalWTPercent !== null ? totalWTPercent : 'N/A'
            }
          })
          .then(() => {
            console.log(`Updated remaining field for header ${header.documentId}`);
          })
          .catch(error => {
            console.error(`Error updating remaining field for header ${header.documentId}:`, error);
          });
      });
    }
  },
  created() {
    // Check if the page is refreshed
    if (performance.navigation.type === 1) {
      this.isRemainingUpdated = localStorage.getItem('isRemainingUpdated') === 'true';
    }
  }
};
</script>

<style scoped>
.progress-table {
  width: 90%;
  border-collapse: collapse;
  background-color: #f0f0f0;
}

.progress-table th,
.progress-table td {
  border: 1px solid #090909;
  padding: 8px;
  padding-block: 3px;
  text-align: center;
}

.notBold {
  font-weight: normal;
}

.bgcolor {
  background-color: rgb(239, 213, 40);
}

.table-title {
  font-weight: bold;
  font-size: 1.2rem;
}

.vertical {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

.wt-percent,
.prev-wt-percent,
.remaining-percent {
  text-align: center;
  font-weight: normal;
}

.smalltext {
  font-size: 0.8rem;
}
</style>