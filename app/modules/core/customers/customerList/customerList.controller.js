(function () {
  'use strict';

  angular.module('Core')
    .controller('CustomerListCtrl', CustomerListCtrl);

  /* @ngInject */
  function CustomerListCtrl($q, $rootScope, $scope, $state, $stateParams, $templateCache, $translate, $window, Analytics, Authinfo, Config, customerListToggle, ExternalNumberService, FeatureToggleService, Log, Notification, Orgservice, PartnerService, TrialService, CsdmPlaceService) {
    $scope.isCustomerPartner = !!Authinfo.isCustomerPartner;
    $scope.isPartnerAdmin = Authinfo.isPartnerAdmin();
    $scope.activeBadge = false;
    $scope.isTestOrg = false;
    $scope.searchStr = '';
    $scope.timeoutVal = 1000;
    $scope.isCareEnabled = false;
    $scope.placesEnabled = false;
    $scope.isOrgSetup = isOrgSetup;
    $scope.isPartnerAdminWithCallOrRooms = isPartnerAdminWithCallOrRooms;
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
    $scope.getLicenseCountColumnText = getLicenseCountColumnText;
    $scope.getAccountStatus = getAccountStatus;
    $scope.isLicenseTypeAny = isLicenseTypeAny;
    $scope.getUserCountColumnText = getUserCountColumnText;
    $scope.isPastGracePeriod = isPastGracePeriod;
    $scope.isPstnSetup = isPstnSetup;

    $scope.convertStatusToInt = convertStatusToInt;

    $scope.exportType = $rootScope.typeOfExport.CUSTOMER;
    $scope.filterList = _.debounce(filterAction, $scope.timeoutVal);

    $scope.customerListToggle = customerListToggle;

    // expecting this guy to be unset on init, and set every time after
    // check resetLists fn to see how its being used
    $scope.activeFilter = 'all';
    $scope.filter = {
      selected: [],
      placeholder: $translate.instant('customerPage.filterSelectPlaceholder'),
      options: [{
        value: 'messaging',
        label: $translate.instant('customerPage.message'),
        isSelected: false,
        isAccountFilter: false
      }, {
        value: 'conferencing',
        label: $translate.instant('customerPage.meeting'),
        isSelected: false,
        isAccountFilter: false
      }, {
        value: 'webex',
        label: $translate.instant('customerPage.webexOverview'),
        isSelected: false,
        isAccountFilter: false
      }, {
        value: 'communications',
        label: $translate.instant('customerPage.call'),
        isSelected: false,
        isAccountFilter: false
      }, {
        value: 'roomSystems',
        label: $translate.instant('customerPage.roomSystems'),
        isSelected: false,
        isAccountFilter: false
      }, {
        value: 'care',
        label: $translate.instant('customerPage.care'),
        isSelected: false,
        isAccountFilter: false // a non-account filter filters on services instead
      }, {
        value: 'trial',
        label: $translate.instant('customerPage.trialAccountsFilter', {
          count: 0
        }),
        count: 0,
        isSelected: false,
        isAccountFilter: true
      }, {
        value: 'active',
        label: $translate.instant('customerPage.activeAccountsFilter', {
          count: 0
        }),
        count: 0,
        isSelected: false,
        isAccountFilter: true
      }, {
        value: 'expired',
        label: $translate.instant('customerPage.expiredAccountsFilter', {
          count: 0
        }),
        count: 0,
        isSelected: false,
        isAccountFilter: true
      }]
    };
    $scope.$watch('filter.selected', function () {
      if ($scope.gridApi) {
        $scope.gridApi.grid.refresh();
      }
    }, true);

    // for testing purposes
    $scope._helpers = {
      serviceSort: serviceSort,
      sortByDays: sortByDays,
      sortByName: sortByName,
      partnerAtTopSort: partnerAtTopSort,
      setNotesTextOrder: setNotesTextOrder,
      notesSort: notesSort,
      rowFilter: rowFilter,
      resetLists: resetLists,
      launchCustomerPortal: launchCustomerPortal,
      getLicenseObj: getLicenseObj,
      updateResultCount: updateResultCount,
      updateServiceForOrg: updateServiceForOrg
    };

    // common between new + old
    var nameTemplate = $templateCache.get('modules/core/customers/customerList/grid/nameColumn.tpl.html');
    // old templates. These should be deleted once the customer list redesign rolls out publiclly
    // FIXME: Delete when customer list redesign is published
    var serviceTemplate = $templateCache.get('modules/core/customers/customerList/grid/serviceColumn.tpl.html');
    var multiServiceTemplate = $templateCache.get('modules/core/customers/customerList/grid/multiServiceColumn.tpl.html');
    var oldNoteTemplate = $templateCache.get('modules/core/customers/customerList/grid/noteColumn.tpl.html');
    var actionTemplate = $templateCache.get('modules/core/customers/customerList/grid/actionColumn.tpl.html');
    // END SECTION TO BE DELETED

    // new templates (These should be kept when feature toggle is removed)
    var licenseCountTemplate = $templateCache.get('modules/core/customers/customerList/grid/licenseCountColumn.tpl.html');
    /*AG TODO:  temporarily hidden until we have data:
    var totalUsersTemplate = $templateCache.get('modules/core/customers/customerList/grid/totalUsersColumn.tpl.html');*/
    var compactServiceTemplate = $templateCache.get('modules/core/customers/customerList/grid/compactServiceColumn.tpl.html');
    var accountStatusTemplate = $templateCache.get('modules/core/customers/customerList/grid/accountStatusColumn.tpl.html');
    var newNoteTemplate = $templateCache.get('modules/core/customers/customerList/grid/newNoteColumn.tpl.html');

    // old grid column defs. These should be deleted once the customer list redesign rolls out publiclly
    //AG TODO:  Delete when customerList redesign is published
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
      field: 'uniqueServiceCount',
      displayName: $translate.instant('customerPage.services'),
      width: '25%',
      cellTemplate: compactServiceTemplate,
      headerCellClass: 'align-center'
    };
    var accountStatusField = {
      field: 'accountStatus',
      displayName: $translate.instant('customerPage.accountStatus'),
      width: '16.5%',
      cellTemplate: accountStatusTemplate,
      headerCellClass: 'align-center',
      sortingAlgorithm: accountStatusSort
    };
    var licenseQuantityField = {
      field: 'totalLicenses',
      displayName: $translate.instant('customerPage.totalLicenses'),
      width: '16.5%',
      cellTemplate: licenseCountTemplate,
      headerCellClass: 'align-center'
    };
  /* AG TODO:  once we have data for total users -- add back
      var totalUsersField = {
      field: 'totalUsers',
      displayName: $translate.instant('customerPage.active') + ' / ' + $translate.instant('customerPage.totalUsers'),
      width: '16%',
      cellTemplate: totalUsersTemplate,
      headerCellClass: 'align-center',
      sortingAlgorithm: userSort
    };*/
    var notesField = {
      field: 'notes',
      displayName: $translate.instant('customerPage.notes'),
      cellTemplate: newNoteTemplate,
      sortingAlgorithm: notesSort
    };

    var myOrgDetails = {};

    $scope.gridColumns = [];

    $scope.gridOptions = {
      data: 'gridData',
      multiSelect: false,
      rowHeight: 56,
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
            if (!$scope.customerListToggle) {
              getTrialsList(($scope.currentDataPosition * Config.usersperpage) + 1);
            }
            $scope.gridApi.infiniteScroll.dataLoaded();
          }
        });
        gridApi.grid.registerRowsProcessor(rowFilter, 150);
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
        }]
      },
      columnDefs: $scope.gridColumns
    };

    init();

    function init() {
      setNotesTextOrder();
      initColumns();
      FeatureToggleService.atlasCareTrialsGetStatus().then(function (careStatus) {
        $scope.isCareEnabled = careStatus && Authinfo.isCare();
        // FIXME: Remove this if block once the customer list refactor goes live
        // (This check is taken care of in the compactServiceColumn directive)
        if (!$scope.isCareEnabled) {
          _.remove($scope.gridColumns, careField);
          _.remove($scope.filter.options, { value: 'care' });
        }
      }, function () {
        // FIXME: Remove this if block once the customer list refactor goes live
        // if getting care feature status fails, fall back to the old behavior
        _.remove($scope.gridColumns, careField);
        _.remove($scope.filter.options, { value: 'care' });
      }).finally(function () {
        resetLists().then(function () {
          if (!$scope.customerListToggle) {
            setFilter($stateParams.filter);
          }
        });
      });

      CsdmPlaceService.placesFeatureIsEnabled().then(function (result) {
        $scope.placesEnabled = result;
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
          return _.includes(licenses, field.offerCode);
        }) || group[0]);
      });
      return result;
    }

    function initColumns() {
      var columns = [customerNameField];
      if ($scope.customerListToggle) {
        /* AG TODO: Once we have total users info -- user this line
        columns = columns.concat(allServicesField, accountStatusField, licenseQuantityField, totalUsersField, notesField); */
        columns = columns.concat(allServicesField, accountStatusField, licenseQuantityField, notesField);
      } else {
        columns = columns.concat(splitServicesFields, oldNotesField, actionField);
      }
      $scope.gridColumns = columns;
      $scope.gridOptions.columnDefs = columns;
    }

    function isOrgSetup(customer) {
      return _.every(customer.unmodifiedLicenses, {
        status: 'ACTIVE'
      });
    }

    function isPartnerAdminWithCallOrRooms(customer) {
      return (!_.isUndefined(customer.communications.licenseType) || (!_.isUndefined(customer.roomSystems.licenseType) && $scope.placesEnabled)) && $scope.isPartnerAdmin;
    }

    function isPstnSetup(row) {
      return (row.entity.isAllowedToManage && isOrgSetup(row.entity) && (row.entity.isSquaredUcOffer || (row.entity.isRoomSystems && $scope.placesEnabled))) || isPartnerAdminWithCallOrRooms(row.entity);
    }

    function isOwnOrg(customer) {
      return customer.customerOrgId === Authinfo.getOrgId();
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
      if (a === orgName) {
        return -1;
      } else if (b === orgName) {
        return 1;
      } else {
        return sortByName(a, b);
      }
    }

    function accountStatusSort(a, b, rowA, rowB) {
      var aStatus = $scope.convertStatusToInt($scope.getAccountStatus(rowA.entity));
      var bStatus = $scope.convertStatusToInt($scope.getAccountStatus(rowB.entity));
      return aStatus - bStatus;
    }

    function convertStatusToInt(a) {
      // These numbers are simply used for sorting, meaning lower numbers come first for ascending
      var statuses = ['active', 'expired', 'trial'];
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
      if (!customerListToggle) {
        // never want to filter with old design
        return rows;
      }
      var selectedFilters = {
        account: _.filter($scope.filter.selected, { isAccountFilter: true }),
        license: _.filter($scope.filter.selected, { isAccountFilter: false })
      };

      _.forEach(rows, function (row) {
        var isVisibleFlags = {
          byAccountFilter: (!selectedFilters.account.length) ||
            _.some(selectedFilters.account, function (filter) {
              return ($scope.getAccountStatus(row.entity) === filter.value);
            }),
          byLicenseFilter: (!selectedFilters.license.length) ||
            _.some(selectedFilters.license, function (filter) {
              return $scope.isLicenseTypeAny(row.entity, filter.value);
            })
        };

        row.visible = _.every(isVisibleFlags);

      });
      var visibleRowsData = _.chain(rows).filter({ visible: true }).map(function (row) { return row.entity; }).value();

      $scope._helpers.updateResultCount(visibleRowsData);
      return rows;
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
        Orgservice.getAdminOrg(function (data, status) {
          if (status === 200) {
            var myOrg = PartnerService.loadRetrievedDataToList([data], false, $scope.isCareEnabled, $scope.customerListToggle);
            // Not sure why this is set again, afaik it is the same as myOrg
            //AG 9/27 getAdminOrg returns licenses without offerCodes so services are not populated therefore this is needed
            myOrg[0].customerName = custName;
            myOrg[0].customerOrgId = accountId;

            myOrg[0].messaging = $scope._helpers.updateServiceForOrg(myOrg[0].messaging, licenses, {
              licenseType: 'MESSAGING'
            });
            myOrg[0].communications = $scope._helpers.updateServiceForOrg(myOrg[0].communications, licenses, {
              licenseType: 'COMMUNICATION'
            });
            myOrg[0].roomSystems = $scope._helpers.updateServiceForOrg(myOrg[0].roomSystems, licenses, {
              licenseType: 'SHARED_DEVICES'
            });
            myOrg[0].conferencing = $scope._helpers.updateServiceForOrg(myOrg[0].conferencing, licenses, {
              licenseType: 'CONFERENCING',
              offerName: 'CF'
            });
            myOrg[0].webexEEConferencing = $scope._helpers.updateServiceForOrg(myOrg[0].webexEEConferencing, licenses, {
              licenseType: 'CONFERENCING',
              offerName: 'EE'
            });

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
            var managed = PartnerService.loadRetrievedDataToList(orgList, false,
              $scope.isCareEnabled, $scope.customerListToggle);
            var indexMyOwnOrg = _.findIndex(managed, {
              customerOrgId: Authinfo.getOrgId()
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
            $scope.managedOrgsList = managed;
            $scope.totalOrgs = $scope.managedOrgsList.length;
          } else {
            Log.debug('Failed to retrieve managed orgs information.');
            Notification.error('partnerHomePage.errGetOrgs');
          }
          // dont use a .finally(..) since this $q.all is returned
          // (if you .finally(..), the next `then` doesnt get called)
          $scope.showManagedOrgsRefresh = false;
        })
        .catch(function (err) {
          Log.debug('Failed to retrieve managed orgs information. Status: ' + err.status);
          Notification.error('partnerHomePage.errGetTrialsQuery', {
            status: err.status
          });

          $scope.showManagedOrgsRefresh = false;
        });
    }

    function updateResultCount(visibleRowsData) {
      $scope.totalOrgs = visibleRowsData.length;
      var statusTypeCounts = _.countBy(visibleRowsData, function (dataRow) {
        return $scope.getAccountStatus(dataRow);
      });
      var accountFilters = _.filter($scope.filter.options, { isAccountFilter: true });
      _.forEach(accountFilters, function (filter) {
        filter.count = statusTypeCounts[filter.value] || 0;
        filter.label = $translate.instant('customerPage.' + filter.value + 'AccountsFilter', {
          count: filter.count });
      });
    }


    function modifyManagedOrgs(customerOrgId) {
      PartnerService.modifyManagedOrgs(customerOrgId);
    }

     // WARNING: not sure if this is needed, getManagedOrgsList contains a superset of this list
    // can be filtered by `createdBy` and `license.isTrial` but we have a second endpoint that
    // may at one point in the future return something other than the subset
    // AG : this will go away in refactor. We are getting rid of trials endpoint call
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
        Analytics.trackTrialSteps(Analytics.eventNames.START, $state.current.name, Authinfo.getOrgId());
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
      if (!$scope.customerListToggle) {
        return $q.all([getTrialsList($scope.searchStr), getManagedOrgsList($scope.searchStr)]);
      } else {
        return getManagedOrgsList($scope.searchStr).then(function () {
          $scope.gridData = $scope.managedOrgsList;
          $scope.totalOrgs = $scope.managedOrgsList.length;
        });
      }
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
      if (isPastGracePeriod(rowData)) {
        return $translate.instant('common.notAvailable');
      }
      return rowData.totalLicenses;
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
      if (rowData.daysLeft <= 0 || _.isUndefined(rowData.licenseList) || rowData.licenseList.length === 0) {
        return 'expired';
      }
      var isTrial = _.some(Config.licenseObjectNames, function (type) {
        return isLicenseTypeATrial(rowData, type);
      });
      return isTrial ? 'trial' : 'active';
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
      if (org.isPartner) return false;
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
