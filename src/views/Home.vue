<template>
  <v-row class="height-100" v-if="!showPlayers">
    <v-col cols="8" v-if="currentHand.trumpSuit && currentHand.biddingPlayer.id && currentHand.bid % Constants.TRICK_POINT_VALUE === 0">
      <TeamScore ref="teamOneComponentRef" :team-number="1"></TeamScore>
      <v-divider class="mt-3"></v-divider>
      <TeamScore ref="teamTwoComponentRef" :team-number="2"></TeamScore>
    </v-col>
    <v-col cols="8" v-else class="pa-5">Please Enter Current Hand Info...</v-col>
    <v-col cols="4" class="right-pane mb-0">
      <v-row class="height-100">
        <v-col cols="12">
          <RunningScore :reset-callback="resetScoreObjectPassthru"></RunningScore>
        </v-col>
      </v-row>
<!--      <v-row class="height-50">-->
<!--        <v-col cols="12">-->
<!--          <Stats></Stats>-->
<!--        </v-col>-->
<!--      </v-row>-->
    </v-col>
  </v-row>
  <v-row v-else>
    <v-col cols="12">
      <v-card flat>
        <v-card-title>
          Enter Player Information:
        </v-card-title>
        <v-card-text>
          <v-radio-group inline label="Number of Players"
                         v-model="numberOfPlayers"
                         @change="changePlayerCount()">
            <v-radio label="Two" :value="2"></v-radio>
            <v-radio label="Four" :value="4"></v-radio>
          </v-radio-group>

          <h3 class="mb-3">Team 1:</h3>
          <div v-for="(player, idx) in players.slice(0, (players.length / 2))">
            <v-text-field text
                          type="text"
                          hide-details
                          label="Name"
                          v-model="player.name">
            </v-text-field>
            <v-checkbox label="First Dealer"
                        v-model="player.firstDealer"
                        :disabled="player.firstDealer"
                        class="mb-4"
                        @input="unsetPlayFirstCheckboxes(player.id - 1)"
                        density="compact" hide-details></v-checkbox>
          </div>
          <br><br>
          <h3 class="mb-3">Team 2:</h3>
          <div v-for="(player, idx) in players.slice((players.length / 2), players.length)">
            <v-text-field text
                          type="text"
                          hide-details
                          label="Name"
                          v-model="player.name">
            </v-text-field>
            <v-checkbox label="First Dealer"
                        class="mb-4"
                        v-model="player.firstDealer"
                        :disabled="player.firstDealer"
                        @input="unsetPlayFirstCheckboxes(player.id - 1)"
                        density="compact" hide-details></v-checkbox>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-btn :color="Constants.SYSTEM_COLOR"
                 variant="flat"
                 class="ml-3"
                 @click="savePlayerNames(false)">
            Confirm Player Names & Start
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import TeamScore from '@/components/TeamScore.vue'
import RunningScore from '@/components/RunningScore.vue'
import Stats from '@/components/Stats.vue'
import { useAppStore } from '@/store/app'
import {storeToRefs} from "pinia"

import {ref, onBeforeMount} from "vue";
import Constants from "@/constants";
import cloneDeep from "lodash.clonedeep";

const store = useAppStore();
const { players, scoringStarted, currentHand, numberOfPlayers, slidersSynced } = storeToRefs(store)

const showPlayers = ref(true)
const teamOneComponentRef = ref()
const teamTwoComponentRef = ref()

const { VITE_ENV } = import.meta.env

onBeforeMount(() => {
  if(VITE_ENV !== 'local') {
    window.addEventListener("beforeunload", preventNav)
  }
})

function changePlayerCount() {
  players.value = []
  for( let i = 0; i < numberOfPlayers.value; i++ ) {
    let id = i + 1
    players.value.push({
      id: id,
      name: 'Player ' + id,
      teamNumber: id <= numberOfPlayers.value / 2 ? 1 : 2,
      firstDealer: i === 0
    })
  }

  // sync/unsync the sliders
  slidersSynced.value = numberOfPlayers.value !== 2
}

function preventNav(event) {
  if (!scoringStarted.value) {
    return
  }
  event.preventDefault()
  event.returnValue = ""
}

function savePlayerNames() {
  showPlayers.value = false
  scoringStarted.value = true
  currentHand.value.dealingPlayer = cloneDeep(players.value.find(p => p.firstDealer))
}

function resetScoreObjectPassthru() {
  //a child cannot emit to different child. so i am emitting from child to parent then back down to
  teamOneComponentRef.value.resetScoreObject();
  teamTwoComponentRef.value.resetScoreObject();
}

function unsetPlayFirstCheckboxes(playerIndex) {
  players.value.forEach((p, idx) => {
    if(idx !== playerIndex) {
      p.firstDealer = false
    }
  })
}

</script>

<style scoped lang="scss">
.right-pane {
  border-left: solid 1px #E4E4E4;
}
</style>
