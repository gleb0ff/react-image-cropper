import { ISize } from './types'

const calculateProportionalCropSize = (
  canvas: { width: number; height: number },
  crop: { width: number; height: number },
): ISize => {
  const canvasAspectRatio = canvas.width / canvas.height
  const cropAspectRatio = crop.width / crop.height
  let proportionalCropWidth, proportionalCropHeight

  if (cropAspectRatio > canvasAspectRatio) {
    proportionalCropWidth = canvas.width
    proportionalCropHeight = canvas.width / cropAspectRatio
  } else {
    proportionalCropHeight = canvas.height
    proportionalCropWidth = canvas.height * cropAspectRatio
  }

  return { width: proportionalCropWidth, height: proportionalCropHeight }
}

const calculateProportionalImageSize = (crop: ISize, image: ISize): ISize => {
  const cropAspectRatio = crop.width / crop.height
  const imageAspectRatio = image.width / image.height
  let newWidth, newHeight
  if (cropAspectRatio >= imageAspectRatio) {
    newWidth = crop.width
    newHeight = crop.width / imageAspectRatio
  } else {
    newHeight = crop.height
    newWidth = crop.height * imageAspectRatio
  }

  return { width: Math.round(newWidth), height: Math.round(newHeight) }
}

const calculateOverlaySize = (canvas: ISize, crop: ISize) => {
  return {
    x: {
      height: (canvas.height - crop.height) / 2,
      width: canvas.width,
    },
    y: {
      width: (canvas.width - crop.width) / 2,
      height: canvas.height,
    },
  }
}
const calculateDestinationSize = (image: ISize, canvas: ISize, scale: number) => {
  const factor = scale / 100
  const dWidth = image.width * factor
  const dHeight = image.height * factor
  return {
    dWidth,
    dHeight,
    dX: (canvas.width - dWidth) / 2,
    dY: (canvas.height - dHeight) / 2,
  }
}

interface ICalculate {
  imageSize: ISize
  canvasSize: ISize
  cropParams: ISize
  scale: number
}
export const calculate = ({ imageSize, canvasSize, cropParams, scale }: ICalculate) => {
  const proportionalCrop = calculateProportionalCropSize(canvasSize, cropParams)
  const proportionalImageSize = calculateProportionalImageSize(proportionalCrop, imageSize)
  const overlay = calculateOverlaySize(canvasSize, proportionalCrop)
  const destinationSize = calculateDestinationSize(proportionalImageSize, canvasSize, scale)
  return {
    ...destinationSize,
    proportionalCrop,
    overlay,
  }
}
