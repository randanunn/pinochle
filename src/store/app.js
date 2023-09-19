// Utilities
import { defineStore } from 'pinia'
import Constants from '@/constants'
import cloneDeep from 'lodash.clonedeep'


export const useAppStore = defineStore('app', {
  state: () => ({
    // currentHand: {
    //   trumpSuit: '',
    //   bid: 350,
    //   shootingTheMoon: false,
    //   biddingPlayer: { id: null, name: ''},
    //   dealer: '',
    //   teamOne: {
    //     meld: 0,
    //     tricks: 0
    //   },
    //   teamTwo: {
    //     meld: 0,
    //     tricks: 0
    //   }
    // },
    currentHand: cloneDeep(Constants.NEW_BLANK_HAND),
    players: [
      { id: 1, name: '', teamNumber: 1},
      { id: 2, name: '', teamNumber: 1},
      { id: 3, name: '', teamNumber: 2},
      { id: 4, name: '', teamNumber: 2},
    ],
    scores: [],
    stats: [],
    scoringStarted: false
  }),
})
