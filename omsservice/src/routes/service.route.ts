import { Router } from 'express';
import { logger } from '../utils/logger.utils';
import { submitOrder } from '../controllers/orders.controller';

const serviceRouter = Router();

serviceRouter.post('/submitOrder', async (req, res) => {
  logger.info('Order submit extension executed');
  logger.info(JSON.stringify(req.body.resource.obj.id));
  const response = await submitOrder(req.body.resource.obj.id);
  res.status(response?.statusCode || 400).send({
    "actions": [
      {
          "action": "changeOrderState",
          "orderState": "Confirmed"
      }
    ]
  });
});

export default serviceRouter;
