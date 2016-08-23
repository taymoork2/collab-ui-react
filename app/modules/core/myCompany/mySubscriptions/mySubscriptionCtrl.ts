import { DigitalRiverService } from '../digitalRiver/digitalRiver.service';

const baseCategory = {
  label: undefined,
  subscriptions: [],
  borders: false
};

// hybrid service types
const fusionUC = 'squared-fusion-uc';
const fusionEC = 'squared-fusion-ec';
const fusionCAL = 'squared-fusion-cal';
const fusionMGT = 'squared-fusion-mgmt';

// hybrid service weight/status
const serviceStatusWeight:Array<String> = [ "undefined", "ok","warn", "error" ];
const serviceStatusToCss:Array<String> = [ "warning", "success", "warning", "danger" ];

// icon classes
const messageClass = 'icon-message';
const meetingRoomClass = 'icon-meeting-room';
const webexClass = 'icon-webex';
const callClass = 'icon-calls';

const licenseTypes = ['MS', 'CF', 'MC', 'TC', 'EC', 'EE', 'CMR', 'CO', 'SD', 'SB'];

class MySubscriptionCtrl {
  public hybridServices = [];
  public licenseCategory = [];
  public subscriptionDetails = [];
  public visibleSubscriptions = false;
  public isOnline = false;
  public trialUrlFailed = false;
  public loading = false;
  public digitalRiverSubscriptionsUrl: string;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private $rootScope: ng.IRootScopeService,
    private $sce: ng.ISCEService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private DigitalRiverService: DigitalRiverService,
    private Notification,
    private Orgservice,
    private ServiceDescriptor,
    private UrlConfig
  ) {
    // message subscriptions
    this.licenseCategory[0] = angular.copy(baseCategory);
    this.licenseCategory[0].label = $translate.instant("subscriptions.message");

    // meeting subscriptions
    this.licenseCategory[1] = angular.copy(baseCategory);
    this.licenseCategory[1].label = $translate.instant("subscriptions.meeting");
    this.licenseCategory[1].borders = true;

    // communication subscriptions
    this.licenseCategory[2] = angular.copy(baseCategory);
    this.licenseCategory[2].label = $translate.instant("subscriptions.call");

    // room system subscriptions
    this.licenseCategory[3] = angular.copy(baseCategory);
    this.licenseCategory[3].label = $translate.instant("subscriptions.room");

    this.isOnline = Authinfo.isOnline();

    if (this.isOnline) {
      this.initIframe();
    } else {
      this.hybridServicesRetrieval();
    }
    this.subscriptionRetrieval();
  };

  private initIframe(): void {
    this.loading = true;
    this.DigitalRiverService.getDigitalRiverSubscriptionsUrl().then((subscriptionsUrl) => {
      this.digitalRiverSubscriptionsUrl = this.$sce.trustAsResourceUrl(subscriptionsUrl);
    }).catch((response) => {
      this.loading = false;
      this.Notification.errorWithTrackingId(response, 'subscriptions.loadError');
    });
  }

  private upgradeTrialUrl(subId) {
    return this.$http.get(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/' + subId).then((response) => {
      if (response.data) {
        return response.data;
      } else {
        return this.emptyOnlineTrialUrl();
      }
    }, (error) => {
      return this.upgradeTrialErrorResponse(error, subId);
    });
  };

  private upgradeTrialErrorResponse(error, subId) {
    this.Notification.errorWithTrackingId(error, 'subscriptions.onlineTrialUpgradeUrlError', {
      trialId: subId
    });
    return this.emptyOnlineTrialUrl();
  };

  private emptyOnlineTrialUrl() {
    this.trialUrlFailed = true;
    return undefined;
  };

  private broadcastSingleSubscription(subscription, trialUrl)  {
    this.$rootScope.$broadcast('SUBSCRIPTION::upgradeData', {
      isTrial: subscription.isTrial,
      subId: subscription.subscriptionId,
      upgradeTrialUrl: trialUrl
    });
  };

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
  };

  // combines licenses for the license view
  private addSubscription(index, item, existingSite) {
    let subscriptions = undefined;
    let exists = false;

    if (existingSite >= 0) {
      subscriptions = this.licenseCategory[index].subscriptions[existingSite].offers;
    } else {
      subscriptions = this.licenseCategory[index].subscriptions;
    }

    _.forEach(subscriptions, (subscription: any) => {
      if(!exists && subscription.offerName === item.offerName){
        subscriptions[0].usage += item.usage;
        subscriptions[0].volume += item.volume;
        exists = true;
      }
    });

    if (!exists) {
      subscriptions.push(item);
    }
  };

  private subscriptionRetrieval() {
    this.Orgservice.getLicensesUsage().then((subscriptions) => {
      _.forEach(subscriptions, (subscription: any, subIndex: number) => {
        let newSubscription = {
          subscriptionId: undefined,
          licenses: [],
          isTrial: false,
          viewAll: false,
          upgradeTrialUrl: undefined
        };
        if (subscription.subscriptionId && (subscription.subscriptionId !== "unknown")) {
          newSubscription.subscriptionId = subscription.subscriptionId;
        }

        _.forEach(subscription.licenses, (license: any, licenseIndex: number) => {
          if (_.includes(licenseTypes, license.offerName)) {
            let offer = {
              licenseId: license.licenseId,
              licenseType: license.licenseType,
              offerName: license.offerName,
              usage: license.usage,
              volume: license.volume,
              siteUrl: license.siteUrl,
              id: 'donutId' + subIndex + licenseIndex,
              tooltip: this.generateTooltip(license.offerName, license.usage, license.volume),
              class: undefined
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
                  default: {
                    if(index === 1) {
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
                        offers: [offer]
                      });
                    } else { // Meeting licenses not attached to a siteUrl should be grouped together at the front of the list
                      this.licenseCategory[1].subscriptions.unshift({
                        siteUrl: offer.siteUrl,
                        offers: [offer]
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
          // sort licenses into display order/order for determining subscription name
          newSubscription.licenses.sort((a, b) => {
            return licenseTypes.indexOf(a.offerName) - licenseTypes.indexOf(b.offerName)
          });
          this.subscriptionDetails.push(newSubscription);
        }
      });

      _.forEach(this.subscriptionDetails, (subscription: any) => {
        if (subscription.isTrial && this.isOnline) {
          this.upgradeTrialUrl(subscription.subscriptionId).then((response) => {
            if (response && this.subscriptionDetails.length === 1) {
              this.broadcastSingleSubscription(this.subscriptionDetails[0], response);
            }
            subscription.upgradeTrialUrl = response;
          });
        } else if (this.subscriptionDetails.length === 1) {
          this.broadcastSingleSubscription(this.subscriptionDetails[0], undefined);
        }
      });

      if (this.isOnline && this.subscriptionDetails.length > 1) {
        this.$timeout(() => {
          bmmp.init(null, null, this.Authinfo.getOrgId(), 'atlas', this.$translate.use(), null, this.UrlConfig.getBmmpUrl());
        }, 300);
      }
    });
  };

  private hybridServicesRetrieval() {
    this.ServiceDescriptor.servicesInOrg(this.Authinfo.getOrgId(), true)
      .then(services => {
        if(_.isArray(services)) {
          let callServices = services.filter((service) => {
            return service.id === fusionUC || service.id === fusionEC;
          });
          let filteredServices = services.filter((service) => {
            return service.id === fusionCAL || service.id === fusionMGT;
          });

          if (callServices.length > 0) {
            let callService = {
              id: fusionUC,
              enabled: _.every(callServices, {
                enabled: true
              }),
              status: _.reduce(callServices, (result:String, serv) => {
                return serviceStatusWeight.indexOf(serv.status) > serviceStatusWeight.indexOf(result) ? serv.status : result;
              }, serviceStatusWeight[1])
            };

            if (callService.enabled) {
              filteredServices.push(callService);
            }
          }

          _.forEach(filteredServices, (service: any) => {
            service.label = this.$translate.instant('overview.cards.hybrid.services.' + service.id);
            service.healthStatus = serviceStatusToCss[serviceStatusWeight.indexOf(service.status)] || serviceStatusToCss[0];
          });

          if (_.isArray(filteredServices) && filteredServices.length > 0) {
            this.hybridServices = filteredServices;
          }
        }
      });
  };
}

angular
  .module('Core')
  .controller('MySubscriptionCtrl', MySubscriptionCtrl);
