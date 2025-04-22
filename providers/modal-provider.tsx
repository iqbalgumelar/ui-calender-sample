"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from 'uuid';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";

interface ModalContextType {
  showModal: (config: {
    title: ReactNode;
    body: ReactNode;
    footer?: ReactNode;
    modalClassName?: string;
    getter?: () => Promise<any>;
  }) => void;
  onClose: () => void;
  data: any | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<
    { id: string; title?: ReactNode; body?: ReactNode; footer?: ReactNode; modalClassName?: string }[]
  >([]);

  const showModal = ({
    title,
    body,
    footer,
    modalClassName,
  }: {
    title: ReactNode;
    body: ReactNode;
    footer?: ReactNode;
    modalClassName?: string;
  }) => {
    const newModal = {
      id: uuidv4(), // Unique ID for each modal
      title,
      body,
      footer,
      modalClassName,
    };

    setModals((prev) => [...prev, newModal]); // Stack modals instead of replacing
  };

  const closeModal = (id: string) => {
    setModals((prev) => prev.filter((modal) => modal.id !== id));
  };

  return (
    <ModalContext.Provider value={{ showModal, onClose: () => closeModal(modals[modals.length - 1]?.id || ""), data: null }}>
      {children}
      {modals.map((modal) => (
        <Modal
          key={modal.id}
          isOpen={true}
          onOpenChange={() => closeModal(modal.id)}
          backdrop="blur"
          classNames={{
            backdrop: "max-h-screen overflow-hidden",
            wrapper: "max-h-screen overflow-hidden",
          }}
        >
          <ModalContent className={modal.modalClassName || ""}>
            {modal.title && <ModalHeader>{modal.title}</ModalHeader>}
            {modal.body && <ModalBody>{modal.body}</ModalBody>}
            {modal.footer && <ModalFooter>{modal.footer}</ModalFooter>}
          </ModalContent>
        </Modal>
      ))}
    </ModalContext.Provider>
  );
};


// Hook to use modal context
export const useModalContext = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return context;
};
