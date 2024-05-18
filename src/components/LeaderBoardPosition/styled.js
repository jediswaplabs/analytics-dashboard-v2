import styled from 'styled-components'
import { Flex } from 'rebass'
import Panel from '../Panel'
import { TYPE } from '../../Theme'

export const Wrapper = styled.div`
  display: grid;
  gap: 16px;
`

export const Decoration = styled.img`
  position: absolute;
  bottom: 0;
  right: 0;
  max-width: 100%;
  width: 111px;
  z-index: 0;
  user-select: none;
`

export const ClearSearchLink = styled.a`
  color: #50d5ff;
  font-size: '12px';
`

export const PositionPanelHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`

export const PositionPanel = styled(Panel)`
  border-radius: 8px;
  background: linear-gradient(91deg, #2f2e64 12.85%, #8666c9 104.19%);
  box-shadow: none;
  border: none;
  overflow: hidden;
  color: #fff;
  padding: 40px;
  padding-right: 105px;

  @media screen and (max-width: 880px) {
    padding: 12px;

    ${Decoration} {
      display: none;
    }
  }
`
export const PositionDataWrapper = styled.div`
  display: grid;
  // grid-template-columns: repeat(5, 1fr);
  // grid-template-areas: 'address rank score trades volume';

  grid-template-columns: repeat(2, 0.2fr);
  grid-template-areas: 'address score';

  @media screen and (max-width: 600px) {
    grid-template-columns: 1.5fr 1fr 1fr;
  }
`

export const DataItem = styled(Flex)`
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
  padding: 0 15%;

  &:first-child {
    padding: 0;
  }

  &:not(:first-child):not(:last-child):after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translate(0, -50%);
    background: rgba(217, 217, 217, 0.2);
    width: 1px;
    height: 75%;
  }
`

export const DataItemTitle = styled(TYPE.main)`
  font-size: 18px !important;
  white-space: nowrap;

  @media screen and (max-width: 880px) {
    font-size: 16px !important;
  }
`
export const DataItemValue = styled(TYPE.main)`
  font-size: 20px !important;
  white-space: nowrap;

  @media screen and (max-width: 880px) {
    font-size: 14px !important;
  }
`
export const ErrorContainer = styled.div`
  border-radius: 8px;
  background: linear-gradient(91deg, #2F2E64 12.85%, #8666C9 104.19%);
  color: white;
  text-align: center;
  padding: 20px;
`
export const ErrorHeader = styled.div`
  font-size: 20px;
  font-weight: 700;
`
export const ErrorText = styled.div`
  font-size: 16px;
  font-weight: 500;
`