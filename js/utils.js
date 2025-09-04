const fetchData = async () => {
    const response = await fetch('data.json');

    if (response.ok) {
        try {
            return await response.json();
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    } else {
        console.error('Error fetching data from server!', response.status);
    }
}

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

const transformPercentageToImageHeight = (percentage) => {
  const BLOOD_BAG_FILLER_IMAGE_LIMITS = {
    top: 88,
    bottom: 24
  };

  let sanitizedPercentage = parseFloat(percentage || 0);
  if (percentage < 0) {
    sanitizedPercentage = 0;
  } else if (percentage > 100) {
    sanitizedPercentage = 100;
  }

  const translatedPercentage = (BLOOD_BAG_FILLER_IMAGE_LIMITS.top - BLOOD_BAG_FILLER_IMAGE_LIMITS.bottom) * sanitizedPercentage / 100;
  return translatedPercentage + BLOOD_BAG_FILLER_IMAGE_LIMITS.bottom;
}

export {
  fetchData,
  humanReadableDate,
  transformPercentageToImageHeight
};
