import { Router, type IRouter } from "express";
import healthRouter from "./health";
import assessmentRequestsRouter from "./assessment-requests";
import guideRequestsRouter from "./guide-requests";
import giveawayRouter from "./giveaway";

const router: IRouter = Router();

router.use(healthRouter);
router.use(assessmentRequestsRouter);
router.use(guideRequestsRouter);
router.use(giveawayRouter);

export default router;
