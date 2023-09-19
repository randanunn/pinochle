<template>
  <v-row v-if="currentHand.trumpSuit && currentHand.biddingPlayer.id">
    <v-col cols="10">
      <v-card elevation="0" class="pa-5">
        Team {{ teamNumber }}
        Meld: {{ teamNumber === 1 ? currentHand.teamOne.meld : currentHand.teamTwo.meld }}
        Tricks: {{ teamNumber === 1 ? currentHand.teamOne.tricks : currentHand.teamTwo.tricks }}
        Tricks Value:
        {{ teamNumber === 1 ? currentHand.teamOne.tricks * Constants.TRICK_POINT_VALUE : currentHand.teamTwo.tricks * Constants.TRICK_POINT_VALUE }}
      <span v-if="teamNumber === currentHand.biddingPlayer.teamNumber"
        :class="{'error': tricksRequired > Constants.AVAILABLE_TRICKS}">
        Tricks Required: {{ tricksRequired }}
      </span>
        <br>
        Players: {{ getPlayerNames() }}

        <v-checkbox v-if="teamNumber === currentHand.biddingPlayer.teamNumber"
                    label="Shoot the Moon"
                    v-model="currentHand.shootingTheMoon"
                    @change="resetScoreObject"
                    density="compact" hide-details>
        </v-checkbox>


        <div>
          <div class="scoring-card"
               :class="{'subscore': scoring.subscore}"
               v-for="(scoring, idx) in scoreOptions"
               :key="idx">

            {{ scoring.name }}

            <div class="d-inline-block">
              <v-checkbox label="Single"
                          class="d-inline-block"
                          :readonly="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon) ||
                                 (scoring.affectedByRoundRobin && hasRoundRobin) ||
                                 (scoring.subscore && !scoreOptions['RUN'].single)"
                          :disabled="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon) ||
                                  (scoring.affectedByRoundRobin && hasRoundRobin) ||
                                  (scoring.subscore && !scoreOptions['RUN'].single)"
                          v-model="scoring.single"
                          @change="updateScore($event, scoring, false)"
                          density="compact" hide-details>
              </v-checkbox>
              <v-checkbox v-if="scoring.doubleValue"
                          label="Double"
                          class="d-inline-block"
                          :readonly="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon)"
                          :disabled="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon)"
                          v-model="scoring.double"
                          density="compact" hide-details
                          @change="updateScore($event, scoring, true)">
              </v-checkbox>
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="2" class="text-center pt-7">
      Trick Count:
      <v-slider
        :model-value="trickCount"
        :color="sliderColor"
        thumb-label="always"
        @update:model-value="changeSlider($event)"
        track-color="grey"
        direction="vertical"
        min="0"
        :max="Constants.AVAILABLE_TRICKS"
        :step="1"
      >
        <template v-slot:prepend>
          <v-btn
            size="small"
            variant="text"
            icon="mdi-minus"
            :color="sliderColor"
            @click="decrement"
          ></v-btn>
        </template>

        <template v-slot:append>
          <v-btn
            size="small"
            variant="text"
            icon="mdi-plus"
            :color="sliderColor"
            @click="increment"
          ></v-btn>
        </template>
      </v-slider>
      <v-btn color="indigo" @click="resetTrickCounts()">Reset</v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import Constants from '@/constants'
import cloneDeep from 'lodash.clonedeep'
import {storeToRefs} from 'pinia'
import {useAppStore} from '@/store/app'
import {ref, computed, onMounted} from 'vue'

const props = defineProps({
  teamNumber: Number
})

const store = useAppStore();

const {currentHand, players} = storeToRefs(store)
const scoreOptions = ref({})
const scoreObject = ref({})
const hasRoundRobin = ref(false)

// const meldScore = computed(() => {
//   return Object.values(scoreObject.value).reduce((total, val) => val + total, 0)
// })
const trickCount = computed(() => {
  return props.teamNumber === 1 ? currentHand.value.teamOne.tricks : currentHand.value.teamTwo.tricks
})
const tricksRequired = computed(() => {
  let meldScore = props.teamNumber === 1 ? currentHand.value.teamOne.meld : currentHand.value.teamTwo.meld
  return currentHand.value.shootingTheMoon ? Constants.AVAILABLE_TRICKS : Math.max(1, ((currentHand.value.bid - meldScore) / 10))
})

const sliderColor = ref('indigo')

function changeSlider(event) {
  if (props.teamNumber === 1) {
    currentHand.value.teamOne.tricks = event
    currentHand.value.teamTwo.tricks = Constants.AVAILABLE_TRICKS - currentHand.value.teamOne.tricks
  } else {
    currentHand.value.teamTwo.tricks = event
    currentHand.value.teamOne.tricks = Constants.AVAILABLE_TRICKS - currentHand.value.teamTwo.tricks
  }
}

function resetTrickCounts() {
  currentHand.value.teamOne.tricks = 0
  currentHand.value.teamTwo.tricks = 0
}

function decrement() {
  if (props.teamNumber === 1) {
    currentHand.value.teamOne.tricks = currentHand.value.teamOne.tricks > 0 ? currentHand.value.teamOne.tricks - 1 : currentHand.value.teamOne.tricks
    currentHand.value.teamTwo.tricks = Constants.AVAILABLE_TRICKS - currentHand.value.teamOne.tricks
  } else {
    currentHand.value.teamTwo.tricks = currentHand.value.teamTwo.tricks > 0 ? currentHand.value.teamTwo.tricks - 1 : currentHand.value.teamTwo.tricks
    currentHand.value.teamOne.tricks = Constants.AVAILABLE_TRICKS - currentHand.value.teamTwo.tricks
  }
}

function increment() {
  if (props.teamNumber === 1) {
    currentHand.value.teamOne.tricks = currentHand.value.teamOne.tricks < Constants.AVAILABLE_TRICKS ? currentHand.value.teamOne.tricks + 1 : currentHand.value.teamOne.tricks
    currentHand.value.teamTwo.tricks = Constants.AVAILABLE_TRICKS - currentHand.value.teamOne.tricks
  } else {
    currentHand.value.teamTwo.tricks = currentHand.value.teamTwo.tricks < Constants.AVAILABLE_TRICKS ? currentHand.value.teamTwo.tricks + 1 : currentHand.value.teamTwo.tricks
    currentHand.value.teamOne.tricks = Constants.AVAILABLE_TRICKS - currentHand.value.teamTwo.tricks
  }
}

onMounted(() => {
  Object.keys(Constants.SCORING).forEach(scoreKey => {
    if (scoreKey === 'MARRIAGE') {
      Object.keys(Constants.SUITS).forEach(suitKey => {
        let suitObject = {
          ...Constants.SCORING[scoreKey],
          suit: suitKey,
          name: Constants.SCORING[scoreKey].name + ' of ' + Constants.SUITS[suitKey].name
        }
        let keyName = scoreKey + '_' + suitKey
        scoreOptions.value[keyName] = suitObject
      })
    } else {
      scoreOptions.value[scoreKey] = cloneDeep(Constants.SCORING[scoreKey])
    }
  })
})

function resetScoreObject() {
  scoreObject.value = {}
  Object.values(scoreOptions.value).forEach(s => {
    s.single = false
    s.double = false
  })
  updateTeamMeld()
}

function getPlayerNames() {
  return players.value.filter(p => p.teamNumber === props.teamNumber).map(p => p.name)
}

function updateScore(event, scoring, isDouble) {
  //if checked then set the score value in local object
  if (event.target.checked) {
    let isTrumpFactor = 1
    // handle extra points for trump marriage (pretty sure these names only include the suit if it is a marriage so far)
    if (currentHand.value.trumpSuit && scoring.name.includes(currentHand.value.trumpSuit)) {
      isTrumpFactor = 2
    }

    //todo: need to handle extra points in run

    //reset the other checkbox if needed
    scoring.single = isDouble ? !scoring.double : true
    scoring.double = !isDouble ? !scoring.single : true
    scoreObject.value[scoring.name] = isDouble ? (scoring.doubleValue * isTrumpFactor) : (scoring.value * isTrumpFactor)

  } else {
    scoreObject.value[scoring.name] = 0
  }

  //handle run with extra king/queen and toggle between double, single run
  if (scoring.name === Constants.SCORING.RUN.name && !scoreOptions.value['RUN'].single) {
    scoreOptions.value['EXTRA_KING'].single = false
    scoreObject.value[Constants.SCORING.EXTRA_KING.name] = 0
    scoreOptions.value['EXTRA_QUEEN'].single = false
    scoreObject.value[Constants.SCORING.EXTRA_QUEEN.name] = 0
  }

  //if all marriages, disable the 80 kings/queens stuff and add that to the score
  let roundRobinMarriageCount = 0
  Object.keys(scoreOptions.value).filter(soKey => soKey.includes('MARRIAGE')).forEach(soKey => {
    if (scoreOptions.value[soKey].single || scoreOptions.value[soKey].double) {
      roundRobinMarriageCount = roundRobinMarriageCount + 1
    }
  })

  hasRoundRobin.value = roundRobinMarriageCount === 4;

  //if they have a round robin, set the 80 kings and 80 queens to true
  //todo: handle if they have 800 kings AND marriage in every suit (or 600 queens)
  if (hasRoundRobin.value) {
    if (!scoreOptions.value.KINGS.double) {
      scoreOptions.value.KINGS.single = true
      scoreObject.value['80 Kings'] = scoreOptions.value.KINGS.value
    } else {
      scoreObject.value['80 Kings'] = scoreOptions.value.KINGS.doubleValue
    }
    if (!scoreOptions.value.QUEENS.double) {
      scoreOptions.value.QUEENS.single = true
      scoreObject.value['60 Queens'] = scoreOptions.value.QUEENS.value
    } else {
      scoreObject.value['60 Queens'] = scoreOptions.value.QUEENS.doubleValue
    }

  }

  updateTeamMeld()
}

function updateTeamMeld() {
  if(props.teamNumber === 1) {
    currentHand.value.teamOne.meld = Object.values(scoreObject.value).reduce((total, val) => val + total, 0)
  } else {
    currentHand.value.teamTwo.meld = Object.values(scoreObject.value).reduce((total, val) => val + total, 0)
  }
}

defineExpose({
  resetScoreObject
})

</script>

<style scoped lang="scss">
.scoring-card {
  display: flex;
  height: 40px;
  align-items: center;
}

.subscore {
  margin-left: 20px;
}
</style>
