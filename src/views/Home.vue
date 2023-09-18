<template>
  <v-row class="height-50">
    <v-col cols="8">
      <TeamScore :team-number="1"></TeamScore>
    </v-col>
    <v-col cols="4">
      <RunningScore></RunningScore>
    </v-col>
  </v-row>
  <v-row class="height-50">
    <v-col cols="8">
      <TeamScore :team-number="2"></TeamScore>
    </v-col>
    <v-col cols="4">
      <Stats></Stats>
    </v-col>
  </v-row>
</template>

<script setup>
  import TeamScore from '@/components/TeamScore.vue'
  import RunningScore from '@/components/RunningScore.vue'
  import Stats from '@/components/Stats.vue'
</script>
