import React, { useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { AutoColumn } from '../Column'
import Title from '../Title'
import { BasicLink } from '../Link'
import { useLocation, useMedia } from 'react-use'
import { withRouter } from 'react-router-dom'
import { TrendingUp, PieChart, Disc, X, Menu } from 'react-feather'
import EventEmitter from 'es-event-emitter'
import { disablePageScroll, enablePageScroll } from 'scroll-lock'

import Link from '../Link'
import { StyledIcon } from '../index'

const Wrapper = styled.div`
  height: 100vh;
  min-height: 510px;
  padding: 28px 40px 50px;
  position: sticky;
  top: 0px;
  z-index: 9999;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    position: relative;
  }

  @media screen and (max-width: 600px) {
    padding: 16px;
  }

  ${({ isMobile }) =>
    isMobile &&
    css`
      height: initial;
      min-height: initial;
      padding: 16px;
      z-index: 10000;
    `}
`

const OptionContent = styled.span`
  display: flex;
  align-items: center;
`

const Option = styled.div`
  font-weight: 500;
  font-size: 16px;
  opacity: ${({ activeText }) => (activeText ? 1 : 0.8)};
  color: ${({ theme }) => theme.white};
  position: relative;

  ${OptionContent} {
    position: relative;
    z-index: 1;
  }

  :hover {
    opacity: 1;
  }

  ${({ activeText }) =>
    activeText &&
    css`
      :after {
        content: '';
        position: absolute;
        top: 50%;
        right: 0;
        transform: translate(0, -50%);
        background: linear-gradient(270deg, #0a003a00 0%, #692bcb 100%);
        width: 120%;
        height: 200%;
        z-index: 0;
      }
    `};
`

const SideMenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 300px;
  gap: 3rem;
  transition: left 0.2s linear;

  ${({ isMobile }) =>
    isMobile &&
    css`
      overflow: auto;
      background: #000;
      position: fixed;
      left: -300px;
      top: 0;
      height: 100vh;
      padding: 32px;
      z-index: 9999;
      @media (max-width: 374px) {
        width: 100%;
        left: -100%;
      }
    `}

  ${({ isOpen }) =>
    isOpen &&
    css`
      left: 0;
      @media (max-width: 374px) {
        left: 0;
      }
    `}
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 100;
  transition: opacity 0.2s linear;
  opacity: 0;
  pointer-events: none;

  ${({ isVisible }) =>
    isVisible &&
    css`
      opacity: 0.8;
      pointer-events: all;
    `}
`

const MobileMenuWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const HeaderText = styled.div`
  margin-right: 0.5rem;
  font-size: 0.825rem;
  font-weight: 500;
  display: inline;
  opacity: 0.8;
  :hover {
    opacity: 1;
  }
  a {
    color: ${({ theme }) => theme.white};
  }
`

const Separator = styled.hr`
  width: 60%;
  border-top: 0;
  margin: 2px 0;
  border-color: rgba(217, 217, 217, 0.2);
`

const CloseMenuButton = styled.a`
  position: absolute;
  top: 10px;
  right: 10px;
`

const emmiter = new EventEmitter()

function SideNav({ history }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  let location = useLocation()

  const below1080 = useMedia('(max-width: 1080px)')
  const isMobile = !!below1080

  useEffect(() => {
    // console.dir(emmiter)
    emmiter.on('toggle-mobile-menu', () => {
      setIsMobileMenuOpen((s) => !s)
    })
  }, [setIsMobileMenuOpen])

  useEffect(() => {
    if (isMobileMenuOpen) {
      disablePageScroll()
    } else {
      enablePageScroll()
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (!isMobile) {
      enablePageScroll()
      setIsMobileMenuOpen(false)
    }
  }, [isMobile])

  useEffect(
    () =>
      history.listen(() => {
        setIsMobileMenuOpen(false)
      }),
    []
  )

  const handleOverlayClick = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  const handleCloseMenuButtonClick = useCallback((e) => {
    e.preventDefault()
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <Wrapper isMobile={isMobile}>
      {isMobile && <Overlay isVisible={isMobileMenuOpen} onClick={handleOverlayClick}></Overlay>}
      <SideMenuWrapper isMobile={isMobile} isOpen={isMobileMenuOpen} data-scroll-lock-scrollable={true}>
        {isMobile && (
          <CloseMenuButton onClick={handleCloseMenuButtonClick}>
            <StyledIcon>
              <X size={28} />
            </StyledIcon>
          </CloseMenuButton>
        )}
        <AutoColumn gap="3.375rem">
          {!below1080 && <Title />}
          <AutoColumn gap="1.5rem">
            <BasicLink to="/home">
              <Option activeText={history.location.pathname === '/home' ?? undefined}>
                <OptionContent>
                  <TrendingUp size={20} style={{ marginRight: '.5rem' }} />
                  Overview
                </OptionContent>
              </Option>
            </BasicLink>

            <BasicLink to="/tokens">
              <Option
                activeText={
                  (history.location.pathname.split('/')[1] === 'tokens' || history.location.pathname.split('/')[1] === 'token') ?? undefined
                }
              >
                <OptionContent>
                  <Disc size={20} style={{ marginRight: '.5rem' }} />
                  Tokens
                </OptionContent>
              </Option>
            </BasicLink>

            <BasicLink to="/pools">
              <Option
                activeText={(history.location.pathname.split('/')[1] === 'pools' || history.location.pathname.split('/')[1] === 'pool') ?? undefined}
              >
                <OptionContent>
                  <PieChart size={20} style={{ marginRight: '.5rem' }} />
                  Pools
                </OptionContent>
              </Option>
            </BasicLink>

            <Separator />

            <BasicLink to="/volume-leaderboard">
              <Option activeText={history.location.pathname.split('/')[1] === 'volume-leaderboard' ?? undefined}>
                <OptionContent>Volume Leaderboard</OptionContent>
              </Option>
            </BasicLink>

            <BasicLink to="/lp-leaderboard">
              <Option activeText={history.location.pathname.split('/')[1] === 'lp-leaderboard' ?? undefined}>
                <OptionContent>LP Leaderboard</OptionContent>
              </Option>
            </BasicLink>

            <Separator />

            {/* <BasicLink to="/rewards">
              <Option activeText={history.location.pathname.split('/')[1] === 'rewards' ?? undefined}>
                <OptionContent>Rewards</OptionContent>
              </Option>
            </BasicLink> */}
          </AutoColumn>
        </AutoColumn>
        <AutoColumn gap="1.5rem">
          <HeaderText>
            <Link href="https://jediswap.xyz/" target="_blank">
              JediSwap.xyz
            </Link>
          </HeaderText>
          <HeaderText>
            <Link href="https://docs.jediswap.xyz" target="_blank">
              Docs
            </Link>
          </HeaderText>
          <HeaderText>
            <Link href="https://docs.jediswap.xyz/for-developers/jediswap-v2" target="_blank">
              Tech Docs
            </Link>
          </HeaderText>
          <HeaderText>
            <Link href="https://discord.gg/jediswap" target="_blank">
              Discord
            </Link>
          </HeaderText>
          <HeaderText>
            <Link href="https://twitter.com/JediSwap" target="_blank">
              Twitter
            </Link>
          </HeaderText>
        </AutoColumn>
      </SideMenuWrapper>
      {below1080 &&
        <MobileMenuWrapper>
          <Title />
        </MobileMenuWrapper>
      }
    </Wrapper>
  )
}

export default withRouter(SideNav)
