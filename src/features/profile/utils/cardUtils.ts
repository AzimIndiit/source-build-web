// Card type patterns for detection
const cardPatterns = {
  visa: /^4/,
  mastercard: /^(5[1-5]|2[2-7])/,
  amex: /^3[47]/,
  discover: /^(6011|65|64[4-9])/,
  diners: /^(36|38|30[0-5])/,
  jcb: /^35/,
  unionpay: /^62/,
  rupay: /^(60|65|81|82|508)/,
  maestro: /^(5018|5020|5038|6304|6759|676[1-3])/,
};

// Card formatting patterns
const cardFormats: Record<string, { blocks: number[]; delimiter: string }> = {
  amex: { blocks: [4, 6, 5], delimiter: ' ' },
  diners: { blocks: [4, 6, 4], delimiter: ' ' },
  default: { blocks: [4, 4, 4, 4], delimiter: ' ' },
};

// Card length validation
const cardLengths: Record<string, number[]> = {
  visa: [13, 16, 19],
  mastercard: [16],
  amex: [15],
  discover: [16, 19],
  diners: [14, 16, 19],
  jcb: [16, 17, 18, 19],
  unionpay: [16, 17, 18, 19],
  rupay: [16],
  maestro: [12, 13, 14, 15, 16, 17, 18, 19],
};

/**
 * Detect card type from card number
 */
export const detectCardType = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\s/g, '');

  for (const [type, pattern] of Object.entries(cardPatterns)) {
    if (pattern.test(cleanNumber)) {
      return type;
    }
  }

  return 'unknown';
};

/**
 * Format card number with appropriate spacing
 */
export const formatCardNumber = (value: string, cardType?: string): string => {
  const cleanValue = value.replace(/\s/g, '');
  const type = cardType || detectCardType(cleanValue);
  const format = cardFormats[type] || cardFormats.default;

  const parts: string[] = [];
  let offset = 0;

  format.blocks.forEach((length) => {
    if (offset < cleanValue.length) {
      parts.push(cleanValue.slice(offset, offset + length));
      offset += length;
    }
  });

  return parts.join(format.delimiter);
};

/**
 * Validate card number using Luhn algorithm
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\D/g, '');

  // Special case for Stripe test cards
  const stripeTestCards = [
    '4242424242424242', // Visa test card
    '4000056655665556', // Visa (debit) test card
    '5555555555554444', // Mastercard test card
    '2223003122003222', // Mastercard (2-series) test card
    '5200828282828210', // Mastercard (debit) test card
    '5105105105105100', // Mastercard (prepaid) test card
    '378282246310005', // American Express test card
    '371449635398431', // American Express test card
    '6011111111111117', // Discover test card
    '6011000990139424', // Discover test card
    '3056930009020004', // Diners Club test card
    '36227206271667', // Diners Club (14 digit) test card
    '3566002020360505', // JCB test card
    '6200000000000005', // UnionPay test card
  ];

  // Allow Stripe test cards
  if (stripeTestCards.includes(cleanNumber)) {
    return true;
  }

  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validate card number length based on card type
 */
export const validateCardLength = (cardNumber: string, cardType: string): boolean => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  const validLengths = cardLengths[cardType];

  if (!validLengths) {
    return cleanNumber.length >= 13 && cleanNumber.length <= 19;
  }

  return validLengths.includes(cleanNumber.length);
};

/**
 * Format expiry date input (MM/YY)
 */
export const formatExpiryDate = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');

  if (cleanValue.length >= 2) {
    const month = cleanValue.slice(0, 2);
    const year = cleanValue.slice(2, 4);
    return year ? `${month}/${year}` : month;
  }

  return cleanValue;
};

/**
 * Validate expiry date
 */
export const validateExpiryDate = (month: number, year: number): boolean => {
  // Check valid month range first
  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Convert 2-digit year to 4-digit
  const fullYear = year < 100 ? 2000 + year : year;

  // Check if card is expired (comparing at the end of the expiry month)
  // Cards expire at the end of the month shown
  if (fullYear < currentYear) {
    return false;
  }

  if (fullYear === currentYear && month < currentMonth) {
    return false;
  }

  // Check if expiry date is too far in the future (more than 20 years)
  if (fullYear > currentYear + 20) {
    return false;
  }

  return true;
};

/**
 * Mask card number for display
 */
export const maskCardNumber = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  const lastFour = cleanNumber.slice(-4);
  const maskedPortion = '*'.repeat(Math.max(0, cleanNumber.length - 4));
  return formatCardNumber(maskedPortion + lastFour);
};

/**
 * Get card type display name
 */
export const getCardTypeName = (cardType: string): string => {
  const names: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unionpay: 'UnionPay',
    rupay: 'RuPay',
    maestro: 'Maestro',
    unknown: 'Card',
  };

  return names[cardType] || 'Card';
};
