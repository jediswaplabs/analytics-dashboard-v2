import React, { useEffect, useState } from 'react'
import 'feather-icons'

import { PageSection } from '../components'
import PageLayout from '../layouts/PageLayout'
import SearchWallet from '../components/SearchWallet'
import { isStarknetAddress } from '../utils'
import { jediSwapClient } from '../apollo/client'
import { LP_LEADERBOARD_DATA } from '../apollo/queries'
import LpLeaderboard from '../components/Leaderboards/LpLeaderboard/index.js'
import LpLeaderboardPosition from '../components/LeaderBoardPosition/LpLeaderboardPosition/index.js'


function LpLeaderboardPage() {
  const [searchAddressQuery, setSearchAddressQuery] = useState('')
  const [detailedPosition, setDetailedPosition] = useState(null)
  const [searchError, setSearchError] = useState(false)
  const [leaderboardPositions, setLeaderboardPositions] = useState([])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const getData = async () => {
      const dataResp = await jediSwapClient.query({
        query: LP_LEADERBOARD_DATA({
        }),
        fetchPolicy: 'cache-first',
      })
      const leaders = dataResp?.data?.lpLeaderboard
      const leaderboardPositions = {}
      leaders.forEach((leader) => {
        leader.address = leader.userAddress
        leader.score = Math.round(parseFloat(leader.points))
        leaderboardPositions[leader.userAddress] = leader
      })
      setLeaderboardPositions(leaderboardPositions)
    }
    getData()
  }, [])


  const handleOnWalletSearch = async () => {
    if (!isStarknetAddress(searchAddressQuery, false)) {
      return
    }
    setDetailedPosition(null)
    setSearchError(false)
    const dataResp = await jediSwapClient.query({
      query: LP_LEADERBOARD_DATA({
        userAddress: searchAddressQuery
      }),
      fetchPolicy: 'cache-first',
    })
    const foundUser = dataResp?.data?.lpLeaderboard?.[0]
    if (!foundUser) {
      setSearchError(true)
      return
    }
    const position = {
      address: foundUser.userAddress,
      score: Math.round(parseFloat(foundUser.points))
    }
    setDetailedPosition(position)
  }
  const handleOnWalletChange = (address) => {
    setSearchAddressQuery(address)
  }
  const handleOnClearSearch = () => {
    setSearchAddressQuery('')
    setDetailedPosition(null)
    setSearchError(false)
  }

  return (
    <PageLayout pageTitle={'LP leaderboard'}>
      <PageSection>
        <SearchWallet onSearch={handleOnWalletSearch} onChange={handleOnWalletChange} address={searchAddressQuery} />
      </PageSection>

      {(detailedPosition || searchError) && (
        <PageSection>
          <LpLeaderboardPosition position={detailedPosition} searchError={searchError} onClearSearch={handleOnClearSearch} />
        </PageSection>
      )}

      <PageSection>
        <LpLeaderboard leaderboardPositions={leaderboardPositions}></LpLeaderboard>
      </PageSection>
    </PageLayout>
  )
}

export default LpLeaderboardPage
