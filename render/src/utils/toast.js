import toast from "react-hot-toast";

// Global function to trigger different types of toast messages
const showToast = (message, type = "success", duration = 3000) => {
  // Available types: success, error, info, loading, etc.
  switch (type) {
    case "success":
      toast.success(message, { duration });
      break;
    case "error":
      toast.error(message, { duration });
      break;
    case "info":
      toast(message, { duration });
      break;
    case "loading":
      toast.loading(message, { duration });
      break;
    default:
      toast(message, { duration });
      break;
  }
};

// A utility function to trigger toast from anywhere in the app
export const triggerToast = (message, type = "success", duration = 3000) => {
  showToast(message, type, duration);
};
