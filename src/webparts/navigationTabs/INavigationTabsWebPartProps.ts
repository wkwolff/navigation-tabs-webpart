import { LayoutType } from './models/LayoutType';

export interface INavigationTabsWebPartProps {
  listId: string;
  layoutType: LayoutType;
  cardsPerRow: number;
  showDescriptions: boolean;
  openInNewTabDefault: boolean;
  newListName: string;
  categoryOrder: string[];
}
