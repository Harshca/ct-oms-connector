import { Router } from 'express';
import { logger } from '../utils/logger.utils';
import { submitOrder } from '../controllers/event.controller';

const eventRouter: Router = Router();

eventRouter.post('/', async (req, res) => {
  logger.info('Event message received');
  logger.info(req);
  const response = await submitOrder(req, res);
  res.status(response?.statusCode || 400).send();
});

export default eventRouter;
