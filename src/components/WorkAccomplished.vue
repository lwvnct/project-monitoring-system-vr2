<template>
  <div>
    <div class="ps-15 mt-5 notification" @click="redirectToWeeklyProgressReport">
      <p class="text-center">
        Please CLICK here go to the Weekly Progress Report page BEFORE SUBMITTING data.(ONLY ONCE)
      </p>
    </div>
    <table border="1" class="mx-auto ">
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
        <!-- Removed key from the template element -->
        <template v-for="section in sections">
          <tr :key="'section-label-' + section.id">
            <td colspan="16" class="font-weight-bold">
              {{ section.letter_label_for_item_no }}
            </td>
          </tr>
          <tr :key="'section-desc-' + section.id">
            <td colspan="16" class="font-italic">
              {{ section.mainDescription }}
            </td>
          </tr>
          <tr v-for="item in section.items" :key="item.id">
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
              <input
                v-model.number="item.enterQty"
                type="number"
                min="0"
                step="0.01"
              />
            </td>
            <td>
              <input
                v-model.number="item.enterPercentage"
                type="number"
                min="0"
                step="0.01"
              />
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
      projectItemModifieds: [],
      isSubmitting: false // New state to track submission status
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
          this.sections = response.data.data.map(section => {
            if (section.items && Array.isArray(section.items)) {
              section.items = section.items.map(item => ({
                ...item,
                enterQty: 0,
                enterPercentage: 0,
              }));
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
    async updateModifiedAmounts() {
      try {
        const modResponse = await axios.get("http://localhost:1337/api/project-item-modifieds?populate=*");
        const projectItemModifieds = modResponse.data && modResponse.data.data ? modResponse.data.data : [];
        this.sections.forEach(section => {
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
          section.items.forEach(item => {
            const modItem = section.project_item_modifieds.find(mod => mod.itemno === item.itemno);
            if (modItem) {
              const computedTotalAmount =
                parseFloat(modItem.P_EnteredQuantity || 0) * parseFloat(item.unitCost || 0);
              modItem.totalAmount = computedTotalAmount;
              const originalAmount = parseFloat(modItem.amount) || 0;
              const newModifiedAmount = originalAmount - computedTotalAmount;
              modItem.amount = newModifiedAmount;
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
    },
    // Compute totals for updating remaining values
    computeTotals(section) {
      const items = section.items || [];
      const projectItemModifieds = section.project_item_modifieds || [];
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
    // Update the header's remaining value for all sections after submission
    async updateRemainingForAllSections() {
      for (const section of this.sections) {
        try {
          // Retrieve the current remaining value from the API
          const response = await axios.get(
            `http://localhost:1337/api/header-per-project-sections/${section.documentId}`
          );
          let fetchedRemaining = 0;
          if (response.data && response.data.data && response.data.data.attributes) {
            fetchedRemaining = Number(response.data.data.attributes.remaining) || 0;
          } else {
            // Fallback to local section.remaining if API response is unexpected
            fetchedRemaining = Number(section.remaining) || 0;
          }
          // Compute the totals to subtract
          const computed = this.computeTotals(section);
          const computedPrev = computed.totalPrevWTPercents || 0;
          // Subtract the computed total from the fetched remaining value
          const newRemaining = fetchedRemaining - computedPrev;
          // Update the local section value and then update the database
          section.remaining = newRemaining;
          await axios.put(
            `http://localhost:1337/api/header-per-project-sections/${section.documentId}`,
            {
              data: {
                remaining: newRemaining
              }
            }
          );
          console.log(
            "W.A Remaining updated for section:",
            section.documentId,
            newRemaining
          );
        } catch (error) {
          console.error(
            "W.A Error updating remaining for section:",
            section.documentId,
            error
          );
        }
      }
    },
    redirectToWeeklyProgressReport() {
      this.$router.push({ name: 'WeeklyProgressReport' });
    },
    async submitData() {
      if (this.isSubmitting) return; // Prevent multiple submissions
      this.isSubmitting = true; // Set submitting state to true
      try {
        // Loop through each section and its items to update modifications
        for (const section of this.sections) {
          for (const item of section.items) {
            if (item.enterQty !== undefined || item.enterPercentage !== undefined) {
              const response = await axios.get(
                `http://localhost:1337/api/project-item-modifieds?filters[header_per_project_section][$eq]=${section.id}&filters[itemno][$eq]=${item.itemno}`
              );
              const inputQty = parseFloat(item.enterQty || 0);
              const inputWt = parseFloat(item.enterPercentage || 0);
              const originalQty = parseFloat(item.quantity);
              if (response.data && response.data.data.length > 0) {
                const modRecord = response.data.data[0];
                const previousEntered = parseFloat(modRecord.EnteredQuantity) || 0;
                const previousRemaining = parseFloat(modRecord.quantity) || originalQty;
                const previousDelivered = originalQty - previousRemaining;
                const newDelivered = previousDelivered + inputQty;
                const newRemaining = originalQty - newDelivered;
                const previousWt = parseFloat(modRecord.wt_percent) || 0;
                const newWt = previousWt + inputWt;
                // New feature: add inputWt to the previous sum_wt_percent from the database
                const previousSumWtPercent = parseFloat(modRecord.sum_wt_percent) || 0;
                const newSumWtPercent = previousSumWtPercent + inputWt;
                const existingRecordId = modRecord.documentId;
                await axios.put(
                  `http://localhost:1337/api/project-item-modifieds/${existingRecordId}`,
                  {
                    data: {
                      EnteredQuantity: previousEntered + inputQty,
                      wt_percent: newWt,
                      header_per_project_section: section.documentId,
                      quantity: newRemaining,
                      p_wt_percent: inputWt,
                      P_EnteredQuantity: inputQty,
                      sum_wt_percent: newSumWtPercent
                    }
                  }
                );
              } else {
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
                      quantity: newRemaining,
                      p_wt_percent: inputWt,
                      P_EnteredQuantity: inputQty,
                      sum_wt_percent: inputWt
                    }
                  }
                );
              }
            }
          }
        }
        // Update modified amounts after processing
        await this.updateModifiedAmounts();
        // Update header remaining values only when the submit button is clicked
        await this.updateRemainingForAllSections();
        alert('Data successfully updated!');
      } catch (error) {
        console.error('Error submitting data:', error);
      } finally {
        this.isSubmitting = false; // Reset submitting state
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
  padding: 4px;
  text-align: center;
  font-size: 15px;
}

th {
  background-color: #f4f4f4;
}

table {
  background-color: #f4f4f4;
  max-width: 90%;
  margin: auto;
  border-collapse: collapse;
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
  width: 60px;
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
  margin: 10px auto;
  padding: 8px 16px;
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

.notification {
  background: #f61616;
  cursor: pointer;
}

p {
  color: white;
}
</style>
