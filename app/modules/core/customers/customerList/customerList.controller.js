(function () {
  'use strict';

  angular.module('Core')
    .controller('CustomerListCtrl', CustomerListCtrl);

  /* @ngInject */
  function CustomerListCtrl($q, $rootScope, $scope, $state, $stateParams, $templateCache, $translate, $window, Authinfo, Config, ExternalNumberService, Localytics, Log, Notification, Orgservice, PartnerService, PstnSetupService, TrialService) {
    $scope.isCustomerPartner = Authinfo.isCustomerPartner ? true : false;
    $scope.isPartnerAdmin = Authinfo.isPartnerAdmin();
    $scope.activeBadge = false;
    $scope.isTestOrg = false;
    $scope.searchStr = '';
    $scope.timeoutVal = 1000;

    $scope.isOrgSetup = isOrgSetup;
    $scope.isPartnerAdminWithCall = isPartnerAdminWithCall;
    $scope.isOwnOrg = isOwnOrg;
    $scope.setFilter = setFilter;
    $scope.filterAction = filterAction;
    $scope.getUserAuthInfo = getUserAuthInfo;
    $scope.getTrialsList = getTrialsList;
    $scope.openAddTrialModal = openAddTrialModal;
    $scope.openEditTrialModal = openEditTrialModal;
    $scope.actionEvents = actionEvents;
    $scope.isLicenseInfoAvailable = isLicenseInfoAvailable;
    $scope.isLicenseTypeATrial = isLicenseTypeATrial;
    $scope.isLicenseTypeActive = isLicenseTypeActive;
    $scope.isLicenseTypeFree = isLicenseTypeFree;
    $scope.partnerClicked = partnerClicked;
    $scope.isPartnerOrg = isPartnerOrg;
    $scope.setTrial = setTrial;
    $scope.showCustomerDetails = showCustomerDetails;
    $scope.closeActionsDropdown = closeActionsDropdown;
    $scope.addNumbers = addNumbers;

    $scope.exportType = $rootScope.typeOfExport.CUSTOMER;
    $scope.filterList = _.debounce(filterAction, $scope.timeoutVal);

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

    var actionTemplate = $templateCache.get('modules/core/customers/customerList/grid/actionColumn.tpl.html');
    var nameTemplate = $templateCache.get('modules/core/customers/customerList/grid/nameColumn.tpl.html');
    var serviceTemplate = $templateCache.get('modules/core/customers/customerList/grid/serviceColumn.tpl.html');
    var noteTemplate = $templateCache.get('modules/core/customers/customerList/grid/noteColumn.tpl.html');

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
      columnDefs: [{
        field: 'customerName',
        displayName: $translate.instant('customerPage.customerNameHeader'),
        width: '25%',
        cellTemplate: nameTemplate,
        cellClass: 'ui-grid-add-column-border',
        sortingAlgorithm: partnerAtTopSort,
        sort: {
          direction: 'asc',
          priority: 0,
        },
      }, {
        field: 'messaging',
        displayName: $translate.instant('customerPage.message'),
        width: '12%',
        cellTemplate: serviceTemplate,
        headerCellClass: 'align-center',
        sortingAlgorithm: serviceSort
      }, {
        field: 'conferencing',
        displayName: $translate.instant('customerPage.meeting'),
        width: '12%',
        cellTemplate: serviceTemplate,
        headerCellClass: 'align-center',
        sortingAlgorithm: serviceSort
      }, {
        field: 'communications',
        displayName: $translate.instant('customerPage.call'),
        width: '12%',
        cellTemplate: serviceTemplate,
        headerCellClass: 'align-center',
        sortingAlgorithm: serviceSort
      }, {
        field: 'roomSystems',
        displayName: $translate.instant('customerPage.roomSystems'),
        width: '12%',
        cellTemplate: serviceTemplate,
        headerCellClass: 'align-center',
        sortingAlgorithm: serviceSort
      }, {
        field: 'notes',
        displayName: $translate.instant('customerPage.notes'),
        cellTemplate: noteTemplate,
        sortingAlgorithm: notesSort
      }, {
        field: 'action',
        displayName: $translate.instant('customerPage.actionHeader'),
        sortable: false,
        cellTemplate: actionTemplate,
        width: '95',
        cellClass: 'align-center'
      }]
    };

    init();

    function init() {
      setNotesTextOrder();
      resetLists().then(function () {
        setFilter($stateParams.filter);
      });
      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          $scope.isTestOrg = data.isTestOrg;
        } else {
          Log.error('Query org info failed. Status: ' + status);
        }
      });
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
        Orgservice.getAdminOrg(function (data, status) {
          if (status === 200) {
            var myOrg = PartnerService.loadRetrievedDataToList([data], false);
            myOrg.customerName = Authinfo.getOrgName();
            myOrg.customerOrgId = Authinfo.getOrgId();

            resolve(myOrg);
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

      if (Authinfo.isPartnerAdmin() || Authinfo.isPartnerReadOnlyAdmin()) {
        // move our org to the top of the list
        // dont know why this is here yet
        // this should be handled by a sorting fn
        if (searchText === '' || Authinfo.getOrgName().indexOf(searchText) !== -1) {
          promiselist.push(getMyOrgDetails());
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
          var managed = PartnerService.loadRetrievedDataToList(_.get(results, '[0].data.organizations', []), false);

          if (results[1]) {
            // 4/11/2016 admolla
            // TODO: for some reason if I refactor this to not need an array, karma acts up....
            if (_.isArray(results[1])) {
              managed.unshift(results[1][0]);
            }
          }

          $scope.managedOrgsList = managed;
          $scope.totalOrgs = $scope.managedOrgsList.length;

          // dont use a .finally(..) since this $q.all is returned
          // (if you .finally(..), the next `then` doesnt get called)
          $scope.showManagedOrgsRefresh = false;
        });
    }

    function getUserAuthInfo(customerOrgId) {
      PartnerService.getUserAuthInfo(customerOrgId);
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
          $scope.trialsList = PartnerService.loadRetrievedDataToList(_.get(response, 'data.trials', []), true);
          $scope.totalTrials = $scope.trialsList.length;
        });
    }

    function openAddTrialModal() {
      if ($scope.isTestOrg) {
        Localytics.tagEvent(Localytics.events.startTrialButton, {
          from: $state.current.name
        });
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
        getUserAuthInfo(org.customerOrgId);
      } else if (action === 'pstn') {
        closeActionsDropdown();
        addNumbers(org);
        getUserAuthInfo(org.customerOrgId);
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
      return PartnerService.isLicenseATrial(getLicenseObj(rowData, licenseTypeField));
    }

    function isLicenseTypeActive(rowData, licenseTypeField) {
      return PartnerService.isLicenseActive(getLicenseObj(rowData, licenseTypeField));
    }

    function isLicenseTypeFree(rowData, licenseTypeField) {
      return PartnerService.isLicenseFree(getLicenseObj(rowData, licenseTypeField));
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
