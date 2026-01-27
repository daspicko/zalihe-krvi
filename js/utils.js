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

/**
 * Sanitizes HTML to prevent XSS attacks
 * Escapes special characters that could be used for script injection
 */
const sanitizeHTML = (str) => {
  if (str === null || str === undefined) {
    return '';
  }
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/**
 * Validates that a string is safe to use as an HTML attribute value
 * Only allows alphanumeric characters, hyphens, and underscores
 */
const isValidAttributeValue = (str) => {
  return /^[a-zA-Z0-9_-]+$/.test(str);
}

export {
  fetchData,
  humanReadableDate,
  transformPercentageToImageHeight,
  sanitizeHTML,
  isValidAttributeValue
};
