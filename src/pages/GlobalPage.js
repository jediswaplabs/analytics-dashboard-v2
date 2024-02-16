import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Box } from 'rebass'
import styled from 'styled-components'

import { RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import PairList from '../components/PairList'
import TopTokenList from '../components/TokenList'
import GlobalChart from '../components/GlobalChart'
import Search from '../components/Search'

import { useGlobalData } from '../contexts/GlobalData'
import { useAllPairData } from '../contexts/PairData'
import { useMedia } from 'react-use'
import Panel from '../components/Panel'
import { useAllTokenData } from '../contexts/TokenData'
import { formattedNum, formattedPercent } from '../utils'
import { TYPE } from '../Theme'
import { CustomLink } from '../components/Link'

import { PageWrapper, ContentWrapper, PageSection } from '../components'

const GridRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  column-gap: 6px;
  align-items: start;
  justify-content: space-between;
`

function GlobalPage() {
  // get data for lists and totals
  const allPairs = useAllPairData()
  const allTokens = useAllTokenData()
  const { totalValueLockedUSD: totalLiquidityUSD, oneDayVolumeUSD, volumeChangeUSD, liquidityChangeUSD } = useGlobalData()

  // breakpoints
  const below800 = useMedia('(max-width: 800px)')

  // scrolling refs
  useEffect(() => {
    document.querySelector('body').scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  // for tracked data on pairs
  const [useTracked] = useState(true)

  return (
    <PageWrapper>
      <ContentWrapper>
        <TYPE.largeHeader lineHeight={0.7}>Overview</TYPE.largeHeader>

        <PageSection>
          <Search />
        </PageSection>

        {/*{below800 && ( // mobile card*/}
        {/*  <PageSection>*/}
        {/*    <Box mb={20}>*/}
        {/*      <Panel>*/}
        {/*        <Box>*/}
        {/*          <AutoColumn gap="36px">*/}
        {/*            <AutoColumn gap="20px">*/}
        {/*              <RowBetween>*/}
        {/*                <TYPE.main>Volume (24hrs)</TYPE.main>*/}
        {/*                <div />*/}
        {/*              </RowBetween>*/}
        {/*              <RowBetween align="flex-end">*/}
        {/*                <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>*/}
        {/*                  {oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : '-'}*/}
        {/*                </TYPE.main>*/}
        {/*                <TYPE.main fontSize={12}>{volumeChangeUSD ? formattedPercent(volumeChangeUSD) : '-'}</TYPE.main>*/}
        {/*              </RowBetween>*/}
        {/*            </AutoColumn>*/}
        {/*            <AutoColumn gap="20px">*/}
        {/*              <RowBetween>*/}
        {/*                <TYPE.main>Total Liquidity</TYPE.main>*/}
        {/*                <div />*/}
        {/*              </RowBetween>*/}
        {/*              <RowBetween align="flex-end">*/}
        {/*                <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>*/}
        {/*                  {totalLiquidityUSD ? formattedNum(totalLiquidityUSD, true) : '-'}*/}
        {/*                </TYPE.main>*/}
        {/*                <TYPE.main fontSize={12}>{liquidityChangeUSD ? formattedPercent(liquidityChangeUSD) : '-'}</TYPE.main>*/}
        {/*              </RowBetween>*/}
        {/*            </AutoColumn>*/}
        {/*          </AutoColumn>*/}
        {/*        </Box>*/}
        {/*      </Panel>*/}
        {/*    </Box>*/}
        {/*  </PageSection>*/}
        {/*)}*/}

        {/*{!below800 && (*/}
        {/*  <PageSection>*/}
        {/*    <GridRow>*/}
        {/*      <Panel style={{ height: '100%', minHeight: '300px' }}>*/}
        {/*        <GlobalChart display="liquidity" />*/}
        {/*      </Panel>*/}
        {/*      <Panel style={{ height: '100%' }}>*/}
        {/*        <GlobalChart display="volume" />*/}
        {/*      </Panel>*/}
        {/*    </GridRow>*/}
        {/*  </PageSection>*/}
        {/*)}*/}

        {/*{below800 && (*/}
        {/*  <PageSection>*/}
        {/*    <AutoColumn style={{ marginTop: '6px' }} gap="24px">*/}
        {/*      <Panel style={{ height: '100%', minHeight: '300px' }}>*/}
        {/*        <GlobalChart display="liquidity" />*/}
        {/*      </Panel>*/}
        {/*    </AutoColumn>*/}
        {/*  </PageSection>*/}
        {/*)}*/}

        <PageSection>
          <TYPE.main fontSize={'1rem'} style={{ whiteSpace: 'nowrap' }}>
            Top Pools
          </TYPE.main>
          <Panel style={{ padding: '0' }}>
            <PairList pairs={allPairs} useTracked={useTracked} />
          </Panel>
        </PageSection>

        <PageSection>
          <RowBetween>
            <TYPE.main fontSize={'1rem'} style={{ whiteSpace: 'nowrap' }}>
              Top Tokens
            </TYPE.main>
            <CustomLink to={'/tokens'}>See All</CustomLink>
          </RowBetween>
          <Panel style={{ padding: '0' }}>
            <TopTokenList tokens={allTokens} />
          </Panel>
        </PageSection>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(GlobalPage)
