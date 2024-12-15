'use client'

import { useCallback } from "react"
import Particles from "react-tsparticles"
import type { Container, Engine } from "tsparticles-engine"
import { loadSlim } from "tsparticles-slim"

export const ParticlesBackground = () => {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine)
    }, [])

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        // console.log(container)
    }, [])

    return (
        <Particles
            className="absolute inset-0"
            id="tsparticles"
            loaded={particlesLoaded}
            init={particlesInit}
            options={{
                fullScreen: false,
                background: {
                    color: {
                        value: "transparent",
                    },
                },
                fpsLimit: 120,
                particles: {
                    color: {
                        value: "#ff8c42",
                    },
                    links: {
                        color: "#ff6b2c",
                        distance: 150,
                        enable: true,
                        opacity: 0.2,
                        width: 1,
                    },
                    collisions: {
                        enable: false,
                    },
                    number: {
                        value: 80, // Increased value to compensate for removed density
                    },
                    move: {
                        enable: true,
                        speed: 1,
                        direction: "none",
                        random: false,
                        straight: false,
                        outModes: {
                            default: "out"
                        },
                    },
                    opacity: {
                        value: 0.3,
                    },
                    size: {
                        value: { min: 1, max: 3 },
                    },
                },
                detectRetina: true,
            }}
        />
    )
}
