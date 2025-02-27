<template>
  <div>
    <table class="progress-table mx-auto my-5">
      <!-- Project Header (using data from the first headerSection) -->
      <thead>
        <tr>
          <th colspan="13" class="bgcolor table-title py-3">
            WEEKLY PROGRESS REPORT
          </th>
        </tr>
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
        <!-- Wrap the date inputs in a flex container -->
        <tr>
          <th colspan="13" class="smalltext">
            As of:
            <span class="date-inputs">
              <input type="date" v-model="asOf" placeholder="Enter as of date" /> 
              -
              <input type="date" v-model="asOf" placeholder="Enter as of date" />
            </span>
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
          <th class="bgcolor" rowspan="2">PROBLEM ENCOUNTERED</th>
        </tr>
        <tr>
          <th class="bgcolor">% PREV</th>
          <th class="bgcolor">THIS DATE</th>
          <th class="bgcolor">REMAINING %</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="header in headerSections" :key="header.id">
          <td></td>
          <td class="notBold">
            {{ header.mainDescription || 'Loading...' }}
          </td>
          <td></td>
          <td class="wt-percent">
            {{
              computeTotals(header).totalWTPercent !== null
                ? computeTotals(header).totalWTPercent
                : 'N/A'
            }}%
          </td>
          <td class="notBold">{{ getThisDateActivity(header) }}</td>
          <td></td>
          <td class="prev-wt-percent">
            {{
              computeTotals(header).totalPrevWTPercents !== null
                ? computeTotals(header).totalPrevWTPercents
                : 'N/A'
            }}%
          </td>
          <td class="remaining-percent">
            {{ header.remaining || 'Loading...' }}
          </td>
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
          <!-- Custom File Input for Before Image (without Browse button) -->
          <td>
            <div class="custom-file-input">
              <input
                type="file"
                ref="beforeFileInput"
                @change="handleBeforeFileChange"
                style="display: none;"
              />
              <input
                type="text"
                :value="beforeFileName"
                readonly
                placeholder="No file chosen"
                @click="triggerBeforeFileInput"
              />
            </div>
          </td>
          <!-- Custom File Input for After Image (without Browse button) -->
          <td>
            <div class="custom-file-input">
              <input
                type="file"
                ref="afterFileInput"
                @change="handleAfterFileChange"
                style="display: none;"
              />
              <input
                type="text"
                :value="afterFileName"
                readonly
                placeholder="No file chosen"
                @click="triggerAfterFileInput"
              />
            </div>
          </td>
        </tr>
      </thead>
    </table>
    <!-- Global Submit Buttons for Manpower Progress and Problem Encountered Fields -->
    <div class="text-center my-3">
      <button type="button" @click="submitAllProblemUpdates">
        Submit Problem Updates
      </button>
      <button type="button" @click="submitManpowerProgress">
        Submit Manpower Progress
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
      isRemainingUpdated: false,
      asOf: '',
      manpowerDesignation: '',
      noOfManpower: '',
      nameOfPersonel: '',
      workDoneOrInProgress: '',
      // Uploaded file data arrays (for use in the payload)
      beforeUploadedFiles: [],
      afterUploadedFiles: [],
      // File name to display in the text field
      beforeFileName: '',
      afterFileName: ''
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
    updateRemainingField() {
      if (this.isRemainingUpdated) {
        console.log("updateRemainingField did not run automatically because it has already been updated.");
        return Promise.resolve();
      }
  
      const updatePromises = this.headerSections.map(header => {
        if (header.remaining !== undefined && header.remaining !== null) {
          console.log(`Skipping update for header ${header.documentId} as it has already been updated.`);
          return Promise.resolve();
        }
  
        const totalWTPercent = this.computeTotals(header).totalWTPercent;
        const remainingValue = totalWTPercent !== null ? totalWTPercent : 'N/A';
        return axios
          .put(`http://localhost:1337/api/header-per-project-sections/${header.documentId}`, {
            data: { remaining: remainingValue }
          })
          .then(() => {
            header.remaining = remainingValue;
            console.log(`WPR Update remaining: ${remainingValue}`);
          })
          .catch(error => {
            console.error(`Error updating remaining for header ${header.documentId}:`, error);
          });
      });
  
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
            data: { problem_encountered: header.problemEncountered }
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
    // Methods for the custom "Before" file input:
    triggerBeforeFileInput() {
      this.$refs.beforeFileInput.click();
    },
    handleBeforeFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      this.beforeFileName = file.name; // Show the file name in the text field
      this.uploadBeforeImage(file);
    },
    uploadBeforeImage(file) {
      const formData = new FormData();
      formData.append('files', file);
      
      axios
        .post('http://localhost:1337/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(response => {
          console.log('Before image uploaded:', response.data);
          // alert('Before image uploaded successfully!');
          // Save the returned file data (an array) for later use in the payload.
          this.beforeUploadedFiles = response.data;
        })
        .catch(error => {
          console.error('Error uploading before image:', error);
          alert('Error uploading before image.');
        });
    },
    // Methods for the custom "After" file input:
    triggerAfterFileInput() {
      this.$refs.afterFileInput.click();
    },
    handleAfterFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      this.afterFileName = file.name; // Show the file name in the text field
      this.uploadAfterImage(file);
    },
    uploadAfterImage(file) {
      const formData = new FormData();
      formData.append('files', file);
      
      axios
        .post('http://localhost:1337/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(response => {
          console.log('After image uploaded:', response.data);
          // alert('After image uploaded successfully!');
          // Save the returned file data for later use in the payload.
          this.afterUploadedFiles = response.data;
        })
        .catch(error => {
          console.error('Error uploading after image:', error);
          alert('Error uploading after image.');
        });
    },
    // Submit manpower progress to the API with relation to the project and include uploaded images.
    submitManpowerProgress() {
      const payload = {
        data: {
          manpower_designation: this.manpowerDesignation,
          no_of_manpower: this.noOfManpower,
          name_of_personel: this.nameOfPersonel,
          work_done: this.workDoneOrInProgress,
          project: this.project.id,
          before_image: this.beforeUploadedFiles.length
            ? this.beforeUploadedFiles.map(file => file.id)
            : [],
          after_image: this.afterUploadedFiles.length
            ? this.afterUploadedFiles.map(file => file.id)
            : []
        }
      };
      console.log('Payload for manpower progress:', payload);
      
      axios
        .post('http://localhost:1337/api/manpower-progresses', payload)
        .then((response) => {
          console.log('Manpower progress added successfully:', response.data);
          alert("Manpower progress submitted successfully!");
          // Reset input fields and uploaded file data
          this.manpowerDesignation = '';
          this.noOfManpower = '';
          this.nameOfPersonel = '';
          this.workDoneOrInProgress = '';
          this.beforeUploadedFiles = [];
          this.afterUploadedFiles = [];
          this.beforeFileName = '';
          this.afterFileName = '';
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

/* Style for inline date inputs */
.date-inputs {
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

input[type="text"],
input[type="number"],
input[type="date"] {
  width: 100%;
  padding: 2px;
  box-sizing: border-box;
}

.custom-file-input {
  display: flex;
  align-items: center;
}

.custom-file-input input[type="text"] {
  flex: 1;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fff;
}

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
