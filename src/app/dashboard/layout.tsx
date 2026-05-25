"use client";

import ModalProvider from "@/src/providers/modal.provider";

export default function DashboardLayout({children}:{children:React.ReactNode}) {
  return (
    <ModalProvider>
      <div>{children}</div>
    </ModalProvider>
  );
}
