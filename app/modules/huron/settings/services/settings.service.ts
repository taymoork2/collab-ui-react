import { Customer, Link, HuronCustomerService } from 'modules/huron/customer';
import { ISite, HuronSiteService } from 'modules/huron/sites';
import { IExtensionRange } from 'modules/huron/settings/extensionRange';
import { Notification } from 'modules/core/notifications';
import { CompanyNumber, ExternalCallerIdType } from 'modules/huron/settings/companyCallerId';
import { AvrilService, IAvrilSite, AvrilSite, IAvrilFeatures, AvrilFeatures } from 'modules/huron/avril';
import { TerminusService } from 'modules/huron/pstn';
import { ExtensionLengthService } from './extensionLength.service';

export class HuronSettingsData {
  public customer: CustomerSettings;
  public site: ISite;
  public internalNumberRanges: Array<IExtensionRange>;
  public cosRestrictions: any;
  public companyCallerId: CompanyNumber;
  public voicemailToEmailSettings: IVoicemailToEmail;
  public avrilFeatures: IAvrilFeatures;
}

export class CustomerSettings extends Customer {
  public hasVoicemailService: boolean;
  public hasVoiceService: boolean;

  constructor(obj: {
    uuid: string,
    name: string,
    servicePackage: string,
    links: Array<Link>,
    hasVoicemailService: boolean,
    hasVoiceService: boolean,
  }) {
    super({
      uuid: obj.uuid,
      name: obj.name,
      servicePackage: obj.servicePackage,
      links: obj.links,
    });
    this.hasVoicemailService = obj.hasVoicemailService;
    this.hasVoiceService = obj.hasVoiceService;
  }
}

export interface IVoicemailUserTemplate {
  objectId: string;
  timeZone: string;
  timeZoneName: string;
}

export interface IVoicemailToEmail {
  messageActionId: string;
  voicemailToEmail: boolean;
}

export class HuronSettingsService {
  private huronSettingsDataCopy: HuronSettingsData;
  private errors: Array<any> = [];
  private VOICE_ONLY = 'VOICE_ONLY';
  private DEMO_STANDARD = 'DEMO_STANDARD'; // Unity only
  private VOICE_VOICEMAIL = 'VOICE_VOICEMAIL'; // Avril Only
  private VOICE_VOICEMAIL_AVRIL = 'VOICE_VOICEMAIL_AVRIL'; // Unity and Avril
  private supportsAvrilVoicemail: boolean = false;
  private supportsAvrilVoicemailMailbox: boolean = false;

  /* @ngInject */
  constructor(
    private HuronSiteService: HuronSiteService,
    private HuronCustomerService: HuronCustomerService,
    private Notification: Notification,
    private $q: ng.IQService,
    private AvrilService: AvrilService,
    private ServiceSetup,
    private Authinfo,
    private CustomerCosRestrictionServiceV2,
    private CallerId,
    private VoicemailMessageAction,
    private FeatureToggleService,
    private TerminusService: TerminusService,
    private ExtensionLengthService: ExtensionLengthService,
  ) {
    //Avril and Unity Support
    this.FeatureToggleService.supports(FeatureToggleService.features.avrilVmEnable)
      .then(result => this.supportsAvrilVoicemail = result);
    //Avril only, Should have supportsAvrilVoicemail = false
    this.FeatureToggleService.supports(FeatureToggleService.features.avrilVmMailboxEnable)
      .then(result => this.supportsAvrilVoicemailMailbox = result);
  }

  public get(siteId: string): ng.IPromise<HuronSettingsData> {
    let huronSettingsData = new HuronSettingsData();
    this.errors = [];
    return this.$q.all({
      customerAndSite: this.getSite(siteId)
        .then(site => {
          huronSettingsData.site = site;
          return this.getCustomer()
            .then((customer: CustomerSettings) => {
              huronSettingsData.customer = customer;
              if (_.get<boolean>(customer, 'hasVoicemailService') && !this.supportsAvrilVoicemailMailbox) {
                return this.getVoicemailUserTemplate()
                  .then(userTemplate => this.getVoicemailToEmail(_.get(userTemplate, 'objectId', '')))
                  .then(voicemailToEmailSettings => {
                    huronSettingsData.voicemailToEmailSettings = {
                      messageActionId: voicemailToEmailSettings.messageActionId,
                      voicemailToEmail: voicemailToEmailSettings.voicemailToEmail,
                    };
                  });
              } else if (_.get<boolean>(customer, 'hasVoicemailService') && this.supportsAvrilVoicemailMailbox) {
                return this.getAvrilSite(site)
                  .then(avrilSite => {
                    huronSettingsData.avrilFeatures = avrilSite.features;
                  });
              } else {
                return this.$q.resolve()
                  .then(() => {
                    huronSettingsData.avrilFeatures = new AvrilFeatures();
                  });
              }
            });
        }),
      internalNumberRanges: this.getInternalNumberRanges().then(internalNumberRanges => huronSettingsData.internalNumberRanges = internalNumberRanges),
      cosRestrictions: this.getCosRestrictions().then(cosRestrictions => huronSettingsData.cosRestrictions = cosRestrictions),
      companyCallerId: this.getCompanyCallerId().then(companyCallerId => huronSettingsData.companyCallerId = companyCallerId),
    }).then(() => {
      this.rejectAndNotifyPossibleErrors();
      this.huronSettingsDataCopy = this.cloneSettingsData(huronSettingsData);
      return huronSettingsData;
    });
  }

  public save(data: HuronSettingsData): ng.IPromise<HuronSettingsData> {
    if (!data.site.uuid) {
      if (!_.isEqual(data.customer, this.huronSettingsDataCopy.customer)) {
        return this.saveCustomerServicePackage(data.customer, data.site)
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => {
            return this.createSite(data.site)
              .then(siteId => data.site.uuid = siteId || '');
          })
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.updateVoiceMailSettings(data.customer, data.site, data.voicemailToEmailSettings, data.avrilFeatures))
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.$q.all(this.createParallelRequests(data)))
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.get(data.site.uuid || ''));
      } else {
        return this.createSite(data.site)
          .then(siteId => data.site.uuid = siteId || '')
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.updateVoiceMailSettings(data.customer, data.site, data.voicemailToEmailSettings, data.avrilFeatures))
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.$q.all(this.createParallelRequests(data)))
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.get(data.site.uuid || ''));
      }
    } else {
      // if we have to update customer, do it first
      if (!_.isEqual(data.customer, this.huronSettingsDataCopy.customer)) {
        return this.saveCustomerServicePackage(data.customer, data.site)
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => {
            if (!_.isEqual(data.site, this.huronSettingsDataCopy.site)) {
              return this.updateSite(data.site);
            }
          })
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.updateVoiceMailSettings(data.customer, data.site, data.voicemailToEmailSettings, data.avrilFeatures))
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.$q.all(this.createParallelRequests(data)))
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.get(data.site.uuid || ''));
      } else if (!_.isEqual(data.site, this.huronSettingsDataCopy.site)) {
        return this.updateSite(data.site)
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.updateVoiceMailSettings(data.customer, data.site, data.voicemailToEmailSettings, data.avrilFeatures))
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.$q.all(this.createParallelRequests(data)))
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.get(data.site.uuid || ''));
      } else {
        return this.$q.all(this.createParallelRequests(data))
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.updateVoiceMailSettings(data.customer, data.site, data.voicemailToEmailSettings, data.avrilFeatures))
          .then(() => this.rejectAndNotifyPossibleErrors())
          .then(() => this.get(data.site.uuid || ''));
      }
    }
  }

  public saveExtensionLengthIncrease(newExtensionLength: string, extensionPrefix: string): ng.IPromise<any> {
    return this.ExtensionLengthService.saveExtensionLength(newExtensionLength, extensionPrefix)
      .then(() => {
        if (this.huronSettingsDataCopy.customer.hasVoicemailService || !this.supportsAvrilVoicemailMailbox) {
          return this.getVoicemailUserTemplate()
            .then(userTemplate => {
              // using the huronSettingsDataCopy object here because no other changes
              // will be allowed when extension length is increased, so the data copy value will be
              // correct.  Doing this allows us to not pass the routingPrefix around in components
              // that don't care about it.
              let postalCode = this.deriveVoicemailPostalCode(this.huronSettingsDataCopy.site.routingPrefix || '', newExtensionLength);
              return this.updateVoicemailPostalCode(userTemplate.objectId, postalCode);
            });
        }
      });
  }

  private createParallelRequests(data: HuronSettingsData): Array<ng.IPromise<any>> {
    let promises: Array<ng.IPromise<any>> = [];
    if (!_.isEqual(data.internalNumberRanges, this.huronSettingsDataCopy.internalNumberRanges)) {
      Array.prototype.push.apply(promises, this.updateInternalNumberRanges(data.internalNumberRanges, this.skipInternalNumberRangeDelete(data, this.huronSettingsDataCopy)));
    }

    if (!_.isEqual(data.cosRestrictions, this.huronSettingsDataCopy.cosRestrictions)) {
      promises.push(this.saveCosRestrictions(data.cosRestrictions));
    }

    if (!_.isEqual(data.companyCallerId, this.huronSettingsDataCopy.companyCallerId)) {
      promises.push(this.saveCompanyCallerId(data.companyCallerId));
    }

    if (!_.isEqual(data.site, this.huronSettingsDataCopy.site)) {
      promises.push(this.saveAutoAttendantSite(data.site));
    }
    return promises;
  }

  private getCustomer(): ng.IPromise<CustomerSettings> {
    return this.HuronCustomerService.getCustomer()
      .then(customer => {
        let hasVoicemailService = false;
        let hasVoiceService = false;
        _.forEach(customer.links, (service) => {
          if (service.rel === 'voicemail' || service.rel === 'avril') {
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

  private getSite(_siteId?: string): ng.IPromise<ISite> {
    // TODO (jlowery): siteId is unused until multiple sites are supported.
    return this.HuronSiteService.getTheOnlySite()
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.siteGetError'));
        return this.$q.reject();
      });
  }

  private createSite(site: ISite): ng.IPromise<string | void> {
    return this.HuronSiteService.createSite(site)
      .then(location => {
        return _.last(location.split('/'));
      })
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.siteError'));
      });
  }

  private updateSite(site: ISite): ng.IPromise<void> {
    return this.HuronSiteService.updateSite(site)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.siteUpdateError'));
      });
  }

  private getInternalNumberRanges(): ng.IPromise<Array<IExtensionRange>> {
    return this.ServiceSetup.listInternalNumberRanges().then(ranges => {
      return _.map<any, IExtensionRange>(ranges, range => {
        return {
          uuid: range.uuid,
          name: range.name,
          beginNumber: range.beginNumber,
          endNumber: range.endNumber,
        };
      }).sort( (a, b) => { // sort - order by beginNumber ascending
        return _.toSafeInteger(a.beginNumber) - _.toSafeInteger(b.beginNumber);
      });
    });
  }

  private createInternalNumberRange(range: IExtensionRange): ng.IPromise<void> {
    return this.ServiceSetup.createInternalNumberRange(range)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.extensionAddError', {
          extension: range.name,
        }));
      });
  }

  private deleteInternalNumberRange(range: IExtensionRange): ng.IPromise<void> {
    return this.ServiceSetup.deleteInternalNumberRange(range)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.extensionDeleteError', {
          extension: range.name,
        }));
      });
  }

  private skipInternalNumberRangeDelete(data: HuronSettingsData, originalData: HuronSettingsData): boolean {
    const extensionLength = _.toSafeInteger(_.clone(data.site.extensionLength));
    const origExtensionLength = _.toSafeInteger(_.clone(originalData.site.extensionLength));
    return extensionLength < origExtensionLength;
  }

  private updateInternalNumberRanges(internalNumberRanges: Array<IExtensionRange>, skipDelete: boolean = false): Array<ng.IPromise<any>> {
    let promises: Array<ng.IPromise<any>> = [];
    if (!skipDelete) {
      // first look for ranges to delete.
      _.forEach(this.huronSettingsDataCopy.internalNumberRanges, range => {
        if (!_.find(internalNumberRanges, { beginNumber: range.beginNumber, endNumber: range.endNumber })) {
          promises.push(this.deleteInternalNumberRange(range));
        }
      });
    }

    // look for ranges to add or update
    _.forEach(internalNumberRanges, range => {
      if (!_.find(this.huronSettingsDataCopy.internalNumberRanges, { beginNumber: range.beginNumber, endNumber: range.endNumber })) {
        if (!_.isUndefined(range.uuid)) {
          range.uuid = undefined;
          promises.push(this.createInternalNumberRange(range));
        } else {
          promises.push(this.createInternalNumberRange(range));
        }
      }
    });
    return promises;
  }

  private getCosRestrictions(): ng.IPromise<any> {
    return this.CustomerCosRestrictionServiceV2.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
    .then(response => {
      return _.map(_.get(response, 'restrictions', []), restriction => {
        return {
          blocked: _.get(restriction, 'blocked', false),
          restriction: _.get(restriction, 'restriction'),
        };
      });
    });
  }

  private saveCosRestrictions(data: any): ng.IPromise<void> {
    return this.CustomerCosRestrictionServiceV2.update({
      customerId: this.Authinfo.getOrgId(),
    }, {
      restrictions: data,
    }).$promise
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.cos.error'));
      });
  }

  private getCompanyCallerId(): ng.IPromise<CompanyNumber> {
    return this.CallerId.listCompanyNumbers().then(companyNumbers => {
      let companyCallerId = _.find<CompanyNumber>(companyNumbers, companyNumber => {
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

  private saveCompanyCallerId(data: CompanyNumber): ng.IPromise<CompanyNumber> {
    if (!data && !_.isUndefined(_.get(this.huronSettingsDataCopy, 'companyCallerId.uuid', undefined))) {
      return this.CallerId.deleteCompanyNumber(this.huronSettingsDataCopy.companyCallerId.uuid)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'huronSettings.companyCallerIdsaveError'));
        });
    } else {
      if (!data.uuid) {
        return this.CallerId.saveCompanyNumber(data)
          .catch(error => {
            this.errors.push(this.Notification.processErrorResponse(error, 'huronSettings.companyCallerIdsaveError'));
          });
      } else {
        return this.CallerId.updateCompanyNumber(data.uuid, data)
          .catch(error => {
            this.errors.push(this.Notification.processErrorResponse(error, 'huronSettings.companyCallerIdsaveError'));
          });
      }
    }
  }

  private saveCustomerServicePackage(customerData: CustomerSettings, siteData: ISite): ng.IPromise<void> {
    let customer = {};
    if (customerData.hasVoicemailService) {
      if (this.supportsAvrilVoicemail && !this.supportsAvrilVoicemailMailbox) {
        _.set(customer, 'servicePackage', this.VOICE_VOICEMAIL_AVRIL);
      } else if (!this.supportsAvrilVoicemail && this.supportsAvrilVoicemailMailbox) {
        _.set(customer, 'servicePackage', this.VOICE_VOICEMAIL);
      } else {
        _.set(customer, 'servicePackage', this.DEMO_STANDARD);
      }
      _.set(customer, 'voicemail', { pilotNumber: siteData.voicemailPilotNumber });
    } else {
      _.set(customer, 'servicePackage', this.VOICE_ONLY);
    }
    return this.ServiceSetup.updateCustomer(customer)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.voicemailUpdateError'));
      });
  }

  private updateVoiceMailSettings(customerData: CustomerSettings, siteData: ISite, voicemailToEmailData: IVoicemailToEmail, avrilFeatures: IAvrilFeatures): ng.IPromise<any> {
    if (customerData.hasVoicemailService) {
      if (!this.supportsAvrilVoicemailMailbox) { // Do not update Unity if Avril only
        let promises: Array<ng.IPromise<any>> = [];
        return this.getVoicemailUserTemplate()
          .then(userTemplate => {
            if (!_.isEqual(this.huronSettingsDataCopy.voicemailToEmailSettings, voicemailToEmailData)) {
              promises.push(this.setVoicemailToEmail(userTemplate.objectId, voicemailToEmailData));
            }
            if (!_.isEqual(this.huronSettingsDataCopy.site.routingPrefix, siteData.routingPrefix)
              || !_.isEqual(this.huronSettingsDataCopy.site.extensionLength, siteData.extensionLength)
              || !_.isEqual(this.huronSettingsDataCopy.customer.hasVoicemailService, customerData.hasVoicemailService)) {
              let postalCode = this.deriveVoicemailPostalCode(siteData.routingPrefix || '', siteData.extensionLength);
              promises.push(this.updateVoicemailPostalCode(userTemplate.objectId, postalCode));
            }
            if (!_.isEqual(this.huronSettingsDataCopy.site.timeZone, siteData.timeZone)
              || !_.isEqual(this.huronSettingsDataCopy.customer.hasVoicemailService, customerData.hasVoicemailService)) {
              promises.push(this.updateVoicemailTimeZone(userTemplate.objectId, siteData.timeZone));
            }
            if (promises.length > 0) {
              return this.$q.all(promises)
                .then(() => this.rejectAndNotifyPossibleErrors());
            } else {
              return this.$q.resolve();
            }
          });
      } else if (this.supportsAvrilVoicemailMailbox) { // only update Avril if needed
        if (!_.isEqual(this.huronSettingsDataCopy.site.routingPrefix, siteData.routingPrefix)
          || !_.isEqual(this.huronSettingsDataCopy.site.extensionLength, siteData.extensionLength)
          || !_.isEqual(this.huronSettingsDataCopy.customer.hasVoicemailService, customerData.hasVoicemailService)
          || !_.isEqual(this.huronSettingsDataCopy.avrilFeatures, avrilFeatures)) {
          return this.updateAvrilSite(siteData, avrilFeatures);
        } else {
          return this.$q.resolve();
        }
      } else {
        return this.$q.resolve();
      }
    } else {
      return this.$q.resolve();
    }
  }

  private getVoicemailToEmail(userTemplateId: string): ng.IPromise<IVoicemailToEmail> {
    return this.VoicemailMessageAction.get(userTemplateId)
      .then(messageAction => {
        return <IVoicemailToEmail>{
          messageActionId: _.get(messageAction, 'objectId'),
          voicemailToEmail: this.VoicemailMessageAction.isVoicemailToEmailEnabled(_.get(messageAction, 'voicemailAction')),
        };
      })
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.voicemailToEmailGetError'));
      });
  }

  private setVoicemailToEmail(userTemplateId: string, voicemailToEmailSettings: IVoicemailToEmail): ng.IPromise<void> {
    return this.VoicemailMessageAction.update(voicemailToEmailSettings.voicemailToEmail, userTemplateId, voicemailToEmailSettings.messageActionId)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'huronSettings.voicemailToEmailUpdateError'));
      });
  }

  private getVoicemailUserTemplate(): ng.IPromise<IVoicemailUserTemplate> {
    return this.ServiceSetup.listVoicemailTimezone()
      .then(userTemplates => {
        return <IVoicemailUserTemplate>{
          objectId: _.get<string>(userTemplates, '[0].objectId'),
          timeZone: _.get<string>(userTemplates, '[0].timeZone'),
          timeZoneName: _.get<string>(userTemplates, '[0].timeZoneName'),
        };
      })
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.voicemailTimeZoneGetError'));
      });
  }

  private updateVoicemailPostalCode(userTemplateId: string, postalCode: string): ng.IPromise<void> {
    return this.ServiceSetup.updateVoicemailPostalcode(postalCode, userTemplateId)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.error.updateVoicemailPostalCode'));
      });
  }

  private updateVoicemailTimeZone(userTemplateId: string, timezone: string): ng.IPromise<void> {
    return this.ServiceSetup.updateVoicemailTimezone(timezone, userTemplateId)
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.error.timezoneUpdateError'));
      });
  }

  private deriveVoicemailPostalCode(routingPrefix: string, extensionLength: string): string {
    let steeringDigit = _.isUndefined(routingPrefix) ? '' : routingPrefix.charAt(0);
    let siteCode = _.isUndefined(routingPrefix) ? '' : routingPrefix.substr(1);
    return [steeringDigit, siteCode, extensionLength].join('-');
  }

  private saveAutoAttendantSite(site: ISite): ng.IPromise<void> {
    return this.ServiceSetup.saveAutoAttendantSite({
      siteSteeringDigit: site.routingPrefix ? site.routingPrefix.substr(0, 1) : null,
      siteCode: site.routingPrefix ? site.routingPrefix.substr(1) : null,
      uuid: site.uuid,
    })
      .catch(error => {
        this.errors.push(this.Notification.processErrorResponse(error, 'serviceSetupModal.error.autoAttendantPost'));
      });
  }

  private getAvrilSite(site: ISite): ng.IPromise<IAvrilSite> {
    if (_.isUndefined(site.uuid)) {
      return this.$q.resolve(new AvrilSite());
    } else {
      return this.AvrilService.getAvrilSite(site.uuid || '')
      .catch(error => {
        if (error.status === 404) {
          return new AvrilSite();
        } else {
          this.errors.push(this.Notification.processErrorResponse(error, 'avril get error'));
          return this.$q.reject();
        }
      });
    }
  }

  private updateAvrilSite(site: ISite, avrilFeatures: IAvrilFeatures): ng.IPromise<void> {
    return this.AvrilService.updateAvrilSite(
      <IAvrilSite>{
        guid: site.uuid,
        extensionLength: site.extensionLength,
        language: site.preferredLanguage,
        pilotNumber: site.voicemailPilotNumber,
        siteSteeringDigit: site.routingPrefix ? site.routingPrefix.substr(1) : null,
        timeZone: site.timeZone,
        features: avrilFeatures,
      },
    ).catch(error => {
      if (error.status === 404) {
        return this.createAvrilSite(site, avrilFeatures);
      } else {
        this.errors.push(this.Notification.processErrorResponse(error, 'avril update error'));
      }
    });
  }

  private createAvrilSite(site: ISite, avrilFeatures: IAvrilFeatures): ng.IPromise<string | void> {
    return this.AvrilService.createAvrilSite(
      <IAvrilSite>{
        guid: site.uuid,
        extensionLength: site.extensionLength,
        language: site.preferredLanguage,
        pilotNumber: site.voicemailPilotNumber,
        siteSteeringDigit: site.routingPrefix ? site.routingPrefix.substr(1) : null,
        timeZone: site.timeZone,
        features: avrilFeatures,
      },
    ).catch(error => {
      this.errors.push(this.Notification.processErrorResponse(error, 'avril create error'));
    });
  }

  public getOriginalConfig(): HuronSettingsData {
    return this.cloneSettingsData(this.huronSettingsDataCopy);
  }

  public matchesOriginalConfig(huronSettingsData: HuronSettingsData): boolean {
    return _.isEqual(huronSettingsData, this.huronSettingsDataCopy);
  }

  private cloneSettingsData(settingsData: HuronSettingsData): HuronSettingsData {
    return _.cloneDeep(settingsData);
  }

  private rejectAndNotifyPossibleErrors(): void | ng.IPromise<any> {
    if (this.errors.length > 0) {
      this.Notification.notify(this.errors, 'error');
      return this.$q.reject();
    }
  }

  public getE911State(pattern: string): ng.IPromise<string> {
    return this.TerminusService.customerNumberE911V2().get({
      customerId: this.Authinfo.getOrgId(),
      number: pattern,
    }).$promise
    .then(e911Status => {
      return _.get(e911Status, 'status', '');
    });
  }

}
