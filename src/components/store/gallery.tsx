'use client'
import { useState } from 'react'
import { ProductImage } from './product-image'

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0)
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-soft">
        <ProductImage src={images[i]} alt={name} sizes="(max-width:768px) 100vw, 55vw" priority />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src, k) => (
            <button key={src} onClick={() => setI(k)} className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-soft ${k === i ? 'border-ink' : 'border-transparent'}`}>
              <ProductImage src={src} alt="" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
