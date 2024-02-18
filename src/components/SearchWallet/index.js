import React, { useState, useCallback } from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { Search as SearchIcon } from 'react-feather'

import { isStarknetAddress, zeroStarknetAddress } from '../../utils'

import { AutoRow } from '../Row'
// import { VolumeContestPanel } from '../Panel'
import Panel, { FadePanel } from '../Panel'
import { ButtonDark } from '../ButtonStyled'

import digitalWalletImage from '../../assets/banners/digital_wallet.png'
import digitalWalletImage_x2 from '../../assets/banners/digital_wallet@x2.png'

const Decoration = styled.img`
  position: absolute;
  top: -45px;
  right: -45px;
  max-width: 100%;
  width: 187px;
  z-index: 0;
  transform: rotate(12.116deg);
`

const SearchIconLarge = styled(SearchIcon)`
  height: 20px;
  width: 20px;
  position: absolute;
  transform: translate(0, -50%);
  right: 15px;
  top: 50%;
  pointer-events: none;
  color: ${({ theme }) => theme.text3};
`

const SearchPanel = styled(Panel)`
  box-shadow: none;
  border-radius: 8px;
  border: 1px solid rgba(160, 160, 160, 0.4);
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
  color: #fff;
  padding: 24px 32px;
  padding-right: 155px;

  @media screen and (max-width: 880px) {
    padding: 12px;

    ${Decoration} {
      display: none;
    }
  }
`

const SearchPanelRow = styled(AutoRow)`
  width: calc(100% + 32px);

  @media screen and (max-width: 600px) {
    flex-wrap: wrap;
  }
`

const SearchWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  width: 100%;
  border-radius: 12px;
`

const Title = styled.div`
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 10px;
`

const Input = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  white-space: nowrap;
  outline: none;
  padding: 12px;
  padding-right: 50px;
  border-radius: 8px;
  color: ${({ theme }) => theme.text1};
  background-color: #141451;
  font-size: 16px;

  border: 1px solid ${({ theme }) => theme.bg3};

  &:focus {
    border: 1px solid ${({ theme }) => theme.text1};
  }

  ::placeholder {
    color: ${({ theme }) => theme.text3};
    font-size: 14px;
  }

  @media screen and (max-width: 640px) {
    ::placeholder {
      font-size: 1rem;
    }
  }
`

const SearchButton = styled(ButtonDark)`
  height: 48px;
  border-radius: 8px;
  padding: 14px 17px;
`

function SearchWalletPanel({ onSearch }) {
  const [checkAccountQuery, setCheckAccountQuery] = useState('')
  const [isCheckAccountAddressValid, setIsCheckAccountAddressValid] = useState(false)

  const handleCheckAccountInputChange = useCallback(
    (e) => {
      const value = e.currentTarget.value
      if (!value) {
        setCheckAccountQuery('')
        setIsCheckAccountAddressValid(false)
        return
      }
      setCheckAccountQuery(value)
      setIsCheckAccountAddressValid(isStarknetAddress(value, true))
    },
    [setCheckAccountQuery]
  )

  const handleAccountSearch = useCallback(
    (e) => {
      if (!(isCheckAccountAddressValid && checkAccountQuery)) {
        return
      }
      onSearch(checkAccountQuery)
    },
    [isCheckAccountAddressValid, checkAccountQuery, onSearch]
  )

  return (
    <>
      <SearchPanel>
        <Title>Search your wallet</Title>

        <SearchPanelRow gap={'14px'}>
          <SearchWrapper>
            <Input
              type="text"
              value={checkAccountQuery}
              onChange={handleCheckAccountInputChange}
              placeholder={'Enter account address'}
              maxLength={zeroStarknetAddress.length}
            />
            <SearchIconLarge />
          </SearchWrapper>
          <div>
            <SearchButton onClick={handleAccountSearch} disabled={!isCheckAccountAddressValid}>
              View Profile
            </SearchButton>
          </div>
        </SearchPanelRow>
        <Decoration src={digitalWalletImage} srcSet={digitalWalletImage + ' 1x,' + digitalWalletImage_x2 + ' 2x'} alt={''} />
      </SearchPanel>
    </>
  )
}

export default withRouter(SearchWalletPanel)
