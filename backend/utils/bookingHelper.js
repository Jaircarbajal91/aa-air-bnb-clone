/**
 * Helper functions for booking conflict detection and date generation
 */

/**
 * Parses a date string as a local date (YYYY-MM-DD format)
 * @param {string|Date} dateValue - Date string or Date object
 * @returns {Date} - Date object set to midnight local time
 */
function parseLocalDate(dateValue) {
  if (dateValue instanceof Date) {
    const date = new Date(dateValue);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  
  const dateStr = dateValue.toString();
  
  // If it's in YYYY-MM-DD format, parse as local date
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  // If it includes time, parse and reset to midnight
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Checks if two date ranges overlap
 * @param {Date|string} start1 - Start date of first range
 * @param {Date|string} end1 - End date of first range
 * @param {Date|string} start2 - Start date of second range
 * @param {Date|string} end2 - End date of second range
 * @returns {boolean} - True if ranges overlap
 */
function datesOverlap(start1, end1, start2, end2) {
  const s1 = parseLocalDate(start1).getTime();
  const e1 = parseLocalDate(end1).getTime();
  const s2 = parseLocalDate(start2).getTime();
  const e2 = parseLocalDate(end2).getTime();

  // Check for overlap: ranges overlap if one starts before the other ends
  return (s1 <= e2 && s2 <= e1);
}

/**
 * Checks if a booking conflicts with existing bookings
 * @param {Array} existingBookings - Array of existing bookings with startDate and endDate
 * @param {string|Date} newStartDate - Start date of new booking
 * @param {string|Date} newEndDate - End date of new booking
 * @returns {boolean} - True if there's a conflict
 */
function hasBookingConflict(existingBookings, newStartDate, newEndDate) {
  if (!existingBookings || existingBookings.length === 0) {
    return false;
  }

  const newStart = parseLocalDate(newStartDate).getTime();
  const newEnd = parseLocalDate(newEndDate).getTime();

  for (const booking of existingBookings) {
    const existingStart = parseLocalDate(booking.startDate).getTime();
    const existingEnd = parseLocalDate(booking.endDate).getTime();

    // Check for any overlap
    if (datesOverlap(newStartDate, newEndDate, booking.startDate, booking.endDate)) {
      return true;
    }
  }

  return false;
}

/**
 * Generates a random date between minDate and maxDate
 * @param {Date} minDate - Minimum date
 * @param {Date} maxDate - Maximum date
 * @returns {Date} - Random date between min and max
 */
function randomDate(minDate, maxDate) {
  const minTime = minDate.getTime();
  const maxTime = maxDate.getTime();
  const randomTime = Math.random() * (maxTime - minTime) + minTime;
  return new Date(randomTime);
}

/**
 * Formats a date as YYYY-MM-DD string
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adds days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} - New date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

module.exports = {
  parseLocalDate,
  datesOverlap,
  hasBookingConflict,
  randomDate,
  formatDate,
  addDays
};

