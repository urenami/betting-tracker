// American → Decimal
export const americanToDecimal = (odds) => {
  if (odds > 0) return odds / 100 + 1;
  if (odds < 0) return 100 / Math.abs(odds) + 1;
  return null;
};

// Decimal → American
export const decimalToAmerican = (d) =>
  d >= 2 ? Math.round((d - 1) * 100) : -Math.round(100 / (d - 1));

// Normalize any format → unified odds/probability
export const normalizeOdds = (price) => {
  if (price == null) return null;
  if (Math.abs(price) < 10) {
    const dec = price;
    const am =
      dec >= 2 ? Math.round((dec - 1) * 100) : -Math.round(100 / (dec - 1));
    const prob = (1 / dec) * 100;
    return { am, prob };
  } else {
    const am = Math.round(price);
    const prob =
      am > 0
        ? (100 / (am + 100)) * 100
        : (Math.abs(am) / (Math.abs(am) + 100)) * 100;
    return { am, prob };
  }
};
