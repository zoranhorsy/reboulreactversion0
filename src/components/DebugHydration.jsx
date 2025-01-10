'use client'

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

export function DebugHydration({ componentName, children }) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      console.log(`Component ${componentName} has been hydrated`)
    }
  }, [isHydrated, componentName])

  return (
    <div data-hydrated={isHydrated} data-component-name={componentName}>
      {children}
    </div>
  )
}

DebugHydration.propTypes = {
  componentName: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

