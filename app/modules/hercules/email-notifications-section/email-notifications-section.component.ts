import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { AccessibilityService } from 'modules/core/accessibility';

class EmailNotificationsSectionCtrl implements ng.IComponentController {
  public generalSectionTexts = {
    title: 'common.general',
  };
  public localizedAddEmailWatermark = this.$translate.instant('hercules.settings.emailNotificationsWatermark');
  public emailSubscribers: { text: string }[] = [];
  public enableEmailSendingToUser = true;
  public savingEmail = false;
  public defaultWebExSiteOrgLevelOptions: string[] = [];
  public defaultWebExSiteOrgLevel = '';
  public defaultWebExSiteOrgLevelSelectPlaceholder = this.$translate.instant('hercules.settings.defaultWebExSiteOrgLevelSelectPlaceholder');
  public searchable = true;
  public hasCalsvcOneButtonToPushIntervalFeatureToggle = false;
  public oneButtonToPushIntervalOptions = [0, 1, 5, 10, 15];
  public oneButtonToPushIntervalMinutes: number | null = null;
  public setFocus: boolean;

  private serviceId: HybridServiceId;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $translate: ng.translate.ITranslateService,
    private AccessibilityService: AccessibilityService,
    private FeatureToggleService,
    private MailValidatorService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) {}

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { serviceId } = changes;
    if (serviceId && serviceId.currentValue) {
      this.init(serviceId.currentValue);
    }
    if (this.setFocus) {
      this.AccessibilityService.setFocus(this.$element, 'tags-input input');
    }
  }

  private init(serviceId: HybridServiceId) {
    if (serviceId === 'squared-fusion-o365') {
      serviceId = 'squared-fusion-cal';
    }
    this.serviceId = serviceId;
    this.ServiceDescriptorService.getEmailSubscribers(serviceId)
      .then((emailSubscribers: string[]) => {
        this.emailSubscribers = _.map(emailSubscribers, user => ({ text: user }));
      });
    this.ServiceDescriptorService.getOrgSettings()
      .then(orgSettings => {
        this.enableEmailSendingToUser = !orgSettings.calSvcDisableEmailSendingToEndUser;
        if (orgSettings.calSvcDefaultWebExSite !== undefined) {
          this.defaultWebExSiteOrgLevel = orgSettings.calSvcDefaultWebExSite;
        }
        if (orgSettings.bgbIntervalMinutes !== undefined) {
          this.oneButtonToPushIntervalMinutes = orgSettings.bgbIntervalMinutes;
        }
      });
    this.defaultWebExSiteOrgLevelOptions = this.ServiceDescriptorService.getAllWebExSiteOrgLevel();
    this.FeatureToggleService.calsvcOneButtonToPushIntervalGetStatus()
      .then(support => {
        this.hasCalsvcOneButtonToPushIntervalFeatureToggle = support;
      });
  }

  public isCalendarService() {
    return this.serviceId === 'squared-fusion-cal' || this.serviceId === 'squared-fusion-gcal';
  }

  public writeConfig() {
    const emailSubscribers = _.map(this.emailSubscribers, 'text').toString();
    if (emailSubscribers && !this.MailValidatorService.isValidEmailCsv(emailSubscribers)) {
      this.Notification.error('hercules.errors.invalidEmail');
    } else {
      this.savingEmail = true;
      this.ServiceDescriptorService.setEmailSubscribers(this.serviceId, emailSubscribers)
        .then(response => {
          if (response.status === 204) {
            this.Notification.success('hercules.settings.emailNotificationsSavingSuccess');
          } else {
            this.Notification.error('hercules.settings.emailNotificationsSavingError');
          }
          this.savingEmail = false;
        });
    }
  }

  private writeEnableEmailSendingToUser = _.debounce(value => {
    this.ServiceDescriptorService.setDisableEmailSendingToUser(value)
      .then(() => this.Notification.success('hercules.settings.emailUserNotificationsSavingSuccess'))
      .catch(error => {
        this.enableEmailSendingToUser = !this.enableEmailSendingToUser;
        return this.Notification.errorWithTrackingId(error, 'hercules.settings.emailUserNotificationsSavingError');
      });
  }, 2000, {
    leading: true,
    trailing: false,
  });

  public setEnableEmailSendingToUser() {
    this.writeEnableEmailSendingToUser(this.enableEmailSendingToUser);
  }

  public setDefaultWebExSiteOrgLevel() {
    this.ServiceDescriptorService.setDefaultWebExSiteOrgLevel(this.defaultWebExSiteOrgLevel)
      .then(() => this.Notification.success('hercules.settings.defaultWebExSiteOrgLevelSavingSuccess'))
      .catch(error => this.Notification.errorWithTrackingId(error, 'hercules.settings.defaultWebExSiteOrgLevelSavingError'));
  }

  public setOneButtonToPushIntervalMinutes() {
    this.ServiceDescriptorService.setOneButtonToPushIntervalMinutes(this.oneButtonToPushIntervalMinutes)
      .then(() => this.Notification.success('hercules.settings.oneButtonToPushIntervalMinutesSavingSuccess'))
      .catch(error => this.Notification.errorWithTrackingId(error, 'hercules.settings.oneButtonToPushIntervalMinutesSavingError'));
  }
}

export class EmailNotificationsSectionComponent implements ng.IComponentOptions {
  public controller = EmailNotificationsSectionCtrl;
  public template = require('modules/hercules/email-notifications-section/email-notifications-section.html');
  public bindings = {
    serviceId: '<',
    setFocus: '<?',
  };
}
