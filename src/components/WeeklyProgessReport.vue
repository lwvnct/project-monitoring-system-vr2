<template>
  <div>
    <table class="progress-table mx-auto my-5">
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
            As of: <input type="date" v-model="asOf" placeholder="Enter as of date" /> - <input type="date" v-model="asOf" placeholder="Enter as of date" />
          </th>
        </tr>
        <tr>
          <th colspan="13" class="table-title">MATERIAL PROGRESS</th>
        </tr>
      </thead>

      <!-- WORK PROGRESS Section -->
      <thead>
        <tr>
          <th class="vertical" rowspan="2">WORK PROGRESS</th>
          <th class="bgcolor" rowspan="2">ITEM DESCRIPTION</th>
          <th class="bgcolor" rowspan="2">DELIVERY DATE</th>
          <th class="bgcolor" rowspan="2">WT%</th>
          <th class="bgcolor" rowspan="2">THIS DATE ACTIVITY</th>
          <th class="bgcolor" colspan="3">WORK PERCENTAGE</th>
          <!-- Unmerged PROBLEM ENCOUNTERED header -->
          <th class="bgcolor" rowspan="2">PROBLEM ENCOUNTERED</th>
        </tr>
        <tr>
          <th class="bgcolor">% PREV</th>
          <th class="bgcolor">THIS DATE</th>
          <th class="bgcolor">REMAINING %</th>
        </tr>
      </thead>
      <tbody>
        <!-- New row for each headerSection -->
        <tr v-for="header in headerSections" :key="header.id">
          <!-- Extra empty cell to align with the vertical header -->
          <td></td>
          <!-- ITEM DESCRIPTION -->
          <td class="notBold">
            {{ header.mainDescription || 'Loading...' }}
          </td>
          <!-- DELIVERY DATE (empty) -->
          <td></td>
          <!-- WT% Column -->
          <td class="wt-percent">
            {{
              computeTotals(header).totalWTPercent !== null
                ? computeTotals(header).totalWTPercent
                : 'N/A'
            }}%
          </td>
          <!-- THIS DATE ACTIVITY -->
          <td class="notBold">{{ getThisDateActivity(header) }}</td>
          <!-- Empty cell before % PREV -->
          <td></td>
          <!-- % PREV Column -->
          <td class="prev-wt-percent">
            {{
              computeTotals(header).totalPrevWTPercents !== null
                ? computeTotals(header).totalPrevWTPercents
                : 'N/A'
            }}%
          </td>
          <!-- REMAINING % Column -->
          <td class="remaining-percent">
            {{ header.remaining || 'Loading...' }}
          </td>
          <!-- New TD for PROBLEM ENCOUNTERED (each row gets its own value) -->
          <td class="problem-cell">
            <textarea
              v-model="header.problemEncountered"
              placeholder="Enter problem encountered"
            ></textarea>
          </td>
        </tr>
      </tbody>

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
        <!-- New row with input fields for manpower progress -->
        <tr>
          <td></td>
          <td>
            <input
              type="text"
              v-model="manpowerDesignation"
              placeholder="Enter designation"
            />
          </td>
          <td>
            <!-- Use .number modifier so the value is sent as a number -->
            <input
              type="number"
              v-model.number="noOfManpower"
              placeholder="Enter number"
            />
          </td>
          <td>
            <input
              type="text"
              v-model="nameOfPersonel"
              placeholder="Enter personnel name"
            />
          </td>
          <td colspan="3">
            <textarea
              type="text"
              v-model="workDoneOrInProgress"
              placeholder="Enter work progress"
              style="width: 100%"
            ></textarea>
          </td>
          <td>
            <label class="custom-file-upload">
              <input type="file" />
              Upload Before
            </label>
          </td>
          <td>
            <label class="custom-file-upload">
              <input type="file" />
              Upload After
            </label>
          </td>
        </tr>
      </thead>
    </table>
    <!-- Global Submit Buttons for Manpower Progress and Problem Encountered Fields -->
    <div class="text-center my-3">
      <button type="button" @click="submitManpowerProgress">
        Submit Manpower Progress
      </button>
      <button type="button" @click="submitAllProblemUpdates">
        Submit Problem Updates
      </button>
    </div>
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
      isRemainingUpdated: false, // Flag to ensure updateRemainingField runs only once
      asOf: '',
      manpowerDesignation: '',
      noOfManpower: '', // Will be converted to number via v-model.number
      nameOfPersonel: '',
      workDoneOrInProgress: '',
      before: '',
      after: ''
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
          // Initialize each header with its own problemEncountered property.
          this.headerSections = response.data.data.map(header => {
            return {
              ...header,
              problemEncountered: header.problemEncountered || ''
            };
          });
          // Use the first headerSection's project details for the header
          if (this.headerSections[0] && this.headerSections[0].project) {
            this.project = this.headerSections[0].project;
          }
          // Only update the "remaining" field if it hasn't been updated before
          if (!this.isRemainingUpdated) {
            this.updateRemainingField().then(() => {
              // After updateRemainingField runs successfully,
              // perform the check for page refresh (previously in created())
              if (performance.navigation.type === 1) {
                this.isRemainingUpdated =
                  localStorage.getItem('isRemainingUpdated') === 'true';
              }
            });
          } else {
            console.log(
              "updateRemainingField did not run automatically because it has already been updated."
            );
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
          return matchingItem && matchingItem.subDescription 
            ? `${matchingItem.subDescription} (${mod.P_EnteredQuantity}%)` 
            : '';
        })
        .filter(text => text !== '');
      return activities.join(', ');
    },
    // Update the "remaining" field in the API using the computed WT% value.
    // This method returns a promise that resolves when all PUT requests are complete.
    updateRemainingField() {
      if (this.isRemainingUpdated) {
        console.log(
          "updateRemainingField did not run automatically because it has already been updated."
        );
        return Promise.resolve(); // Prevent multiple executions
      }
  
      const updatePromises = this.headerSections.map(header => {
        // Check if the remaining field has already been updated
        if (header.remaining !== undefined && header.remaining !== null) {
          console.log(
            `Skipping update for header ${header.documentId} as it has already been updated.`
          );
          return Promise.resolve();
        }
  
        const totalWTPercent = this.computeTotals(header).totalWTPercent;
        const remainingValue =
          totalWTPercent !== null ? totalWTPercent : 'N/A';
        return axios
          .put(`http://localhost:1337/api/header-per-project-sections/${header.documentId}`, {
            data: {
              remaining: remainingValue
            }
          })
          .then(() => {
            // Update the local header object so the UI shows the new remaining value
            header.remaining = remainingValue;
            console.log(`WPR Update remaining: ${remainingValue}`);
          })
          .catch(error => {
            console.error(
              `Error updating remaining for header ${header.documentId}:`,
              error
            );
          });
      });
  
      // Wait for all updates to finish before setting the flag
      return Promise.all(updatePromises).then(() => {
        this.isRemainingUpdated = true;
        localStorage.setItem('isRemainingUpdated', 'true');
      });
    },
    // Submit updates for all problemEncountered fields for each headerSection.
    submitAllProblemUpdates() {
      const updatePromises = this.headerSections.map(header => {
        return axios
          .put(`http://localhost:1337/api/header-per-project-sections/${header.documentId}`, {
            data: {
              problem_encountered: header.problemEncountered
            }
          })
          .then(() => {
            console.log(`Updated problem encountered for header ${header.documentId}`);
          })
          .catch(error => {
            console.error(`Error updating problem encountered for header ${header.documentId}:`, error);
            return Promise.reject(error);
          });
      });
  
      Promise.all(updatePromises)
        .then(() => {
          alert("All problem encountered fields updated successfully.");
        })
        .catch(() => {
          alert("An error occurred while updating one or more problem encountered fields.");
        });
    },
    // Submit manpower progress to the API with relation to the project.
    // Added alert notifications to indicate success or error.
    submitManpowerProgress() {
      const payload = {
        data: {
          manpower_designation: this.manpowerDesignation,
          no_of_manpower: this.noOfManpower,
          name_of_personel: this.nameOfPersonel,
          work_done: this.workDoneOrInProgress,
          project: this.project.id  // Pass the related project ID
        }
      };
      console.log('Payload for manpower progress:', payload); // Optional: verify payload
      
      axios
        .post('http://localhost:1337/api/manpower-progresses', payload)
        .then((response) => {
          console.log('Manpower progress added successfully:', response.data);
          alert("Manpower progress submitted successfully!");
          // Optionally, reset the input fields after a successful submission:
          this.manpowerDesignation = '';
          this.noOfManpower = '';
          this.nameOfPersonel = '';
          this.workDoneOrInProgress = '';
        })
        .catch((error) => {
          console.error('Error adding manpower progress:', error);
          alert("Error submitting manpower progress. Please try again.");
        });
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
  font-size: small;
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

input[type="text"],
input[type="number"] {
  width: 100%;
  padding: 2px;
  box-sizing: border-box;
}

.custom-file-upload {
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
  background-color: #f4f4f4;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.custom-file-upload input[type="file"] {
  display: none;
}

/* Style for the submit buttons */
button {
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #007bff;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;
}

button:hover {
  background-color: #0056b3;
}
</style>
