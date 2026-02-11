import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFI, SPFx } from '@pnp/sp';
import { LogLevel, PnPLogging } from '@pnp/logging';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import '@pnp/sp/folders';
import '@pnp/sp/views';

let _sp: SPFI | undefined;

export const getSP = (context?: WebPartContext): SPFI => {
  if (context) {
    _sp = spfi().using(SPFx(context)).using(PnPLogging(LogLevel.Warning));
  }
  if (!_sp) {
    throw new Error('PnPjs not initialized. Call getSP(context) first.');
  }
  return _sp;
};
