<template>
  <div>
    <button @click="redirectToViewWeeklyProgressReport" class="redirect-btn">
      View Weekly Progress Report
    </button>
    <!-- <button class="red-btn" onclick="window.print()">Print this page</button> -->
    <button @click="downloadPDF" class="download-btn">
      Download as PDF
    </button>
    <table ref="pdfTable" border="1" class="mx-auto my-5 pdf-table">
      <!-- Header with image -->
      <thead>
        <tr>
          <th colspan="8">
            <img src="@/assets/h0.png" alt="Header Image" class="header-image" />
          </th>
        </tr>
      </thead>
      <thead>
        <tr>
          <th rowspan="2">ITEM NO.</th>
          <th rowspan="2">DESCRIPTION</th>
          <th colspan="5">ORIGINAL CONTRACT</th>
          <th rowspan="2">Actions</th>
        </tr>
        <tr>
          <th>QTY</th>
          <th>UNIT</th>
          <th>UNIT COST</th>
          <th>AMOUNT</th>
          <th>WT.%</th>
        </tr>
        <tr v-if="sections.length && sections[0].project">
          <td colspan="8" class="project-info">
            <strong>Project Name:</strong> {{ sections[0].project.projectName }} |
            <strong>Project Location:</strong> {{ sections[0].project.projectLocation }} |
            <strong>Project Sourcefund:</strong> {{ sections[0].project.sourceOfFund }}<br>
            <strong>Start Date:</strong> {{ sections[0].project.startDate }} |
            <strong>Due Date:</strong> {{ sections[0].project.dueDate }}
          </td>
        </tr>
      </thead>
      <!-- Sections -->
      <tbody v-for="section in sections" :key="section.id">
        <!-- Section header: letter label and main description with edit option -->
        <tr>
          <td colspan="8" class="font-weight-bold">
            <template v-if="isEditingSection(section.id)">
              <input
                v-model="editingSectionData[section.id].letter_label_for_item_no"
                type="text"
                style="text-align: center;"
              />
              <v-btn icon small color="success" @click="saveSectionEdit(section.id)">
                <v-icon small>mdi-check</v-icon>
              </v-btn>
              <v-btn icon small color="grey" @click="cancelSectionEdit(section.id)">
                <v-icon small>mdi-close</v-icon>
              </v-btn>
            </template>
            <template v-else>
              {{ section.letter_label_for_item_no }}
              <v-btn icon small color="primary" @click="editSection(section)">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon small color="red" @click="deleteSection(section.id)">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </template>
          </td>
        </tr>
        <tr class="font-italic">
          <td colspan="8">
            <template v-if="isEditingSection(section.id)">
              <input
                v-model="editingSectionData[section.id].mainDescription"
                type="text"
                style="text-align: center;"
              />
            </template>
            <template v-else>
              {{ section.mainDescription }}
            </template>
          </td>
        </tr>
        <!-- Existing rows with edit capability -->
        <tr v-for="item in section.items" :key="'item-' + item.itemno">
          <td>
            <template v-if="isEditing(section.id, item.itemno)">
              <input
                v-model="editingRowData[editKey(section.id, item.itemno)].itemno"
                type="text"
              />
            </template>
            <template v-else>
              {{ item.itemno }}
            </template>
          </td>
          <td>
            <template v-if="isEditing(section.id, item.itemno)">
              <input
                v-model="editingRowData[editKey(section.id, item.itemno)].subDescription"
                type="text"
              />
            </template>
            <template v-else>
              {{ item.subDescription }}
            </template>
          </td>
          <td>
            <template v-if="isEditing(section.id, item.itemno)">
              <input
                v-model.number="editingRowData[editKey(section.id, item.itemno)].quantity"
                type="number"
              />
            </template>
            <template v-else>
              {{ formatNumber(item.quantity) }}
            </template>
          </td>
          <td>
            <template v-if="isEditing(section.id, item.itemno)">
              <input
                v-model="editingRowData[editKey(section.id, item.itemno)].unit"
                type="text"
              />
            </template>
            <template v-else>
              {{ item.unit }}
            </template>
          </td>
          <td>
            <template v-if="isEditing(section.id, item.itemno)">
              <input
                v-model.number="editingRowData[editKey(section.id, item.itemno)].unitCost"
                type="number"
              />
            </template>
            <template v-else>
              {{ formatNumber(item.unitCost) }}
            </template>
          </td>
          <td>
            <template v-if="isEditing(section.id, item.itemno)">
              <input
                v-model.number="editingRowData[editKey(section.id, item.itemno)].amount"
                type="number"
              />
            </template>
            <template v-else>
              {{ formatNumber(item.amount) }}
            </template>
          </td>
          <td>
            <template v-if="isEditing(section.id, item.itemno)">
              <input
                v-model.number="editingRowData[editKey(section.id, item.itemno)].wt_percent"
                type="number"
              />
            </template>
            <template v-else>
              {{ formatNumber(item.wt_percent) }}
            </template>
          </td>
          <td>
            <template v-if="isEditing(section.id, item.itemno)">
              <v-btn icon small color="success" @click="saveEdit(section.id, item.itemno)">
                <v-icon small>mdi-check</v-icon>
              </v-btn>
              <v-btn icon small color="grey" @click="cancelEdit(section.id, item.itemno)">
                <v-icon small>mdi-close</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-btn icon small color="primary" @click="editRow(section.id, item)">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon small color="red" @click="deleteRow(section.id, item.itemno)">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </template>
          </td>
        </tr>
        <!-- Button to add a new row -->
        <tr v-if="!newRowData[section.id]">
          <td colspan="8" class="text-center">
            <v-btn icon small color="success" @click="enableNewRow(section.id)">
              <v-icon small>mdi-plus</v-icon>
            </v-btn>
          </td>
        </tr>
        <!-- New row input fields -->
        <tr v-if="newRowData[section.id]">
          <td>
            <input v-model="newRowData[section.id].itemno" type="text" placeholder="Item No." />
          </td>
          <td>
            <input v-model="newRowData[section.id].subDescription" type="text" placeholder="Description" />
          </td>
          <td>
            <input v-model.number="newRowData[section.id].quantity" type="number" placeholder="Quantity" />
          </td>
          <td>
            <input v-model="newRowData[section.id].unit" type="text" placeholder="Unit" />
          </td>
          <td>
            <input v-model.number="newRowData[section.id].unitCost" type="number" placeholder="Unit Cost" />
          </td>
          <td>
            <input v-model.number="newRowData[section.id].amount" type="number" placeholder="Amount" />
          </td>
          <td>
            <input v-model.number="newRowData[section.id].wt_percent" type="number" placeholder="WT.%" />
          </td>
          <td>
            <div class="row-actions">
              <v-btn icon small color="success" @click="saveNewRow(section.id)">
                <v-icon small>mdi-check</v-icon>
              </v-btn>
              <v-btn icon small color="grey" @click="cancelNewRow(section.id)">
                <v-icon small>mdi-close</v-icon>
              </v-btn>
            </div>
          </td>
        </tr>
      </tbody>
      <!-- TOTAL Row -->
      <tfoot>
        <tr class="font-weight-bold bg-light">
          <td colspan="5">TOTAL</td>
          <td>{{ formatNumber(totalAmount) }}</td>
          <td>{{ formatNumber(totalWtPercent) }}</td>
          <td></td>
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
  name: 'EditProject',
  data() {
    return {
      sections: [],
      projectItemModifieds: [],
      // Temporary storage for new rows (keyed by section id)
      newRowData: {},
      // Temporary storage for editing item rows (keyed by "sectionId-itemno")
      editingRowData: {},
      // Temporary storage for editing section fields (keyed by section id)
      editingSectionData: {}
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
        return sum + section.items.reduce(
          (acc, item) => acc + parseFloat(this.calculatePreviousAmount(section.id, item)),
          0
        );
      }, 0);
    },
    totalTotalAmount() {
      return this.sections.reduce((sum, section) => {
        return sum + section.items.reduce(
          (acc, item) => acc + parseFloat(this.getTotalAmount(section.id, item.itemno)),
          0
        );
      }, 0);
    },
    totalPrevPercentage() {
      return this.sections.reduce((sum, section) => {
        return sum + section.items.reduce(
          (acc, item) => acc + parseFloat(this.getPreviousPercentage(section.id, item.itemno)),
          0
        );
      }, 0);
    }
  },
  methods: {
    async fetchData() {
      const documentIdParam = this.$route.params.documentId;
      try {
        const response = await axios.get(
          `http://localhost:1337/api/header-per-project-sections?populate=*&filters[project][documentId][$eq]=${documentIdParam}`
        );
        if (response.data && response.data.data.length > 0) {
          this.sections = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching project data.');
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
        alert('Error fetching modified items.');
      }
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
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      return modifiedItem ? parseFloat(modifiedItem.totalAmount) || 0 : 0;
    },
    updateProjectItemModifiedAmounts() {
      this.sections.forEach(section => {
        section.project_item_modifieds = this.projectItemModifieds.filter(mod => {
          return (
            mod.header_per_project_section &&
            mod.header_per_project_section.id === section.id
          );
        });
      });
    },
    formatDecimal(value) {
      if (value === null || value === undefined || isNaN(value)) return '0.00';
      return parseFloat(value).toFixed(2);
    },
    formatNumber(value) {
      if (value === null || value === undefined || isNaN(value)) return '0.00';
      return parseFloat(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    redirectToViewWeeklyProgressReport() {
      const documentIdParam = this.$route.params.documentId;
      this.$router.push({ name: 'ViewWeeklyProgressReport', params: { documentId: documentIdParam } });
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
      const margin = 20; // margin in points
      const headerMargin = 30; // space for timestamp
      const tableElement = this.$refs.pdfTable;
      html2canvas(tableElement, { useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const now = new Date();
        const timestamp = now.toLocaleString();
        pdf.setFontSize(10);
        pdf.text(`Created on: ${timestamp}`, margin, margin + headerMargin / 2);
        pdf.addImage(imgData, 'PNG', margin, margin + headerMargin, pdfWidth, pdfHeight);
        pdf.save('project-details.pdf');
      });
    },
    // ----- Methods for adding new rows -----
    enableNewRow(sectionId) {
      this.$set(this.newRowData, sectionId, {
        itemno: '',
        subDescription: '',
        quantity: 0,
        unit: '',
        unitCost: 0,
        amount: 0,
        wt_percent: 0
      });
    },
    saveNewRow(sectionId) {
      const newRow = this.newRowData[sectionId];
      const section = this.sections.find(sec => sec.id === sectionId);
      if (section && newRow) {
        // Update header record by adding new row
        section.items.push({ ...newRow });
        axios.put(`http://localhost:1337/api/header-per-project-sections/${section.documentId}`, {
          data: {
            items: section.items
          }
        })
        .then(response => {
          alert('New row added successfully to header');
          console.log('Header updated with new row', response);
          // Now create a new project item record using POST
          axios.post("http://localhost:1337/api/project-items", {
            data: {
              itemno: newRow.itemno,
              subDescription: newRow.subDescription,
              quantity: newRow.quantity,
              unit: newRow.unit,
              unitCost: newRow.unitCost,
              amount: newRow.amount,
              wt_percent: newRow.wt_percent,
              // Associate with the header record via its documentId
              header_per_project_section: section.documentId
            }
          })
          .then(response2 => {
            alert('Project item created successfully');
            console.log("Project item created", response2);
            // Assign returned documentId to the new row for future updates
            if(response2.data && response2.data.data) {
              newRow.documentId = response2.data.data.documentId;
            }
            this.$delete(this.newRowData, sectionId);
          })
          .catch(error2 => {
            console.error("Error creating project item", error2);
            alert("Error creating project item");
          });
        })
        .catch(error => {
          console.error('Error adding new row', error);
          alert('Error adding new row to header');
        });
      }
    },
    cancelNewRow(sectionId) {
      this.$delete(this.newRowData, sectionId);
    },
    // ----- Methods for editing existing rows -----
    editKey(sectionId, itemno) {
      return `${sectionId}-${itemno}`;
    },
    isEditing(sectionId, itemno) {
      return !!this.editingRowData[this.editKey(sectionId, itemno)];
    },
    editRow(sectionId, item) {
      const key = this.editKey(sectionId, item.itemno);
      this.$set(this.editingRowData, key, { ...item });
    },
    saveEdit(sectionId, itemno) {
      const key = this.editKey(sectionId, itemno);
      const editedItem = this.editingRowData[key];
      const section = this.sections.find(sec => sec.id === sectionId);
      if (section) {
        const index = section.items.findIndex(it => it.itemno === itemno);
        if (index !== -1) {
          section.items.splice(index, 1, editedItem);
          // Update header record first
          axios.put(`http://localhost:1337/api/header-per-project-sections/${section.documentId}`, {
            data: {
              items: section.items
            }
          })
          .then(response => {
            alert('Row updated successfully in header');
            console.log('Row updated in header', response);
            // Then update corresponding project item if documentId exists
            if (editedItem.documentId) {
              axios.put(`http://localhost:1337/api/project-items/${editedItem.documentId}`, {
                data: {
                  itemno: editedItem.itemno,
                  subDescription: editedItem.subDescription,
                  quantity: editedItem.quantity,
                  unit: editedItem.unit,
                  unitCost: editedItem.unitCost,
                  amount: editedItem.amount,
                  wt_percent: editedItem.wt_percent
                }
              })
              .then(response2 => {
                console.log("Project item updated successfully", response2);
              })
              .catch(error2 => {
                console.error("Error updating project item", error2);
                alert("Error updating project item");
              });
            }
          })
          .catch(error => {
            console.error('Error updating row in header', error);
            alert('Error updating row in header');
          });
        }
      }
      this.$delete(this.editingRowData, key);
    },
    cancelEdit(sectionId, itemno) {
      const key = this.editKey(sectionId, itemno);
      this.$delete(this.editingRowData, key);
    },
    // ----- Methods for editing section headers -----
    isEditingSection(sectionId) {
      return !!this.editingSectionData[sectionId];
    },
    editSection(section) {
      this.$set(this.editingSectionData, section.id, {
        letter_label_for_item_no: section.letter_label_for_item_no,
        mainDescription: section.mainDescription
      });
    },
    saveSectionEdit(sectionId) {
      const editedSection = this.editingSectionData[sectionId];
      const section = this.sections.find(sec => sec.id === sectionId);
      if (section && editedSection) {
        section.letter_label_for_item_no = editedSection.letter_label_for_item_no;
        section.mainDescription = editedSection.mainDescription;
        axios.put(`http://localhost:1337/api/header-per-project-sections/${section.documentId}`, {
          data: {
            letter_label_for_item_no: section.letter_label_for_item_no,
            mainDescription: section.mainDescription
          }
        })
        .then(response => {
          alert('Section updated successfully');
          console.log('Section updated successfully', response);
        })
        .catch(error => {
          console.error('Error updating section', error);
          alert('Error updating section');
        });
      }
      this.$delete(this.editingSectionData, sectionId);
    },
    cancelSectionEdit(sectionId) {
      this.$delete(this.editingSectionData, sectionId);
    },
    deleteSection(sectionId) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section) return;
      if (!window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
        return;
      }
      axios.delete(`http://localhost:1337/api/header-per-project-sections/${section.documentId}`)
      .then(response => {
        alert('Section deleted successfully');
        console.log('Section deleted successfully', response);
        const index = this.sections.findIndex(sec => sec.id === sectionId);
        if (index !== -1) {
          this.sections.splice(index, 1);
        }
      })
      .catch(error => {
        console.error('Error deleting section', error);
        alert('Error deleting section');
      });
    }
  },
  mounted() {
    Promise.all([this.fetchData(), this.fetchProjectItemModifieds()])
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
.add-row-btn {
  padding: 6px 12px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: none; /* Hide the original button */
}
.add-row-btn:hover {
  background-color: #218838;
}
.row-actions {
  margin-top: 5px;
}
.row-actions button {
  margin: 2px;
  padding: 4px 8px;
  font-size: 13px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
.row-actions button:first-child {
  color: #fff;
}
.row-actions button:last-child {
  color: #fff;
}
input {
  width: 90%;
  padding: 2px;
  font-size: 14px;
}
.text-center {
  text-align: center;
}
</style>
