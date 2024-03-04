import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Flex } from 'rebass'
import Link from '../Link'
import { RowFixed } from '../Row'
import Wordmark from '../../assets/wordmark.svg'
import { Menu } from 'react-feather'

import { BasicLink } from '../Link'
import { useMedia } from 'react-use'
import EventEmitter from 'es-event-emitter'
import { StyledIcon } from '../index'

const TitleWrapper = styled.div`
  text-decoration: none;
  z-index: 10;
  width: 100%;
  &:hover {
    cursor: pointer;
  }
`

const HamburgerButton = styled.a``

const Option = styled.div`
  position: relative;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.white};
  display: flex;
  padding: 15px 0;
  :hover {
    opacity: 1;
  }
`
const ActiveOption = styled(Option)`
  text-shadow: 0px 0px 73.21151733398438px rgba(49, 255, 156, 0.5), 0px 0px 18.911256790161133px rgba(49, 255, 156, 0.7);
  &::after {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0px;
    width: 100%;
    height: 2px;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
      linear-gradient(rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%);
    box-shadow: rgba(49, 255, 156, 0.5) 0px 0px 18.9113px, rgba(49, 255, 156, 0.5) 0px 0px 73.2115px, rgba(49, 255, 156, 0.5) 0px 0px 7.32115px inset;
  }
`

const BlackBottomMenu = styled(RowFixed)`
  alignitems: flex-end;
  background: linear-gradient(244deg, #000 0%, #000508 100%);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  justify-content: space-around;
  font-size: 1rem;
  font-family: 'Avenir LT Std';
`

const emmiter = new EventEmitter()

export default function Title() {
  const history = useHistory()
  const below1080 = useMedia('(max-width: 1080px)')
  const handleHamburgerButtonClick = useCallback((e) => {
    e.preventDefault()
    emmiter.emit('toggle-mobile-menu')
  }, [])

  return (
    <TitleWrapper>
      <Flex alignItems="center" style={{ justifyContent: 'space-between' }}>
        <RowFixed>
          <div id="link" onClick={() => history.push('/')}>
            <img
              width={'110px'}
              style={{ marginLeft: below1080 ? '0' : '8px', marginTop: '-4px' }}
              src={Wordmark}
              alt="logo"
              onClick={() => history.push('/')}
            />
          </div>
        </RowFixed>
        {below1080 && (
          <BlackBottomMenu>
            <BasicLink to="/home">
              {history.location.pathname === '/home' ? <ActiveOption>Overview</ActiveOption> : <Option>Overview</Option>}
            </BasicLink>
            <BasicLink to="/tokens">
              {history.location.pathname.split('/')[1] === 'tokens' || history.location.pathname.split('/')[1] === 'token' ? (
                <ActiveOption>Tokens</ActiveOption>
              ) : (
                <Option>Tokens</Option>
              )}
            </BasicLink>
            <BasicLink to="/pools">
              {history.location.pathname.split('/')[1] === 'pools' || history.location.pathname.split('/')[1] === 'pool' ? (
                <ActiveOption>Pools</ActiveOption>
              ) : (
                <Option>Pools</Option>
              )}
            </BasicLink>

            <HamburgerButton onClick={handleHamburgerButtonClick}>
              <StyledIcon>
                <Menu size={28} />
              </StyledIcon>
            </HamburgerButton>
          </BlackBottomMenu>
        )}
      </Flex>
    </TitleWrapper>
  )
}
