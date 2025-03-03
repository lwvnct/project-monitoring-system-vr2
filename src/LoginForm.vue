<!-- <template>
  <v-container>
    <v-form @submit.prevent="handleLogin">
      <v-text-field
        v-model="username"
        label="Username"
        required
      ></v-text-field>
      <v-text-field
        v-model="password"
        label="Password"
        type="password"
        required
      ></v-text-field>
      <v-btn type="submit" color="primary">Login</v-btn>
    </v-form>
  </v-container>
</template>

<script>
export default {
  name: "LoginForm",
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    handleLogin() {
      // Implement your login logic here.
      // For demonstration, we assume the login is successful.
      console.log("Logged in successfully");
      localStorage.setItem("isAuthenticated", "true");
      // Use replace to avoid creating an extra history entry.
      this.$router.replace({ name: "SampleDashboard" }).catch(err => {
        // Ignore redundant navigation errors.
        if (err.name !== "NavigationDuplicated") {
          console.error(err);
        }
      });
    },
  },
};
</script> -->
