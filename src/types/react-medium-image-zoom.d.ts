declare module 'react-medium-image-zoom' {
  import * as React from 'react';

  export interface ZoomProps {
    children?: React.ReactNode;
    overlayBgColorEnd?: string;
    duration?: number;
    zoomMargin?: number;
    scrollable?: boolean;
    onZoom?: () => void;
    onUnzoom?: () => void;
    className?: string;
  }

  const Zoom: React.ComponentType<ZoomProps>;
  export default Zoom;
}


