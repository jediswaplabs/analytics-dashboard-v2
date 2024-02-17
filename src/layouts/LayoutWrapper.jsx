import React from 'react'
import SideNav from '../components/SideNav'
import styled from 'styled-components'

const Center = styled.div`
  height: 100vh;
  z-index: 9999;
  transition: width 0.25s ease;

  @media screen and (max-width: 1080px) {
    height: calc(100vh - 50px);
  }
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

function LayoutWrapper({ children, savedOpen }) {
  return (
    <>
      <ContentWrapper open={savedOpen}>
        <SideNav />
        <Center id="center">{children}</Center>
      </ContentWrapper>
    </>
  )
}

export default LayoutWrapper
