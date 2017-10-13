require('./_customer-list.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('CustomerListCtrl', CustomerListCtrl);

  /* @ngInject */
  function CustomerListCtrl($q, $scope, $state, $translate, Analytics, Authinfo, Config, ExternalNumberService, FeatureToggleService, GridCellService, HuronCompassService, Log, Notification, Orgservice, PartnerService, TrialService) {
    var PREMIUM = 'premium';
    var STANDARD = 'standard';

    var vm = this;
    vm.isCustomerPartner = !!Authinfo.isCustomerPartner;
    vm.isPartnerAdmin = Authinfo.isPartnerAdmin();
    vm.isTestOrg = false;
    vm.searchStr = '';
    vm.timeoutVal = 1000;
    vm.isCareEnabled = false;
    vm.isAdvanceCareEnabled = false;
    vm.premiumTooltip = $translate.instant('customerPage.premiumCustomer');
    vm.isOrgSetup = isOrgSetup;
    vm.isPartnerAdminWithCallOrRooms = isPartnerAdminWithCallOrRooms;
    vm.isOwnOrg = isOwnOrg;
    vm.getSubfields = getSubfields;
    vm.filterAction = filterAction;
    vm.modifyManagedOrgs = modifyManagedOrgs;
    vm.openAddTrialModal = openAddTrialModal;
    vm.actionEvents = actionEvents;
    vm.isLicenseInfoAvailable = isLicenseInfoAvailable;
    vm.isLicenseTypeActive = isLicenseTypeActive;
    vm.isLicenseTypeFree = isLicenseTypeFree;
    vm.isNoLicense = isNoLicense;
    vm.isPartnerOrg = isPartnerOrg;
    vm.setTrial = setTrial;
    vm.showCustomerDetails = showCustomerDetails;
    vm.selectRow = selectRow;
    vm.closeActionsDropdown = closeActionsDropdown;
    vm.addNumbers = addNumbers;
    vm.getLicenseCountColumnText = getLicenseCountColumnText;
    vm.isLicenseTypeAny = isLicenseTypeAny;
    vm.getUserCountColumnText = getUserCountColumnText;
    vm.isPastGracePeriod = isPastGracePeriod;
    vm.isPstnSetup = isPstnSetup;
    vm.exportCsv = exportCsv;

    vm.convertStatusToInt = convertStatusToInt;

    vm.activeFilter = 'all';
    vm.filterList = _.debounce(filterAction, vm.timeoutVal);

    var arFilters = [
      ['messaging', 'message'],
      ['conferencing', 'meeting'],
      ['webex', 'webexOverview'],
      ['communications', 'call'],
      ['roomSystems', 'roomSystem'],
      ['sparkBoard', 'sparkBoard'],
      ['care', 'care'],
      ['trial', 'trialAccountsFilter'],
      ['active', 'activeAccountsFilter'],
      [PREMIUM, 'premiumAccountsFilter'],
      [STANDARD, 'standardAccountsFilter'],
      ['expired', 'expiredAccountsFilter'],
      ['pending', 'pendingAccountsFilter'],
    ];

    vm.filter = {
      selected: [],
      placeholder: $translate.instant('customerPage.filterSelectPlaceholder'),
      options: [],
    };

    for (var i = 0; i < arFilters.length; i++) {
      var isPremium = (arFilters[i][0] === PREMIUM) || (arFilters[i][0] === STANDARD);
      vm.filter.options.push({
        count: 0,
        value: arFilters[i][0],
        label: $translate.instant('customerPage.' + arFilters[i][1], { count: 0 }),
        isSelected: false,
        isAccountFilter: (arFilters[i][1].indexOf('Accounts') !== -1) && !isPremium,
        isPremiumFilter: isPremium,
        previousState: false,
      });
    }
    // Might as well sort by label...
    vm.filter.options = _.sortBy(vm.filter.options, ['label']);

    $scope.$watch(function () {
      return vm.filter.selected;
    }, function () {
      if (vm.gridApi) {
        vm.gridApi.grid.refresh();
      }
    }, true);

    // hard-wire controller for jasmine tests
    vm._helpers = this;

    var nameTemplate = require('modules/core/customers/customerList/grid/nameColumn.tpl.html');
    var compactServiceTemplate = require('modules/core/customers/customerList/grid/compactServiceColumn.tpl.html');
    var accountStatusTemplate = require('modules/core/customers/customerList/grid/accountStatusColumn.tpl.html');

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
      },
    };
    var allServicesField = {
      field: 'uniqueServiceCount',
      displayName: $translate.instant('customerPage.services'),
      width: '25%',
      cellTemplate: compactServiceTemplate,
      headerCellClass: 'align-center',
    };
    var accountStatusField = {
      field: 'accountStatus',
      displayName: $translate.instant('customerPage.accountStatus'),
      width: '16.5%',
      cellTemplate: accountStatusTemplate,
      headerCellClass: 'align-center',
      sortingAlgorithm: accountStatusSort,
    };
    var licenseQuantityField = {
      field: 'totalLicenses',
      displayName: $translate.instant('customerPage.totalLicenses'),
      width: '16.5%',
      cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.showCustomerDetails(row.entity)" cell-value="grid.appScope.getLicenseCountColumnText(row.entity)" center-text="true"></cs-grid-cell>',
      headerCellClass: 'align-center',
      sortingAlgorithm: licenseSort,
    };
    /* AG TODO:  once we have data for total users -- add back
        var totalUsersField = {
        field: 'totalUsers',
        displayName: $translate.instant('customerPage.active') + ' / ' + $translate.instant('customerPage.totalUsers'),
        width: '16%',
        cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.showCustomerDetails(row.entity)" cell-value="grid.appScope.getUserCountColumnText(row.entity)" center-text="true"></cs-grid-cell>',
        headerCellClass: 'align-center',
        sortingAlgorithm: userSort
      };*/
    var notesField = {
      field: 'notes',
      displayName: $translate.instant('customerPage.notes'),
      cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.showCustomerDetails(row.entity)" cell-value="row.entity.notes.text"></cs-grid-cell>',
      sortingAlgorithm: notesSort,
    };

    var myOrgDetails = {};

    vm.gridColumns = [];

    vm.gridOptions = {
      //gridOptions.data is populated directly by the functions supplying the data.
      appScopeProvider: vm,
      rowHeight: 56,
      onRegisterApi: function (gridApi) {
        vm.gridApi = gridApi;

        vm.gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
          if (vm.load) {
            vm.currentDataPosition++;
            vm.load = false;
            vm.gridApi.infiniteScroll.dataLoaded();
          }
        });

        gridApi.grid.registerRowsProcessor(rowFilter, 150);
      },
      multiFields: {
        meeting: [{
          columnGroup: 'conferencing',
          columnName: 'conferencing',
          offerCode: 'CF',
          tooltip: $translate.instant('customerPage.meeting'),
        }, {
          columnGroup: 'webex',
          offerCode: 'EE',
          columnName: 'webexEEConferencing',
          tooltip: $translate.instant('customerPage.webex'),
        }, {
          columnGroup: 'webex',
          offerCode: 'CMR',
          columnName: 'webexCMR',
          tooltip: $translate.instant('customerPage.webex'),
        }, {
          columnGroup: 'webex',
          offerCode: 'MC',
          columnName: 'webexMeetingCenter',
          tooltip: $translate.instant('customerPage.webex'),
        }, {
          columnGroup: 'webex',
          offerCode: 'SC',
          columnName: 'webexSupportCenter',
          tooltip: $translate.instant('customerPage.webex'),
        }, {
          columnGroup: 'webex',
          offerCode: 'TC',
          columnName: 'webexTrainingCenter',
          tooltip: $translate.instant('customerPage.webex'),
        }, {
          columnGroup: 'webex',
          offerCode: 'EC',
          columnName: 'webexEventCenter',
          tooltip: $translate.instant('customerPage.webex'),
        }],
      },
      columnDefs: vm.gridColumns,
    };

    init();

    function init() {
      setNotesTextOrder();
      initColumns();

      $q.all({
        isCareEnabled: FeatureToggleService.atlasCareTrialsGetStatus(),
        isAdvanceCareEnabled: FeatureToggleService.atlasCareInboundTrialsGetStatus(),
        isProPackEnabled: FeatureToggleService.atlasITProPackGetStatus(),
      }).then(function (toggles) {
        vm.isCareEnabled = toggles.isCareEnabled;
        vm.isAdvanceCareEnabled = toggles.isAdvanceCareEnabled;
        vm.isProPackEnabled = toggles.isProPackEnabled;

        if (!vm.isProPackEnabled) {
          _.remove(vm.filter.options, { value: PREMIUM });
          _.remove(vm.filter.options, { value: STANDARD });
        }

        if (!vm.isCareEnabled) {
          _.remove(vm.filter.options, { value: 'care' });
        }
      }).finally(function () {
        resetLists();
      });

      Orgservice.isTestOrg()
        .then(function (isTestOrg) {
          vm.isTestOrg = isTestOrg;
        });
    }

    function getSubfields(entry, name) {
      var groupedFields = _.groupBy(vm.gridOptions.multiFields[name], 'columnGroup');
      //get licenses
      var licenses = _.map(entry.licenseList, 'offerName');
      var result = _.map(groupedFields, function (group) {
        //or return the one with license OR the first
        return (_.find(group, function (field) {
          return _.includes(licenses, field.offerCode);
        }) || group[0]);
      });
      return result;
    }

    function initColumns() {
      var columns = [customerNameField];
      /* AG TODO: Once we have total users info -- use this line
      columns = columns.concat(allServicesField, accountStatusField, licenseQuantityField, totalUsersField, notesField); */
      columns = columns.concat(allServicesField, accountStatusField, licenseQuantityField, notesField);
      vm.gridColumns = columns;
      vm.gridOptions.columnDefs = columns;
    }

    function isOrgSetup(customer) {
      return _.every(customer.unmodifiedLicenses, {
        status: 'ACTIVE',
      });
    }

    function isPartnerAdminWithCallOrRooms(customer) {
      return (!_.isUndefined(customer.communications.licenseType) || !_.isUndefined(customer.roomSystems.licenseType)) && vm.isPartnerAdmin;
    }

    function isPstnSetup(row) {
      return (row.entity.isAllowedToManage && isOrgSetup(row.entity) && (row.entity.isSquaredUcOffer || row.entity.isRoomSystems)) || isPartnerAdminWithCallOrRooms(row.entity);
    }

    function isOwnOrg(customer) {
      return customer.customerOrgId === Authinfo.getOrgId();
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
      if (a === orgName) {
        return -1;
      } else if (b === orgName) {
        return 1;
      } else {
        return sortByName(a, b);
      }
    }

    function accountStatusSort(a, b, rowA, rowB) {
      var aStatus = vm.convertStatusToInt(rowA.entity.accountStatus);
      var bStatus = vm.convertStatusToInt(rowB.entity.accountStatus);
      return aStatus - bStatus;
    }

    function licenseSort(a, b, rowA, rowB) {
      var rowAUnavailable = !isLicenseInfoAvailable(rowA.entity.licenseList);
      var rowBUnavailable = !isLicenseInfoAvailable(rowB.entity.licenseList);

      if (rowAUnavailable && rowBUnavailable) {
        return 0;
      } else if (rowAUnavailable) {
        return -1;
      } else if (rowBUnavailable) {
        return 1;
      } else {
        return a - b;
      }
    }

    function convertStatusToInt(a) {
      // These numbers are simply used for sorting, meaning lower numbers come first for ascending
      var statuses = ['active', 'pending', 'expired', 'trial'];
      var index = statuses.indexOf(a);
      if (index === -1) {
        return statuses.length;
      }
      return index;
    }

    /* AG TODO:  once we have data for total users -- add back
    function userSort(a, b, rowA, rowB) {
      var noUsersA = rowA.entity.numUsers === 0;
      var noUsersB = rowB.entity.numUsers === 0;
      if (noUsersA && noUsersB) {
        return 0;
      } else if (noUsersA) {
        return -1;
      } else if (noUsersB) {
        return 1;
      }
      var aPercent = rowA.entity.activeUsers / rowA.entity.numUsers;
      var bPercent = rowB.entity.activeUsers / rowB.entity.numUsers;
      return aPercent - bPercent;
    }*/

    function setNotesTextOrder() {
      var notes = [
        { key: 'suspended', status: 'NOTE_CANCELED' },
        { key: 'needsSetup', status: 'NOTE_NEEDS_SETUP' },
        { key: 'expiringToday', status: 'NOTE_EXPIRE_TODAY' },
        { key: 'expired', status: 'NOTE_EXPIRED' },
        { key: 'licenseInfoNotAvailable', status: 'NOTE_NO_LICENSE' },
      ];

      // 600% faster execution than _.forEach
      for (var i = 0; i < notes.length; i++) {
        notes[i].xlat = $translate.instant('customerPage.' + notes[i].key);
      }

      // sort based on translated value, then key value
      notes = _.sortBy(notes, ['xlat', 'key']);

      // apply sort order to partner service base on index
      for (i = 0; i < notes.length; i++) {
        PartnerService.customerStatus[notes[i].status] = i;
      }
    }

    function notesSort(a, b) {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      } else if (a.sortOrder === PartnerService.customerStatus.NOTE_NOT_EXPIRED ||
        a.sortOrder === PartnerService.customerStatus.NOTE_EXPIRED) {
        return Math.abs(a.daysLeft) - Math.abs(b.daysLeft);
      } else {
        return 0;
      }
    }


    // this function is called every time the grid needs to refresh after column filtering and before sorting
    // No changes to the length of rows can be made here, only visibility

    function rowFilter(rows) {
      var selectedFilters = {
        account: _.filter(vm.filter.selected, {
          isAccountFilter: true,
          isPremiumFilter: false,
        }),
        license: _.filter(vm.filter.selected, {
          isAccountFilter: false,
          isPremiumFilter: false,
        }),
        premium: _.filter(vm.filter.selected, {
          isAccountFilter: false,
          isPremiumFilter: true,
        }),
      };

      _.forEach(rows, function (row) {
        var isVisibleFlags = {
          byAccountFilter: (!selectedFilters.account.length) ||
          _.some(selectedFilters.account, function (filter) {
            return (row.entity.accountStatus === filter.value);
          }),
          byLicenseFilter: (!selectedFilters.license.length) ||
          _.some(selectedFilters.license, function (filter) {
            return vm.isLicenseTypeAny(row.entity, filter.value);
          }),
          byPremiumFilter: (!selectedFilters.premium.length) ||
          _.some(selectedFilters.premium, function (filter) {
            return isPremiumFilterType(filter.value, row.entity.isPremium);
          }),
        };

        row.visible = _.every(isVisibleFlags);
      });
      var visibleRowsData = _.chain(rows).filter({ visible: true }).map(function (row) { return row.entity; }).value();

      updateResultCount(visibleRowsData);
      return rows;
    }

    function isPremiumFilterType(filterValue, isPremium) {
      if (filterValue === PREMIUM) {
        return isPremium;
      } else if (filterValue === STANDARD) {
        return !isPremium;
      } else {
        return false;
      }
    }

    function filterAction(value) {
      vm.searchStr = value;
      resetLists().then(function () {
        vm.gridOptions.data = vm.managedOrgsList;
      });
    }

    function updateServiceForOrg(service, licenses, equalityObject) {
      var licensesGotten = _.filter(licenses, equalityObject);
      service = _.merge(service, _.get(licensesGotten, '[0]', null));
      if (licensesGotten.length > 1) {
        service.volume = _.reduce(licensesGotten, function (volume, license) {
          return volume + license.volume;
        }, 0);
      }
      return service;
    }

    function getMyOrgDetails() {
      return $q(function (resolve, reject) {
        var accountId = Authinfo.getOrgId();
        var custName = Authinfo.getOrgName();
        var licenses = Authinfo.getLicenses();
        var params = {
          basicInfo: true,
        };
        Orgservice.getAdminOrg(function (data, status) {
          if (status === 200) {
            var myOrg = PartnerService.loadRetrievedDataToList([data], {
              isTrialData: false,
              isCareEnabled: vm.isCareEnabled,
              isAdvanceCareEnabled: vm.isAdvanceCareEnabled,
            });


            // Not sure why this is set again, afaik it is the same as myOrg
            //AG 9/27 getAdminOrg returns licenses without offerCodes so services are not populated therefore this is needed
            myOrg[0].customerName = custName;
            myOrg[0].customerOrgId = accountId;

            myOrg[0].messaging = updateServiceForOrg(myOrg[0].messaging, licenses, {
              licenseType: 'MESSAGING',
            });
            myOrg[0].communications = updateServiceForOrg(myOrg[0].communications, licenses, {
              licenseType: 'COMMUNICATION',
            });
            myOrg[0].roomSystems = updateServiceForOrg(myOrg[0].roomSystems, licenses, {
              licenseType: 'SHARED_DEVICES',
              offerName: 'SD',
            });
            myOrg[0].sparkBoard = updateServiceForOrg(myOrg[0].sparkBoard, licenses, {
              licenseType: 'SHARED_DEVICES',
              offerName: 'SB',
            });
            myOrg[0].care = updateServiceForOrg(myOrg[0].care, licenses, {
              licenseType: 'CARE',
              offerName: 'CDC',
            });
            myOrg[0].advanceCare = updateServiceForOrg(myOrg[0].advanceCare, licenses, {
              licenseType: 'CAREVOICE',
              offerName: 'CVC',
            });
            myOrg[0].conferencing = updateServiceForOrg(myOrg[0].conferencing, licenses, {
              licenseType: 'CONFERENCING',
              offerName: 'CF',
            });
            myOrg[0].webexEEConferencing = updateServiceForOrg(myOrg[0].webexEEConferencing, licenses, {
              licenseType: 'CONFERENCING',
              offerName: 'EE',
            });

            myOrgDetails = myOrg;
            resolve(myOrgDetails);
          } else {
            reject('Unable to query for signed-in users org');
            Log.debug('Failed to retrieve partner org information. Status: ' + status);
          }
        }, accountId, params);
      });
    }

    function getManagedOrgsList(searchText) {
      vm.showManagedOrgsRefresh = true;
      var promiselist = { managedOrgs: PartnerService.getManagedOrgsList(searchText) };

      if (Authinfo.isPartnerAdmin() || Authinfo.isPartnerReadOnlyAdmin()) {
        // This attaches myOrg details to the managed orgs list
        if (searchText === '' || Authinfo.getOrgName().indexOf(searchText) !== -1) {
          promiselist.myOrgDetails = getMyOrgDetails();
        }
      }

      return $q.all(promiselist)
        .then(function (results) {
          if (results) {
            var orgList = _.get(results, 'managedOrgs.data.organizations', []);
            var managed = PartnerService.loadRetrievedDataToList(orgList, {
              isTrialData: false,
              isCareEnabled: vm.isCareEnabled,
              isAdvanceCareEnabled: vm.isAdvanceCareEnabled,
            });
            var indexMyOwnOrg = _.findIndex(managed, {
              customerOrgId: Authinfo.getOrgId(),
            });
            // 4/11/2016 admolla
            // TODO: for some reason if I refactor this to not need an array, karma acts up....
            if (results.myOrgDetails && _.isArray(results.myOrgDetails)) {
              if (indexMyOwnOrg === -1) {
                managed.unshift(results.myOrgDetails[0]);
              } else {
                managed[indexMyOwnOrg] = results.myOrgDetails[0];
              }
            }
            vm.managedOrgsList = managed;
            vm.totalOrgs = vm.managedOrgsList.length;
          } else {
            Log.debug('Failed to retrieve managed orgs information.');
            Notification.error('partnerHomePage.errGetOrgs');
          }
          // dont use a .finally(..) since this $q.all is returned
          // (if you .finally(..), the next 'then' doesnt get called)
          vm.showManagedOrgsRefresh = false;
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'partnerHomePage.errGetTrialsQuery');
          vm.showManagedOrgsRefresh = false;
        });
    }

    function updateResultCount(visibleRowsData) {
      vm.totalOrgs = visibleRowsData.length;
      var statusTypeCounts = _.countBy(visibleRowsData, function (dataRow) {
        return dataRow.accountStatus;
      });
      var accountFilters = _.filter(vm.filter.options, { isAccountFilter: true });
      _.forEach(accountFilters, function (filter) {
        filter.count = statusTypeCounts[filter.value] || 0;
        filter.label = $translate.instant('customerPage.' + filter.value + 'AccountsFilter', {
          count: filter.count,
        });
      });

      if (vm.isProPackEnabled) {
        var counts = {};
        counts[PREMIUM] = _.filter(visibleRowsData, { isPremium: true });
        counts[STANDARD] = _.filter(visibleRowsData, { isPremium: false });
        var premiumFilters = _.filter(vm.filter.options, { isPremiumFilter: true });

        _.forEach(premiumFilters, function (filter) {
          filter.count = _.get(counts, filter.value, []).length;
          filter.label = $translate.instant('customerPage.' + filter.value + 'AccountsFilter', {
            count: filter.count,
          });

          // Analytics should only fire when the filter for premium accounts is changed from unselected to selected
          if (filter.value === PREMIUM && filter.previousState !== filter.isSelected) {
            if (filter.previousState === false) {
              Analytics.trackPremiumEvent(Analytics.sections.PREMIUM.eventNames.PREMIUM_FILTER);
            }
            filter.previousState = filter.isSelected;
          }
        });
      }
    }

    function modifyManagedOrgs(customerOrgId) {
      PartnerService.modifyManagedOrgs(customerOrgId);
    }

    function openAddTrialModal() {
      Analytics.trackTrialSteps(Analytics.sections.TRIAL.eventNames.START_SETUP, $state.current.name, Authinfo.getOrgId());
      var route = TrialService.getAddTrialRoute();
      $state.go(route.path, route.params).then(function () {
        $state.modal.result.finally(resetLists);
      });
    }

    function resetLists() {
      return getManagedOrgsList(vm.searchStr).then(function () {
        vm.gridOptions.data = _.get(vm, 'managedOrgsList', []);
        vm.totalOrgs = _.get(vm, 'managedOrgsList', []).length;
      });
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
    }

    function isLicenseInfoAvailable(licenses) {
      return PartnerService.isLicenseInfoAvailable(licenses);
    }

    function getLicenseObj(rowData, licenseTypeField) {
      return rowData[licenseTypeField] || null;
    }

    function isLicenseTypeActive(rowData, licenseTypeField) {
      return isLicenseInfoAvailable(rowData.licenseList) && PartnerService.isLicenseActive(getLicenseObj(rowData, licenseTypeField));
    }

    function isLicenseTypeFree(rowData, licenseTypeField) {
      return (isLicenseInfoAvailable(rowData.licenseList) && PartnerService.isLicenseFree(getLicenseObj(rowData, licenseTypeField)) &&
        _.includes(Config.freeLicenses, licenseTypeField));
    }

    function isNoLicense(rowData, licenseTypeField) {
      return (isLicenseInfoAvailable(rowData.licenseList) && PartnerService.isLicenseFree(getLicenseObj(rowData, licenseTypeField)) &&
        !_.includes(Config.freeLicenses, licenseTypeField));
    }

    function isLicenseTypeAny(rowData, licenseTypeField) {
      return PartnerService.isLicenseTypeAny(rowData, licenseTypeField);
    }

    function getLicenseCountColumnText(rowData) {
      if (!isLicenseInfoAvailable(rowData.licenseList)) {
        return $translate.instant('common.notAvailable');
      }
      return '' + rowData.totalLicenses; // was not displaying '0' without the `'' + ` preceding
    }

    function isPastGracePeriod(rowData) {
      return rowData.daysLeft < Config.trialGracePeriod;
    }

    function getUserCountColumnText(rowData) {
      if (isPastGracePeriod(rowData)) {
        return $translate.instant('common.notAvailable');
      } else {
        return rowData.activeUsers + ' / ' + rowData.numUsers;
      }
    }

    function isPartnerOrg(rowData) {
      return rowData === Authinfo.getOrgId();
    }

    // export the list as a CSV
    function exportCsv() {
      return PartnerService.exportCSV(vm.isCareEnabled)
        .catch(function (response) {
          Notification.errorResponse(response, 'errors.csvError');
        });
    }

    function setTrial(trial) {
      vm.currentTrial = trial;
    }

    function selectRow(grid, row) {
      GridCellService.selectRow(grid, row);
      vm.showCustomerDetails(row.entity);
    }

    function showCustomerDetails(customer) {
      vm.currentTrial = customer;
      HuronCompassService.setIsCustomer(true);
      $state.go('customer-overview', {
        currentCustomer: customer,
      });
    }

    function closeActionsDropdown() {
      angular.element('.open').removeClass('open');
    }

    function getIsTrial(org, type) {
      if (org.isPartner) return false;
      return _.get(org, type + '.isTrial', true);
    }

    function addNumbers(org) {
      return ExternalNumberService.isTerminusCustomer(org.customerOrgId)
        .then(function (response) {
          if (response) {
            return $state.go('pstnSetup', {
              customerId: org.customerOrgId,
              customerName: org.customerName,
              customerEmail: org.customerEmail,
              customerCommunicationLicenseIsTrial: getIsTrial(org, 'communications'),
              customerRoomSystemsLicenseIsTrial: getIsTrial(org, 'roomSystems'),
            });
          } else {
            return Notification.error('pstnSetup.errors.customerNotFound');
          }
        });
    }
  }
})();
