import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneButton,
  PropertyPaneButtonType,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';
import { PropertyFieldOrder } from '@pnp/spfx-property-controls/lib/PropertyFieldOrder';

import * as strings from 'NavigationTabsWebPartStrings';
import { NavigationTabs, INavigationTabsProps } from './components/NavigationTabs';
import { INavigationTabsWebPartProps } from './INavigationTabsWebPartProps';
import { getSP } from './services/pnpjsConfig';
import { NavigationLinksService } from './services/NavigationLinksService';

export default class NavigationTabsWebPart extends BaseClientSideWebPart<INavigationTabsWebPartProps> {

  private _isCreatingList: boolean = false;
  private _listUrl: string = '';
  private _disposed: boolean = false;
  private _discoveredCategories: string[] = [];

  public onInit(): Promise<void> {
    getSP(this.context);
    return super.onInit().then(() => this._resolveListUrl());
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: unknown, newValue: unknown): void {
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    if (propertyPath === 'listId' && oldValue !== newValue) {
      this.properties.categoryOrder = [];
      this._discoveredCategories = [];
      this._resolveListUrl();
      this._safeRefreshPane();
      this.render();
    }
  }

  private _onCategoriesDiscovered = (categories: string[]): void => {
    // Avoid unnecessary updates if categories haven't changed
    const key = categories.join('\n');
    const prevKey = this._discoveredCategories.join('\n');
    if (key === prevKey) return;

    this._discoveredCategories = categories;

    // Reconcile stored order with actual categories
    const currentOrder = this.properties.categoryOrder || [];
    const actualSet = new Set(categories);

    // Keep existing ordered items that still exist
    const reconciled = currentOrder.filter((c: string) => actualSet.has(c));

    // Append any new categories not in the stored order
    for (const cat of categories) {
      if (reconciled.indexOf(cat) === -1) {
        reconciled.push(cat);
      }
    }

    this.properties.categoryOrder = reconciled;
    this._safeRefreshPane();
  }

  private _resolveListUrl(): void {
    if (!this.properties.listId) {
      this._listUrl = '';
      return;
    }
    const sp = getSP();
    sp.web.lists.getById(this.properties.listId).rootFolder.select('ServerRelativeUrl')()
      .then((folder: { ServerRelativeUrl: string }) => {
        this._listUrl = folder.ServerRelativeUrl;
        this._safeRefreshPane();
      })
      .catch(() => {
        this._listUrl = '';
      });
  }

  public render(): void {
    const element: React.ReactElement<INavigationTabsProps> = React.createElement(
      NavigationTabs,
      {
        listId: this.properties.listId,
        layoutType: this.properties.layoutType || 'card',
        cardsPerRow: this.properties.cardsPerRow || 3,
        showDescriptions: this.properties.showDescriptions !== false,
        openInNewTabDefault: this.properties.openInNewTabDefault !== false,
        categoryOrder: this.properties.categoryOrder || [],
        onCategoriesDiscovered: this._onCategoriesDiscovered,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    this._disposed = true;
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  private _safeRefreshPane(): void {
    if (this._disposed) return;
    try {
      if (this.context.propertyPane.isRenderedByWebPart()) {
        this.context.propertyPane.refresh();
      }
    } catch {
      // Ignore — property pane not available (e.g. during HMR)
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private _onCreateList = (): void => {
    const listName = this.properties.newListName;
    if (!listName || !listName.trim()) {
      alert('Please enter a name for the new list.');
      return;
    }

    if (this._isCreatingList) return;
    this._isCreatingList = true;
    this._safeRefreshPane();

    NavigationLinksService.createList(listName.trim())
      .then((listId) => {
        this.properties.listId = listId;
        this.properties.newListName = '';
        this._isCreatingList = false;
        this._resolveListUrl();
        this.render();
        alert(`List "${listName.trim()}" created successfully!`);
        // Close pane after alert is dismissed, then reopen with real delay
        try { this.context.propertyPane.close(); } catch { /* ignore */ }
        setTimeout(() => {
          try { this.context.propertyPane.open(); } catch { /* ignore */ }
        }, 600);
      })
      .catch((err) => {
        this._isCreatingList = false;
        this._safeRefreshPane();
        console.error('NavigationTabs: Failed to create list', err);
        const errMsg = String(err.message || err);
        if (errMsg.indexOf('already exists') !== -1) {
          alert(`A list named "${listName.trim()}" already exists on this site. Please choose a different name or select the existing list from the dropdown above.`);
        } else {
          alert(`Failed to create list: ${errMsg}`);
        }
      });
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const hasList = !!this.properties.listId;

    const listPickerGroup = {
      groupName: strings.DataGroupName,
      groupFields: [
        PropertyFieldListPicker('listId', {
          label: strings.ListFieldLabel,
          selectedList: this.properties.listId,
          includeHidden: false,
          orderBy: PropertyFieldListPickerOrderBy.Title,
          onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
          properties: this.properties,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          context: this.context as any,
          key: 'listPickerFieldId',
          disabled: false,
        }),
      ],
    };

    if (!hasList) {
      // Setup mode: list picker + list generator, no layout settings
      return {
        pages: [
          {
            header: {
              description: strings.PropertyPaneDescription,
            },
            groups: [
              listPickerGroup,
              {
                groupName: strings.ListGeneratorGroupName,
                groupFields: [
                  PropertyPaneTextField('newListName', {
                    label: strings.NewListNameFieldLabel,
                    description: strings.NewListNameDescription,
                    placeholder: strings.NewListNamePlaceholder,
                  }),
                  PropertyPaneButton('createList', {
                    text: this._isCreatingList ? strings.CreatingListButtonLabel : strings.CreateListButtonLabel,
                    buttonType: PropertyPaneButtonType.Primary,
                    icon: 'Add',
                    disabled: this._isCreatingList,
                    onClick: this._onCreateList,
                  }),
                ],
              },
            ],
          },
        ],
      };
    }

    // Configured mode: list picker + edit button + layout settings
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            listPickerGroup,
            {
              groupFields: [
                PropertyPaneButton('editListLink', {
                  text: strings.EditListLinkText,
                  buttonType: PropertyPaneButtonType.Command,
                  icon: 'Edit',
                  onClick: () => {
                    const url = this._listUrl
                      ? `${window.location.origin}${this._listUrl}`
                      : `${this.context.pageContext.web.absoluteUrl}/_layouts/15/listedit.aspx?List=%7B${this.properties.listId}%7D`;
                    window.open(url, '_blank');
                    return undefined;
                  },
                }),
              ],
            },
            {
              groupName: strings.TabOrderGroupName,
              groupFields: [
                PropertyFieldOrder('categoryOrder', {
                  key: 'categoryOrderFieldId',
                  label: strings.TabOrderFieldLabel,
                  items: this.properties.categoryOrder || [],
                  properties: this.properties,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                }),
              ],
            },
            {
              groupName: strings.LayoutGroupName,
              groupFields: [
                PropertyPaneDropdown('layoutType', {
                  label: strings.LayoutTypeFieldLabel,
                  options: [
                    { key: 'card', text: strings.LayoutCardLabel },
                    { key: 'compact', text: strings.LayoutCompactLabel },
                    { key: 'tile', text: strings.LayoutTileLabel },
                  ],
                  selectedKey: this.properties.layoutType || 'card',
                }),
                PropertyPaneSlider('cardsPerRow', {
                  label: strings.CardsPerRowFieldLabel,
                  min: 2,
                  max: 6,
                  value: this.properties.cardsPerRow || 3,
                  step: 1,
                }),
                PropertyPaneToggle('showDescriptions', {
                  label: strings.ShowDescriptionsFieldLabel,
                  checked: this.properties.showDescriptions !== false,
                }),
                PropertyPaneToggle('openInNewTabDefault', {
                  label: strings.OpenInNewTabFieldLabel,
                  checked: this.properties.openInNewTabDefault !== false,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
