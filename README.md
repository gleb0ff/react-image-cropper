## React canvas image cropper

The library provides the useCropImage hook and the CropCanvas component.  

### installation

npm i @gleb0ff/react-image-cropper  
yarn add @gleb0ff/react-image-cropper

![cover](/cover.png)

### usage example
```
import React, { FC, useCallback, useState } from 'react'
import { CropCanvas, useCropImage } from '@gleb0ff/react-image-cropper'
import { Spinner } from '../Spinner'
import styles from './CropperImage.module.scss'

export interface ICropperImageParams {
  scale: number
  imageSrc: string
  backgroundColor?: string
  overlayColor?: string
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

export const CropperImage: FC<ICropperImageParams & ICanvasParams> = (props) => {
  const { backgroundColor, overlayColor, className, ...cropperParams } = props

  const [croppedImage, setCroppedImage] = useState<string | undefined>()
  const { cropImage, isLoading, cropFunctionalProps } = useCropImage({ ...cropperParams })

  const onClick = useCallback(() => {
    cropImage().then((res) => {
      setCroppedImage(res.objectURL)
    })
  }, [cropImage])

  return (
    <div className={styles.container}>
      <button onClick={onClick}>CROP</button>
      {croppedImage && <img src={croppedImage} alt="croppedImage" />}
      <CropCanvas
        backgroundColor={backgroundColor}
        overlayColor={overlayColor}
        className={className}
        {...cropFunctionalProps}
      />
      {isLoading && <Spinner size={20} className={styles.spinner} />}
    </div>
  )
}
```
