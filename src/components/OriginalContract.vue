<template>
  <div class="form-wrapper mt-3 mx-15">
    <!-- First Form: Project Section -->
    <div class="form-container">
      <h2>New Project Section</h2>
      <form @submit.prevent="submitSection">
        <div class="form-group">
          <label for="letterLabel">Letter Label</label>
          <input v-model="formData.letter_label_for_item_no" id="letterLabel" type="text" required @input="disableProjectItemButton" />
        </div>

        <div class="form-group">
          <label for="mainDescription">Main Description</label>
          <input v-model="formData.mainDescription" id="mainDescription" type="text" required @input="disableProjectItemButton" />
        </div>

        <button type="submit" class="btn mt-5" :disabled="isSubmitting">Submit Section</button>
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
              <input v-model.number="projectItem.quantity" id="quantity" type="number" step="0.01" required :disabled="!sectionId" />
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
  
          <button type="submit" class="btn mt-5" id="orange" :disabled="!sectionId || isSubmitting || isProjectItemButtonDisabled" @focus="enableProjectItemButton">Submit Item</button>
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
        project: null,
        project_with_modified_datum: null,
      },
      projectItem: {
        itemno: "",
        subDescription: "",
        quantity: null,
        unit: "",
        unitCost: null,
        amount: null,
        wt_percent: null,
        header_per_project_section: null,
      },
      sectionId: null, // To store the ID of the created Project Section
      isSubmitting: false, // To prevent multiple submissions
      isProjectItemButtonDisabled: false, // To disable the Project Item button until the Project Section is submitted
    };
  },
  created() {
    // Extract projectId and secondprojectId from the URL
    this.formData.project = Number(this.$route.query.projectId) || null;
    this.formData.project_with_modified_datum = Number(this.$route.query.secondprojectId) || null;

    console.log("Extracted Project ID:", this.formData.project);
    console.log("Extracted Second Project ID:", this.formData.project_with_modified_datum);

    // Redirect to the home page if no project ID is found
    if (!this.formData.project || !this.formData.project_with_modified_datum) {
      alert("No project ID found.");
      this.$router.push("/");
    }
  },
  methods: {
    disableProjectItemButton() {
      this.isProjectItemButtonDisabled = true;
    },
    enableProjectItemButton() {
      this.isProjectItemButtonDisabled = false;
    },
    async submitSection() {
      if (this.isSubmitting) return; // Prevent multiple submissions
      this.isSubmitting = true;
      try {
        console.log("Submitting section with:", this.formData);

        const sectionResponse = await axios.post(
          "http://localhost:1337/api/header-per-project-sections?populate=*",
          {
            data: this.formData,
          }
        );

        console.log("Section created:", sectionResponse.data);
        this.sectionId = sectionResponse.data.data.id;
        this.projectItem.header_per_project_section = this.sectionId;

        this.isProjectItemButtonDisabled = false; // Enable the button after successful submission
        alert("Project Section submitted successfully!");
      } catch (error) {
        console.error("Error submitting section:", error.response?.data || error);
        alert("Failed to submit project section.");
      } finally {
        this.isSubmitting = false;
      }
    },

    async submitProjectItem() {
      if (this.isSubmitting) return; // Prevent multiple submissions
      this.isSubmitting = true;
      try {
        if (!this.sectionId) {
          alert("Please submit the Project Section first.");
          return;
        }

        const itemDataForFirstAPI = { data: this.projectItem };
        const itemDataForSecondAPI = {
          data: {
            ...this.projectItem,
            header_per_project_section: this.sectionId,
          },
        };

        delete itemDataForSecondAPI.data.wt_percent; // Remove wt_percent for the second API

        await axios.post("http://localhost:1337/api/project-items", itemDataForFirstAPI);
        await axios.post("http://localhost:1337/api/project-item-modifieds", itemDataForSecondAPI);

        alert("Project Item submitted successfully!");
      } catch (error) {
        console.error("Error submitting project item:", error.response?.data || error);
        alert("Failed to submit project item.");
      } finally {
        this.isSubmitting = false;
      }
    },
  },
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
  background: #066913;
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

#orange {
  background:rgb(255, 179, 1);
  color: black;
}
</style>
