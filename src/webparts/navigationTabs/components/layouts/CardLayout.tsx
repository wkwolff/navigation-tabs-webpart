import * as React from 'react';
import { INavigationLink } from '../../models/INavigationLink';
import { LinkIcon } from '../LinkIcon';
import styles from './CardLayout.module.scss';

export interface ICardLayoutProps {
  links: INavigationLink[];
  cardsPerRow: number;
  showDescriptions: boolean;
  openInNewTabDefault: boolean;
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, itemId: number) => void;
}

export const CardLayout: React.FC<ICardLayoutProps> = ({
  links,
  cardsPerRow,
  showDescriptions,
  openInNewTabDefault,
  onLinkClick,
}) => {
  return (
    <div
      className={styles.cardGrid}
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
            className={styles.card}
            onClick={(e) => onLinkClick(e, link.id)}
          >
            <div className={styles.cardIcon}>
              <LinkIcon
                iconUrl={link.iconUrl}
                size={20}
                title={link.title}
              />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardTitle}>{link.title}</div>
              {showDescriptions && link.linkDescription && (
                <div className={styles.cardDescription}>{link.linkDescription}</div>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
};
