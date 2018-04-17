import { ExtensionLengthService } from 'modules/call/settings/shared';
import { CustomerConfigService } from 'modules/call/shared/customer-config-ces/customerConfig.service';
import { Notification } from 'modules/core/notifications';
import { CallSettingsData } from 'modules/call/settings/shared';

class ExtensionPrefixCtrl implements ng.IComponentController {
  public extensionPrefix: string;
  public routingPrefixLength: string;
  public newExtensionLength: string;
  public oldExtensionLength: string;
  public prefixLength: number;
  public close: Function;
  public dismiss: Function;
  public extensionPrefixForm: ng.IFormController;
  public processing: boolean = false;
  public exampleExtensionHelpText: string = '';
  public settingsData: CallSettingsData;
  public countryCode: string;
  private isHI1484: boolean = false;

  /* @ngInject */
  constructor(
    private ExtensionLengthService: ExtensionLengthService,
    private CustomerConfigService: CustomerConfigService,
    private FeatureToggleService,
    private $translate: ng.translate.ITranslateService,
    private Notification: Notification,
    private Orgservice,
  ) {}

  public $onInit(): void {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
    .then(isSupported => {
      this.isHI1484 = isSupported;
      if (isSupported) {
        this.Orgservice.getOrg(_.noop, null, { basicInfo: true }).then( response => {
          this.countryCode = _.get<string>(response, 'data.countryCode', 'US');
        });
      }
    });

    this.prefixLength = _.toSafeInteger(this.newExtensionLength) - _.toSafeInteger(this.oldExtensionLength);
    this.exampleExtensionHelpText = this.getExampleExtension(this.extensionPrefix);
  }

  public onExtensionPrefixChanges() {
    this.exampleExtensionHelpText = this.getExampleExtension(this.extensionPrefix);
  }

  public save(): void {
    this.processing = true;
    if (this.isHI1484) {
      this.CustomerConfigService.createCompanyLevelCustomerConfig(this.routingPrefixLength, this.newExtensionLength, this.countryCode);
    }
    this.ExtensionLengthService.saveExtensionLength(Number(this.newExtensionLength), Number(this.extensionPrefix))
      .then(() => {
        this.Notification.success('serviceSetupModal.extensionLengthSaveSuccess');
        this.close();
      })
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'serviceSetupModal.extensionLengthSaveFail');
      })
      .finally(() => this.processing = false);
  }

  private getExampleExtension(extensionPrefix: string): string {
    return this.$translate.instant('serviceSetupModal.extensionPrefixExample', { prefix: extensionPrefix });
  }

}

export class ExtensionPrefixComponent implements ng.IComponentOptions {
  public controller = ExtensionPrefixCtrl;
  public template = require('modules/call/settings/settings-extension-length/settings-extension-prefix/settings-extension-prefix.component.html');
  public bindings = {
    newExtensionLength: '<',
    oldExtensionLength: '<',
    routingPrefixLength: '<',
    close: '&',
    dismiss: '&',
  };
}
