<template>
  <v-card elevation="0" class="pa-5">
    Team {{props.teamNumber}} Meld: {{ meldScore }}

    <v-checkbox label="Shoot the Moon"
                v-model="shootingTheMoon"
                @change="resetScoreObject"
                density="compact" hide-details>
      </v-checkbox>

    Select Trump Suit <br>
    <v-btn v-for="suit in Constants.SUITS"
      :active="suit.name === currentHand.trumpSuit"
      @click="setTrumpSuit(suit.name)">
      {{suit.name}}
    </v-btn>
    <br>

    <div v-if="currentHand.trumpSuit">
      <div class="scoring-card"
           v-for="(scoring, idx) in scoreOptions"
           :key="idx">

        {{scoring.name}}

        <div class="d-inline-block">
          <v-checkbox label="Single"
                      class="d-inline-block"
                      :readonly="shootingTheMoon || (scoring.affectedByRoundRobin && hasRoundRobin)"
                      :disabled="shootingTheMoon || (scoring.affectedByRoundRobin && hasRoundRobin)"
                      v-model="scoring.single"
                      @change="updateScore($event, scoring, false)"
                      density="compact" hide-details>
          </v-checkbox>
          <v-checkbox label="Double"
                      class="d-inline-block"
                      :readonly="shootingTheMoon"
                      :disabled="shootingTheMoon"
                      v-model="scoring.double"
                      density="compact" hide-details
                      @change="updateScore($event, scoring, true)">
          </v-checkbox>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import Constants from '@/constants'
import cloneDeep from 'lodash.clonedeep'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/app'
import { ref, computed, onMounted } from 'vue'
const props = defineProps({
  teamNumber: Number
})

const store = useAppStore();

const { currentHand } = storeToRefs(store)
const scoreOptions = ref({})
const scoreObject = ref({})
const shootingTheMoon = ref(false)
const hasRoundRobin = ref(false)

const meldScore = computed(() => {
  return Object.values(scoreObject.value).reduce((total, val) => val + total, 0)
})

onMounted( () => {
  Object.keys(Constants.SCORING).forEach(scoreKey => {
    if(scoreKey === 'MARRIAGE') {
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
} )

function resetScoreObject () {
  scoreObject.value = {}
  Object.values(scoreOptions.value).forEach(s => {
    s.single = false
    s.double = false
  })
}

function setTrumpSuit(suitName) {
  currentHand.value.trumpSuit = suitName
}

function updateScore (event, scoring, isDouble) {
  //if checked then set the score value in local object
  if(event.target.checked) {
    let isTrumpFactor = 1
    // handle extra points for trump marriage (pretty sure these names only include the suit if it is a marriage so far)
    if(currentHand.value.trumpSuit && scoring.name.includes(currentHand.value.trumpSuit)) {
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

  //if all marriages, disable the 80 kings/queens stuff and add that to the score
  let roundRobinMarriageCount = 0
  Object.keys(scoreOptions.value).filter(soKey => soKey.includes('MARRIAGE')).forEach(soKey => {
    if(scoreOptions.value[soKey].single || scoreOptions.value[soKey].double) {
      roundRobinMarriageCount = roundRobinMarriageCount + 1
    }
  })

  hasRoundRobin.value = roundRobinMarriageCount === 4;

  //if they have a round robin, set the 80 kings and 80 queens to true
  //todo: handle if they have 800 kings AND marriage in every suit (or 600 queens)
  if(hasRoundRobin.value) {
    if(!scoreOptions.value.KINGS.double) {
      scoreOptions.value.KINGS.single = true
      scoreObject.value['80 Kings'] = scoreOptions.value.KINGS.value
    } else {
      scoreObject.value['80 Kings'] = scoreOptions.value.KINGS.doubleValue
    }
    if(!scoreOptions.value.QUEENS.double) {
      scoreOptions.value.QUEENS.single = true
      scoreObject.value['60 Queens'] = scoreOptions.value.QUEENS.value
    } else {
      scoreObject.value['60 Queens'] = scoreOptions.value.QUEENS.doubleValue
    }

  }
}

</script>

<style scoped lang="scss">
.scoring-card {
  display: flex;
  height: 40px;
  align-items: center;
}
</style>
