import './_mySubscription.scss';
import { DigitalRiverService } from 'modules/online/digitalRiver/digitalRiver.service';
import { Notification } from 'modules/core/notifications';
import { OnlineUpgradeService, IBmmpAttr, IProdInst } from 'modules/online/upgrade/upgrade.service';
import { SharedMeetingsReportService } from './sharedMeetings/sharedMeetingsReport.service';
import { IOfferData, IOfferWrapper, ISubscription, ISubscriptionCategory } from './subscriptionsInterfaces';

class MySubscriptionCtrl {
  public hybridServices: Array<any> = [];
  public licenseCategory: Array<ISubscriptionCategory> = [];
  public subscriptionDetails: Array<ISubscription> = [];
  public visibleSubscriptions: boolean = false;
  public hasEnterpriseTrial: boolean = false;
  public trialUrlFailed: boolean = false;
  public productInstanceFailed: boolean = false;
  public loading: boolean = false;
  public digitalRiverSubscriptionsUrl: string;
  public isSharedMeetingsReportsEnabled: boolean;
  public isSharedMeetingsEnabled: boolean;
  public temporarilyOverrideSharedMeetingsFeatureToggle = { default: true, defaultValue: true };
  public temporarilyOverrideSharedMeetingsReportsFeatureToggle = { default: false, defaultValue: true };
  public bmmpAttr: IBmmpAttr;

  private readonly BASE_CATEGORY: ISubscriptionCategory = {
    offers: [],
    offerWrapper: [],
  };

  // icon classes
  private readonly MESSAGE_CLASS: string = 'icon-message';
  private readonly MEETING_CLASS: string = 'icon-meeting-room';
  private readonly WEBEX_CLASS: string = 'icon-webex';
  private readonly CALL_CLASS: string = 'icon-calls';
  private readonly CARE_CLASS: string = 'icon-headset';

  private readonly CARE: string = 'CARE';
  private readonly SUBSCRIPTION_TYPES: any = {
    message: 0,
    meeting: 1,
    call: 2,
    room: 3,
    care: 4,
  };

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $rootScope: ng.IRootScopeService,
    private $translate: ng.translate.ITranslateService,
    private $window: ng.IWindowService,
    private Authinfo,
    private Config,
    private FeatureToggleService,
    private DigitalRiverService: DigitalRiverService,
    private OnlineUpgradeService: OnlineUpgradeService,
    private SharedMeetingsReportService: SharedMeetingsReportService,
    private Notification: Notification,
    private Orgservice,
    private ServiceDescriptor,
    private WebExUtilsFact,
    private UrlConfig,
  ) {
    _.forEach(this.SUBSCRIPTION_TYPES, (_value, key: string): void => {
      let category: ISubscriptionCategory = _.cloneDeep(this.BASE_CATEGORY);
      category.label = $translate.instant('subscriptions.' + key);

      this.licenseCategory.push(category);
    });

    this.hybridServicesRetrieval();
    this.subscriptionRetrieval();
    this.initFeatures();
  }

  public hideUsage(offer: IOfferData): boolean {
    return !_.isUndefined(offer.isCI) && !offer.isCI;
  }

  public nonCISignIn(offer: IOfferData): void {
    if (offer.siteUrl) {
      this.$window.open(this.WebExUtilsFact.getSiteAdminUrl(offer.siteUrl), '_blank');
    }
  }

  public showCategory(category: ISubscriptionCategory): boolean {
    return category.offers.length > 0 || category.offerWrapper.length > 0;
  }

  public wrapsOffers(category: ISubscriptionCategory): boolean {
    return category.offerWrapper.length > 0;
  }

  public getWarning(offer: IOfferData): boolean {
    return offer.usage > offer.volume;
  }

  public isSharedMeetingsLicense(offer: ISubscription): boolean {
    return _.lowerCase(_.get(offer, 'licenseModel', '')) === this.Config.licenseModel.cloudSharedMeeting;
  }

  public determineLicenseType(offer: ISubscription): string {
    return this.isSharedMeetingsLicense(offer) ? this.$translate.instant('firstTimeWizard.sharedLicenses') : this.$translate.instant('firstTimeWizard.namedLicenses');
  }

  public launchSharedMeetingsLicenseUsageReport(siteUrl: string): void {
    this.SharedMeetingsReportService.openModal(siteUrl);
  }

  private initFeatures(): void {
    if (this.temporarilyOverrideSharedMeetingsFeatureToggle.default === true) {
      this.isSharedMeetingsEnabled = this.temporarilyOverrideSharedMeetingsFeatureToggle.defaultValue;
    } else {
      this.FeatureToggleService.atlasSharedMeetingsGetStatus().then((status) => {
        this.isSharedMeetingsEnabled = status;
      });
    }

    if (this.temporarilyOverrideSharedMeetingsReportsFeatureToggle.default) {
      this.isSharedMeetingsReportsEnabled = this.temporarilyOverrideSharedMeetingsReportsFeatureToggle.defaultValue;
    } else {
      this.FeatureToggleService.atlasSharedMeetingsReportsGetStatus().then((sharedMeetingReportsStatus) => {
        this.isSharedMeetingsReportsEnabled = sharedMeetingReportsStatus;
      });
    }
  }

  private upgradeTrialUrl(subId: string): ng.IPromise<any> {
    return this.$http.get(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/' + subId).then((response: any): any => {
      if (response.data) {
        return response.data;
      } else {
        this.trialUrlFailed = true;
        return;
      }
    }).catch((error: any): any => {
      this.Notification.errorWithTrackingId(error, 'subscriptions.onlineTrialUpgradeUrlError', {
        trialId: subId,
      });
      this.trialUrlFailed = true;
      return;
    });
  }

  private getChangeSubURL(env: string): ng.IPromise<string> {
    return this.DigitalRiverService.getSubscriptionsUrl(env).then((subscriptionsUrl: string): string => {
      return subscriptionsUrl;
    }).catch((error: any): string => {
      this.loading = false;
      this.Notification.errorWithTrackingId(error, 'subscriptions.loadError');
      return '';
    });
  }

  private broadcastSingleSubscription(subscription: ISubscription, trialUrl?: string)  {
    this.$rootScope.$broadcast('SUBSCRIPTION::upgradeData', {
      isTrial: subscription.isTrial,
      subId: subscription.internalSubscriptionId,
      productInstanceId: subscription.productInstanceId,
      changeplanOverride: subscription.changeplanOverride,
      numSubscriptions: subscription.numSubscriptions,
      upgradeTrialUrl: trialUrl,
    });
  }

  // generating the subscription view tooltips
  private generateTooltip(offerName: string, usage?: number, volume?: number): string | undefined {
    if (_.isNumber(usage) && _.isNumber(volume)) {
      let tooltip = this.$translate.instant('subscriptions.licenseTypes.' + offerName) + '<br>' + this.$translate.instant('subscriptions.usage');
      if (usage > volume) {
        tooltip += '<span class="warning">' + usage + '/' + volume + '</span>';
      } else {
        tooltip += usage + '/' + volume;
      }
      return tooltip;
    } else {
      return;
    }
  }

  // combines licenses for the license view
  private addSubscription(index: number, item: IOfferData, siteIndex?: number): void {
    let offers: Array<IOfferData>;
    let exists: boolean = false;

    if (_.isNumber(siteIndex)) {
      offers = _.get(this.licenseCategory, `[${index}].offerWrapper[${siteIndex}].offers`, []);
    } else {
      offers = _.get(this.licenseCategory, `[${index}].offers`, []);
    }

    _.forEach(offers, (offer: IOfferData): void => {
      if (!exists && offer.offerName === item.offerName) {
        offer.usage += item.usage;
        offer.volume += item.volume;
        exists = true;
      }
    });

    if (!exists) {
      offers.push(item);
    }
  }

  private sortSubscription(index: number, siteIndex: number): void {
    const offers: Array<IOfferData> = _.get(this.licenseCategory, `[${index}].offerWrapper[${siteIndex}].offers`, []);
    this.licenseCategory[index].offerWrapper[siteIndex].offers = _.sortBy(offers, (element: IOfferData): number => {
      const rank = {
        CDC: 1,
        CVC: 2,
      };
      return rank[element.offerName];
    });
  }

  private subscriptionRetrieval(): void {
    this.Orgservice.getLicensesUsage().then((subscriptions: Array<any>): void => {
      _.forEach(subscriptions, (subscription: any, subIndex: number): void => {
        let newSubscription: ISubscription = {
          licenses: [],
          isTrial: false,
          isOnline: false,
          viewAll: false,
          numSubscriptions: subscriptions.length,
        };
        if (subscription.subscriptionId && (subscription.subscriptionId !== 'unknown')) {
          newSubscription.subscriptionId = subscription.subscriptionId;
        }
        if (subscription.internalSubscriptionId && (subscription.internalSubscriptionId !== 'unknown')) {
          newSubscription.internalSubscriptionId = subscription.internalSubscriptionId;
          if (subscription.internalSubscriptionId !== 'Trial') {
            newSubscription.isOnline = true;
          }
        }

        _.forEach(subscription.licenses, (license: any, licenseIndex: number): void => {
          if (license.offerName in this.Config.offerCodes) {
            let offer: IOfferData = {
              licenseId: license.licenseId,
              licenseType: license.licenseType,
              licenseModel: _.get(license, 'licenseModel', ''),
              offerName: license.offerName,
              usage: license.usage || 0,
              volume: license.volume,
              id: 'donutId' + subIndex + licenseIndex,
              tooltip: this.generateTooltip(license.offerName, license.usage, license.volume),
            };

            if (license.siteUrl) {
              offer.siteUrl = license.siteUrl;
              offer.isCI = this.WebExUtilsFact.isCIEnabledSite(license.siteUrl);
            }

            if (license.offerName === this.Config.offerCodes.MS) {
              offer.class = this.MESSAGE_CLASS;
              this.addSubscription(this.SUBSCRIPTION_TYPES.message, _.cloneDeep(offer));
            } else if (license.offerName === this.Config.offerCodes.CO) {
              offer.class = this.CALL_CLASS;
              this.addSubscription(this.SUBSCRIPTION_TYPES.call, _.cloneDeep(offer));
            } else if (license.offerName === this.Config.offerCodes.SD || license.offerName === this.Config.offerCodes.SB) {
              offer.class = this.MEETING_CLASS;
              this.addSubscription(this.SUBSCRIPTION_TYPES.room, _.cloneDeep(offer));
            } else if (license.offerName === this.Config.offerCodes.CDC || license.offerName === this.Config.offerCodes.CVC) {
              offer.class = this.CARE_CLASS;
              let existingIndex = _.findIndex(this.licenseCategory[this.SUBSCRIPTION_TYPES.care].offerWrapper, (sub: IOfferWrapper): boolean => {
                return sub.type === this.CARE;
              });

              if (existingIndex >= 0) {
                this.addSubscription(this.SUBSCRIPTION_TYPES.care, _.cloneDeep(offer), existingIndex);
                this.sortSubscription(this.SUBSCRIPTION_TYPES.care, existingIndex);
              } else {
                this.licenseCategory[this.SUBSCRIPTION_TYPES.care].offerWrapper.unshift({
                  offers: [_.cloneDeep(offer)],
                  type: this.CARE,
                });
              }
            } else {
              if (license.offerName === this.Config.offerCodes.CF) {
                offer.class = this.MEETING_CLASS;
              } else {
                offer.class = this.WEBEX_CLASS;
              }

              let existingSite: number = _.findIndex(this.licenseCategory[this.SUBSCRIPTION_TYPES.meeting].offerWrapper, (sub: IOfferWrapper): boolean => {
                return sub.siteUrl === offer.siteUrl;
              });

              if (existingSite >= 0) {
                this.addSubscription(this.SUBSCRIPTION_TYPES.meeting, _.cloneDeep(offer), existingSite);
              } else if (offer.siteUrl) {
                this.licenseCategory[this.SUBSCRIPTION_TYPES.meeting].offerWrapper.push({
                  siteUrl: offer.siteUrl,
                  offers: [_.cloneDeep(offer)],
                });
              } else { // Meeting licenses not attached to a siteUrl should be grouped together at the front of the list
                this.licenseCategory[this.SUBSCRIPTION_TYPES.meeting].offerWrapper.unshift({ offers: [_.cloneDeep(offer)] });
              }
            }

            this.visibleSubscriptions = true;
            newSubscription.licenses.push(offer);
            // if the subscription is a trial, all licenses will have isTrial set to true
            newSubscription.isTrial = license.isTrial;
          }
        });

        if (newSubscription.licenses.length > 0) {
          if (newSubscription.isOnline) {
            newSubscription.quantity = newSubscription.licenses[0].volume;
          }
          // sort licenses into display order/order for determining subscription name
          let licenseTypes: Array<any> = _.toArray(this.Config.offerCodes);
          newSubscription.licenses.sort((a, b) => {
            return licenseTypes.indexOf(a.offerName) - licenseTypes.indexOf(b.offerName);
          });
          if (newSubscription.isOnline) {
            this.subscriptionDetails.unshift(newSubscription);
          } else {
            this.subscriptionDetails.push(newSubscription);
          }
        }
      });

      let enterpriseSubs = 1;
      let enterpriseTrials = 1;
      _.forEach(this.subscriptionDetails, (subscription: ISubscription, index: number): void => {
        if (!subscription.isOnline) {
          if (subscription.isTrial) {
            this.subscriptionDetails[index].name = this.$translate.instant('subscriptions.enterpriseTrial', { number: enterpriseTrials++ });
            this.hasEnterpriseTrial = true;
          } else {
            this.subscriptionDetails[index].name = this.$translate.instant('subscriptions.numberedName', { number: enterpriseSubs++ });
          }
        } else {
          if (subscription.isTrial) {
            this.setBMMPTrial(subscription, this.Authinfo.getUserId());
          } else {
            this.setBMMP(subscription, this.Authinfo.getUserId());
          }
        }
      });
    });
  }

  private setBMMP(subscription: ISubscription, userId: string): void {
    this.OnlineUpgradeService.getProductInstance(userId, subscription.internalSubscriptionId).then((prodResponse: IProdInst) => {
      if (prodResponse) {
        subscription.productInstanceId = prodResponse.productInstanceId;
        subscription.name = prodResponse.name;
        const env: string = _.includes(prodResponse.name, 'Spark') ? 'spark' : 'webex';
        this.getChangeSubURL(env).then((urlResponse) => {
          if (urlResponse) {
            subscription.changeplanOverride = urlResponse;

            if (subscription.internalSubscriptionId && subscription.productInstanceId) {
              this.bmmpAttr = {
                subscriptionId: subscription.internalSubscriptionId,
                productInstanceId: subscription.productInstanceId,
                changeplanOverride: urlResponse,
              };
            }
            this.broadcastSingleSubscription(subscription, undefined);
          }
        });
      }
    });
  }

  private setBMMPTrial(subscription: ISubscription, userId: string): void {
    if (subscription.internalSubscriptionId) {
      this.upgradeTrialUrl(subscription.internalSubscriptionId).then((response: any): void => {
        if (response) {
          this.OnlineUpgradeService.getProductInstance(userId, subscription.internalSubscriptionId).then((prodResponse: IProdInst) => {
            if (prodResponse) {
              subscription.productInstanceId = prodResponse.productInstanceId;
              subscription.name = prodResponse.name;

              if (subscription.internalSubscriptionId && subscription.productInstanceId) {
                this.bmmpAttr = {
                  subscriptionId: subscription.internalSubscriptionId,
                  productInstanceId: subscription.productInstanceId,
                  changeplanOverride: '',
                };
              }
              this.broadcastSingleSubscription(subscription, response);
            }
          });
        }
        subscription.upgradeTrialUrl = response;
      });
    }
  }

  private hybridServicesRetrieval() {
    this.ServiceDescriptor.getServices().then((services) => {
      return this.ServiceDescriptor.filterEnabledServices(services);
    }).then((enabledServices) => {
      return _.map(enabledServices, (service: any) => {
        if (service.id === 'squared-fusion-uc' || service.id === 'squared-fusion-ec') {
          return this.$translate.instant(`hercules.serviceNames.${service.id}.full`);
        }
        return this.$translate.instant(`hercules.serviceNames.${service.id}`);
      });
    }).then((humanReadableServices) => {
      this.hybridServices = humanReadableServices;
    });
  }
}

angular
  .module('Core')
  .controller('MySubscriptionCtrl', MySubscriptionCtrl);
