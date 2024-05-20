import React, { useEffect, useState } from 'react'
import 'feather-icons'

import { PageSection } from '../components'
import PageLayout from '../layouts/PageLayout'
import SearchWallet from '../components/SearchWallet'
import VolumeLeaderboard from '../components/Leaderboards/VolumeLeaderboard'
import VolumeLeaderboardPosition from '../components/LeaderBoardPosition/VolumeLeaderboardPosition'
import { isStarknetAddress } from '../utils'
import { jediSwapClient } from '../apollo/client'
import { VOLUME_LEADERBOARD_DATA } from '../apollo/queries'


function VolumeLeaderboardPage() {
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
        query: VOLUME_LEADERBOARD_DATA({
        }),
        fetchPolicy: 'cache-first',
      })
      const leaders = dataResp?.data?.volumeLeaderboard
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

  // const leaderboardPositions = useAllVolumeLeaderboardPositions();
  const leaderboardPositions2 = {
    '0x030941ffa8874ea7c5c8c943fa50f9193d3748cc219b67fdda334b37be85955e': {
      address: '0x030941ffa8874ea7c5c8c943fa50f9193d3748cc219b67fdda334b37be85955e',
      tradesCount: 100,
      volumeUSD: 990177.97,
      score: 2100,
      rank: 2100,
    },
    '0x02bf7f2ee7bb22583335feb6dd3aebd827030b82f57817783c6af1a6d99fc6f6': {
      address: '0x02bf7f2ee7bb22583335feb6dd3aebd827030b82f57817783c6af1a6d99fc6f6',
      tradesCount: 98,
      volumeUSD: 893809.41,
      score: 1580,
      rank: 1580,
    },
    '0x02c2d509793bff9ffcdbebef4d556eb7c43f88a0cbb7225affdd5ac4ef62afac': {
      address: '0x02c2d509793bff9ffcdbebef4d556eb7c43f88a0cbb7225affdd5ac4ef62afac',
      tradesCount: 80,
      volumeUSD: 173809.41,
      score: 1580,
      rank: 1580,
    },
    '0x06e6d6778d9eccd65773061f3e4d6d35b57269a01e30609b64a236339b96db54': {
      address: '0x06e6d6778d9eccd65773061f3e4d6d35b57269a01e30609b64a236339b96db54',
      tradesCount: 120,
      volumeUSD: 473809.41,
      score: 580,
      rank: 580,
    },
  }

  const handleOnWalletSearch = async () => {
    if (!isStarknetAddress(searchAddressQuery, false)) {
      return
    }
    setDetailedPosition(null)
    setSearchError(false)
    const dataResp = await jediSwapClient.query({
      query: VOLUME_LEADERBOARD_DATA({
        userAddress: searchAddressQuery
      }),
      fetchPolicy: 'cache-first',
    })
    const foundUser = dataResp?.data?.volumeLeaderboard?.[0]
    if (!foundUser) {
      setSearchError(true)
      return
    }
    const position = {
      address: foundUser.userAddress,
      score: Math.round(parseFloat(foundUser.points))
    }
    // const position = {
    //   address: '0x030941ffa8874ea7c5c8c943fa50f9193d3748cc219b67fdda334b37be85955e',
    //   tradesCount: 100,
    //   volumeUSD: 990177.97,
    //   score: 2100,
    //   rank: 2100,
    // }
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
    <PageLayout pageTitle={'Volume leaderboard'}>
      <PageSection>
        <SearchWallet onSearch={handleOnWalletSearch} onChange={handleOnWalletChange} address={searchAddressQuery} />
      </PageSection>

      {(detailedPosition || searchError) && (
        <PageSection>
          <VolumeLeaderboardPosition position={detailedPosition} searchError={searchError} onClearSearch={handleOnClearSearch} />
        </PageSection>
      )}

      <PageSection>
        <VolumeLeaderboard leaderboardPositions={leaderboardPositions}></VolumeLeaderboard>
      </PageSection>
    </PageLayout>
  )
}

export default VolumeLeaderboardPage
