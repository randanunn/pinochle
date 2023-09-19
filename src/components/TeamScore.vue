<template>
  <v-row v-if="currentHand.trumpSuit && currentHand.biddingPlayer.id && currentHand.bid % Constants.TRICK_POINT_VALUE === 0" class="height-50">
    <v-col cols="10">
      <v-card elevation="0" class="px-1">
        <v-card-title class="pb-0">
          <v-toolbar flat color="transparent" density="compact">
            <v-toolbar-title class="ml-0">
              Team {{ teamNumber }}: {{ getPlayerNames() }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-checkbox v-if="teamNumber === currentHand.biddingPlayer.teamNumber"
                          :color="Constants.SYSTEM_COLOR"
                          label="Shoot the Moon"
                          v-model="currentHand.shootingTheMoon"
                          @change="resetScoreObject"
                          density="compact" hide-details>
              </v-checkbox>
            </v-toolbar-items>
          </v-toolbar>
        </v-card-title>
        <v-card-subtitle>
          Meld: {{ teamNumber === 1 ? currentHand.teamOne.meld : currentHand.teamTwo.meld }} <br>
          Tricks: {{ teamNumber === 1 ? currentHand.teamOne.tricks : currentHand.teamTwo.tricks }} <br>
          Tricks Value:
          {{
            teamNumber === 1 ? currentHand.teamOne.tricks * Constants.TRICK_POINT_VALUE : currentHand.teamTwo.tricks * Constants.TRICK_POINT_VALUE
          }} <br>
          <span v-if="teamNumber === currentHand.biddingPlayer.teamNumber"
                :class="{'error': tricksRequired > Constants.AVAILABLE_TRICKS}">
            Tricks Required: {{ tricksRequired }}
          </span>
        </v-card-subtitle>
        <v-card-text class="py-0">
          <v-row>
            <v-col cols="6">
<!--              todo: should componetize this - sry kayla i was tired -->
              <table id="scoring-table">
                <thead>
                <tr>
                  <th></th>
                  <th class="pr-3">Single</th>
                  <th class="pr-3">Single</th>
                  <th>Double</th>
                </tr>
                </thead>
                <tr v-for="scoring in column1" class="scoring-row">
                  <td class="scoring-name-column" :class="{'subscore': scoring.subscore}">{{ scoring.name }}</td>
                  <td class="text-center">
                    <v-checkbox :color="Constants.SYSTEM_COLOR"
                                :readonly="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon) ||
                                 (scoring.affectedByRoundRobin && hasRoundRobin) ||
                                 (scoring.subscore && !scoreOptions['RUN'].single)"
                                :disabled="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon) ||
                                  (scoring.affectedByRoundRobin && hasRoundRobin) ||
                                  (scoring.subscore && !scoreOptions['RUN'].single)"
                                v-model="scoring.single"
                                @change="updateScore($event, scoring, 1)"
                                density="compact" hide-details>
                    </v-checkbox>
                  </td>
                  <td class="text-center">
                    <v-checkbox
                                v-if="!scoring.hideSecondSingle" :color="Constants.SYSTEM_COLOR"
                                :readonly="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon) ||
                                 (scoring.affectedByRoundRobin && hasRoundRobin) ||
                                 (scoring.subscore && !scoreOptions['RUN'].single)"
                                :disabled="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon) ||
                                  (scoring.affectedByRoundRobin && hasRoundRobin) ||
                                  (scoring.subscore && !scoreOptions['RUN'].single)"
                                v-model="scoring.secondSingle"
                                @change="updateScore($event, scoring, 2)"
                                density="compact" hide-details>
                    </v-checkbox>
                  </td>
                  <td class="text-center">
                    <v-checkbox v-if="scoring.doubleValue" :color="Constants.SYSTEM_COLOR"
                                :readonly="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon)"
                                :disabled="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon)"
                                v-model="scoring.double"
                                density="compact" hide-details
                                @change="updateScore($event, scoring, 3)">
                    </v-checkbox>
                  </td>
                </tr>
              </table>
            </v-col>
            <v-col cols="6">
              <table id="scoring-table">
                <thead>
                <tr>
                  <th></th>
                  <th class="pr-3">Single</th>
                  <th class="pr-3">Single</th>
                  <th>Double</th>
                </tr>
                </thead>
                <tr v-for="scoring in column2" class="scoring-row">
                  <td class="scoring-name-column" :class="{'subscore': scoring.subscore}">{{ scoring.name }}</td>
                  <td class="text-center">
                    <v-checkbox :color="Constants.SYSTEM_COLOR"
                      :readonly="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon) ||
                                 (scoring.affectedByRoundRobin && hasRoundRobin) ||
                                 (scoring.subscore && !scoreOptions['RUN'].single)"
                      :disabled="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon) ||
                                  (scoring.affectedByRoundRobin && hasRoundRobin) ||
                                  (scoring.subscore && !scoreOptions['RUN'].single)"
                      v-model="scoring.single"
                      @change="updateScore($event, scoring, 1)"
                      density="compact" hide-details>
                    </v-checkbox>
                  </td>
                  <td class="text-center">
                    <v-checkbox :color="Constants.SYSTEM_COLOR"
                      v-if="!scoring.hideSecondSingle"
                      :readonly="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon) ||
                                 (scoring.affectedByRoundRobin && hasRoundRobin) ||
                                 (scoring.subscore && !scoreOptions['RUN'].single)"
                      :disabled="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon) ||
                                  (scoring.affectedByRoundRobin && hasRoundRobin) ||
                                  (scoring.subscore && !scoreOptions['RUN'].single)"
                      v-model="scoring.secondSingle"
                      @change="updateScore($event, scoring, 2)"
                      density="compact" hide-details>
                    </v-checkbox>
                  </td>
                  <td class="text-center">
                    <v-checkbox v-if="scoring.doubleValue" :color="Constants.SYSTEM_COLOR"
                                :readonly="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon)"
                                :disabled="(teamNumber === currentHand.biddingPlayer.teamNumber && currentHand.shootingTheMoon)"
                                v-model="scoring.double"
                                density="compact" hide-details
                                @change="updateScore($event, scoring, 3)">
                    </v-checkbox>
                  </td>
                </tr>
              </table>
            </v-col>
          </v-row>

        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="2" class="text-center pt-7">
      <div class="slider-container">
        Trick Count:
        <v-btn :color="Constants.SYSTEM_COLOR" variant="text" @click="resetTrickCounts()">Reset</v-btn>
        <v-slider
          :model-value="trickCount"
          :color="Constants.SYSTEM_COLOR"
          thumb-label="always"
          density="compact"
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
              :color="Constants.SYSTEM_COLOR"
              @click="decrement"
            ></v-btn>
          </template>

          <template v-slot:append>
            <v-btn
              size="small"
              variant="text"
              icon="mdi-plus"
              :color="Constants.SYSTEM_COLOR"
              @click="increment"
            ></v-btn>
          </template>
        </v-slider>
      </div>
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

const trickCount = computed(() => {
  return props.teamNumber === 1 ? currentHand.value.teamOne.tricks : currentHand.value.teamTwo.tricks
})
const tricksRequired = computed(() => {
  let meldScore = props.teamNumber === 1 ? currentHand.value.teamOne.meld : currentHand.value.teamTwo.meld
  return currentHand.value.shootingTheMoon ? Constants.AVAILABLE_TRICKS : Math.max(1, ((currentHand.value.bid - meldScore) / 10))
})

//todo: there has to be a better way??
const column1 = computed(() => {
  const [list1] = partition(scoreOptions.value)
  return list1
})
const column2 = computed(() => {
  const [list1, list2] = partition(scoreOptions.value)
  return list2
})

const partition = x =>
  [x]
    .map(x => Object.entries(x))
    .map(x => x.reduce(([l, r], x, i) =>
        i <= 6
          ? [[...l, x], r]
          : [l, [...r, x]],
      [[], []]))
    .map(x => x.map(x => Object.fromEntries(x)))
    .pop();

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
    s.secondSingle = false
    s.double = false
  })
  updateTeamMeld()
}

function getPlayerNames() {
  return players.value.filter(p => p.teamNumber === props.teamNumber).map(p => ' ' + p.name).toString()
}

function updateScore(event, scoring, scoreType) {
  //scoreType: 1 = single, 2 = secondSingle, 3 = double
  let isTrumpFactor = 1
  // handle extra points for trump marriage (pretty sure these names only include the suit if it is a marriage so far)
  if (currentHand.value.trumpSuit && scoring.name.includes(currentHand.value.trumpSuit)) {
    isTrumpFactor = 2
  }

  //if checked then set the score value in local object
  if (event.target.checked) {

    //reset the other checkbox if needed
    if(scoreType === 3) {
      scoring.single = !scoring.double
      scoring.secondSingle = !scoring.double
    }
    // scoring.single = scoreType === 3 ? !scoring.double : scoreType === :
    // scoring.secondSingle = scoreType === 3 ? !scoring.double : true
    scoring.double = scoreType !== 3 ? !scoring.single && !scoring.secondSingle : true

    scoreObject.value[scoring.name] = scoring.double ? (scoring.doubleValue * isTrumpFactor)
        : scoring.single && scoring.secondSingle ? ((scoring.value * 2) * isTrumpFactor)
                                        : (scoring.value * isTrumpFactor)

  } else {
    // if unchecked see if single/double is still checked first
    scoreObject.value[scoring.name] = scoring.single || scoring.secondSingle ? (scoring.value * isTrumpFactor) : 0
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
  if (props.teamNumber === 1) {
    currentHand.value.teamOne.meld = Object.values(scoreObject.value).reduce((total, val) => val + total, 0)
  } else {
    currentHand.value.teamTwo.meld = Object.values(scoreObject.value).reduce((total, val) => val + total, 0)
  }
}

defineExpose({
  resetScoreObject
})

</script>


<style lang="scss">
.v-slider.v-input--vertical > .v-input__control {
  min-height: 150px !important;
}
</style>

<style scoped lang="scss">
.slider-container {
  margin-top: 50px;
}

.subscore {
  padding-left: 20px;
}
.scoring-row {
  line-height: 10px;
}

#scoring-table td {
  line-height: .25rem !important;
}

.scoring-name-column {
  width: 120px;
}
</style>
