/**
 * Posture Scoring Algorithm
 * Migrated from assets/js/app.js
 */

/**
 * Clamp value between min and max
 */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * Calculate posture score based on sensor data
 * @param {number} backDist - Back distance in cm
 * @param {number} neckDist - Neck distance in cm
 * @param {number} fsrVal - FSR value (0-4095)
 * @returns {Object} Scores object with back, neck, pressure, and total scores
 */
export const calculatePostureScore = (backDist, neckDist, fsrVal) => {
  let scores = { back: 0, neck: 0, pressure: 0, total: 0 };

  // Validate input
  const backValid = backDist > 0 && backDist !== -1 && isFinite(backDist);
  const neckValid = neckDist > 0 && neckDist !== -1 && isFinite(neckDist);
  const fsrValid = fsrVal > 0 && isFinite(fsrVal);

  // Calculate back score (ideal range: 20-35 cm based on actual data)
  if (backValid) {
    if (backDist >= 20 && backDist <= 35) {
      scores.back = 100; // Ideal range
    } else if (backDist >= 15 && backDist < 20) {
      scores.back = 80 + ((backDist - 15) / 5) * 20; // Transition
    } else if (backDist > 35 && backDist <= 50) {
      scores.back = Math.max(0, 100 - ((backDist - 35) * 5)); // Too far
    } else if (backDist < 15 && backDist >= 10) {
      scores.back = 60 + ((backDist - 10) / 5) * 20; // Approaching ideal
    } else if (backDist > 0 && backDist < 10) {
      scores.back = Math.max(0, (backDist / 10) * 60); // Too close
    } else if (backDist > 50 && backDist <= 100) {
      scores.back = Math.max(0, 25 - ((backDist - 50) * 0.5)); // Very far
    }
  }

  // Calculate neck score (ideal range: 25-35 cm based on actual data)
  if (neckValid) {
    if (neckDist >= 25 && neckDist <= 35) {
      scores.neck = 100; // Ideal range
    } else if (neckDist >= 20 && neckDist < 25) {
      scores.neck = 70 + ((neckDist - 20) / 5) * 30; // Transition
    } else if (neckDist > 35 && neckDist <= 50) {
      scores.neck = Math.max(0, 100 - ((neckDist - 35) * 3)); // Too far
    } else if (neckDist < 20 && neckDist >= 15) {
      scores.neck = 50 + ((neckDist - 15) / 5) * 20; // Approaching ideal
    } else if (neckDist > 0 && neckDist < 15) {
      scores.neck = Math.max(0, (neckDist / 15) * 50); // Too close
    } else if (neckDist > 50 && neckDist <= 100) {
      scores.neck = Math.max(0, 25 - ((neckDist - 50) * 0.5)); // Very far
    }
  }

  // Calculate pressure score (ideal range: 200-800)
  // If FSR is 0, give score based on consistency of ultrasonic data
  if (fsrValid) {
    if (fsrVal >= 200 && fsrVal <= 800) {
      scores.pressure = 100;
    } else if (fsrVal < 200) {
      scores.pressure = Math.max(0, (fsrVal / 200) * 100);
    } else {
      scores.pressure = Math.max(0, 100 - ((fsrVal - 800) / 10));
    }
  } else if (backValid && neckValid) {
    // Fallback: If FSR is 0 but there's consistent ultrasonic data, give minimal score
    scores.pressure = 30; // Minimal score to show system is active
  }

  // Calculate total score
  // If FSR is not valid, change weight: back 40%, neck 60%
  if (backValid || neckValid || fsrValid) {
    if (fsrValid) {
      scores.total = Math.round((scores.back * 0.35) + (scores.neck * 0.40) + (scores.pressure * 0.25));
    } else {
      // If FSR is not available, only use back and neck
      scores.total = Math.round((scores.back * 0.40) + (scores.neck * 0.60));
    }
  }

  return scores;
};

/**
 * Calculate balance percentages for UI display
 * @param {number} fsrPct - FSR percentage (0-100)
 * @param {number} backDist - Back distance in cm
 * @param {number} neckDist - Neck distance in cm
 * @returns {Object} Balance object with fsrBalance and neckBackBalance
 */
export const calculateBalance = (fsrPct, backDist, neckDist) => {
  let fsrBalance = Math.min(100, Math.max(0, fsrPct));

  // If FSR is 0, but there's ultrasonic data, give minimal indicator
  if (fsrBalance === 0 && backDist > 0 && neckDist > 0) {
    fsrBalance = 5; // Minimal indicator that system is active
  }

  // Calculate neck-back balance (shows posture alignment)
  let neckBackBalance = 0;
  if (
    backDist !== null &&
    neckDist !== null &&
    backDist > 0 &&
    neckDist > 0 &&
    backDist !== -1 &&
    neckDist !== -1 &&
    isFinite(backDist) &&
    isFinite(neckDist)
  ) {
    // Ideal ranges: Back 20-35cm, Neck 25-35cm

    let backScore = 0;
    if (backDist >= 20 && backDist <= 35) {
      backScore = 100; // Ideal range
    } else if (backDist >= 15 && backDist < 20) {
      backScore = 80 + ((backDist - 15) / 5) * 20; // Transition to ideal
    } else if (backDist > 35 && backDist <= 50) {
      backScore = Math.max(0, 100 - ((backDist - 35) * 5)); // Too far
    } else if (backDist < 15 && backDist >= 10) {
      backScore = 60 + ((backDist - 10) / 5) * 20; // Approaching ideal
    } else if (backDist > 0 && backDist < 10) {
      backScore = Math.max(0, (backDist / 10) * 60); // Too close
    }

    let neckScore = 0;
    if (neckDist >= 25 && neckDist <= 35) {
      neckScore = 100; // Ideal range
    } else if (neckDist >= 20 && neckDist < 25) {
      neckScore = 70 + ((neckDist - 20) / 5) * 30; // Transition to ideal
    } else if (neckDist > 35 && neckDist <= 50) {
      neckScore = Math.max(0, 100 - ((neckDist - 35) * 3)); // Too far
    } else if (neckDist < 20 && neckDist >= 15) {
      neckScore = 50 + ((neckDist - 15) / 5) * 20; // Approaching ideal
    } else if (neckDist > 0 && neckDist < 15) {
      neckScore = Math.max(0, (neckDist / 15) * 50); // Too close
    }

    // Calculate relative balance: how well neck and back match
    // If difference is small (similar), posture is more balanced
    const diff = Math.abs(neckDist - backDist);
    let balanceBonus = 0;
    if (diff <= 5) {
      balanceBonus = 20; // Very balanced (difference < 5cm)
    } else if (diff <= 10) {
      balanceBonus = 10; // Fairly balanced (difference 5-10cm)
    } else if (diff <= 15) {
      balanceBonus = 5; // Moderate (difference 10-15cm)
    }

    // Average score with balance bonus
    neckBackBalance = Math.round((backScore + neckScore) / 2 + balanceBonus);
    neckBackBalance = Math.min(100, Math.max(0, neckBackBalance));
  }

  return {
    fsrBalance,
    neckBackBalance,
  };
};

/**
 * Generate synthetic matrix from FSR for heatmap visualization
 * @param {number} pct - FSR percentage (0-100)
 * @param {number} rows - Number of rows (default: 8)
 * @param {number} cols - Number of columns (default: 8)
 * @param {number} backDist - Back distance in cm (optional)
 * @param {number} neckDist - Neck distance in cm (optional)
 * @returns {Array<Array<number>>} 2D matrix for heatmap
 */
export const synthMatrixFromFSR = (pct, rows = 8, cols = 8, backDist = null, neckDist = null) => {
  let base = clamp(pct / 100, 0, 1);

  // Fallback: If FSR is 0 but there's ultrasonic data, create minimal visualization
  if (base === 0 && backDist !== null && neckDist !== null && backDist > 0 && neckDist > 0 && backDist !== -1 && neckDist !== -1) {
    // Use normalized average of back and neck as base
    // Normalization: back (20-35cm ideal) and neck (25-35cm ideal)
    const backNorm = clamp((backDist - 15) / 20, 0, 1); // 15-35cm -> 0-1
    const neckNorm = clamp((neckDist - 20) / 15, 0, 1); // 20-35cm -> 0-1
    base = (backNorm + neckNorm) / 2 * 0.3; // Max 30% for visual indicator
  }

  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const maxd = Math.hypot(cx, cy) || 1;
  const out = [];

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const d = Math.hypot(c - cx, r - cy) / maxd;
      // Create radial pattern from center with falloff
      const v = clamp((base * (1 - d * 0.6)) * 100, 0, 100);
      row.push(Math.round(v));
    }
    out.push(row);
  }

  return out;
};

/**
 * Get posture label based on total score
 * @param {number} totalScore - Total posture score (0-100)
 * @returns {string} Label for posture status
 */
export const getPostureLabel = (totalScore) => {
  if (totalScore >= 80) return 'Baik';
  if (totalScore >= 60) return 'Perlu Koreksi';
  if (totalScore > 0) return 'Buruk';
  return 'Menunggu Data';
};

export default {
  calculatePostureScore,
  calculateBalance,
  synthMatrixFromFSR,
  getPostureLabel,
};

