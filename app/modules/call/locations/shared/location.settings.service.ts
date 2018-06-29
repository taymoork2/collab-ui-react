import { Location, LocationsService } from 'modules/call/locations/shared';
import { MediaOnHoldService } from 'modules/huron/media-on-hold';
import { CustomerSettings } from 'modules/call/settings/shared/customer-settings';
import { LocationCosService, LocationCos } from 'modules/call/shared/cos';
import { InternalNumberRange, InternalNumberRangeService } from 'modules/call/shared/internal-number-range';
import { Customer, CustomerVoice, HuronCustomerService, ServicePackage } from 'modules/huron/customer';
import { ExtensionLengthService, IExtensionLength } from 'modules/call/settings/shared/extension-length.service';
import { AvrilService, AvrilCustomer } from 'modules/call/avril';
import { Notification } from 'modules/core/notifications';
import { PstnAddressService, PstnModel, Address } from 'modules/huron/pstn';
import { EmergencyNumber } from 'modules/huron/phoneNumber';
import { SettingSetupInitService } from 'modules/call/settings/settings-setup-init';

export class CallLocationSettingsData {
  public location: Location;
  public mediaId: string;
  public internalNumberRanges: InternalNumberRange[];
  public cosRestrictions: LocationCos;
  public customer: CustomerSettings;
  public customerVoice: CustomerVoice;
  public avrilCustomer: AvrilCustomer;
  //Emergency Services
  public address: Address;
  public emergencyNumber: EmergencyNumber;
}

export class CallLocationSettingsService {
  private callLocationSettingsDataCopy: CallLocationSettingsData;
  private errors: string[] = [];

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private LocationsService: LocationsService,
    private PstnModel: PstnModel,
    private PstnAddressService: PstnAddressService,
    private MediaOnHoldService: MediaOnHoldService,
    private LocationCosService: LocationCosService,
    private InternalNumberRangeService: InternalNumberRangeService,
    private HuronCustomerService: HuronCustomerService,
    private Notification: Notification,
    private ExtensionLengthService: ExtensionLengthService,
    private AvrilService: AvrilService,
    private SettingSetupInitService: SettingSetupInitService,
  ) {}

  public get(locationId?: string|undefined, newLocation?: boolean): ng.IPromise<CallLocationSettingsData> {
    if (locationId) {
      return this.getLocationData(locationId);
    } else {
      return this.LocationsService.getDefaultLocation()
        .then(defaultLocation => {
          if (defaultLocation) {
            this.SettingSetupInitService.setDefaultLocation(defaultLocation);
            return this.getLocationData(defaultLocation.uuid ? defaultLocation.uuid : '', newLocation);
          } else {
            return this.getLocationData('');
          }
        })
        .catch(() => this.getLocationData(''));
    }
  }

  public getLocationData(locationId: string, newLocation?: boolean): ng.IPromise<CallLocationSettingsData> {
    this.errors = [];
    const callLocationSettingsData = new CallLocationSettingsData();
    return this.$q.all({
      location: this.getLocation(locationId).then(location => callLocationSettingsData.location = location),
      address: newLocation ? callLocationSettingsData.address = new Address() : this.getEmergencyServiceAddress(locationId).then(address => callLocationSettingsData.address = address),
      emergencyNumber: this.getEmergencyCallbackNumber(locationId).then(emergencyNumber => callLocationSettingsData.emergencyNumber = emergencyNumber),
      mediaId: this.getLocationMedia(locationId).then(mediaId => callLocationSettingsData.mediaId = mediaId),
      internalNumberRanges: this.getInternalNumberRanges(locationId).then(internalNumberRanges => callLocationSettingsData.internalNumberRanges = internalNumberRanges),
      cosRestrictions: this.getCosRestrictions(locationId).then(cosRestrictions => callLocationSettingsData.cosRestrictions = cosRestrictions),
      customerVoice: this.getCustomerVoice().then(customerVoice => callLocationSettingsData.customerVoice = customerVoice),
      customer: this.getCustomer().then(customer => callLocationSettingsData.customer = customer),
    })
      .then(() => this.getAvrilCustomer(callLocationSettingsData.customer.hasVoicemailService)
        .then(avrilCustomer => callLocationSettingsData.avrilCustomer = avrilCustomer))
      .then(() => {
        this.callLocationSettingsDataCopy = this.cloneSettingsData(callLocationSettingsData);
        return callLocationSettingsData;
      })
      .catch(() => this.rejectAndNotifyPossibleErrors());
  }

  public save(data: CallLocationSettingsData): ng.IPromise<CallLocationSettingsData> {
    this.errors = [];
    if (!data.location.uuid) {
      return this.createLocation(data.location)
        .then(locationId => data.location.uuid = locationId)
        .then(() => this.saveCustomerServicePackage(data.customer))
        .then(() => this.saveExtensionLength(data.customerVoice.extensionLength, null))
        .then(() => this.$q.all(this.createParallelRequests(data, true)))
        .then(() => this.get(data.location.uuid || ''))
        .catch(() => this.rejectAndNotifyPossibleErrors());
    } else {
      if (!_.isEqual(data.location, this.callLocationSettingsDataCopy.location)) {
        return this.updateLocation(data.location)
          .then(() => this.$q.all(this.createParallelRequests(data, false)))
          .then(() => this.get(data.location.uuid || ''))
          .catch(() => this.rejectAndNotifyPossibleErrors());
      } else {
        return this.$q.all(this.createParallelRequests(data, false))
          .then(() => this.get(data.location.uuid || ''))
          .catch(() => this.rejectAndNotifyPossibleErrors());
      }
    }
  }

  //Currently UI only supports 1 address per location
  private getEmergencyServiceAddress(locationId: string): ng.IPromise<Address> {
    const defaultAddress: Address = new Address();
    defaultAddress.country = this.PstnModel.getCountryCode();
    defaultAddress.default = true;
    if (locationId && this.PstnModel.getCustomerId()) {
      return this.PstnAddressService.getByLocation(this.PstnModel.getCustomerId(), locationId)
        .then(addresses => {
          if (_.isArray(addresses) && addresses.length > 0) {
            return addresses[0];
          }
          return defaultAddress;
        })
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'settingsServiceAddress.getError'));
          return this.$q.reject();
        });
    }
    return this.$q.resolve(defaultAddress);
  }

  private getEmergencyCallbackNumber(locationId: string): ng.IPromise<EmergencyNumber> {
    if (locationId) {
      return this.LocationsService.getEmergencyCallbackNumber(locationId)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'settingsServiceNumber.getError'));
          return this.$q.reject();
        });
    }
    return this.$q.resolve(new EmergencyNumber());
  }

  private getLocation(locationId: string) {
    if (locationId) {
      return this.LocationsService.getLocation(locationId)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'locations.getFailed'));
          return this.$q.reject();
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
        return this.$q.reject();
      });
  }

  private updateLocation(data: Location): ng.IPromise<void> {
    return this.LocationsService.updateLocation(data)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'locations.updateFailed'));
        return this.$q.reject();
      });
  }

  private createParallelRequests(data: CallLocationSettingsData, newLocation: boolean): ng.IPromise<any>[] {
    const promises: ng.IPromise<any>[] = [];

    if (!_.isEqual(data.mediaId, this.callLocationSettingsDataCopy.mediaId)) {
      const GENERIC_MEDIA_ID = '98765432-DBC2-01BB-476B-CFAF98765432';
      if (_.isEqual(data.mediaId, GENERIC_MEDIA_ID)) {
        promises.push(this.unassignMediaOnHold(data.location.uuid));
      } else {
        promises.push(this.updateMediaOnHold(data.mediaId, data.location.uuid));
      }
    }

    if (!_.isEqual(data.internalNumberRanges, this.callLocationSettingsDataCopy.internalNumberRanges)) {
      promises.push(...this.updateInternalNumberRanges(data.location.uuid || '', data.internalNumberRanges, newLocation));
    }

    if (!newLocation && !_.isEqual(data.cosRestrictions, this.callLocationSettingsDataCopy.cosRestrictions)) {
      promises.push(this.saveCosRestrictions(data.location.uuid || '', data.cosRestrictions));
    }
    //Emergency Service Address(ESA)
    if (!_.isEqual(this.callLocationSettingsDataCopy.address, data.address) ) {
      promises.push(this.saveEmergencyServicesAddress(data));
    }

    //Emergency Callback Number (ECBA)
    if (!_.isEqual(this.callLocationSettingsDataCopy.emergencyNumber, data.emergencyNumber) && !_.isEmpty(data.emergencyNumber.pattern)) {
      promises.push(this.saveEmergencyCallbackNumber(data));
    }

    return promises;
  }

  private getLocationMedia(locationId: string): ng.IPromise<string> {
    return this.MediaOnHoldService.getLocationMedia(locationId)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'mediaOnHold.mohGetError'));
        return this.$q.reject();
      });
  }

  private updateMediaOnHold(mediaId: string, locationId?: string): ng.IPromise<void> {
    return this.MediaOnHoldService.updateMediaOnHold(mediaId, 'Location', locationId)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'mediaOnHold.mohUpdateError'));
        return this.$q.reject();
      });
  }

  private unassignMediaOnHold(locationId?: string): ng.IPromise<void> {
    return this.MediaOnHoldService.unassignMediaOnHold('Location', locationId)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'mediaOnHold.mohUpdateError'));
        return this.$q.reject();
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
        return this.$q.reject();
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
          return this.$q.reject();
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
          return this.$q.reject();
        });
    } else {
      return this.$q.resolve(new LocationCos());
    }
  }

  private saveCosRestrictions(locationId: string, cosRestrictions: LocationCos): ng.IPromise<(string | void)[]> {
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
        return this.$q.reject();
      });
  }

  public getInternalNumberRanges(locationId: string): ng.IPromise<InternalNumberRange[]> {
    if (locationId) {
      return this.InternalNumberRangeService.getLocationRangeList(locationId)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'locations.getLocationNumberRangesFailed'));
          return this.$q.reject();
        });
    } else {
      // if locationId is not specified, get the extentions from the default location
      return this.LocationsService.getDefaultLocation()
        .then(defaultLocation => {
          if (defaultLocation && defaultLocation.uuid && !defaultLocation.routingPrefix) {
            return this.InternalNumberRangeService.getLocationRangeList(defaultLocation.uuid);
          } else {
            return this.$q.resolve([]);
          }
        });
    }
  }

  private createInternalNumberRange(locationId: string, range: InternalNumberRange): ng.IPromise<string> {
    return this.InternalNumberRangeService.createLocationInternalNumberRange(locationId, range)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.extensionAddError', {
          extension: range.name,
        }));
        return this.$q.reject();
      });
  }

  private deleteInternalNumberRange(locationId: string, range: InternalNumberRange): ng.IPromise<InternalNumberRange> {
    return this.InternalNumberRangeService.deleteLocationInternalNumberRange(locationId, range)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.extensionDeleteError', {
          extension: range.name,
        }));
        return this.$q.reject();
      });
  }

  private updateInternalNumberRanges(locationId: string, internalNumberRanges: InternalNumberRange[], newLocation: boolean): ng.IPromise<any>[] {
    const promises: ng.IPromise<any>[] = [];
    if (newLocation) { // Just create ranges for new locations
      _.forEach(internalNumberRanges, range => {
        promises.push(this.createInternalNumberRange(locationId, range));
      });
    } else {
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
    }

    return promises;
  }

  private getCustomerVoice(): ng.IPromise<CustomerVoice> {
    return this.HuronCustomerService.getVoiceCustomer()
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'locations.getCustomerFailed'));
        return this.$q.reject();
      });
  }

  private saveExtensionLength(newExtensionLength: number | null, extensionPrefix: number | null): ng.IPromise<IExtensionLength | void> {
    if (!_.isEqual(this.callLocationSettingsDataCopy.customerVoice.extensionLength, newExtensionLength)) {
      return this.ExtensionLengthService.saveExtensionLength(newExtensionLength, extensionPrefix)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'locations.updateExtensionLengthFailed'));
          return this.$q.reject();
        });
    } else {
      return this.$q.resolve();
    }
  }

  private saveEmergencyServicesAddress(data: CallLocationSettingsData): ng.IPromise<void> {
    if (!data.location.uuid) {
      this.Notification.error('emergencyServices.locationUnknown');
      return this.$q.reject();
    }
    //UI only supports 1 address per location
    data.address.default = true;
    if (this.callLocationSettingsDataCopy.address && this.callLocationSettingsDataCopy.address.validated) {
      //Normally when new address has be validated and the uuid has been removed
      data.address.uuid = this.callLocationSettingsDataCopy.address.uuid;
      return this.PstnAddressService.updateToLocation(this.PstnModel.getCustomerId(), data.location.uuid, data.address)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'settingsServiceAddress.saveError'));
          return this.$q.reject();
        });
    }
    return this.PstnAddressService.addToLocation(this.PstnModel.getCustomerId(), data.location.uuid, data.address)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'settingsServiceAddress.saveError'));
        return this.$q.reject();
      });
  }

  private saveEmergencyCallbackNumber(data: CallLocationSettingsData): ng.IPromise<void> {
    if (!data.location.uuid) {
      this.Notification.error('emergencyServices.locationUnknown');
      return this.$q.reject();
    }
    if (_.isString(data.emergencyNumber.uuid) && data.emergencyNumber.uuid.length > 0) {
      return this.LocationsService.updateEmergencyCallbackNumber(data.location.uuid, data.emergencyNumber)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'settingsServiceNumber.saveError'));
          return this.$q.reject();
        });
    }
    return this.LocationsService.createEmergencyCallbackNumber(data.location.uuid, data.emergencyNumber)
      .then(emergencyNumberId => {
        data.emergencyNumber.uuid = emergencyNumberId;
      })
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'settingsServiceNumber.saveError'));
        return this.$q.reject();
      });
  }

  private getAvrilCustomer(hasVoicemailService: boolean): ng.IPromise<AvrilCustomer> {
    if (hasVoicemailService) {
      return this.AvrilService.getAvrilCustomer()
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'huronSettings.avrilCustomerGetError'));
          return this.$q.reject();
        });
    } else {
      return this.$q.resolve(new AvrilCustomer());
    }
  }

  public getLocationExtensionRanges(routingPrefix: string): ng.IPromise<InternalNumberRange[]> {
    return this.LocationsService.getLocationsByRoutingPrefix(routingPrefix)
      .then(locations => {
        if (locations.length > 0) {
          return this.InternalNumberRangeService.getLocationRangeList(_.get(locations, '[0].uuid', ''))
            .then(numberRanges => {
              this.callLocationSettingsDataCopy.internalNumberRanges = numberRanges;
              return numberRanges;
            });
        } else {
          return this.$q.resolve([]);
        }
      })
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'locations.getLocationNumberRangesFailed'));
        return this.$q.reject();
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
      this.Notification.notify(this.errors);
      return this.$q.reject();
    }
  }
}
