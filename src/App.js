import React, { useState } from 'react'
import styled from 'styled-components'
import { Route, Switch, BrowserRouter, Redirect } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import { isEmpty } from 'lodash'
import { jediSwapClient } from './apollo/client'
import GlobalPage from './pages/GlobalPage'
import TokenPage from './pages/TokenPage'
import PairPage from './pages/PairPage'
import AllTokensPage from './pages/AllTokensPage'
import AllPairsPage from './pages/AllPairsPage'
import { useGlobalData } from './contexts/GlobalData'
import { isStarknetAddress } from './utils'

import SideNav from './components/SideNav'
import LocalLoader from './components/LocalLoader'
import { useWhitelistedTokens } from './contexts/Application'

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
  //padding-top: 48px;
`

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: ${({ open }) => (open ? '300px 1fr 200px' : '300px 1fr 64px')};

  @media screen and (max-width: 1400px) {
    grid-template-columns: 300px 1fr;
  }

  @media screen and (max-width: 1080px) {
    grid-template-columns: 1fr;
    max-width: 100vw;
    overflow: hidden;
    grid-gap: 0;
  }
`

const Center = styled.div`
  height: 100%;
  z-index: 9999;
  transition: width 0.25s ease;
`

const WarningWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
`

const WarningBanner = styled.div`
  background-color: #ff3257;
  padding: 0.85rem;
  color: white;
  width: 100%;
  text-align: center;
  font-weight: 500;
  font-size: 16px;
`

/**
 * Wrap the component with the header and sidebar pinned tab
 */
const LayoutWrapper = ({ children, savedOpen, setSavedOpen }) => {
  return (
    <>
      <ContentWrapper open={savedOpen}>
        <SideNav />
        <Center id="center">{children}</Center>
      </ContentWrapper>
    </>
  )
}

const BLOCK_DIFFERENCE_THRESHOLD = 2

function App() {
  const [savedOpen, setSavedOpen] = useState(false)

  const globalData = useGlobalData()
  // const globalChartData = useGlobalChartData()
  const whitelistedTokens = useWhitelistedTokens()
  // const [latestBlock, headBlock] = useLatestBlocks()
  // const showWarning = headBlock && latestBlock ? headBlock.number - latestBlock.number > BLOCK_DIFFERENCE_THRESHOLD : false

  return (
    <ApolloProvider client={jediSwapClient}>
      <AppWrapper>
        {/*{showWarning && (*/}
        {/*  <WarningWrapper>*/}
        {/*    <WarningBanner>{`Dashboard is not synced.`}</WarningBanner>*/}
        {/*  </WarningWrapper>*/}
        {/*)}*/}
        {/*{globalData &&*/}
        {/*Object.keys(globalData).length > 0 &&*/}
        {/*globalChartData &&*/}
        {/*Object.keys(globalChartData).length > 0 &&*/}
        {/*!isEmpty(whitelistedTokens) ? (*/}
        {globalData && Object.keys(globalData).length > 0 && !isEmpty(whitelistedTokens) ? (
          <BrowserRouter>
            <Switch>
              <Route
                exacts
                strict
                path="/token/:tokenAddress"
                render={({ match }) => {
                  if (isStarknetAddress(match.params.tokenAddress.toLowerCase()) && whitelistedTokens[match.params.tokenAddress.toLowerCase()]) {
                    return (
                      <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                        <TokenPage address={match.params.tokenAddress.toLowerCase()} />
                      </LayoutWrapper>
                    )
                  } else {
                    return <Redirect to="/home" />
                  }
                }}
              />
              <Route
                exacts
                strict
                path="/pool/:pairAddress"
                render={({ match }) => {
                  if (isStarknetAddress(match.params.pairAddress.toLowerCase())) {
                    return (
                      <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                        <PairPage pairAddress={match.params.pairAddress.toLowerCase()} />
                      </LayoutWrapper>
                    )
                  } else {
                    return <Redirect to="/home" />
                  }
                }}
              />

              <Route path="/home">
                <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                  <GlobalPage />
                </LayoutWrapper>
              </Route>

              <Route path="/tokens">
                <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                  <AllTokensPage />
                </LayoutWrapper>
              </Route>

              <Route path="/pools">
                <LayoutWrapper savedOpen={savedOpen} setSavedOpen={setSavedOpen}>
                  <AllPairsPage />
                </LayoutWrapper>
              </Route>

              <Redirect to="/home" />
            </Switch>
          </BrowserRouter>
        ) : (
          <LocalLoader fill="true" />
        )}
      </AppWrapper>
    </ApolloProvider>
  )
}

export default App
