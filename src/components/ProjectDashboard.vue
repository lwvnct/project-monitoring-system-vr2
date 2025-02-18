<template>
  <div class="form-container-wrapper">

    <!-- Form Container -->
    <div class="form-container mt-5 ms-5">
      <h2>Project Form</h2>
      <form @submit.prevent="submitForm" enctype="multipart/form-data">
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

          <!-- File Upload -->
          <div class="form-group">
            <label for="projectImage">Project Image</label>
            <input
              type="file"
              id="projectImage"
              @change="handleFileUpload"
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
        projectImage: null, // For storing the selected image file
      },
    };
  },
  methods: {
    async submitForm() {
      try {
        // Sanitize and format input data
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

        // Create FormData to include the file in the request
        const formData = new FormData();
        formData.append("files", this.project.projectImage);
        formData.append("ref", "projects"); // Model reference
        formData.append("refId", "null"); // ID to link (use `null` if not linking to an existing entry)
        formData.append("field", "projectImage"); // The field for image

        // Upload the image to Strapi
        const fileUploadResponse = await axios.post(
          "http://localhost:1337/api/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const uploadedImageId = fileUploadResponse.data[0].id;

        // Now, create the project with the uploaded image ID
        const projectData = {
          projectName: this.project.projectName,
          projectLocation: this.project.projectLocation,
          totalProjectAmount: this.project.totalProjectAmount,
          projectDuration: this.project.projectDuration,
          sourceOfFund: this.project.sourceOfFund,
          startDate: this.project.startDate,
          dueDate: this.project.dueDate,
          projectImage: uploadedImageId, // Associate the uploaded image with the project
        };

        // Create the project in the first API
        const response = await axios.post("http://localhost:1337/api/projects", {
          data: projectData,
        });

        console.log("Project created:", response.data);

        // Store the same data in the second API
        const secondResponse = await axios.post(
          "http://localhost:1337/api/project-with-modified-datas",
          {
            data: projectData,
          }
        );

        console.log("Data also stored in second API");

        // Get the newly created project ID
        const projectId = response.data.data.id;
        const secondprojectId = secondResponse.data.data.id;

        // Redirect to the next page and pass the projectId
        this.$router.push({
          name: "OriginalContract",
          query: { projectId, secondprojectId },
        });

        alert("Project submitted successfully!");
      } catch (error) {
        console.error("Error submitting project:", error.response?.data || error);
        alert(
          `Failed to submit project: ${error.response?.data?.error?.message || "Unknown error"}`
        );
      }
    },
    handleFileUpload(event) {
      this.project.projectImage = event.target.files[0]; // Store the selected file
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
  justify-content: center;
  max-width: 900px;
  margin: 0 auto;
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

input[type="file"] {
  padding: 6px;
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
}
</style>
