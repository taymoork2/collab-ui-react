(function () {
  'use strict';

  angular.module('Core')
    .service('PartnerService', PartnerService);

  /* @ngInject */
  function PartnerService($http, $rootScope, $q, $translate, $filter, Config, Log, Authinfo, Auth) {

    var trialsUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials';
    var managedOrgsUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/managedOrgs';

    var customerStatus = {
      FREE: 0,
      TRIAL: 1,
      ACTIVE: 2,
      CANCELED: 99,
      NO_LICENSE: -1,
      NOTE_EXPIRED: 0,
      NOTE_EXPIRE_TODAY: 0,
      NOTE_NO_LICENSE: 0,
      NOTE_CANCELED: 0,
      NOTE_NOT_EXPIRED: 99
    };

    var factory = {
      trialsUrl: trialsUrl,
      managedOrgsUrl: managedOrgsUrl,
      customerStatus: customerStatus,
      getTrialsList: getTrialsList,
      getManagedOrgsList: getManagedOrgsList,
      isLicenseATrial: isLicenseATrial,
      isLicenseActive: isLicenseActive,
      isLicenseFree: isLicenseFree,
      getLicense: getLicense,
      isLicenseInfoAvailable: isLicenseInfoAvailable,
      setServiceSortOrder: setServiceSortOrder,
      setNotesSortOrder: setNotesSortOrder,
      loadRetrievedDataToList: loadRetrievedDataToList,
      exportCSV: exportCSV
    };

    return factory;

    function getTrialsList(callback) {
      $http.get(trialsUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          Log.debug('Retrieved trials list');
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    function getManagedOrgsList(callback) {
      $http.get(managedOrgsUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          Log.debug('Retrieved managed orgs list');
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    function isLicenseATrial(license) {
      return license && license.isTrial === true;
    }

    function isLicenseActive(license) {
      return license && license.isTrial === false;
    }

    function isLicenseFree(license) {
      return angular.isUndefined(license.isTrial);
    }

    function getLicense(licenses, licenseTypeField) {
      var offerNames;
      if (licenseTypeField === 'messaging') {
        offerNames = ['MS'];
      } else if (licenseTypeField === 'conferencing') {
        offerNames = ['MC', 'CF', 'EE', 'TC', 'SC'];
      } else if (licenseTypeField === 'communications') {
        offerNames = ['CO'];
      }

      if (angular.isDefined(licenses) && angular.isDefined(licenses.length)) {
        //for (var i = 0; i < licenses.length; i++) {
        //  for (var j = 0; j < offerNames.length; j++) {
        //    if (licenses[i].offerName === offerNames[j]) {
        //      return licenses[i];
        //    }
        //  }
        //}
        return _.find(licenses, function (license) {
          return offerNames.indexOf(license.offerName) !== -1;
        }) || {};
      }
      return {};
    }

    function isLicenseInfoAvailable(licenses) {
      return angular.isArray(licenses) && licenses.length > 0;
    }

    function setServiceSortOrder(license) {
      if (!license || license.length === 0) {
        license.sortOrder = customerStatus.NO_LICENSE;
      } else {
        if (license.status === 'CANCELED') {
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
    }

    function setNotesSortOrder(rowData) {
      rowData.notes = {};
      if (isLicenseInfoAvailable(rowData.licenseList)) {
        if (rowData.status === 'CANCELED') {
          rowData.notes.sortOrder = customerStatus.NOTE_CANCELED;
          rowData.notes.text = $translate.instant('customerPage.suspended');
        } else if (rowData.status === 'ACTIVE' && rowData.daysLeft > 0) {
          rowData.notes.sortOrder = customerStatus.NOTE_NOT_EXPIRED;
          rowData.notes.daysLeft = rowData.daysLeft;
          rowData.notes.text = $translate.instant('customerPage.daysRemaining', {
            count: rowData.daysLeft
          });
        } else if (rowData.isTrial && rowData.status === 'ACTIVE' && rowData.daysLeft === 0) {
          rowData.notes.sortOrder = customerStatus.NOTE_EXPIRE_TODAY;
          rowData.notes.daysLeft = 0;
          rowData.notes.text = $translate.instant('customerPage.expiringToday');
        } else if (rowData.status === 'ACTIVE' && rowData.daysLeft < 0) {
          rowData.notes.sortOrder = customerStatus.NOTE_EXPIRED;
          rowData.notes.daysLeft = -1;
          rowData.notes.text = $translate.instant('customerPage.expired');
        } else {
          rowData.notes.sortOrder = customerStatus.NOTE_NO_LICENSE;
          rowData.notes.text = $translate.instant('customerPage.licenseInfoNotAvailable');
        }
      } else {
        rowData.notes.sortOrder = customerStatus.NOTE_NO_LICENSE;
        rowData.notes.text = $translate.instant('customerPage.licenseInfoNotAvailable');
      }
    }

    function loadRetrievedDataToList(retrievedData, isTrialData) {
      var list = [];
      var activeList = [];
      var expiredList = [];

      for (var index in retrievedData) {
        var data = retrievedData[index];
        var edate = moment(data.startDate).add(data.trialPeriod, 'days').format('MMM D, YYYY');
        var dataObj = {
          trialId: data.trialId,
          customerOrgId: data.customerOrgId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          endDate: edate,
          numUsers: data.licenseCount,
          daysLeft: 0,
          usage: 0,
          licenses: 0,
          licenseList: [],
          messaging: null,
          conferencing: null,
          communications: null,
          daysUsed: 0,
          percentUsed: 0,
          duration: data.trialPeriod,
          offer: '',
          status: data.state,
          state: data.state,
          isAllowedToManage: true,
          isSquaredUcOffer: false
        };

        dataObj.isAllowedToManage = isTrialData || data.isAllowedToManage;

        if (data.offers) {
          dataObj.offers = data.offers;
          var offerNames = [];
          for (var cnt in data.offers) {
            var offer = data.offers[cnt];
            if (!offer) {
              continue;
            }
            switch (offer.id) {
            case Config.trials.collab:
              offerNames.push($translate.instant('trials.collab'));
              break;
            case Config.trials.squaredUC:
              dataObj.isSquaredUcOffer = true;
              offerNames.push($translate.instant('trials.squaredUC'));
              break;
            }
            dataObj.usage = offer.usageCount;
            dataObj.licenses = offer.licenseCount;
          }
          dataObj.offer = offerNames.join(', ');
        }

        dataObj.licenseList = data.licenses;
        dataObj.messaging = getLicense(data.licenses, 'messaging');
        dataObj.conferencing = getLicense(data.licenses, 'conferencing');
        dataObj.communications = getLicense(data.licenses, 'communications');

        var now = moment().format('MMM D, YYYY');
        var then = edate;
        var start = moment(data.startDate).format('MMM D, YYYY');

        var daysDone = moment(now).diff(start, 'days');
        dataObj.daysUsed = daysDone;
        dataObj.percentUsed = Math.round((daysDone / data.trialPeriod) * 100);

        var daysLeft = moment(then).diff(now, 'days');
        dataObj.daysLeft = daysLeft;
        if (isTrialData) {
          if (daysLeft >= 0) {
            activeList.push(dataObj);
          } else {
            dataObj.status = $translate.instant('customerPage.expired');
            expiredList.push(dataObj);
          }
        }

        var tmpServiceObj = {
          status: dataObj.status,
          daysLeft: daysLeft,
          customerName: dataObj.customerName
        };
        angular.extend(dataObj.messaging, tmpServiceObj);
        angular.extend(dataObj.conferencing, tmpServiceObj);
        angular.extend(dataObj.communications, tmpServiceObj);
        setServiceSortOrder(dataObj.messaging);
        setServiceSortOrder(dataObj.conferencing);
        setServiceSortOrder(dataObj.communications);

        dataObj.notes = {};
        setNotesSortOrder(dataObj);
        list.push(dataObj);
      }

      return [list, activeList, expiredList];
    }

    function exportCSV() {
      var deferred = $q.defer();

      var customers = [];

      $rootScope.exporting = true;
      $rootScope.$broadcast('EXPORTING');

      getManagedOrgsList(function (data, status) {
        if (data.success && data.organizations) {
          if (data.organizations.length > 0) {
            customers = data.organizations;
            Log.debug('total managed orgs records found:' + customers.length);
          } else {
            Log.debug('No managed orgs records found');
          }

          //var exportedCustomers = formatCustomerList(customerList);
          var exportedCustomers = [];

          if (customers.length === 0) {
            Log.debug('No lines found.');
          } else {
            // header line for CSV file
            var header = {};
            header.customerName = $translate.instant('customerPage.csvHeaderCustomerName');
            header.adminEmail = $translate.instant('customerPage.csvHeaderAdminEmail');
            header.messagingEntitlements = $translate.instant('customerPage.csvHeaderMessagingEntitlements');
            header.conferencingEntitlements = $translate.instant('customerPage.csvHeaderConferencingEntitlements');
            header.communicationsEntitlements = $translate.instant('customerPage.csvHeaderCommunicationsEntitlements');
            exportedCustomers.push(header);

            // data to export for CSV file customer.conferencing.features[j]
            for (var i = 0; i < customers.length; i++) {
              var exportedCustomer = {};

              exportedCustomer.customerName = customers[i].customerName;
              exportedCustomer.adminEmail = customers[i].customerEmail;
              exportedCustomer.messagingEntitlements = '';
              exportedCustomer.conferenceEntitlements = '';
              exportedCustomer.communicationsEntitlements = '';
              if (customers[i].licenses[0] && angular.isArray(customers[i].licenses[0].features)) {
                exportedCustomer.messagingEntitlements = customers[i].licenses[0].features.join(' ');
              }
              if (customers[i].licenses[1] && angular.isArray(customers[i].licenses[1].features)) {
                exportedCustomer.conferenceEntitlements = customers[i].licenses[1].features.join(' ');
              }
              if (customers[i].licenses[2] && angular.isArray(customers[i].licenses[2].features)) {
                exportedCustomer.communicationsEntitlements = customers[i].licenses[2].features.join(' ');
              }
              exportedCustomers.push(exportedCustomer);
            }
          }

          $rootScope.exporting = false;
          $rootScope.$broadcast('EXPORT_FINISHED');

          deferred.resolve(exportedCustomers);
        } else {
          Log.debug('Failed to retrieve managed orgs information. Status: ' + status);
          deferred.reject($translate.instant('partnerHomePage.errGetTrialsQuery', {
            status: status
          }));
        }
      });

      return deferred.promise;
    }
  }
})();
