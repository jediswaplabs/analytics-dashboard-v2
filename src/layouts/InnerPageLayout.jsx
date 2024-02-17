import { ContentWrapper, PageHeader, PageWrapper } from '../components'

import React from 'react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { TYPE } from '../Theme'

function InnerPageLayout({ breadcrumbs = null, header = null, pageTitle = '', children }) {
  return (
    <PageWrapper>
      {pageTitle && (
        <PageHeader>
          <TYPE.largeHeader lineHeight={0.7}>{pageTitle}</TYPE.largeHeader>
        </PageHeader>
      )}

      <OverlayScrollbarsComponent defer options={{ paddingAbsolute: true, scrollbars: { autoHide: 'auto' } }}>
        <ContentWrapper>{children}</ContentWrapper>
      </OverlayScrollbarsComponent>
    </PageWrapper>
  )
}

export default InnerPageLayout
