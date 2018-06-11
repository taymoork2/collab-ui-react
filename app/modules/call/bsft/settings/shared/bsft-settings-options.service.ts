import { IOption } from 'modules/huron/dialing/dialing.service';
import { Notification } from 'modules/core/notifications';

export class BsftSettingsOptions {
  public timeZoneOptions: IOption[];
}

export class BsftSettingsOptionsService {

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private Notification: Notification,
    private ServiceSetup,
  ) {}

  public getOptions(): ng.IPromise<BsftSettingsOptions> {
    const bsftOptions = new BsftSettingsOptions();
    return this.$q.all({
      timeFormatOptions: this.loadTimeZoneOptions().then(timeZoneOptions => bsftOptions.timeZoneOptions = timeZoneOptions),
    }).then(() => {
      return bsftOptions;
    })
      .catch(error => {
        this.Notification.errorWithTrackingId(error);
        return this.$q.reject();
      });
  }

  private loadTimeZoneOptions(): ng.IPromise<IOption[]> {
    return this.ServiceSetup.getTimeZones().then(timezones => {
      return this.ServiceSetup.getTranslatedTimeZones(timezones);
    });
  }

}
