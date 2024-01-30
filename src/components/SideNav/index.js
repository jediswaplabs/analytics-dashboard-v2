import React from 'react'
import styled, { css } from 'styled-components'
import { AutoColumn } from '../Column'
import Title from '../Title'
import { BasicLink } from '../Link'
import { useMedia } from 'react-use'
import { transparentize } from 'polished'
import { TYPE } from '../../Theme'
import { withRouter } from 'react-router-dom'
import { TrendingUp, List, PieChart, Disc, Flag } from 'react-feather'
import Link from '../Link'
import { useSessionStart } from '../../contexts/Application'

import confettiFiatGif from './confetti-flat.webp'
import confettiFiatGif_x2 from './confetti-flat@x2.webp'

const Wrapper = styled.div`
  min-height: ${({ isMobile }) => (isMobile ? 'initial' : 'calc(100vh - 48px)')};
  padding: ${({ isMobile }) => (isMobile ? '16px' : 'calc(17px * 1.3) 40px 100px')};
  position: sticky;
  top: 0px;
  z-index: 9999;
  padding-top: 28px;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    position: relative;
  }

  @media screen and (max-width: 600px) {
    padding: 16px;
  }
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

const DesktopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 3rem;
`

const MobileWrapper = styled.div`
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

const Polling = styled.div`
  position: fixed;
  display: flex;
  left: 0;
  bottom: 0;
  padding: 1rem;
  color: white;
  opacity: 0.4;
  transition: opacity 0.25s ease;
  :hover {
    opacity: 1;
  }
`
const PollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  margin-right: 0.5rem;
  margin-top: 3px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.green1};
`

const AccentText = styled.span`
  background: linear-gradient(90deg, #4bd4ff 0%, #ef35ff 97.26%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`

const Separator = styled.hr`
  width: 60%;
  border-top: 0;
  margin: 2px 0;
  border-color: rgba(217, 217, 217, 0.2);
`

function SideNav({ history }) {
  const below1080 = useMedia('(max-width: 1080px)')

  const below1180 = useMedia('(max-width: 1180px)')

  const seconds = useSessionStart()

  return (
    <Wrapper isMobile={below1080}>
      {!below1080 ? (
        <DesktopWrapper>
          <AutoColumn gap="3.375rem">
            <Title />
            {!below1080 && (
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

                <BasicLink to="/pairs">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'pairs' || history.location.pathname.split('/')[1] === 'pair') ?? undefined
                    }
                  >
                    <OptionContent>
                      <PieChart size={20} style={{ marginRight: '.5rem' }} />
                      Pairs
                    </OptionContent>
                  </Option>
                </BasicLink>

                <Separator />

                <BasicLink to="/volume-leaderboarad">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'accounts' || history.location.pathname.split('/')[1] === 'volume-leaderboarad') ??
                      undefined
                    }
                  >
                    <OptionContent>Volume Leaderboard</OptionContent>
                  </Option>
                </BasicLink>
                <BasicLink to="/accounts">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'lp-leaderboard' ||
                        history.location.pathname.split('/')[1] === 'lp-leaderboard') ??
                      undefined
                    }
                  >
                    <OptionContent>LP Leaderboard</OptionContent>
                  </Option>
                </BasicLink>
                <Separator />
                <BasicLink to="/rewards">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'rewards' || history.location.pathname.split('/')[1] === 'rewards') ?? undefined
                    }
                  >
                    <OptionContent>Rewards</OptionContent>
                  </Option>
                </BasicLink>
              </AutoColumn>
            )}
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
              <Link href="https://docs.jediswap.xyz/for-developers/smart-contract-integration" target="_blank">
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
          {!below1180 && (
            <Polling style={{ marginLeft: '.5rem' }}>
              <PollingDot />
              <a href="/" style={{ color: 'white' }}>
                <TYPE.small color={'white'}>
                  Updated {!!seconds ? seconds + 's' : '-'} ago <br />
                </TYPE.small>
              </a>
            </Polling>
          )}
        </DesktopWrapper>
      ) : (
        <MobileWrapper>
          <Title />
        </MobileWrapper>
      )}
    </Wrapper>
  )
}

export default withRouter(SideNav)
