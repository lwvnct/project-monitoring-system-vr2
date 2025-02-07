<template>
    <div>
      <h2 class="mt-3 ms-10">Project Details</h2>
      <table border="1"  class="mx-auto mt-5">
        <thead>
          <tr>
            <th rowspan="2">ITEM NO.</th>
            <th rowspan="2">DESCRIPTION</th>
            <th colspan="5">ORIGINAL CONTRACT</th>
            <th colspan="2">WORK ACCOMPLISHED</th>
            <th colspan="2">WEIGHTED % ACCOMP.</th>
          </tr>
          <tr>
            <th>QTY</th>
            <th>UNIT</th>
            <th>UNIT COST</th>
            <th>AMOUNT</th>
            <th>WT.%</th>
            <th>Previous QTY</th>
            <th>Previous AMOUNT</th>
            <th>PREV PERCENTAGE</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.itemno }}</td>
            <td>{{ item.subDescription }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ item.unitCost.toFixed(2) }}</td>
            <td>{{ item.amount.toFixed(2) }}</td>
            <td>{{ item.wt_percent.toFixed(2) }}</td>
            <td>{{ getModifiedItem(item.itemno)?.quantity || '-' }}</td>
            <td>{{ getModifiedItem(item.itemno)?.amount?.toFixed(2) || '-' }}</td>
            <td>{{ getModifiedItem(item.itemno)?.wt_percent?.toFixed(2) || '-' }}</td>
            <td>{{ (item.wt_percent + (getModifiedItem(item.itemno)?.wt_percent || 0)).toFixed(2) }}</td>
          </tr>
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
        items: [],
        projectItemModifieds: []
      };
    },
    methods: {
      async fetchData() {
        const documentId = this.$route.params.documentId; // Get the documentId from the route parameter
        try {
          const response = await axios.get(`http://localhost:1337/api/header-per-project-sections?populate=*&filters[project][documentId][$eq]=${documentId}`);
          if (response.data && response.data.data.length > 0) {
            this.items = response.data.data.flatMap(section => section.items);
            this.projectItemModifieds = response.data.data.flatMap(section => section.project_item_modifieds);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      },
      getModifiedItem(itemno) {
        return this.projectItemModifieds.find(modItem => modItem.itemno === itemno) || null;
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

  </style>
  