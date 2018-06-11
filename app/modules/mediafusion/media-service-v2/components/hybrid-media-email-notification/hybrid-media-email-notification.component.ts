import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

class HybridMediaEmailNotificationCtrl implements ng.IComponentController {
  public generalSectionTexts = {
    title: 'common.general',
  };
  public localizedAddEmailWatermark = this.$translate.instant('hercules.settings.emailNotificationsWatermark');
  public emailSubscribers: { text: string }[] = [];
  private onEmailUpdate: Function;
  public serviceId: HybridServiceId = 'squared-fusion-media';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) {}

  public $onInit() {
    this.ServiceDescriptorService.getEmailSubscribers(this.serviceId)
      .then((emailSubscribers: string[]) => {
        this.emailSubscribers = _.map(emailSubscribers, user => ({ text: user }));
      });
  }

  public processConfig() {
    const subscribers = this.emailSubscribers;
    this.emailSubscribers = subscribers;
    if (_.isFunction(this.onEmailUpdate)) {
      this.onEmailUpdate({ response: { emailSubscribers: this.emailSubscribers } });
    }
  }

}

export class HybridMediaEmailNotificationComponent implements ng.IComponentOptions {
  public controller = HybridMediaEmailNotificationCtrl;
  public template = require('modules/mediafusion/media-service-v2/components/hybrid-media-email-notification/hybrid-media-email-notification.tpl.html');
  public bindings = {
    onEmailUpdate: '&?',
  };
}
