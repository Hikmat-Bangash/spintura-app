import React, { useState, useEffect } from 'react';
import {
  reactExtension,
  BlockStack,
  Checkbox,
  useApi,
  Banner,
  Text,
  Divider,
} from '@shopify/ui-extensions-react/admin';

export default reactExtension('admin.product-details.configuration.render', () => {
  const { product } = useApi();
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  // Initialize state from product metafield
  useEffect(() => {
    const initializeMetafield = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Log the product data to verify we have access
        console.log('Product data:', product);
        setDebugInfo(JSON.stringify(product, null, 2));
        
        if (!product || !product.metafields) {
          throw new Error('Product or metafields not available');
        }

        const metafield = product.metafields.find(
          (m) => m.namespace === 'custom' && m.key === 'spin_swipe_enable'
        );
        
        console.log('Found metafield:', metafield);
        
        if (!metafield) {
          console.log('Creating new metafield...');
          // If metafield doesn't exist, create it with default value
          await product.updateMetafield({
            namespace: 'custom',
            key: 'spin_swipe_enable',
            value: 'false',
            type: 'boolean',
          });
          setIsEnabled(false);
        } else {
          setIsEnabled(metafield.value === 'true');
        }
      } catch (err) {
        console.error('Failed to initialize metafield:', err);
        setError(`Failed to load custom field settings: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMetafield();
  }, []);

  const handleChange = async (checked) => {
    try {
      setError(null);
      console.log('Updating metafield to:', checked);
      // Update the metafield using the product API
      await product.updateMetafield({
        namespace: 'custom',
        key: 'spin_swipe_enable',
        value: checked ? 'true' : 'false',
        type: 'boolean',
      });
      setIsEnabled(checked);
      console.log('Metafield updated successfully');
    } catch (error) {
      console.error('Failed to update metafield:', error);
      setError(`Failed to update custom field: ${error.message}`);
      // Revert the checkbox state
      setIsEnabled(!checked);
    }
  };

  return (
    <BlockStack spacing="loose">
      <Text size="large" emphasis="bold">Spin Swipe Configuration</Text>
      <Divider />
      {error && (
        <Banner status="critical">
          {error}
        </Banner>
      )}
      <Checkbox
        label="Enable Spin Swipe"
        checked={isEnabled}
        onChange={handleChange}
        disabled={isLoading}
      />
      {debugInfo && (
        <BlockStack spacing="tight">
          <Text size="small" emphasis="bold">Debug Information:</Text>
          <Text size="small" emphasis="subdued">{debugInfo}</Text>
        </BlockStack>
      )}
    </BlockStack>
  );
}); 