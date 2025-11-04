import { toast as sonnerToast } from "sonner";

/**
 * Utility functions per gestire le notifiche toast
 * Wrapper attorno a sonner per mantenere consistenza nell'app
 */

export const toast = {
  /**
   * Mostra un messaggio di successo
   */
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Mostra un messaggio di errore
   */
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Mostra un messaggio di warning
   */
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Mostra un messaggio informativo
   */
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      duration: 3000,
    });
  },

  /**
   * Mostra un toast di caricamento che può essere aggiornato
   */
  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, {
      description,
    });
  },

  /**
   * Mostra un toast con promise
   * Gestisce automaticamente stati loading/success/error
   */
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  /**
   * Chiude un toast specifico
   */
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },
};
