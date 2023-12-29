import { useCallback, useEffect, useState } from 'react'

import { calculate } from './utils'
import { ICoords, ICropperImageParams, IReturnCropped, ISize, IUseCropImage } from './types'

/**
 * @description useCropImage hook
 * @param scale {number} - The scale of the image. Must start from 100
 * @param imageSrc {string} - The source image URL.
 * @param cropWidth {number} - The width of the crop area.
 * @param cropHeight {number} - The height of the crop area.
 * @param cropType {'image/png' | 'image/jpeg' | 'image/webp' | 'image/bmp' | 'image/gif'} - The MIME type of the output image. default 'image/jpeg'
 * @param cropQuality {number} - The quality of the image, on a scale from 0 to 1. default 1
 * @param cropFileName {string} - The fileName of the image. default 'image.jpg'
 * @param cropImageBackground {string} - The background of the transparent images like png. default 'white'
 * @return cropImage {()=>Promise<IReturnCropped>} - function that returns objectURL or File or Blob.
 * @return isLoading {boolean} - Image loading state.
 * @return cropFunctionalProps {obj} - functional props, pass them into CropCanvas {...cropFunctionalProps}.
 */

export function useCropImage({
  scale,
  cropWidth,
  cropHeight,
  cropType = 'image/jpeg',
  cropQuality = 1,
  imageSrc,
  cropFileName = 'image.jpg',
  cropImageBackground='white'
}: ICropperImageParams): IUseCropImage {
  const [image, setImage] = useState<HTMLImageElement>()
  const [isLoading, setIsLoading] = useState(true)
  const cordsState = useState<ICoords>({ offset: { x: 0, y: 0 }, start: { x: 0, y: 0 } })
  const canvasSizeState = useState<ISize>()
  const [canvasSize] = canvasSizeState
  const [coords] = cordsState

  useEffect(() => {
    if (!imageSrc) return
    setIsLoading(true)
    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      setImage(img)
      setIsLoading(false)
    }
  }, [imageSrc])

  const cropImage = useCallback((): Promise<IReturnCropped> => {
    return new Promise((resolve, reject) => {
      if (!image || !canvasSize) {
        reject('no image, canvas ')
        return
      }
      const dpr = window.devicePixelRatio || 1
      const tmpCanvas = document.createElement('canvas')
      tmpCanvas.width = cropWidth
      tmpCanvas.height = cropHeight
      const tempCtx = tmpCanvas.getContext('2d')
      if (!tempCtx) {
        reject('something went wrong')
        return
      }
      tempCtx.fillStyle = cropImageBackground;
      tempCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);

      tempCtx.scale(dpr, dpr)
      const tmpCanvasSize = {
        width: tmpCanvas.width / dpr,
        height: tmpCanvas.height / dpr,
      }

      const { proportionalCrop } = calculate({
        imageSize: { width: image.width, height: image.height },
        canvasSize,
        cropParams: {
          width: cropWidth,
          height: cropHeight,
        },
        scale,
      })

      const { dX, dY, dWidth, dHeight } = calculate({
        imageSize: { width: image.width, height: image.height },
        canvasSize: tmpCanvasSize,
        cropParams: {
          width: cropWidth,
          height: cropHeight,
        },
        scale,
      })

      const cropRatioWidth = tmpCanvasSize.width / proportionalCrop.width
      const cropRatioHeight = tmpCanvasSize.height / proportionalCrop.height

      tempCtx.drawImage(
        image,
        dX + coords.offset.x * cropRatioWidth,
        dY + coords.offset.y * cropRatioHeight,
        dWidth,
        dHeight,
      )
      tmpCanvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], cropFileName, { type: 'image/jpeg' })
            const objectURL = URL.createObjectURL(blob)
            resolve({
              objectURL,
              file,
              blob,
            })
          }
        },
        cropType,
        cropQuality,
      )
    })
  }, [
    image,
    canvasSize,
    cropWidth,
    cropHeight,
    scale,
    coords.offset.x,
    coords.offset.y,
    cropType,
    cropQuality,
    cropFileName,
  ])

  return {
    cropImage,
    isLoading,
    cropFunctionalProps: {
      image,
      cordsState,
      canvasSizeState,
      scale,
      cropWidth,
      cropHeight,
    },
  }
}
