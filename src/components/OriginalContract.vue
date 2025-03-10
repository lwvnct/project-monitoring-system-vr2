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

          <!-- Additional fields can be uncommented as needed -->
        </div>

        <button type="submit" class="btn mt-5" id="orange" :disabled="!sectionId || isSubmitting || isProjectItemButtonDisabled" @focus="enableProjectItemButton">Submit Item</button>
      </form>
    </div>

    <!-- Third Form: Material Details -->
    <div v-if="showMaterialForm" class="modal">
      <div class="modal-content">
        <h2>Material Details</h2>
        <form @submit.prevent="submitMaterial">
          <div class="form-group">
            <label for="material">Material</label>
            <input v-model="materialData.material" id="material" type="text" required />
          </div>

          <div class="form-group">
            <label for="materialQuantity">Quantity</label>
            <input v-model.number="materialData.quantity" id="materialQuantity" type="number" step="0.01" required />
          </div>

          <div class="form-group">
            <label for="materialUnit">Unit</label>
            <input v-model="materialData.unit" id="materialUnit" type="text" required />
          </div>

          <div class="form-group">
            <label for="materialPrice">Price</label>
            <input v-model.number="materialData.price" id="materialPrice" type="number" step="0.01" required />
          </div>

          <button type="submit" class="btn mt-5" :disabled="isSubmitting">Submit Material</button>
          <button type="button" class="btn mt-5" @click="done" :disabled="isSubmitting">Done</button>
        </form>
      </div>
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
      materialData: {
        material: "",
        quantity: null,
        unit: "",
        price: null,
      },
      sectionId: null, // ID of the created Project Section
      projectItemId: null, // ID of the created Project Item
      projectItemModifiedId: null, // ID of the created Project Item Modified
      isSubmitting: false, // To prevent multiple submissions
      isProjectItemButtonDisabled: false, // Disable the Project Item button until the section is submitted
      showMaterialForm: false, // Control visibility of the third form
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
      if (this.isSubmitting) return;
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

        this.isProjectItemButtonDisabled = false;
        alert("Project Section submitted successfully!");
      } catch (error) {
        console.error("Error submitting section:", error.response?.data || error);
        alert("Failed to submit project section.");
      } finally {
        this.isSubmitting = false;
      }
    },

    resetProjectItem() {
      this.projectItem = {
        itemno: "",
        subDescription: "",
        quantity: null,
        unit: "",
        unitCost: null,
        amount: null,
        wt_percent: null,
        header_per_project_section: this.sectionId,
      };
    },

    async submitProjectItem() {
      if (this.isSubmitting) return;
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

        // Remove wt_percent for the second API
        delete itemDataForSecondAPI.data.wt_percent;

        // Submit the project item and store its ID
        const response = await axios.post("http://localhost:1337/api/project-items", itemDataForFirstAPI);
        this.projectItemId = response.data.data.id;

        // Submit to project-item-modifieds and capture the modified item ID for later use
        const modifiedResponse = await axios.post("http://localhost:1337/api/project-item-modifieds", itemDataForSecondAPI);
        this.projectItemModifiedId = modifiedResponse.data.data.id;

        alert("Project Item submitted successfully!");
        this.resetProjectItem();
        this.showMaterialForm = true;
      } catch (error) {
        console.error("Error submitting project item:", error.response?.data || error);
        alert("Failed to submit project item.");
      } finally {
        this.isSubmitting = false;
      }
    },

    async submitMaterial() {
      if (this.isSubmitting) return;
      this.isSubmitting = true;
      try {
        console.log("Submitting material with:", this.materialData);

        if (!this.projectItemId) {
          alert("No project item found. Please submit a project item first.");
          return;
        }

        // Link the material to the project item ID for the first API
        const materialDataWithProjectItem = {
          ...this.materialData,
          project_item: this.projectItemId,
        };

        // Submit material to the original materials API
        const materialResponse = await axios.post(
          "http://localhost:1337/api/materials",
          {
            data: materialDataWithProjectItem,
          }
        );
        console.log("Material created:", materialResponse.data);

        // Prepare payload for material-modifieds using the project item modified ID and compute subtotal
        const materialModifiedPayload = {
          data: {
            material: this.materialData.material,
            quantity: this.materialData.quantity,
            unit: this.materialData.unit,
            price: this.materialData.price,
            project_item_modified: this.projectItemModifiedId,
            subtotal: this.materialData.quantity * this.materialData.price,
          },
        };

        // Submit to material-modifieds API
        const materialModifiedResponse = await axios.post(
          "http://localhost:1337/api/material-modifieds",
          materialModifiedPayload
        );
        console.log("Material modified created:", materialModifiedResponse.data);

        alert("Material submitted successfully!");
        this.resetMaterialData();
      } catch (error) {
        console.error("Error submitting material:", error.response?.data || error);
        alert("Failed to submit material.");
      } finally {
        this.isSubmitting = false;
      }
    },
    resetMaterialData() {
      this.materialData = {
        material: "",
        quantity: null,
        unit: "",
        price: null,
      };
    },
    done() {
      this.showMaterialForm = false;
      alert("You have completed the submission process.");
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
  background: rgb(255, 179, 1);
  color: black;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
}
</style>
