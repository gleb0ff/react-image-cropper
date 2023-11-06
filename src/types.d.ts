import { Dispatch, SetStateAction } from 'react'

export interface ISize {
  width: number
  height: number
}
export interface ICoords {
  offset: { x: number; y: number }
  start: { x: number; y: number }
}

export interface ICropperImageParams {
  scale: number
  imageSrc: string
  cropWidth: number
  cropHeight: number
  cropType?: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/bmp' | 'image/gif'
  cropQuality?: number
  cropFileName?: string
}

export interface ICanvasParams {
  backgroundColor?: string
  overlayColor?: string
  className?: string
}

export interface IFunctionalProps {
  scale: number
  cordsState: [ICoords, Dispatch<SetStateAction<ICoords>>]
  canvasSizeState: [ISize | undefined, Dispatch<SetStateAction<ISize | undefined>>]
  image?: HTMLImageElement
  cropWidth: number
  cropHeight: number
}

export interface IUseCropImage {
  cropImage: () => Promise<IReturnCropped>
  isLoading: boolean
  cropFunctionalProps: IFunctionalProps
}

export interface IReturnCropped {
  objectURL: string
  file: File
  blob: Blob
}
