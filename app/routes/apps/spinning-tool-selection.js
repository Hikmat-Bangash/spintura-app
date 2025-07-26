import { json } from "@remix-run/node";
import { shopifyApp, getSpinningSelectionMetafield } from "~/shopify.server"; // adjust path if needed

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Missing shop param" }, { status: 400 });
  }

  try {
    const admin = await shopifyApp.sessionStorage.loadOfflineSession(shop).then((session) => {
      return shopifyApp.authenticatedAdmin({ session });
    });

    const value = await getSpinningSelectionMetafield(admin, shop);

    let parsed = null;
    try {
      parsed = value ? JSON.parse(value) : null;
    } catch {
      parsed = null;
    }

    return json({ selection: parsed });
  } catch (error) {
    console.error("[App Proxy] Error fetching spinning selection:", error);
    return json({ error: "Failed to fetch selection" }, { status: 500 });
  }
}; 