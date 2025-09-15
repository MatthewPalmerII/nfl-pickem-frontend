/**
 * Calculate the current NFL week based on the date
 * NFL season typically starts in early September
 */
export const getCurrentNFLWeek = () => {
  const now = new Date();
  const currentYear = now.getFullYear();

  // NFL season typically starts in early September
  // For 2025, let's use September 4th as the start date (first Thursday)
  const seasonStart = new Date(currentYear, 8, 4); // September 4th

  // If we're before the season start, show week 1
  if (now < seasonStart) {
    return 1;
  }

  // Calculate weeks since season start
  const daysSinceStart = Math.floor(
    (now - seasonStart) / (1000 * 60 * 60 * 24)
  );
  const currentWeek = Math.min(
    Math.max(Math.floor(daysSinceStart / 7) + 1, 1),
    18
  );

  return currentWeek;
};

/**
 * Get the current season year
 */
export const getCurrentSeason = () => {
  return new Date().getFullYear();
};
