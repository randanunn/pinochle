<template>
  <v-card class="one-hunned">
    Team {{props.teamNumber}} Score
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  teamNumber: Number
})
// const show = ref(false)
</script>
