const SUITS = {
  SPADES: {
    name: 'Spades',
    icon: 'Spades.png'
  },
  DIAMONDS: {
    name: 'Diamonds',
    icon: 'Diamonds.png'
  },
  CLUBS: {
    name: 'Clubs',
    icon: 'Clubs.png'
  },
  HEARTS: {
    name: 'Hearts',
    icon: 'Hearts.png'
  },
}
const SCORING = {
  MARRIAGE: {
    name: 'K/Q',
    value: 20,
    doubleValue: 40,
  },
  RUN: {
    name: 'Run',
    value: 150,
    extraKingValue: 20,
    extraQueenValue: 20,
    doubleValue: 1500
  },
  EXTRA_KING: {
    name: 'Extra King',
    subscore: true,
    hideSecondSingle: true,
    value: 20,
  },
  EXTRA_QUEEN: {
    name: 'Extra Queen',
    hideSecondSingle: true,
    subscore: true,
    value: 20,
  },
  NINE: {
    name: '9 of Trump',
    value: 10,
    doubleValue: 20
  },
  ACES: {
    name: '100 Aces',
    value: 100,
    doubleValue: 1000
  },
  KINGS: {
    name: '80 Kings',
    value: 80,
    doubleValue: 800,
    affectedByRoundRobin: true
  },
  QUEENS: {
    name: '60 Queens',
    value: 60,
    doubleValue: 600,
    affectedByRoundRobin: true
  },
  JACKS: {
    name: '40 Jacks',
    value: 40,
    doubleValue: 400
  },
  PINOCHLE: {
    name: 'Pinochle',
    value: 40,
    doubleValue: 300
  }
}

const NEW_BLANK_HAND = {
    trumpSuit: '',
    bid: 350,
    shootingTheMoon: false,
    biddingPlayer: { id: null, name: ''},
    dealingPlayer: { id: null, name: ''},
    teamOne: {
      meld: 0,
      tricks: 0
    },
    teamTwo: {
      meld: 0,
      tricks: 0
    }
}

const WINNING_SCORE = 1500
//ARE THESE ever not the same?
const SHOOT_THE_MOON_SCORE = 1500
const OUT_BACKWARDS_SCORE = -1000
const AVAILABLE_TRICKS = 25
const TRICK_POINT_VALUE = 10
const DEFAULT_PLAYER_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4']
const SYSTEM_COLOR = 'indigo'

export default {
  SCORING,
  SUITS,
  AVAILABLE_TRICKS,
  TRICK_POINT_VALUE,
  DEFAULT_PLAYER_NAMES,
  WINNING_SCORE,
  SHOOT_THE_MOON_SCORE,
  OUT_BACKWARDS_SCORE,
  NEW_BLANK_HAND,
  SYSTEM_COLOR
}
