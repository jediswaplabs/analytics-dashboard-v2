import { ContentWrapper, PageHeader, PageWrapper } from '../components'

import React from 'react'
import { TYPE } from '../Theme'

function PageLayout({ pageTitle = '', children }) {
  return (
    <PageWrapper>
      {pageTitle && (
        <PageHeader>
          <TYPE.largeHeader lineHeight={0.7}>{pageTitle}</TYPE.largeHeader>
        </PageHeader>
      )}

      <ContentWrapper>{children}</ContentWrapper>
    </PageWrapper>
  )
}

export default PageLayout
