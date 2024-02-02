import React from 'react'
import ReactDOM from 'react-dom'
import ThemeProvider, { GlobalStyle } from './Theme'

import ApplicationContextProvider from './contexts/v1/Application'
import GlobalDataContextProvider from './contexts/v1/GlobalData'
import LocalStorageContextProvider, { Updater as LocalStorageContextUpdater } from './contexts/v1/LocalStorage'
import TokenDataContextProvider, { Updater as TokenDataContextUpdater } from './contexts/v1/TokenData'

// import PairDataContextProvider, { Updater as PairDataContextUpdater } from './contexts/PairData'
// import LpContestDataProvider, { Updater as LpContestDataContextUpdater } from './contexts/LpContestData'
// import UserContextProvider from './contexts/User'

import App from './App'

function ContextProviders({ children }) {
  return (
    <LocalStorageContextProvider>
      <ApplicationContextProvider>
        <TokenDataContextProvider>
          <GlobalDataContextProvider>
            {/*<PairDataContextProvider>*/}
            {/*    <LpContestDataProvider>*/}
            {/*<UserContextProvider>*/}
            {children}
            {/*</UserContextProvider>*/}
            {/*</LpContestDataProvider>*/}
            {/*</PairDataContextProvider>*/}
          </GlobalDataContextProvider>
        </TokenDataContextProvider>
      </ApplicationContextProvider>
    </LocalStorageContextProvider>
  )
}

function Updaters() {
  return (
    <>
      <LocalStorageContextUpdater />
      {/*<PairDataContextUpdater />*/}
      {/*<LpContestDataContextUpdater />*/}
      <TokenDataContextUpdater />
    </>
  )
}

ReactDOM.render(
  <ContextProviders>
    <Updaters />
    <ThemeProvider>
      <>
        <GlobalStyle />
        <App />
      </>
    </ThemeProvider>
  </ContextProviders>,
  document.getElementById('root')
)
