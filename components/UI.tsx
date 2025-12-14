import React, { ReactNode, ButtonHTMLAttributes, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Skeleton Loader
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl", className)} {...props} />
);

// Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick, ...props }) => (
  <div
    onClick={onClick}
    className={cn(
      "bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden transition-all duration-300 animate-fade-in hover:shadow-md dark:shadow-none",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Button
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | (() => void) | (() => Promise<void>);
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isLoading?: boolean;
}

export const Button = ({ children, variant = 'primary', size = 'md', className, isLoading, disabled, ...props }: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none animate-bounce-small";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 dark:shadow-none dark:hover:bg-blue-500",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm dark:bg-dark-800 dark:text-gray-200 dark:border-dark-700 dark:hover:bg-dark-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/40",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-dark-700 dark:hover:text-gray-200",
  };

  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-5 text-sm",
    lg: "h-14 px-8 text-base",
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-11 w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:bg-white transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder:text-gray-500 dark:focus-visible:bg-dark-900",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// Label
export const Label = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <label className={cn("text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300 mb-2 block", className)}>
    {children}
  </label>
);

// Modal
export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children?: ReactNode }) => {
  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200" style={{ zIndex: 100 }}>
      <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-800 w-full sm:max-w-lg max-h-[90vh] sm:rounded-3xl rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 flex flex-col border border-gray-100 dark:border-dark-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-700">
          <h3 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar dark:text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

// Confirm Dialog
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmDialog = ({
  isOpen, title, message, onConfirm, onCancel,
  confirmText = "بله، انجام شود",
  cancelText = "انصراف",
  variant = 'danger'
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="space-y-6">
        <div className={`flex items-start gap-4 p-4 rounded-2xl border ${variant === 'danger' ? 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400' : 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-400'}`}>
          <div className={`p-2 rounded-xl shrink-0 ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">آیا مطمئن هستید؟</h4>
            <p className="text-sm opacity-90 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={variant} className="flex-1" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};


// Textarea
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:bg-white transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder:text-gray-500 dark:focus-visible:bg-dark-900 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

// Select
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-11 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:bg-white transition-all disabled:cursor-not-allowed disabled:opacity-50 pr-10 cursor-pointer dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:focus-visible:bg-dark-900",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

// Toast System
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

export const ToastContainer = ({ toasts, removeToast }: { toasts: ToastMessage[], removeToast: (id: string) => void }) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 z-[150] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border animate-slide-up duration-300 dark:bg-dark-800 dark:shadow-none",
            toast.type === 'success' && "bg-white border-emerald-100 text-emerald-900 shadow-emerald-100 dark:border-emerald-900/30 dark:text-emerald-400",
            toast.type === 'error' && "bg-white border-red-100 text-red-900 shadow-red-100 dark:border-red-900/30 dark:text-red-400",
            toast.type === 'info' && "bg-white border-blue-100 text-blue-900 shadow-blue-100 dark:border-blue-900/30 dark:text-blue-400"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl shrink-0",
            toast.type === 'success' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20",
            toast.type === 'error' && "bg-red-100 text-red-600 dark:bg-red-900/20",
            toast.type === 'info' && "bg-blue-100 text-blue-600 dark:bg-blue-900/20"
          )}>
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertTriangle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
          </div>
          <div className="flex-1 pt-0.5">
            <h4 className="font-bold text-sm">{toast.title}</h4>
            {toast.message && <p className="text-xs opacity-80 mt-1 leading-relaxed">{toast.message}</p>}
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};