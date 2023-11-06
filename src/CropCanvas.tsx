import React, { forwardRef, useCallback, useEffect, useState } from 'react'

import { calculate } from './utils'
import { ICanvasParams, IFunctionalProps } from './types'

/**
 * @description CropCanvas component props
 * @param backgroundColor {string} - Canvas background color. default '#fff'
 * @param overlayColor {string} - Canvas overlay color. default 'rgba(0, 0, 0, 0.5)'
 * @param className {string} - Canvas external className.
 * @return ref {HTMLCanvasElement} - Canvas ref
 */
export const CropCanvas = forwardRef<HTMLCanvasElement, ICanvasParams & IFunctionalProps>(
  (
    {
      scale,
      image,
      cropWidth,
      cropHeight,
      cordsState,
      canvasSizeState,
      backgroundColor = '#000',
      overlayColor = 'rgba(0, 0, 0, 0.5)',
      className,
    },
    externalRef,
  ) => {
    const [coords, setCoors] = cordsState
    const [canvasSize, setCanvasSize] = canvasSizeState
    const [isMoving, setSetIsMoving] = useState(false)
    const [canvas, setCanvas] = useState<HTMLCanvasElement>()

    const canvasRef = useCallback(
      (node: HTMLCanvasElement) => {
        setCanvas(node)
        if (typeof externalRef === 'function') {
          externalRef(node)
        } else if (externalRef) {
          externalRef.current = node
        }
      },
      [externalRef],
    )

    const setCorrectOffset = (x?: number, y?: number) => {
      if (!image || !canvasSize) return

      const { dX, dY, overlay } = calculate({
        imageSize: { width: image.width, height: image.height },
        canvasSize,
        cropParams: {
          width: cropWidth,
          height: cropHeight,
        },
        scale,
      })
      const minX = Math.abs(dX - overlay.y.width)
      const maxX = dX - overlay.y.width
      const maxY = dY - overlay.x.height
      const minY = Math.abs(dY - overlay.x.height)
      setCoors((prev) => {
        const newX = x ? x - prev.start.x : prev.offset.x
        const newY = y ? y - prev.start.y : prev.offset.y
        return {
          ...prev,
          offset: {
            x: newX > minX ? minX : newX < maxX ? maxX : newX,
            y: newY > minY ? minY : newY < maxY ? maxY : newY,
          },
        }
      })
    }

    const onMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      setCoors((prev) => ({
        ...prev,
        start: { x: event.clientX - prev.offset.x, y: event.clientY - prev.offset.y },
      }))
      setSetIsMoving(true)
    }

    const onTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
      setCoors((prev) => ({
        ...prev,
        start: {
          x: event.touches[0].clientX - prev.offset.x,
          y: event.touches[0].clientY - prev.offset.y,
        },
      }))
      setSetIsMoving(true)
    }

    useEffect(() => {
      const touchHandler = (event: TouchEvent) => {
        event.preventDefault()
        setCorrectOffset(event.touches[0].clientX, event.touches[0].clientY)
      }
      const mouseHandler = (event: MouseEvent) => {
        event.preventDefault()
        setCorrectOffset(event.clientX, event.clientY)
      }
      const endOfMoveHandler = () => setSetIsMoving(false)

      const subscribe = () => {
        document.addEventListener('touchmove', touchHandler, { passive: false })
        document.addEventListener('mousemove', mouseHandler, { passive: false })
        document.addEventListener('mouseup', endOfMoveHandler)
        document.addEventListener('touchend', endOfMoveHandler)
        const style = document.createElement('style')
        style.id = 'global-cursor-style'
        style.innerHTML = '* { cursor: grabbing !important; }'
        document.head.appendChild(style)
      }

      const unSubscribe = () => {
        document.removeEventListener('touchmove', touchHandler)
        document.removeEventListener('mousemove', mouseHandler)
        document.removeEventListener('mouseup', endOfMoveHandler)
        document.removeEventListener('touchend', endOfMoveHandler)
        document.getElementById('global-cursor-style')?.remove()
      }
      if (isMoving) {
        subscribe()
      } else {
        unSubscribe()
      }
      return () => unSubscribe()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMoving])

    const drawImage = useCallback(
      (canvasSize?: { width: number; height: number }) => {
        const ctx = canvas?.getContext('2d')
        if (!image || !ctx || !canvasSize) return
        const { dX, dY, dWidth, dHeight, overlay, proportionalCrop } = calculate({
          imageSize: { width: image.width, height: image.height },
          canvasSize,
          cropParams: {
            width: cropWidth,
            height: cropHeight,
          },
          scale,
        })

        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
        ctx.drawImage(image, dX + coords.offset.x, dY + coords.offset.y, dWidth, dHeight)
        ctx.fillStyle = overlayColor

        ctx.fillRect(overlay.y.width, 0, proportionalCrop.width, overlay.x.height)
        ctx.fillRect(
          overlay.y.width,
          overlay.x.height + proportionalCrop.height,
          proportionalCrop.width,
          overlay.x.height,
        )

        ctx.fillRect(0, 0, overlay.y.width, overlay.y.height)
        ctx.fillRect(
          overlay.y.width + proportionalCrop.width,
          0,
          canvasSize.width,
          overlay.y.height,
        )
      },
      [canvas, image, cropWidth, cropHeight, scale, coords.offset.x, coords.offset.y, overlayColor],
    )

    const prepareCanvas = useCallback((canvas?: HTMLCanvasElement) => {
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      const canvasWidth = canvas.offsetWidth * dpr
      const canvasHeight = canvas.offsetHeight * dpr
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const ctx = canvas.getContext('2d')
      ctx?.scale(dpr, dpr)
      return {
        width: canvasWidth / dpr,
        height: canvasHeight / dpr,
      }
    }, [])

    const init = useCallback(() => {
      const canvasSize = prepareCanvas(canvas)
      drawImage(canvasSize)
      setCanvasSize(canvasSize)
      setCoors({ offset: { x: 0, y: 0 }, start: { x: 0, y: 0 } })
    }, [canvas, drawImage, prepareCanvas, setCanvasSize, setCoors])

    useEffect(() => {
      window.addEventListener('resize', init)
      return () => window.removeEventListener('resize', init)
    }, [init])

    useEffect(() => {
      drawImage(canvasSize)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coords.offset.x, coords.offset.y])

    useEffect(
      () => init(),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [canvas, image],
    )

    useEffect(() => {
      setCorrectOffset()
      drawImage(canvasSize)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scale])

    return (
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', cursor: 'grab', backgroundColor }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        className={className}
      />
    )
  },
)

CropCanvas.displayName = 'CropCanvas'
