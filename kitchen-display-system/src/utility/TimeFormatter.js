function TimeFormatter(timestamp, timeZone) {
  const dateObj = new Date(timestamp);

  const timeOptions = { timeZone: timeZone, hour12: false };
  const convertedTime = dateObj.toLocaleTimeString("en-US", timeOptions);

  const hoursAndMinutes = convertedTime.slice(0, 5);

  return hoursAndMinutes
}

export { TimeFormatter };
