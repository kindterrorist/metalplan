import { useState, useCallback } from "react";
import { ToastMessage } from "../../components/UI";

export interface UIState {
  toasts: ToastMessage[];
  confirmState: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "primary";
  };
  isAthleteModalOpen: boolean;
  isExportModalOpen: boolean;
  isMeasurementModalOpen: boolean;
  viewingPhoto: string | null;
  selectedAthleteId: string | null;
  editingAthleteId: string | null;
  chartMetric: string;
  searchTerm: string;
  apiKey: string;
}

export interface UIActions {
  addToast: (
    title: string,
    message?: string,
    type?: "success" | "error" | "info"
  ) => void;
  removeToast: (id: string) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    variant?: "danger" | "primary"
  ) => void;
  hideConfirm: () => void;
  setIsAthleteModalOpen: (open: boolean) => void;
  setIsExportModalOpen: (open: boolean) => void;
  setIsMeasurementModalOpen: (open: boolean) => void;
  setViewingPhoto: (photo: string | null) => void;
  setSelectedAthleteId: (id: string | null) => void;
  setEditingAthleteId: (id: string | null) => void;
  setChartMetric: (metric: string) => void;
  setSearchTerm: (term: string) => void;
  setApiKey: (key: string) => void;
}

export const useUIState = (): [UIState, UIActions] => {
  const [uiState, setUIState] = useState<UIState>({
    toasts: [],
    confirmState: {
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
      variant: "danger",
    },
    isAthleteModalOpen: false,
    isExportModalOpen: false,
    isMeasurementModalOpen: false,
    viewingPhoto: null,
    selectedAthleteId: null,
    editingAthleteId: null,
    chartMetric: "weight",
    searchTerm: "",
    apiKey: localStorage.getItem("gemini_api_key") || "",
  });

  const addToast = useCallback(
    (
      title: string,
      message?: string,
      type: "success" | "error" | "info" = "success"
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      setUIState((prev) => ({
        ...prev,
        toasts: [...prev.toasts, { id, title, message: message || "", type }],
      }));
      // Auto remove toast after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setUIState((prev) => ({
      ...prev,
      toasts: prev.toasts.filter((t) => t.id !== id),
    }));
  }, []);

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      variant: "danger" | "primary" = "danger"
    ) => {
      setUIState((prev) => ({
        ...prev,
        confirmState: {
          isOpen: true,
          title,
          message,
          onConfirm: () => {
            onConfirm();
            hideConfirm();
          },
          variant,
        },
      }));
    },
    []
  );

  const hideConfirm = useCallback(() => {
    setUIState((prev) => ({
      ...prev,
      confirmState: { ...prev.confirmState, isOpen: false },
    }));
  }, []);

  const setIsAthleteModalOpen = useCallback((open: boolean) => {
    setUIState((prev) => ({
      ...prev,
      isAthleteModalOpen: open,
      editingAthleteId: open ? prev.editingAthleteId : null,
    }));
  }, []);

  const setIsExportModalOpen = useCallback((open: boolean) => {
    setUIState((prev) => ({
      ...prev,
      isExportModalOpen: open,
    }));
  }, []);

  const setIsMeasurementModalOpen = useCallback((open: boolean) => {
    setUIState((prev) => ({
      ...prev,
      isMeasurementModalOpen: open,
    }));
  }, []);

  const setViewingPhoto = useCallback((photo: string | null) => {
    setUIState((prev) => ({
      ...prev,
      viewingPhoto: photo,
    }));
  }, []);

  const setSelectedAthleteId = useCallback((id: string | null) => {
    setUIState((prev) => ({
      ...prev,
      selectedAthleteId: id,
      editingAthleteId:
        id === prev.editingAthleteId ? null : prev.editingAthleteId,
    }));
  }, []);

  const setEditingAthleteId = useCallback((id: string | null) => {
    setUIState((prev) => ({
      ...prev,
      editingAthleteId: id,
    }));
  }, []);

  const setChartMetric = useCallback((metric: string) => {
    setUIState((prev) => ({
      ...prev,
      chartMetric: metric,
    }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setUIState((prev) => ({
      ...prev,
      searchTerm: term,
    }));
  }, []);

  const setApiKey = useCallback((key: string) => {
    setUIState((prev) => ({
      ...prev,
      apiKey: key,
    }));
    localStorage.setItem("gemini_api_key", key);
  }, []);

  const actions: UIActions = {
    addToast,
    removeToast,
    showConfirm,
    hideConfirm,
    setIsAthleteModalOpen,
    setIsExportModalOpen,
    setIsMeasurementModalOpen,
    setViewingPhoto,
    setSelectedAthleteId,
    setEditingAthleteId,
    setChartMetric,
    setSearchTerm,
    setApiKey,
  };

  return [uiState, actions];
};
