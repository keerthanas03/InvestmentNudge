import { db } from "./index";
import { transactionsTable } from "./schema/transactions";
import { investmentsTable } from "./schema/investments";
import { investmentSettingsTable } from "./schema/investment-settings";
import { categoriesTable } from "./schema/categories";

const categories = [
  "Food & Dining", "Transport", "Shopping", "Bills & Utilities", 
  "Rent & Housing", "Groceries", "Entertainment", "Subscriptions", 
  "Health & Medical", "Education", "Travel", "Investments"
];

const categoryData: Record<string, { color: string; icon: string; tagging: string; merchants: string[]; subcategories: string[] }> = {
  "Food & Dining": { color: "hsl(24, 100%, 50%)", icon: "Utensils", tagging: "Impulse", merchants: ["Swiggy", "Zomato", "Starbucks", "McDonald's"], subcategories: ["Delivery", "Dining", "Coffee"] },
  "Transport": { color: "hsl(217, 91%, 60%)", icon: "Car", tagging: "Need", merchants: ["Uber", "Ola", "Rapido"], subcategories: ["Cabs", "Public Transport", "Fuel"] },
  "Shopping": { color: "hsl(271, 91%, 65%)", icon: "ShoppingBag", tagging: "Impulse", merchants: ["Amazon", "Flipkart", "Ajio", "Myntra"], subcategories: ["Fashion", "Electronics", "Lifestyle"] },
  "Bills & Utilities": { color: "hsl(210, 20%, 50%)", icon: "Zap", tagging: "Need", merchants: ["Airtel", "Jio", "BESCOM"], subcategories: ["Electricity", "Mobile", "Wifi"] },
  "Rent & Housing": { color: "hsl(25, 30%, 40%)", icon: "Home", tagging: "Need", merchants: ["Owner", "Society"], subcategories: ["Rent", "Maintenance"] },
  "Groceries": { color: "hsl(142, 70%, 45%)", icon: "ShoppingCart", tagging: "Need", merchants: ["BigBasket", "Blinkit", "Reliance Fresh"], subcategories: ["Daily Needs", "Fruits", "Vegetables"] },
  "Entertainment": { color: "hsl(330, 81%, 60%)", icon: "Film", tagging: "Impulse", merchants: ["BookMyShow", "PVR", "Gaming"], subcategories: ["Movies", "Events", "Games"] },
  "Subscriptions": { color: "hsl(243, 75%, 59%)", icon: "Clock", tagging: "Waste", merchants: ["Netflix", "Spotify", "Disney+", "YouTube Premium"], subcategories: ["Streaming", "Tools"] },
  "Health & Medical": { color: "hsl(0, 84%, 60%)", icon: "Heart", tagging: "Need", merchants: ["Apollo", "PharmEasy", "Clinic"], subcategories: ["Medicine", "Checkup"] },
  "Education": { color: "hsl(174, 75%, 39%)", icon: "GraduationCap", tagging: "Investment", merchants: ["Udemy", "Coursera", "College"], subcategories: ["Courses", "Books", "Certifications"] },
  "Travel": { color: "hsl(188, 78%, 41%)", icon: "Plane", tagging: "Luxury", merchants: ["MakeMyTrip", "Indigo", "AirBnB"], subcategories: ["Flights", "Hotels", "Holiday"] },
  "Investments": { color: "hsl(45, 100%, 45%)", icon: "TrendingUp", tagging: "Investment", merchants: ["Zerodha", "Groww", "Smallcase"], subcategories: ["Stocks", "Mutual Funds", "Gold"] },
};

async function seed() {
  console.log("🌱 Seeding database with 12 category system...");

  // 1. Seed Categories
  console.log("Creating categories...");
  await db.delete(categoriesTable);
  for (const cat of categories) {
    const data = categoryData[cat];
    await db.insert(categoriesTable).values({
      name: cat,
      color: data.color,
      icon: data.icon,
    });
  }

  // 2. Seed Transactions
  console.log("Generating 100 transactions...");
  await db.delete(transactionsTable);
  const transactionData = [];
  const now = new Date();
  
  for (let i = 0; i < 100; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const data = categoryData[category];
    const merchant = data.merchants[Math.floor(Math.random() * data.merchants.length)];
    const subcategory = data.subcategories[Math.floor(Math.random() * data.subcategories.length)];
    const amount = Math.floor(Math.random() * 5000) + 100;
    
    // Weighted distribution: Impulse categories appear more often
    if (["Food & Dining", "Shopping", "Entertainment"].includes(category)) {
        if (Math.random() < 0.3) i--; // Re-run to increase frequency
    }

    const day = Math.floor(Math.random() * 16) + 1;
    const hour = Math.floor(Math.random() * 24); // Full 24h range
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    const ms = Math.floor(Math.random() * 1000);
    const date = new Date(2026, 3, day, hour, minute, second, ms);

    transactionData.push({
      merchant,
      amount,
      category,
      subcategory,
      type: data.tagging,
      isImpulse: data.tagging === "Impulse",
      createdAt: date,
      status: data.tagging === "Impulse" ? "impulse" : "normal",
      nudgeTriggered: data.tagging === "Impulse",
      investmentSuggested: data.tagging === "Impulse" ? Math.floor(amount * 0.1) : 0,
    });
  }
  await db.insert(transactionsTable).values(transactionData);


  // 3. Seed Investment Settings
  console.log("Setting up initial investment settings...");
  await db.delete(investmentSettingsTable);
  await db.insert(investmentSettingsTable).values({
    autoInvestEnabled: true,
    overspendPercent: 20,
    weeklyCap: 1000,
  });

  // 4. Seed some investments
  console.log("Adding mock investments...");
  await db.delete(investmentsTable);
  const investmentData = [];
  for (let i = 0; i < 15; i++) {
    investmentData.push({
      amount: Math.floor(Math.random() * 500) + 100,
      category: categories[Math.floor(Math.random() * categories.length)],
      source: Math.random() > 0.3 ? "auto" : "manual",
      createdAt: new Date(`2026-03-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`),
    });
  }
  await db.insert(investmentsTable).values(investmentData);
  
  // 5. Seed Nudge Rules
  console.log("Seeding universal nudge rules...");
  const { nudgeRulesTable } = require("./schema/nudge-rules");
  await db.delete(nudgeRulesTable);
  
  const rules = [
    { name: "Food Control", category: "Food & Dining", condition: ">", thresholdAmount: 3000, message: "You are spending too much on food. Save ₹1000 and invest instead.", ruleType: "Impulse", priority: "high" },
    { name: "Commute Save", category: "Transport", condition: ">", thresholdAmount: 2000, message: "Transport costs are high. Try public transport or carpooling.", ruleType: "Need", priority: "medium" },
    { name: "Shopping Guard", category: "Shopping", condition: ">", thresholdAmount: 5000, message: "High shopping expenses detected. Reduce impulse buying and invest ₹2000.", ruleType: "Luxury", priority: "high" },
    { name: "Utility Check", category: "Bills & Utilities", condition: ">", thresholdAmount: 3000, message: "Utility bills are rising. Try optimizing electricity and internet usage.", ruleType: "Need", priority: "medium" },
    { name: "Rent Watch", category: "Rent & Housing", condition: ">", thresholdAmount: 10000, message: "Housing costs are significant. Plan your long-term savings.", ruleType: "Need", priority: "medium" },
    { name: "Pantry Smart", category: "Groceries", condition: ">", thresholdAmount: 4000, message: "Grocery spending is high. Plan your weekly shopping better.", ruleType: "Need", priority: "low" },
    { name: "Fun Limit", category: "Entertainment", condition: ">", thresholdAmount: 2500, message: "Entertainment spending is high. Cut down and invest ₹1000 instead.", ruleType: "Impulse", priority: "medium" },
    { name: "Subs Clean", category: "Subscriptions", condition: ">", thresholdAmount: 1000, message: "Too many subscriptions. Cancel unused ones to save money.", ruleType: "Waste", priority: "high" },
    { name: "Medical Guard", category: "Health & Medical", condition: ">", thresholdAmount: 3000, message: "Health expenses are increasing. Consider preventive care.", ruleType: "Need", priority: "medium" },
    { name: "Skill Boost", category: "Education", condition: ">", thresholdAmount: 5000, message: "Good job investing in education. Keep upgrading your skills.", ruleType: "Investment", priority: "low" },
    { name: "Trip Balance", category: "Travel", condition: ">", thresholdAmount: 7000, message: "Travel expenses are high. Plan trips wisely and balance savings.", ruleType: "Luxury", priority: "medium" },
    { name: "Wealth Engine", category: "Investments", condition: "<", thresholdAmount: 2000, message: "Your investments are low. Try investing at least ₹2000 monthly.", ruleType: "Investment", priority: "high" },
  ];
  await db.insert(nudgeRulesTable).values(rules);

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
