<template>
  <v-row class="height-100" v-if="!showPlayers">
    <v-col cols="8">
      <v-btn color="indigo"
             v-if="currentHand.trumpSuit && currentHand.biddingPlayer.id"
             @click="completeHand">
        Complete Hand
      </v-btn>
      <TeamScore ref="teamOneComponentRef" :team-number="1"></TeamScore>

      <TeamScore ref="teamTwoComponentRef" :team-number="2"></TeamScore>
    </v-col>
    <v-col cols="4">
      <v-row class="height-100">
        <v-col cols="12">
          <RunningScore></RunningScore>
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
                        label="Player 1"
                        v-model="players[0].name">
          </v-text-field>
          <v-text-field text
                        type="text"
                        label="Player 2"
                        v-model="players[1].name">
          </v-text-field>
          <br><br>
          Team 2: <br>
          <v-text-field text
                        type="text"
                        label="Player 1"
                        v-model="players[2].name">
          </v-text-field>
          <v-text-field text
                        type="text"
                        label="Player 2"
                        v-model="players[3].name">
          </v-text-field>
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
import cloneDeep from 'lodash.clonedeep'

import {ref, onBeforeMount} from "vue";
import Constants from "@/constants";

const store = useAppStore();
const { currentHand, players, scores, scoringStarted } = storeToRefs(store)

const showPlayers = ref(true)
const biddingTeamIsSet = ref(false)
const biddingTeamShotAndMadeIt = ref(false)

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
}

function completeHand() {
  //reset value
  biddingTeamIsSet.value = false
  biddingTeamShotAndMadeIt.value = false

  //get current hand score values for bidding team
  let biddingTeam = currentHand.value.biddingPlayer.teamNumber
  let biddingTeamTrickScore = biddingTeam === 1 ? currentHand.value.teamOne.tricks * Constants.TRICK_POINT_VALUE : currentHand.value.teamTwo.tricks * Constants.TRICK_POINT_VALUE
  let biddingTeamMeldScore = biddingTeam === 1 ? currentHand.value.teamOne.meld : currentHand.value.teamTwo.meld
  let biddingTeamHandScore = biddingTeamTrickScore + biddingTeamMeldScore

  //get current hand score values for non-bidding team
  let passingTeamTrickScore = biddingTeam === 1 ? currentHand.value.teamTwo.tricks * Constants.TRICK_POINT_VALUE : currentHand.value.teamOne.tricks * Constants.TRICK_POINT_VALUE
  let passingTeamMeldScore = biddingTeam === 1 ? currentHand.value.teamTwo.meld : currentHand.value.teamOne.meld
  //if the passing team didn't get any tricks they don't get to keep their meld (unless the other team shot the moon)
  let passingTeamHandScore = (!currentHand.value.shootingTheMoon && passingTeamTrickScore === 0) ? 0 : passingTeamTrickScore + passingTeamMeldScore

  //if they tried to shoot and failed:
  if((currentHand.value.shootingTheMoon && (biddingTeamTrickScore !== (Constants.AVAILABLE_TRICKS * Constants.TRICK_POINT_VALUE)))) {
    biddingTeamIsSet.value = true
    biddingTeamHandScore = -(Constants.SHOOT_THE_MOON_SCORE)
  }
  //else if they tried to shoot they made it
  else if (currentHand.value.shootingTheMoon) {
    biddingTeamShotAndMadeIt.value = true
    passingTeamHandScore = 0
    biddingTeamHandScore = Constants.SHOOT_THE_MOON_SCORE
  }
  //if they over bid and didnt try to make it
  else if(!currentHand.value.shootingTheMoon && ( (((currentHand.value.bid - biddingTeamMeldScore) / Constants.TRICK_POINT_VALUE) > Constants.AVAILABLE_TRICKS))) {
    biddingTeamIsSet.value = true
    biddingTeamHandScore = -(currentHand.value.bid)
    //the passing team does get their meld points in this scenario
    passingTeamHandScore = passingTeamMeldScore
  }
  //if they tried to make it and failed
  else if (biddingTeamMeldScore + biddingTeamTrickScore < currentHand.value.bid) {
    biddingTeamIsSet.value = true
    biddingTeamHandScore = -(currentHand.value.bid)
  }

  let gameObject = {
    teamOneScore: biddingTeam === 1 ? biddingTeamHandScore : passingTeamHandScore,
    teamTwoScore: biddingTeam === 2 ? biddingTeamHandScore : passingTeamHandScore,
    handDetails: cloneDeep(currentHand.value)
  }

  scores.value.push(gameObject)
  currentHand.value = cloneDeep(Constants.NEW_BLANK_HAND)

  teamOneComponentRef.value.resetScoreObject();
  teamTwoComponentRef.value.resetScoreObject();
}

</script>
