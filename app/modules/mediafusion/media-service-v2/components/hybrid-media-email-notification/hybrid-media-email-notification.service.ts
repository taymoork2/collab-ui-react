import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

export class HybridMediaEmailNotificationService {

  public serviceId: HybridServiceId = 'squared-fusion-media';

  /* @ngInject */
  constructor(
    private MailValidatorService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) { }

  public saveEmailSubscribers(subscribers) {
    const emailSubscribers = _.map(subscribers, 'text').toString();
    if (emailSubscribers && !this.MailValidatorService.isValidEmailCsv(emailSubscribers)) {
      this.Notification.error('hercules.errors.invalidEmail');
    } else {
      this.ServiceDescriptorService.setEmailSubscribers(this.serviceId, emailSubscribers)
        .then(response => {
          if (response.status === 204) {
            this.Notification.success('hercules.settings.emailNotificationsSavingSuccess');
          } else {
            this.Notification.error('hercules.settings.emailNotificationsSavingError');
          }
        });
    }
  }

}
