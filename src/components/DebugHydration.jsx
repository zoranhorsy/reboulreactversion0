"use client"

import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"

const safeLog = (message) => {
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(message)
  }
}

export function DebugHydration({ componentName, children }) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    safeLog(`Component ${componentName} has been hydrated`)
  }, [componentName])

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

