import * as React from 'react';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { INavigationLink } from '../models/INavigationLink';
import { LayoutType } from '../models/LayoutType';
import { LinkLayoutRenderer } from './layouts/LinkLayoutRenderer';
import styles from './TabContainer.module.scss';

export interface ITabContainerProps {
  categories: Map<string, INavigationLink[]>;
  layoutType: LayoutType;
  cardsPerRow: number;
  showDescriptions: boolean;
  openInNewTabDefault: boolean;
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, itemId: number) => void;
}

export const TabContainer: React.FC<ITabContainerProps> = ({
  categories,
  layoutType,
  cardsPerRow,
  showDescriptions,
  openInNewTabDefault,
  onLinkClick,
}) => {
  const categoryNames = Array.from(categories.keys());

  if (categoryNames.length === 0) {
    return null;
  }

  return (
    <div className={styles.tabContainer}>
      <Pivot overflowBehavior="menu">
        {categoryNames.map((category) => (
          <PivotItem key={category} headerText={category} itemKey={category}>
            <div className={styles.tabContent}>
              <LinkLayoutRenderer
                links={categories.get(category) || []}
                layoutType={layoutType}
                cardsPerRow={cardsPerRow}
                showDescriptions={showDescriptions}
                openInNewTabDefault={openInNewTabDefault}
                onLinkClick={onLinkClick}
              />
            </div>
          </PivotItem>
        ))}
      </Pivot>
    </div>
  );
};
