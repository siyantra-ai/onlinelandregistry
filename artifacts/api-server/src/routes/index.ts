import { Router, type IRouter } from "express";
import healthRouter from "./health";
import servicesRouter from "./services";
import ordersRouter from "./orders";
import checkoutRouter from "./checkout";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(servicesRouter);
router.use(ordersRouter);
router.use(checkoutRouter);
router.use(paymentsRouter);

export default router;
