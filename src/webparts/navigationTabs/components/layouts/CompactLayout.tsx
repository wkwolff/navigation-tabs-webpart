import * as React from 'react';
import { INavigationLink } from '../../models/INavigationLink';
import { LinkIcon } from '../LinkIcon';
import styles from './CompactLayout.module.scss';

export interface ICompactLayoutProps {
  links: INavigationLink[];
  openInNewTabDefault: boolean;
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, itemId: number) => void;
}

export const CompactLayout: React.FC<ICompactLayoutProps> = ({ links, openInNewTabDefault, onLinkClick }) => {
  return (
    <div className={styles.compactList}>
      {links.map((link) => {
        const opensNew = link.openInNewTab !== undefined ? link.openInNewTab : openInNewTabDefault;
        return (
          <a
            key={link.id}
            href={link.linkUrl}
            target={opensNew ? '_blank' : '_self'}
            rel={opensNew ? 'noopener noreferrer' : undefined}
            className={styles.compactLink}
            onClick={(e) => onLinkClick(e, link.id)}
          >
            <span className={styles.compactIcon}>
              <LinkIcon
                iconUrl={link.iconUrl}
                size={16}
                title={link.title}
              />
            </span>
            <span className={styles.compactTitle}>{link.title}</span>
          </a>
        );
      })}
    </div>
  );
};
