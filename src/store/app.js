// Utilities
import { defineStore } from 'pinia'
import Constants from '@/constants'
import cloneDeep from 'lodash.clonedeep'


export const useAppStore = defineStore('app', {
  state: () => ({
    currentHand: cloneDeep(Constants.NEW_BLANK_HAND),
    players: [
      { id: 1, name: '', teamNumber: 1, firstDealer: true},
      { id: 2, name: '', teamNumber: 1, firstDealer: false},
      { id: 3, name: '', teamNumber: 2, firstDealer: false},
      { id: 4, name: '', teamNumber: 2, firstDealer: false},
    ],
    scores: [],
    stats: [],
    numberOfPlayers: 4,
    slidersSynced: true,
    scoringStarted: false
  }),
})
