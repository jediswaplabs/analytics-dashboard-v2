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
import { useSavedTokens } from '../contexts/LocalStorage'
import PageLayout from '../layouts/PageLayout'
// import CheckBox from '../components/Checkbox'
// import QuestionHelper from '../components/QuestionHelper'

function AllTokensPage() {
  const allTokens = useAllTokenData()
  const [savedTokens] = useSavedTokens()
  const formattedSavedTokensData = useTokenDataForList(Object.keys(savedTokens).filter((k) => !!savedTokens[k]))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <PageLayout pageTitle={'Tokens'}>
      <PageSection>
        <Search />
      </PageSection>

      <PageSection>
        <TYPE.main fontSize={'1rem'} style={{ whiteSpace: 'nowrap' }}>
          Your Watchlist
        </TYPE.main>
        <Panel style={{ padding: '0' }}>
          <TopTokenList
            tokens={formattedSavedTokensData}
            itemMax={50}
            waitForData={false}
            noTokensPlaceholderText={'Saved tokens will appear here'}
          />
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
    </PageLayout>
  )
}

export default AllTokensPage
