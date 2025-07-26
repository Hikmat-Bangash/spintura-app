import { Page, Text, BlockStack, Button, Box } from "@shopify/polaris";

export default function MainMenuPage() {
  const handleRedirect = () => {
    window.open("https://shopify-management-app.vercel.app", "_blank");
  };

  return (
    <Page title="Management App">
      <Box paddingBlockStart="400" paddingBlockEnd="400">
        <BlockStack gap="400" align="center">
          <Text as="p" variant="bodyMd">
            Click on this button to redirect to the Shopify seller management app
          </Text>
          <Button 
            primary 
            size="large"
            onClick={handleRedirect}
          >
            Management App
          </Button>
        </BlockStack>
      </Box>
    </Page>
  );
}
