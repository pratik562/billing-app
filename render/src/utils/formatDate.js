// src/utils/formatDate.js

export const formatDate = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp.seconds * 1000); // Firestore Timestamp
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  return date.toLocaleDateString("en-IN", options); // e.g., "20 Apr 2025"
};
