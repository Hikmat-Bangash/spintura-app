import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  return authenticate.webhook(request);
}; 