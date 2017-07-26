import { Location, LocationsService } from 'modules/call/locations/shared';
import { LocationCosService, LocationCos } from 'modules/call/shared/cos';
import { Notification } from 'modules/core/notifications';

export class CallLocationSettingsData {
  public location: Location;
  public cosRestrictions: LocationCos;
}

export class CallLocationSettingsService {
  private callLocationSettingsDataCopy: CallLocationSettingsData;
  private errors: string[] = [];

  /* @ngInject */
  constructor(
    private LocationsService: LocationsService,
    private LocationCosService: LocationCosService,
    private Notification: Notification,
    private $q: ng.IQService,
  ) {}

  public get(locationId: string): ng.IPromise<CallLocationSettingsData> {
    const callLocationSettingsData = new CallLocationSettingsData();
    return this.$q.all({
      location: this.getLocation(locationId).then(location => callLocationSettingsData.location = location),
      cosRestrictions: this.getCosRestrictions(locationId).then(cosRestrictions => callLocationSettingsData.cosRestrictions = cosRestrictions),
    }).then(() => {
      this.callLocationSettingsDataCopy = this.cloneSettingsData(callLocationSettingsData);
      return callLocationSettingsData;
    });
  }

  public save(data: CallLocationSettingsData): ng.IPromise<CallLocationSettingsData> {
    if (!_.isEqual(data.location, this.callLocationSettingsDataCopy)) {
      return this.updateLocation(data.location)
        .then(() => this.$q.all(this.createParallelRequests(data)))
        .then(() => this.get(data.location.uuid || ''));
    } else {
      return this.$q.all(this.createParallelRequests(data))
        .then(() => this.get(data.location.uuid || ''));
    }
  }

  private getLocation(uuid: string) {
    return this.LocationsService.getLocation(uuid)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'locations.getFailed'));
        return this.rejectAndNotifyPossibleErrors();
      });
  }

  private updateLocation(data: Location): ng.IPromise<void> {
    return this.LocationsService.updateLocation(data)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'locations.updateFailed'));
        return this.rejectAndNotifyPossibleErrors();
      });
  }

  private createParallelRequests(data: CallLocationSettingsData): ng.IPromise<any>[] {
    const promises: ng.IPromise<any>[] = [];
    if (!_.isEqual(data.cosRestrictions, this.callLocationSettingsDataCopy.cosRestrictions)) {
      promises.push(this.saveCosRestrictions(data.location.uuid || '', data.cosRestrictions));
    }
    return promises;
  }

  private getCosRestrictions(locationId: string): ng.IPromise<LocationCos> {
    return this.LocationCosService.getLocationCos(locationId)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'locations.getLocationCosFailed'));
        return this.rejectAndNotifyPossibleErrors();
      });
  }

  private saveCosRestrictions(locationId: string, cosRestrictions: LocationCos): ng.IPromise<string | void> {
    const promises: ng.IPromise<string | void>[] = [];
    _.forEach(cosRestrictions.location, locationRestriction => {
      if (locationRestriction.uuid) {
        promises.push(this.LocationCosService.updateLocationCos(locationId, locationRestriction.uuid, locationRestriction));
      } else {
        promises.push(this.LocationCosService.createLocationCos(locationId, locationRestriction));
      }
    });

    return this.$q.all(promises)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'locations.updateLocationCosFailed'));
        return this.rejectAndNotifyPossibleErrors();
      });
  }

  public getOriginalConfig(): CallLocationSettingsData {
    return this.cloneSettingsData(this.callLocationSettingsDataCopy);
  }

  public matchesOriginalConfig(callLocationSettingsData: CallLocationSettingsData): boolean {
    return _.isEqual(callLocationSettingsData, this.callLocationSettingsDataCopy);
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
