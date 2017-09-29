import { IWebExSite, IExistingWebExTrialSite } from './meeting-settings.interface';

export class WebExSite {
  public centerType: string;
  public quantity: number;
  public siteUrl: string;
  public audioPackageDisplay?: string;
  public timezone?: string | object;
  public setupType?: string;

  constructor({
    centerType,
    quantity,
    siteUrl,
    timezone,
    setupType,
  }: IWebExSite) {
    this.centerType = centerType;
    this.quantity = quantity || 0;
    this.siteUrl = siteUrl;
    this.timezone = timezone;
    this.setupType = setupType;

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
  }: IExistingWebExTrialSite) {
    super({
      centerType,
      quantity,
      siteUrl,
      timezone,
      setupType,
    });
    if (keepExistingSite) {
      this.keepExistingSite = true;
    } else {
      delete this.keepExistingSite;
    }
  }
}
