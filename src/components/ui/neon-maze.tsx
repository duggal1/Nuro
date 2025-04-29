"use client"
import { useEffect, useRef } from "react"

const NeonMaze = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let time = 0
    let animationId: number
    let darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches

    const colorSets = {
      dark: ["hsl(220, 90%, 60%)", "hsl(270, 80%, 60%)", "hsl(330, 80%, 60%)"],
      light: ["hsl(200, 80%, 40%)", "hsl(250, 70%, 50%)", "hsl(300, 70%, 50%)"]
    }

    const updateMode = (e: MediaQueryListEvent) => {
      darkMode = e.matches
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", updateMode)

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawGrid()
    }

    const drawGrid = () => {
      const size = Math.min(canvas.width, canvas.height) / 15
      const cols = Math.ceil(canvas.width / size) * 2
      const rows = Math.ceil(canvas.height / (size * 0.5)) * 2
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const [c1, c2, c3] = darkMode ? colorSets.dark : colorSets.light

      for (let y = -rows; y < rows; y++) {
        for (let xIdx = -cols; xIdx < cols; xIdx++) {
          const px = centerX + ((xIdx - y) * size) / 2
          const py = centerY + ((xIdx + y) * size) / 4
          const dist = Math.sqrt(xIdx * xIdx + y * y)
          const maxDist = Math.sqrt(cols * cols + rows * rows)
          const intensity = 1 - dist / maxDist
          const wave = size * intensity * Math.abs(Math.sin(dist * 0.5 + time))

          ctx.beginPath()
          ctx.moveTo(px, py - wave)
          ctx.lineTo(px + size / 2, py - size / 2 - wave)
          ctx.lineTo(px + size, py - wave)
          ctx.lineTo(px + size, py)
          ctx.lineTo(px + size / 2, py + size / 2)
          ctx.lineTo(px, py)
          ctx.closePath()

          const grad = ctx.createLinearGradient(px, py - wave, px + size, py)
          grad.addColorStop(0, c1)
          grad.addColorStop(0.5, c2)
          grad.addColorStop(1, c3)

          ctx.fillStyle = grad
          ctx.fill()

          ctx.strokeStyle = darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"
          ctx.lineWidth = 1
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(px, py - wave)
          ctx.moveTo(px + size, py)
          ctx.lineTo(px + size, py - wave)
          ctx.moveTo(px + size / 2, py + size / 2)
          ctx.lineTo(px + size / 2, py - size / 2 - wave)
          ctx.strokeStyle = darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }
    }

    const animate = () => {
      ctx.fillStyle = darkMode ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drawGrid()
      time += 0.04
      animationId = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      mq.removeEventListener("change", updateMode)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <main className="w-full h-screen overflow-hidden bg-gray-900 dark:bg-gray-100">
      <canvas ref={canvasRef} className="block" />
    </main>
  )
}

export { NeonMaze }
