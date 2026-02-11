import * as React from 'react';
import { INavigationLink } from '../../models/INavigationLink';
import { LayoutType } from '../../models/LayoutType';
import { CardLayout } from './CardLayout';
import { CompactLayout } from './CompactLayout';
import { TileLayout } from './TileLayout';

export interface ILinkLayoutRendererProps {
  links: INavigationLink[];
  layoutType: LayoutType;
  cardsPerRow: number;
  showDescriptions: boolean;
  openInNewTabDefault: boolean;
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, itemId: number) => void;
}

export const LinkLayoutRenderer: React.FC<ILinkLayoutRendererProps> = ({
  links,
  layoutType,
  cardsPerRow,
  showDescriptions,
  openInNewTabDefault,
  onLinkClick,
}) => {
  switch (layoutType) {
    case 'compact':
      return <CompactLayout links={links} openInNewTabDefault={openInNewTabDefault} onLinkClick={onLinkClick} />;
    case 'tile':
      return <TileLayout links={links} cardsPerRow={cardsPerRow} openInNewTabDefault={openInNewTabDefault} onLinkClick={onLinkClick} />;
    case 'card':
    default:
      return (
        <CardLayout
          links={links}
          cardsPerRow={cardsPerRow}
          showDescriptions={showDescriptions}
          openInNewTabDefault={openInNewTabDefault}
          onLinkClick={onLinkClick}
        />
      );
  }
};
