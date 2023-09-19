<template>
  <div class="one-hunned">
    <v-card variant="flat" class="pa-3">
      Current Hand: <br>
      Select Trump Suit <br>
      <v-btn v-for="suit in Constants.SUITS"
             variant="outlined"
             class="ml-3"
             :active="suit.name === currentHand.trumpSuit"
             @click="setTrumpSuit(suit.name)">
<!--        {{suit.name}}-->
        <v-img
          :width="20" :alt="`${suit.name}`"
          :src="`./assets/${suit.name}.png`"/>
      </v-btn>
      <v-text-field text
                    class="mt-2"
                    type="number"
                    label="Bid"
                    hide-details
                    variant="solo"
                    v-model.number="currentHand.bid">
      </v-text-field>
      <v-select
        v-model="currentHand.biddingPlayer"
        :items="players"
        label="Bidder"
        class="mt-2"
        placeholder="Select a player..."
        return-object
        item-title="name"
        item-value="id"
      ></v-select>
    </v-card>

    <table>
      <thead>
      <tr>
        <th></th>
        <th>Team 1</th>
        <th>Team 2</th>
        <th>Bid</th>
      </tr>
      </thead>
      <tbody>
        <tr v-for="gameScore in scores">
          <td></td>
        <td>{{ gameScore.teamOneScore }}</td>
        <td>{{ gameScore.teamTwoScore }}</td>
        <td class="success" :class="{'error': gameScore.handDetails.biddingPlayer.teamNumber === 1 ? gameScore.teamOneScore < gameScore.handDetails.bid : gameScore.teamTwoScore < gameScore.handDetails.bid}">
          <div class="d-flex">
            <v-img
              class="mr-2"
              :width="15"
              :src="`./assets/${gameScore.handDetails.trumpSuit}.png`"/>
            {{ gameScore.handDetails.bid }} {{ gameScore.handDetails.biddingPlayer.name }}
          </div>
        </td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="font-weight-bold">
          <td>Total</td>
          <td>{{ teamOneTotal }}</td>
          <td>{{ teamTwoTotal }}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import sumBy from 'lodash.sumby'
import Constants from "@/constants";
import { useAppStore } from '@/store/app'
import {storeToRefs} from "pinia";

const store = useAppStore();

const { currentHand, players, scores } = storeToRefs(store)

const teamOneTotal = computed(() => {
  return sumBy(scores.value,  function(s) { return s.teamOneScore })
})
const teamTwoTotal = computed(() => {
  return sumBy(scores.value,  function(s) { return s.teamTwoScore })
})

function setTrumpSuit(suitName) {
  currentHand.value.trumpSuit = suitName
}

</script>
