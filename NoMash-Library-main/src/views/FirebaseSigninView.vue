<template>
  <h1>Sign in</h1>
  <p><input type="text" placeholder="Email" v-model="email" /></p>
  <p><input type="password" placeholder="Password" v-model="password" /></p>
  <p><button @click="signin">Sign In via Firebase</button></p>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";
import app from "../firebase/init.js";

const email = ref("");
const password = ref("");
const router = useRouter();
const auth = getAuth(app);

const signin = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((data) => {
      console.log("Firebase Login Successful!");
      router.push("/");
      console.log(auth.currentUser);
    })
    .catch((error) => {
      console.log(error.code);
    });
};
</script>