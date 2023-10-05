import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import axios from 'axios';

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const submitOrder = async (request: Request, response: Response) => {

  // Check request body
  if (!request.body) {
    logger.error('Missing request body.');
    throw new CustomError(400, 'Bad request: No Pub/Sub message was received');
  }

  // Check if the body comes in a message
  if (!request.body.message) {
    logger.error('Missing body message');
    throw new CustomError(400, 'Bad request: Wrong No Pub/Sub message format');
  }

  logger.info(JSON.stringify(request.body));

  // Receive the Pub/Sub message
  const pubSubMessage = request.body.message;

  // For our example we will use the customer id as a var
  // and the query the commercetools sdk with that info
  const decodedData = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : undefined;

  if (decodedData) {
    logger.info(decodedData);

    const jsonData = JSON.parse(decodedData);

    try {
      const response = await axios.post('https://eonqy384i8m5u1.m.pipedream.net', {orderId: jsonData.order.orderNumber})
      logger.info(response.status);
      return({ statusCode: response.status })
    } catch (error) {
      // Retry or handle the error
      // Create an error object
      if (error instanceof Error) {
        throw new CustomError(
          400,
          `Internal server error on event Controller: ${error.stack}`
        );
      }
    }
  }

  // Return the response for the client
  return({ statusCode: 200 })
};
