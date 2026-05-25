"use client";

// React, Next.js
import { createContext, useContext, useEffect, useState } from "react";



interface ModalProviderProps {
  children: React.ReactNode;
}

export type ModalData = {
  userId?: string;
  email?: string;
  name?: string;
  // أي حقول بدك تعرضيها في المودال
};

type ModalContextType = {
  data: ModalData;
  isOpen: boolean;
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => void;
  setClose: () => void;
};

export const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: false,
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => {},
  setClose: () => {},
});

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ModalData>({});
  const [showingModal, setShowingModal] = useState<React.ReactNode>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

 const setOpen: ModalContextType["setOpen"] = (modal, fetchData) => {
  if (fetchData) {
    fetchData()
      .then((result) => {
        if (result) {
          setData((prev) => ({ ...prev, ...result }));
        }
      })
      .catch((err) => {
        console.error("Error in fetchData for modal:", err);
      });
  }

  setShowingModal(modal);
  setIsOpen(true);
};


  const setClose = () => {
    setIsOpen(false);
    setData({});
    setShowingModal(null);
  };

  if (!isMounted) return null;

  return (
    <ModalContext.Provider value={{ data, setOpen, setClose, isOpen }}>
      {children}
      {showingModal}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within the modal provider");
  }
  return context;
};

export default ModalProvider;


