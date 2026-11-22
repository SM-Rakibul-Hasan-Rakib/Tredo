import Image from 'next/image'

/** Product photo (optimised by next/image) or a clean placeholder */
export function ProductImage({ src, alt, sizes, priority, className = '' }: { src?: string | null; alt: string; sizes: string; priority?: boolean; className?: string }) {
  if (!src)
    return (
      <div className={`flex h-full w-full items-center justify-center text-neutral-300 ${className}`}>
        <svg viewBox="0 0 64 40" className="w-1/2" fill="currentColor"><path d="M2 30c0-5 3-8 9-9l14-2c4-6 8-10 15-10 4 0 6 3 8 7 3 5 9 6 13 8v8H2z" /><rect x="2" y="31" width="62" height="5" rx="2" /></svg>
      </div>
    )
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />
}
