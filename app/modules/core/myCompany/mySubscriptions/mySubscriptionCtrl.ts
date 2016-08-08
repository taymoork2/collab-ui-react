namespace myCompanyPage {
  let baseCategory = {
    label: undefined,
    subscriptions: [],
    borders: false
  };

  // hybrid service types
  let fusionUC = 'squared-fusion-uc';
  let fusionEC = 'squared-fusion-ec';
  let fusionCAL = 'squared-fusion-cal';
  let fusionMGT = 'squared-fusion-mgmt';

  // hybrid service weight/status
  let serviceStatusWeight:Array<String> = [ "undefined", "ok","warn", "error" ];
  let serviceStatusToCss:Array<String> = [ "warning", "success", "warning", "danger" ];

  let licenseTypes = ['MS', 'CF', 'MC', 'TC', 'EC', 'EE', 'CMR', 'CO', 'SD'];
  let subUrl = "http://gc.digitalriver.com/store?SiteID=ciscoctg&Action=DisplaySelfServiceSubscriptionLandingPage&futureAction=DisplaySelfServiceSubscriptionUpgradePage&subscriptionID=";
  let trial = "trial"

  // icon classes
  let messageClass = 'icon-message';
  let meetingRoomClass = 'icon-meeting-room';
  let webexClass = 'icon-webex';
  let callClass = 'icon-calls';

  class MySubscriptionCtrl {
    private _hybridServices = [];
    private _licenseCategory = [];
    private _subscriptionDetails = [];
    private _visibleSubscriptions = false;
    private _isOnline = false;
    private _trialUrlFailed = false;

    get hybridServices() {
      return this._hybridServices;
    }

    get licenseCategory() {
      return this._licenseCategory;
    }

    get subscriptionDetails() {
      return this._subscriptionDetails;
    }

    get visibleSubscriptions() {
      return this._visibleSubscriptions;
    }

    get isOnline() {
      return this._isOnline;
    }

    get trialUrlFailed() {
      return this._trialUrlFailed;
    }

    upgradeUrl(subId) {
      return subUrl + subId;
    }

    /* @ngInject */
    constructor(
      private $rootScope: ng.IRootScopeService,
      private $http: ng.IHttpService,
      private $translate,
      private $q: ng.IQService,
      private Authinfo,
      private Orgservice,
      private ServiceDescriptor,
      private UrlConfig,
      private Notification
    ) {
      // message subscriptions
      this._licenseCategory[0] = angular.copy(baseCategory);
      this._licenseCategory[0].label = $translate.instant("subscriptions.message");

      // meeting subscriptions
      this._licenseCategory[1] = angular.copy(baseCategory);
      this._licenseCategory[1].label = $translate.instant("subscriptions.meeting");
      this._licenseCategory[1].borders = true;
      
      // communication subscriptions
      this._licenseCategory[2] = angular.copy(baseCategory);
      this._licenseCategory[2].label = $translate.instant("subscriptions.call");
      
      // room system subscriptions
      this._licenseCategory[3] = angular.copy(baseCategory);
      this._licenseCategory[3].label = $translate.instant("subscriptions.room");

      this._isOnline = Authinfo.isOnline();
      this.subscriptionRetrieval();
      this.hybridServicesRetrieval();
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
      this._trialUrlFailed = true;
      return undefined;
    };

    private broadcastSingleSubscription(subscription, trialUrl)  {
      this.$rootScope.$broadcast('SUBSCRIPTION::upgradeData', {
        isTrial: subscription.isTrial,
        subId: subscription.subscriptionId,
        url: this.upgradeUrl(subscription.subscriptionId),
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

    // seperates out different sites for the license view
    private checkForSite(siteUrl, siteArray) {
      let found;
      if(_.isArray(siteArray)) {
        siteArray.forEach((sub, index) => {
          if (sub.siteUrl === siteUrl) {
            found = index;
          }
        });
      }
      return found;
    };

    // combines licenses for the license view
    private addSubscription(index, item, existingSite) {
      let subscriptions = undefined;
      let exists = false;

      if (existingSite) {
        subscriptions = this._licenseCategory[index].subscriptions[existingSite].offers;
      } else {
        subscriptions = this._licenseCategory[index].subscriptions;
      }

      if(_.isArray(subscriptions)) {
        subscriptions.forEach((subscription) => {
          if(!exists && subscription.offerName === item.offerName){
            subscriptions[0].usage += item.usage;
            subscriptions[0].volume += item.volume;
            exists = true;
          }
        });
      }

      if (!exists) {
        subscriptions.push(item);
      }
    };

    private subscriptionRetrieval() {
      this.Orgservice.getLicensesUsage().then((subscriptions) => {
        if (_.isArray(subscriptions)) {
          subscriptions.forEach((subscription, subIndex) => {
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

            subscription.licenses.forEach((license, licenseIndex) => {
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

                _.forEach(licenseTypes, (type, index) => {
                  if ((license.offerName === type) && (index === 0)) {
                    offer.class = messageClass;
                    this.addSubscription(0, offer, undefined);
                  } else if ((license.offerName === type) && (index === 7)) {
                    offer.class = callClass;
                    this.addSubscription(2, offer, undefined);
                  } else if ((license.offerName === type) && (index === 8)) {
                    offer.class = meetingRoomClass;
                    this.addSubscription(3, offer, undefined);
                  } else if (license.offerName === type) {
                    if(index === 1) {
                      offer.class = meetingRoomClass;
                    } else {
                      offer.class = webexClass;
                    }
                    let existingSite = this.checkForSite(offer.siteUrl, this._licenseCategory[1].subscriptions);
                    if (existingSite) {
                      this.addSubscription(1, offer, existingSite);
                    } else if (offer.siteUrl) {
                      this._licenseCategory[1].subscriptions.push({
                        siteUrl: offer.siteUrl,
                        offers: [offer]
                      });
                    } else { // Meeting licenses not attached to a siteUrl should be grouped together at the front of the list
                      this._licenseCategory[1].subscriptions.unshift({
                        siteUrl: offer.siteUrl,
                        offers: [offer]
                      });
                    }
                  }

                });

                this._visibleSubscriptions = true;
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
              this._subscriptionDetails.push(newSubscription);
            }
          });
        }

        this._subscriptionDetails.forEach((subscription) => {
          if (subscription.isTrial && this._isOnline) {
            this.upgradeTrialUrl(subscription.subscriptionId).then((response) => {
              if (response && this._subscriptionDetails.length === 1) {
                this.broadcastSingleSubscription(this._subscriptionDetails[0], response);
              }
              subscription.upgradeTrialUrl = response;
            });
          } else if (this._subscriptionDetails.length === 1) {
            this.broadcastSingleSubscription(this._subscriptionDetails[0], undefined);
          }
        });
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
                enabled: _.all(callServices, {
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

            angular.forEach(filteredServices, (service) => {
              service.label = this.$translate.instant('overview.cards.hybrid.services.' + service.id);
              service.healthStatus = serviceStatusToCss[serviceStatusWeight.indexOf(service.status)] || serviceStatusToCss[0];
            });

            if (_.isArray(filteredServices) && filteredServices.length > 0) {
              this._hybridServices = filteredServices;
            }
          }
        });
    };
  }

  angular
    .module('Core')
    .controller('MySubscriptionCtrl', MySubscriptionCtrl);
}
