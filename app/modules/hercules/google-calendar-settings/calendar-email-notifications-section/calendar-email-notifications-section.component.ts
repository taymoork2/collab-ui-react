import { Notification } from 'modules/core/notifications';

class CalendarEmailNotificationsSectionCtrl implements ng.IComponentController {
  public generalSectionTexts = {
    title: 'common.general',
  };
  public localizedAddEmailWatermark = this.$translate.instant('hercules.settings.emailNotificationsWatermark');
  public emailSubscribers: {}[] = [];
  public enableEmailSendingToUser = false;
  public savingEmail = false;
  public hasCalsvcOneButtonToPushIntervalFeatureToggle = false;
  public oneButtonToPushIntervalOptions = [0, 5, 10 , 15];
  public oneButtonToPushIntervalMinutes: number | null = null;

  private serviceId: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService,
    private MailValidatorService,
    private Notification: Notification,
    private ServiceDescriptor,
  ) {}

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject}) {
    const { serviceId } = changes;
    if (serviceId && serviceId.currentValue) {
      this.init(serviceId.currentValue);
    }
  }

  private init(serviceId) {
    this.serviceId = serviceId;
    this.ServiceDescriptor.getEmailSubscribers(serviceId)
      .then((emailSubscribers: string[]) => {
        this.emailSubscribers = _.map(emailSubscribers, user => ({ text: user }));
      });
    this.FeatureToggleService.calsvcOneButtonToPushIntervalGetStatus()
      .then(support => {
        this.hasCalsvcOneButtonToPushIntervalFeatureToggle = support;
        if (support) {
          this.ServiceDescriptor.getOrgSettings()
            .then(orgSettings => {
              this.enableEmailSendingToUser = !orgSettings.calSvcDisableEmailSendingToEndUser;
              if (orgSettings.bgbIntervalMinutes === undefined) {
                this.oneButtonToPushIntervalMinutes = 5;
                this.setOneButtonToPushIntervalMinutes();
              } else {
                this.oneButtonToPushIntervalMinutes = orgSettings.bgbIntervalMinutes;
              }
            });
        }
      });
  }

  public writeConfig() {
    const emailSubscribers = _.map(this.emailSubscribers, 'text').toString();
    if (emailSubscribers && !this.MailValidatorService.isValidEmailCsv(emailSubscribers)) {
      this.Notification.error('hercules.errors.invalidEmail');
    } else {
      this.savingEmail = true;
      this.ServiceDescriptor.setEmailSubscribers(this.serviceId, emailSubscribers)
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
    this.ServiceDescriptor.setDisableEmailSendingToUser(value)
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

  public setOneButtonToPushIntervalMinutes = function () {
    this.ServiceDescriptor.setOneButtonToPushIntervalMinutes(this.oneButtonToPushIntervalMinutes)
      .then(() => this.Notification.success('hercules.settings.oneButtonToPushIntervalMinutesSavingSuccess'))
      .catch(error => this.Notification.errorWithTrackingId(error, 'hercules.settings.oneButtonToPushIntervalMinutesSavingError'));
  };
}

export class CalendarEmailNotificationsSectionComponent implements ng.IComponentOptions {
  public controller = CalendarEmailNotificationsSectionCtrl;
  public templateUrl = 'modules/hercules/google-calendar-settings/calendar-email-notifications-section/calendar-email-notifications-section.html';
  public bindings = {
    serviceId: '<',
  };
}
