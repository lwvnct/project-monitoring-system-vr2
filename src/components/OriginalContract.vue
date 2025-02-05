<template>
  <div class="form-wrapper mt-3 mx-15">
    <!-- First Form: Project Section -->
    <div class="form-container">
      <h2>New Project Section</h2>
      <form @submit.prevent="submitSection">
        <div class="form-group">
          <label for="letterLabel">Letter Label</label>
          <input v-model="formData.letter_label_for_item_no" id="letterLabel" type="text" required />
        </div>

        <div class="form-group">
          <label for="mainDescription">Main Description</label>
          <input v-model="formData.mainDescription" id="mainDescription" type="text" required />
        </div>

        <button type="submit" class="btn mt-5">Submit Section</button>
      </form>
    </div>

    <!-- Second Form: Project Items -->
    <div class="form-container">
      <h2>Project Item Details</h2>
      <form @submit.prevent="submitProjectItem">
        <div v-if="!sectionId" class="alert">
          <p><strong>Note:</strong> Please submit the Project Section first.</p>
        </div>

        <div class="form-fields">
          <div class="form-group">
            <label for="itemno">Item Number</label>
            <input v-model="projectItem.itemno" id="itemno" type="text" required :disabled="!sectionId" />
          </div>

          <div class="form-group">
            <label for="subDescription">Sub Description</label>
            <input v-model="projectItem.subDescription" id="subDescription" type="text" required :disabled="!sectionId" />
          </div>

          <div class="form-group">
            <label for="quantity">Quantity</label>
            <input v-model.number="projectItem.quantity" id="quantity" type="number" required :disabled="!sectionId" />
          </div>

          <div class="form-group">
            <label for="unit">Unit</label>
            <input v-model="projectItem.unit" id="unit" type="text" required :disabled="!sectionId" />
          </div>

          <div class="form-group">
            <label for="unitCost">Unit Cost</label>
            <input v-model.number="projectItem.unitCost" id="unitCost" type="number" step="0.01" required :disabled="!sectionId" />
          </div>

          <div class="form-group">
            <label for="amount">Amount</label>
            <input v-model.number="projectItem.amount" id="amount" type="number" step="0.01" required :disabled="!sectionId" />
          </div>

          <div class="form-group">
            <label for="wtPercent">Weight Percent</label>
            <input v-model.number="projectItem.wt_percent" id="wtPercent" type="number" step="0.01" required :disabled="!sectionId" />
          </div>
        </div>

        <button type="submit" class="btn mt-5" :disabled="!sectionId">Submit Item</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "OriginalContract",
  data() {
    return {
      formData: {
        letter_label_for_item_no: "",
        mainDescription: "",
        project: this.$route.query.projectId || ""
      },
      projectItem: {
        itemno: "",
        subDescription: "",
        quantity: null,
        unit: "",
        unitCost: null,
        amount: null,
        wt_percent: null,
        header_per_project_section: null
      },
      sectionId: null
    };
  },
  async created() {
    if (!this.formData.project) {
      alert("No project ID found.");
      this.$router.push("/");
    }
  },
  methods: {
    async submitSection() {
      try {
        // Create the project section (label) first
        const sectionResponse = await axios.post(
          "http://localhost:1337/api/header-per-project-sections",
          {
            data: this.formData
          }
        );
        console.log("Section created:", sectionResponse.data);

        // Store the returned section ID and assign to projectItem relation
        this.sectionId = sectionResponse.data.data.id;
        this.projectItem.header_per_project_section = this.sectionId;

        // Now update the project-with-modified-datas record to include this section
        // We assume that the project record's id is available in formData.project
        await axios.patch(
          `http://localhost:1337/api/project-with-modified-datas/${this.formData.project}`,
          {
            data: {
              // If more than one header is allowed, you might first fetch the existing array and merge.
              header_per_project_sections: [this.sectionId]
            }
          }
        );

        alert("Project Section submitted and linked successfully!");
      } catch (error) {
        console.error("Error submitting section:", error.response?.data || error);
        alert("Failed to submit project section.");
      }
    },

    async submitProjectItem() {
      try {
        if (!this.sectionId) {
          alert("Please submit the Project Section first.");
          return;
        }

        const itemDataForFirstAPI = { data: this.projectItem };

        const itemDataForSecondAPI = {
          data: {
            ...this.projectItem,
            header_per_project_section: this.sectionId // Ensures the relation is included
          }
        };
        // Remove wt_percent for the second API as required
        delete itemDataForSecondAPI.data.wt_percent;

        await axios.post("http://localhost:1337/api/project-items", itemDataForFirstAPI);
        await axios.post("http://localhost:1337/api/project-item-modifieds", itemDataForSecondAPI);

        alert("Project Item submitted successfully!");
      } catch (error) {
        console.error("Error submitting project item:", error.response?.data || error);
        alert("Failed to submit project item.");
      }
    }
  }
};
</script>

<style scoped>
.form-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  flex-wrap: wrap;
  background-color: white;
  border-radius: 10px;
}
.form-container {
  max-width: 500px;
  width: 100%;
  padding: 20px;
  border-radius: 10px;
  flex-grow: 1;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
.form-fields {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
}
.form-group {
  margin-bottom: 5px;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}
input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}
.btn {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}
.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.alert {
  background: #fff3cd;
  padding: 5px;
  border: 1px solid #ffeeba;
  color: #856404;
  margin-bottom: 5px;
  border-radius: 5px;
}
</style>
