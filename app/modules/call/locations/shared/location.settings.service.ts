import { Location, LocationsService } from 'modules/call/locations/shared';
import { MediaOnHoldService } from 'modules/huron/media-on-hold';
import { CustomerSettings } from 'modules/call/settings/shared/customer-settings';
import { LocationCosService, LocationCos } from 'modules/call/shared/cos';
import { InternalNumberRange, InternalNumberRangeService } from 'modules/call/shared/internal-number-range';
import { Customer, CustomerVoice, HuronCustomerService, ServicePackage } from 'modules/huron/customer';
import { ExtensionLengthService } from 'modules/call/settings/shared/extension-length.service';
import { AvrilService, AvrilCustomer } from 'modules/huron/avril';
import { Notification } from 'modules/core/notifications';

export class CallLocationSettingsData {
  public location: Location;
  public mediaId: string;
  public internalNumberRanges: InternalNumberRange[];
  public cosRestrictions: LocationCos;
  public customer: CustomerSettings;
  public customerVoice: CustomerVoice;
  public avrilCustomer: AvrilCustomer;
}

export class CallLocationSettingsService {
  private callLocationSettingsDataCopy: CallLocationSettingsData;
  private errors: string[] = [];
  private supportsLocationMoh: boolean = false;

  /* @ngInject */
  constructor(
    private LocationsService: LocationsService,
    private MediaOnHoldService: MediaOnHoldService,
    private LocationCosService: LocationCosService,
    private InternalNumberRangeService: InternalNumberRangeService,
    private HuronCustomerService: HuronCustomerService,
    private Notification: Notification,
    private $q: ng.IQService,
    private ExtensionLengthService: ExtensionLengthService,
    private FeatureToggleService,
    private AvrilService: AvrilService,
  ) {
    // Location Media On Hold Support
    this.FeatureToggleService.supports(FeatureToggleService.features.huronMOHEnable)
      .then(result => this.supportsLocationMoh = result);
  }

  public get(locationId: string): ng.IPromise<CallLocationSettingsData> {
    const callLocationSettingsData = new CallLocationSettingsData();
    return this.$q.all({
      location: this.getLocation(locationId).then(location => callLocationSettingsData.location = location),
      mediaId: this.getLocationMedia(locationId).then(mediaId => callLocationSettingsData.mediaId = mediaId),
      internalNumberRanges: this.getInternalNumberRanges(locationId).then(internalNumberRanges => callLocationSettingsData.internalNumberRanges = internalNumberRanges),
      cosRestrictions: this.getCosRestrictions(locationId).then(cosRestrictions => callLocationSettingsData.cosRestrictions = cosRestrictions),
      customerVoice: this.getCustomerVoice().then(customerVoice => callLocationSettingsData.customerVoice = customerVoice),
      customer: this.getCustomer().then(customer => callLocationSettingsData.customer = customer),
    })
    .then(() => this.getAvrilCustomer(callLocationSettingsData.customer.hasVoicemailService).then(avrilCustomer => callLocationSettingsData.avrilCustomer = avrilCustomer))
    .then(() => {
      this.callLocationSettingsDataCopy = this.cloneSettingsData(callLocationSettingsData);
      return callLocationSettingsData;
    });
  }

  public save(data: CallLocationSettingsData): ng.IPromise<CallLocationSettingsData> {
    if (!data.location.uuid) {
      return this.createLocation(data.location)
        .then(locationId => data.location.uuid = locationId)
        .then(() => this.saveCustomerServicePackage(data.customer))
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

    if (this.supportsLocationMoh && !_.isEqual(data.mediaId, this.callLocationSettingsDataCopy.mediaId)) {
      const GENERIC_MEDIA_ID = '98765432-DBC2-01BB-476B-CFAF98765432';
      if (_.isEqual(data.mediaId, GENERIC_MEDIA_ID)) {
        promises.push(this.unassignMediaOnHold(data.location.uuid));
      } else {
        promises.push(this.updateMediaOnHold(data.mediaId, data.location.uuid));
      }
    }

    if (!_.isEqual(data.internalNumberRanges, this.callLocationSettingsDataCopy.internalNumberRanges)) {
      promises.push(...this.updateInternalNumberRanges(data.location.uuid || '', data.internalNumberRanges));
    }

    if (!ftsw && !_.isEqual(data.cosRestrictions, this.callLocationSettingsDataCopy.cosRestrictions)) {
      promises.push(this.saveCosRestrictions(data.location.uuid || '', data.cosRestrictions));
    }
    return promises;
  }

  private getLocationMedia(locationId: string): ng.IPromise<string> {
    if (this.supportsLocationMoh) {
      return this.MediaOnHoldService.getLocationMedia(locationId)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.mohGetError'));
        return this.rejectAndNotifyPossibleErrors();
      });
    }
    return this.$q.resolve('');
  }

  private updateMediaOnHold(mediaId: string, locationId?: string): ng.IPromise<void> {
    return this.MediaOnHoldService.updateMediaOnHold(mediaId, 'Location', locationId)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.mohUpdateError'));
      });
  }

  private unassignMediaOnHold(locationId?: string): ng.IPromise<void> {
    return this.MediaOnHoldService.unassignMediaOnHold('Location', locationId)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.mohUpdateError'));
      });
  }
  private getCustomer(): ng.IPromise<CustomerSettings> {
    return this.HuronCustomerService.getCustomer()
      .then(customer => {
        let hasVoicemailService = false;
        let hasVoiceService = false;
        _.forEach(customer.links, (service) => {
          if (service.rel === 'avril') {
            hasVoicemailService = true;
          } else if (service.rel === 'voice') {
            hasVoiceService = true;
          }
        });
        return new CustomerSettings({
          uuid: customer.uuid,
          name: customer.name,
          servicePackage: customer.servicePackage,
          links: customer.links,
          hasVoiceService: hasVoiceService,
          hasVoicemailService: hasVoicemailService,
        });
      }).catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.customerGetError'));
        return this.rejectAndNotifyPossibleErrors();
      });
  }

  private saveCustomerServicePackage(customerData: CustomerSettings): ng.IPromise<void> {
    if (!_.isEqual(customerData, this.callLocationSettingsDataCopy.customer)) {
      const customer = new Customer();
      if (customerData.hasVoicemailService) {
        _.set(customer, 'servicePackage', ServicePackage.VOICE_VOICEMAIL);
      } else {
        _.set(customer, 'servicePackage', ServicePackage.VOICE_ONLY);
      }
      return this.HuronCustomerService.updateCustomer(customer)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.voicemailUpdateError'));
          return this.rejectAndNotifyPossibleErrors();
        });
    } else {
      return this.$q.resolve();
    }
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

  private getAvrilCustomer(hasVoicemailService: boolean): ng.IPromise<AvrilCustomer> {
    if (hasVoicemailService) {
      return this.AvrilService.getAvrilCustomer()
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'huronSettings.avrilCustomerGetError'));
        return this.rejectAndNotifyPossibleErrors();
      });
    } else {
      return this.$q.resolve(new AvrilCustomer());
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
