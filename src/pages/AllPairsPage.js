import React, { useEffect, useMemo } from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllPairData, useDataForList, useDataForListV2, usePairData } from '../contexts/PairData'
import PairList from '../components/PairList'
import { PageWrapper, FullWrapper, ContentWrapper, PageSection } from '../components'
import { RowBetween } from '../components/Row'
import Search from '../components/Search'
import { useMedia } from 'react-use'
import { useSavedPairs } from '../contexts/LocalStorage'

function AllPairsPage() {
  const allPoolData = useAllPairData()
  const [savedPools] = useSavedPairs()
  const savedPairsData = useDataForListV2(Object.keys(savedPools))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <PageWrapper>
      <ContentWrapper>
        <TYPE.largeHeader>Pools</TYPE.largeHeader>

        <PageSection>
          <Search />
        </PageSection>

        <PageSection>
          <TYPE.main fontSize={'1rem'} style={{ whiteSpace: 'nowrap' }}>
            Your Watchlist
          </TYPE.main>
          <Panel style={{ padding: '0' }}>
            <PairList pairs={savedPairsData} disbaleLinks={true} noPairsPlaceholderText={'Saved pools will appear here'} />
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
