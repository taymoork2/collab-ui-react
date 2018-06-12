import { Notification } from 'modules/core/notifications';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { OrgSettingsService } from 'modules/core/shared/org-settings/org-settings.service';
import { ProPackSettingSection } from '../proPackSettingSection';

export class ExternalCommunicationSettingController {

  private _isBlockExternalCommunication = false;
  public isBlockExternalCommunicationSettingLoaded = false;
  public isProPackPurchased = false;

  private orgId: string;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private Authinfo,
    private Notification: Notification,
    private OrgSettingsService: OrgSettingsService,
    private ProPackService: ProPackService,
  ) {
  }

  public $onInit() {
    this.orgId = this.Authinfo.getOrgId();
    this.loadSetting();
  }

  private loadSetting() {
    const promises = {
      blockExternalCommunication: this.OrgSettingsService.getBlockExternalCommunications(this.orgId),
      proPackPurchased: this.ProPackService.hasProPackPurchasedOrNotEnabled(),
    };

    this.$q.all(promises)
      .then((response) => {
        this.blockExternalCommunicationSettingLoaded(response.blockExternalCommunication);
        this.isProPackPurchased = response.proPackPurchased;
      })
      .catch(_.noop);
  }

  private blockExternalCommunicationSettingLoaded(blockExternalCommunication: boolean) {
    this._isBlockExternalCommunication = blockExternalCommunication;
    this.isBlockExternalCommunicationSettingLoaded = true;
  }

  public get isBlockExternalCommunication(): boolean {
    return this._isBlockExternalCommunication;
  }

  public set isBlockExternalCommunication(value: boolean) {
    this._isBlockExternalCommunication = value;
    this.updateBlockExternalCommunicationSetting(value);
  }

  public updateBlockExternalCommunicationSetting(value: boolean): void {
    if (!this.isBlockExternalCommunicationSettingLoaded) {
      return;
    }

    this.OrgSettingsService.setBlockExternalCommunications(this.orgId, value)
      .then(() => {
        this.Notification.success('firstTimeWizard.messengerExternalCommunicationSuccess');
      })
      .catch((response) => {
        this.Notification.errorWithTrackingId(response, 'firstTimeWizard.messengerExternalCommunicationError');
        this._isBlockExternalCommunication = !value;
      });
  }
}

export class ExternalCommunicationSetting extends ProPackSettingSection {

  /* @ngInject */
  public constructor(proPackPurchased: boolean) {
    super('externalCommunication', proPackPurchased);
  }
}

export class ExternalCommunicationSettingComponent implements ng.IComponentOptions {
  public controller = ExternalCommunicationSettingController;
  public template = require('./external-communication-setting.html');
}
