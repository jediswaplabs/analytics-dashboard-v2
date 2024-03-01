import React, { useState, useEffect, useMemo } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { Box, Flex } from 'rebass'
import { useMedia } from 'react-use'
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import { TYPE } from '../../Theme'
import LocalLoader from '../LocalLoader'
import { formattedNum, formattedPercent } from '../../utils'
import DoubleTokenLogo from '../DoubleLogo'
import { AutoRow } from '../Row'
import { CustomLink } from '../Link'
import Link from '../Link'
import FormattedName from '../FormattedName'
import FeeBadge from '../FeeBadge'
import { AutoColumn } from '../Column'
import { Divider } from '../index'
import { isEmpty } from 'lodash'

const Wrapper = styled.div`
  display: grid;
  gap: 30px;

  @media screen and (max-width: 1080px) {
    gap: 16px;
  }
`

const AprWrapper = styled.div`
  display: flex;
`

const StyledDivider = styled(Divider)`
  background: rgba(217, 217, 217, 0.2);
`

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;

  display: flex;
  flex-direction: column;
  gap: 12px;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 1fr 0.3fr 0.3fr;
  grid-template-areas: 'name tvl apr';
  padding: 14px 20px 14px 10px;
  border-radius: 4px;
  background: ${({ transparent }) => (transparent ? 'none' : 'rgba(255, 255, 255, 0.05)')};
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1} !important;

  font-size: 13px;
  font-weight: 500;

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

const Arrow = styled.div`
  color: ${({ theme, faded }) => (faded ? theme.jediGrey : theme.paginationTest)};
  padding: 0 20px;
  user-select: none;
  font-size: 30px;
  :hover {
    cursor: pointer;
  }
`

function RewardsPoolList({ rewardsPositions, itemMax = 10 }) {
  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  const below1200 = useMedia('(max-width: 1200px)')
  const below600 = useMedia('(max-width: 600px)')

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [rewardsPositions])

  useEffect(() => {
    if (rewardsPositions) {
      let extraPages = 1
      if (rewardsPositions.length % itemMax === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(rewardsPositions.length / itemMax) + extraPages)
    }
  }, [rewardsPositions, itemMax])

  const filteredRewardsPositions = useMemo(() => {
    return (
      rewardsPositions &&
      rewardsPositions.slice(itemMax * (page - 1), page * itemMax)
    )
  }, [rewardsPositions, itemMax, page])

  const ListItem = ({ pairData, index }) => {
    if (!(pairData && pairData.token0 && pairData.token1)) {
      return null
    }
    // const feePercent = (pairData ? parseFloat(pairData.fee) / 10000 : 0) + '%'
    const feePercent = '0.3%'
    const liquidity = formattedNum(pairData.reserveUSD, true)

    const cleanedAprFee = isNaN(pairData.aprFee) || !isFinite(pairData.aprFee) ? 0 : pairData.aprFee
    const displayAprFee = formattedPercent(cleanedAprFee, true, false)

    const cleanedAprStarknet = isNaN(pairData.aprStarknet) || !isFinite(pairData.aprStarknet) ? 0 : pairData.aprStarknet
    const displayAprStarknet = formattedPercent(cleanedAprStarknet, true, false)

    const cleanedAprCommon = cleanedAprFee + cleanedAprStarknet
    const displayAprCommon = formattedPercent(cleanedAprCommon, true, false)

    const getTooltipMarkup = () => {
      return (
        <AutoColumn gap={'12px'}>
          <TYPE.main fontSize={below600 ? 16 : 18}>
            <Flex>APR Details</Flex>
          </TYPE.main>
          <StyledDivider />
          <TYPE.main fontSize={below600 ? 14 : 16}>
            <Flex style={{ gap: '4px' }}>fee APR: {displayAprFee}</Flex>
          </TYPE.main>
          <TYPE.main fontSize={below600 ? 14 : 16}>
            <Flex style={{ gap: '4px' }}>STRK APR: {displayAprStarknet}</Flex>
          </TYPE.main>
        </AutoColumn>
      )
    }
    return (
      <DashGrid focus={true}>
        <DataText area="name" justifyContent={'flex-start'}>
          {/*<div style={{ display: 'flex' }}>*/}
          <DoubleTokenLogo
            size={below600 ? 16 : 20}
            a0={pairData.token0.tokenAddress}
            a1={pairData.token1.tokenAddress}
            s0={pairData.token0.symbol}
            s1={pairData.token1.symbol}
            margin
          />
          <AutoRow gap={'4px'} style={{ whiteSpace: 'nowrap', flexWrap: 'nowrap' }}>
            <Link external href={'https://info.jediswap.xyz/pair/' + pairData.poolAddress}>
              <FormattedName
                text={pairData.token0.symbol + '-' + pairData.token1.symbol}
                maxCharacters={below600 ? 8 : 16}
                adjustSize={true}
                link={true}
              />
            </Link>
            {/* <FeeBadge>{feePercent}</FeeBadge> */}
          </AutoRow>
          {/*</div>*/}
        </DataText>
        <DataText area="tvl" justifyContent={'flex-end'}>
          {liquidity}
        </DataText>
        <DataText area="apr" justifyContent={'flex-end'}>
          <AprWrapper className="apr-wrapper" data-tooltip-html={renderToStaticMarkup(getTooltipMarkup())} data-tooltip-place="left">
            {displayAprCommon}
          </AprWrapper>
        </DataText>
      </DashGrid>
    )
  }

  if (isEmpty(rewardsPositions)) {
    return <LocalLoader />
  }

  return (
    <Wrapper>
      <ListWrapper>
        <DashGrid transparent>
          <Flex justifyContent="flex-start">
            <TYPE.main color={'#959595'} fontWeight={700}>
              Pool name
            </TYPE.main>
          </Flex>

          <Flex justifyContent="flex-end">
            <TYPE.main color={'#959595'} fontWeight={700}>
              {below600 ? 'TVL' : 'Pool TVL'}
            </TYPE.main>
          </Flex>
          <Flex justifyContent="flex-end">
            <TYPE.main color={'#959595'} fontWeight={700}>
              APR
            </TYPE.main>
          </Flex>
        </DashGrid>

        <List p={0}>
          {filteredRewardsPositions.map((position, index) => {
            return (
              <div key={index}>
                <ListItem key={index} index={(page - 1) * itemMax + index + 1} pairData={position} />
              </div>
            )
          })}
        </List>
        {maxPage > 1 && (
          <PageButtons>
            <div
              onClick={(e) => {
                setPage(page === 1 ? page : page - 1)
              }}
            >
              <Arrow faded={page === 1 ? true : false}>{'<'}</Arrow>
            </div>
            <TYPE.body style={{ display: 'flex', alignItems: 'center' }}>{page + ' of ' + maxPage}</TYPE.body>
            <div
              onClick={(e) => {
                setPage(page === maxPage ? page : page + 1)
              }}
            >
              <Arrow faded={page === maxPage ? true : false}>{'>'}</Arrow>
            </div>
          </PageButtons>
        )}
      </ListWrapper>
      <ReactTooltip
        anchorSelect=".apr-wrapper"
        style={{
          background: 'linear-gradient(270deg, #763daf 0%, #8341ee 100%, #7e56bf 100%)',
          color: '#ffffff',
          borderRadius: '8px',
        }}
        arrowColor="#763daf"
        opacity={1}
      />
    </Wrapper>
  )
}

export default withRouter(RewardsPoolList)
