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

  class MyCompanyPageSubscriptionCtrl {
    private _hybridServices = [];
    private _usageCategory = [];

    get hybridServices() {
      return this._hybridServices;
    }

    get usageCategory() {
      return this._usageCategory;
    }

    /* @ngInject */
    constructor($translate, Authinfo, Orgservice, ServiceDescriptor) {
      // message subscriptions
      this._usageCategory[0] = angular.copy(baseCategory);
      this._usageCategory[0].label = $translate.instant("subscriptions.message");

      // meeting subscriptions
      this._usageCategory[1] = angular.copy(baseCategory);
      this._usageCategory[1].label = $translate.instant("subscriptions.meeting");
      this._usageCategory[1].borders = true;
      
      // communication subscriptions
      this._usageCategory[2] = angular.copy(baseCategory);
      this._usageCategory[2].label = $translate.instant("subscriptions.call");
      
      // room system subscriptions
      this._usageCategory[3] = angular.copy(baseCategory);
      this._usageCategory[3].label = $translate.instant("subscriptions.room");

      Orgservice.getLicensesUsage()
        .then(subscriptions => {
          if (_.isArray(subscriptions)) {
            subscriptions.forEach((subscription, subIndex) => {
              var subscriptionId = undefined;
              if (subscription.subscriptionId && (subscription.subscriptionId !== "unknown")) {
                subscriptionId = subscription.subscriptionId;
              }

              subscription.licenses.forEach((license, licenseIndex) => {
                var subscription = {
                  licenseId: license.licenseId,
                  licenseType: license.licenseType,
                  offerName: license.offerName,
                  subscription: subscriptionId,
                  usage: license.usage,
                  volume: license.volume,
                  siteUrl: license.siteUrl,
                  id: 'donutId' + subIndex + licenseIndex
                };

                if (license.offerName === 'MS') {
                  this._usageCategory[0].subscriptions = addSubscription(this._usageCategory[0].subscriptions, subscription);
                } else if ((license.offerName === 'CF') || (license.offerName === 'MC') || (license.offerName === 'TC') || (license.offerName === 'EC') || (license.offerName === 'EE') || (license.offerName === 'CMR')) {
                  let existingSite = checkForSite(subscription.siteUrl, this._usageCategory[1].subscriptions);
                  if (existingSite) {
                    this._usageCategory[1].subscriptions[existingSite].offers.push(subscription);
                  } else if (subscription.siteUrl) {
                    this._usageCategory[1].subscriptions.push({
                      siteUrl: subscription.siteUrl,
                      offers: [subscription]
                    });
                  } else { // Meeting licenses not attached to a siteUrl should be grouped together at the front of the list
                    this._usageCategory[1].subscriptions.unshift({
                      siteUrl: subscription.siteUrl,
                      offers: [subscription]
                    });
                  }
                } else if (license.offerName === 'CO') {
                  this._usageCategory[2].subscriptions = addSubscription(this._usageCategory[2].subscriptions, subscription);
                } else if (license.offerName === 'SD') {
                  this._usageCategory[3].subscriptions = addSubscription(this._usageCategory[3].subscriptions, subscription);
                }
              });
            });
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

  function checkForSite(siteUrl, siteArray) {
    var found;
    if(_.isArray(siteArray)) {
      siteArray.forEach((sub, index) => {
        if (sub.siteUrl === siteUrl) {
          found = index;
        }
      });
    }
    return found;
  }

  function addSubscription(subscriptions, item) {
    if (subscriptions.length < 1) {
      subscriptions.push(item);
    } else {
      subscriptions[0].usage += item.usage;
      subscriptions[0].volume += item.volume;
    }

    return subscriptions;
  }

  angular
    .module('Core')
    .controller('MyCompanyPageSubscriptionCtrl', MyCompanyPageSubscriptionCtrl);
}
