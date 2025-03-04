<template>
  <div>
    <!-- Download as PDF Button -->
    <button @click="downloadPDF" class="download-btn">
      Download as PDF
    </button>
    <table class="progress-table mx-auto my-5 pdf-table">
      <!-- New thead for the image -->
      <thead>
        <tr>
          <th colspan="13">
            <img src="@/assets/h0.png" alt="Header Image" class="header-image">
          </th>
        </tr>
      </thead>
      <thead>
        <tr>
          <th colspan="13" class="bgcolor table-title py-3">
            PROGRESS REPORT
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
          <!-- Display project image only if available -->
          <td v-if="project.documentId === documentId && project.image">
            <img :src="getImageUrl(project.image)" alt="Project Image" class="header-image" />
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
          <th colspan="9" class="table-title">MAN POWER PROGRESS</th>
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
          <td colspan="3">
            <!-- Display the related subDescription instead of work_done -->
            <div>{{ progress.subDescription }}</div>
            <div class="created-at" style="font-size: 0.8rem; color: gray;">
              Created on: {{ formatDate(progress.createdAt) }}
            </div>
          </td>
          <td>
            <div v-if="progress.before_image && progress.before_image.length">
              <div v-for="(image, index) in (showAllBeforeImages[progress.id] ? progress.before_image : [progress.before_image[0]])" :key="index" class="image-container">
                <!-- Display image -->
                <img
                  v-if="imageBelongsToProject(image)"
                  :src="getImageUrl(image)"
                  alt="Before Image"
                  style="width:100px; cursor: pointer; margin-bottom: 5px;"
                  @click="openImageGallery(progress.before_image)"
                />
              </div>
              <span v-if="progress.before_image.length > 1" @click="toggleShowAllImages(progress.id, 'before')">
                {{ showAllBeforeImages[progress.id] ? 'View less' : `+${progress.before_image.length - 1} more` }}
              </span>
            </div>
          </td>
          <td>
            <div v-if="progress.after_image && progress.after_image.length">
              <div v-for="(image, index) in (showAllAfterImages[progress.id] ? progress.after_image : [progress.after_image[0]])" :key="index" class="image-container">
                <!-- Display image -->
                <img
                  v-if="imageBelongsToProject(image)"
                  :src="getImageUrl(image)"
                  alt="After Image"
                  style="width:100px; cursor: pointer; margin-bottom: 5px;"
                  @click="openImageGallery(progress.after_image)"
                />
              </div>
              <span v-if="progress.after_image.length > 1" @click="toggleShowAllImages(progress.id, 'after')">
                {{ showAllAfterImages[progress.id] ? 'View less' : `+${progress.after_image.length - 1} more` }}
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal for Enlarged Image Gallery -->
    <div v-if="isImageModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="image-gallery">
          <div v-for="(image, index) in selectedImages" :key="index" class="image-item">
            <img :src="getImageUrl(image)" alt="Enlarged view" />
          </div>
        </div>
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
      isImageModalOpen: false,
      selectedImage: '',
      selectedImages: [],
      showAllBeforeImages: {},
      showAllAfterImages: {},
      // Capture documentId from route parameters
      documentId: this.$route.params.documentId
    };
  },
  mounted() {
    // Fetch header sections for the current project using documentId filter
    axios
      .get(`http://localhost:1337/api/header-per-project-sections?populate=*&filters[project][documentId][$eq]=${this.documentId}`)
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

    // Fetch project item modified records filtered by nested relation
    axios
      .get(`http://localhost:1337/api/project-item-modifieds?populate=*&filters[header_per_project_section][project][documentId][$eq]=${this.documentId}`)
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
        console.error("Error fetching project item modified data:", error);
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
    // Updated getImageUrl: simply returns the full image URL using the relative URL from Strapi API
    getImageUrl(image) {
      if (image && image.url) {
        return `http://localhost:1337${image.url}`;
      }
      return '';
    },
    // Updated imageBelongsToProject: returns true if an image URL exists (adjust as needed)
    imageBelongsToProject(image) {
      return image && image.url;
    },
    openImageModal(url) {
      this.selectedImage = url;
      this.isImageModalOpen = true;
    },
    openImageGallery(images) {
      this.selectedImages = images;
      this.isImageModalOpen = true;
    },
    closeModal() {
      this.isImageModalOpen = false;
      this.selectedImage = '';
    },
    toggleShowAllImages(progressId, type) {
      if (type === 'before') {
        this.$set(this.showAllBeforeImages, progressId, !this.showAllBeforeImages[progressId]);
      } else if (type === 'after') {
        this.$set(this.showAllAfterImages, progressId, !this.showAllAfterImages[progressId]);
      }
    },
    // Capture the table, add a small timestamp at the top-left, and generate a one-page PDF
    downloadPDF() {
      // Backup current toggle states
      const backupShowAllBeforeImages = { ...this.showAllBeforeImages };
      const backupShowAllAfterImages = { ...this.showAllAfterImages };

      // Expand all "more" sections so the full table is visible
      this.manpowerProgresses.forEach(progress => {
        this.$set(this.showAllBeforeImages, progress.id, true);
        this.$set(this.showAllAfterImages, progress.id, true);
      });

      // Wait for DOM updates before capturing the table
      this.$nextTick(() => {
        const margin = 20;  // Outer margin for PDF content
        const timestampFontSize = 8;
        const timestampHeight = 20; // Reserved height for the timestamp area

        const tableElement = this.$el.querySelector('.progress-table');

        html2canvas(tableElement, { useCORS: true }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'pt', 'a4');
          const pdfPageWidth = pdf.internal.pageSize.getWidth();
          const pdfPageHeight = pdf.internal.pageSize.getHeight();

          // Draw the timestamp at the most upper-left part with a smaller font
          const now = new Date();
          const timestamp = now.toLocaleString();
          pdf.setFontSize(timestampFontSize);
          pdf.text(`Created on: ${timestamp}`, 10, 10);

          // Define the available area below the timestamp for the table
          const availableWidth = pdfPageWidth - 2 * margin;
          const availableHeight = pdfPageHeight - margin - timestampHeight;
          const scaleWidth = availableWidth / canvas.width;
          const scaleHeight = availableHeight / canvas.height;
          const scale = Math.min(scaleWidth, scaleHeight);
          const imgWidth = canvas.width * scale;
          const imgHeight = canvas.height * scale;
          // Center the table image horizontally and vertically in the available area (below timestamp)
          const x = (pdfPageWidth - imgWidth) / 2;
          const y = timestampHeight + ((pdfPageHeight - timestampHeight) - imgHeight) / 2;

          pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
          pdf.save('weekly-progress-report.pdf');

          // Restore original toggle states
          this.showAllBeforeImages = backupShowAllBeforeImages;
          this.showAllAfterImages = backupShowAllAfterImages;
        });
      });
    },
    // Helper method to format ISO date strings
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleString();
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
  border-radius: 2px;
}

.image-container {
  display: flex;
  flex-direction: column;
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
  max-width: 90%;
  max-height: 90%;
  overflow: hidden;
}

.modal-content img {
  max-width: 100%;
  max-height: 80vh;
  display: block;
  margin: 10px auto;
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

.image-gallery {
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  max-height: 80vh;
}

.image-item {
  flex: 0 0 auto;
  margin: 10px;
}

.image-item img {
  max-width: 100%;
  max-height: 80vh;
  display: block;
}

/* Styling for the Download button */
.download-btn {
  background: #ff0000;
  margin-left: 63px;
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  color: white;
}

.header-image {
  width: 100%;
  height: auto;
}

.pdf-table {
  border: 1px solid #ddd; /* Lighter border for PDF */
}
.pdf-table th,
.pdf-table td {
  border: 1px solid #ddd; /* Lighter border for PDF */
}
</style>
