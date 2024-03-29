import React, { useEffect } from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllPairData, usePairDataForList } from '../contexts/PairData'
import PairList from '../components/PairList'
import { PageWrapper, ContentWrapper, PageSection, PageHeader } from '../components'
import Search from '../components/Search'
import { useSavedPairs } from '../contexts/LocalStorage'
import PageLayout from '../layouts/PageLayout'

function AllPairsPage() {
  const allPoolData = useAllPairData()
  const [savedPools] = useSavedPairs()
  const formattedSavedPoolsData = usePairDataForList(Object.keys(savedPools).filter((k) => !!savedPools[k]))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <PageLayout pageTitle={'Pools'}>
      <PageSection>
        <Search />
      </PageSection>

      <PageSection>
        <TYPE.main fontSize={'1rem'} style={{ whiteSpace: 'nowrap' }}>
          Your Watchlist
        </TYPE.main>
        <Panel style={{ padding: '0' }}>
          <PairList pairs={formattedSavedPoolsData} disbaleLinks={true} waitForData={false} noPairsPlaceholderText={'Saved pools will appear here'} />
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
    </PageLayout>
  )
}

export default AllPairsPage
