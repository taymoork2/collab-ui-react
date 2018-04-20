(function () {
  'use strict';

  var DiagnosticKey = require('../../metrics').DiagnosticKey;

  angular.module('Core')
    .service('PartnerService', PartnerService)
    .factory('ScimPatchService', ScimPatchService);

  /* @ngInject */
  function PartnerService($http, $rootScope, $q, $resource, $translate, Analytics, Authinfo, Config, MetricsService, TrialService, UrlConfig, UserRoleService) {
    var managedOrgsUrl = UrlConfig.getAdminServiceUrl() + 'organizations/%s/managedOrgs';
    var siteListUrl = UrlConfig.getAdminServiceUrl() + 'organizations/%s/sitesProvOrderStatus';
    var patchAdminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/:orgId/users/:userId/actions/configureCustomerAdmin/invoke?customerOrgId=:customerOrgId';

    var customerStatus = {
      FREE: 0,
      TRIAL: 1,
      ACTIVE: 2,
      CANCELED: 99,
      NO_LICENSE: -1,
      NOTE_DAYS_LEFT: 100,
    };

    var helpers = {
      createConferenceMapping: _createConferenceMapping,
      createRoomDeviceMapping: _createRoomDeviceMapping,
      createLicenseMapping: _createLicenseMapping,
      createFreeServicesMapping: _createFreeServicesMapping,
      LicensedService: _LicensedService,
      addService: _addService,
      removeFromFreeServices: _removeFromFreeServices,
      isDisplayableService: _isDisplayableService,
      calculatePurchaseStatus: _calculatePurchaseStatus,
      calculateTotalLicenses: _calculateTotalLicenses,
      countUniqueServices: _countUniqueServices,
      isServiceNotLicensed: _isServiceNotLicensed,
    };

    var factory = {
      customerStatus: customerStatus,
      getAccountStatus: getAccountStatus,
      getManagedOrgsList: getManagedOrgsList,
      modifyManagedOrgs: modifyManagedOrgs,
      isLicenseATrial: isLicenseATrial,
      isLicenseActive: isLicenseActive,
      isLicenseFree: isLicenseFree,
      getLicense: getLicense,
      isLicenseInfoAvailable: isLicenseInfoAvailable,
      setServiceSortOrder: setServiceSortOrder,
      setNotesSortOrder: setNotesSortOrder,
      loadRetrievedDataToList: loadRetrievedDataToList,
      exportCSV: exportCSV,
      parseLicensesAndOffers: parseLicensesAndOffers,
      getFreeOrActiveServices: getFreeOrActiveServices,
      getSiteUrls: getSiteUrls,
      isLicenseTypeAny: isLicenseTypeAny,
      getTrialMeetingServices: getTrialMeetingServices,
      canAdminTrial: canAdminTrial,
      isServiceManagedByCurrentPartner: isServiceManagedByCurrentPartner,
      isServiceManagedByCustomer: isServiceManagedByCustomer,
      updateOrgForCustomerView: updateOrgForCustomerView,
      helpers: helpers,
    };

    return factory;

    function _createConferenceMapping() {
      var conferenceMapping = {};
      conferenceMapping[Config.offerCodes.CF] = {
        translatedOfferCode: $translate.instant('trials.meeting'),
        order: 1,
      };
      conferenceMapping[Config.offerCodes.MC] = {
        translatedOfferCode: $translate.instant('customerPage.MC'),
        order: 2,
      };
      conferenceMapping[Config.offerCodes.EE] = {
        translatedOfferCode: $translate.instant('customerPage.EE'),
        order: 3,
      };
      conferenceMapping[Config.offerCodes.TC] = {
        translatedOfferCode: $translate.instant('customerPage.TC'),
        order: 4,
      };
      conferenceMapping[Config.offerCodes.SC] = {
        translatedOfferCode: $translate.instant('customerPage.SC'),
        order: 5,
      };
      conferenceMapping[Config.offerCodes.EC] = {
        translatedOfferCode: $translate.instant('customerPage.EC'),
        order: 6,
      };
      conferenceMapping[Config.offerCodes.CMR] = {
        translatedOfferCode: $translate.instant('customerPage.CMR'),
        order: 7,
      };

      conferenceMapping = _.mapValues(conferenceMapping, function (offer) {
        return {
          name: offer.translatedOfferCode,
          order: offer.order,
          icon: 'icon-circle-group',
          licenseType: Config.licenseTypes.CONFERENCING,
        };
      });
      return conferenceMapping;
    }

    function _createRoomDeviceMapping() {
      var offerMapping = {};
      offerMapping[Config.offerCodes.SD] = {
        translatedOfferCode: $translate.instant('trials.roomSystem'),
        order: 6,
      };
      offerMapping[Config.offerCodes.SB] = {
        translatedOfferCode: $translate.instant('trials.sparkBoardSystem'),
        order: 7,
      };

      offerMapping = _.mapValues(offerMapping, function (offer) {
        return {
          name: offer.translatedOfferCode,
          order: offer.order,
          licenseType: Config.licenseTypes.SHARED_DEVICES,
        };
      });

      return offerMapping;
    }

    function _createLicenseMapping() {
      var licenseMapping = {};
      licenseMapping[Config.licenseTypes.MESSAGING] = {
        name: $translate.instant('trials.message'),
        icon: 'icon-circle-message',
        order: 0,
      };

      licenseMapping[Config.licenseTypes.COMMUNICATION] = {
        name: $translate.instant('trials.call'),
        icon: 'icon-circle-call',
        order: 3,
      };

      licenseMapping[Config.licenseTypes.SHARED_DEVICES] = {
        name: $translate.instant('subscriptions.room'),
        icon: 'icon-circle-telepresence',
        isRoom: true,
        order: 6,
      };

      licenseMapping[Config.licenseTypes.CARE] = {
        name: $translate.instant('trials.sparkCare'),
        icon: 'icon-circle-contact-centre',
        order: 5,
      };
      return licenseMapping;
    }

    function _createFreeServicesMapping() {
      var freeServices = [{
        licenseType: Config.licenseTypes.MESSAGING,
        name: $translate.instant('trials.message'),
        icon: 'icon-circle-message',
        code: Config.offerCodes.MS,
        qty: 0,
        free: true,
        order: 20,

      }, {
        licenseType: Config.licenseTypes.CONFERENCING,
        name: $translate.instant('customerPage.meeting'),
        icon: 'icon-circle-group',
        code: Config.offerCodes.CF,
        qty: 0,
        free: true,
        order: 21,
      }, {
        licenseType: Config.licenseTypes.COMMUNICATION,
        name: $translate.instant('trials.call'),
        icon: 'icon-circle-call',
        code: Config.offerCodes.CO,
        qty: 0,
        free: true,
        order: 22,
      }];
      return freeServices;
    }

    function _LicensedService(licenseInfo, mapping, customerOrgId) {
      var isConference = (mapping[Config.offerCodes.CF] !== undefined);
      var service;
      if (isConference) {
        service = (licenseInfo.offerName) ? mapping[licenseInfo.offerName] : mapping[Config.offerCodes.CF];
      } else {
        service = mapping[licenseInfo.licenseType] || mapping[licenseInfo.offerName];
        if (!service) {
          // TODO: remove after identifying unhandled offers
          var licenseInfoDebug = _.pick(licenseInfo, ['capacity', 'features', 'isCIUnifiedSite', 'isTrial', 'licenseId', 'licenseType', 'offerName', 'partnerOrgId', 'status', 'trialId', 'volume']);
          licenseInfoDebug.customerOrgId = customerOrgId;
          MetricsService.trackDiagnosticMetric(DiagnosticKey.LICENSE_MAP_ERROR, licenseInfoDebug);
        } else {
          service.licenseType = licenseInfo.licenseType;
        }
      }
      if (service) {
        _.assign(this, service);
        this.qty = licenseInfo.volume || 0;
      }
    }

    function _addService(services, service) {
      if (!service || _.isEmpty(service)) {
        return;
      }
      var existingService = _.find(services, {
        name: service.name,
      });
      if (existingService) {
        existingService.qty = existingService.qty + service.qty;
      } else {
        services.push(service);
      }
    }

    function _removeFromFreeServices(freeServices, service) {
      //remove trial or paid services from 'free'
      _.remove(freeServices, function (freeService) {
        if (service.offerName) {
          return freeService.licenseType === service.licenseType && freeService.code === service.offerName;
        } else {
          return freeService.licenseType === service.licenseType;
        }
      });
    }

    function _isDisplayableService(service, options) {
      var isTrial = options.isTrial;
      var isShowCMR = options.isShowCMR;
      var isCareEnabled = options.isCareEnabled;
      var isAdvanceCareEnabled = options.isAdvanceCareEnabled;
      var hiddenWebexServices = [Config.licenseTypes.STORAGE, Config.licenseTypes.AUDIO];
      var isWebexServiceHidden = _.includes(hiddenWebexServices, service.licenseType);
      var isServiceProPack = service.licenseType === Config.licenseTypes.MANAGEMENT;

      var serviceNotCareOrCareIsShown = (service.licenseType !== Config.licenseTypes.CARE || isCareEnabled) &&
        (service.licenseType !== Config.licenseTypes.ADVANCE_CARE || isAdvanceCareEnabled);
      var serviceNotHiddenWebex = (!isWebexServiceHidden && (isShowCMR || service.licenseType !== Config.licenseTypes.CMR));

      //if 'isTrial' it has to be true. Otherwise any false value is fine
      var correctServiceStatus = true;
      if (isTrial !== undefined) {
        correctServiceStatus = (isTrial) ? (service.isTrial === true) : !service.isTrial;
      }
      return (serviceNotHiddenWebex && serviceNotCareOrCareIsShown && correctServiceStatus && !isServiceProPack);
    }

    function getManagedOrgsList(searchText) {
      return $http.get(_.replace(managedOrgsUrl, '%s', Authinfo.getOrgId()), {
        params: {
          customerName: searchText,
        },
      });
    }

    function modifyManagedOrgs(customerOrgId) {
      return $q(function (resolve) {
        if (_.includes(Authinfo.getManagedOrgs(), customerOrgId)) {
          resolve();
        } else {
          var primaryEmail = Authinfo.getPrimaryEmail();
          Analytics.trackPartnerActions(Analytics.sections.TRIAL.eventNames.PATCH, Authinfo.getUserOrgId(), Authinfo.getUserId());
          resolve(UserRoleService.enableFullAdmin(primaryEmail, customerOrgId));
        }
      });
    }

    function updateOrgForCustomerView(customerOrgId) {
      var params = {
        orgId: Authinfo.getOrgId(),
        userId: Authinfo.getUserId(),
        customerOrgId: customerOrgId,
      };

      return $resource(patchAdminUrl, params).save().$promise;
    }

    function getLicenseObj(rowData, licenseTypeField) {
      return rowData[licenseTypeField] || null;
    }

    // Series of fns dont make any sense, unless isTrial = null means something...
    function isLicenseATrial(license) {
      return license && license.isTrial === true;
    }

    function isLicenseActive(license) {
      return license && license.isTrial === false;
    }

    function isLicenseFree(license) {
      return license && _.isUndefined(license.isTrial);
    }
    // end series of fn's

    function isLicenseTypeAny(customerData, licenseTypeField) {
      if (!isLicenseInfoAvailable(customerData)) {
        return false;
      }
      if (licenseTypeField === 'webex') {
        // if given generic "webex" check all possibilities
        return _.some(Config.webexTypes, function (webexType) {
          var licenseObj = getLicenseObj(customerData, webexType);
          return isLicenseATrial(licenseObj) || isLicenseActive(licenseObj);
        });
      } else {
        var licenseObj = getLicenseObj(customerData, licenseTypeField);
        var isFreeLicense = isLicenseFree(licenseObj) && _.includes(Config.freeLicenses, licenseTypeField);
        return isLicenseATrial(licenseObj) || isLicenseActive(licenseObj) || isFreeLicense;
      }
    }

    function getLicense(licenses, offerCode) {
      var offers = _.filter(licenses, {
        offerName: offerCode,
      });
      return (offers.length === 0) ? {} : offers;
    }

    function isLicenseInfoAvailable(rowData) {
      return _.isArray(_.get(rowData, 'licenseList'));
    }

    function setServiceSortOrder(license) {
      if (_.isEmpty(license)) {
        license.sortOrder = customerStatus.NO_LICENSE;
      } else if (license.status === 'CANCELED') {
        license.sortOrder = customerStatus.CANCELED;
      } else if (isLicenseFree(license)) {
        license.sortOrder = customerStatus.FREE;
      } else if (isLicenseATrial(license)) {
        license.sortOrder = customerStatus.TRIAL;
      } else if (isLicenseActive(license)) {
        license.sortOrder = customerStatus.ACTIVE;
      } else {
        license.sortOrder = customerStatus.NO_LICENSE;
      }
    }

    function hasTrialLicenses(rowData) {
      return _.some(Config.licenseObjectNames, function (type) {
        return isLicenseInfoAvailable(rowData) && isLicenseATrial(getLicenseObj(rowData, type));
      });
    }

    function getAccountStatus(rowData) {
      var status = 'active';
      var hasTrial = hasTrialLicenses(rowData);

      if (hasTrial) {
        if (rowData.purchased) {
          status = (rowData.daysLeft < 0) ? 'purchasedWithExpired' : 'purchasedWithActive';
        } else {
          status = (rowData.daysLeft < 0) ? 'expired' : 'trial';
        }
      } else if (_.isEmpty(rowData.licenseList)) {
        status = 'expired';
      }

      return status;
    }

    function setNotesSortOrder(rowData) {
      var notes = {};
      var key = 'licenseInfoNotAvailable';
      var hasTrial = hasTrialLicenses(rowData);

      notes.daysLeft = rowData.daysLeft;
      if (isLicenseInfoAvailable(rowData)) {
        if (rowData.status === 'CANCELED') {
          key = 'suspended';
        } else if (rowData.purchased && !hasTrial) {
          key = 'purchased';
        } else if (rowData.customerOrgId === Authinfo.getOrgId()) {
          key = 'myOrganization';
        } else if (rowData.status === 'ACTIVE' || rowData.status === 'EXPIRED') {
          notes.sortOrder = customerStatus.NOTE_DAYS_LEFT;
          if (rowData.daysLeft > 0) {
            notes.text = $translate.instant('customerPage.daysLeftToPurchase', {
              count: rowData.daysLeft,
            }, 'messageformat');
          } else if (rowData.daysLeft === 0) {
            key = 'expiringToday';
          } else if (rowData.daysLeft < 0) {
            if (rowData.accountStatus === 'pending') {
              key = 'needsSetup';
            } else if (rowData.startDate && _.inRange(rowData.daysLeft, 0, Config.trialGracePeriod)) {
              notes.text = $translate.instant('customerPage.expiredWithGracePeriod', {
                count: rowData.daysLeft - Config.trialGracePeriod,
              }, 'messageformat');
            } else {
              key = 'expired';
            }
          }
        }
      }

      if (_.isUndefined(notes.text)) {
        notes.text = $translate.instant('customerPage.' + key);
      }
      rowData.notes = notes;
    }

    function loadRetrievedDataToList(list, options) {
      return _.map(list, function (customer) {
        return massageDataForCustomer(customer, options);
      });
    }

    function massageDataForCustomer(customer, options) {
      var edate = moment(customer.startDate).add(customer.trialPeriod, 'days').format('MMM D, YYYY');
      var dataObj = {
        accountStatus: '',
        trialId: customer.trialId,
        customerOrgId: customer.customerOrgId || customer.id,
        customerName: customer.customerName || customer.displayName || '',
        customerEmail: customer.customerEmail || customer.email,
        endDate: edate,
        startDate: customer.startDate,
        numUsers: customer.allUsers || 0, // sometimes we get back undefined users, temp workaround
        activeUsers: customer.activeUsers || 0,
        daysLeft: -1,
        usage: 0,
        licenses: 0,
        deviceLicenses: 0,
        licenseList: [],
        orderedServices: {},
        messaging: null,
        conferencing: null,
        communications: null,
        roomSystems: null,
        sparkConferencing: null,
        webexEEConferencing: null,
        webexCMR: null,
        care: null,
        advanceCare: null,
        daysUsed: 0,
        percentUsed: 0,
        duration: customer.trialPeriod || 0,
        dealId: customer.dealId,
        offer: {},
        offers: customer.offers,
        status: customer.state,
        state: customer.state,
        isAllowedToManage: true,
        isSquaredUcOffer: false,
        notes: {},
        isPartner: false,
        isTrialData: _.get(options, 'isTrialData', false),
        isPremium: false,
      };

      var licensesAndOffersData = parseLicensesAndOffers(customer, options);
      _.assign(dataObj, licensesAndOffersData);

      dataObj.isAllowedToManage = dataObj.isTrialData || customer.isAllowedToManage;
      dataObj.isPartner = _.get(customer, 'isPartner', false);
      dataObj.unmodifiedLicenses = _.cloneDeep(customer.licenses);
      dataObj.licenseList = customer.licenses;

      var premiumLicenses = _.filter(dataObj.licenseList, function (license) {
        return license.offerName === Config.offerCodes.MGMTPRO;
      });
      dataObj.isPremium = _.some(premiumLicenses);

      dataObj.daysUsed = TrialService.calcDaysUsed(customer.startDate);
      dataObj.percentUsed = (dataObj.duration > 0) ? Math.round((dataObj.daysUsed / dataObj.duration) * 100) : 0;

      dataObj.daysLeft = TrialService.calcDaysLeft(customer.startDate, dataObj.duration);
      if ((dataObj.isTrialData) && (dataObj.daysLeft < 0)) {
        dataObj.status = $translate.instant('customerPage.expired');
        dataObj.state = 'EXPIRED';
      }

      var serviceEntry = {
        status: dataObj.status,
        daysLeft: dataObj.daysLeft,
        customerName: dataObj.customerName,
      };

      // havent figured out what this is doing yet...
      dataObj.sparkConferencing = initializeService(dataObj.licenseList, Config.offerCodes.CF, serviceEntry);
      dataObj.communications = initializeService(dataObj.licenseList, Config.offerCodes.CO, serviceEntry);
      dataObj.webexEventCenter = initializeService(dataObj.licenseList, Config.offerCodes.EC, serviceEntry);
      dataObj.webexEEConferencing = initializeService(dataObj.licenseList, Config.offerCodes.EE, serviceEntry);
      dataObj.webexMeetingCenter = initializeService(dataObj.licenseList, Config.offerCodes.MC, serviceEntry);
      dataObj.messaging = initializeService(dataObj.licenseList, Config.offerCodes.MS, serviceEntry);
      dataObj.webexSupportCenter = initializeService(dataObj.licenseList, Config.offerCodes.SC, serviceEntry);
      dataObj.roomSystems = initializeService(dataObj.licenseList, Config.offerCodes.SD, serviceEntry);
      dataObj.sparkBoard = initializeService(dataObj.licenseList, Config.offerCodes.SB, serviceEntry);
      dataObj.webexTrainingCenter = initializeService(dataObj.licenseList, Config.offerCodes.TC, serviceEntry);
      dataObj.webexCMR = initializeService(dataObj.licenseList, Config.offerCodes.CMR, serviceEntry);
      dataObj.care = initializeService(dataObj.licenseList, Config.offerCodes.CDC, serviceEntry);
      dataObj.advanceCare = initializeService(dataObj.licenseList, Config.offerCodes.CVC, serviceEntry);

      // 12/17/2015 - Timothy Trinh
      // setting conferencing to sparkConferencing for now to preserve how
      // the customer list page currently works.
      dataObj.conferencing = dataObj.sparkConferencing;

      dataObj.purchased = _calculatePurchaseStatus(dataObj);

      dataObj.totalLicenses = _calculateTotalLicenses(dataObj, options);
      dataObj.uniqueServiceCount = _countUniqueServices(dataObj);

      dataObj.orderedServices = _getOrderedServices(dataObj, options);

      dataObj.accountStatus = getAccountStatus(dataObj);
      setNotesSortOrder(dataObj);
      return dataObj;
    }

    // The information provided by this function will be used in displaying the service icons on the customer list page.
    function _getOrderedServices(data, options) {
      var servicesToProcess = ['messaging', 'conferencing', 'communications', 'webexEEConferencing',
        'roomSystems', 'sparkBoard', 'care', 'advanceCare'];
      var careServices = {
        care: 'isCareEnabled',
        advanceCare: 'isAdvanceCareEnabled',
      };
      var servicesManagedByCurrentPartner = [];
      var servicesManagedByAnotherPartner = [];
      var servicesManagedByCustomer = [];

      _.forEach(servicesToProcess, function (service) {
        var serviceToAdd = service;
        if (service === 'webexEEConferencing') {
          serviceToAdd = 'webex';
        }

        var careServiceEnabledPropertyName = careServices[service];
        if (!careServices[service] || _.get(options, careServiceEnabledPropertyName, true)) {
          if (isServiceManagedByCustomer(data[service])) {
            servicesManagedByCustomer.push(serviceToAdd);
          } else if (isServiceManagedByCurrentPartner(data[service])) {
            servicesManagedByCurrentPartner.push(serviceToAdd);
          } else {
            servicesManagedByAnotherPartner.push(serviceToAdd);
          }
        }
      });

      return {
        servicesManagedByCurrentPartner: servicesManagedByCurrentPartner,
        servicesManagedByAnotherPartner: servicesManagedByAnotherPartner,
        servicesManagedByCustomer: servicesManagedByCustomer,
      };
    }

    function isServiceManagedByCurrentPartner(serviceObj) {
      return (serviceObj.partnerOrgId === Authinfo.getOrgId()) ||
        (serviceObj.partnerEmail === Authinfo.getPrimaryEmail()) ||
        _isServiceNotLicensed(serviceObj);
    }

    function isServiceManagedByCustomer(serviceObj) {
      return _.isUndefined(serviceObj.partnerOrgId) &&
        _.isUndefined(serviceObj.partnerEmail) &&
        !isLicenseFree(serviceObj);
    }

    // Services that are not licensed will not have the usual properties associated with a license. The volume property is a
    // property associated with a license that we can check for undefined. Also, services that are not licensed will only have
    // 4 default properties (customerName, daysLeft, sortOrder, and status) in the service object. So, in addition to checking
    // for the volume property, we'll also check for the number of properties in the service object to be 4.
    function _isServiceNotLicensed(serviceObj) {
      var numberOfProperties = Object.keys(serviceObj).length;
      return serviceObj.volume === undefined && numberOfProperties === 4;
    }

    function _calculatePurchaseStatus(customerData) {
      if (customerData.state === Config.licenseStatus.ACTIVE && customerData.licenseList) {
        return !_.isEmpty(customerData.licenseList) && _.some(customerData.licenseList, ['isTrial', false]);
      }
      return false;
    }


    function _calculateTotalLicenses(customerData, options) {
      if (customerData.purchased || customerData.isPartner) {
        return _.sumBy(customerData.licenseList, function (license) {
          if (!helpers.isDisplayableService(license, _.assign({ isTrial: undefined, isShowCMR: false }, options))) {
            return 0;
          } else {
            return license.volume || 0;
          }
        });
      } else {
        // device and care licenses can be undefined
        return customerData.licenses +
          (customerData.deviceLicenses || 0) +
          (_.get(options, 'isCareEnabled', false) ? (customerData.careLicenses || 0) : 0);
      }
    }

    function _countUniqueServices(customerData) {
      var count = 0;
      // only want to add 1 for webex since it is only 1 icon
      var foundWebex = false;
      _.forEach(Config.licenseObjectNames, function (licenseName) {
        if (isLicenseTypeAny(customerData, licenseName)) {
          if (_.startsWith(licenseName, 'webex')) {
            if (!foundWebex) {
              count += 1;
              foundWebex = true;
            }
          } else {
            count += 1;
          }
        }
      });
      return count;
    }

    function initializeService(licenses, offerCode, serviceEntry) {
      var licensesGotten = getLicense(licenses, offerCode);
      if (!_.isArray(licensesGotten)) {
        _.assign(licensesGotten, serviceEntry);
        setServiceSortOrder(licensesGotten);
        return licensesGotten;
      } else {
        var result = {};
        _.assign(result, licensesGotten[0], serviceEntry);
        var qty = _.reduce(licensesGotten, function (volume, license) {
          return volume + license.volume;
        }, 0);
        result.volume = qty;
        setServiceSortOrder(result);
        return result;
      }
    }

    function exportCSV(isCareEnabled) {
      $rootScope.exporting = true;
      $rootScope.$broadcast('EXPORTING');

      // dont catch exception, if there was a problem, throw it
      // (this is preexisting behavior)
      return getManagedOrgsList()
        .then(function (response) {
          // data to export for CSV file customer.conferencing.features[j]
          var exportedCustomers = _.map(response.data.organizations, function (customer) {
            var exportedCustomer = {};

            exportedCustomer.customerName = customer.customerName;
            exportedCustomer.adminEmail = customer.customerEmail;
            exportedCustomer.messagingEntitlements = '';
            exportedCustomer.conferenceEntitlements = '';
            exportedCustomer.communicationsEntitlements = '';
            exportedCustomer.roomSystemsEntitlements = '';

            var messagingLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.MESSAGING,
            });
            var conferenceLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.CONFERENCING,
            });
            var communicationsLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.COMMUNICATION,
            });
            var roomSystemsLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.SHARED_DEVICES,
            });
            var careLicense = _.find(customer.licenses, {
              licenseType: Config.licenseTypes.CARE,
            });

            if (messagingLicense && _.isArray(messagingLicense.features)) {
              exportedCustomer.messagingEntitlements = messagingLicense.features.join(' ');
            }
            if (conferenceLicense && _.isArray(conferenceLicense.features)) {
              exportedCustomer.conferenceEntitlements = conferenceLicense.features.join(' ');
            }
            if (communicationsLicense && _.isArray(communicationsLicense.features)) {
              exportedCustomer.communicationsEntitlements = communicationsLicense.features.join(' ');
            }
            if (roomSystemsLicense && _.isArray(roomSystemsLicense.features)) {
              exportedCustomer.roomSystemsEntitlements = roomSystemsLicense.features.join(' ');
            }
            if (isCareEnabled) {
              if (careLicense && _.isArray(careLicense.features)) {
                exportedCustomer.careEntitlements = careLicense.features.join(' ');
              }
            }
            return exportedCustomer;
          });

          // header line for CSV file
          // 12/17/2015 - Timothy Trinh
          // Did not bother to add webex entitlements to this section because it may change.
          var header = {};
          header.customerName = $translate.instant('customerPage.csvHeaderCustomerName');
          header.adminEmail = $translate.instant('customerPage.csvHeaderAdminEmail');
          header.messagingEntitlements = $translate.instant('customerPage.csvHeaderMessagingEntitlements');
          header.conferencingEntitlements = $translate.instant('customerPage.csvHeaderConferencingEntitlements');
          header.communicationsEntitlements = $translate.instant('customerPage.csvHeaderCommunicationsEntitlements');
          header.roomSystemsEntitlements = $translate.instant('customerPage.csvHeaderRoomSystemsEntitlements');

          if (isCareEnabled) {
            header.careEntitlements = $translate.instant('customerPage.csvHeaderCareEntitlements');
          }

          exportedCustomers.unshift(header);
          return exportedCustomers;
        });
    }

    function getTrialMeetingServices(licenseList, customerOrgId) {
      var conferenceMapping = helpers.createConferenceMapping();
      var meetingServices = [];
      _.forEach(licenseList, function (licenseInfo) {
        if (licenseInfo.isTrial) {
          if (licenseInfo.licenseType === Config.licenseTypes.CONFERENCING || licenseInfo.licenseType === Config.licenseTypes.CMR) {
            var service = new helpers.LicensedService(licenseInfo, conferenceMapping, customerOrgId);
            helpers.addService(meetingServices, service);
          }
        }
      });
      return meetingServices;
    }

    function parseLicensesAndOffers(customer, options) {
      var partial = {
        licenses: 0,
        deviceLicenses: 0,
        isSquaredUcOffer: false,
        usage: 0,
        offer: {},
      };
      var isCareEnabled = _.get(options, 'isCareEnabled', true);
      var isAdvanceCareEnabled = _.get(options, 'isAdvanceCareEnabled', true);
      var userServiceMapping = helpers.createLicenseMapping();
      var conferenceServices = [];
      var roomServices = [];
      var sparkCare = [];
      var trialService;
      var trialServices = [];

      _.forEach(_.get(customer, 'licenses', []), function (licenseInfo) {
        if (!licenseInfo) {
          return;
        }
        switch (licenseInfo.licenseType) {
          case Config.licenseTypes.COMMUNICATION:
            partial.isSquaredUcOffer = true;
            break;
        }
      });

      for (var offer in _.get(customer, 'offers', [])) {
        var offerInfo = customer.offers[offer];
        if (!offerInfo) {
          continue;
        }
        partial.usage = offerInfo.usageCount;
        if (offerInfo.id !== Config.offerTypes.roomSystems &&
          offerInfo.id !== Config.offerTypes.care &&
          offerInfo.id !== Config.offerTypes.advanceCare) {
          partial.licenses = offerInfo.licenseCount;
        }
        trialService = null;
        switch (offerInfo.id) {
          case Config.offerTypes.spark1:
          case Config.offerTypes.message:
          case Config.offerTypes.collab:
            trialService = userServiceMapping[Config.licenseTypes.MESSAGING];
            break;
          case Config.offerTypes.call:
          case Config.offerTypes.squaredUC:
            partial.isSquaredUcOffer = true;
            trialService = userServiceMapping[Config.licenseTypes.COMMUNICATION];
            break;
          case Config.offerTypes.webex:
          case Config.offerTypes.meetings:
            conferenceServices.push({
              name: $translate.instant('customerPage.EE'),
              order: 1,
              qty: offerInfo.licenseCount,
              isWebex: true,
            });
            break;
          case Config.offerTypes.meeting:
            conferenceServices.push({
              offerType: offerInfo.id,
              name: $translate.instant('trials.meeting'),
              order: 1,
              qty: offerInfo.licenseCount,
            });
            break;
          case Config.offerTypes.roomSystems:
            roomServices.push({
              offerType: offerInfo.id,
              name: $translate.instant('trials.roomSystem'),
              order: 1,
              qty: offerInfo.licenseCount,
            });
            break;
          case Config.offerTypes.sparkBoard:
            roomServices.push({
              offerType: offerInfo.id,
              name: $translate.instant('trials.sparkBoardSystem'),
              order: 2,
              qty: offerInfo.licenseCount,
            });
            break;
          case Config.offerTypes.care:
            if (isCareEnabled) {
              sparkCare.push({
                offerTypes: offerInfo.id,
                name: $translate.instant('trials.care'),
                order: 1,
                qty: offerInfo.licenseCount,
              });
            }
            break;
          case Config.offerTypes.advanceCare:
            if (isAdvanceCareEnabled) {
              sparkCare.push({
                offerTypes: offerInfo.id,
                name: $translate.instant('trials.advanceCare'),
                order: 2,
                qty: offerInfo.licenseCount,
              });
            }
            break;
        }
        if (trialService) {
          trialService.qty = offerInfo.licenseCount;
          trialServices.push(trialService);
        }
      }

      if (conferenceServices.length > 0) {
        var name = _.chain(conferenceServices).sortBy('order').map(function (o) {
          return o.name;
        })
          .uniq()
          .value()
          .join(', ');
        var licenseQty = conferenceServices[0].qty;
        var hasWebex = _.some(conferenceServices, { isWebex: true });
        trialServices.push({
          name: name, sub: conferenceServices, qty: licenseQty, icon: 'icon-circle-group', order: 1, hasWebex: hasWebex,
        });
      }

      if (sparkCare.length > 0) {
        var careName = $translate.instant('customerPage.care');
        var uniqueSparkCare = _.uniqBy(sparkCare, 'order');
        uniqueSparkCare = _.sortBy(uniqueSparkCare, 'order').map(function (o) {
          o['icon'] = 'icon-circle-contact-centre';
          return o;
        });
        partial.careLicenses = _.sumBy(uniqueSparkCare, 'qty');
        trialServices.push({
          name: careName, sub: uniqueSparkCare, qty: partial.careLicenses, icon: 'icon-circle-contact-centre', order: 5, isSparkCare: true,
        });
      }

      if (roomServices.length > 0) {
        trialService = userServiceMapping[Config.licenseTypes.SHARED_DEVICES];
        partial.isRoomSystems = true;
        var sbTrial = _.chain(roomServices)
          .filter({ offerType: Config.offerTypes.sparkBoard })
          .last()
          .value();
        var sdTrial = _.chain(roomServices)
          .filter({ offerType: Config.offerTypes.roomSystems })
          .last()
          .value();
        trialService.sub = [];
        if (sbTrial) {
          partial.deviceLicenses += sbTrial.qty || 0;
          trialService.sub.push(sbTrial);
        }
        if (sdTrial) {
          partial.deviceLicenses += sdTrial.qty || 0;
          trialService.sub.push(sdTrial);
        }
        trialService.qty = partial.deviceLicenses;
        trialServices.push(trialService);
      }

      partial.offer.trialServices = _.chain(trialServices).sortBy('order').uniq().value();
      return partial;
    }

    function getFreeOrActiveServices(customer, options) {
      var paidServices = [];
      var meetingServices = [];
      var roomDevices = [];
      var service = null;
      var result = null;
      var isCareEnabled = options.isCareEnabled;
      var isAdvanceCareEnabled = options.isAdvanceCareEnabled;
      var isTrial = options.isTrial;
      var customerOrgId = customer.customerOrgId;

      var meetingHeader = {
        licenseType: 'MEETING',
        isMeeting: true,
        name: $translate.instant('customerPage.meeting'),
        icon: 'icon-circle-group',
        order: 1,
      };

      var roomDevicesHeader = {
        licenseType: Config.licenseTypes.SHARED_DEVICES,
        isRoom: true,
        name: $translate.instant('subscriptions.room'),
        icon: 'icon-circle-telepresence',
        order: 26,
      };

      var licenseMapping = helpers.createLicenseMapping();
      var conferenceMapping = helpers.createConferenceMapping();
      var roomDeviceMapping = helpers.createRoomDeviceMapping();
      var freeServices = helpers.createFreeServicesMapping();

      _.forEach(_.get(customer, 'licenseList', []), function (licenseInfo) {
        service = null;
        if (licenseInfo) {
          helpers.removeFromFreeServices(freeServices, licenseInfo);
          //from paid or free services
          if (helpers.isDisplayableService(licenseInfo, {
            isTrial: isTrial, isShowCMR: true, isCareEnabled: isCareEnabled, isAdvanceCareEnabled: isAdvanceCareEnabled,
          })) { //if conference
            if (licenseInfo.licenseType === Config.licenseTypes.CONFERENCING || licenseInfo.licenseType === Config.licenseTypes.CMR) {
              service = new helpers.LicensedService(licenseInfo, conferenceMapping, customerOrgId);
              helpers.addService(meetingServices, service);
            } else if (licenseInfo.licenseType === Config.licenseTypes.SHARED_DEVICES) {
              service = new helpers.LicensedService(licenseInfo, roomDeviceMapping, customerOrgId);
              helpers.addService(roomDevices, service);
            } else {
              service = new helpers.LicensedService(licenseInfo, licenseMapping, customerOrgId);
              helpers.addService(paidServices, service);
            }
          }
        }
      });
      // handle meeting services
      //if only one meeting service -- move to the services list
      if (meetingServices.length === 1) {
        var singleMeetingService = meetingServices.shift();
        helpers.addService(paidServices, singleMeetingService);
      }

      //if there is more than one
      if (meetingServices.length >= 1) {
        var totalQ = _.reduce(meetingServices, function (prev, curr) {
          return (curr.licenseType !== Config.licenseTypes.CMR) ? {
            qty: prev.qty + curr.qty,
          } : {
            qty: prev.qty + 0,
          };
        });
        _.merge(meetingHeader, {
          qty: totalQ.qty,
          sub: _.sortBy(meetingServices, 'order'),
        });
        paidServices.push(meetingHeader);
      }

      //handle room devices
      if (roomDevices.length) {
        totalQ = _.reduce(roomDevices, function (prev, curr) {
          return prev + curr.qty;
        }, 0);
        _.merge(roomDevicesHeader, {
          qty: totalQ,
          sub: _.sortBy(roomDevices, 'order'),
        });
        paidServices.push(roomDevicesHeader);
      }

      if (freeServices.length > 0 || paidServices.length > 0) {
        result = _.sortBy(_.union(freeServices, paidServices), 'order');
      }
      return result;
    }

    function canAdminTrial(licenseList) {
      // no trials -- can't admin.
      // right now all services in trial are managed by the same org. So - one matches => all match.
      // it is possible that partnerOrg is null. In that case -- check email
      return !!_.find(licenseList, function (license) {
        var partnerOrgId = _.get(license, 'partnerOrgId');
        if (license.isTrial) {
          if (_.isNil(partnerOrgId)) {
            return _.get(license, 'partnerEmail') === Authinfo.getPrimaryEmail();
          }
          return partnerOrgId === Authinfo.getOrgId();
        }
      });
    }

    function getSiteUrls(customerId) {
      var url;
      if (!customerId) {
        return $q.reject('A Customer Organization Id must be passed');
      } else {
        url = _.replace(siteListUrl, '%s', customerId);
        return $http.get(url);
      }
    }
  }
  /* @ngInject */
  function ScimPatchService($resource, Authinfo, UrlConfig) {
    return $resource(UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/:userId', {
      userId: '@userId',
    }, {
      update: {
        method: 'PATCH',
      },
    });
  }
})();
