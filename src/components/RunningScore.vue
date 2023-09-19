<template>
  <div class="one-hunned">
    <v-card variant="outlined" class="mt-4 mr-4 pa-3">
      <v-card-title>
        Current Hand:
      </v-card-title>
      <v-card-text>
        Dealt by: {{ currentHand.dealingPlayer.name }} <br>
        Select Trump Suit <br>
        <div class="d-flex justify-space-around mt-2">
          <v-btn v-for="suit in Constants.SUITS"
                 variant="outlined"
                 :active="suit.name === currentHand.trumpSuit"
                 @click="setTrumpSuit(suit.name)">
            <v-img
              :width="20" :alt="`${suit.name}`"
              :src="`./assets/${suit.name}.png`"/>
          </v-btn>
        </div>
        <v-text-field id="bid-input"
                      text
                      append-icon="mdi-plus"
                      @click:append="changeBid(true)"
                      prepend-icon="mdi-minus"
                      @click:prepend="changeBid(false)"
                      class="mt-4 inputPrice"
                      type="number"
                      label="Bid"
                      hide-spin-buttons
                      hide-details
                      variant="outlined"
                      v-model.number="currentHand.bid">
        </v-text-field>
        <v-select
          v-model="currentHand.biddingPlayer"
          :items="players"
          label="Bidder"
          class="mt-5"
          variant="outlined"
          hide-details
          placeholder="Select a player..."
          return-object
          item-title="name"
          item-value="id"
        ></v-select>
      </v-card-text>
      <v-card-actions v-if="currentHand.trumpSuit && currentHand.biddingPlayer.id">
        <v-btn color="indigo" variant="flat"
               @click="completeHand">
          Complete Hand
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
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import sumBy from 'lodash.sumby'
import Constants from "@/constants";
import {useAppStore} from '@/store/app'
import {storeToRefs} from "pinia";
import cloneDeep from "lodash.clonedeep";

const store = useAppStore();
const {currentHand, players, scores} = storeToRefs(store)

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
  //if they over bid and didnt try to make it
  else if (!currentHand.value.shootingTheMoon && ((((currentHand.value.bid - biddingTeamMeldScore) / Constants.TRICK_POINT_VALUE) > Constants.AVAILABLE_TRICKS))) {
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

function getNextDealer(currentHandDealerId) {
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
  -moz-appearance:textfield; /* Firefox */
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


</style>
