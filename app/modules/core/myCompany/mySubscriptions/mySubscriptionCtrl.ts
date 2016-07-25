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

  let licenseTypes = ['MS', 'CF', 'MC', 'TC', 'EC', 'EE', 'CMR', 'CO', 'SD']

  class MySubscriptionCtrl {
    private _hybridServices = [];
    private _licenseCategory = [];
    private _subscriptionDetails = [];
    private _visibleSubscriptions = false;

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

    /* @ngInject */
    constructor($translate, Authinfo, Orgservice, ServiceDescriptor) {
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

      Orgservice.getLicensesUsage()
        .then(subscriptions => {
          if (_.isArray(subscriptions)) {
            subscriptions.forEach((subscription, subIndex) => {
              let newSubscription = {
                subscriptionId: undefined,
                licenses: [],
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
                    id: 'donutId' + subIndex + licenseIndex
                  };

                  this._visibleSubscriptions = true;
                  newSubscription.licenses.push(offer);

                  _.forEach(licenseTypes, (type, index) => {
                    if ((license.offerName === type) && (index === 0)) {
                      this._licenseCategory[0].subscriptions = addSubscription(this._licenseCategory[0].subscriptions, offer);
                    } else if ((license.offerName === type) && (index === 7)) {
                      this._licenseCategory[2].subscriptions = addSubscription(this._licenseCategory[2].subscriptions, offer);
                    } else if ((license.offerName === type) && (index === 8)) {
                      this._licenseCategory[3].subscriptions = addSubscription(this._licenseCategory[3].subscriptions, offer);
                    } else if (license.offerName === type) {
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
