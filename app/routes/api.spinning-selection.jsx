import { json } from "@remix-run/node";
import { authenticate, getSpinningSelectionMetafield, setSpinningSelectionMetafield } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("[spinning-selection] loader session:", session);
  if (!session || !session.shop) {
    console.error("[spinning-selection] loader: Shop session missing or invalid", session);
    return json({ error: "Shop session missing or invalid" }, { status: 401 });
  }
  const shop = session.shop;
  const value = await getSpinningSelectionMetafield(admin, shop);
  let parsed = null;
  try {
    parsed = value ? JSON.parse(value) : null;
  } catch {
    parsed = null;
  }
  return json({ selection: parsed });
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("[spinning-selection] action session:", session);
  if (!session || !session.shop) {
    console.error("[spinning-selection] action: Shop session missing or invalid", session);
    return json({ error: "Shop session missing or invalid" }, { status: 401 });
  }
  const shop = session.shop;
  const body = await request.json();
  const { selection } = body;
  await setSpinningSelectionMetafield(admin, shop, selection);
  return json({ success: true });
}; 