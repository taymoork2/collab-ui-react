import { Customer, CustomerVoice, HuronCustomerService, ServicePackage } from 'modules/huron/customer';
import { CustomerSettings } from './customer-settings';
import { ExtensionLengthService } from './extension-length.service';
import { LocationsService, Location } from 'modules/call/locations/shared';
import { CompanyNumber, ExternalCallerIdType } from 'modules/call/settings/settings-company-caller-id';
import { MediaOnHoldService } from 'modules/huron/media-on-hold';
import { AvrilService, AvrilCustomer, AvrilFeatures } from 'modules/call/avril';
import { InternalNumberRange, InternalNumberRangeService } from 'modules/call/shared/internal-number-range';
import { Notification } from 'modules/core/notifications';

export class CallSettingsData {
  public customer: CustomerSettings;
  public customerVoice: CustomerVoice;
  public companyMoh: string;
  public companyCallerId: CompanyNumber;
  public avrilCustomer: AvrilCustomer;
  public defaultLocation: Location;
  public avrilFeatures: AvrilFeatures;
}
// TODO: (jlowery) This service will eventually replace
// the HuronSettings service when multilocation goes GA.
export class CallSettingsService {
  private callSettingsDataCopy: CallSettingsData;
  private errors: string[] = [];

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private HuronCustomerService: HuronCustomerService,
    private MediaOnHoldService: MediaOnHoldService,
    private AvrilService: AvrilService,
    private LocationsService: LocationsService,
    private Notification: Notification,
    private ExtensionLengthService: ExtensionLengthService,
    private InternalNumberRangeService: InternalNumberRangeService,
    private CallerId,
    private ServiceSetup,
    private Authinfo,
  ) {}

  public get(): ng.IPromise<CallSettingsData> {
    this.errors = [];
    const callSettingsData = new CallSettingsData();
    return this.$q.all({
      customer: this.getCustomer().then(customer => callSettingsData.customer = customer),
      customerVoice: this.getVoiceCustomer().then(customerVoice => callSettingsData.customerVoice = customerVoice),
      companyCallerId: this.getCompanyCallerId().then(companyCallerId => callSettingsData.companyCallerId = companyCallerId),
      companyMoh: this.getCompanyMedia().then(companyMoh => callSettingsData.companyMoh = companyMoh),
      defaultLocation: this.getDefaultLocation().then(defaultLocation => callSettingsData.defaultLocation = defaultLocation),
    })
      .then(() => this.getAvrilCustomer(callSettingsData.customer.hasVoicemailService).then(avrilCustomer => callSettingsData.avrilCustomer = avrilCustomer))
      .then(() => {
        this.callSettingsDataCopy = this.cloneSettingsData(callSettingsData);
        return callSettingsData;
      })
      .catch(() => this.rejectAndNotifyPossibleErrors());
  }

  public save(data: CallSettingsData): ng.IPromise<CallSettingsData> {
    this.errors = [];
    return this.saveCustomerServicePackage(data.customer, data.customerVoice)
      .then(() => this.updateAvrilCustomer(data.avrilCustomer, data.customer))
      .then(() => this.updateLocation(data.defaultLocation))
      .then(() => this.saveCompanyCallerId(data.companyCallerId))
      .then(() => this.saveCompanyMediaOnHold(data.companyMoh))
      .then(() => this.saveExtensionLengthDecrease(data.customerVoice))
      .then(() => this.get())
      .catch(() => this.rejectAndNotifyPossibleErrors());
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

  private saveCustomerServicePackage(customerData: CustomerSettings, customerVoiceData: CustomerVoice): ng.IPromise<void> {
    if (!_.isEqual(customerData, this.callSettingsDataCopy.customer)) {
      const customer = new Customer();
      if (customerData.hasVoicemailService) {
        _.set(customer, 'servicePackage', ServicePackage.VOICE_VOICEMAIL);
        _.set(customer, 'voicemail', {
          pilotNumber: this.ServiceSetup.generateVoiceMailNumber(this.Authinfo.getOrgId(), customerVoiceData.regionCode),
        });
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

  private getVoiceCustomer(): ng.IPromise<CustomerVoice> {
    return this.HuronCustomerService.getVoiceCustomer()
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.customerGetError'));
        return this.$q.reject();
      });
  }

  private getCompanyMedia(): ng.IPromise<string> {
    return this.MediaOnHoldService.getCompanyMedia()
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'mediaOnHold.mohGetError'));
        return this.$q.reject();
      });
  }

  private getCompanyCallerId(): ng.IPromise<CompanyNumber> {
    return this.CallerId.listCompanyNumbers().then(companyNumbers => {
      const companyCallerId = _.find<CompanyNumber>(companyNumbers, companyNumber => {
        return companyNumber.externalCallerIdType === ExternalCallerIdType.COMPANY_CALLER_ID_TYPE
          || (companyNumber.externalCallerIdType === ExternalCallerIdType.COMPANY_NUMBER_TYPE);
      });
      if (companyCallerId) {
        return new CompanyNumber({
          uuid: _.get<string>(companyCallerId, 'uuid'),
          name: _.get<string>(companyCallerId, 'name'),
          pattern: _.get<string>(companyCallerId, 'pattern'),
          externalCallerIdType: _.get<ExternalCallerIdType>(companyCallerId, 'externalCallerIdType'),
        });
      } else {
        return undefined;
      }
    });
  }

  private saveCompanyCallerId(data: CompanyNumber): ng.IPromise<CompanyNumber | void> {
    if (!_.isEqual(data, this.callSettingsDataCopy.companyCallerId)) {
      if (!data && !_.isUndefined(_.get(this.callSettingsDataCopy, 'companyCallerId.uuid', undefined))) {
        return this.CallerId.deleteCompanyNumber(this.callSettingsDataCopy.companyCallerId.uuid)
          .catch(error => {
            this.errors.push(this.Notification.processErrorResponse(error, 'huronSettings.companyCallerIdsaveError'));
            return this.$q.reject();
          });
      } else {
        if (!data.uuid) {
          return this.CallerId.saveCompanyNumber(data)
            .catch(error => {
              this.errors.push(this.Notification.processErrorResponse(error, 'huronSettings.companyCallerIdsaveError'));
              return this.$q.reject();
            });
        } else {
          return this.CallerId.updateCompanyNumber(data.uuid, data)
            .catch(error => {
              this.errors.push(this.Notification.processErrorResponse(error, 'huronSettings.companyCallerIdsaveError'));
              return this.$q.reject();
            });
        }
      }
    } else {
      return this.$q.resolve();
    }
  }

  public getAvrilCustomer(hasVoicemailService: boolean): ng.IPromise<AvrilCustomer> {
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

  public updateAvrilCustomer(data: AvrilCustomer, customerData: CustomerSettings): ng.IPromise<void> {
    if (customerData.hasVoicemailService && !_.isEqual(this.callSettingsDataCopy.avrilCustomer.features, data.features)) {
      return this.AvrilService.updateAvrilCustomer(data)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'huronSettings.avrilCustomerSaveError'));
          return this.$q.reject();
        });
    } else {
      return this.$q.resolve();
    }
  }

  public saveExtensionLengthDecrease(customerVoice: CustomerVoice): ng.IPromise<any> {
    if (!_.isEqual(this.callSettingsDataCopy.customerVoice.extensionLength, customerVoice.extensionLength)) {
      return this.ExtensionLengthService.saveExtensionLength(customerVoice.extensionLength, null)
        .then(() => this.getDefaultLocation())
        .then(defaultLocation => {
          const newDefaultInternalNumberRange: InternalNumberRange = this.InternalNumberRangeService.calculateDefaultExtensionRange(_.get(customerVoice, 'extensionLength'));
          return this.InternalNumberRangeService.createLocationInternalNumberRange(_.get(defaultLocation, 'uuid'), newDefaultInternalNumberRange);
        })
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.extensionLengthSaveFail'));
          return this.$q.reject();
        });
    } else {
      return this.$q.resolve();
    }
  }

  private getDefaultLocation() {
    return this.LocationsService.getDefaultLocation()
      .then(defaultLocation => {
        return this.LocationsService.getLocation(_.get(defaultLocation, 'uuid'));
      })
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'locations.getFailed'));
        return this.$q.reject();
      });
  }

  private updateLocation(location: Location): ng.IPromise<void> {
    if (!_.isEqual(this.callSettingsDataCopy.defaultLocation, location)) {
      return this.LocationsService.updateLocation(location)
        .catch(error => {
          const ERRORCODE = '19416';
          if (_.has(error.data, 'details') &&
            _.isArray(error.data.details) &&
            _.has(error.data.details[0], 'productErrorMessage') &&
            _.includes(error.data.details[0].productErrorMessage, ERRORCODE)) {
            this.errors.push(this.Notification.processErrorResponse(error, 'locations.voicemailPilotUpdateFailed', { number : location.voicemailPilotNumber ? location.voicemailPilotNumber.number : '' }));
          } else {
            this.errors.push(this.Notification.processErrorResponse(error, 'locations.updateFailed'));
          }
          return this.$q.reject();
        });
    } else {
      return this.$q.resolve();
    }
  }

  private saveCompanyMediaOnHold(companyMoh: string): ng.IPromise<void> {
    if (!_.isEqual(companyMoh, this.callSettingsDataCopy.companyMoh)) {
      const GENERIC_MEDIA_ID = '98765432-DBC2-01BB-476B-CFAF98765432';
      if (_.isEqual(companyMoh, GENERIC_MEDIA_ID)) {
        return this.unassignCompanyMediaOnHold();
      } else {
        return this.updateCompanyMediaOnHold(companyMoh);
      }
    }
    return this.$q.resolve();
  }

  private updateCompanyMediaOnHold(mediaFileId: string): ng.IPromise<void> {
    return this.MediaOnHoldService.updateMediaOnHold(mediaFileId)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'mediaOnHold.mohUpdateError'));
      });
  }

  private unassignCompanyMediaOnHold(): ng.IPromise<void> {
    return this.MediaOnHoldService.unassignMediaOnHold()
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'mediaOnHold.mohUpdateError'));
      });
  }

  public getOriginalConfig(): CallSettingsData {
    return this.cloneSettingsData(this.callSettingsDataCopy);
  }

  public matchesOriginalConfig(huronSettingsData: CallSettingsData): boolean {
    return _.isEqual(huronSettingsData, this.callSettingsDataCopy);
  }

  private cloneSettingsData(settingsData: CallSettingsData): CallSettingsData {
    return _.cloneDeep(settingsData);
  }

  private rejectAndNotifyPossibleErrors(): void | ng.IPromise<any> {
    if (this.errors.length > 0) {
      this.Notification.notify(this.errors);
      return this.$q.reject();
    }
  }

}
