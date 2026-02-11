import * as React from 'react';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import * as strings from 'NavigationTabsWebPartStrings';
import { INavigationLink } from '../models/INavigationLink';
import { LayoutType } from '../models/LayoutType';
import { NavigationLinksService } from '../services/NavigationLinksService';
import { NoConfiguration } from './NoConfiguration';
import { TabContainer } from './TabContainer';
import styles from './NavigationTabs.module.scss';

export interface INavigationTabsProps {
  listId: string;
  layoutType: LayoutType;
  cardsPerRow: number;
  showDescriptions: boolean;
  openInNewTabDefault: boolean;
  categoryOrder: string[];
  onCategoriesDiscovered: (categories: string[]) => void;
}

interface INavigationTabsState {
  links: INavigationLink[];
  loading: boolean;
  error: string | undefined;
}

export class NavigationTabs extends React.Component<INavigationTabsProps, INavigationTabsState> {

  constructor(props: INavigationTabsProps) {
    super(props);
    this.state = {
      links: [],
      loading: false,
      error: undefined,
    };
  }

  public componentDidMount(): void {
    if (this.props.listId) {
      this._fetchLinks();
    }
  }

  public componentDidUpdate(prevProps: INavigationTabsProps): void {
    if (prevProps.listId !== this.props.listId) {
      this._fetchLinks();
    }
  }

  private async _fetchLinks(): Promise<void> {
    if (!this.props.listId) {
      this.setState({ links: [], loading: false, error: undefined });
      return;
    }

    this.setState({ loading: true, error: undefined });
    try {
      const links = await NavigationLinksService.getLinks(this.props.listId);
      this.setState({ links, loading: false });
    } catch (err) {
      console.error('NavigationTabs: Error loading links', err);
      this.setState({ links: [], loading: false, error: strings.ErrorMessage });
    }
  }

  private _handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, itemId: number): void => {
    const anchor = e.currentTarget;
    const isNewTab = anchor.target === '_blank';

    if (!isNewTab) {
      // Same-tab: prevent immediate navigation so the tracking requests complete
      e.preventDefault();
      const href = anchor.href;
      NavigationLinksService.trackClick(this.props.listId, itemId)
        .then(() => { window.location.href = href; })
        .catch(() => { window.location.href = href; });
    } else {
      // New tab: page stays open, fire-and-forget is fine
      NavigationLinksService.trackClick(this.props.listId, itemId);
    }
  }

  private _groupByCategory(links: INavigationLink[], categoryOrder: string[]): Map<string, INavigationLink[]> {
    // First pass: group all links by category (unordered)
    const temp = new Map<string, INavigationLink[]>();
    for (const link of links) {
      const category = link.category || 'General';
      if (!temp.has(category)) {
        temp.set(category, []);
      }
      temp.get(category)!.push(link);
    }

    // Second pass: build ordered Map
    const ordered = new Map<string, INavigationLink[]>();

    // Add categories in stored order first
    for (const cat of categoryOrder) {
      if (temp.has(cat)) {
        ordered.set(cat, temp.get(cat)!);
        temp.delete(cat);
      }
    }

    // Append any remaining categories not in the stored order
    temp.forEach((val, key) => {
      ordered.set(key, val);
    });

    return ordered;
  }

  public render(): React.ReactElement<INavigationTabsProps> {
    const { listId, layoutType, cardsPerRow, showDescriptions, openInNewTabDefault } = this.props;
    const { links, loading, error } = this.state;

    if (!listId) {
      return <NoConfiguration />;
    }

    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <Spinner size={SpinnerSize.large} label={strings.LoadingMessage} />
        </div>
      );
    }

    if (error) {
      return <div className={styles.errorContainer}>{error}</div>;
    }

    if (links.length === 0) {
      return <div className={styles.emptyContainer}>{strings.EmptyMessage}</div>;
    }

    const categories = this._groupByCategory(links, this.props.categoryOrder || []);

    // Report discovered categories to the web part for the property pane order control
    const categoryNames = Array.from(categories.keys());
    this.props.onCategoriesDiscovered(categoryNames);

    return (
      <div className={styles.navigationTabs}>
        <TabContainer
          categories={categories}
          layoutType={layoutType}
          cardsPerRow={cardsPerRow}
          showDescriptions={showDescriptions}
          openInNewTabDefault={openInNewTabDefault}
          onLinkClick={this._handleLinkClick}
        />
      </div>
    );
  }
}
