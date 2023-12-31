<template>
  <div class="one-hunned">
    <v-card variant="outlined" class="mt-4 mr-4" :class="{'pa-3': !mobile}">
      <v-card-title v-if="!mobile">
        Current Hand:
      </v-card-title>
      <v-card-text>
        <div v-if="!mobile">
          Dealt by: {{ currentHand.dealingPlayer.name }} <br>
          Select Trump Suit <br>
        </div>
        <div class="d-flex justify-space-around mt-2" :style="{'flex-direction': mobile ? 'column' : 'row'}">
          <v-btn v-for="suit in Constants.SUITS"
                 variant="outlined"
                 :class="{'mb-2': mobile}"
                 :active="suit.name === currentHand.trumpSuit"
                 @click="setTrumpSuit(suit.name)">
            <v-img
              :width="20" :alt="`${suit.name}`"
              :src="`./assets/${suit.name}.png`"/>
          </v-btn>
        </div>
        <div class="d-flex justify-space-around mt-2 flex-column">
          <v-text-field id="bid-input"
                        text
                        append-icon="mdi-plus"
                        @click:append="changeBid(true)"
                        prepend-icon="mdi-minus"
                        @click:prepend="changeBid(false)"
                        class="mt-4 inputPrice mb-4"
                        :class="{'vertical-bid-display': mobile}"
                        type="number"
                        label="Bid"
                        hide-spin-buttons
                        hide-details
                        variant="outlined"
                        v-model.number="currentHand.bid">
          </v-text-field>
          <v-btn v-for="player in players"
                 variant="outlined"
                 class="ma-1"
                 :active="player.id === currentHand.biddingPlayer.id"
                 @click="currentHand.biddingPlayer = player">
            {{ player.name }}
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions v-if="currentHand.trumpSuit && currentHand.biddingPlayer.id">
        <v-btn :color="Constants.SYSTEM_COLOR" variant="flat"
               @click="completeHand">
          Complete {{ !mobile ? 'Hand' : '' }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card variant="outlined" class="mt-4 mr-4 pa-3 score-card">


      <table class="one-hunned pb-6">
        <thead>
        <tr>
          <th class="team-score-column">Team 1</th>
          <th class="team-score-column">Team 2</th>
          <th class="bid-column">Bid</th>
          <th class="deal-column">Dealt</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="gameScore in scores">
          <td class="team-score-column text-center">{{ gameScore.teamOneScore }}</td>
          <td class="team-score-column text-center">{{ gameScore.teamTwoScore }}</td>
          <td class="success bid-column text-center"
              :class="{'error': gameScore.handDetails.biddingPlayer.teamNumber === 1 ? gameScore.teamOneScore < gameScore.handDetails.bid : gameScore.teamTwoScore < gameScore.handDetails.bid}">
            <div class="d-flex justify-center">
              <v-img
                class="mr-2"
                :width="15"
                :max-width="15"
                :src="`./assets/${gameScore.handDetails.trumpSuit}.png`"/>
              {{ gameScore.handDetails.bid }} {{ gameScore.handDetails.biddingPlayer.name }}
            </div>
          </td>
          <td class="deal-column">
            {{ gameScore.handDetails.dealingPlayer.name }}
          </td>
        </tr>
        </tbody>
      </table>
      <v-spacer></v-spacer>
      <table class="one-hunned total-table">
        <tbody>
        <tr class="font-weight-bold">
          <td class="text-center team-score-column">{{ teamOneTotal }}</td>
          <td class="text-center team-score-column">{{ teamTwoTotal }}</td>
          <td class="bid-column"></td>
          <td class="deal-column"></td>
        </tr>
        </tbody>
      </table>
    </v-card>

    <v-card variant="outlined" class="mt-4 mr-4 pa-3 score-card" v-if="games.length > 0">
      <div v-for="(game, idx) in games">
        <strong>Game {{ game.gameNumber }} Final Score</strong>
        <div>
          <span :class="{'success': game.teamOneTotal > game.teamTwoTotal}">Team 1: {{ game.teamOneTotal }} </span>
          <span :class="{'success': game.teamOneTotal < game.teamTwoTotal}" class="ml-4">Team 2: {{
              game.teamTwoTotal
            }}</span>
        </div>
      </div>
    </v-card>

    <v-dialog width="500">
      <template v-slot:activator="{ props }">
        <v-btn :color="Constants.SYSTEM_COLOR"
               v-bind="props"
               class="new-game-button">
          New Game
        </v-btn>
      </template>

      <template v-slot:default="{ isActive  }">
        <v-card title="Confirm">
          <v-card-text>
            Are you sure you want to start a new game?
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="isActive.value = false">
              No
            </v-btn>
            <v-btn
              :color="Constants.SYSTEM_COLOR"
              variant="text"
              @click="[ isActive.value = false, createNewGame() ]">
              Yes
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>

  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import sumBy from 'lodash.sumby'
import Constants from "@/constants";
import {useAppStore} from '@/store/app'
import {storeToRefs} from "pinia";
import cloneDeep from "lodash.clonedeep";
import {useDisplay} from 'vuetify'

const store = useAppStore();
const {currentHand, players, scores, numberOfPlayers, games} = storeToRefs(store)

const {smAndDown: mobile} = useDisplay()

const props = defineProps({
  resetCallback: Function
})

const biddingTeamIsSet = ref(false)
const biddingTeamShotAndMadeIt = ref(false)

const teamOneTotal = computed(() => {
  return sumBy(scores.value, function (s) {
    return s.teamOneScore
  })
})
const teamTwoTotal = computed(() => {
  return sumBy(scores.value, function (s) {
    return s.teamTwoScore
  })
})

function setTrumpSuit(suitName) {
  currentHand.value.trumpSuit = suitName
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
  if ((currentHand.value.shootingTheMoon && (biddingTeamTrickScore !== (Constants.AVAILABLE_TRICKS * Constants.TRICK_POINT_VALUE)))) {
    biddingTeamIsSet.value = true
    biddingTeamHandScore = -(Constants.SHOOT_THE_MOON_SCORE)
  }
  //else if they tried to shoot they made it
  else if (currentHand.value.shootingTheMoon) {
    biddingTeamShotAndMadeIt.value = true
    passingTeamHandScore = 0
    biddingTeamHandScore = Constants.SHOOT_THE_MOON_SCORE
  }
  //if they over bid and didn't play the hand at all (no teams got tricks)
  else if (!currentHand.value.shootingTheMoon && currentHand.value.teamOne.tricks === 0 && currentHand.value.teamTwo.tricks === 0) {
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
  let currentHandDealerId = currentHand.value.dealingPlayer.id
  currentHand.value = cloneDeep(Constants.NEW_BLANK_HAND)

  currentHand.value.dealingPlayer = getNextDealer(currentHandDealerId)

  props.resetCallback()
}

function createNewGame() {
  //reset all the things
  games.value.push({
    gameNumber: games.value.length + 1,
    teamOneTotal: teamOneTotal.value,
    teamTwoTotal: teamTwoTotal.value,
    scores: cloneDeep(scores.value)
  })
  let tempDealingPlayer = {
    ...currentHand.value.dealingPlayer
  }

  props.resetCallback()
  currentHand.value = cloneDeep(Constants.NEW_BLANK_HAND)
  currentHand.value.dealingPlayer = tempDealingPlayer
  scores.value = []
}

function getNextDealer(currentHandDealerId) {
  if (numberOfPlayers.value === 4) {
    switch (currentHandDealerId) {
      case 1:
        return players.value.find(p => p.id === 3)
      case 2:
        return players.value.find(p => p.id === 4)
      case 3:
        return players.value.find(p => p.id === 2)
      case 4:
        return players.value.find(p => p.id === 1)
    }
  } else {
    switch (currentHandDealerId) {
      case 1:
        return players.value.find(p => p.id === 2)
      case 2:
        return players.value.find(p => p.id === 1)
    }
  }

}

function changeBid(increment) {
  currentHand.value.bid = increment ? currentHand.value.bid + Constants.TRICK_POINT_VALUE : currentHand.value.bid - Constants.TRICK_POINT_VALUE
}

</script>

<style lang="scss">
#bid-input::-webkit-outer-spin-button,
#bid-input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

#bid-input[type=number] {
  -moz-appearance: textfield; /* Firefox */
}

.vertical-bid-display > div.v-input__prepend {
  margin-inline-end: 0 !important;
  margin-bottom: 10px;
  align-self: center
}

.vertical-bid-display > div.v-input__append {
  margin-inline-start: 0 !important;
  margin-top: 10px;
  align-self: center
}
</style>

<style scoped lang="scss">

.score-card {
  min-height: 200px;
  position: relative;
}

.total-score-column {
  width: 50px;
  max-width: 50px;
}

.team-score-column {
  width: 100px;
}

.bid-column {
  width: 200px
}

.deal-column {
  width: 75px;
}

.total-table {
  position: absolute;
  bottom: 10px;
}

.new-game-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.vertical-bid-display {
  display: flex;
  flex-direction: column;
}
</style>
