import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { Image, ImageFit } from '@fluentui/react/lib/Image';

export interface ILinkIconProps {
  iconUrl: string;
  size: number;
  title: string;
}

export const LinkIcon: React.FC<ILinkIconProps> = ({ iconUrl, size, title }) => {
  if (iconUrl) {
    return (
      <Image
        src={iconUrl}
        alt={title}
        width={size}
        height={size}
        imageFit={ImageFit.contain}
      />
    );
  }

  return (
    <Icon
      iconName="Link"
      styles={{ root: { fontSize: size, width: size, height: size, lineHeight: `${size}px` } }}
      aria-hidden="true"
    />
  );
};
