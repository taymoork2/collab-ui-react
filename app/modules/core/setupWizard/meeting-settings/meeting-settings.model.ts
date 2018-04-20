import { IWebExSite, IExistingWebExTrialSite } from './meeting-settings.interface';

export class WebExSite {
  public centerType: string;
  public quantity: number;
  public siteUrl: string;
  public audioPackageDisplay?: string;
  public timezone?: string | object;
  public setupType?: string;
  public isCIUnifiedSite?: boolean;

  constructor({
    centerType,
    quantity,
    siteUrl,
    timezone,
    setupType,
    isCIUnifiedSite,
  }: IWebExSite) {
    this.centerType = centerType;
    this.quantity = quantity || 0;
    this.siteUrl = siteUrl;
    this.timezone = timezone;
    this.setupType = setupType;
    this.isCIUnifiedSite = isCIUnifiedSite;
    if (!setupType) {
      delete this.setupType;
    }
  }
}

export class ExistingWebExSite extends WebExSite {
  public keepExistingSite: boolean;
  constructor({
    centerType,
    quantity,
    siteUrl,
    timezone,
    setupType,
    keepExistingSite,
    isCIUnifiedSite,
  }: IExistingWebExTrialSite) {
    super({
      centerType,
      quantity,
      siteUrl,
      timezone,
      setupType,
      isCIUnifiedSite,
    });
    if (keepExistingSite) {
      this.keepExistingSite = true;
    } else {
      delete this.keepExistingSite;
    }
  }
}
