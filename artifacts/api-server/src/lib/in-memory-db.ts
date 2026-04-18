// In-memory store for development when DB is unreachable

export const nudgeRulesStore: any[] = [
  {
    id: 1,
    name: "Impulse Control",
    category: "Shopping",
    condition: ">",
    thresholdAmount: 100,
    message: "Consider investing this 10% instead of spending!",
    ruleType: "Impulse",
    priority: "high",
    investmentType: "stocks",
    investmentValue: 10,
    nudgeIntensity: "high",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Food Budget Alert",
    category: "Food & Dining",
    condition: ">",
    thresholdAmount: 500,
    message: "You've spent a lot on food today. Time to cook at home!",
    ruleType: "Impulse",
    priority: "medium",
    investmentType: "mutual_funds",
    investmentValue: 5,
    nudgeIntensity: "medium",
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const nudgesStore: any[] = [
  { id: 1, ruleId: 1, amount: 1500, status: "pending", createdAt: new Date().toISOString(), message: "Unusual impulse spending at Amazon" },
  { id: 2, ruleId: 2, amount: 1200, status: "pending", createdAt: new Date().toISOString(), message: "High food spending detected at Zomato" }
];

export const transactionsStore: any[] = [
  { id: 1, merchant: "Amazon", amount: 1500, category: "Shopping", type: "Impulse", status: "impulse", isImpulse: true, createdAt: "2026-04-15T23:45:00Z" },
  { id: 2, merchant: "Starbucks", amount: 450, category: "Food & Dining", type: "Impulse", status: "normal", isImpulse: false, createdAt: "2026-04-16T08:30:00Z" },
  { id: 3, merchant: "H&M", amount: 2800, category: "Shopping", type: "Impulse", status: "impulse", isImpulse: true, createdAt: "2026-04-12T14:20:00Z" },
  { id: 4, merchant: "Uber", amount: 1650, category: "Transport", type: "Need", status: "normal", isImpulse: false, createdAt: "2026-04-16T22:15:00Z" },
  { id: 5, merchant: "Netflix", amount: 1299, category: "Subscriptions", type: "Waste", status: "normal", isImpulse: false, createdAt: "2026-04-01T00:00:00Z" },
  { id: 6, merchant: "Zomato", amount: 3200, category: "Food & Dining", type: "Impulse", status: "impulse", isImpulse: true, createdAt: "2026-04-16T23:30:00Z" },
  { id: 7, merchant: "Zara", amount: 4500, category: "Shopping", type: "Luxury", status: "impulse", isImpulse: true, createdAt: "2026-04-13T19:00:00Z" },
  { id: 8, merchant: "Reliance Digital", amount: 15000, category: "Electronics", type: "Need", status: "normal", isImpulse: false, createdAt: "2026-04-10T12:00:00Z" },
  { id: 9, merchant: "Steam Games", amount: 8500, category: "Entertainment", type: "Impulse", status: "impulse", isImpulse: true, createdAt: "2026-04-16T02:00:00Z" },
  { id: 10, merchant: "BigBasket", amount: 6800, category: "Groceries", type: "Need", status: "normal", isImpulse: false, createdAt: "2026-04-14T10:00:00Z" },
  { id: 11, merchant: "Swiggy", amount: 1850, category: "Food & Dining", type: "Impulse", status: "normal", isImpulse: true, createdAt: "2026-04-17T12:00:00Z" },
  { id: 12, merchant: "Zerodha", amount: 12000, category: "Investments", type: "Investment", status: "normal", isImpulse: false, createdAt: "2026-04-15T09:00:00Z" },
  { id: 13, merchant: "Local Mart", amount: 2200, category: "Groceries", type: "Need", status: "normal", isImpulse: false, createdAt: "2026-04-17T10:00:00Z" },
  { id: 14, merchant: "Movie Theatre", amount: 1200, category: "Entertainment", type: "Impulse", status: "normal", isImpulse: false, createdAt: "2026-04-17T20:00:00Z" },
  { id: 15, merchant: "Gas Station", amount: 3500, category: "Transport", type: "Need", status: "normal", isImpulse: false, createdAt: "2026-04-17T08:00:00Z" },
];

export const budgetsStore: any[] = [
  { id: 1, category: "Shopping", limitAmount: 5000, spentAmount: 8800, period: "monthly", budgetType: "category", isActive: true, createdAt: new Date().toISOString() },
  { id: 2, category: "Food & Dining", limitAmount: 3000, spentAmount: 5500, period: "monthly", budgetType: "category", isActive: true, createdAt: new Date().toISOString() },
  { id: 3, category: "Transport", limitAmount: 6000, spentAmount: 5150, period: "monthly", budgetType: "category", isActive: true, createdAt: new Date().toISOString() },
  { id: 4, category: "Entertainment", limitAmount: 5000, spentAmount: 9700, period: "monthly", budgetType: "category", isActive: true, createdAt: new Date().toISOString() },
];

export const categoriesStore: any[] = [
  { id: 1, name: "Shopping", color: "#EC4899", icon: "shopping-bag", blockSpending: false },
  { id: 2, name: "Food & Dining", color: "#14B8A6", icon: "utensils", blockSpending: false },
  { id: 3, name: "Transport", color: "#A78BFA", icon: "car", blockSpending: false },
  { id: 4, name: "Entertainment", color: "#FACC15", icon: "music", blockSpending: false },
  { id: 5, name: "Groceries", color: "#22C55E", icon: "shopping-cart", blockSpending: false },
];

export const investmentsStore: any[] = [
  { id: 1, amount: 500, type: "stocks", category: "stocks", source: "auto", status: "completed", createdAt: "2026-04-15T10:00:00Z" },
  { id: 2, amount: 300, type: "mutual_funds", category: "mutual-funds", source: "manual", status: "completed", createdAt: "2026-04-14T14:00:00Z" },
  { id: 3, amount: 1000, type: "stocks", category: "stocks", source: "auto", status: "pending", createdAt: "2026-04-16T09:00:00Z" },
];

export const investmentSettingsStore: any = {
  id: 1,
  overspendPercent: 20,
  weeklyCap: 500,
  autoInvestEnabled: true,
};

export const gamificationStore: any = {
  userId: 1,
  points: 1250,
  level: 5,
  streak: 7,
  badges: [
    { id: 1, name: "First Save", icon: "🏆", earnedAt: "2026-04-01T00:00:00Z" },
    { id: 2, name: "Week Streak", icon: "🔥", earnedAt: "2026-04-10T00:00:00Z" },
    { id: 3, name: "Budget Master", icon: "💰", earnedAt: "2026-04-12T00:00:00Z" },
  ]
};
