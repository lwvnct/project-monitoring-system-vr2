<template>
  <div>
    <table border="1" class="mx-auto mt-5">
      <thead>
        <tr>
          <th colspan="16" class="table-header">WORK ACCOMPLISHED REPORT</th>
        </tr>
        <tr>
          <th rowspan="2">ITEM NO.</th>
          <th rowspan="2">DESCRIPTION</th>
          <th colspan="5">ORIGINAL CONTRACT</th>
          <th colspan="5">WORK ACCOMPLISHED</th>
          <th colspan="2">WEIGHTED % ACCOMP</th>
          <th rowspan="2" class="field">ENTER QTY</th>
          <th rowspan="2" class="field">ENTER PERCENTAGE</th>
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
      <tbody>
        <!-- Removed key from template element -->
        <template v-for="section in sections">
          <tr :key="'section-' + section.id">
            <td colspan="16" class="font-weight-bold">
              {{ section.letter_label_for_item_no }}
            </td>
          </tr>
          <tr :key="'desc-' + section.id">
            <td colspan="16" class="font-italic">
              {{ section.mainDescription }}
            </td>
          </tr>
          <tr v-for="item in section.items" :key="'item-' + item.id">
            <td>{{ item.itemno }}</td>
            <td>{{ item.subDescription }}</td>
            <td>{{ formatDecimal(item.quantity) }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ formatDecimal(item.unitCost) }}</td>
            <td>{{ formatDecimal(item.amount) }}</td>
            <td>{{ formatDecimal(item.wt_percent) }}</td>
            <td>{{ formatDecimal(getPreviousQty(section.id, item.itemno)) }}</td>
            <td>{{ formatDecimal(calculatePreviousAmount(section.id, item)) }}</td>
            <td>{{ formatDecimal(getModifiedQuantity(section.id, item.itemno)) }}</td>
            <td>{{ formatDecimal(getTotalAmount(section.id, item.itemno)) }}</td>
            <td>{{ formatDecimal(getModifiedAmount(section.id, item.itemno)) }}</td>
            <td>{{ formatDecimal(getPreviousPercentage(section.id, item.itemno)) }}</td>
            <td>{{ formatDecimal(getPreviousPercentage(section.id, item.itemno)) }}</td>
            <td>
              <input v-model.number="item.enterQty" type="number" min="0" step="0.01" />
            </td>
            <td>
              <input v-model.number="item.enterPercentage" type="number" min="0" step="0.01" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <button @click="submitData" class="submit-btn px-10">SUBMIT</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'WorkAccomplished',
  data() {
    return {
      sections: [],
      projectItemModifieds: []
    };
  },
  methods: {
    async fetchData() {
      const documentId = this.$route.params.documentId;
      try {
        const response = await axios.get(
          `http://localhost:1337/api/header-per-project-sections?populate=*&filters[project][documentId][$eq]=${documentId}`
        );
        if (response.data && response.data.data.length > 0) {
          // Set default values for input fields on each item
          this.sections = response.data.data.map(section => {
            if (section.items && Array.isArray(section.items)) {
              section.items = section.items.map(item => {
                return {
                  ...item,
                  enterQty: 0,
                  enterPercentage: 0,
                };
              });
            }
            return section;
          });
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
    // Methods copied from ProjectDetails:
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
      return modifiedItem ? parseFloat(modifiedItem.P_EnteredQuantity) || 0 : 0;
    },
    getTotalAmount(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      return modifiedItem ? parseFloat(modifiedItem.totalAmount) || 0 : 0;
    },
    formatDecimal(value) {
      if (value === null || value === undefined || isNaN(value)) return '0.00';
      return parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    // Submit function (retained from WorkAccomplished) to process user inputs
    async submitData() {
      try {
        // Loop through each section and its items
        for (const section of this.sections) {
          for (const item of section.items) {
            // Only process if there is new input in either field
            if (item.enterQty !== undefined || item.enterPercentage !== undefined) {
              // Check if a modification record already exists for this item
              const response = await axios.get(
                `http://localhost:1337/api/project-item-modifieds?filters[header_per_project_section][$eq]=${section.id}&filters[itemno][$eq]=${item.itemno}`
              );

              // Convert input values to numbers (defaulting to 0)
              const inputQty = parseFloat(item.enterQty || 0);
              const inputWt = parseFloat(item.enterPercentage || 0);
              const originalQty = parseFloat(item.quantity);

              if (response.data && response.data.data.length > 0) {
                // If record exists, add the new input to the previous values
                const modRecord = response.data.data[0];
                const previousEntered = parseFloat(modRecord.EnteredQuantity) || 0;
                const previousRemaining = parseFloat(modRecord.quantity) || originalQty;
                // Delivered quantity so far = original quantity - previous remaining
                const previousDelivered = originalQty - previousRemaining;
                // New delivered quantity = previous delivered + new input
                const newDelivered = previousDelivered + inputQty;
                // New remaining quantity = original quantity - new delivered quantity
                const newRemaining = originalQty - newDelivered;
                // Sum the percentages
                const previousWt = parseFloat(modRecord.wt_percent) || 0;
                const newWt = previousWt + inputWt;

                const existingRecordId = modRecord.documentId;
                await axios.put(
                  `http://localhost:1337/api/project-item-modifieds/${existingRecordId}`,
                  {
                    data: {
                      EnteredQuantity: previousEntered + inputQty,
                      wt_percent: newWt,
                      header_per_project_section: section.documentId,
                      quantity: newRemaining, // Updated remaining quantity
                      p_wt_percent: inputWt,
                      P_EnteredQuantity: inputQty,
                    }
                  }
                );
              } else {
                // If no record exists, create a new record using the input values
                const newEntered = inputQty;
                const newRemaining = originalQty - newEntered;
                const newWt = inputWt;
                await axios.post(
                  `http://localhost:1337/api/project-item-modifieds`,
                  {
                    data: {
                      EnteredQuantity: newEntered,
                      wt_percent: newWt,
                      header_per_project_section: section.documentId,
                      itemno: item.itemno,
                      quantity: newRemaining, // Store the remaining quantity
                      p_wt_percent: inputWt,
                      P_EnteredQuantity: inputQty,
                    }
                  }
                );
              }
            }
          }
        }
        // After processing modifications, update the modified amounts
        await this.updateModifiedAmounts();
        alert('Data successfully updated!');
      } catch (error) {
        console.error('Error submitting data:', error);
      }
    },
    async updateModifiedAmounts() {
      try {
        const modResponse = await axios.get("http://localhost:1337/api/project-item-modifieds?populate=*");
        const projectItemModifieds = modResponse.data && modResponse.data.data ? modResponse.data.data : [];
        // Loop through each section
        this.sections.forEach(section => {
          // Associate modified records with the section using header_per_project_section.id
          section.project_item_modifieds = projectItemModifieds.filter(mod => {
            if (mod.header_per_project_section) {
              if (mod.header_per_project_section.id) {
                return mod.header_per_project_section.id === section.id;
              } else {
                return mod.header_per_project_section === section.documentId;
              }
            }
            return false;
          });
          // For every item in the section, update the modified record’s totalAmount and adjusted amount.
          section.items.forEach(item => {
            const modItem = section.project_item_modifieds.find(mod => mod.itemno === item.itemno);
            if (modItem) {
              // Compute totalAmount from P_EnteredQuantity * unitCost
              const computedTotalAmount =
                parseFloat(modItem.P_EnteredQuantity || 0) * parseFloat(item.unitCost || 0);
              modItem.totalAmount = computedTotalAmount;
              // Subtract the computed totalAmount from the original amount
              const originalAmount = parseFloat(modItem.amount) || 0;
              const newModifiedAmount = originalAmount - computedTotalAmount;
              modItem.amount = newModifiedAmount;
              // Update the record on the backend with both updated fields.
              axios
                .put(`http://localhost:1337/api/project-item-modifieds/${modItem.documentId}`, {
                  data: {
                    totalAmount: computedTotalAmount,
                    amount: newModifiedAmount
                  }
                })
                .then(() => {
                  console.log(
                    `Updated modified item ${modItem.id} with totalAmount ${computedTotalAmount} and new amount ${newModifiedAmount}`
                  );
                })
                .catch(error => {
                  console.error(
                    `Error updating modified item ${modItem.id}`,
                    error
                  );
                });
            }
          });
        });
      } catch (error) {
        console.error('Error updating modified amounts:', error);
      }
    }
  },
  mounted() {
    Promise.all([this.fetchData(), this.fetchProjectItemModifieds()])
      .catch(error => {
        console.error('Error in mounted hook:', error);
      });
  }
};
</script>

<style scoped>
th,
td {
  padding: 4px; /* Reduce padding */
  text-align: center;
  font-size: 15px; /* Reduce font size */
}

th {
  background-color: #f4f4f4;
}

table {
  background-color: #f4f4f4;
  max-width: 90%; /* Reduce width */
  margin: auto;
  border-collapse: collapse; /* Reduce spacing between cells */
}

.table-header {
  background-color: white;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 10px;
  background-color: rgb(239, 213, 40);
}

input {
  width: 60px; /* Reduce input field width */
}

.font-weight-bold {
  font-weight: bold;
  background-color: #e0e0e0;
}

.font-italic {
  font-style: italic;
}

button {
  display: block;
  margin: 10px auto; /* Centers the button */
  padding: 8px 16px; /* Adjust button size */
  background-color: #066913;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  letter-spacing: 1px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #085b14;
}

.field {
  background-color: rgb(221, 220, 216);
}
</style>
