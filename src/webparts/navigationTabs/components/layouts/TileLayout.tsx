import * as React from 'react';
import { INavigationLink } from '../../models/INavigationLink';
import { LinkIcon } from '../LinkIcon';
import styles from './TileLayout.module.scss';

export interface ITileLayoutProps {
  links: INavigationLink[];
  cardsPerRow: number;
  openInNewTabDefault: boolean;
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, itemId: number) => void;
}

export const TileLayout: React.FC<ITileLayoutProps> = ({ links, cardsPerRow, openInNewTabDefault, onLinkClick }) => {
  return (
    <div
      className={styles.tileGrid}
      style={{ '--cards-per-row': cardsPerRow } as React.CSSProperties}
    >
      {links.map((link) => {
        const opensNew = link.openInNewTab !== undefined ? link.openInNewTab : openInNewTabDefault;
        return (
          <a
            key={link.id}
            href={link.linkUrl}
            target={opensNew ? '_blank' : '_self'}
            rel={opensNew ? 'noopener noreferrer' : undefined}
            className={styles.tile}
            onClick={(e) => onLinkClick(e, link.id)}
          >
            <div className={styles.tileIcon}>
              <LinkIcon
                iconUrl={link.iconUrl}
                size={48}
                title={link.title}
              />
            </div>
            <div className={styles.tileTitle}>{link.title}</div>
          </a>
        );
      })}
    </div>
  );
};
