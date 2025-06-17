import React, { useState } from 'react';
import {
  reactExtension,
  BlockStack,
  Checkbox,
  TextField,
  useApi,
  Banner,
  Text,
  Divider,
} from '@shopify/ui-extensions-react/admin';

export default reactExtension('admin.product.create.render', () => {
  const { product } = useApi();
  const [isEnabled, setIsEnabled] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [error, setError] = useState(null);

  const handleCheckboxChange = async (checked) => {
    try {
      setError(null);
      await product.updateMetafield({
        namespace: 'custom',
        key: 'spin_swipe_enable',
        value: checked ? 'true' : 'false',
        type: 'boolean',
      });
      setIsEnabled(checked);
    } catch (error) {
      console.error('Failed to update metafield:', error);
      setError(`Failed to update checkbox: ${error.message}`);
      setIsEnabled(!checked);
    }
  };

  const handleTextChange = async (value) => {
    try {
      setError(null);
      await product.updateMetafield({
        namespace: 'custom',
        key: 'spin_swipe_text',
        value: value,
        type: 'single_line_text_field',
      });
      setTextValue(value);
    } catch (error) {
      console.error('Failed to update text metafield:', error);
      setError(`Failed to update text field: ${error.message}`);
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
        onChange={handleCheckboxChange}
      />
      <TextField
        label="Custom Text"
        value={textValue}
        onChange={handleTextChange}
        placeholder="Enter custom text"
      />
    </BlockStack>
  );
}); 