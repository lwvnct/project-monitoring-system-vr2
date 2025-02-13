<template>
  <div>
    <h2 class="mt-3 ms-10">WORK ACCOMPLISHED REPORT</h2>
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
          <th class="field">ENTER QTY</th>
          <th>Previous AMOUNT</th>
          <th>REMAINING QUANTITY</th>
          <th>TOTAL AMOUNT</th>
          <th>BALANCE</th>
          <th class="field">ENTER PERCENTAGE</th>
          <th>Previous PERCENTAGE</th>
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
            <!--ITEM NO.-->
            <td>{{ item.itemno }}</td>
            <!--DESCRIPTION-->
            <td>{{ item.subDescription }}</td>
            <!--QTY-->
            <td>{{ item.quantity }}</td>
            <!--UNIT-->
            <td>{{ item.unit }}</td>
            <!--UNIT COST-->
            <td>{{ item.unitCost ? parseFloat(item.unitCost).toFixed(2) : '-' }}</td>
            <!--AMOUNT-->
            <td>{{ item.amount ? parseFloat(item.amount).toFixed(2) : '-' }}</td>
            <!--WT.%-->
            <td>{{ item.wt_percent ? parseFloat(item.wt_percent).toFixed(2) : '-' }}</td>
            <!--ENTER QTY-->
            <td>
              <input v-model.number="item.enterQty" type="number" min="0" step="0.01" />
            </td>
            <!--Previous AMOUNT-->
            <td>{{ calculatePreviousAmount(section.id, item).toFixed(2) }}</td>
            <!--REMAINING QUANTITY-->
            <td>
              {{
                (parseFloat(item.quantity) - parseFloat(item.enterQty || 0)).toFixed(2)
              }}
            </td>
            <!--TOTAL AMOUNT-->
            <td>
              {{
                (
                  (parseFloat(item.quantity) - getPreviousQty(section.id, item.itemno)) *
                  parseFloat(item.unitCost || 0)
                ).toFixed(2)
              }}
            </td>
            <!--BALANCE-->
            <td>
              {{
                (
                  parseFloat(item.amount || 0) -
                  parseFloat(calculatePreviousAmount(section.id, item))
                ).toFixed(2)
              }}
            </td>
            <!--ENTER PERCENTAGE-->
            <td>
              <input v-model.number="item.enterPercentage" type="number" min="0" step="0.01" />
            </td>
            <!--Previous PERCENTAGE-->
            <td>{{ getPreviousPercentage(section.id, item.itemno) }}</td>
            <!--TOTAL-->
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
          const remainingQuantity = parseFloat(item.quantity) - parseFloat(item.enterQty || 0);

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
                  quantity: remainingQuantity, // Update quantity with REMAINING QUANTITY
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
                  header_per_project_section: section.documentId,
                  itemno: item.itemno,
                  quantity: remainingQuantity, // Save REMAINING QUANTITY
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
  margin: 10px auto;
  padding: 8px 16px; /* Adjust button size */
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.field {
  background-color: rgb(239, 213, 40);
}
</style>
