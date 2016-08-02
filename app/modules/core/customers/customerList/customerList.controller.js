(function () {
  'use strict';

  angular.module('Core')
    .controller('CustomerListCtrl', CustomerListCtrl);

  /* @ngInject */
  function CustomerListCtrl($q, $rootScope, $scope, $state, $stateParams, $templateCache, $translate, $window, Analytics, Authinfo, Config, customerListToggle, ExternalNumberService, FeatureToggleService, Log, Notification, Orgservice, PartnerService, TrialService) {
    $scope.isCustomerPartner = Authinfo.isCustomerPartner ? true : false;
    $scope.isPartnerAdmin = Authinfo.isPartnerAdmin();
    $scope.activeBadge = false;
    $scope.isTestOrg = false;
    $scope.searchStr = '';
    $scope.timeoutVal = 1000;
    $scope.isCareEnabled = false;

    $scope.isOrgSetup = isOrgSetup;
    $scope.isPartnerAdminWithCall = isPartnerAdminWithCall;
    $scope.isOwnOrg = isOwnOrg;
    $scope.setFilter = setFilter;
    $scope.getSubfields = getSubfields;
    $scope.filterAction = filterAction;
    $scope.modifyManagedOrgs = modifyManagedOrgs;
    $scope.getTrialsList = getTrialsList;
    $scope.openAddTrialModal = openAddTrialModal;
    $scope.openEditTrialModal = openEditTrialModal;
    $scope.actionEvents = actionEvents;
    $scope.isLicenseInfoAvailable = isLicenseInfoAvailable;
    $scope.isLicenseTypeATrial = isLicenseTypeATrial;
    $scope.isLicenseTypeActive = isLicenseTypeActive;
    $scope.isLicenseTypeFree = isLicenseTypeFree;
    $scope.isNoLicense = isNoLicense;
    $scope.partnerClicked = partnerClicked;
    $scope.isPartnerOrg = isPartnerOrg;
    $scope.setTrial = setTrial;
    $scope.showCustomerDetails = showCustomerDetails;
    $scope.closeActionsDropdown = closeActionsDropdown;
    $scope.addNumbers = addNumbers;
    $scope.getTotalLicenses = getTotalLicenses;
    $scope.getAccountStatus = getAccountStatus;
    $scope.isLicenseTypeAny = isLicenseTypeAny;
    $scope.getExpiredNotesColumnText = getExpiredNotesColumnText;

    $scope.exportType = $rootScope.typeOfExport.CUSTOMER;
    $scope.filterList = _.debounce(filterAction, $scope.timeoutVal);

    $scope.customerListToggle = customerListToggle;

    // expecting this guy to be unset on init, and set every time after
    // check resetLists fn to see how its being used
    $scope.activeFilter = 'all';

    // for testing purposes
    $scope._helpers = {
      serviceSort: serviceSort,
      sortByDays: sortByDays,
      sortByName: sortByName,
      partnerAtTopSort: partnerAtTopSort,
      setNotesTextOrder: setNotesTextOrder,
      notesSort: notesSort,
      resetLists: resetLists,
      launchCustomerPortal: launchCustomerPortal,
      getLicenseObj: getLicenseObj,
    };

    // common between new + old
    var nameTemplate = $templateCache.get('modules/core/customers/customerList/grid/nameColumn.tpl.html');
    // old templates. These should be deleted once the customer list redesign rolls out publiclly
    // FIXME: Delete when customer list redesign is published
    var serviceTemplate = $templateCache.get('modules/core/customers/customerList/grid/serviceColumn.tpl.html');
    var multiServiceTemplate = $templateCache.get('modules/core/customers/customerList/grid/multiServiceColumn.tpl.html');
    var oldNoteTemplate = $templateCache.get('modules/core/customers/customerList/grid/noteColumn.tpl.html');
    var actionTemplate = $templateCache.get('modules/core/customers/customerList/grid/actionColumn.tpl.html');
    // new templates
    var licenseCountTemplate = $templateCache.get('modules/core/customers/customerList/grid/licenseCountColumn.tpl.html');
    var totalUsersTemplate = $templateCache.get('modules/core/customers/customerList/grid/totalUsersColumn.tpl.html');
    var compactServiceTemplate = $templateCache.get('modules/core/customers/customerList/grid/compactServiceColumn.tpl.html');
    var accountStatusTemplate = $templateCache.get('modules/core/customers/customerList/grid/accountStatusColumn.tpl.html');
    var newNoteTemplate = $templateCache.get('modules/core/customers/customerList/grid/newNoteColumn.tpl.html');

    // old grid column defs. These should be deleted once the customer list redesign rolls out publiclly
    // FIXME: Delete when customerList redesign is published
    var careField = {
      field: 'care',
      displayName: $translate.instant('customerPage.care'),
      width: '12%',
      cellTemplate: serviceTemplate,
      headerCellClass: 'align-center',
      sortingAlgorithm: serviceSort
    };
    var actionField = {
      field: 'action',
      displayName: $translate.instant('customerPage.actionHeader'),
      sortable: false,
      cellTemplate: actionTemplate,
      width: '95',
      cellClass: 'align-center'
    };
    var oldNotesField = {
      field: 'notes',
      displayName: $translate.instant('customerPage.notes'),
      cellTemplate: oldNoteTemplate,
      sortingAlgorithm: notesSort
    };
    // This array is all the old services, but split into separate columns
    var splitServicesFields = [{
      field: 'messaging',
      displayName: $translate.instant('customerPage.message'),
      width: '12%',
      cellTemplate: serviceTemplate,
      headerCellClass: 'align-center',
      sortingAlgorithm: serviceSort
    }, {
      field: 'meeting',
      displayName: $translate.instant('customerPage.meeting'),
      width: '14%',
      cellTemplate: multiServiceTemplate,
      headerCellClass: 'align-center',
      sortingAlgorithm: serviceSort
    }, {
      field: 'communications',
      displayName: $translate.instant('customerPage.call'),
      width: '12%',
      cellTemplate: serviceTemplate,
      headerCellClass: 'align-center',
      sortingAlgorithm: serviceSort
    }, careField, {
      field: 'roomSystems',
      displayName: $translate.instant('customerPage.roomSystems'),
      width: '12%',
      cellTemplate: serviceTemplate,
      headerCellClass: 'align-center',
      sortingAlgorithm: serviceSort
    }];
    // END SECTION TO BE DELETED

    // new column defs for the customer list redesign. These should stay once the feature is rolled out
    var customerNameField = {
      field: 'customerName',
      displayName: $translate.instant('customerPage.customerNameHeader'),
      width: '25%',
      cellTemplate: nameTemplate,
      cellClass: 'ui-grid-add-column-border',
      sortingAlgorithm: partnerAtTopSort,
      sort: {
        direction: 'asc',
        priority: 0,
      }
    };
    var allServicesField = {
      field: 'services',
      displayName: $translate.instant('customerPage.services'),
      width: '20%',
      cellTemplate: compactServiceTemplate,
      headerCellClass: 'align-center',
      sortingAlgorithm: serviceSort
    };
    var accountStatusField = {
      field: 'accountStatus',
      displayName: $translate.instant('customerPage.accountStatus'),
      width: '12%',
      cellTemplate: accountStatusTemplate,
      headerCellClass: 'align-center',
      sortingAlgorithm: serviceSort
    };
    var licenseQuantityField = {
      field: 'accountStatus',
      displayName: $translate.instant('customerPage.totalLicenses'),
      width: '14%',
      cellTemplate: licenseCountTemplate,
      headerCellClass: 'align-center',
      sortingAlgorithm: serviceSort
    };
    var totalUsersField = {
      field: 'totalUsers',
      displayName: $translate.instant('customerPage.active') + ' / ' + $translate.instant('customerPage.totalUsers'),
      width: '12%',
      cellTemplate: totalUsersTemplate,
      headerCellClass: 'align-center',
      sortingAlgorithm: serviceSort
    };
    var notesField = {
      field: 'notes',
      displayName: $translate.instant('customerPage.notes'),
      cellTemplate: newNoteTemplate,
      sortingAlgorithm: notesSort
    };

    var myOrgDetails = {};
    var noFreeLicense = ['roomSystems', 'webexEEConferencing'];

    $scope.gridColumns = [];

    $scope.gridOptions = {
      data: 'gridData',
      multiSelect: false,
      rowHeight: 44,
      enableRowHeaderSelection: false,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableHorizontalScrollbar: 0,
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.showCustomerDetails(row.entity);
        });
        gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
          if ($scope.load) {
            $scope.currentDataPosition++;
            $scope.load = false;
            // lol getTrialsList doesnt take any params...
            getTrialsList($scope.currentDataPosition * Config.usersperpage + 1);
            $scope.gridApi.infiniteScroll.dataLoaded();
          }
        });
      },
      multiFields: {
        meeting: [{
            columnGroup: 'conferencing',
            columnName: 'conferencing',
            offerCode: 'CF',
            tooltip: $translate.instant('customerPage.meeting')
          }, {
            columnGroup: 'webex',
            offerCode: 'EE',
            columnName: 'webexEEConferencing',
            tooltip: $translate.instant('customerPage.webex')
          }, {
            columnGroup: 'webex',
            offerCode: 'CMR',
            columnName: 'webexCMR',
            tooltip: $translate.instant('customerPage.webex')
          }, {
            columnGroup: 'webex',
            offerCode: 'MC',
            columnName: 'webexMeetingCenter',
            tooltip: $translate.instant('customerPage.webex')
          }, {
            columnGroup: 'webex',
            offerCode: 'SC',
            columnName: 'webexSupportCenter',
            tooltip: $translate.instant('customerPage.webex')
          }, {
            columnGroup: 'webex',
            offerCode: 'TC',
            columnName: 'webexTrainingCenter',
            tooltip: $translate.instant('customerPage.webex')
          }, {
            columnGroup: 'webex',
            offerCode: 'EC',
            columnName: 'webexEventCenter',
            tooltip: $translate.instant('customerPage.webex')
          }

        ]
      },
      columnDefs: $scope.gridColumns
    };

    init();

    function init() {
      setNotesTextOrder();
      initColumns();
      FeatureToggleService.atlasCareTrialsGetStatus().then(function (careStatus) {
        $scope.isCareEnabled = careStatus;
        if (!careStatus) {
          _.remove($scope.gridColumns, careField);
        }
      }, function () {
        // if getting care feature status fails, fall back to the old behavior
        _.remove($scope.gridColumns, careField);
      }).finally(function () {
        resetLists().then(function () {
          setFilter($stateParams.filter);
        });
      });
      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          $scope.isTestOrg = data.isTestOrg;
        } else {
          Log.error('Query org info failed. Status: ' + status);
        }
      });
    }

    function getSubfields(entry, name) {
      var groupedFields = _.groupBy($scope.gridOptions.multiFields[name], 'columnGroup');
      //get licenses
      var licenses = _.map(entry.licenseList, 'offerName');
      var result = _.map(groupedFields, function (group) {
        //or return the one with license OR the first
        return (_.find(group, function (field) {
          return _.contains(licenses, field.offerCode);
        }) || group[0]);
      });
      return result;
    }

    function initColumns() {
      $scope.gridColumns.push(customerNameField);
      if ($scope.customerListToggle) {
        $scope.gridColumns.push(allServicesField, accountStatusField, licenseQuantityField, totalUsersField, notesField);
      } else {
        // use this way instead of concat so we can maintain the ref inside gridOptions
        Array.prototype.push.apply($scope.gridColumns, splitServicesFields);
        $scope.gridColumns.push(oldNotesField, actionField);
      }
    }

    function isOrgSetup(customer) {
      return _.every(customer.unmodifiedLicenses, {
        status: 'ACTIVE'
      });
    }

    function isPartnerAdminWithCall(customer) {
      return !_.isUndefined(customer.communications.licenseType) && $scope.isPartnerAdmin;
    }

    function isOwnOrg(customer) {
      return customer.customerName === Authinfo.getOrgName();
    }

    function serviceSort(a, b) {
      if (a.sortOrder === PartnerService.customerStatus.TRIAL && b.sortOrder === PartnerService.customerStatus.TRIAL) {
        // if a and b are both trials, sort by expiration length
        return sortByDays(a, b);
      } else if (a.sortOrder === b.sortOrder) {
        // if a & b have the same sort order, sort by name
        return sortByName(a, b);
      } else {
        return a.sortOrder - b.sortOrder;
      }
    }

    function sortByDays(a, b) {
      if (a.daysLeft !== b.daysLeft) {
        return a.daysLeft - b.daysLeft;
      } else {
        return sortByName(a, b);
      }
    }

    function sortByName(a, b) {
      var first = a.customerName || a;
      var second = b.customerName || b;
      if (first.toLowerCase() > second.toLowerCase()) {
        return 1;
      } else if (first.toLowerCase() < second.toLowerCase()) {
        return -1;
      } else {
        return 0;
      }
    }

    // Sort function to keep partner org at top
    function partnerAtTopSort(a, b) {
      var orgName = Authinfo.getOrgName();
      if (a === orgName || b === orgName) {
        return -1;
      } else {
        return sortByName(a, b);
      }
    }

    function setNotesTextOrder() {
      var textSuspended = $translate.instant('customerPage.suspended'),
        textExpiringToday = $translate.instant('customerPage.expiringToday'),
        textExpired = $translate.instant('customerPage.expired'),
        textLicenseInfoNotAvailable = $translate.instant('customerPage.licenseInfoNotAvailable');
      var textArray = [
        textSuspended,
        textExpiringToday,
        textExpired,
        textLicenseInfoNotAvailable
      ];
      textArray.sort();
      angular.forEach(textArray, function (text, index) {
        if (text === textSuspended) {
          PartnerService.customerStatus.NOTE_CANCELED = index;
        } else if (text === textExpiringToday) {
          PartnerService.customerStatus.NOTE_EXPIRE_TODAY = index;
        } else if (text === textExpired) {
          PartnerService.customerStatus.NOTE_EXPIRED = index;
        } else if (text === textLicenseInfoNotAvailable) {
          PartnerService.customerStatus.NOTE_NO_LICENSE = index;
        }
      });
    }

    function notesSort(a, b) {
      if (a.sortOrder === PartnerService.customerStatus.NOTE_NOT_EXPIRED &&
        b.sortOrder === PartnerService.customerStatus.NOTE_NOT_EXPIRED) {
        return a.daysLeft - b.daysLeft;
      } else {
        return a.sortOrder - b.sortOrder;
      }
    }

    function setFilter(filter) {
      $scope.activeFilter = filter || 'all';
      if (filter === 'trials') {
        $scope.gridData = $scope.trialsList;
      } else {
        $scope.gridData = $scope.managedOrgsList;
      }
    }

    function filterAction(value) {
      $scope.searchStr = value;
      resetLists().then(function () {
        setFilter($scope.activeFilter);
      });
    }

    function getMyOrgDetails() {
      return $q(function (resolve, reject) {
        var accountId = Authinfo.getOrgId();
        var custName = Authinfo.getOrgName();
        var licenses = Authinfo.getLicenses();
        Orgservice.getAdminOrg(function (data, status) {
          if (status === 200) {
            var myOrg = PartnerService.loadRetrievedDataToList([data], false, $scope.isCareEnabled);
            // Not sure why this is set again, afaik it is the same as myOrg
            myOrg[0].customerName = custName;
            myOrg[0].customerOrgId = accountId;

            myOrg[0].messaging = _.merge(myOrg[0].messaging, _.find(licenses, {
              licenseType: 'MESSAGING'
            }));
            myOrg[0].communications = _.merge(myOrg[0].communications, _.find(licenses, {
              licenseType: 'COMMUNICATION'
            }));
            myOrg[0].roomSystems = _.merge(myOrg[0].roomSystems, _.find(licenses, {
              licenseType: 'SHARED_DEVICES'
            }));
            myOrg[0].conferencing = _.merge(myOrg[0].conferencing, _.find(licenses, {
              licenseType: 'CONFERENCING',
              offerName: 'CF'
            }));
            myOrg[0].webexEEConferencing = _.merge(myOrg[0].webexEEConferencing, _.find(licenses, {
              licenseType: 'CONFERENCING',
              offerName: 'EE'
            }));
            myOrgDetails = myOrg;
            resolve(myOrgDetails);
          } else {
            reject('Unable to query for signed-in users org');
            Log.debug('Failed to retrieve partner org information. Status: ' + status);
          }
        }, accountId);
      });
    }

    function getManagedOrgsList(searchText) {
      $scope.showManagedOrgsRefresh = true;
      var promiselist = [PartnerService.getManagedOrgsList(searchText)];
      var myOrgName = Authinfo.getOrgName();
      var isPartnerAdmin = Authinfo.isPartnerAdmin();
      var isPartnerReadOnlyAdmin = Authinfo.isPartnerReadOnlyAdmin();
      var getOrgNameSearch = Authinfo.getOrgName().indexOf(searchText);
      var attachMyOrg = false;

      if (isPartnerAdmin || isPartnerReadOnlyAdmin) {
        if (searchText === '' || getOrgNameSearch !== -1) {
          attachMyOrg = true;
          getMyOrgDetails();
        }
      }

      return $q.all(promiselist)
        .catch(function (err) {
          Log.debug('Failed to retrieve managed orgs information. Status: ' + err.status);
          Notification.error('partnerHomePage.errGetTrialsQuery', {
            status: err.status
          });

          $scope.showManagedOrgsRefresh = false;
        })
        .then(function (results) {
          var managed = PartnerService.loadRetrievedDataToList(_.get(results, '[0].data.organizations', []), false,
            $scope.isCareEnabled);
          var myOrgItem = _.find(managed, {
            customerName: myOrgName
          });

          // is MyOrg returned in managedOrgs list
          if (myOrgItem) {
            // remove from list
            _.remove(managed, myOrgItem);
            // add to top
            managed.unshift(myOrgItem);
          } else {
            if (attachMyOrg) {
              // add myOrg to the top of the list
              managed.unshift(myOrgDetails[0]);
            }
          }
          $scope.managedOrgsList = managed;
          $scope.totalOrgs = $scope.managedOrgsList.length;

          // dont use a .finally(..) since this $q.all is returned
          // (if you .finally(..), the next `then` doesnt get called)
          $scope.showManagedOrgsRefresh = false;
        });
    }

    function modifyManagedOrgs(customerOrgId) {
      PartnerService.modifyManagedOrgs(customerOrgId);
    }

    // WARNING: not sure if this is needed, getManagedOrgsList contains a superset of this list
    // can be filtered by `createdBy` and `license.isTrial` but we have a second endpoint that
    // may at one point in the future return something other than the subset
    function getTrialsList(searchText) {
      return TrialService.getTrialsList(searchText)
        .catch(function (err) {
          Log.debug('Failed to retrieve trial information. Status: ' + err.status);
          Notification.error('partnerHomePage.errGetTrialsQuery', {
            status: err.status
          });
        })
        .then(function (response) {
          $scope.trialsList = PartnerService.loadRetrievedDataToList(_.get(response, 'data.trials', []), true,
            $scope.isCareEnabled);
          $scope.totalTrials = $scope.trialsList.length;
        });
    }

    function openAddTrialModal() {
      if ($scope.isTestOrg) {
        Analytics.trackTrialSteps(Analytics.eventNames.START, $state.current.name);
      }
      $state.go('trialAdd.info').then(function () {
        $state.modal.result.finally(resetLists);
      });
    }

    function openEditTrialModal() {
      TrialService.getTrial($scope.currentTrial.trialId).then(function (response) {
        $state.go('trialEdit.info', {
          currentTrial: $scope.currentTrial,
          details: response
        }).then(function () {
          $state.modal.result.finally(resetLists);
        });
      });
    }

    function resetLists() {
      return $q.all([getTrialsList($scope.searchStr), getManagedOrgsList($scope.searchStr)]);
    }

    function launchCustomerPortal(trial) {
      var customer = trial;

      $window.open($state.href('login_swap', {
        customerOrgId: customer.customerOrgId,
        customerOrgName: customer.customerName
      }));
    }

    function actionEvents($event, action, org) {
      $event.stopPropagation();
      if (action === 'myOrg') {
        closeActionsDropdown();
      } else if (action === 'customer') {
        closeActionsDropdown();
        modifyManagedOrgs(org.customerOrgId);
      } else if (action === 'pstn') {
        closeActionsDropdown();
        addNumbers(org);
        modifyManagedOrgs(org.customerOrgId);
      }
      return;
    }

    function isLicenseInfoAvailable(licenses) {
      return PartnerService.isLicenseInfoAvailable(licenses);
    }

    function getLicenseObj(rowData, licenseTypeField) {
      return rowData[licenseTypeField] || null;
    }

    function isLicenseTypeATrial(rowData, licenseTypeField) {
      return isLicenseInfoAvailable(rowData.licenseList) && PartnerService.isLicenseATrial(getLicenseObj(rowData, licenseTypeField));
    }

    function isLicenseTypeActive(rowData, licenseTypeField) {
      return isLicenseInfoAvailable(rowData.licenseList) && PartnerService.isLicenseActive(getLicenseObj(rowData, licenseTypeField));
    }

    function isLicenseTypeFree(rowData, licenseTypeField) {
      return (isLicenseInfoAvailable(rowData.licenseList) && PartnerService.isLicenseFree(getLicenseObj(rowData, licenseTypeField)) &&
        !_.includes(noFreeLicense, licenseTypeField));
    }

    function isNoLicense(rowData, licenseTypeField) {
      return (isLicenseInfoAvailable(rowData.licenseList) && PartnerService.isLicenseFree(getLicenseObj(rowData, licenseTypeField)) &&
        _.includes(noFreeLicense, licenseTypeField));
    }

    function isLicenseTypeAny(rowData, licenseTypeField) {
      if (!isLicenseInfoAvailable(rowData.licenseList)) {
        return false;
      }
      var licenseObj = getLicenseObj(rowData, licenseTypeField);
      return PartnerService.isLicenseATrial(licenseObj) || PartnerService.isLicenseActive(licenseObj);
    }

    function getTotalLicenses(rowData) {
      if (getAccountStatus(rowData) === 'active') {
        return _.sum(rowData.licenseList, 'volume');
      } else {
        return rowData.licenses + rowData.deviceLicenses;
      }
    }

    function partnerClicked(rowData) {
      $scope.activeBadge = isPartnerOrg(rowData);
    }

    function isPartnerOrg(rowData) {
      return rowData === Authinfo.getOrgId();
    }

    function setTrial(trial) {
      $scope.currentTrial = trial;
    }

    function getAccountStatus(rowData) {
      var licenseTypes = ['messaging', 'communications', 'care', 'roomSystems', 'conferencing'];
      if (rowData.daysLeft <= 0) {
        return 'expired';
      }
      var isTrial = _.some(licenseTypes, function (type) {
        return isLicenseTypeATrial(rowData, type);
      });
      return isTrial ? 'trial' : 'active';
    }

    function getExpiredNotesColumnText(rowData) {
      // Can renew up to 30 days after expiration (grace period)
      var maxExpiredDaysLeft = -30;
      if (_.inRange(rowData.daysLeft, 0, maxExpiredDaysLeft)) {
        return $translate.instant('customerPage.expiredWithGracePeriod');
      } else {
        return $translate.instant('customerPage.expired');
      }
    }

    function showCustomerDetails(customer) {
      $scope.currentTrial = customer;
      $state.go('customer-overview', {
        currentCustomer: customer
      });
    }

    function closeActionsDropdown() {
      angular.element('.open').removeClass('open');
    }

    function getIsTrial(org) {
      if (!!org.isPartner) return false;
      return _.get(org, 'communications.isTrial', true);
    }

    function addNumbers(org) {
      return ExternalNumberService.isTerminusCustomer(org.customerOrgId)
        .then(function (response) {
          if (response) {
            return $state.go('pstnSetup', {
              customerId: org.customerOrgId,
              customerName: org.customerName,
              customerEmail: org.customerEmail,
              customerCommunicationLicenseIsTrial: getIsTrial(org)
            });
          } else {
            return $state.go('didadd', {
              currentOrg: org
            });
          }
        });
    }
  }
})();
