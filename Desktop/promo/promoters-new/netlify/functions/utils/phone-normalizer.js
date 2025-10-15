// Phone Number Normalization Utility
// Ensures consistent phone format across all functions

/**
 * Normalize phone number to E.164 format (+1XXXXXXXXXX)
 * @param {string} phone - Raw phone input from user
 * @returns {string} Normalized phone in +1XXXXXXXXXX format
 * @throws {Error} If phone number is invalid
 */
function normalizePhone(phone) {
  if (!phone) {
    throw new Error('Phone number is required');
  }
  
  // Remove all non-digit characters (spaces, dashes, parentheses, etc.)
  let cleaned = phone.toString().replace(/\D/g, '');
  
  console.log(`[Phone Normalize] Input: "${phone}" | Digits only: "${cleaned}"`);
  
  // Remove leading 1 if present (US country code)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    cleaned = cleaned.substring(1);
    console.log(`[Phone Normalize] Removed leading 1: "${cleaned}"`);
  }
  
  // Must be exactly 10 digits for US numbers
  if (cleaned.length !== 10) {
    throw new Error(
      `Invalid phone number. Got ${cleaned.length} digits, need 10. ` +
      `Please enter a valid US phone number (e.g., 9085551234).`
    );
  }
  
  // Return with +1 prefix for Twilio/E.164 compatibility
  const normalized = `+1${cleaned}`;
  console.log(`[Phone Normalize] Final: "${normalized}"`);
  
  return normalized;
}

/**
 * Format phone for display (optional)
 * @param {string} phone - Phone number
 * @returns {string} Formatted as (XXX) XXX-XXXX
 */
function formatPhoneDisplay(phone) {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const digits = cleaned.substring(1);
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  
  return phone;
}

module.exports = {
  normalizePhone,
  formatPhoneDisplay
};
