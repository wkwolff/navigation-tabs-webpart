import { getSP } from './pnpjsConfig';
import { INavigationLink } from '../models/INavigationLink';

interface ICacheEntry {
  data: INavigationLink[];
  expiry: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache: Map<string, ICacheEntry> = new Map();

export class NavigationLinksService {
  public static async getLinks(listId: string): Promise<INavigationLink[]> {
    if (!listId) {
      return [];
    }

    const now = Date.now();
    const cached = cache.get(listId);
    if (cached && cached.expiry > now) {
      return cached.data;
    }

    const sp = getSP();
    // Use renderListDataAsStream — the standard REST items endpoint does NOT
    // return Thumbnail/Image column data. This API is what SharePoint's own
    // list views use and reliably includes Image field values.
    const result = await sp.web.lists.getById(listId).renderListDataAsStream({
      ViewXml: `<View>
        <Query>
          <Where><Eq><FieldRef Name="IsActive" /><Value Type="Boolean">1</Value></Eq></Where>
          <OrderBy>
            <FieldRef Name="SortOrder" Ascending="TRUE" />
            <FieldRef Name="Title" Ascending="TRUE" />
          </OrderBy>
        </Query>
        <ViewFields>
          <FieldRef Name="ID" />
          <FieldRef Name="Title" />
          <FieldRef Name="LinkURL" />
          <FieldRef Name="Category" />
          <FieldRef Name="LinkDescription" />
          <FieldRef Name="LinkIcon" />
          <FieldRef Name="SortOrder" />
          <FieldRef Name="OpenInNewTab" />
        </ViewFields>
        <RowLimit>500</RowLimit>
      </View>`,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const links: INavigationLink[] = (result.Row || []).map((item: any) => {
      // Derive list path from FileRef (e.g. "/sites/X/Lists/NavLinks/1_.000" → "/sites/X/Lists/NavLinks")
      const listPath = item.FileRef ? item.FileRef.replace(/\/[^/]+$/, '') : '';
      return {
        id: parseInt(item.ID, 10),
        title: item.Title || '',
        linkUrl: item.LinkURL || '',
        category: item.Category || 'General',
        linkDescription: item.LinkDescription || '',
        iconUrl: NavigationLinksService._parseImageField(item.LinkIcon, item.ID, listPath),
        sortOrder: parseInt(item.SortOrder, 10) || 100,
        openInNewTab: item.OpenInNewTab !== '0',
      };
    });

    cache.set(listId, { data: links, expiry: now + CACHE_TTL_MS });
    return links;
  }

  public static async trackClick(listId: string, itemId: number): Promise<void> {
    if (!listId || !itemId) return;

    try {
      const sp = getSP();
      const item = sp.web.lists.getById(listId).items.getById(itemId);
      const current = await item.select('ClickCount')();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const count = (current as any).ClickCount || 0;
      await item.update({ ClickCount: count + 1 });
    } catch (err) {
      // Fire-and-forget: don't block navigation on tracking failure
      console.warn('NavigationTabs: Failed to track click', err);
    }
  }

  public static async createList(listName: string): Promise<string> {
    const sp = getSP();

    // Create a Generic List (template 100)
    const listInfo = await sp.web.lists.add(listName, 'Navigation links for the Navigation Tabs web part', 100);
    const list = sp.web.lists.getById(listInfo.Id);
    const fields = list.fields;

    // LinkURL - Hyperlink field
    await fields.addUrl('LinkURL', {
      Description: 'Destination URL for the link',
      Required: true,
      Group: 'Navigation Tabs',
    });

    // Category - Choice field
    await fields.addChoice('Category', {
      Choices: ['General', 'Resources', 'Tools'],
      Description: 'Tab category for grouping links',
      Required: true,
      Group: 'Navigation Tabs',
    });

    // LinkDescription - Multiline text (plain)
    await fields.addMultilineText('LinkDescription', {
      NumberOfLines: 3,
      RichText: false,
      Description: 'Shown in Card layout',
      Group: 'Navigation Tabs',
    });

    // LinkIcon - Image/Thumbnail field
    await fields.createFieldAsXml(
      '<Field Type="Thumbnail" DisplayName="LinkIcon" StaticName="LinkIcon" Name="LinkIcon" Description="Icon image for the link" Group="Navigation Tabs" />'
    );

    // SortOrder - Number field
    await fields.addNumber('SortOrder', {
      MinimumValue: 0,
      Description: 'Sort order within category. Default: 100',
      Group: 'Navigation Tabs',
    });

    // OpenInNewTab - Boolean field
    await fields.addBoolean('OpenInNewTab', {
      Description: 'Whether the link opens in a new tab',
      Group: 'Navigation Tabs',
    });

    // IsActive - Boolean field
    await fields.addBoolean('IsActive', {
      Description: 'Set to No to hide a link without deleting it',
      Group: 'Navigation Tabs',
    });

    // ClickCount - Number field (hidden from new/edit forms)
    await fields.createFieldAsXml(
      '<Field Type="Number" DisplayName="ClickCount" StaticName="ClickCount" Name="ClickCount" Min="0" Description="Click tracking counter" Group="Navigation Tabs" ShowInNewForm="FALSE" ShowInEditForm="FALSE" />'
    );

    // Add fields to default view
    const defaultView = await list.defaultView();
    const view = list.views.getById(defaultView.Id);
    const viewFields = view.fields;
    const fieldsToAdd = ['LinkURL', 'Category', 'LinkIcon', 'SortOrder', 'OpenInNewTab', 'IsActive', 'ClickCount'];
    for (const fieldName of fieldsToAdd) {
      await viewFields.add(fieldName);
    }

    return listInfo.Id;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static _parseImageField(value: any, itemId?: string, listPath?: string): string {
    if (!value) return '';

    // Value may arrive as a JSON string or an already-parsed object
    let img = value;
    if (typeof value === 'string') {
      try { img = JSON.parse(value); } catch {
        // Plain URL string
        return value.startsWith('http') || value.startsWith('/') ? value : '';
      }
    }

    if (typeof img === 'object') {
      // Full URL available (site assets storage)
      if (img.serverUrl && img.serverRelativeUrl) {
        return img.serverUrl + img.serverRelativeUrl;
      }
      if (img.serverRelativeUrl) return img.serverRelativeUrl;
      // Image stored as list item attachment — construct URL from fileName
      if (img.fileName && itemId && listPath) {
        return `${listPath}/Attachments/${itemId}/${img.fileName}`;
      }
      if (img.Url) return img.Url;
    }

    return '';
  }

  public static clearCache(): void {
    cache.clear();
  }
}
