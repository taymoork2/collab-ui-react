import './_mySubscription.scss';
import { DigitalRiverService } from 'modules/online/digitalRiver/digitalRiver.service';
import { Notification } from 'modules/core/notifications';
import { OnlineUpgradeService, IBmmpAttr, IProdInst } from 'modules/online/upgrade/upgrade.service';
import { SharedMeetingsReportService } from './sharedMeetings/sharedMeetingsReport.service';

const baseCategory = {
  label: undefined,
  subscriptions: [],
  borders: false,
};

// icon classes
const messageClass = 'icon-message';
const meetingRoomClass = 'icon-meeting-room';
const webexClass = 'icon-webex';
const callClass = 'icon-calls';
const careClass = 'icon-headset';

const licenseTypes = ['MS', 'CF', 'MC', 'TC', 'EC', 'EE', 'CMR', 'CO', 'SD', 'SB', 'CDC', 'CVC'];

class MySubscriptionCtrl {
  public hybridServices: any[] = [];
  public licenseCategory: any[] = [];
  public subscriptionDetails: any[] = [];
  public visibleSubscriptions = false;
  public hasEnterpriseTrial = false;
  public trialUrlFailed = false;
  public productInstanceFailed = false;
  public loading = false;
  public digitalRiverSubscriptionsUrl: string;
  public isSharedMeetingsReportsEnabled: boolean;
  public isSharedMeetingsEnabled: boolean;
  public temporarilyOverrideSharedMeetingsFeatureToggle = { default: true, defaultValue: true };
  public temporarilyOverrideSharedMeetingsReportsFeatureToggle = { default: false, defaultValue: true };
  public bmmpAttr: IBmmpAttr;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $rootScope: ng.IRootScopeService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private Config,
    private FeatureToggleService,
    private DigitalRiverService: DigitalRiverService,
    private OnlineUpgradeService: OnlineUpgradeService,
    private SharedMeetingsReportService: SharedMeetingsReportService,
    private Notification: Notification,
    private Orgservice,
    private ServiceDescriptor,
    private UrlConfig,
  ) {
    // message subscriptions
    this.licenseCategory[0] = _.cloneDeep(baseCategory);
    this.licenseCategory[0].label = $translate.instant('subscriptions.message');

    // meeting subscriptions
    this.licenseCategory[1] = _.cloneDeep(baseCategory);
    this.licenseCategory[1].label = $translate.instant('subscriptions.meeting');
    this.licenseCategory[1].borders = true;

    // communication subscriptions
    this.licenseCategory[2] = _.cloneDeep(baseCategory);
    this.licenseCategory[2].label = $translate.instant('subscriptions.call');

    // room system subscriptions
    this.licenseCategory[3] = _.cloneDeep(baseCategory);
    this.licenseCategory[3].label = $translate.instant('subscriptions.room');

    //care subscriptions
    this.licenseCategory[4] = _.cloneDeep(baseCategory);
    this.licenseCategory[4].label = $translate.instant('subscriptions.care');

    this.hybridServicesRetrieval();
    this.subscriptionRetrieval();
    this.initFeatures();
  }

  public isSharedMeetingsLicense(subscription) {
    return _.lowerCase(_.get(subscription, 'offers[0].licenseModel', '')) === this.Config.licenseModel.cloudSharedMeeting;
  }

  public determineLicenseType(subscription) {
    return this.isSharedMeetingsLicense(subscription) ? this.$translate.instant('firstTimeWizard.sharedLicenses') : this.$translate.instant('firstTimeWizard.namedLicenses');
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

  private upgradeTrialUrl(subId) {
    return this.$http.get(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/' + subId).then((response) => {
      if (response.data) {
        return response.data;
      } else {
        return this.emptyOnlineTrialUrl();
      }
    }).catch((error) => {
      return this.upgradeTrialErrorResponse(error, subId);
    });
  }

  private upgradeTrialErrorResponse(error, subId) {
    this.Notification.errorWithTrackingId(error, 'subscriptions.onlineTrialUpgradeUrlError', {
      trialId: subId,
    });
    return this.emptyOnlineTrialUrl();
  }

  private emptyOnlineTrialUrl() {
    this.trialUrlFailed = true;
    return undefined;
  }

  private getChangeSubURL(): ng.IPromise<string> {
    return this.DigitalRiverService.getSubscriptionsUrl().then((subscriptionsUrl) => {
      return subscriptionsUrl;
    }).catch((error) => {
      this.loading = false;
      this.Notification.errorWithTrackingId(error, 'subscriptions.loadError');
      return '';
    });
  }

  private broadcastSingleSubscription(subscription, trialUrl)  {
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
  private generateTooltip(offerName, usage, volume) {
    if (_.isNumber(usage) && _.isNumber(volume)) {
      let tooltip = this.$translate.instant('subscriptions.licenseTypes.' + offerName) + '<br>' + this.$translate.instant('subscriptions.usage');
      if (usage > volume) {
        tooltip += '<span class="warning">' + usage + '/' + volume + '</span>';
      } else {
        tooltip += usage + '/' + volume;
      }
      return tooltip;
    } else {
      return undefined;
    }
  }

  // combines licenses for the license view
  private addSubscription(index, item, existingSite) {
    let subscriptions;
    let exists = false;

    if (existingSite >= 0) {
      subscriptions = this.licenseCategory[index].subscriptions[existingSite].offers;
    } else {
      subscriptions = this.licenseCategory[index].subscriptions;
    }

    _.forEach(subscriptions, (subscription: any) => {
      if (!exists && subscription.offerName === item.offerName) {
        subscriptions[0].usage += item.usage;
        subscriptions[0].volume += item.volume;
        exists = true;
      }
    });

    if (!exists) {
      subscriptions.push(item);
    }
  }

  private subscriptionRetrieval() {
    this.Orgservice.getLicensesUsage().then((subscriptions) => {
      _.forEach(subscriptions, (subscription: any, subIndex: number) => {
        let newSubscription = {
          subscriptionId: undefined,
          internalSubscriptionId: undefined,
          licenses: [] as any[],
          isTrial: false,
          isOnline: false,
          viewAll: false,
          upgradeTrialUrl: undefined,
          productInstanceId: undefined,
          changeplanOverride: undefined,
          name: undefined,
          quantity: undefined,
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

        _.forEach(subscription.licenses, (license: any, licenseIndex: number) => {
          if (_.includes(licenseTypes, license.offerName)) {
            let offer = {
              licenseId: license.licenseId,
              licenseType: license.licenseType,
              licenseModel: _.get(license, 'licenseModel', ''),
              offerName: license.offerName,
              usage: license.usage,
              volume: license.volume,
              siteUrl: license.siteUrl,
              id: 'donutId' + subIndex + licenseIndex,
              tooltip: this.generateTooltip(license.offerName, license.usage, license.volume),
              class: '',
            };

            _.forEach(licenseTypes, (type: any, index: number) => {
              if (license.offerName === type) {
                switch (index) {
                  case 0: {
                    offer.class = messageClass;
                    this.addSubscription(0, offer, -1);
                    break;
                  }
                  case 7: {
                    offer.class = callClass;
                    this.addSubscription(2, offer, -1);
                    break;
                  }
                  case 8:
                  case 9: {
                    offer.class = meetingRoomClass;
                    this.addSubscription(3, offer, -1);
                    break;
                  }
                  case 10:
                  case 11: {
                    offer.class = careClass;
                    this.addSubscription(4, offer, -1);
                    break;
                  }
                  default: {
                    if (index === 1) {
                      offer.class = meetingRoomClass;
                    } else {
                      offer.class = webexClass;
                    }

                    let existingSite = _.findIndex(this.licenseCategory[1].subscriptions, (sub: any) => {
                      return sub.siteUrl === offer.siteUrl;
                    });

                    if (existingSite >= 0) {
                      this.addSubscription(1, offer, existingSite);
                    } else if (offer.siteUrl) {
                      this.licenseCategory[1].subscriptions.push({
                        siteUrl: offer.siteUrl,
                        offers: [offer],
                      });
                    } else { // Meeting licenses not attached to a siteUrl should be grouped together at the front of the list
                      this.licenseCategory[1].subscriptions.unshift({
                        siteUrl: offer.siteUrl,
                        offers: [offer],
                      });
                    }
                    break;
                  }
                }
              }
            });

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

      _.forEach(this.subscriptionDetails, (subscription: any, index: number) => {
        if (!subscription.isOnline) {
          if (subscription.isTrial) {
            this.subscriptionDetails[index].name = this.$translate.instant('customerPage.trial');
            this.hasEnterpriseTrial = true;
          }
        } else {
          const userId = this.Authinfo.getUserId();
          if (subscription.isTrial) {
            this.upgradeTrialUrl(subscription.internalSubscriptionId).then((response) => {
              if (response) {
                this.OnlineUpgradeService.getProductInstance(userId, subscription.internalSubscriptionId).then((prodResponse: IProdInst) => {
                  if (prodResponse) {
                    this.subscriptionDetails[index].productInstanceId = prodResponse.productInstanceId;
                    this.subscriptionDetails[index].name = prodResponse.name;
                    this.bmmpAttr = {
                      subscriptionId: this.subscriptionDetails[index].internalSubscriptionId,
                      productInstanceId: this.subscriptionDetails[index].productInstanceId,
                      changeplanOverride: '',
                    };
                    this.broadcastSingleSubscription(this.subscriptionDetails[index], response);
                  }
                });
              }
              subscription.upgradeTrialUrl = response;
            });
          } else {
            this.OnlineUpgradeService.getProductInstance(userId, subscription.internalSubscriptionId).then((prodResponse: IProdInst) => {
              if (prodResponse) {
                this.subscriptionDetails[index].productInstanceId = prodResponse.productInstanceId;
                this.subscriptionDetails[index].name = prodResponse.name;
                this.getChangeSubURL().then((urlResponse) => {
                  if (urlResponse) {
                    this.subscriptionDetails[index].changeplanOverride = urlResponse;
                    this.bmmpAttr = {
                      subscriptionId: this.subscriptionDetails[index].internalSubscriptionId,
                      productInstanceId: this.subscriptionDetails[index].productInstanceId,
                      changeplanOverride: urlResponse,
                    };

                    this.broadcastSingleSubscription(this.subscriptionDetails[index], undefined);
                  }
                });
              }
            });
          }
        }
      });
    });
  }

  private hybridServicesRetrieval() {
    this.ServiceDescriptor.getServices()
      .then(services => {
        return this.ServiceDescriptor.filterEnabledServices(services);
      })
      .then(enabledServices => {
        return _.map(enabledServices, (service: any) => {
          if (service.id === 'squared-fusion-uc' || service.id === 'squared-fusion-ec') {
            return this.$translate.instant(`hercules.serviceNames.${service.id}.full`);
          }
          return this.$translate.instant(`hercules.serviceNames.${service.id}`);
        });
      })
      .then(humanReadableServices => {
        this.hybridServices = humanReadableServices;
      });
  }
}

angular
  .module('Core')
  .controller('MySubscriptionCtrl', MySubscriptionCtrl);
