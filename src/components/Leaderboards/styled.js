import styled, { css } from 'styled-components'
import { Box, Flex } from 'rebass'

export const Wrapper = styled.div`
  display: grid;
  gap: 30px;

  @media screen and (max-width: 1080px) {
    gap: 16px;
  }
`

export const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

export const Arrow = styled.div`
  color: ${({ theme, faded }) => (faded ? theme.jediGrey : theme.paginationTest)};
  padding: 0 20px;
  user-select: none;
  font-size: 30px;
  :hover {
    cursor: pointer;
  }
`

export const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`
export const TabItem = styled.button`
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  border: none;
  color: #50d5ff;
  background: none;
  cursor: pointer;
  min-width: 140px;
  padding: 0 12px;
  height: 32px;
  ${(props) =>
    props.isActive &&
    css`
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    `}
`

export const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const List = styled(Box)`
  -webkit-overflow-scrolling: touch;

  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 20px 20px 6fr 0.6fr 1fr 0.6fr;
  grid-template-areas: 'number star address trades volume score';
  padding: 14px 20px 14px 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);

  @media screen and (max-width: 1200px) {
    grid-template-columns: 20px 20px 4fr 0.6fr 1fr 0.6fr;
  }

  @media screen and (max-width: 600px) {
    grid-template-columns: 20px 20px 6fr 1fr;
    grid-template-areas: 'number star address score';
  }
`

export const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1} !important;

  font-size: 13px;
  font-weight: 500;

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`