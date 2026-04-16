import { Router, type IRouter } from "express";
import healthRouter from "./health";
import transactionsRouter from "./transactions";
import categoriesRouter from "./categories";
import budgetsRouter from "./budgets";
import nudgesRouter from "./nudges";
import investmentsRouter from "./investments";
import gamificationRouter from "./gamification";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(transactionsRouter);
router.use(categoriesRouter);
router.use(budgetsRouter);
router.use(nudgesRouter);
router.use(investmentsRouter);
router.use(gamificationRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;
