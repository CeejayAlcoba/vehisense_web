import { toast, ToastOptions } from "react-toastify";

export function notifyUnregisteredOverdue(isCritical: boolean) {
  const baseOptions: ToastOptions<unknown> = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme: "colored",
    closeButton: false,
  };

  const content = isCritical ? (
    <div>
      <strong>🚨 Critical Alert</strong>
      <div>Unregistered vehicle has exceeded the allowed time.</div>
    </div>
  ) : (
    <div>
      <strong>⚠️ Overdue Warning</strong>
      <div>Unregistered vehicle has not exited within the expected time.</div>
    </div>
  );

  isCritical
    ? toast.error(content, baseOptions)
    : toast.warning(content, baseOptions);
}
