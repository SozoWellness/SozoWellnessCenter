import { Router, type IRouter } from "express";
import healthRouter from "./health";
import assessmentRequestsRouter from "./assessment-requests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(assessmentRequestsRouter);

export default router;
