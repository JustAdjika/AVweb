/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
declare module 'cleave.js/react';

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}
declare module "*.css";
declare module "*.scss";
declare module "*.sass";