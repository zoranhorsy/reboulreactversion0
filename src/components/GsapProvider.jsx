"use client"

import { useEffect } from "react"
import PropTypes from "prop-types"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export function GsapProvider({ children }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
  }, [])

  return <>{children}</>
}

GsapProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

