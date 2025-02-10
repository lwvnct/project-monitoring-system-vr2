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
            <td colspan="14" class="font-weight-bold">{{ section.letter_label_for_item_no }}</td>
          </tr>
          <tr :key="'desc-' + section.id">
            <td colspan="14" class="font-italic">{{ section.mainDescription }}</td>
          </tr>
          <tr v-for="item in section.items" :key="'item-' + item.id">
            <td>{{ item.itemno }}</td>
            <td>{{ item.subDescription }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ item.unitCost ? item.unitCost.toFixed(2) : '-' }}</td>
            <td>{{ item.amount ? item.amount.toFixed(2) : '-' }}</td>
            <td>{{ item.wt_percent ? item.wt_percent.toFixed(2) : '-' }}</td>
            
            <!-- Corrected "Previous QTY" fetching -->
            <td>{{ getPreviousQty(section.id, item.itemno) }}</td>

            <!-- Corrected "Previous AMOUNT" fetching -->
            <td>{{ getPreviousAmount(section.id, item.itemno).toFixed(2) }}</td>

            <!-- Fixed "Remaining QTY" calculation -->
            <td>{{ (parseFloat(item.quantity) - getPreviousQty(section.id, item.itemno)) }}</td>

            <!-- Fixed "TOTAL AMOUNT" calculation -->
            <td>{{ (parseFloat(item.amount || 0) + getPreviousAmount(section.id, item.itemno)).toFixed(2) }}</td>

            <!-- Fixed "BALANCE" calculation -->
            <td>{{ (parseFloat(item.amount || 0) - getPreviousAmount(section.id, item.itemno)).toFixed(2) }}</td>

            <!-- Fixed "Previous Percentage" -->
            <td>{{ getPreviousPercentage(section.id, item.itemno) }}</td>

            <!-- Fixed "Total" (same as Previous Percentage) -->
            <td>{{ getPreviousPercentage(section.id, item.itemno) }}</td>
          </tr>
        </template>
      </tbody>
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
          this.sections = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },

    getPreviousQty(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;

      const modifiedItem = section.project_item_modifieds.find(modItem => modItem.itemno === itemno);
      return modifiedItem ? parseFloat(modifiedItem.quantity) || 0 : 0;
    },

    getPreviousAmount(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return 0;

      const modifiedItem = section.project_item_modifieds.find(modItem => modItem.itemno === itemno);
      return modifiedItem ? parseFloat(modifiedItem.amount) || 0 : 0;
    },

    getPreviousPercentage(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return '-';

      const modifiedItem = section.project_item_modifieds.find(modItem => modItem.itemno === itemno);
      return modifiedItem && modifiedItem.wt_percent ? modifiedItem.wt_percent.toFixed(2) : '-';
    }
  },
  mounted() {
    this.fetchData();
  }
};
</script>

<style scoped>
th, td {
  padding: 8px;
  text-align: center;
}
th {
  background-color: #f4f4f4;
}
table {
  background-color: #f4f4f4;
  max-width: 90%;
}
.font-weight-bold {
  font-weight: bold;
  background-color: #e0e0e0;
}
.font-italic {
  font-style: italic;
}
</style>
