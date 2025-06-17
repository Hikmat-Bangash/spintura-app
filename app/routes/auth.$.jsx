import { authenticate } from "../shopify.server";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request, {
    afterAuth: async ({ session }) => {
      // Register Webhooks
      const res = await authenticate.shopify.registerWebhooks({ session });
      console.log("Webhook registration result:", res);

      redirect("/app");
    },
  });

  return null;
};
