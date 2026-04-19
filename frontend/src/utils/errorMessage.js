function fromDetail(detail) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const loc = Array.isArray(item.loc) ? item.loc.join(".") : "";
          const msg = typeof item.msg === "string" ? item.msg : JSON.stringify(item);
          return loc ? `${loc}: ${msg}` : msg;
        }
        return String(item);
      })
      .join(" | ");
  }
  if (detail && typeof detail === "object") {
    try {
      return JSON.stringify(detail);
    } catch {
      return "Unexpected error response.";
    }
  }
  return "";
}

export default function getErrorMessage(error, fallback = "Something went wrong.") {
  const detail = fromDetail(error?.response?.data?.detail);
  if (detail) return detail;
  if (typeof error?.message === "string" && error.message.trim()) return error.message;
  return fallback;
}
