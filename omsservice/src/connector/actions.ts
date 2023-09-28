import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';

const ORDER_SUBMIT_EXTENSION_KEY = 'myconnector-orderSubmitExtension';

export async function createOrderSubmitExtension(
  apiRoot: ByProjectKeyRequestBuilder,
  applicationUrl: string
): Promise<void> {
  const {
    body: { results: extensions },
  } = await apiRoot
    .extensions()
    .get({
      queryArgs: {
        where: `key = "${ORDER_SUBMIT_EXTENSION_KEY}"`,
      },
    })
    .execute();

  if (extensions.length > 0) {
    const extension = extensions[0];

    await apiRoot
      .extensions()
      .withKey({ key: ORDER_SUBMIT_EXTENSION_KEY })
      .delete({
        queryArgs: {
          version: extension.version,
        },
      })
      .execute();
  }

  await apiRoot
    .extensions()
    .post({
      body: {
        key: ORDER_SUBMIT_EXTENSION_KEY,
        destination: {
          type: 'HTTP',
          url: `${applicationUrl}/service/submitOrder`,
        },
        triggers: [
          {
            resourceTypeId: 'order',
            actions: ['Create'],
          },
        ],
      },
    })
    .execute();
}

export async function deleteOrderSubmitExtension(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  const {
    body: { results: extensions },
  } = await apiRoot
    .extensions()
    .get({
      queryArgs: {
        where: `key = "${ORDER_SUBMIT_EXTENSION_KEY}"`,
      },
    })
    .execute();

  if (extensions.length > 0) {
    const extension = extensions[0];

    await apiRoot
      .extensions()
      .withKey({ key: ORDER_SUBMIT_EXTENSION_KEY })
      .delete({
        queryArgs: {
          version: extension.version,
        },
      })
      .execute();
  }
}
