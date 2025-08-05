const humanReadableDate = (date) => {
  return new Date(date).toLocaleString('hr-HR', {
    timeZone: 'Europe/Zagreb',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export { 
  humanReadableDate
};
