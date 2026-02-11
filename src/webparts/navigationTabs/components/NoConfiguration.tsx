import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import * as strings from 'NavigationTabsWebPartStrings';

export interface INoConfigurationProps {
  message?: string;
  description?: string;
}

export const NoConfiguration: React.FC<INoConfigurationProps> = ({
  message = strings.NoListSelectedMessage,
  description = strings.NoListSelectedDescription,
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#605e5c' }}>
      <Icon
        iconName="Settings"
        styles={{ root: { fontSize: 48, color: '#c8c6c4', marginBottom: 16 } }}
      />
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{message}</div>
      <div style={{ fontSize: 14 }}>{description}</div>
    </div>
  );
};
