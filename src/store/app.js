// Utilities
import { defineStore } from 'pinia'
import Constants from '@/constants'
import cloneDeep from 'lodash.clonedeep'


export const useAppStore = defineStore('app', {
  state: () => ({
    currentHand: cloneDeep(Constants.NEW_BLANK_HAND),
    //this player stuff gets reset if they change the number of players
    players: [
      { id: 1, name: 'Player 1', teamNumber: 1, firstDealer: true},
      { id: 2, name: 'Player 2', teamNumber: 1, firstDealer: false},
      { id: 3, name: 'Player 3', teamNumber: 2, firstDealer: false},
      { id: 4, name: 'Player 4', teamNumber: 2, firstDealer: false},
    ],
    scores: [],
    stats: [],
    numberOfPlayers: 4,
    slidersSynced: true,
    scoringStarted: false,
    games: []
  }),
})
