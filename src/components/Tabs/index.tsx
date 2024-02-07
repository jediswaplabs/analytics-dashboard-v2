import React, { ReactElement, useState } from 'react'
import styled from 'styled-components'

const TabWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 32px;
`

const StyledTab = styled.div`
  display: flex;
  width: 140px;
  height: 32px;
  padding: 2px 8px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

const ActiveTab = styled.div`
  display: flex;
  width: 140px;
  height: 32px;
  padding: 2px 8px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
`
const ActiveTabText = styled.div`
  color: #fff;
  font-feature-settings: 'cv11' on, 'cv01' on, 'ss01' on;
  font-family: 'Work Sans';
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 125% */
`
const StyledTabText = styled.div`
  color: #50d5ff;
  font-feature-settings: 'cv11' on, 'cv01' on, 'ss01' on;
  font-family: 'Work Sans';
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 125% */
`

export interface Tab {
  key: string
  label: string
  content: ReactElement | string
}

export interface TabsProps {
  tabs: Tab[]
}

export default function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].key)

  const onClickTabItem = (tabKey) => {
    setActiveTab(tabKey)
  }
  return (
    <>
      <TabWrapper>
        {tabs.map((tab) =>
          activeTab === tab.key ? (
            <ActiveTab
              onClick={(ev) => {
                ev.preventDefault()
                ev.stopPropagation()
                ev.nativeEvent.stopImmediatePropagation()
                onClickTabItem(tab.key)
              }}
            >
              <ActiveTabText>{tab.label}</ActiveTabText>
            </ActiveTab>
          ) : (
            <StyledTab
              onClick={(ev) => {
                ev.preventDefault()
                ev.stopPropagation()
                ev.nativeEvent.stopImmediatePropagation()
                onClickTabItem(tab.key)
              }}
            >
              <StyledTabText>{tab.label}</StyledTabText>
            </StyledTab>
          )
        )}
      </TabWrapper>
      {tabs.map((tab) => (
        <div key={tab.key} style={{ display: activeTab === tab.key ? 'block' : 'none' }}>
          {tab.content}
        </div>
      ))}{' '}
    </>
  )
}
