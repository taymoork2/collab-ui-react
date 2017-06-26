import { DigitalRiverService } from 'modules/online/digitalRiver/digitalRiver.service';
import { Notification } from 'modules/core/notifications';
import { OnlineUpgradeService, IBmmpAttr, IProdInst } from 'modules/online/upgrade/upgrade.service';
import { SharedMeetingsReportService } from './sharedMeetings/sharedMeetingsReport.service';
import { IOfferData, IOfferWrapper, ISubscription, ISubscriptionCategory } from './subscriptionsInterfaces';
import * as moment from 'moment';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';

export class MySubscriptionCtrl {
  public hybridServices: any[] = [];
  public licenseCategory: ISubscriptionCategory[] = [];
  public subscriptionDetails: ISubscription[] = [];
  public visibleSubscriptions: boolean = false;
  public hasEnterpriseTrial: boolean = false;
  public trialUrlFailed: boolean = false;
  public productInstanceFailed: boolean = false;
  public loading: boolean = false;
  public digitalRiverSubscriptionsUrl: string;
  public isSharedMeetingsReportsEnabled: boolean;
  public temporarilyOverrideSharedMeetingsReportsFeatureToggle = { default: false, defaultValue: true };
  public bmmpAttr: IBmmpAttr;
  public licenseSummary: string;
  public subExpiration: string;
  public oneOnlineSub: boolean = false;
  public showSingleSub: boolean = false;

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
  private readonly SUBSCRIPTION_TYPES = {
    message: 0,
    meeting: 1,
    call: 2,
    room: 3,
    care: 4,
  };
  private readonly EXPIRATION_BADGES = {
    default: 'default',
    warning: 'warning',
    alert: 'alert',
  };
  private readonly EXPIRATION_DAYS = {
    warning: 30,
    alert: 5,
    expired: 0,
  };

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $rootScope: ng.IRootScopeService,
    private $translate: ng.translate.ITranslateService,
    private $window: ng.IWindowService,
    private Authinfo,
    private Config,
    private DigitalRiverService: DigitalRiverService,
    private FeatureToggleService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private Notification: Notification,
    private OnlineUpgradeService: OnlineUpgradeService,
    private Orgservice,
    private ServiceDescriptor,
    private SharedMeetingsReportService: SharedMeetingsReportService,
    private UrlConfig,
    private WebExUtilsFact,
  ) {
    _.forEach(this.SUBSCRIPTION_TYPES, (_value, key: string): void => {
      const category: ISubscriptionCategory = _.cloneDeep(this.BASE_CATEGORY);
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

  public isUsageDefined(usage?: number): boolean {
    return _.isNumber(usage);
  }

  public isSharedMeetingsLicense(offer: IOfferData): boolean {
    return _.toLower(_.get(offer, 'licenseModel', '')) === this.Config.licenseModel.cloudSharedMeeting;
  }

  public determineLicenseType(offer: IOfferData): string {
    return this.isSharedMeetingsLicense(offer) ? this.$translate.instant('firstTimeWizard.sharedLicenses') : this.$translate.instant('firstTimeWizard.namedLicenses');
  }

  public launchSharedMeetingsLicenseUsageReport(siteUrl: string): void {
    this.SharedMeetingsReportService.openModal(siteUrl);
  }

  private initFeatures(): void {
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
    if (_.isNumber(volume)) {
      let tooltip = this.$translate.instant('subscriptions.licenseTypes.' + offerName) + '<br>';
      if (this.useTotal(offerName) || !_.isNumber(usage)) {
        tooltip += this.$translate.instant('subscriptions.licenses') + volume;
      } else if (usage > volume) {
        tooltip += this.$translate.instant('subscriptions.usage') + `<span class="warning">${usage}/${volume}</span>`;
      } else {
        tooltip += this.$translate.instant('subscriptions.usage') + `${usage}/${volume}`;
      }
      return tooltip;
    } else {
      return;
    }
  }

  // combines licenses for the license view
  private addSubscription(index: number, item: IOfferData, siteIndex?: number): void {
    let offers: IOfferData[];
    let exists: boolean = false;

    if (_.isNumber(siteIndex)) {
      offers = _.get(this.licenseCategory, `[${index}].offerWrapper[${siteIndex}].offers`, []);
    } else {
      offers = _.get(this.licenseCategory, `[${index}].offers`, []);
    }

    _.forEach(offers, (offer: IOfferData): void => {
      if (!exists && offer.offerName === item.offerName) {
        if (offer.usage && item.usage) {
          offer.usage += item.usage;
        }
        offer.volume += item.volume;
        exists = true;
      }
    });

    if (!exists) {
      offers.push(item);
    }
  }

  private sortSubscription(index: number, siteIndex: number): void {
    const offers: IOfferData[] = _.get(this.licenseCategory, `[${index}].offerWrapper[${siteIndex}].offers`, []);
    this.licenseCategory[index].offerWrapper[siteIndex].offers = _.sortBy(offers, (element: IOfferData): number => {
      const rank = {
        CDC: 1,
        CVC: 2,
      };
      return rank[element.offerName];
    });
  }

  private subscriptionRetrieval(): void {
    this.Orgservice.getLicensesUsage(false).then((subscriptions: any[]): void => {
      _.forEach(subscriptions, (subscription: any, subIndex: number): void => {
        const newSubscription: ISubscription = {
          licenses: [],
          isTrial: false,
          isOnline: false,
          viewAll: false,
          numSubscriptions: subscriptions.length,
          endDate: '',
          badge: '',
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
        if (subscription.endDate) {
          const currentDate = new Date();
          const subscriptionEndDate = new Date(subscription.endDate);
          const timeDiff = subscriptionEndDate.getTime() - currentDate.getTime();
          const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

          newSubscription.endDate = this.$translate.instant('subscriptions.expires', { date: moment(subscriptionEndDate).format('MMM DD, YYYY') });
          if (diffDays > this.EXPIRATION_DAYS.warning) {
            newSubscription.badge = this.EXPIRATION_BADGES.default;
          } else if (diffDays > this.EXPIRATION_DAYS.alert) {
            newSubscription.badge = this.EXPIRATION_BADGES.warning;
          } else if (diffDays > this.EXPIRATION_DAYS.expired) {
            newSubscription.badge = this.EXPIRATION_BADGES.alert;
          } else {
            newSubscription.endDate = this.$translate.instant('subscriptions.expired');
            newSubscription.badge = this.EXPIRATION_BADGES.alert;
          }
        }

        _.forEach(subscription.licenses, (license: any, licenseIndex: number): void => {
          if (license.offerName in this.Config.offerCodes) {
            const offer: IOfferData = {
              licenseId: license.licenseId,
              licenseType: license.licenseType,
              licenseModel: _.get(license, 'licenseModel', ''),
              offerName: license.offerName,
              volume: license.volume,
              id: 'donutId' + subIndex + licenseIndex,
              tooltip: this.generateTooltip(license.offerName, license.usage, license.volume),
            };

            if (this.useTotal(license.offerName)) {
              offer.totalUsage = license.usage || 0;
            } else {
              offer.usage = license.usage || 0;
            }

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
              const existingIndex = _.findIndex(this.licenseCategory[this.SUBSCRIPTION_TYPES.care].offerWrapper, (sub: IOfferWrapper): boolean => {
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
            } else if (license.offerName !== this.Config.offerCodes.MGMTPRO) {
              if (license.offerName === this.Config.offerCodes.CF) {
                offer.class = this.MEETING_CLASS;
              } else {
                offer.class = this.WEBEX_CLASS;
              }

              const existingSite: number = _.findIndex(this.licenseCategory[this.SUBSCRIPTION_TYPES.meeting].offerWrapper, (sub: IOfferWrapper): boolean => {
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
          const licenseTypes: any[] = _.toArray(this.Config.offerCodes);
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

      if (this.subscriptionDetails.length > 1 ||
         (this.subscriptionDetails.length === 1 && !this.subscriptionDetails[0].isOnline)) {
        this.licenseSummary = this.$translate.instant('subscriptions.licenseSummary');
      } else if (this.subscriptionDetails.length === 1 && this.subscriptionDetails[0].isOnline) {
        this.oneOnlineSub = true;
      }

      if (_.find(this.subscriptionDetails, 'isOnline')) {
        // create cookie for Digital River
        this.DigitalRiverService.getDigitalRiverToken();
      }

      let enterpriseSubs = 1;
      let enterpriseTrials = 1;
      this.OnlineUpgradeService.getProductInstances(this.Authinfo.getUserId()).then((instances) => {
        _.forEach(this.subscriptionDetails, (subscription: ISubscription, index: number): void => {
          if (!subscription.isOnline) {
            if (subscription.isTrial) {
              this.subscriptionDetails[index].name = this.$translate.instant('subscriptions.enterpriseTrial', { number: enterpriseTrials++ });
              this.hasEnterpriseTrial = true;
            } else {
              let id = _.get(subscription, 'subscriptionId');
              if (_.isString(id) && id.length >= 4) {
                id = id.substr(id.length - 4);
                this.subscriptionDetails[index].name = this.$translate.instant('subscriptions.subscriptionNum', { number: id });
              } else {
                this.subscriptionDetails[index].name = this.$translate.instant('subscriptions.numberedName', { number: enterpriseSubs++ });
              }
            }
          } else {
            const prodResponse: IProdInst = _.find(instances, ['subscriptionId', subscription.internalSubscriptionId]);
            if (prodResponse.autoBilling) {
              this.subscriptionDetails[index].endDate = '';
            }
            if (subscription.isTrial) {
              this.setBMMPTrial(subscription, prodResponse);
            } else {
              this.setBMMP(subscription, prodResponse);
            }
            if (this.subscriptionDetails.length === 1) {
              this.licenseSummary = this.$translate.instant('subscriptions.licenseSummaryOnline', { name: prodResponse.name });
            }
          }
        });
        if (this.subscriptionDetails.length === 1 && (!this.subscriptionDetails[0].isTrial ||
            this.subscriptionDetails[0].isOnline) && this.subscriptionDetails[0].subscriptionId) {
          this.showSingleSub = true;
        }
      });
    });
  }

  private setBMMP(subscription: ISubscription, prodResponse: IProdInst): void {
    subscription.productInstanceId = prodResponse.productInstanceId;
    subscription.name = prodResponse.name;
    const env: string = _.includes(prodResponse.name, 'Spark') ? 'spark' : 'webex';
    // TODO Remove the changeplanOverride attribute in production once the
    // e-commerce team is ready.
    this.getChangeSubURL(env).then((urlResponse) => {
      subscription.changeplanOverride = '';
      if (this.Config.isProd() && urlResponse) {
        subscription.changeplanOverride = urlResponse;
      }

      if (subscription.internalSubscriptionId && subscription.productInstanceId) {
        this.bmmpAttr = {
          subscriptionId: subscription.internalSubscriptionId,
          productInstanceId: subscription.productInstanceId,
          changeplanOverride: subscription.changeplanOverride,
        };
      }
      this.broadcastSingleSubscription(subscription, undefined);
    });
  }

  private setBMMPTrial(subscription: ISubscription, prodResponse: IProdInst): void {
    if (subscription.internalSubscriptionId) {
      this.upgradeTrialUrl(subscription.internalSubscriptionId).then((response: any): void => {
        if (response) {
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
        subscription.upgradeTrialUrl = response;
      });
    }
  }

  private hybridServicesRetrieval() {
    this.ServiceDescriptor.getServices().then((services) => {
      return this.ServiceDescriptor.filterEnabledServices(services);
    }).then((enabledServices) => {
      enabledServices.sort((s1, s2) => this.HybridServicesUtilsService.hybridServicesComparator(s1.id, s2.id));
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

  private useTotal(offerName: string): boolean {
    return offerName === this.Config.offerCodes.SB || offerName === this.Config.offerCodes.SD;
  }
}
