// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    currentHand: {
      trumpSuit: '',
      bid: 0,
      dealer: '',
      teamOne: {
        meld: 0,
        tricks: 0
      },
      teamTwo: {
        meld: 0,
        tricks: 0
      }
    },
    scores: [],
    stats: []
  }),
})
