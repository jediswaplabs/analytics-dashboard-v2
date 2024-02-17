import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'

import { RowBetween } from '../components/Row'
import { AutoColumn } from '../components/Column'
import PairList from '../components/PairList'
import TopTokenList from '../components/TokenList'
import GlobalChart from '../components/GlobalChart'
import Search from '../components/Search'

import { useGlobalData } from '../contexts/GlobalData'
import { useAllPairData } from '../contexts/PairData'
import Panel from '../components/Panel'
import { useAllTokenData } from '../contexts/TokenData'
import { formattedNum, formattedPercent } from '../utils'
import { TYPE } from '../Theme'
import { CustomLink } from '../components/Link'

import { PageSection } from '../components'
import PageLayout from '../layouts/PageLayout'

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 12px;
  display: inline-grid;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      /* grid-column: 1 / 4; */
    }

    > * {
      &:first-child {
        width: 100%;
      }
    }
  }
`

function GlobalPage() {
  // get data for lists and totals
  const allPairs = useAllPairData()
  const allTokens = useAllTokenData()
  const { totalVolumeUSD, volumeChangeUSD, totalValueLockedUSD, liquidityChangeUSD, totalFeesUSD, feesChangeUSD } = useGlobalData()

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
    <PageLayout pageTitle={'Overview'}>
      <PageSection>
        <Search />
      </PageSection>

      <PageSection>
        <PanelWrapper>
          <Panel>
            <AutoColumn gap="20px">
              <RowBetween>
                <TYPE.subHeader>Total Liquidity</TYPE.subHeader>
              </RowBetween>
              <RowBetween align="baseline">
                <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                  {formattedNum(totalValueLockedUSD, true)}
                </TYPE.main>
                <TYPE.main fontSize="1rem">{formattedPercent(liquidityChangeUSD)}</TYPE.main>
              </RowBetween>
            </AutoColumn>
          </Panel>
          <Panel>
            <AutoColumn gap="20px">
              <RowBetween>
                <TYPE.subHeader>Volume (24hr)</TYPE.subHeader>
                <div />
              </RowBetween>
              <RowBetween align="baseline">
                <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                  {formattedNum(totalVolumeUSD, true)}
                </TYPE.main>
                <TYPE.main fontSize="1rem">{formattedPercent(volumeChangeUSD)}</TYPE.main>
              </RowBetween>
            </AutoColumn>
          </Panel>
          <Panel>
            <AutoColumn gap="20px">
              <RowBetween>
                <TYPE.subHeader>Total fees (24hr)</TYPE.subHeader>
              </RowBetween>
              <RowBetween align="baseline">
                <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                  {formattedNum(totalFeesUSD, true)}
                </TYPE.main>
                <TYPE.main fontSize="1rem">{formattedPercent(feesChangeUSD)}</TYPE.main>
              </RowBetween>
            </AutoColumn>
          </Panel>
        </PanelWrapper>
      </PageSection>

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
    </PageLayout>
  )
}

export default withRouter(GlobalPage)
