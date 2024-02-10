import React, { useEffect } from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllPairData, usePairDataForList } from '../contexts/PairData'
import PairList from '../components/PairList'
import { PageWrapper, ContentWrapper, PageSection } from '../components'
import Search from '../components/Search'
import { useSavedPairs } from '../contexts/LocalStorage'
import { useTokenDataForList } from '../contexts/TokenData'

function AllPairsPage() {
  const allPoolData = useAllPairData()
  const [savedPools] = useSavedPairs()
  const savedPairsData = usePairDataForList(Object.keys(savedPools).filter((k) => !!savedPools[k]))
  const formattedSavedPoolsData =
    savedPairsData?.reduce((acc, v) => {
      acc[v.poolAddress] = v
      return acc
    }, {}) ?? {}

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <PageWrapper>
      <ContentWrapper>
        <TYPE.largeHeader lineHeight={0.7}>Pools</TYPE.largeHeader>

        <PageSection>
          <Search />
        </PageSection>

        <PageSection>
          <TYPE.main fontSize={'1rem'} style={{ whiteSpace: 'nowrap' }}>
            Your Watchlist
          </TYPE.main>
          <Panel style={{ padding: '0' }}>
            <PairList
              pairs={formattedSavedPoolsData}
              disbaleLinks={true}
              waitForData={false}
              noPairsPlaceholderText={'Saved pools will appear here'}
            />
          </Panel>
        </PageSection>

        <PageSection>
          <TYPE.main fontSize={'1rem'} style={{ whiteSpace: 'nowrap' }}>
            All Pools
          </TYPE.main>
          <Panel style={{ padding: '0' }}>
            <PairList pairs={allPoolData} disbaleLinks={true} />
          </Panel>
        </PageSection>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default AllPairsPage
