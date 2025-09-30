import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// 1. Mejoramos el componente para usar un Portal de React
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  // 2. Ref para enfocar el modal al abrirlo (mejora de accesibilidad)
  const modalRef = useRef<HTMLDivElement>(null);

  // Efecto para bloquear el scroll del body y evitar "layout shift"
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      // 3. Compensamos el ancho del scrollbar para que la página no "salte"
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    // Función de limpieza
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  // Efecto para cerrar con la tecla "Escape"
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Enfocamos el modal para que los eventos de teclado sean capturados
      // y para que los lectores de pantalla sepan dónde está el usuario.
      modalRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Usamos createPortal para renderizar el modal fuera del DOM actual
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      // 4. Atributos de accesibilidad para el contenedor
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title" // Asocia el dialog con su título
    >
      {/* Overlay */}
      <div
        role="presentation"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        // Opcional pero recomendado: previene que el overlay robe el foco del modal al hacer clic
        onMouseDown={e => e.preventDefault()}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        tabIndex={-1} // Permite que el div reciba foco mediante programación
        className={`card relative w-full mx-4 ${sizeClasses[size]} max-h-[90vh] overflow-y-auto outline-none`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 id="modal-title" className="text-xl font-semibold text-slate-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        {/* 5. Limpieza de código redundante */}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body // El modal se renderizará al final del <body>
  );
};
