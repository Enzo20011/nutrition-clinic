"use client";

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export default function ProgressBarProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ProgressBar
        height="2px"
        color="#1F4D3D"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
}
