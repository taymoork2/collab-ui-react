import { ILocation, LocationsService } from 'modules/call/locations/shared';
import { Notification } from 'modules/core/notifications';

export class CallLocationSettingsData {
  public location: ILocation;
}

export class CallLocationSettingsService {
  private callLocationSettingsDataCopy: CallLocationSettingsData;
  private errors: string[] = [];

  /* @ngInject */
  constructor(
    private LocationsService: LocationsService,
    private Notification: Notification,
    private $q: ng.IQService,
  ) {}

  public get(locationId: string): ng.IPromise<CallLocationSettingsData> {
    const callLocationSettingsData = new CallLocationSettingsData();
    return this.$q.all({
      location: this.getLocation(locationId).then(location => callLocationSettingsData.location = location),
    }).then(() => {
      this.rejectAndNotifyPossibleErrors();
      this.callLocationSettingsDataCopy = this.cloneSettingsData(callLocationSettingsData);
      return callLocationSettingsData;
    });
  }

  private getLocation(uuid: string) {
    return this.LocationsService.getLocation(uuid)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.customerGetError'));
        return this.$q.reject();
      });
  }

  private cloneSettingsData(settingsData: CallLocationSettingsData): CallLocationSettingsData {
    return _.cloneDeep(settingsData);
  }

  private rejectAndNotifyPossibleErrors(): void | ng.IPromise<any> {
    if (this.errors.length > 0) {
      this.Notification.notify(this.errors, 'error');
      return this.$q.reject();
    }
  }
}
