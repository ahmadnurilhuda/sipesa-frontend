const timeZone = "Asia/Jakarta";

export function formatDateTime(value?: string | null) {
  if (!value) return "Belum tercatat";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone
  }).format(date)} WIB`;
}

export function formatApiMessageDates(message: string) {
  return message.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g, (value) => formatDateTime(value));
}
