import React from 'react'
import { Star } from 'react-feather'

export const getStarIconByPosition = (position) => {
  switch (position) {
    case 1: {
      return <Star fill={'#F7E886'} color={'transparent'} />
    }
    case 2: {
      return <Star fill={'#c9c9c9'} color={'transparent'} />
    }
    case 3: {
      return <Star fill={'#FFDAB4'} color={'transparent'} />
    }
    default: {
      return null
    }
  }
}