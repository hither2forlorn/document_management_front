import React from "react";
import { LoadingOverlay } from "@mantine/core";

export default function CustomLoadingOverlay({ children, isLoading }) {
  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay visible={isLoading} loaderProps={{ size: "sm", color: "blue", variant: "bars" }} />
      {children}
    </div>
  );
}