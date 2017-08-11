import { Location, LocationsService } from 'modules/call/locations/shared';
import { LocationCosService, LocationCos } from 'modules/call/shared/cos';
import { InternalNumberRange, InternalNumberRangeService } from 'modules/call/shared/internal-number-range';
import { CustomerVoice, HuronCustomerService } from 'modules/huron/customer';
import { ExtensionLengthService } from 'modules/call/settings/shared/extension-length.service';
import { Notification } from 'modules/core/notifications';

export class CallLocationSettingsData {
  public location: Location;
  public internalNumberRanges: InternalNumberRange[];
  public cosRestrictions: LocationCos;
  public customerVoice: CustomerVoice;
}

export class CallLocationSettingsService {
  private callLocationSettingsDataCopy: CallLocationSettingsData;
  private errors: string[] = [];

  /* @ngInject */
  constructor(
    private LocationsService: LocationsService,
    private LocationCosService: LocationCosService,
    private InternalNumberRangeService: InternalNumberRangeService,
    private HuronCustomerService: HuronCustomerService,
    private Notification: Notification,
    private $q: ng.IQService,
    private ExtensionLengthService: ExtensionLengthService,
  ) {}

  public get(locationId: string): ng.IPromise<CallLocationSettingsData> {
    const callLocationSettingsData = new CallLocationSettingsData();
    return this.$q.all({
      location: this.getLocation(locationId).then(location => callLocationSettingsData.location = location),
      internalNumberRanges: this.getInternalNumberRanges(locationId).then(internalNumberRanges => callLocationSettingsData.internalNumberRanges = internalNumberRanges),
      cosRestrictions: this.getCosRestrictions(locationId).then(cosRestrictions => callLocationSettingsData.cosRestrictions = cosRestrictions),
      customerVoice: this.getCustomerVoice().then(customerVoice => callLocationSettingsData.customerVoice = customerVoice),
    }).then(() => {
      this.callLocationSettingsDataCopy = this.cloneSettingsData(callLocationSettingsData);
      return callLocationSettingsData;
    });
  }

  public save(data: CallLocationSettingsData): ng.IPromise<CallLocationSettingsData> {
    if (!data.location.uuid) {
      return this.createLocation(data.location)
        .then(locationId => data.location.uuid = locationId)
        .then(() => this.saveExtensionLength(data.customerVoice.extensionLength, null))
        .then(() => this.$q.all(this.createParallelRequests(data, true)))
        .then(() => this.get(data.location.uuid || ''));
    } else {
      if (!_.isEqual(data.location, this.callLocationSettingsDataCopy.location)) {
        return this.updateLocation(data.location)
          .then(() => this.$q.all(this.createParallelRequests(data, false)))
          .then(() => this.get(data.location.uuid || ''));
      } else {
        return this.$q.all(this.createParallelRequests(data, false))
          .then(() => this.get(data.location.uuid || ''));
      }
    }
  }

  private getLocation(locationId: string) {
    if (locationId) {
      return this.LocationsService.getLocation(locationId)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'locations.getFailed'));
          return this.rejectAndNotifyPossibleErrors();
        });
    } else {
      return this.$q.resolve(new Location());
    }
  }

  private createLocation(data: Location): ng.IPromise<string> {
    return this.LocationsService.createLocation(data)
      .then(locationHeader => _.last(locationHeader.split('/')))
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'locations.createFailed'));
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

  private createParallelRequests(data: CallLocationSettingsData, ftsw: boolean): ng.IPromise<any>[] {
    const promises: ng.IPromise<any>[] = [];
    if (!_.isEqual(data.internalNumberRanges, this.callLocationSettingsDataCopy.internalNumberRanges)) {
      promises.push(...this.updateInternalNumberRanges(data.location.uuid || '', data.internalNumberRanges));
    }

    if (!ftsw && !_.isEqual(data.cosRestrictions, this.callLocationSettingsDataCopy.cosRestrictions)) {
      promises.push(this.saveCosRestrictions(data.location.uuid || '', data.cosRestrictions));
    }
    return promises;
  }

  private getCosRestrictions(locationId: string): ng.IPromise<LocationCos> {
    if (locationId) {
      return this.LocationCosService.getLocationCos(locationId)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'locations.getLocationCosFailed'));
          return this.rejectAndNotifyPossibleErrors();
        });
    } else {
      return this.$q.resolve(new LocationCos());
    }
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

  public getInternalNumberRanges(locationId: string): ng.IPromise<InternalNumberRange[]> {
    if (locationId) {
      return this.InternalNumberRangeService.getLocationRangeList(locationId)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'locations.getLocationNumberRangesFailed'));
        return this.rejectAndNotifyPossibleErrors();
      });
    } else {
      return this.$q.resolve([]);
    }
  }
  private createInternalNumberRange(locationId: string, range: InternalNumberRange): ng.IPromise<string> {
    return this.InternalNumberRangeService.createLocationInternalNumberRange(locationId, range)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.extensionAddError', {
          extension: range.name,
        }));
        return this.rejectAndNotifyPossibleErrors();
      });
  }

  private deleteInternalNumberRange(locationId: string, range: InternalNumberRange): ng.IPromise<InternalNumberRange> {
    return this.InternalNumberRangeService.deleteLocationInternalNumberRange(locationId, range)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.extensionDeleteError', {
          extension: range.name,
        }));
        return this.rejectAndNotifyPossibleErrors();
      });
  }

  private updateInternalNumberRanges(locationId: string, internalNumberRanges: InternalNumberRange[]): ng.IPromise<any>[] {
    const promises: ng.IPromise<any>[] = [];
    // first look for ranges to delete.
    _.forEach(this.callLocationSettingsDataCopy.internalNumberRanges, range => {
      if (!_.find(internalNumberRanges, { beginNumber: range.beginNumber, endNumber: range.endNumber })) {
        promises.push(this.deleteInternalNumberRange(locationId, range));
      }
    });

    // look for ranges to add or update
    _.forEach(internalNumberRanges, range => {
      if (!_.find(this.callLocationSettingsDataCopy.internalNumberRanges, { beginNumber: range.beginNumber, endNumber: range.endNumber })) {
        if (!_.isUndefined(range.uuid)) {
          range.uuid = undefined;
          promises.push(this.createInternalNumberRange(locationId, range));
        } else {
          promises.push(this.createInternalNumberRange(locationId, range));
        }
      }
    });
    return promises;
  }

  private getCustomerVoice(): ng.IPromise<CustomerVoice> {
    return this.HuronCustomerService.getVoiceCustomer()
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'locations.getCustomerFailed'));
        return this.rejectAndNotifyPossibleErrors();
      });
  }

  private saveExtensionLength(newExtensionLength: number | null, extensionPrefix: number | null): ng.IPromise<void> {
    if (!_.isEqual(this.callLocationSettingsDataCopy.customerVoice.extensionLength, newExtensionLength)) {
      return this.ExtensionLengthService.saveExtensionLength(newExtensionLength, extensionPrefix)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'locations.updateExtensionLengthFailed'));
          return this.rejectAndNotifyPossibleErrors();
        });
    } else {
      return this.$q.resolve();
    }
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
      this.Notification.notify(this.errors);
      return this.$q.reject();
    }
  }
}
