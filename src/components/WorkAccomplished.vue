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
          <th>ENTER QTY</th>
          <th>Previous AMOUNT</th>
          <th>REMAINING QUANTITY</th>
          <th>TOTAL AMOUNT</th>
          <th>BALANCE</th>
          <th>ENTER PERCENTAGE</th>
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
            <td>{{ item.unitCost ? parseFloat(item.unitCost).toFixed(2) : '-' }}</td>
            <td>{{ item.amount ? parseFloat(item.amount).toFixed(2) : '-' }}</td>
            <td>{{ item.wt_percent ? parseFloat(item.wt_percent).toFixed(2) : '-' }}</td>
            <td>
              <input v-model.number="item.enterQty" type="number" min="0" step="0.01" />
            </td>
            <td>{{ calculatePreviousAmount(section.id, item).toFixed(2) }}</td>
            <td>{{ getPreviousQty(section.id, item.itemno) }}</td>
            <td>
              {{
                (
                  (parseFloat(item.quantity) - getPreviousQty(section.id, item.itemno)) *
                  parseFloat(item.unitCost || 0)
                ).toFixed(2)
              }}
            </td>
            <td>
              {{
                (
                  parseFloat(item.amount || 0) -
                  parseFloat(calculatePreviousAmount(section.id, item))
                ).toFixed(2)
              }}
            </td>
            <td>
              <input v-model.number="item.enterPercentage" type="number" min="0" step="0.01" />
            </td>
            <td>{{ getPreviousPercentage(section.id, item.itemno) }}</td>
          </tr>
        </template>
      </tbody>
    </table>
    <button @click="submitData">SUBMIT</button>
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
          `http://localhost:1337/api/header-per-project-sections?populate=*` +
          `&filters[project][documentId][$eq]=${documentId}`
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
    calculatePreviousAmount(sectionId, item) {
      const previousQty = parseFloat(item.quantity) - this.getPreviousQty(sectionId, item.itemno);
      const unitCost = parseFloat(item.unitCost) || 0;
      return previousQty * unitCost;
    },
    getPreviousPercentage(sectionId, itemno) {
      const section = this.sections.find(sec => sec.id === sectionId);
      if (!section || !section.project_item_modifieds) return '-';
      const modifiedItem = section.project_item_modifieds.find(modItem => modItem.itemno === itemno);
      return modifiedItem && modifiedItem.wt_percent ? parseFloat(modifiedItem.wt_percent).toFixed(2) : '-';
    },
    async submitData() {
      try {
        for (const section of this.sections) {
          for (const item of section.items) {
            if (item.enterQty !== undefined || item.enterPercentage !== undefined) {
              // Check if the record already exists
              const response = await axios.get(
                `http://localhost:1337/api/project-item-modifieds?filters[header_per_project_section][$eq]=${section.id}&filters[itemno][$eq]=${item.itemno}`
              );

              if (response.data && response.data.data.length > 0) {
                // If record exists, update using PUT
                const existingItemId = response.data.data[0].documentId;
                await axios.put(
                  `http://localhost:1337/api/project-item-modifieds/${existingItemId}`,
                  {
                    data: {
                      EnteredQuantity: item.enterQty || 0,
                      wt_percent: item.enterPercentage || 0,
                      header_per_project_section: section.documentId,
                    }
                  }
                );
              } else {
                // If record doesn't exist, create using POST
                await axios.post(
                  `http://localhost:1337/api/project-item-modifieds`,
                  {
                    data: {
                      EnteredQuantity: item.enterQty || 0,
                      wt_percent: item.enterPercentage || 0,
                      header_per_project_section: section.id,
                      itemno: item.itemno, // Ensure itemno is stored
                    }
                  }
                );
              }
            }
          }
        }
        alert('Data successfully updated!');
      } catch (error) {
        console.error('Error submitting data:', error);
      }
    }
  },
  mounted() {
    this.fetchData();
  }
};
</script>

<style scoped>
th,
td {
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
button {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style>
