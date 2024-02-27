import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import 'feather-icons'
import { ContentWrapper, PageHeader, PageSection, PageWrapper } from '../components'
import PageLayout from '../layouts/PageLayout'
import { TYPE } from '../Theme'

import nightStar from '../assets/night-star.svg'
import RewardPoolsList from '../components/RewardPoolsList'
import { PAIRS_DATA_FOR_REWARDS, POOLS_DATA } from '../apollo/queries.js'
import { jediSwapClient } from '../apollo/client.js'
import { isEmpty } from 'lodash'
import { STARKNET_REWARDS_API_URL } from '../constants/index.js'

const BaseStar = styled.img`
  position: absolute;
`

const Star1 = styled(BaseStar)`
  width: 60px;
  height: 60px;
  left: 0;
  top: 50%;
  transform: translate(0, -50%);
`
const Star2 = styled(BaseStar)`
  width: 36px;
  height: 36px;
  left: 15%;
  bottom: 0;
`
const Star3 = styled(BaseStar)`
  width: 25px;
  height: 25px;
  left: 30%;
  top: 0;
  filter: blur(2px);
`
const Star4 = styled(BaseStar)`
  width: 40px;
  height: 40px;
  left: 56%;
  top: 15%;
  transform: rotate(45deg);
`
const Star5 = styled(BaseStar)`
  width: 13px;
  height: 13px;
  left: 78%;
  bottom: 0;
  filter: blur(2px);
`

const StarsContainer = styled.div`
  position: absolute;
  width: 85%;
  right: 0;
  height: 75px;
  top: 50%;
  transform: translate(0, -50%);

  @media (max-width: 640px) {
    display: none;
  }
`

const RewardsPageHeader = styled(PageHeader)`
  margin-bottom: 52px;
  position: relative;
`

const pairs = [
  {
    rewardName: 'USDC/USDT',
    poolAddress: '0x5801bdad32f343035fb242e98d1e9371ae85bc1543962fedea16c59b35bd19b',
    token0: {
      tokenAddress: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
      symbol: 'USDC',
    },
    token1: {
      tokenAddress: '0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
      symbol: 'USDT',
    }
  },
  {
    rewardName: 'STRK/ETH',
    poolAddress: '0x2ed66297d146ecd91595c3174da61c1397e8b7fcecf25d423b1ba6717b0ece9',
    token0: {
      tokenAddress: '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      symbol: 'STRK',
    },
    token1: {
      tokenAddress: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
      symbol: 'ETH',
    }
  },
  {
    rewardName: 'ETH/USDC',
    poolAddress: '0x4d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a',
    token0: {
      tokenAddress: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
      symbol: 'ETH',
    },
    token1: {
      tokenAddress: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
      symbol: 'USDC',
    }
  },
  {
    rewardName: 'STRK/USDC',
    poolAddress: '0x5726725e9507c3586cc0516449e2c74d9b201ab2747752bb0251aaa263c9a26',
    token0: {
      tokenAddress: '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
      symbol: 'STRK',
    },
    token1: {
      tokenAddress: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
      symbol: 'USDC',
    }
  },
]
function RewardsPage() {
  const [pairsData, setPairsData] = useState({})
  useEffect(() => {
    // const pairIds = Object.values(pairs)
    const pairIds = pairs.map(pair => pair.poolAddress);

    // const pairNames = Object.keys(pairs)
    const pairNames = pairs.map(pair => pair.rewardName);
    async function getPairsData() {
      const requests = [
        jediSwapClient.query({
          query: PAIRS_DATA_FOR_REWARDS({
            pairIds
          }),
          fetchPolicy: 'cache-first',
        }),
        fetch(STARKNET_REWARDS_API_URL)
      ];
      const [pairsResp, starknetResp] = await Promise.all(requests);
      const rewardsResp = await starknetResp.json();
      const jediRewards = rewardsResp.Jediswap_v1;
      // console.log('jediRewards', jediRewards)
      const rewardsPositions = {}
      for (const pair of pairs) {
        const rewardsData = jediRewards[pair.rewardName].pop();
        const recentDate = rewardsData.date;
        const pairDayData = pairsResp.data.pairDayDatas.find(dayData => dayData.pairId === pair.poolAddress && dayData.date === recentDate + 'T00:00:00')
        console.log('pairDayData', pairDayData)
        rewardsPositions[pair.poolAddress] = {
          ...pair,
          starknetAllocation: rewardsData.allocation,
          reserveUSD: pairDayData.reserveUSD,
          dailyVolumeUSD: pairDayData.dailyVolumeUSD
        }
      }
      console.log('rewardsPositions', rewardsPositions)

      setPairsData(rewardsPositions)
    }
    if (isEmpty(rewardsPositions)) {
      getPairsData()
    }
  }, [])
  const rewardsPositions = pairsData
  // const rewardsPositions = useAllRewardPoolsData();
  const rewardsPositions1 = {
    '0x7015a6822f109a2e41d25dd6878fe161ae9bb13eeb87e62de42a3158a64db28': {
      poolAddress: '0x7015a6822f109a2e41d25dd6878fe161ae9bb13eeb87e62de42a3158a64db28',
      trackedReserveUSD: 400000,
      oneDayFeesUSD: 150,
      starknetAllocation: 150,
      fee: 1000,
      token0: {
        tokenAddress: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
        symbol: 'ETH',
        name: 'Ether',
        totalValueLocked: '15.594914939885742714',
        derivedETH: '1',
      },
      token1: {
        tokenAddress: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
        symbol: 'USDC',
        name: 'USD Coin',
        totalValueLocked: '43431.917155',
        derivedETH: '0.0003472512071008262356184729812',
      },
      volumeToken0: '1.671645228155984486',
      volumeToken1: '4697.267604',
      totalValueLockedUSD: '7706.260625308784392935415902',
      totalValueLockedETH: '2.676008304372043377694329871',
      volumeUSD: '4690.55557376365459729534682751319',
    },
    '0x4d65490cc7d4c459742acad11a63e2ec991c330f64c8738bfe972533dbf902c': {
      poolAddress: '0x4d65490cc7d4c459742acad11a63e2ec991c330f64c8738bfe972533dbf902c',
      trackedReserveUSD: 400000,
      oneDayFeesUSD: 150,
      starknetAllocation: 150,
      fee: 10000,
      token0: {
        tokenAddress: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
        symbol: 'ETH',
        name: 'Ether',
        totalValueLocked: '15.594914939885742714',
        derivedETH: '1',
      },
      token1: {
        tokenAddress: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
        symbol: 'USDC',
        name: 'USD Coin',
        totalValueLocked: '43431.917155',
        derivedETH: '0.0003472512071008262356184729812',
      },
      volumeToken0: '1.671645228155984486',
      volumeToken1: '4697.267604',
      totalValueLockedUSD: '7706.260625308784392935415902',
      totalValueLockedETH: '2.676008304372043377694329871',
      volumeUSD: '4690.55557376365459729534682751319',
    },
    '0x3896df6f0727238c3328ce47724988d872f79c73826a3bcb1c36ca4eb10fd77': {
      poolAddress: '0x3896df6f0727238c3328ce47724988d872f79c73826a3bcb1c36ca4eb10fd77',
      trackedReserveUSD: 400000,
      oneDayFeesUSD: 150,
      starknetAllocation: 180,
      fee: 10000,
      token0: {
        tokenAddress: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
        symbol: 'ETH',
        name: 'Ether',
        totalValueLocked: '15.594914939885742714',
        derivedETH: '1',
      },
      token1: {
        tokenAddress: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
        symbol: 'USDC',
        name: 'USD Coin',
        totalValueLocked: '43431.917155',
        derivedETH: '0.0003472512071008262356184729812',
      },
      volumeToken0: '1.671645228155984486',
      volumeToken1: '4697.267604',
      totalValueLockedUSD: '7706.260625308784392935415902',
      totalValueLockedETH: '2.676008304372043377694329871',
      volumeUSD: '4690.55557376365459729534682751319',
    },
  }

  return (
    <PageWrapper>
      <RewardsPageHeader>
        <TYPE.largeHeader lineHeight={0.7}>Rewards</TYPE.largeHeader>

        <StarsContainer>
          <Star1 src={nightStar} draggable={false}></Star1>
          <Star2 src={nightStar} draggable={false}></Star2>
          <Star3 src={nightStar} draggable={false}></Star3>
          <Star4 src={nightStar} draggable={false}></Star4>
          <Star5 src={nightStar} draggable={false}></Star5>
        </StarsContainer>
      </RewardsPageHeader>

      <ContentWrapper>
        <PageSection>
          <RewardPoolsList rewardsPositions={rewardsPositions}></RewardPoolsList>
        </PageSection>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default RewardsPage