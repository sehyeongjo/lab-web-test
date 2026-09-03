"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  fallback: string;
  className: string;
};

export function FallbackImage({ src, alt, fallback, className }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={className}>
      <span className="image-fallback" aria-hidden="true">{fallback}</span>
      {src && !failed ? (
        // Sheet-managed image hosts are not known ahead of deployment.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} onError={() => setFailed(true)} />
      ) : null}
    </div>
  );
}
