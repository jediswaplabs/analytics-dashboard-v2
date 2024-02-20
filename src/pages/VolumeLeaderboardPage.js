import React, { useEffect, useState } from 'react'
import 'feather-icons'

import { PageSection } from '../components'
import PageLayout from '../layouts/PageLayout'
import SearchWallet from '../components/SearchWallet'
import VolumeLeaderboard from '../components/VolumeLeaderboard'
import VolumeLeaderboardPosition from '../components/VolumeLeaderboardPosition'
import { isStarknetAddress } from '../utils'

function VolumeLeaderboardPage() {
  const [searchAddressQuery, setSearchAddressQuery] = useState('')
  const [detailedPosition, setDetailedPosition] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // const leaderboardPositions = useAllVolumeLeaderboardPositions();
  const leaderboardPositions = [
    {
      address: '0x030941ffa8874ea7c5c8c943fa50f9193d3748cc219b67fdda334b37be85955e',
      tradesCount: 100,
      volumeUSD: 990177.97,
      score: 2100,
      rank: 2100,
    },
    {
      address: '0x02bf7f2ee7bb22583335feb6dd3aebd827030b82f57817783c6af1a6d99fc6f6',
      tradesCount: 98,
      volumeUSD: 893809.41,
      score: 1580,
      rank: 1580,
    },
    {
      address: '0x02c2d509793bff9ffcdbebef4d556eb7c43f88a0cbb7225affdd5ac4ef62afac',
      tradesCount: 80,
      volumeUSD: 173809.41,
      score: 1580,
      rank: 1580,
    },
    {
      address: '0x06e6d6778d9eccd65773061f3e4d6d35b57269a01e30609b64a236339b96db54',
      tradesCount: 120,
      volumeUSD: 473809.41,
      score: 580,
      rank: 580,
    },
  ]

  const handleOnWalletSearch = () => {
    if (!isStarknetAddress(searchAddressQuery, true)) {
      return
    }
    // const position = useVolumeLeaderboardPosition(searchAddressQuery);
    const position = {
      address: '0x030941ffa8874ea7c5c8c943fa50f9193d3748cc219b67fdda334b37be85955e',
      tradesCount: 100,
      volumeUSD: 990177.97,
      score: 2100,
      rank: 2100,
    }
    setDetailedPosition(position)
  }
  const handleOnWalletChange = (address) => {
    setSearchAddressQuery(address)
  }
  const handleOnClearSearch = () => {
    setSearchAddressQuery('')
    setDetailedPosition(null)
  }

  return (
    <PageLayout pageTitle={'Volume leaderboard'}>
      <PageSection>
        <SearchWallet onSearch={handleOnWalletSearch} onChange={handleOnWalletChange} address={searchAddressQuery} />
      </PageSection>

      {detailedPosition && (
        <PageSection>
          <VolumeLeaderboardPosition position={detailedPosition} onClearSearch={handleOnClearSearch} />
        </PageSection>
      )}

      <PageSection>
        <VolumeLeaderboard leaderboardPositions={leaderboardPositions}></VolumeLeaderboard>
      </PageSection>
    </PageLayout>
  )
}

export default VolumeLeaderboardPage
