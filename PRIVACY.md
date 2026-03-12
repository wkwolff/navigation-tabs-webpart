# Privacy Policy - Navigation Tabs for Microsoft 365

**Last Updated:** March 12, 2026

## Overview

Navigation Tabs is a SharePoint Framework (SPFx) web part developed by Wolff Creative (W. Kevin Wolff). This privacy policy explains how the solution handles data.

## Data Collection

Navigation Tabs does **not** collect, store, or transmit any personal data outside of your Microsoft 365 tenant. All data remains within your SharePoint environment.

### Data Stored Within Your Tenant

- **Navigation Links**: Link titles, URLs, categories, descriptions, and icons stored in a SharePoint list you create and control.
- **Click Counts**: Anonymous click count integers stored on list items for basic usage analytics. No user-identifying information is tracked.

### Data NOT Collected

- No personal information (names, emails, IP addresses)
- No telemetry or usage analytics sent externally
- No cookies or local storage used for tracking
- No data shared with third parties

## Data Processing

All data processing occurs entirely within the SharePoint Online environment using standard SharePoint REST APIs. The web part:

1. Reads navigation link data from a SharePoint list you select
2. Displays links grouped by category in the web part UI
3. Increments a click counter on the list item when a link is clicked

## Data Control

As a SharePoint site owner, you have full control over all data:

- You create and own the SharePoint list containing navigation links
- You can edit, delete, or export list data at any time using standard SharePoint tools
- Removing the web part does not delete your list data

## Third-Party Services

Navigation Tabs does not integrate with or send data to any third-party services. It operates entirely within the Microsoft 365 / SharePoint Online ecosystem.

## Changes to This Policy

Updates to this privacy policy will be posted to this page with a revised "Last Updated" date.

## Contact

For privacy questions or concerns:

- **GitHub Issues**: [github.com/wkwolff/navigation-tabs-webpart/issues](https://github.com/wkwolff/navigation-tabs-webpart/issues)
- **Developer**: W. Kevin Wolff, Wolff Creative
