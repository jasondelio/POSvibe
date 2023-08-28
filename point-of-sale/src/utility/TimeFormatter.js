function TimeFormatter(timestamp) {
  const date = new Date(timestamp);
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
    hour12: false,
  };

  const formattedDate = date.toLocaleString("en-US", options);
  return formattedDate;
}

export { TimeFormatter};
