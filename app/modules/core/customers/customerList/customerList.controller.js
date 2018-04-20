require('./_customer-list.scss');

(function () {
  'use strict';

  angular.module('Core')
    .controller('CustomerListCtrl', CustomerListCtrl);

  /* @ngInject */
  function CustomerListCtrl($q, $scope, $state, $translate, Analytics, Authinfo, Config, ExternalNumberService, FeatureToggleService, GridCellService, HuronCompassService, Log, Notification, Orgservice, PartnerService, TrialService) {
    var nameTemplate = require('./grid/nameColumn.tpl.html');
    var compactServiceTemplate = require('./grid/compactServiceColumn.tpl.html');
    var accountStatusTemplate = require('./grid/accountStatusColumn.tpl.html');

    var PREMIUM = 'premium';
    var STANDARD = 'standard';

    var myOrgDetails = {};

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
    vm.onChangeFilters = onChangeFilters;

    vm.activeFilter = 'all';
    vm.filterList = _.debounce(filterAction, vm.timeoutVal);

    // columnSort - this is the collection of column sorting algorithms
    // NOTE: version of ui-grid we are using does not support 'defaultSort', otherwise
    // we'd want to set a default sort on the name field
    var columnSort = {
      name: function (a, b) {
        var first = _.toLower(a);
        var second = _.toLower(b);
        if (first < second) {
          return -1;
        } else if (first > second) {
          return 1;
        }
        return 0;
      },

      // Sort function to keep partner org at top
      namePartnerAtTop: function (a, b) {
        var orgName = Authinfo.getOrgName();
        var aOrg = (a === orgName);
        var bOrg = (b === orgName);
        if (aOrg && bOrg) {
          return 0;
        } else if (aOrg) {
          return -1;
        } else if (bOrg) {
          return 1;
        }
        return columnSort.name(a, b);
      },

      accountStatus: function (a, b) {
        var aUnavailable = !a;
        var bUnavailable = !b;

        if (aUnavailable && bUnavailable) {
          return 0;
        } else if (aUnavailable) {
          return -1;
        } else if (bUnavailable) {
          return 1;
        }

        return (vm.statusTextOrder[a] - vm.statusTextOrder[b]);
      },

      license: function (a, b) {
        return _.toFinite(a) - _.toFinite(b);
      },

      notes: function (a, b, rowA, rowB) {
        var aUnavailable = !a || !rowA;
        var bUnavailable = !b || !rowB;

        if (aUnavailable && bUnavailable) {
          return 0;
        } else if (aUnavailable) {
          return -1;
        } else if (bUnavailable) {
          return 1;
        }

        var modA = (a.sortOrder === PartnerService.customerStatus.NOTE_DAYS_LEFT) ? '0' : a.text;
        var modB = (b.sortOrder === PartnerService.customerStatus.NOTE_DAYS_LEFT) ? '0' : b.text;
        if (modA < modB) {
          return -1;
        } else if (modA > modB) {
          return 1;
        } else if (a.sortOrder === PartnerService.customerStatus.NOTE_DAYS_LEFT) {
          // Anything with 'days left' is sorted by the actual days, not the text
          // Then lump all expired but within grace period trials by how expired (-x days)
          // Then lump all expired trials together (-9999)
          if (a.daysLeft < 0) {
            modA = (rowA.entity.startDate && _.inRange(a.daysLeft, 0, Config.trialGracePeriod)) ?
              a.daysLeft : -9999;
          } else {
            modA = a.daysLeft;
          }

          if (b.daysLeft < 0) {
            modB = (rowB.entity.startDate && _.inRange(b.daysLeft, 0, Config.trialGracePeriod)) ?
              b.daysLeft : -9999;
          } else {
            modB = b.daysLeft;
          }

          return modB - modA;
        }
        return 0;
      },

      service: function (a, b) {
        return _.toFinite(a) - _.toFinite(b);
      },

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
    };

    // for jasmine tests
    vm._helpers = {
      columnSort: columnSort,
      updateResultCount: updateResultCount,
      updateServiceForOrg: updateServiceForOrg,
    };

    function init() {
      initUIGrid();

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
    init();

    // Filters allow user to cull what is displayed in ui-grid
    function initFilters() {
      var arFilters = [
        ['messaging', 'message'],
        ['conferencing', 'meeting'],
        ['webex', 'webexOverview'],
        ['communications', 'call'],
        ['roomSystems', 'roomSystem'],
        ['sparkBoard', 'sparkBoard'],
        ['care', 'care'],
        ['trial'],
        ['active'],
        [PREMIUM],
        [STANDARD],
        ['expired'],
        //['pending'], -- don't include pending until DE2048 is fixed
        ['purchasedWithActive'],
        ['purchasedWithExpired'],
      ];

      vm.filter = {
        selected: [],
        placeholder: $translate.instant('customerPage.filters.placeholder'),
        singular: $translate.instant('customerPage.filters.filter'),
        plural: $translate.instant('customerPage.filters.filters'),
        options: [],
      };

      _.forEach(arFilters, function (filter) {
        var isPremium = (filter[0] === PREMIUM) || (filter[0] === STANDARD);
        var key = filter[1] || (filter[0] + 'Accounts');
        vm.filter.options.push({
          count: 0,
          value: filter[0],
          key: key,
          label: $translate.instant('customerPage.filters.' + key, { count: 0 }),
          isSelected: false,
          isAccountFilter: (key.indexOf('Accounts') !== -1) && !isPremium,
          isPremiumFilter: isPremium,
          previousState: false,
        });
      });

      sortFilterList();
    }

    // sortFilterList() - resorts vm.filter.options into buckets of selected, services, accounts, premiums
    function sortFilterList() {
      vm.filter.options = _.sortBy(vm.filter.options, ['isSelected',
        function (o) { return o.isAccountFilter || o.isPremiumFilter; },
        'isPremiumFilter', 'label',
      ]);
    }

    // onChangeFilters invoked everytime filter droplist modified
    function onChangeFilters() {
      if (_.get(vm, 'gridApi.grid.refresh')) {
        vm.gridApi.grid.refresh();
      }
    }

    function initUIGrid() {
      // ColumnDefs for the customer list grid
      var columnDefs = [
        {
          field: 'customerName',
          displayName: 'customerNameHeader',
          width: '25%',
          cellTemplate: nameTemplate,
          cellClass: 'ui-grid-add-column-border',
          sort: {
            direction: 'asc',
          },
          sortingAlgorithm: columnSort.namePartnerAtTop,
        }, {
          field: 'uniqueServiceCount',
          displayName: 'services',
          width: '25%',
          cellTemplate: compactServiceTemplate,
          headerCellClass: 'align-center',
          sortingAlgorithm: columnSort.service,
        }, {
          field: 'accountStatus',
          displayName: 'accountStatus',
          width: '16.5%',
          cellTemplate: accountStatusTemplate,
          headerCellClass: 'align-center',
          sortingAlgorithm: columnSort.accountStatus,
        }, {
          field: 'totalLicenses',
          displayName: 'totalLicenses',
          width: '16.5%',
          cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.showCustomerDetails(row.entity)" cell-value="grid.appScope.getLicenseCountColumnText(row.entity)" center-text="true"></cs-grid-cell>',
          headerCellClass: 'align-center',
          sortingAlgorithm: columnSort.license,
        }, {
        /* AG TODO:  once we have data for total users -- add back
          field: 'totalUsers',
          displayName: '$translate.instant('customerPage.'active') + ' / ' + $translate.instant('customerPage.totalUsers'),
          width: '16%',
          cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.showCustomerDetails(row.entity)" cell-value="grid.appScope.getUserCountColumnText(row.entity)" center-text="true"></cs-grid-cell>',
          headerCellClass: 'align-center',
          sortingAlgorithm: userSort
        }, {*/
          field: 'notes',
          displayName: 'notes',
          cellTemplate: '<cs-grid-cell title="TOOLTIP" row="row" grid="grid" cell-click-function="grid.appScope.showCustomerDetails(row.entity)" cell-value="row.entity.notes.text"></cs-grid-cell>',
          cellTooltip: function (row) {
            return _.get(row, 'entity.notes.text');
          },
          sortingAlgorithm: columnSort.notes,
        },
      ];

      // post-processing of columnDefs array
      _.forEach(columnDefs, function (o) {
        o.displayName = $translate.instant('customerPage.' + o.displayName);
      });

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

      vm.gridColumns = columnDefs;
      vm.gridOptions.columnDefs = columnDefs;

      initStatusTextOrder(); // sort order for 'status' column
      initFilters();
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

    // notes:
    // - sort order based on the translated text for account status fields
    // - we do this because the actual text in the columns includes a status icon and that prevent us from using the standard alpha sort built into ui-grid
    function initStatusTextOrder() {
      var statuses = [
        { key: 'active', xlat: 'purchased' },
        { key: 'purchasedWithActive' },
        { key: 'purchasedWithExpired' },
        { key: 'trial' },
        { key: 'expired' },
        { key: 'pending' },
      ];

      // Sort values by translated strings
      _.forEach(statuses, function (status) {
        status.xlat = $translate.instant('customerPage.' + ((status.xlat) ? status.xlat : status.key));
      });
      statuses = _.sortBy(statuses, ['xlat']);

      // Store sort order for future reference
      vm.statusTextOrder = {};
      _.forEach(statuses, function (status, index) {
        vm.statusTextOrder[status.key] = index;
      });
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

      var visibleRowData = _.map(_.filter(rows, { visible: true }), 'entity');
      var allRowData = _.map(rows, 'entity');
      updateResultCount(visibleRowData, allRowData);
      sortFilterList();

      return rows;
    }

    function isPremiumFilterType(filterValue, isPremium) {
      return (filterValue === PREMIUM) ? isPremium : !isPremium;
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

    function updateResultCount(visibleRows, allRows) {
      vm.totalOrgs = visibleRows.length;
      var statusTypeCounts = _.countBy(allRows, 'accountStatus');
      var accountFilters = _.filter(vm.filter.options, { isAccountFilter: true });
      _.forEach(accountFilters, function (filter) {
        filter.count = statusTypeCounts[filter.value] || 0;
        filter.label = $translate.instant('customerPage.filters.' + filter.key, {
          count: filter.count,
        });
      });

      if (vm.isProPackEnabled) {
        var counts = {};
        counts[PREMIUM] = _.filter(visibleRows, { isPremium: true });
        counts[STANDARD] = _.filter(visibleRows, { isPremium: false });
        var premiumFilters = _.filter(vm.filter.options, { isPremiumFilter: true });

        _.forEach(premiumFilters, function (filter) {
          filter.count = _.get(counts, filter.value, []).length;
          filter.label = $translate.instant('customerPage.filters.' + filter.key, {
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

    function isLicenseInfoAvailable(rowData) {
      return PartnerService.isLicenseInfoAvailable(rowData);
    }

    function getLicenseObj(rowData, licenseTypeField) {
      return rowData[licenseTypeField] || null;
    }

    function isLicenseTypeActive(rowData, licenseTypeField) {
      return isLicenseInfoAvailable(rowData) && PartnerService.isLicenseActive(getLicenseObj(rowData, licenseTypeField));
    }

    function isLicenseTypeFree(rowData, licenseTypeField) {
      return (isLicenseInfoAvailable(rowData) && PartnerService.isLicenseFree(getLicenseObj(rowData, licenseTypeField)) &&
        _.includes(Config.freeLicenses, licenseTypeField));
    }

    function isNoLicense(rowData, licenseTypeField) {
      return (isLicenseInfoAvailable(rowData) && PartnerService.isLicenseFree(getLicenseObj(rowData, licenseTypeField)) &&
        !_.includes(Config.freeLicenses, licenseTypeField));
    }

    function isLicenseTypeAny(rowData, licenseTypeField) {
      return PartnerService.isLicenseTypeAny(rowData, licenseTypeField);
    }

    function getLicenseCountColumnText(rowData) {
      if (!isLicenseInfoAvailable(rowData)) {
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
            return $state.go('pstnWizard', {
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
