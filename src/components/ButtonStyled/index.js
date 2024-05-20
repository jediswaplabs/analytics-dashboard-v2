import React from 'react'
import { Button as RebassButton } from 'rebass/styled-components'
import styled, { css } from 'styled-components'
import { Plus, ChevronDown, ChevronUp } from 'react-feather'
import { darken, transparentize } from 'polished'
import { RowBetween } from '../Row'
import { StyledIcon } from '..'

const Base = styled(RebassButton)`
  padding: 8px 12px;
  font-size: 0.825rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
  border: 1px solid transparent;
  outline: none;
  border-bottom-right-radius: ${({ open }) => open && '0'};
  border-bottom-left-radius: ${({ open }) => open && '0'};
`

const BaseCustom = styled(RebassButton)`
  padding: 16px 12px;
  font-size: 0.825rem;
  font-weight: 400;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
`

const Dull = styled(Base)`
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: black;
  height: 100%;
  font-weight: 400;
  &:hover,
  :focus {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.25);
  }
  &:focus {
    box-shadow: 0 0 0 1pt rgba(255, 255, 255, 0.25);
  }
  &:active {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.25);
  }
`

export default function ButtonStyled({ children, ...rest }) {
  return <Base {...rest}>{children}</Base>
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

export const ButtonLight = styled(Base)`
  background-color: ${({ color, theme }) => (color ? transparentize(0.9, color) : transparentize(0.9, theme.primary1))};
  color: ${({ color, theme }) => (color ? darken(0.1, color) : theme.primary1)};

  min-width: fit-content;
  border-radius: 12px;
  white-space: nowrap;

  a {
    color: ${({ color, theme }) => (color ? darken(0.1, color) : theme.primary1)};
  }

  :hover {
    background-color: ${({ color, theme }) => (color ? transparentize(0.8, color) : transparentize(0.8, theme.primary1))};
  }
`

export function ButtonDropdown({ disabled = false, children, open, ...rest }) {
  return (
    <ButtonFaded {...rest} disabled={disabled} ope={open}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        {open ? (
          <StyledIcon>
            <ChevronUp size={24} />
          </StyledIcon>
        ) : (
          <StyledIcon>
            <ChevronDown size={24} />
          </StyledIcon>
        )}
      </RowBetween>
    </ButtonFaded>
  )
}

export const ButtonDark = styled(Base)`
  color: white;
  width: fit-content;
  white-space: nowrap;
  padding: 9px 21px;
  flex-shrink: 0;
  border-radius: 8px;
  background: linear-gradient(95.64deg, #29aafd 8.08%, #ff00e9 105.91%);
  text-align: center;
  font-size: 18px;
  font-style: normal;
  font-weight: 750;
  line-height: 20px;
  border: unset;
  cursor: pointer;
  font-family: 'Avenir LT Std';

  &:focus {
    background: linear-gradient(95.64deg, #ff00e9 8.08%, #29aafd 105.91%);
  }
  &:hover {
    background: linear-gradient(95.64deg, #ff00e9 8.08%, #29aafd 105.91%);
  }
  &:active {
    background: linear-gradient(95.64deg, #ff00e9 8.08%, #29aafd 105.91%);
  }
  &:disabled {
    cursor: default;
    opacity: 100%;
    background: #141451;
    color: #9b9b9b;
    box-shadow: 0px 0.76977px 30.79088px 0px rgba(227, 222, 255, 0.2) inset,
      0px 3.07909px 13.8559px 0px rgba(154, 146, 210, 0.3) inset,
      0px 75.43767px 76.9772px -36.94907px rgba(202, 172, 255, 0.3) inset;
  }

`

export const ButtonFaded = styled(Base)`
  background-color: ${({ theme }) => theme.bg2};
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;

  :hover {
    opacity: 0.5;
  }
`

export function ButtonPlusDull({ disabled, children, ...rest }) {
  return (
    <Dull {...rest}>
      <ContentWrapper>
        <Plus size={16} />
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
      </ContentWrapper>
    </Dull>
  )
}

export function ButtonCustom({ children, bgColor, color, ...rest }) {
  return (
    <BaseCustom bg={bgColor} color={color} {...rest}>
      {children}
    </BaseCustom>
  )
}

const activeAndHoverOptionsButtonStyles = css`
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  color: #ff00e9;
  background: #fff;
`
export const OptionButton = styled.div`
  min-width: 45px;
  white-space: nowrap;
  text-align: center;
  padding: 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0px 0.77px 30.791px 0px rgba(227, 222, 255, 0.2) inset, 0px 3.079px 13.856px 0px rgba(154, 146, 210, 0.3) inset;
  color: #fff;
  font-weight: 500;

  &:hover {
    ${activeAndHoverOptionsButtonStyles}
  }

  ${(props) => props.active && activeAndHoverOptionsButtonStyles}
`
export const OptionButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1px;

  ${OptionButton}:not(:only-child):not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  ${OptionButton} + ${OptionButton} {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`
