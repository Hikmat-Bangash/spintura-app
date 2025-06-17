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
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  webhooks: {
    APP_INSTALLED: {
      deliveryMethod: "GQL_EVENTS",
      callbackUrl: "/webhooks",
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
                  visibleToStorefront: false,
                  pin: true,
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
                  visibleToStorefront: false,
                  pin: true,
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
      deliveryMethod: "GQL_EVENTS",
      callbackUrl: "/webhooks",
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
      deliveryMethod: "GQL_EVENTS",
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId, apiVersion, shopify) => {
        await prisma.session.deleteMany({ where: { shop } });
      },
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
