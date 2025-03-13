<template>
  <div>
    <button @click="redirectToViewWeeklyProgressReport" class="redirect-btn">
      View Weekly Progress Report
    </button>
    <button @click="downloadPDF" class="download-btn">
      Download as PDF
    </button>
    <!-- Responsive container with side margins -->
    <div class="table-container">
      <table ref="pdfTable" border="1" class="mx-auto my-5 pdf-table">
        <thead>
          <tr>
            <!-- Updated colspan from 22 to 26 -->
            <th colspan="26">
              <img src="@/assets/h0.png" alt="Header Image" class="header-image">
            </th>
          </tr>
        </thead>
        <thead>
          <tr>
            <th rowspan="2">ITEM NO.</th>
            <th rowspan="2">DESCRIPTION</th>
            <th colspan="7">ORIGINAL CONTRACT</th>
            <!-- Updated colspan: previously 14, now 17 columns for WORK ACCOMPLISHED -->
            <th colspan="17">WORK ACCOMPLISHED</th>
          </tr>
          <tr>
            <!-- ORIGINAL CONTRACT columns -->
            <th>QTY</th>
            <th>UNIT</th>
            <th>UNIT COST</th>
            <th>MATERIAL</th>
            <th>LABOR</th>
            <th>AMOUNT</th>
            <th>WT.%</th>
            <!-- WORK ACCOMPLISHED columns -->
            <!-- The next two columns now display the summed values from the API -->
            <th>PREVIOUS MATERIAL</th>
            <th>PRESENT MATERIAL</th>
            <th>REMAINING MATERIAL</th>
            <th>PREVIOS LABOR</th>
            <th>PRESENT LABOR</th>
            <th>REMAINING LABOR</th>
            <!-- New columns inserted between REMAINING LABOR and Previous QTY -->
            <th>PREVIOUS</th>
            <th>ACTUAL MATERIALS</th>
            <th>REMAINING</th>
            <th>RESEREVE</th>
            <!-- Existing columns shifted accordingly -->
            <th>Previous QTY</th>
            <th>Previous AMOUNT</th>
            <th>REMAINING QUANTITY</th>
            <th>TOTAL AMOUNT</th>
            <th>BALANCE</th>
            <th>PREV PERCENTAGE</th>
            <th>WEIGHTED % ACCOMP</th>
          </tr>
        </thead>
        <tbody v-for="section in sections" :key="section.id">
          <tr>
            <td colspan="26" class="font-weight-bold">
              {{ section.letter_label_for_item_no }}
            </td>
          </tr>
          <tr>
            <td colspan="26" class="font-weight-bold">
              {{ section.header_per_project_section }}
            </td>
          </tr>
          <tr>
            <td colspan="26">
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
            <td colspan="26" class="font-italic">
              {{ section.mainDescription }}
            </td>
          </tr>
          <tr v-for="item in section.items" :key="'item-' + item.id">
            <td>{{ item.itemno }}</td>
            <td @click="toggleMaterialDetails(section.id, item.itemno)" style="cursor: pointer;">
              {{ item.subDescription }}
            </td>
            <td>{{ formatNumberWithCommas(getMaterialModifieds(section.id, item.itemno).reduce((sum, material, index) => sum + getMaterialQuantityFromMaterials(section.id, item.itemno, index), 0)) }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ formatNumberWithCommas(item.unitCost) }}</td>
            <td>{{ formatNumberWithCommas(getMaterialCost(section.id, item.itemno)) }}</td>
            <td>{{ formatNumberWithCommas(getLaborCost()) }}</td>
            <td>{{ formatNumberWithCommas(getMaterialCost(section.id, item.itemno) + getLaborCost()) }}</td>
            <td>{{ formatNumberWithCommas(item.wt_percent) }}</td>
            <!-- These two columns now display the summed values -->
            <td>{{ formatNumberWithCommas(item.previousMaterial) }}</td>
            <td>{{ formatNumberWithCommas(item.presentMaterial) }}</td>
            <td>{{ formatNumberWithCommas(getRemainingMaterialSum(section.id, item.itemno)) }}</td>
            <td>{{ formatNumberWithCommas(item.previousLabor) }}</td>
            <td>{{ formatNumberWithCommas(item.presentLabor) }}</td>
            <td>{{ formatNumberWithCommas(item.remainingLabor) }}</td>
            <!-- New columns added for table structure -->
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <!-- Existing columns shifted accordingly -->
            <td>{{ formatNumberWithCommas(getPreviousQty(section.id, item.itemno)) }}</td>
            <td>{{ formatNumberWithCommas(calculatePreviousAmount(section.id, item)) }}</td>
            <td>{{ formatNumberWithCommas(getModifiedQuantity(section.id, item.itemno)) }}</td>
            <td>{{ formatNumberWithCommas(getTotalAmount(section.id, item.itemno)) }}</td>
            <td>{{ formatNumberWithCommas(getModifiedAmount(section.id, item.itemno)) }}</td>
            <td>{{ formatNumberWithCommas(getPreviousPercentage(section.id, item.itemno)) }}%</td>
            <td>{{ formatNumberWithCommas(getPreviousPercentage(section.id, item.itemno)) }}%</td>
          </tr>
          <tr
            v-for="item in section.items.filter(i => expandedItems[`${section.id}-${i.itemno}`])"
            :key="'material-details-' + item.id"
          >
            <td colspan="26">
              <table class="material-table" border="1">
                <thead>
                  <tr>
                    <th>Input</th>
                    <th>Material</th>
                    <th>Unit</th>
                    <!-- Updated: now fetching quantity from the API’s “materials” array -->
                    <th>Quantity</th>
                    <th>Remaining</th> 
                    <th>Price</th>
                    <th>Material Cost</th>
                    <th>Remaining</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(material, index) in getMaterialModifieds(section.id, item.itemno)"
                    :key="'material-' + index"
                  >
                    <td style="width: 100px;">
                      <input
                        type="number"
                        v-model.number="material.inputField"
                        placeholder="Enter value"
                      />
                    </td>
                    <td>{{ material.material }}</td>
                    <td>{{ material.unit }}</td>
                    <!-- Use the new helper method to get the quantity from "materials" -->
                    <td>{{ formatNumberWithCommas(getMaterialQuantityFromMaterials(section.id, item.itemno, index)) }}</td>
                    <td>{{ formatNumberWithCommas(material.remainingquantity) }}</td>
                    <td>{{ formatNumberWithCommas(material.price) }}</td>
                    <td>{{ formatNumberWithCommas(getMaterialQuantityFromMaterials(section.id, item.itemno, index) * material.price) }}</td>
                    <td>{{ formatNumberWithCommas(material.remainingsubtotal) }}</td>
                    <td>
                      <button @click="updateMaterial(material)">Update</button>
                    </td>
                  </tr>
                  <tr v-if="getMaterialModifieds(section.id, item.itemno).length === 0">
                    <td colspan="9">No materials available</td>
                  </tr>
                  <tr>
                    <td colspan="6" class="font-weight-bold">Sub-total</td>
                    <td class="font-weight-bold">
                      {{ formatNumberWithCommas(
                          getMaterialModifieds(section.id, item.itemno).reduce(
                            (sum, material, index) => sum + (getMaterialQuantityFromMaterials(section.id, item.itemno, index) * material.price),
                            0
                          )
                        ) }}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <!--
          <tr class="font-weight-bold bg-light">
            <td colspan="9">TOTAL</td>
            <td>{{ formatNumber(totalAmount) }}</td>
            <td>{{ formatNumber(totalWtPercent) }}</td>
            <td colspan="8"></td>
            <td>{{ formatNumber(totalPreviousAmount) }}</td>
            <td>{{ formatNumber(totalTotalAmount) }}</td>
            <td>{{ formatNumber(totalPrevPercentage) }}%</td>
            <td>{{ formatNumber(totalPrevPercentage) }}%</td>
          </tr>
          -->
          <tr @click="toggleProjectWorkers" style="cursor: pointer; background: #f0f0f0;">
            <td colspan="26">
              <strong>Project Workers (click to toggle)</strong>
            </td>
          </tr>
          <tr v-if="showProjectWorkers">
            <td colspan="26">
              <table class="workers-table" border="1">
                <thead>
                  <tr>
                    <th>Labor Requirements</th>
                    <th>Name</th>
                    <th>Manpower</th>
                    <th>Days</th>
                    <th>Rate Per Day</th>
                    <th>Labor Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="worker in projectWorkers" :key="worker.id">
                    <td>{{ worker.laborRequirments }}</td>
                    <td>{{ worker.name }}</td>
                    <td>{{ worker.manpower }}</td>
                    <td>{{ worker.days }}</td>
                    <td>{{ worker.ratePerDay }}</td>
                    <td>{{ formatNumber(worker.ratePerDay * worker.days) }}</td>
                  </tr>
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
      expandedItems: {},
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
    getMaterialModifieds(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return [];
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      if (!modifiedItem || !modifiedItem.material_modifieds) return [];
      // Ensure each material has reactive properties added.
      modifiedItem.material_modifieds.forEach(material => {
        if (material.inputField === undefined) {
          this.$set(material, 'inputField', 0);
        }
        if (material.remainingquantity === undefined) {
          this.$set(material, 'remainingquantity', material.quantity);
        }
        if (material.remainingsubtotal === undefined) {
          this.$set(material, 'remainingsubtotal', material.subtotal);
        }
      });
      return modifiedItem.material_modifieds;
    },
    // New helper method to get the quantity from the "materials" array in the API response
    getMaterialQuantityFromMaterials(sectionId, itemno, index) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      if (!modifiedItem || !modifiedItem.materials) return 0;
      return modifiedItem.materials[index] ? modifiedItem.materials[index].quantity : 0;
    },
    getRemainingMaterialSum(sectionId, itemno) {
      const materials = this.getMaterialModifieds(sectionId, itemno);
      return materials.reduce((sum, material) => sum + parseFloat(material.remainingquantity || 0), 0);
    },
    toggleMaterialDetails(sectionId, itemno) {
      const key = `${sectionId}-${itemno}`;
      this.$set(this.expandedItems, key, !this.expandedItems[key]);
    },
    toggleProjectWorkers() {
      this.showProjectWorkers = !this.showProjectWorkers;
    },
    // Format number to 2 decimal places.
    formatDecimal(value) {
      if (value === null || value === undefined || isNaN(value)) return '0.00';
      return parseFloat(value).toFixed(2);
    },
    // Format number to 2 decimal places.
    formatNumber(value) {
      if (value === null || value === undefined || isNaN(value)) return '0.00';
      return parseFloat(value).toFixed(2);
    },
    formatNumberWithCommas(value) {
      if (value === null || value === undefined || isNaN(value)) return '0';
      const formattedValue = parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return formattedValue.endsWith('.00') ? formattedValue.slice(0, -3) : formattedValue;
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
    getProgressPercentage(section) {
      const total = this.getSectionTotalWt(section);
      if (total === 0) return 0;
      return (this.getSumWtPercent(section) / total) * 100;
    },
    downloadPDF() {
      const margin = 20;
      const headerMargin = 30;
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
    },
    getMaterialCost(sectionId, itemno) {
      const materials = this.getMaterialModifieds(sectionId, itemno);
      return materials.reduce((sum, material, index) => sum + (this.getMaterialQuantityFromMaterials(sectionId, itemno, index) * material.price), 0);
    },
    getLaborCost() {
      return this.projectWorkers.reduce((sum, worker) => sum + (worker.ratePerDay * worker.days), 0);
    },
    async updateMaterial(material) {
      let inputVal = parseFloat(material.inputField);
      if (isNaN(inputVal)) {
        inputVal = 0;
      }
      if (inputVal < 0) {
        alert("Please enter a valid non-negative number.");
        return;
      }
      const newRemainingQuantity = parseFloat(material.remainingquantity) - inputVal;
      const newRemainingSubtotal = parseFloat(material.remainingsubtotal) - (inputVal * parseFloat(material.price));
      
      try {
        const getResModified = await axios.get(
          `http://localhost:1337/api/material-modifieds?populate=*&filters[documentId][$eq]=${material.documentId}`
        );
        if (getResModified.data && getResModified.data.data && getResModified.data.data.length > 0) {
          const recordModified = getResModified.data.data[0];
          await axios.put(
            `http://localhost:1337/api/material-modifieds/${recordModified.documentId}`,
            {
              data: {
                quantity: newRemainingQuantity,
                subtotal: newRemainingSubtotal,
                entered_quantity: inputVal,
                previous_entered: inputVal
              }
            }
          );
        } else {
          alert("Material-modified record not found.");
        }
        
        material.remainingquantity = newRemainingQuantity;
        material.remainingsubtotal = newRemainingSubtotal;
        alert("Material updated successfully!");
      } catch (error) {
        console.error("Error updating material:", error);
        alert("Update failed. Please try again.");
      }
    },
    async updateItemMaterialSums() {
      for (const section of this.sections) {
        for (const item of section.items) {
          let sumEntered = 0;
          let sumPrevious = 0;
          const materials = this.getMaterialModifieds(section.id, item.itemno);
          for (const material of materials) {
            try {
              const response = await axios.get(
                `http://localhost:1337/api/material-modifieds?populate=*&filters[documentId][$eq]=${material.documentId}`
              );
              if (response.data && response.data.data) {
                response.data.data.forEach(record => {
                  sumEntered += Number(record.entered_quantity) || 0;
                  sumPrevious += Number(record.previous_entered) || 0;
                });
              }
            } catch (error) {
              console.error("Error fetching material sums for documentId", material.documentId, error);
            }
          }
          this.$set(item, 'presentMaterial', sumEntered);
          this.$set(item, 'previousMaterial', sumPrevious);
        }
      }
    },
    // New method to update weight percentage based on material count.
    updateWeightPercent() {
      let globalMaterialCount = 0;
      // Count the total number of material rows.
      this.sections.forEach(section => {
        section.items.forEach(item => {
          const localMaterialCount = this.getMaterialModifieds(section.id, item.itemno).length;
          globalMaterialCount += localMaterialCount;
        });
      });
      if (globalMaterialCount === 0) return;
      const factor = 100 / globalMaterialCount;
      // Update each item's wt_percent based on its material count.
      this.sections.forEach(section => {
        section.items.forEach(item => {
          const localMaterialCount = this.getMaterialModifieds(section.id, item.itemno).length;
          const newWtPercent = factor * localMaterialCount;
          this.$set(item, 'wt_percent', newWtPercent);
        });
      });
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
        this.updateItemMaterialSums();
        this.updateWeightPercent();
      })
      .catch(error => {
        console.error('Error in mounted hook:', error);
      });
  }
};
</script>

<style scoped>
.table-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 10px;
  overflow-x: auto;
}

table {
  width: 100%;
  background-color: #ffffff;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  padding: 4px;
  text-align: center;
  font-size: 12px;
  word-wrap: break-word;
}

th {
  background-color: #f4f4f4;
}

.table-header {
  background-color: rgb(239, 213, 40);
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  padding: 8px;
}

.project-info {
  font-weight: normal;
  font-size: 10px;
  padding: 6px;
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
  margin-left: 50px;
  margin-top: 8px;
  padding: 8px;
  border-radius: 5px;
  color: white;
  font-size: 12px;
}

.download-btn {
  background: #ff0000;
  margin-left: 8px;
  margin-top: 8px;
  padding: 8px;
  border-radius: 5px;
  color: white;
  font-size: 12px;
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
  height: 140px;
  padding-left: 10px;
  padding-right: 10px;
  background-color: #ffffff;
}

.material-table {
  width: 100%;
  margin-top: 5px;
  border-collapse: collapse;
}

.material-table th,
.material-table td {
  padding: 4px;
  border: 1px solid #ccc;
  font-size: 11px;
}

.workers-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.workers-table th,
.workers-table td {
  padding: 6px;
  border: 1px solid #ddd;
  font-size: 12px;
  text-align: center;
}
</style>
