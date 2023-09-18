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
    key: 'MARRIAGE',
    name: 'Marriage',
    value: 20,
    doubleValue: 40,
  },
  RUN: {
    key: 'RUN',
    name: 'Run',
    value: 150,
    extraKingValue: 20,
    extraQueenValue: 20,
    doubleValue: 1500
  },
  NINE: {
    key: 'NINE',
    name: 'Nine of Trump',
    value: 10,
    doubleValue: 20
  },
  ACES: {
    key: 'ACES',
    name: '100 Aces',
    value: 100,
    doubleValue: 1000
  },
  KINGS: {
    key: 'KINGS',
    name: '80 Kings',
    value: 80,
    doubleValue: 800,
    affectedByRoundRobin: true
  },
  QUEENS: {
    key: 'QUEENS',
    name: '60 Queens',
    value: 60,
    doubleValue: 600,
    affectedByRoundRobin: true
  },
  JACKS: {
    key: 'JACKS',
    name: '40 Jacks',
    value: 40,
    doubleValue: 400
  },
  PINOCHLE: {
    key: 'PINOCHLE',
    name: 'Pinochle',
    value: 40,
    doubleValue: 300
  }
}

const AVAILABLE_TRICKS = 25
const TRICK_POINT_VALUE = 10

export default {
  SCORING,
  SUITS,
  AVAILABLE_TRICKS,
  TRICK_POINT_VALUE
}
