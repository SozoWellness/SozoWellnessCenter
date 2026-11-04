import { Router, type IRouter } from "express";
import healthRouter from "./health";
import assessmentRequestsRouter from "./assessment-requests";
import guideRequestsRouter from "./guide-requests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(assessmentRequestsRouter);
router.use(guideRequestsRouter);

export default router;
