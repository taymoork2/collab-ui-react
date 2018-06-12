import { RoutingPrefixLengthService } from 'modules/call/settings/shared';
import { CustomerConfigService } from 'modules/call/shared/customer-config-ces/customerConfig.service';
import { Notification } from 'modules/core/notifications';

class RoutingPrefixLengthModalCtrl implements ng.IComponentController {
  public extensionLength: string;
  public routingPrefix: string;
  public currentRoutingPrefix: string;
  public newRoutingPrefixLength: string;
  public oldRoutingPrefixLength: string;
  public prefixLength: number;
  public close: Function;
  public dismiss: Function;
  public routingPrefixForm: ng.IFormController;
  public processing: boolean = false;
  public exampleRoutingPrefixHelpText: string = '';
  public countryCode: string;
  private isHI1484: boolean = false;

  /* @ngInject */
  constructor(
    private RoutingPrefixLengthService: RoutingPrefixLengthService,
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

    this.prefixLength = _.toSafeInteger(this.newRoutingPrefixLength) - (this.oldRoutingPrefixLength ? _.toSafeInteger(this.oldRoutingPrefixLength) : 0);
    this.exampleRoutingPrefixHelpText = this.getExampleRoutingPrefix(this.routingPrefix);
  }

  public onRoutingPrefixChanges() {
    this.exampleRoutingPrefixHelpText = this.getExampleRoutingPrefix(this.routingPrefix);
  }

  public save(): void {
    this.processing = true;
    if (this.isHI1484) {
      this.CustomerConfigService.createCompanyLevelCustomerConfig(this.newRoutingPrefixLength, this.extensionLength, this.countryCode);
    }
    this.RoutingPrefixLengthService.saveRoutingPrefixLength(this.routingPrefix)
      .then(() => {
        this.Notification.success('serviceSetupModal.routingPrefixLength.modal.saveSuccess');
        this.close();
      })
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'serviceSetupModal.routingPrefixLength.modal.saveFail');
      })
      .finally(() => this.processing = false);
  }

  private getExampleRoutingPrefix(routingPrefix: string): string {
    return this.$translate.instant('serviceSetupModal.routingPrefixLength.modal.example', { prefix: routingPrefix, currentPrefix: this.currentRoutingPrefix });
  }

}

export class RoutingPrefixLengthModalComponent implements ng.IComponentOptions {
  public controller = RoutingPrefixLengthModalCtrl;
  public template = require('modules/call/settings/settings-routing-prefix-length/settings-routing-prefix-length-modal/settings-routing-prefix-length-modal.component.html');
  public bindings = {
    currentRoutingPrefix: '<',
    newRoutingPrefixLength: '<',
    oldRoutingPrefixLength: '<',
    extensionLength: '<',
    close: '&',
    dismiss: '&',
  };
}
