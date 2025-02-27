<template>
  <div>
    <!-- Download as PDF Button -->
    <button @click="downloadPDF" class="download-btn">
      Download as PDF
    </button>
    <table class="progress-table mx-auto my-5">
      <!-- Project Header Section -->
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
            Project Location:<br />
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
        {{ header.remaining || '--' }}
          </td>
          <td class="problem-cell">
        {{ header.problem_encountered || 'No Problem Encountered' }}
          </td>
        </tr>
        <tr>
          <td colspan="3" class="table-title">Total</td>
          <td class="wt-percent">
        {{
          headerSections.reduce((acc, header) => acc + computeTotals(header).totalWTPercent, 0)
        }}%
          </td>
          <td></td>
          <td></td>
          <td class="prev-wt-percent">
        {{
          headerSections.reduce((acc, header) => acc + computeTotals(header).totalPrevWTPercents, 0)
        }}%
          </td>
          <td class="remaining-percent">
        {{ totalRemainingPercent }}
          </td>
          <td></td>
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
      </thead>
      <tbody>
        <tr v-for="progress in manpowerProgresses" :key="progress.id">
          <td></td>
          <td>{{ progress.manpower_designation }}</td>
          <td>{{ progress.no_of_manpower }}</td>
          <td>{{ progress.name_of_personel }}</td>
          <td colspan="3">{{ progress.work_done }}</td>
          <td>
            <img
              v-if="progress.before_image && progress.before_image.length"
              :src="getImageUrl(progress.before_image[0])"
              alt="Before Image"
              style="width:100px; cursor: pointer;"
              @click="openImageModal(getImageUrl(progress.before_image[0]))"
            />
          </td>
          <td>
            <img
              v-if="progress.after_image && progress.after_image.length"
              :src="getImageUrl(progress.after_image[0])"
              alt="After Image"
              style="width:100px; cursor: pointer;"
              @click="openImageModal(getImageUrl(progress.after_image[0]))"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal for Enlarged Image -->
    <div v-if="isImageModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <img :src="selectedImage" alt="Enlarged view" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
  name: "ViewWeeklyProgressReport",
  data() {
    return {
      project: {},
      headerSections: [],
      manpowerProgresses: [],
      // Modal related data properties
      isImageModalOpen: false,
      selectedImage: ''
    };
  },
  mounted() {
    // Fetch header sections (and project details) from API
    axios
      .get(`http://localhost:1337/api/header-per-project-sections?populate=*`)
      .then((response) => {
        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          this.headerSections = response.data.data.map(header => ({
            ...header,
            problem_encountered: header.problem_encountered
          }));
          if (this.headerSections[0] && this.headerSections[0].project) {
            this.project = this.headerSections[0].project;
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching project header data:", error);
      });

    // Fetch manpower progress records related to the project
    axios
      .get(`http://localhost:1337/api/manpower-progresses?populate=*`)
      .then((response) => {
        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          this.manpowerProgresses = response.data.data;
        }
      })
      .catch((error) => {
        console.error("Error fetching manpower progress data:", error);
      });
  },
  computed: {
    totalRemainingPercent() {
      return this.headerSections.reduce((acc, header) => acc + (header.remaining || 0), 0);
    }
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
    getImageUrl(image) {
      return image && image.url ? `http://localhost:1337${image.url}` : '';
    },
    openImageModal(url) {
      this.selectedImage = url;
      this.isImageModalOpen = true;
    },
    closeModal() {
      this.isImageModalOpen = false;
      this.selectedImage = '';
    },
    // New method: capture the table, reserve header space at the top for the timestamp, and generate a PDF.
    downloadPDF() {
      const margin = 20; // margin in points
      const headerMargin = 30; // space reserved at the top for the timestamp
      // Select the element containing the table using its class
      const tableElement = this.$el.querySelector('.progress-table');
      html2canvas(tableElement, { useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        // Calculate available width after margins
        const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
        // Maintain the aspect ratio of the canvas image
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        // Get current date/time and format it
        const now = new Date();
        const timestamp = now.toLocaleString();
        pdf.setFontSize(10);
        // Place the timestamp at the top (in the reserved header space)
        pdf.text(`Created on: ${timestamp}`, margin, margin + (headerMargin / 2));
        // Add the table image starting below the header
        pdf.addImage(imgData, 'PNG', margin, margin + headerMargin, pdfWidth, pdfHeight);
        pdf.save('weekly-progress-report.pdf');
      });
    }
  }
};
</script>

<style scoped>
.progress-table {
  width: 90%;
  border-collapse: collapse;
  background-color: #ffffff;
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

img {
  /* border: 1px solid #ccc; */
  border-radius: 2px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  border-radius: 4px;
}

.modal-content img {
  max-width: 100%;
  max-height: 80vh;
  display: block;
  margin: 0 auto;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

/* .red-btn {
  background: #ff0000;
  margin-left: 65px;
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  color: white;
} */

/* Styling for the Download button */
.download-btn {
  background: #ff0000;
  margin-left: 63px;
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  color: white;
}
</style>
