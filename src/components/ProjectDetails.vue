<template>
  <div>
    <button @click="redirectToViewWeeklyProgressReport" class="redirect-btn">
      View Weekly Progress Report
    </button>
    <!-- <button class="red-btn" onclick="window.print()">Print this page</button> -->
    <!-- New Download button -->
    <button @click="downloadPDF" class="download-btn">
      Download as PDF
    </button>
    <table ref="pdfTable" border="1" class="mx-auto my-5 pdf-table">
      <!-- New thead for the image -->
      <thead>
        <tr>
          <th colspan="14">
            <img src="@/assets/h0.png" alt="Header Image" class="header-image">
          </th>
        </tr>
      </thead>
      <thead>
        <tr>
          <th colspan="14" class="table-header">Project Details</th>
        </tr>
        <!-- New row for displaying project info -->
        <tr v-if="sections.length && sections[0].project">
          <td colspan="14" class="project-info">
            <strong>Project Name:</strong> {{ sections[0].project.projectName }} |
            <strong>Project Location:</strong> {{ sections[0].project.projectLocation }} |
            <strong>Project Sourcefund:</strong> {{ sections[0].project.sourceOfFund }}  <br>
            <strong>Start Date:</strong> {{ sections[0].project.startDate }} |
            <strong>Due Date:</strong> {{ sections[0].project.dueDate }}
          </td>
        </tr>
        <tr>
          <th rowspan="2">ITEM NO.</th>
          <th rowspan="2">DESCRIPTION</th>
          <th colspan="5">ORIGINAL CONTRACT</th>
          <th colspan="5">WORK ACCOMPLISHED</th>
          <th colspan="2">WEIGHTED % ACCOMP</th>
        </tr>
        <tr>
          <th>QTY</th>
          <th>UNIT</th>
          <th>UNIT COST</th>
          <th>AMOUNT</th>
          <th>WT.%</th>
          <th>Previous QTY</th>
          <th>Previous AMOUNT</th>
          <th>REMAINING QUANTITY</th>
          <th>TOTAL AMOUNT</th>
          <th>BALANCE</th>
          <th>PREV PERCENTAGE</th>
          <th>TOTAL</th>
        </tr>
      </thead>
      <!-- Iterate over sections with a separate tbody per section -->
      <tbody v-for="section in sections" :key="section.id">
        <tr>
          <td colspan="14" class="font-weight-bold">
            {{ section.letter_label_for_item_no }}
          </td>
        </tr>
        <!-- Display the header for the section -->
        <tr>
          <td colspan="14" class="font-weight-bold">
            {{ section.header_per_project_section }}
          </td>
        </tr>
        <!-- Display the progress bar for the section using computed progress percentage -->
        <tr>
          <td colspan="14">
            <v-progress-linear
              :value="getProgressPercentage(section)"
              :color="getProgressColor(getSumWtPercent(section), getSectionTotalWt(section))"
              height="20"
              striped
            >
              <template v-slot:default>
                <strong>{{ formatDecimal(getSumWtPercent(section)) }}/{{ formatDecimal(getSectionTotalWt(section)) }}</strong>
              </template>
            </v-progress-linear>
          </td>
        </tr>
        <tr>
          <td colspan="14" class="font-italic">
            {{ section.mainDescription }}
          </td>
        </tr>
        <!-- Main item rows -->
        <tr v-for="item in section.items" :key="'item-' + item.id">
          <td>{{ item.itemno }}</td>
          <!-- Added click event and cursor style for toggling material details -->
          <td @click="toggleMaterialDetails(section.id, item.itemno)" style="cursor: pointer;">
            {{ item.subDescription }}
          </td>
          <td>{{ formatNumber(getTotalMaterialQuantity(section.id, item.itemno)) }}</td> <!-- Changed code -->
          <td>{{ item.unit }}</td>
          <td>{{ formatNumber(item.unitCost) }}</td>
          <td>{{ formatNumber(getTotalAmount(section.id, item.itemno)) }}</td> <!-- Changed code -->
          <td>{{ formatNumber(item.wt_percent) }}</td>
          <!-- Previous QTY from P_EnteredQuantity -->
          <td>{{ formatNumber(getPreviousQty(section.id, item.itemno)) }}</td>
          <!-- Previous AMOUNT as previous qty * unit cost -->
          <td>{{ formatNumber(calculatePreviousAmount(section.id, item)) }}</td>
          <!-- REMAINING QUANTITY from project_item_modifieds -->
          <td>{{ formatNumber(getModifiedQuantity(section.id, item.itemno)) }}</td>
          <!-- TOTAL AMOUNT computed as P_EnteredQuantity * unitCost -->
          <td>{{ formatNumber(getTotalAmount(section.id, item.itemno)) }}</td>
          <!-- BALANCE displays the updated "amount" from project_item_modifieds -->
          <td>{{ formatNumber(getModifiedAmount(section.id, item.itemno)) }}</td>
          <!-- PREV PERCENTAGE displays the value of P_EnteredQuantity -->
          <td>{{ formatNumber(getPreviousPercentage(section.id, item.itemno)) }}%</td>
          <td>{{ formatNumber(getPreviousPercentage(section.id, item.itemno)) }}%</td>
        </tr>
        <!-- New row: Show material_modifieds details for expanded items -->
        <tr
          v-for="item in section.items.filter(i => expandedItems[`${section.id}-${i.itemno}`])"
          :key="'material-details-' + item.id"
        >
          <td colspan="14">
            <table class="material-table" border="1">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Material Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(material, index) in getMaterialModifieds(section.id, item.itemno)"
                  :key="'material-' + index"
                >
                  <td>{{ material.material }}</td>
                  <td>{{ material.quantity }}</td>
                  <td>{{ material.unit }}</td>
                  <td>{{ material.price }}</td>
                  <td>{{ formatNumber(material.quantity * material.price) }}</td>
                </tr>
                <tr v-if="getMaterialModifieds(section.id, item.itemno).length === 0">
                  <td colspan="5">No materials available</td>
                </tr>
                <!-- New row for sub-total -->
                <tr>
                  <td colspan="4" class="font-weight-bold">Sub-total</td>
                  <td class="font-weight-bold">
                    {{ formatNumber(getMaterialModifieds(section.id, item.itemno).reduce((sum, material) => sum + (material.quantity * material.price), 0)) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
      <!-- TOTAL and Toggle Project Workers Row -->
      <tfoot>
        <tr class="font-weight-bold bg-light">
          <td colspan="5">TOTAL</td>
          <td>{{ formatNumber(totalAmount) }}</td>
          <td>{{ formatNumber(totalWtPercent) }}</td>
          <td></td>
          <td>{{ formatNumber(totalPreviousAmount) }}</td>
          <td></td>
          <td>{{ formatNumber(totalTotalAmount) }}</td>
          <td></td>
          <td>{{ formatNumber(totalPrevPercentage) }}%</td>
          <td>{{ formatNumber(totalPrevPercentage) }}%</td>
        </tr>
        <!-- Toggle row -->
        <tr @click="toggleProjectWorkers" style="cursor: pointer; background: #f0f0f0;">
          <td colspan="14">
            <strong>Project Workers (click to toggle)</strong>
          </td>
        </tr>
        <!-- Nested table for Project Workers (shown only when toggled) -->
        <tr v-if="showProjectWorkers">
          <td colspan="14">
            <table class="workers-table" border="1">
              <thead>
                <tr>
                  <th>Labor Requirements</th>
                  <th>Name</th>
                  <th>Manpower</th>
                  <th>Days</th>
                  <th>Rate Per Day</th>
                  <th>Labor Cost</th> <!-- New column header -->
                </tr>
              </thead>
              <tbody>
                <tr v-for="worker in projectWorkers" :key="worker.id">
                  <td>{{ worker.laborRequirments }}</td>
                  <td>{{ worker.name }}</td>
                  <td>{{ worker.manpower }}</td>
                  <td>{{ worker.days }}</td>
                  <td>{{ worker.ratePerDay }}</td>
                  <td>{{ formatNumber(worker.ratePerDay * worker.days) }}</td> <!-- New column data -->
                </tr>
                <!-- New row for subtotal -->
                <tr class="font-weight-bold">
                  <td colspan="5">Subtotal Labor Cost</td>
                  <td>{{ formatNumber(totalLaborCost) }}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
  name: 'ProjectDetails',
  data() {
    return {
      sections: [],
      projectItemModifieds: [],
      // Tracking expanded material rows
      expandedItems: {},
      // Project workers and toggle flag
      projectWorkers: [],
      showProjectWorkers: false
    };
  },
  computed: {
    totalAmount() {
      return this.sections.reduce((sum, section) => {
        return sum + section.items.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);
      }, 0);
    },
    totalWtPercent() {
      return this.sections.reduce((sum, section) => {
        return sum + section.items.reduce((acc, item) => acc + parseFloat(item.wt_percent || 0), 0);
      }, 0);
    },
    totalPreviousAmount() {
      return this.sections.reduce((sum, section) => {
        return sum + section.items.reduce((acc, item) => acc + parseFloat(this.calculatePreviousAmount(section.id, item)), 0);
      }, 0);
    },
    totalTotalAmount() {
      return this.sections.reduce((sum, section) => {
        return sum + section.items.reduce((acc, item) => {
          return acc + parseFloat(this.getTotalAmount(section.id, item.itemno));
        }, 0);
      }, 0);
    },
    totalPrevPercentage() {
      return this.sections.reduce((sum, section) => {
        return sum + section.items.reduce((acc, item) => acc + parseFloat(this.getPreviousPercentage(section.id, item.itemno)), 0);
      }, 0);
    },
    totalLaborCost() {
      return this.projectWorkers.reduce((sum, worker) => {
        return sum + (worker.ratePerDay * worker.days);
      }, 0);
    }
  },
  methods: {
    async fetchData() {
      const documentId = this.$route.params.documentId;
      try {
        const response = await axios.get(
          `http://localhost:1337/api/header-per-project-sections?populate=*&&filters[project][documentId][$eq]=${documentId}`
        );
        if (response.data && response.data.data.length > 0) {
          this.sections = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    async fetchProjectItemModifieds() {
      try {
        const response = await axios.get("http://localhost:1337/api/project-item-modifieds?populate=*");
        if (response.data && response.data.data) {
          this.projectItemModifieds = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching project item modifieds:', error);
      }
    },
    // Fetch project workers based on the open project's documentId
    async fetchProjectWorkers() {
      const documentId = this.$route.params.documentId;
      try {
        const response = await axios.get("http://localhost:1337/api/projects?populate=*");
        if (response.data && response.data.data) {
          const project = response.data.data.find(p => p.documentId === documentId);
          if (project && project.project_workers) {
            this.projectWorkers = project.project_workers;
          }
        }
      } catch (error) {
        console.error('Error fetching project workers:', error);
      }
    },
    updateProjectItemModifiedAmounts() {
      this.sections.forEach(section => {
        section.project_item_modifieds = this.projectItemModifieds.filter(mod => {
          return mod.header_per_project_section && mod.header_per_project_section.id === section.id;
        });
      });
    },
    getPreviousQty(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      return modifiedItem ? parseFloat(modifiedItem.P_EnteredQuantity) || 0 : 0;
    },
    getModifiedQuantity(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      return modifiedItem ? parseFloat(modifiedItem.quantity) || 0 : 0;
    },
    getModifiedAmount(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      return modifiedItem ? parseFloat(modifiedItem.amount) || 0 : 0;
    },
    calculatePreviousAmount(sectionId, item) {
      const previousQty = this.getPreviousQty(sectionId, item.itemno);
      const unitCost = parseFloat(item.unitCost) || 0;
      return previousQty * unitCost;
    },
    getPreviousPercentage(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      return modifiedItem ? parseFloat(modifiedItem.p_wt_percent) || 0 : 0;
    },
    getTotalAmount(sectionId, itemno) {
      const materials = this.getMaterialModifieds(sectionId, itemno);
      const materialCost = materials.reduce((sum, material) => sum + (material.quantity * material.price), 0);
      const laborCost = this.projectWorkers.reduce((sum, worker) => sum + (worker.ratePerDay * worker.days), 0);
      return materialCost + laborCost;
    },
    // Get material_modifieds for a specific item
    getMaterialModifieds(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return [];
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      return modifiedItem && modifiedItem.material_modifieds
        ? modifiedItem.material_modifieds
        : [];
    },
    // Toggle display of material details
    toggleMaterialDetails(sectionId, itemno) {
      const key = `${sectionId}-${itemno}`;
      this.$set(this.expandedItems, key, !this.expandedItems[key]);
    },
    // Toggle the project workers nested table
    toggleProjectWorkers() {
      this.showProjectWorkers = !this.showProjectWorkers;
    },
    formatDecimal(value) {
      if (value === null || value === undefined || isNaN(value)) return '0.00';
      return parseFloat(value).toFixed(2);
    },
    formatNumber(value) {
      if (value === null || value === undefined || isNaN(value)) return '0.00';
      return parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    redirectToViewWeeklyProgressReport() {
      const documentId = this.$route.params.documentId;
      this.$router.push({ name: 'ViewWeeklyProgressReport', params: { documentId } });
    },
    getSumWtPercent(section) {
      if (section.project_item_modifieds && section.project_item_modifieds.length > 0) {
        return section.project_item_modifieds.reduce((sum, modItem) => {
          return sum + (parseFloat(modItem.sum_wt_percent) || 0);
        }, 0);
      }
      return 0;
    },
    getSectionTotalWt(section) {
      if (section.items && section.items.length > 0) {
        return section.items.reduce((sum, item) => {
          return sum + (parseFloat(item.wt_percent) || 0);
        }, 0);
      }
      return 0;
    },
    getProgressColor(progress, total) {
      if (progress >= total) return 'green';
      if (progress < total * 0.3) return 'red';
      if (progress < total * 0.7) return 'orange';
      return 'green';
    },
    // Compute progress percentage for the progress bar.
    getProgressPercentage(section) {
      const total = this.getSectionTotalWt(section);
      if (total === 0) return 0;
      return (this.getSumWtPercent(section) / total) * 100;
    },
    // Capture the table and generate a PDF.
    downloadPDF() {
      const margin = 20; // margin in points
      const headerMargin = 30; // space reserved at the top for the timestamp
      const tableElement = this.$refs.pdfTable;
      html2canvas(tableElement, { useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const now = new Date();
        const timestamp = now.toLocaleString();
        pdf.setFontSize(10);
        pdf.text(`Created on: ${timestamp}`, margin, margin + (headerMargin / 2));
        pdf.addImage(imgData, 'PNG', margin, margin + headerMargin, pdfWidth, pdfHeight);
        pdf.save('project-details.pdf');
      });
    },
    getTotalMaterialQuantity(sectionId, itemno) {
      const materials = this.getMaterialModifieds(sectionId, itemno);
      return materials.reduce((sum, material) => sum + parseFloat(material.quantity || 0), 0);
    }
  },
  mounted() {
    Promise.all([
      this.fetchData(),
      this.fetchProjectItemModifieds(),
      this.fetchProjectWorkers()
    ])
      .then(() => {
        this.updateProjectItemModifiedAmounts();
      })
      .catch(error => {
        console.error('Error in mounted hook:', error);
      });
  }
};
</script>

<style scoped>
th,
td {
  padding: 4px;
  text-align: center;
  font-size: 15px;
}
th {
  background-color: #f4f4f4;
}
table {
  background-color: #ffffff;
  max-width: 90%;
  margin: auto;
  border-collapse: collapse;
}
.table-header {
  background-color: rgb(239, 213, 40);
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 10px;
}
.project-info {
  font-weight: normal;
  font-size: 16px;
  padding: 8px;
}
.font-weight-bold {
  font-weight: bold;
  background-color: #e0e0e0;
}
.font-italic {
  font-style: italic;
}
.bg-light {
  background-color: #f8f9fa;
}
.redirect-btn {
  background: #012b86;
  margin-left: 63px;
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  color: white;
}
.download-btn {
  background: #ff0000;
  margin-left: 10px;
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  color: white;
}
.pdf-table {
  border: 1px solid #ddd;
}
.pdf-table th,
.pdf-table td {
  border: 1px solid #ddd;
}
.header-image {
  width: 100%;
  height: auto;
}
/* Styling for the nested material table */
.material-table {
  width: 100%;
  margin-top: 5px;
  border-collapse: collapse;
}
.material-table th,
.material-table td {
  padding: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
}
/* Styling for the project workers nested table */
.workers-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.workers-table th,
.workers-table td {
  padding: 8px;
  border: 1px solid #ddd;
  font-size: 15px;
  text-align: center;
}
</style>
