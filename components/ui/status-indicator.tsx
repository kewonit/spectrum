'use client';

import * as React from "react";

interface StatusIndicatorProps {
  status: boolean;
  children?: React.ReactNode;
}

export function StatusIndicator({ status, children }: StatusIndicatorProps) {
  return (
    <span className={status ? "text-green-600 font-medium" : "text-gray-500"}>
      {children || (status ? "Present" : "Absent")}
    </span>
  );
}
