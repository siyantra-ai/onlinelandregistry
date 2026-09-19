import { Router, type IRouter } from "express";
import healthRouter from "./health";
import servicesRouter from "./services";
import ordersRouter from "./orders";
import checkoutRouter from "./checkout";
import paymentsRouter from "./payments";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(servicesRouter);
router.use(ordersRouter);
router.use(checkoutRouter);
router.use(paymentsRouter);
router.use(contactRouter);

export default router;
