import type { ReactNode } from "react";

export function Field({ children }: { children: ReactNode }) {
  return <div style={{ marginBottom: "1rem" }}>{children}</div>;
}
