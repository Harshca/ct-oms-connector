import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import axios from 'axios';
import { randomInt } from 'crypto';

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */

// let accessToken = '';

const fetchAccessTokenIfNeeded = async () => {
  const accessToken = await getAccessToken();
  return `${accessToken}`;
};

const getAccessToken = async () => {
  try {
    const fc_fashion_username = 'fc_fashion_admin';
    const fc_fashion_password = 'WWCEJ8';
    const params = new URLSearchParams({
      username: fc_fashion_username,
      password: fc_fashion_password,
      client_id: 'FCTRAINEU101',
      client_secret: '8f7a7f3e-e6db-4043-b044-b937749aaa47',
      scope: 'api',
      grant_type: 'password',
    });
    const url = `https://fctraineu101.sandbox.api.fluentretail.com/oauth/token?${params}`;
    const response = await axios.post(url);
    const data = response.data;
    logger.info(
      '🚀 ~ file: event.controller.ts:38 ~ getAccessToken ~ data:',
      data
    );
    return `${data.access_token}`;
  } catch (error) {
    logger.error('Error fetching access token:');
    throw error;
  }
};

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

  const pubSubMessage = request.body.message;

  const decodedData = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : undefined;

  if (decodedData) {
    const jsonData = JSON.parse(decodedData);
    logger.info(jsonData);
    logger.info(decodedData);
    logger.info(
      '🚀 ~ file: event.controller.ts:70 ~ submitOrder ~ jsonData:',
      jsonData
    );

    try {
      const currentAccessToken = `${await fetchAccessTokenIfNeeded()}`;
      const response = await postFluentOrder(`${currentAccessToken}`, jsonData);
      logger.info('🚀 ~ submitOrder ~ postFluentOrder:', response);

      //   const response = await axios.post(
      //     'https://eonqy384i8m5u1.m.pipedream.net',
      //     { orderNumber: jsonData.order.orderNumber }
      //   );
      //todo integrate fluentcommerce
      logger.info(`event status code ${response?.statusCode}`);

      return { statusCode: response?.statusCode };
    } catch (error) {
      // Retry or handle the error
      // Create an error object
      if (error instanceof Error) {
        logger.error('event error');
        throw new CustomError(
          400,
          `Internal server error on event Controller: ${error.stack}`
        );
      }
    }
  }

  // Return the response for the client
  return { statusCode: 200 };
};
const postFluentOrder = async (currentAccessToken: string, orderData: any) => {
  try {
    const query = `
      mutation createSimpleHDOrder($retailerId: ID!, $customerId: ID!, $orderRef: String!, $orderItemRef: String!, $productCatalogueRef: String!, $productRef: String!) {
        createOrder (input: {
            ref: $orderRef,
            retailer: { id: $retailerId },
            type: "HD",
            customer: { id: $customerId },
            totalPrice: 200.00,
            totalTaxPrice: 20.00 ,
            items: [{
                ref: $orderItemRef,
                productRef: $productRef,
                productCatalogueRef:$productCatalogueRef,
                price: 200.00,
                paidPrice: 200.00,
                totalPrice: 200.00,
                taxPrice: 20.00,
                totalTaxPrice: 20.00,
                quantity: 1,
                currency: "AUD"
            }], 
            fulfilmentChoice: {
                currency: "AUD",
                deliveryType: "STANDARD",
                fulfilmentPrice: 5,
                fulfilmentTaxPrice: 0.99,
                deliveryAddress: {
                    ref: "132174d2-40f8-437c-977d-ace5af2007e8",
                    name: "Bradley Rau",
                    companyName: "Mann LLC", 
                    street: "46 Kippax street",
                    city: "Surry Hills",
                    state: "NSW",
                    postcode: "2060",
                    country: "Australia",
                    latitude: -33.884620,
                    longitude: 151.209760
                }
            }
        }) {
            id
            ref
        }
      }
    `;
    const variables = {
      retailerId: 1,
      customerId: 23,
      orderRef: `${orderData.order.orderNumber}`,
      orderItemRef: `${orderData.order.lineItems[0].variant.sku}`,
      productCatalogueRef: '{{product_catalogue_ref}}',
      productRef: `${orderData.order.lineItems[0].variant.sku}`,
    };
    logger.info(
      '🚀 ~ file: event.controller.ts:154 ~ postFluentOrder ~ variables:',
      variables
    );
    logger.info(variables);

    const data = JSON.stringify({
      query: query,
      variables: variables,
    });
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://fctraineu101.sandbox.api.fluentretail.com/graphql',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentAccessToken}`,
      },
      data: data,
    };
    const fluentResponse = await axios(config);
    if (fluentResponse.status == 200) {
      logger.info(`event status code ${fluentResponse.status}`);
      logger.info(`event data `, fluentResponse.data);
      return { statusCode: fluentResponse.status, data: fluentResponse.data };
    }
  } catch (err) {
    logger.error(err);
  }
};
