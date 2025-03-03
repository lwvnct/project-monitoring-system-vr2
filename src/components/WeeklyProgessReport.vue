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
        <!-- (Optional date inputs commented out) -->
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
        <!-- Loop through headerSections to show individual input fields -->
        <tr v-for="header in headerSections" :key="header.id + '-mp'">
          <td></td>
          <td>
            <input
              type="text"
              v-model="header.manpowerDesignation"
              placeholder="Enter designation"
            />
          </td>
          <td>
            <input
              type="number"
              v-model.number="header.noOfManpower"
              placeholder="Enter number"
            />
          </td>
          <td>
            <input
              type="text"
              v-model="header.nameOfPersonel"
              placeholder="Enter personnel name"
            />
          </td>
          <!-- Preserved computed activity -->
          <td colspan="3">
            <span>
              {{ getThisDateActivity(header) || 'No activity available' }}
            </span>
          </td>
          <!-- Custom File Input for Before Images -->
          <td>
            <div class="custom-file-input">
              <input
                type="file"
                :ref="'beforeFileInput_' + header.id"
                @change="handleBeforeFileChange($event, header)"
                style="display: none;"
                multiple
              />
              <input
                type="text"
                :value="header.beforeFileNames.join(', ')"
                readonly
                placeholder="No files chosen"
                @click="triggerBeforeFileInput(header)"
              />
            </div>
          </td>
          <!-- Custom File Input for After Images -->
          <td>
            <div class="custom-file-input">
              <input
                type="file"
                :ref="'afterFileInput_' + header.id"
                @change="handleAfterFileChange($event, header)"
                style="display: none;"
                multiple
              />
              <input
                type="text"
                :value="header.afterFileNames.join(', ')"
                readonly
                placeholder="No files chosen"
                @click="triggerAfterFileInput(header)"
              />
            </div>
          </td>
        </tr>
      </thead>
    </table>
    <!-- Global Submit Buttons -->
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
      project: {},
      headerSections: [],
      isRemainingUpdated: false,
      asOf: ''
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
          this.headerSections = response.data.data.map(header => {
            return {
              ...header,
              problemEncountered: header.problemEncountered || '',
              manpowerDesignation: '',
              noOfManpower: null,
              nameOfPersonel: '',
              beforeUploadedFiles: [],
              afterUploadedFiles: [],
              beforeFileNames: [],
              afterFileNames: []
            };
          });
          if (this.headerSections[0] && this.headerSections[0].project) {
            this.project = this.headerSections[0].project;
          }
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
    async submitAllProblemUpdates() {
      if (this.isSubmittingProblemUpdates) return;
      this.isSubmittingProblemUpdates = true;
      try {
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
      } catch (error) {
        console.error("Error submitting problem updates:", error);
      } finally {
        this.isSubmittingProblemUpdates = false;
      }
    },
    triggerBeforeFileInput(header) {
      this.$refs['beforeFileInput_' + header.id][0].click();
    },
    handleBeforeFileChange(event, header) {
      const files = Array.from(event.target.files);
      if (!files.length) return;
      header.beforeFileNames = files.map(file => file.name);
      this.uploadBeforeImages(files, header);
    },
    uploadBeforeImages(files, header) {
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('files', file);
        return axios.post('http://localhost:1337/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      });
      Promise.all(uploadPromises)
        .then(responses => {
          responses.forEach(response => {
            console.log('Before image uploaded:', response.data);
            header.beforeUploadedFiles.push(...response.data);
          });
        })
        .catch(error => {
          console.error('Error uploading before images:', error);
          alert('Error uploading before images.');
        });
    },
    triggerAfterFileInput(header) {
      this.$refs['afterFileInput_' + header.id][0].click();
    },
    handleAfterFileChange(event, header) {
      const files = Array.from(event.target.files);
      if (!files.length) return;
      header.afterFileNames = files.map(file => file.name);
      this.uploadAfterImages(files, header);
    },
    uploadAfterImages(files, header) {
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('files', file);
        return axios.post('http://localhost:1337/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      });
      Promise.all(uploadPromises)
        .then(responses => {
          responses.forEach(response => {
            console.log('After image uploaded:', response.data);
            header.afterUploadedFiles.push(...response.data);
          });
        })
        .catch(error => {
          console.error('Error uploading after images:', error);
          alert('Error uploading after images.');
        });
    },
    async submitManpowerProgress() {
      if (this.isSubmittingManpowerProgress) return;
      this.isSubmittingManpowerProgress = true;
      try {
        const submitPromises = this.headerSections.map(header => {
          const payload = {
            data: {
              manpower_designation: header.manpowerDesignation,
              no_of_manpower: header.noOfManpower,
              name_of_personel: header.nameOfPersonel,
              project: this.project.id,
              before_image: header.beforeUploadedFiles.length
                ? header.beforeUploadedFiles.map(file => file.id)
                : [],
              after_image: header.afterUploadedFiles.length
                ? header.afterUploadedFiles.map(file => file.id)
                : []
            }
          };
          return axios.post('http://localhost:1337/api/manpower-progresses', payload)
            .then(() => {
              if (header.project_item_modifieds && header.project_item_modifieds.length) {
                const updatePromises = header.project_item_modifieds.map(mod => {
                  // Use documentId here instead of mod.id
                  return axios.put(`http://localhost:1337/api/project-item-modifieds/${mod.documentId}`, {
                    data: {
                      manpower_designation: header.manpowerDesignation,
                      no_of_manpower: header.noOfManpower,
                      name_of_personel: header.nameOfPersonel,
                      before_image: header.beforeUploadedFiles.length
                        ? header.beforeUploadedFiles.map(file => file.id)
                        : [],
                      after_image: header.afterUploadedFiles.length
                        ? header.afterUploadedFiles.map(file => file.id)
                        : []
                    }
                  });
                });
                return Promise.all(updatePromises);
              }
              return Promise.resolve();
            });
        });
        await Promise.all(submitPromises);
        console.log('Manpower progress and project item modifieds updated successfully.');
        alert("Manpower progress submitted and project item modifieds updated successfully!");
        this.headerSections.forEach(header => {
          header.manpowerDesignation = '';
          header.noOfManpower = null;
          header.nameOfPersonel = '';
          header.beforeUploadedFiles = [];
          header.afterUploadedFiles = [];
          header.beforeFileNames = [];
          header.afterFileNames = [];
        });
      } catch (error) {
        console.error("Error submitting manpower progress:", error);
        alert("Error submitting manpower progress. Please try again.");
      } finally {
        this.isSubmittingManpowerProgress = false;
      }
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
  background-color: #066913;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 20px;
}
button:hover {
  background-color: #065d12;
}
</style>
