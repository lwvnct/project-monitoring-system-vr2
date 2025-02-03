<template>
  <div class="form-container mt-5">
    <h2>Project Form</h2>
    <form @submit.prevent="submitForm">
      <div class="form-row">
        <div class="form-group" v-for="(value, key) in project" :key="key">
          <label :for="key">{{ formatLabel(key) }}</label>
          <input
            :id="key"
            v-model="project[key]"
            :type="getInputType(key)"
            @input="sanitizeNumberInput(key)"
            required
          />
        </div>
      </div>
      <button type="submit" class="btn">Submit</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      project: {
        projectName: "", // Empty initially, no default value
        projectLocation: "", // Empty initially, no default value
        totalProjectAmount: null, // Empty initially
        projectDuration: null, // Empty initially
        sourceOfFund: "", // Empty initially
        startDate: "", // Empty initially
        dueDate: "" // Empty initially
      }
    };
  },
  methods: {
    async submitForm() {
      try {
        // Ensure totalProjectAmount is a valid number (remove commas)
        if (this.project.totalProjectAmount) {
          this.project.totalProjectAmount = Number(
            this.project.totalProjectAmount.toString().replace(/,/g, "")
          );
        }

        // Ensure dates are formatted correctly (YYYY-MM-DD)
        if (this.project.startDate) {
          this.project.startDate = this.formatDate(this.project.startDate);
        }
        if (this.project.dueDate) {
          this.project.dueDate = this.formatDate(this.project.dueDate);
        }

        // Prepare data to send, including actualCompletionDate dynamically
        const projectData = {
          ...this.project,
          actualCompletionDate: "2024-12-15" // Default value, but not part of the form
        };

        const response = await axios.post("http://localhost:1337/api/projects", {
          data: projectData
        });

        console.log("Project created:", response.data);
        alert("Project submitted successfully!");
      } catch (error) {
        console.error("Error submitting project:", error.response?.data || error);
        alert(
          `Failed to submit project: ${error.response?.data?.error?.message || "Unknown error"}`
        );
      }
    },
    formatLabel(key) {
      return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
    },
    getInputType(key) {
      return key.includes("Date") ? "date" : key.includes("Amount") || key.includes("Duration") ? "number" : "text";
    },
    sanitizeNumberInput(key) {
      if (key.includes("Amount") || key.includes("Duration")) {
        this.project[key] = this.project[key]?.toString().replace(/,/g, "") || "";
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0]; // Converts to "YYYY-MM-DD"
    }
  }
};
</script>

<style scoped>
.form-container {
  max-width: 800px;
  margin: auto;
  background: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.form-group {
  flex: 1 1 calc(50% - 10px);
  min-width: 300px;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}
input:focus {
  border-color: #007bff;
  outline: none;
}
.btn {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 20px;
}
.btn:hover {
  background-color: #0056b3;
}
</style>
