import CustomError from '../errors/custom.error';
import axios from 'axios';
import { logger } from '../utils/logger.utils';

export const submitOrder = async (orderId: string) => {
  try {
    const response = await axios.post('https://eonqy384i8m5u1.m.pipedream.net', {orderId})
    logger.info(response.status);
    return({ statusCode: response.status })
  } catch (error) {
    // Retry or handle the error
    // Create an error object
    if (error instanceof Error) {
      throw new CustomError(
        400,
        `Internal server error on OrderController: ${error.stack}`
      );
    }
  }
};