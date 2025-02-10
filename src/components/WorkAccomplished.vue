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
            <!-- Add the short-col class to these header cells -->
            <th class="short-col">ENTER QTY</th>
            <th>Previous AMOUNT</th>
            <th>REMAINING QUANTITY</th>
            <th>TOTAL AMOUNT</th>
            <th>BALANCE</th>
            <th class="short-col">ENTER PERCENTAGE</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <!-- Use v-for on tbody instead of a template -->
        <tbody v-for="section in sections" :key="section.id">
          <tr>
            <td colspan="14" class="font-weight-bold">
              {{ section.letter_label_for_item_no }}
            </td>
          </tr>
          <tr>
            <td colspan="14" class="font-italic">
              {{ section.mainDescription }}
            </td>
          </tr>
          <tr v-for="item in section.items" :key="'item-' + item.id">
            <td>{{ item.itemno }}</td>
            <td>{{ item.subDescription }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.unit }}</td>
            <td>
              {{ item.unitCost ? parseFloat(item.unitCost).toFixed(2) : '-' }}
            </td>
            <td>
              {{ item.amount ? parseFloat(item.amount).toFixed(2) : '-' }}
            </td>
            <td>
              {{ item.wt_percent ? parseFloat(item.wt_percent).toFixed(2) : '-' }}
            </td>
            <!-- "ENTER QTY" as an input field with shorter width -->
            <td class="short-col">
              <input
                type="number"
                class="short-input"
                v-model.number="item.enterQty"
                @change="onEnterQtyChange(section, item)"
              />
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
            <!-- "ENTER PERCENTAGE" as an input field with shorter width -->
            <td class="short-col">
              <input
                type="number"
                class="short-input"
                v-model.number="item.enterPercentage"
                @change="onEnterPercentageChange(section, item)"
                step="0.01"
              />
            </td>
            <td>{{ getPreviousPercentage(section.id, item.itemno) }}</td>
          </tr>
        </tbody>
      </table>
      <!-- Submit button to send modifications -->
      <div class="text-center mt-3">
        <button @click="submitModifications" class="btn btn-primary">
          Submit
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'WorkAccomplished',
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
            `http://localhost:1337/api/header-per-project-sections?populate=*&&filters[project][documentId][$eq]=${documentId}`
          );
          if (response.data && response.data.data.length > 0) {
            this.sections = response.data.data;
            this.initializeItems();
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      },
  
      // Initialize input fields for each item
      initializeItems() {
        this.sections.forEach((section) => {
          if (section.items && Array.isArray(section.items)) {
            section.items.forEach((item) => {
              // Default ENTER QTY: original quantity minus modified quantity
              const modifiedQty = this.getPreviousQty(section.id, item.itemno);
              this.$set(
                item,
                'enterQty',
                parseFloat(item.quantity) - modifiedQty
              );
              // Default ENTER PERCENTAGE: use modified percentage if available, otherwise 0
              let prevPercentage = this.getPreviousPercentage(section.id, item.itemno);
              this.$set(
                item,
                'enterPercentage',
                prevPercentage !== '-' ? parseFloat(prevPercentage) : 0
              );
            });
          }
        });
      },
  
      // Returns the modified quantity (now the EnteredQuantity) for an item, if available.
      getPreviousQty(sectionId, itemno) {
        const section = this.sections.find((sec) => sec.id === sectionId);
        if (!section || !section.project_item_modifieds) return 0;
        const modifiedItem = section.project_item_modifieds.find(
          (modItem) => modItem.itemno === itemno
        );
        return modifiedItem ? parseFloat(modifiedItem.EnteredQuantity) || 0 : 0;
      },
  
      // Calculate Previous AMOUNT as (original quantity - entered quantity) * UNIT COST
      calculatePreviousAmount(sectionId, item) {
        const previousQty =
          parseFloat(item.quantity) - this.getPreviousQty(sectionId, item.itemno);
        const unitCost = parseFloat(item.unitCost) || 0;
        return previousQty * unitCost;
      },
  
      getPreviousPercentage(sectionId, itemno) {
        const section = this.sections.find((sec) => sec.id === sectionId);
        if (!section || !section.project_item_modifieds) return '-';
        const modifiedItem = section.project_item_modifieds.find(
          (modItem) => modItem.itemno === itemno
        );
        return modifiedItem && modifiedItem.wt_percent
          ? parseFloat(modifiedItem.wt_percent).toFixed(2)
          : '-';
      },
  
      // Update modified quantity when the user changes ENTER QTY
      onEnterQtyChange(section, item) {
        if (!section.project_item_modifieds) {
          this.$set(section, 'project_item_modifieds', []);
        }
        let modItem = section.project_item_modifieds.find(
          (mod) => mod.itemno === item.itemno
        );
        if (!modItem) {
          modItem = { itemno: item.itemno, EnteredQuantity: 0, wt_percent: null };
          section.project_item_modifieds.push(modItem);
        }
        // Store the raw entered quantity into EnteredQuantity
        modItem.EnteredQuantity = parseFloat(item.enterQty);
      },
  
      // Update modified percentage when the user changes ENTER PERCENTAGE
      onEnterPercentageChange(section, item) {
        if (!section.project_item_modifieds) {
          this.$set(section, 'project_item_modifieds', []);
        }
        let modItem = section.project_item_modifieds.find(
          (mod) => mod.itemno === item.itemno
        );
        if (!modItem) {
          modItem = {
            itemno: item.itemno,
            EnteredQuantity: parseFloat(item.enterQty),
            wt_percent: null,
          };
          section.project_item_modifieds.push(modItem);
        }
        modItem.wt_percent = parseFloat(item.enterPercentage);
      },
  
      // Submit modifications to the API.
      async submitModifications() {
        try {
          // Loop through each section and its modified items
          for (const section of this.sections) {
            if (section.project_item_modifieds && section.project_item_modifieds.length) {
              for (const modItem of section.project_item_modifieds) {
                // Find the corresponding item to retrieve other details
                const item = section.items.find(
                  (itm) => itm.itemno === modItem.itemno
                );
                if (item) {
                  // Construct the payload.
                  // Adjust the payload structure if your backend expects a different format.
                  const payload = {
                    data: {
                      // Use the item's values for reference
                      itemno: item.itemno,
                      subDescription: item.subDescription,
                      quantity: item.quantity,
                      unit: item.unit,
                      unitCost: item.unitCost,
                      amount: item.amount,
                      // Store the user-entered values as required by the API:
                      EnteredQuantity: modItem.EnteredQuantity,
                      wt_percent: modItem.wt_percent,
                      // Ensure the proper relation by associating with the section (header)
                      header_per_project_section: section.id,
                    },
                  };
  
                  // Send POST request to the API
                  await axios.post(
                    'http://localhost:1337/api/project-item-modifieds?populate=*',
                    payload
                  );
                }
              }
            }
          }
          alert('Modifications submitted successfully!');
        } catch (error) {
          console.error('Error submitting modifications:', error);
          alert('An error occurred while submitting modifications.');
        }
      },
    },
    mounted() {
      this.fetchData();
    },
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
  
  /* New styles for shorter columns */
  .short-col {
    width: 80px; /* Adjust width as needed */
  }
  
  .short-input {
    width: 60px; /* Adjust input width as needed */
  }
  
  /* Style for the submit button */
  .btn {
    padding: 8px 16px;
    font-size: 16px;
    cursor: pointer;
  }
  .btn-primary {
    background-color: #007bff;
    color: white;
    border: none;
  }
  .btn-primary:hover {
    background-color: #0056b3;
  }
  </style>
  