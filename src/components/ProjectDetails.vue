<template>
  <div>
    <h2 class="mt-3 ms-10">Project Details</h2>
    <table border="1" class="mx-auto mt-5">
      <thead>
        <tr>
          <th>ITEM NO.</th>
          <th>DESCRIPTION</th>
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
        <template v-for="section in sections">
          <tr :key="'section-' + section.id">
            <td colspan="14" class="font-weight-bold">
              {{ section.letter_label_for_item_no }}
            </td>
          </tr>
          <tr :key="'desc-' + section.id">
            <td colspan="14" class="font-italic">
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
            <!-- Previous QTY from P_EnteredQuantity -->
            <td>{{ formatDecimal(getPreviousQty(section.id, item.itemno)) }}</td>
            <!-- Previous AMOUNT as previous qty * unit cost -->
            <td>{{ formatDecimal(calculatePreviousAmount(section.id, item)) }}</td>
            <!-- REMAINING QUANTITY from project_item_modifieds -->
            <td>{{ formatDecimal(getModifiedQuantity(section.id, item.itemno)) }}</td>
            <!-- TOTAL AMOUNT computed as P_EnteredQuantity * unitCost -->
            <td>{{ formatDecimal(getTotalAmount(section.id, item.itemno)) }}</td>
            <!-- BALANCE displays the updated "amount" from project_item_modifieds (after subtraction) -->
            <td>{{ formatDecimal(getModifiedAmount(section.id, item.itemno)) }}</td>
            <!-- PREV PERCENTAGE displays the value of P_EnteredQuantity -->
            <td>{{ formatDecimal(getPreviousPercentage(section.id, item.itemno)) }}</td>
            <td>{{ formatDecimal(getPreviousPercentage(section.id, item.itemno)) }}</td>
          </tr>
        </template>
      </tbody>

      <!-- TOTAL Row -->
      <tfoot>
        <tr class="font-weight-bold bg-light">
          <td colspan="5">TOTAL</td>
          <td>{{ formatDecimal(totalAmount) }}</td>
          <td>{{ formatDecimal(totalWtPercent) }}</td>
          <td></td>
          <td>{{ formatDecimal(totalPreviousAmount) }}</td>
          <td></td>
          <td>{{ formatDecimal(totalTotalAmount) }}</td>
          <td></td>
          <td>{{ formatDecimal(totalPrevPercentage) }}</td>
          <td>{{ formatDecimal(totalPrevPercentage) }}</td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ProjectDetails',
  data() {
    return {
      sections: [],
      // This will store the modified items from the API.
      projectItemModifieds: []
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
      // Sums the computed TOTAL AMOUNT from each modified item (for each item in a section)
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
    }
  },
  methods: {
    async fetchData() {
      const documentId = this.$route.params.documentId;
      try {
        const response = await axios.get(
          `http://localhost:1337/api/header-per-project-sections?populate=*&filters[project][documentId][$eq]=${documentId}`
        );
        if (response.data && response.data.data.length > 0) {
          this.sections = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    // Fetch modified items using the endpoint with ?populate=*
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
    // Retrieves the previous quantity from the modified record (P_EnteredQuantity)
    getPreviousQty(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      return modifiedItem ? parseFloat(modifiedItem.P_EnteredQuantity) || 0 : 0;
    },
    // Retrieves the "quantity" from the modified items
    getModifiedQuantity(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      return modifiedItem ? parseFloat(modifiedItem.quantity) || 0 : 0;
    },
    // Retrieves the "amount" from the modified items (BALANCE column)
    getModifiedAmount(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      return modifiedItem ? parseFloat(modifiedItem.amount) || 0 : 0;
    },
    // Calculates previous amount using P_EnteredQuantity multiplied by the unit cost
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
    // Retrieves the computed TOTAL AMOUNT from the modified record.
    getTotalAmount(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      return modifiedItem ? parseFloat(modifiedItem.totalAmount) || 0 : 0;
    },
    // Update each project-item-modified record:
    // 1. Compute totalAmount = P_EnteredQuantity * unitCost.
    // 2. Subtract totalAmount from the current amount.
    // 3. Update both fields in the backend.
    updateProjectItemModifiedAmounts() {
      this.sections.forEach(section => {
        // Associate modified records with the section using header_per_project_section.id
        section.project_item_modifieds = this.projectItemModifieds.filter(mod => {
          return mod.header_per_project_section && mod.header_per_project_section.id === section.id;
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
    },
    formatDecimal(value) {
      if (value === null || value === undefined || isNaN(value)) return '0.00';
      return parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  },
  mounted() {
    // Fetch sections and modified items—but do not auto-update amounts.
    Promise.all([this.fetchData(), this.fetchProjectItemModifieds()])
      .catch(error => {
        console.error('Error in mounted hook:', error);
      });
  },
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
</style>
