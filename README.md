# Investment Nudger 🚀

**Investment Nudger** is a premium, full-stack fintech platform designed to transform impulsive spending habits into consistent wealth-building engines using behavioral psychology and AI-driven insights. Designed with a stunning, performance-first glassmorphic aesthetic.

## ✨ Features

- **🧠 AI Financial Coach**: Get personalized behavioral insights, transaction analysis, and autonomous investment nudges based on your spending footprint.
- **🛡️ Impulse Controls**: Intercept high-risk emotional spending with smart cooldown timers and dynamic category-locking mechanisms.
- **🎯 Smart Budgets**: Establish intelligent guardrails that automatically scale alerts and nudges when you approach your predetermined limits.
- **📈 Real-Time Dashboards**: Visualize systemic liquidity, categorical densities, and cognitive health analytics using highly responsive `Recharts` and bouncy `Framer Motion` animations.
- **🎮 Gamification**: Build resilient micro-investing habits through streaks, unlockable achievements, and healthy challenges. 

## 🛠️ Tech Stack

### Frontend (User Interface)
- **Framework**: [Next.js](https://nextjs.org/) / Vite with React
- **Styling**: Tailwind CSS with custom Glassmorphism styling (`backdrop-filter`) and smooth dynamic animations.
- **Motion & Charts**: Framer Motion for spring physics and layout staggering, alongside Recharts for robust data visualization.

### Backend (Logic & APIs)
- **Server**: Node.js with Express and TypeScript.
- **Database**: PostgreSQL (managed and queried utilizing [Drizzle ORM](https://orm.drizzle.team/)).
- **Types**: Zod schemas combined with OpenAPI generators ensure pristine end-to-end type safety from database to UI.
- **Monorepo Management**: Built utilizing `pnpm` workspace functionality for robust package splitting (`@workspace/api-client-react`, `@workspace/db`).

## 🚀 Getting Started

Ensure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

1. **Install Dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

2. **Database Setup**
   Configure your PostgreSQL connection in your local `.env`. Then execute:
   \`\`\`bash
   pnpm db:push
   \`\`\`

3. **Spin Up the Local Environment**
   \`\`\`bash
   # Starts the API server (Port 5000) and the UI Server (Port 3000) concurrently
   pnpm dev
   \`\`\`

## 🎨 Design System

The application relies on a **"Pale Glassmorphic"** design system:
- Harmonious pale pastel color palette with targeted gradients.
- Fluid, bouncy `y-axis` transitions.
- Elevated backdrop-blurred overlays and subtle frosted card borders.

---

*Built for those who want to turn today's loose change into tomorrow's legacy.*
