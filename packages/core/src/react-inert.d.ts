/* eslint-disable @typescript-eslint/no-unused-vars */
import "react";

declare module "react" {
  interface HTMLAttributes<T> {
    /**
     * Global `inert` attribute support for browsers that implement it.
     * Accepts boolean or string forms used by React (e.g., "", "true").
     */
    inert?: boolean | "" | "true";
  }
}
