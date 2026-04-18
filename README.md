# Investment Nudger 🚀

> An AI-powered, full-stack behavioral finance application engineered to intercept impulse spending and redirect those funds into long-term wealth building.

---

## 🎯 The Purpose (Why this was built)
Traditional budgeting apps only tell you where your money went *after* the fact. **Investment Nudger** tackles the root cause of financial leakage: emotional and impulsive spending. 

By introducing positive psychological friction (like Purchase Cooldown Timers) and utilizing AI to detect detrimental spending patterns (like late-night shopping binges), this platform proactively stops bad financial decisions in real-time and nudges the user to invest that saved capital instead.

---

## 💼 For Recruiters & Hiring Managers
This project was developed to demonstrate proficiency in architecting, designing, and engineering a production-ready, full-stack web application. 

### Key Engineering Highlights:
- **Monorepo Architecture**: Structured as a `pnpm` workspace organizing independent packages for the frontend UI, backend API server, database layer, and shared schema definitions. This demonstrates an understanding of scalable, enterprise-level repository management.
- **End-to-End Type Safety**: Utilizes **Zod** and **TypeScript** across the entire stack. Database schemas tightly couple with API request validations and frontend UI props, eliminating runtime type errors.
- **Advanced State & Animations**: Leverages **Framer Motion** for complex, orchestrated spring-physics entrance animations and **React Query** for robust asynchronous server-state management.
- **Custom Design System**: Features a bespoke **"Pale Glassmorphic"** UI utilizing TailwindCSS, `backdrop-filter` rendering, and deeply integrated responsive data visualization via **Recharts**.

---

## ✨ Core Product Features

### 🧠 Pattern Recognition & AI Coach
- **Behavioral Analytics**: The system analyzes transaction history to classify spending behavior (e.g., "Late Night Activity", "Weekend Spikes").
- **Dynamic Nudges**: Generates context-aware, intensity-based nudges urging the user to reconsider high-risk purchases.

### 🛡️ Impulse Controls & Friction
- **Cooldown Timers**: A customized, animated psychological buffer (15s to 120s) that the user must wait through before confirming an unauthorized "want" purchase.
- **Spending Lock Windows**: Allows users to freeze specific spending categories (e.g., Electronics) or timeframes (e.g., 10 PM - 7 AM).

### 🎯 Smart Guardrails & Dashboards
- **Systemic Liquidity Tracking**: A real-time executive dashboard offering macro-views of "Global Flow" versus "Risk Vectors" (impulse spending).
- **Automated Reallocation**: When the app successfully prevents an impulse purchase, it instantly calculates the savings and proposes an immediate micro-investment.

---

## 🛠️ Technical Stack

### Frontend Architecture
- **Core**: React 18, Next.js / Vite, TypeScript
- **Styling**: TailwindCSS (Custom Glassmorphism configuration)
- **State Management**: React Query (@tanstack/react-query), React Hook Form
- **Animation & Visuals**: Framer Motion, Recharts, Lucide Icons

### Backend Architecture
- **Server Environment**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM (Object Relational Mapping)**: Drizzle ORM (for highly optimized, type-safe SQL queries)
- **Validation**: Zod (Schema declaration and data validation)

---

## 🚀 Getting Started Locally

To test this application on your local machine:

**1. Clone & Install Dependencies**
Ensure you have `Node.js` and `pnpm` installed.
\`\`\`bash
git clone https://github.com/keerthanas03/InvestmentNudge.git
cd InvestmentNudge
pnpm install
\`\`\`

**2. Database Configuration**
Ensure your local PostgreSQL service is running. Configure the `DATABASE_URL` in your `.env` file at the root. Then push the relational schema to your database:
\`\`\`bash
pnpm db:push
\`\`\`

**3. Launch the Application**
Spin up both the Express API Backend and the Vite React Frontend simultaneously via the monorepo dev script:
\`\`\`bash
pnpm dev
\`\`\`
- **Frontend** will be available on `http://localhost:3000`
- **Backend API** will be available on `http://localhost:5000`

---
*Developed with a focus on writing clean, maintainable, and highly responsive code.*
