import { transactionsStore } from "../lib/in-memory-db";

/**
 * AI FINANCIAL ENGINE - Dynamic Scoring & Analysis
 */

export interface AIAnalysisContext {
  userId: string;
  transactions: any[];
}

export function detectTimePatterns(transactions: any[]) {
  let lateNightCount = 0;
  let weekendCount = 0;

  transactions.forEach((t) => {
    const date = new Date(t.createdAt);
    const hour = date.getHours();
    const day = date.getDay(); // 0 = Sun, 6 = Sat

    if (hour >= 22 || hour <= 4) lateNightCount++;
    if (day === 0 || day === 6) weekendCount++;
  });

  return { lateNightCount, weekendCount };
}

export function calculateSpendingFrequency(transactions: any[]) {
  if (transactions.length === 0) return 0;
  
  const sortedDates = transactions
    .map(t => new Date(t.createdAt).getTime())
    .sort((a, b) => a - b);
  
  if (sortedDates.length < 2) return 1;

  const daysDifference = (sortedDates[sortedDates.length - 1] - sortedDates[0]) / (1000 * 60 * 60 * 24);
  return daysDifference > 0 ? transactions.length / daysDifference : transactions.length;
}

export function detectImpulseBehavior(transactions: any[]) {
  const { lateNightCount } = detectTimePatterns(transactions);
  const frequency = calculateSpendingFrequency(transactions);
  
  const smallTransactions = transactions.filter(t => t.amount < 1000).length;

  // Impulse Score Formula based on frequency, small quick spends, and late night activity
  let impulseScore = (frequency * 1.5) + (smallTransactions * 2) + (lateNightCount * 5);
  
  return {
    impulseScore: Math.min(Math.round(impulseScore), 100), // Cap at 100
    isHighlyImpulsive: impulseScore > 60
  };
}

export function analyzeSpendingPatterns(transactions: any[]) {
  const categories: Record<string, number> = {};
  
  transactions.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  const dominantCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

  const impulseData = detectImpulseBehavior(transactions);

  return {
    categoryBreakdown: categories,
    dominantCategory,
    ...impulseData
  };
}

export function classifyUser(transactions: any[]) {
  const analysis = analyzeSpendingPatterns(transactions);
  
  const { impulseScore, dominantCategory } = analysis;
  
  let classification = "Balanced User";

  if (impulseScore > 75) {
    classification = "Impulsive Spender";
  } else if (dominantCategory.toLowerCase().includes("food") || dominantCategory.toLowerCase().includes("dining")) {
    classification = "Food Lover";
  } else if (dominantCategory.toLowerCase().includes("subscription")) {
    classification = "Subscription Waster";
  } else if (impulseScore > 40) {
    classification = "Casual Spender";
  }

  return {
    classification,
    impulseScore,
    dominantCategory
  };
}

export function predictMonthlySpend(transactions: any[]) {
  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  if (transactions.length === 0) return 0;
  
  const sortedDates = transactions.map(t => new Date(t.createdAt).getTime()).sort((a, b) => a - b);
  const daysTracked = Math.max(1, (sortedDates[sortedDates.length - 1] - sortedDates[0]) / (1000 * 60 * 60 * 24));
  
  const dailyAverage = totalSpend / daysTracked;
  return Math.round(dailyAverage * 30);
}

export function predictOverspendingRisk(transactions: any[], salary: number = 100000) {
  const predictedSpend = predictMonthlySpend(transactions);
  const safeLimit = salary * 0.8; // Assuming 20% savings rule

  const riskScore = Math.max(0, predictedSpend - safeLimit) / (safeLimit || 1) * 100;
  
  let riskLevel = "LOW";
  if (riskScore > 20) riskLevel = "HIGH";
  else if (riskScore > 0) riskLevel = "MEDIUM";

  return {
    predictedSpend,
    riskScore: Math.min(Math.round(riskScore), 100),
    riskLevel,
    savingsPotential: Math.max(0, salary - predictedSpend)
  };
}

export function generateSmartNudge(classification: string, riskLevel: string) {
  let intensity = "Gentle";
  let message = "Keep up the good tracking!";
  let suggestedAction = "Review limits";

  if (riskLevel === "HIGH" || classification === "Impulsive Spender") {
    intensity = "Strong";
    message = "🚨 High Overspending Risk Detected! You are likely to overspend today.";
    suggestedAction = "Redirect ₹500 into SIP right now?";
  } else if (riskLevel === "MEDIUM" || classification === "Food Lover") {
    intensity = "Moderate";
    message = "Watch your upcoming weekend spending spikes.";
    suggestedAction = "Transfer ₹200 to virtual savings?";
  }

  return {
    intensity,
    message,
    suggestedAction
  };
}

export function getFullAISummary() {
  const txs = transactionsStore;
  const classification = classifyUser(txs);
  const prediction = predictOverspendingRisk(txs, 100000); // Mock salary
  const nudge = generateSmartNudge(classification.classification, prediction.riskLevel);
  const timePatterns = detectTimePatterns(txs);

  return {
    userProfile: classification,
    prediction,
    activeNudge: nudge,
    behavioralStats: {
        lateNightSpends: timePatterns.lateNightCount,
        weekendSpends: timePatterns.weekendCount,  
    }
  };
}
