import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.April24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  webhooks: {
    APP_INSTALLED: {
      deliveryMethod: "HTTP",
      callback: async (topic, shop, body, webhookId, apiVersion, shopify) => {
        const { admin } = shopify;
        console.log(`[APP_INSTALLED Webhook] received for shop: ${shop}`);
        try {
          // Create boolean metafield definition
          const booleanResponse = await admin.graphql(
            `#graphql
            mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
              metafieldDefinitionCreate(definition: $definition) {
                userErrors {
                  field
                  message
                }
                createdDefinition {
                  id
                  name
                  namespace
                  key
                  type {
                    name
                  }
                }
              }
            }`,
            {
              variables: {
                definition: {
                  name: "Spin Swipe Enabled",
                  namespace: "custom",
                  key: "spin_swipe_enable",
                  type: "boolean",
                  ownerType: "PRODUCT",
                  pin: true,
                  access: {
                    admin: "MERCHANT_READ_WRITE"
                  }
                },
              },
            },
          );

          // Create text metafield definition
          const textResponse = await admin.graphql(
            `#graphql
            mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
              metafieldDefinitionCreate(definition: $definition) {
                userErrors {
                  field
                  message
                }
                createdDefinition {
                  id
                  name
                  namespace
                  key
                  type {
                    name
                  }
                }
              }
            }`,
            {
              variables: {
                definition: {
                  name: "Spin Swipe Text",
                  namespace: "custom",
                  key: "spin_swipe_text",
                  type: "single_line_text_field",
                  ownerType: "PRODUCT",
                  pin: true,
                  access: {
                    admin: "MERCHANT_READ_WRITE"
                  }
                },
              },
            },
          );

          console.log("[APP_INSTALLED Webhook] Boolean Metafield Response:", JSON.stringify(booleanResponse, null, 2));
          console.log("[APP_INSTALLED Webhook] Text Metafield Response:", JSON.stringify(textResponse, null, 2));

          if (booleanResponse.data.metafieldDefinitionCreate.userErrors.length > 0) {
            console.error(
              "Error creating boolean metafield definition:",
              booleanResponse.data.metafieldDefinitionCreate.userErrors,
            );
          }

          if (textResponse.data.metafieldDefinitionCreate.userErrors.length > 0) {
            console.error(
              "Error creating text metafield definition:",
              textResponse.data.metafieldDefinitionCreate.userErrors,
            );
          }
        } catch (error) {
          console.error("Failed to create metafield definitions:", error);
        }
      },
    },
    PRODUCTS_UPDATE: {
      deliveryMethod: "HTTP",
      callback: async (topic, shop, body, webhookId, apiVersion, shopify) => {
        console.log(`[PRODUCTS_UPDATE Webhook] received for shop: ${shop}`);
        try {
          const { admin } = shopify;
          const { id, metafields } = body;
          
          // Handle product update logic here
          console.log(`Product ${id} updated with metafields:`, metafields);
        } catch (error) {
          console.error("Failed to process product update:", error);
        }
      },
    },
    APP_UNINSTALLED: {
      deliveryMethod: "HTTP",
      callback: async (topic, shop, body, webhookId, apiVersion, shopify) => {
        await prisma.session.deleteMany({ where: { shop } });
      },
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.April24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;

// Utility to get a shop metafield for spinning tool selection
export async function getSpinningSelectionMetafield(admin, shop) {
  const query = `#graphql
    query GetShopMetafield($namespace: String!, $key: String!) {
      shop {
        metafield(namespace: $namespace, key: $key) {
          id
          value
        }
      }
    }
  `;
  const variables = { namespace: "custom", key: "spinning_selection" };
  const result = await admin.graphql(query, { variables });
  return result?.data?.shop?.metafield?.value || null;
}

// Utility to set a shop metafield for spinning tool selection
export async function setSpinningSelectionMetafield(admin, shop, value) {
  // First, fetch the shop GID
  const shopQuery = `#graphql\n    {\n      shop {\n        id\n      }\n    }\n  `;
  let shopResult = await admin.graphql(shopQuery);
  // If shopResult is a Response, parse it as JSON
  if (shopResult && typeof shopResult.json === 'function') {
    shopResult = await shopResult.json();
  }
  console.log('[setSpinningSelectionMetafield] Shop GID query result:', JSON.stringify(shopResult, null, 2));
  const shopGid = shopResult?.data?.shop?.id;
  if (!shopGid) {
    console.error('[setSpinningSelectionMetafield] Failed to fetch shop GID. Full response:', shopResult);
    throw new Error("Could not fetch shop GID");
  }

  const mutation = `#graphql\n    mutation SetShopMetafield($metafields: [MetafieldsSetInput!]!) {\n      metafieldsSet(metafields: $metafields) {\n        metafields {\n          id\n          key\n          namespace\n          value\n        }\n        userErrors {\n          field\n          message\n        }\n      }\n    }\n  `;
  const variables = {
    metafields: [
      {
        ownerId: shopGid,
        namespace: "custom",
        key: "spinning_selection",
        type: "json",
        value: JSON.stringify(value),
      },
    ],
  };
  const result = await admin.graphql(mutation, { variables });
  return result;
}
