<template>
  <div class="form-container-wrapper">
    <!-- Routing Buttons Container -->
    <div class="routing-buttons me-15">
      <router-link to="/route1" class="btn btn-secondary">Create Work Accomplished Report</router-link>
      <router-link to="/route2" class="btn btn-secondary">Create Weekly Report</router-link>
    </div>

    <!-- Form Container -->
    <div class="form-container mt-5 ms-5">
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
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      project: {
        projectName: "",
        projectLocation: "",
        totalProjectAmount: null,
        projectDuration: null,
        sourceOfFund: "",
        startDate: "",
        dueDate: "",
      },
    };
  },
  methods: {
    async submitForm() {
      try {
        if (this.project.totalProjectAmount) {
          this.project.totalProjectAmount = Number(
            this.project.totalProjectAmount.toString().replace(/,/g, "")
          );
        }

        if (this.project.startDate) {
          this.project.startDate = this.formatDate(this.project.startDate);
        }
        if (this.project.dueDate) {
          this.project.dueDate = this.formatDate(this.project.dueDate);
        }

        const projectData = {
          ...this.project,
          actualCompletionDate: "2024-12-15",
        };

        // Create the project in the first API
        const response = await axios.post("http://localhost:1337/api/projects", {
          data: projectData,
        });

        console.log("Project created:", response.data);

        // Store the same data in the second API
        await axios.post("http://localhost:1337/api/project-with-modified-datas", {
          data: {
            projectName: this.project.projectName,
            projectLocation: this.project.projectLocation,
            totalProjectAmount: this.project.totalProjectAmount,
            projectDuration: this.project.projectDuration,
            sourceOfFund: this.project.sourceOfFund,
            startDate: this.project.startDate,
            dueDate: this.project.dueDate,
          },
        });

        console.log("Data also stored in second API");

        // Get the newly created project ID
        const projectId = response.data.data.id;

        // Redirect to the next page and pass the projectId to store the labels
        this.$router.push({ name: "OriginalContract", query: { projectId } });

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
      return date.toISOString().split("T")[0];
    },
  },
};
</script>

<style scoped>
/* Wrapper for positioning the form and buttons */
.form-container-wrapper {
  display: flex;
  justify-content: space-between;
  max-width: 900px;
}

/* Routing buttons styling */
.routing-buttons {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 10px;
}

.routing-buttons .btn {
  padding: 10px 15px;
  font-size: 14px;
  background-color: #114780;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.3s;
}

.routing-buttons .btn:hover {
  background-color: #047c08;
}

/* Main container styling */
.form-container {
  max-width: 700px;
  width: 100%;
  background: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: left;
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

@media (max-width: 600px) {
  .form-group {
    flex: 1 1 100%;
  }
  .form-container {
    padding: 20px;
  }
  .routing-buttons {
    position: static;
    margin-bottom: 10px;
  }
}
</style>
