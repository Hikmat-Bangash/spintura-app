import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop');
  
  if (!shop) {
    return json({ error: "Shop parameter is required" }, { status: 400 });
  }

  try {
    // Fetch menu data from the public endpoint
    const menuUrl = `https://${shop}/pages/menu`;
    const response = await fetch(menuUrl);
    const text = await response.text();
    
    let menu = null;
    try {
      const data = JSON.parse(text);
      menu = data && data.menu ? data.menu : null;
    } catch (e) {
      menu = null;
    }

    // Return the settings data
    return json({ 
      shop,
      menu,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[public-settings] Error fetching settings:", error);
    return json({ 
      error: "Failed to fetch settings",
      shop,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}; 