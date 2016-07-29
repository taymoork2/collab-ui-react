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

    upgradeUrl(subId) {
      return subUrl + subId;
    }

    /* @ngInject */
    constructor($rootScope, $translate, $q, Authinfo, Orgservice, ServiceDescriptor) {
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
      let usageName = $translate.instant('subscriptions.usage');

      Orgservice.getLicensesUsage()
        .then(subscriptions => {
          if (_.isArray(subscriptions)) {
            subscriptions.forEach((subscription, subIndex) => {
              let newSubscription = {
                subscriptionId: undefined,
                licenses: [],
                isTrial: false,
                viewAll: false
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
                    tooltip: generateTooltip($translate.instant('subscriptions.licenseTypes.' + license.offerName), usageName, license.usage, license.volume),
                    class: undefined
                  };

                  _.forEach(licenseTypes, (type, index) => {
                    if ((license.offerName === type) && (index === 0)) {
                      offer.class = messageClass;
                      this._licenseCategory[0].subscriptions = addSubscription(this._licenseCategory[0].subscriptions, offer);
                    } else if ((license.offerName === type) && (index === 7)) {
                      offer.class = callClass;
                      this._licenseCategory[2].subscriptions = addSubscription(this._licenseCategory[2].subscriptions, offer);
                    } else if ((license.offerName === type) && (index === 8)) {
                      offer.class = meetingRoomClass;
                      this._licenseCategory[3].subscriptions = addSubscription(this._licenseCategory[3].subscriptions, offer);
                    } else if (license.offerName === type) {
                      if(index === 1) {
                        offer.class = meetingRoomClass;
                      } else {
                        offer.class = webexClass;
                      }
                      let existingSite = checkForSite(offer.siteUrl, this._licenseCategory[1].subscriptions);
                      if (existingSite) {
                        this._licenseCategory[1].subscriptions[existingSite].offers = addSubscription(this._licenseCategory[1].subscriptions[existingSite].offers, offer);
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

          if (this._subscriptionDetails.length === 1) {
            let broadcastData = {
              isOnline: this._isOnline,
              isTrial: this._subscriptionDetails[0].isTrial,
              url: this.upgradeUrl(this._subscriptionDetails[0].subscriptionId)
            };
            $rootScope.$broadcast('SUBSCRIPTION::upgradeData', broadcastData);
          }
        });

      ServiceDescriptor.servicesInOrg(Authinfo.getOrgId(), true)
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
              service.label = $translate.instant('overview.cards.hybrid.services.' + service.id);
              service.healthStatus = serviceStatusToCss[serviceStatusWeight.indexOf(service.status)] || serviceStatusToCss[0];
            });

            if (_.isArray(filteredServices) && filteredServices.length > 0) {
              this._hybridServices = filteredServices;
            }
          }
        });
    }
  }

  // generating the subscription view tooltips
  function generateTooltip(offerName, usageName, usage, volume) {
    if (_.isNumber(usage) && _.isNumber(volume)) {
      let tooltip = offerName + '<br>' + usageName
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

  // seperates out different sites for the license view
  function checkForSite(siteUrl, siteArray) {
    let found;
    if(_.isArray(siteArray)) {
      siteArray.forEach((sub, index) => {
        if (sub.siteUrl === siteUrl) {
          found = index;
        }
      });
    }
    return found;
  }

  // combines licenses for the license view
  function addSubscription(subscriptions, item) {
    let exists = false;

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

    return subscriptions;
  }

  angular
    .module('Core')
    .controller('MySubscriptionCtrl', MySubscriptionCtrl);
}
