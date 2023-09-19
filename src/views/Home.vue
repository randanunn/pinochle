<template>
  <v-row class="height-100" v-if="!showPlayers">
    <v-col cols="8">
      <TeamScore ref="teamOneComponentRef" :team-number="1"></TeamScore>

      <TeamScore ref="teamTwoComponentRef" :team-number="2"></TeamScore>
    </v-col>
    <v-col cols="4">
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
      <v-card>
        <v-card-title>
          Please enter player names:
        </v-card-title>
        <v-card-text>
          Team 1: <br>
          <v-text-field text
                        type="text"
                        hide-details
                        label="Player 1"
                        v-model="players[0].name">
          </v-text-field>
          <v-checkbox label="First Dealer"
                      v-model="players[0].firstDealer"
                      :disabled="players[0].firstDealer"
                      @input="unsetPlayFirstCheckboxes(0)"
                      density="compact" hide-details></v-checkbox>
          <v-text-field text
                        type="text"
                        hide-details
                        label="Player 2"
                        v-model="players[1].name">
          </v-text-field>
          <v-checkbox label="First Dealer"
                      v-model="players[1].firstDealer"
                      :disabled="players[1].firstDealer"
                      @input="unsetPlayFirstCheckboxes(1)"
                      density="compact" hide-details></v-checkbox>
          <br><br>
          Team 2: <br>
          <v-text-field text
                        type="text"
                        hide-details
                        label="Player 1"
                        v-model="players[2].name">
          </v-text-field>
          <v-checkbox label="First Dealer"
                      v-model="players[2].firstDealer"
                      :disabled="players[2].firstDealer"
                      @input="unsetPlayFirstCheckboxes(2)"
                      density="compact" hide-details></v-checkbox>
          <v-text-field text
                        type="text"
                        hide-details
                        label="Player 2"
                        v-model="players[3].name">
          </v-text-field>
          <v-checkbox label="First Dealer"
                      v-model="players[3].firstDealer"
                      :disabled="players[3].firstDealer"
                      @input="unsetPlayFirstCheckboxes(3)"
                      density="compact" hide-details></v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-btn color="indigo"
                 :disabled="!players[0].name || !players[1].name || !players[2].name || !players[3].name"
                 @click="savePlayerNames(false)">
            Save Player Names
          </v-btn>
          <v-btn color="indigo"
                 @click="savePlayerNames(true)">
            Use Defaults
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
const { players, scoringStarted, currentHand } = storeToRefs(store)

const showPlayers = ref(true)
const teamOneComponentRef = ref()
const teamTwoComponentRef = ref()

const { VITE_ENV } = import.meta.env

onBeforeMount(() => {
  if(VITE_ENV !== 'local') {
    window.addEventListener("beforeunload", preventNav)
  }
})

function preventNav(event) {
  if (!scoringStarted.value) {
    return
  }
  event.preventDefault()
  event.returnValue = ""
}

function savePlayerNames(useDefaults) {
  if(useDefaults) {
    players.value[0].name = Constants.DEFAULT_PLAYER_NAMES[0]
    players.value[1].name = Constants.DEFAULT_PLAYER_NAMES[1]
    players.value[2].name = Constants.DEFAULT_PLAYER_NAMES[2]
    players.value[3].name = Constants.DEFAULT_PLAYER_NAMES[3]
  }
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
