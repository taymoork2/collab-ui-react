import { Notification } from 'modules/core/notifications';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { OrgSettingsService } from 'modules/core/shared/org-settings/org-settings.service';
import { ProPackSettingSection } from '../proPackSettingSection';

export class SecuritySetting extends ProPackSettingSection {

  /* @ngInject */
  public constructor(proPackPurchased: boolean) {
    super('security', proPackPurchased);
    this.subsectionDescription = '';
  }
}

export class SecuritySettingController implements ng.IComponentController {

  private _isSparkClientSecurityEnabled = false;
  public isSparkClientSecurityLoaded = false;
  public isProPackPurchased = false;

  private orgId: string;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private Authinfo,
    private Notification: Notification,
    private OrgSettingsService: OrgSettingsService,
    private ProPackService: ProPackService,
  ) {}

  public $onInit() {
    this.orgId = this.Authinfo.getOrgId();
    this.loadSetting();
  }

  private loadSetting() {
    const promises = {
      security: this.OrgSettingsService.getClientSecurityPolicy(this.orgId),
      proPackPurchased: this.ProPackService.hasProPackPurchasedOrNotEnabled(),
    };

    this.$q.all(promises)
      .then((response) => {
        this.appSecuritySettingLoaded(response.security);
        this.isProPackPurchased = response.proPackPurchased;
      }).catch(_.noop);
  }

  private appSecuritySettingLoaded(isEnabled: boolean): void {
    this._isSparkClientSecurityEnabled = isEnabled;
    this.isSparkClientSecurityLoaded = true;
  }

  get isSparkClientSecurityEnabled(): boolean {
    return this._isSparkClientSecurityEnabled;
  }

  set isSparkClientSecurityEnabled(value: boolean) {
    this._isSparkClientSecurityEnabled = value;
    this.updateSparkClientSecuritySetting(value);
  }

  public updateSparkClientSecuritySetting(value: boolean): void {
    if (!this.isSparkClientSecurityLoaded) {
      return;
    }

    this.OrgSettingsService.setClientSecurityPolicy(this.orgId, value)
      .then(() => {
        this.Notification.success('firstTimeWizard.messengerAppSecuritySuccess');
      })
      .catch((response) => {
        this.Notification.errorWithTrackingId(response, 'firstTimeWizard.messengerAppSecurityError');
        this._isSparkClientSecurityEnabled = !value;
      });
  }
}

export class SecuritySettingComponent implements ng.IComponentOptions {
  public controller = SecuritySettingController;
  public template = require('./securitySetting.tpl.html');
}
