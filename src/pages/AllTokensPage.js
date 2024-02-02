import React, { useEffect } from 'react'
import 'feather-icons'

import TopTokenList from '../components/TokenList'
import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import { useAllTokenData, useTokenDataForList } from '../contexts/TokenData'
import { PageWrapper, FullWrapper, ContentWrapper, PageSection } from '../components'
import { RowBetween } from '../components/Row'
import Search from '../components/Search'
import { useMedia } from 'react-use'
import { useAllPairData, useDataForListV2 } from '../contexts/PairData'
import { useSavedPairs, useSavedTokens } from '../contexts/LocalStorage'
import PairList from '../components/PairList'
// import CheckBox from '../components/Checkbox'
// import QuestionHelper from '../components/QuestionHelper'

function AllTokensPage() {
  const allTokens = useAllTokenData()
  const [savedTokens] = useSavedTokens()
  const savedTokensData = useTokenDataForList(Object.keys(savedTokens))
  const formattedSavedTokensData =
    savedTokensData?.reduce((acc, v) => {
      acc[v.id] = v
      return acc
    }, {}) ?? {}
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <PageWrapper>
      <ContentWrapper>
        <TYPE.largeHeader>Top Tokens</TYPE.largeHeader>

        <PageSection>
          <Search />
        </PageSection>

        <PageSection>
          <TYPE.main fontSize={'1rem'} style={{ whiteSpace: 'nowrap' }}>
            Your Watchlist
          </TYPE.main>
          <Panel style={{ padding: '0' }}>
            <TopTokenList tokens={formattedSavedTokensData} itemMax={50} noPairsPlaceholderText={'Saved tokens will appear here'} />
          </Panel>
        </PageSection>

        <PageSection>
          <TYPE.main fontSize={'1rem'} style={{ whiteSpace: 'nowrap' }}>
            All Tokens
          </TYPE.main>
          <Panel style={{ padding: '0' }}>
            <TopTokenList tokens={allTokens} itemMax={50} />
          </Panel>
        </PageSection>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default AllTokensPage
