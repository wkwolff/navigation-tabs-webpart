declare interface INavigationTabsWebPartStrings {
  PropertyPaneDescription: string;
  DataGroupName: string;
  LayoutGroupName: string;
  ListFieldLabel: string;
  LayoutTypeFieldLabel: string;
  CardsPerRowFieldLabel: string;
  ShowDescriptionsFieldLabel: string;
  OpenInNewTabFieldLabel: string;
  LayoutCardLabel: string;
  LayoutCompactLabel: string;
  LayoutTileLabel: string;
  NoListSelectedMessage: string;
  NoListSelectedDescription: string;
  LoadingMessage: string;
  ErrorMessage: string;
  EmptyMessage: string;
  EditListLinkText: string;
  ListGeneratorGroupName: string;
  NewListNameFieldLabel: string;
  NewListNameDescription: string;
  NewListNamePlaceholder: string;
  CreateListButtonLabel: string;
  CreatingListButtonLabel: string;
  TabOrderGroupName: string;
  TabOrderFieldLabel: string;
}

declare module 'NavigationTabsWebPartStrings' {
  const strings: INavigationTabsWebPartStrings;
  export = strings;
}
