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
            <!-- REMAINING QUANTITY now shows the "quantity" from project_item_modifieds -->
            <td>{{ formatDecimal(getModifiedQuantity(section.id, item.itemno)) }}</td>
            <!-- TOTAL AMOUNT = modified quantity * unit cost -->
            <td>{{ formatDecimal(calculatePreviousAmount(section.id, item)) }}</td>
            <!-- BALANCE now displays the "amount" from project_item_modifieds -->
            <td>{{ formatDecimal(getModifiedAmount(section.id, item.itemno)) }}</td>
            <!-- PREV PERCENTAGE now displays the value of P_EnteredQuantity -->
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
      // New property to store the API response for previous amounts
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
      return this.sections.reduce((sum, section) => {
        return sum + section.items.reduce((acc, item) => {
          return acc + this.getModifiedQuantity(section.id, item.itemno) * parseFloat(item.unitCost || 0);
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
    // New method to fetch the modified items data from the API
    async fetchProjectItemModifieds() {
      try {
        const response = await axios.get("http://localhost:1337/api/project-item-modifieds");
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
      // Return the value from P_EnteredQuantity
      return modifiedItem ? parseFloat(modifiedItem.P_EnteredQuantity) || 0 : 0;
    },
    getModifiedQuantity(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      // Return the value of "quantity" from project_item_modifieds
      return modifiedItem ? parseFloat(modifiedItem.quantity) || 0 : 0;
    },
    // New method to retrieve the "amount" from project_item_modifieds for the BALANCE column
    getModifiedAmount(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;
      const modifiedItem = section.project_item_modifieds.find(
        modItem => modItem.itemno === itemno
      );
      return modifiedItem ? parseFloat(modifiedItem.amount) || 0 : 0;
    },
    calculatePreviousAmount(sectionId, item) {
      // Calculate previous amount using P_EnteredQuantity multiplied by the unit cost
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
    // New method that retrieves the "Previous AMOUNT" from the API data
    getPreviousAmountFromAPI(sectionId, itemno) {
      const record = this.projectItemModifieds.find(mod => {
        // Assuming each record has a 'section' object with an 'id' and an 'itemno' field
        return mod.section && mod.section.id === sectionId && mod.itemno === itemno;
      });
      return record ? parseFloat(record.previous_amount) || 0 : 0;
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
    this.fetchData();
    this.fetchProjectItemModifieds();
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
