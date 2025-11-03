'use client';

import React, { HTMLAttributes } from 'react';

export interface SourceMarkerProps extends HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  sourcePath: string;
  sourceLine?: number | string;
}

// Wrap any element and attach data-source-path/line for AllyFix scanner pickup.
// Example:
//   <SourceMarker as="img" sourcePath="src/components/Hero.tsx" sourceLine={42} alt="..." />
//   <SourceMarker as="div" sourcePath="pages/index.tsx" sourceLine={120}>Hello</SourceMarker>
export function SourceMarker({ as = 'div', sourcePath, sourceLine, children, ...rest }: SourceMarkerProps) {
  const Tag: any = as;
  const line = sourceLine != null ? String(sourceLine) : undefined;
  return (
    <Tag data-source-path={sourcePath} data-source-line={line} {...rest}>
      {children}
    </Tag>
  );
}


