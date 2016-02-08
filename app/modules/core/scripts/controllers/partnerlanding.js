'use strict';

angular.module('Core')
  .controller('PartnerHomeCtrl', ['$templateCache', '$scope', '$rootScope', '$stateParams', 'Notification', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config', '$translate', 'PartnerService', 'Orgservice', '$filter', '$state', 'ExternalNumberPool', 'LogMetricsService', '$log', '$window',

    function ($templateCache, $scope, $rootScope, $stateParams, Notification, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config, $translate, PartnerService, Orgservice, $filter, $state, ExternalNumberPool, LogMetricsService, $log, $window) {

      $scope.load = true;
      $scope.currentDataPosition = 0;
      if ($state.params.filter) {
        $scope.activeFilter = $state.params.filter;
      } else {
        $scope.activeFilter = 'all';
      }

      $scope.exportType = $rootScope.typeOfExport.CUSTOMER;

      $scope.daysExpired = 5;
      $scope.displayRows = 10;
      $scope.expiredRows = 3;
      $scope.currentTrial = null;
      $scope.showTrialsRefresh = true;
      $scope.activeBadge = false;
      $scope.filter = 'ALL';
      $scope.trialsList = [];
      $scope.isCustomerPartner = Authinfo.isCustomerPartner ? true : false;
      $scope.launchCustomerPortal = launchCustomerPortal;
      setNotesTextOrder();

      $scope.openAddTrialModal = function () {
        $state.go('trialAdd.info').then(function () {
          $state.modal.result.finally(function () {
            getTrialsList();
            getManagedOrgsList();
          });
        });
      };

      $scope.openEditTrialModal = function () {
        $state.go('trialEdit.info', {
          currentTrial: $scope.currentTrial
        }).then(function () {
          $state.modal.result.finally(function () {
            getTrialsList();
            getManagedOrgsList();
          });
        });
      };

      $scope.setTrial = function (trial) {
        $scope.currentTrial = trial;
      };

      $scope.getProgressStatus = function (obj) {
        if (!obj) {
          obj = $scope.currentTrial;
        }
        if (obj.daysLeft <= 5) {
          return 'danger';
        } else if (obj.daysLeft < (obj.duration / 2)) {
          return 'warning';
        } else {
          return 'success';
        }
      };

      function getTrialsList() {
        $scope.showTrialsRefresh = true;
        PartnerService.getTrialsList(function (data, status) {
          $scope.showTrialsRefresh = false;
          if (data.success && data.trials) {
            if (data.trials.length > 0) {
              $scope.trialsList = PartnerService.loadRetrievedDataToList(data.trials, [], true);
              $scope.activeList = _.filter($scope.trialsList, {
                state: "ACTIVE"
              });
              $scope.expiredList = _.filter($scope.trialsList, {
                state: "EXPIRED"
              });
              $scope.showExpired = $scope.expiredList.length > 0;
              Log.debug('active trial records found:' + $scope.activeList.length);
              Log.debug('total trial records found:' + $scope.trialsList.length);
            } else {
              $scope.getPending = false;
              Log.debug('No trial records found');
            }
            $scope.totalTrials = $scope.trialsList ? $scope.trialsList.length : 0;
            $scope.setFilter($scope.activeFilter);
          } else {
            Log.debug('Failed to retrieve trial information. Status: ' + status);
            $scope.getPending = false;
            Notification.notify([$translate.instant('partnerHomePage.errGetTrialsQuery', {
              status: status
            })], 'error');
          }
        });
      }

      function getManagedOrgsList() {
        $scope.showManagedOrgsRefresh = true;
        $scope.managedOrgsList = [];
        var isPartnerAdmin = Authinfo.isPartnerAdmin();
        if (isPartnerAdmin) {
          var accountId = Authinfo.getOrgId();
          Orgservice.getAdminOrg(function (data, status) {
            if (status === 200) {
              PartnerService.loadRetrievedDataToList([data], $scope.managedOrgsList, false);
            } else {
              Log.debug('Failed to retrieve partner org information. Status: ' + status);
            }
          }, accountId);
        }
        PartnerService.getManagedOrgsList(function (data, status) {
          $scope.showManagedOrgsRefresh = false;
          if (data.success && data.organizations) {
            if (data.organizations.length > 0) {
              PartnerService.loadRetrievedDataToList(data.organizations, $scope.managedOrgsList, false);
              Log.debug('total managed orgs records found:' + $scope.managedOrgsList.length);
            } else {
              Log.debug('No managed orgs records found');
            }
            $scope.totalOrgs = $scope.managedOrgsList ? $scope.managedOrgsList.length : 0;
            $scope.setFilter($scope.activeFilter);
          } else {
            Log.debug('Failed to retrieve managed orgs information. Status: ' + status);
            Notification.notify([$translate.instant('partnerHomePage.errGetTrialsQuery', {
              status: status
            })], 'error');
          }
        });
      }

      $scope.closeActionsDropdown = function () {
        angular.element('.open').removeClass('open');
      };

      if (!$scope.isCustomerPartner) {
        getTrialsList();
      }
      getManagedOrgsList();

      $scope.activeCount = 0;
      if ($scope.activeList) {
        $scope.activeCount = $scope.activeList.length;
      }

      $scope.newTrialName = null;
      var actionTemplate = $templateCache.get('modules/core/partnerLanding/grid/actionColumn.tpl.html');
      var nameTemplate = $templateCache.get('modules/core/partnerLanding/grid/nameColumn.tpl.html');
      var serviceTemplate = $templateCache.get('modules/core/partnerLanding/grid/serviceColumn.tpl.html');
      var noteTemplate = $templateCache.get('modules/core/partnerLanding/grid/noteColumn.tpl.html');

      $scope.gridOptions = {
        data: 'gridData',
        multiSelect: false,
        rowHeight: 44,
        enableRowHeaderSelection: false,
        enableColumnResize: true,
        enableColumnMenus: false,
        onRegisterApi: function (gridApi) {
          $scope.gridApi = gridApi;
          gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            $scope.showCustomerDetails(row.entity);
          });
          gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
            if ($scope.load) {
              $scope.currentDataPosition++;
              $scope.load = false;
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
            headerClass: 'align-center',
            sortingAlgorithm: serviceSort
          }, {
            field: 'conferencing',
            displayName: $translate.instant('customerPage.meeting'),
            width: '12%',
            cellTemplate: serviceTemplate,
            headerClass: 'align-center',
            sortingAlgorithm: serviceSort
          }, {
            field: 'communications',
            displayName: $translate.instant('customerPage.call'),
            width: '12%',
            cellTemplate: serviceTemplate,
            headerClass: 'align-center',
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
            width: '90'
          }]
      };

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

      $scope.showCustomerDetails = function (customer) {
        $scope.currentTrial = customer;
        $state.go('customer-overview', {
          currentCustomer: customer
        });
      };

      $scope.sort = {
        by: 'customerName',
        order: 'ascending'
      };

      $scope.exportBtn = {
        disabled: true
      };

      $scope.filterList = function (filterBy) {
        $scope.filter = filterBy;
        $scope.trialsList = filterBy === 'ALL' ? $scope.trialsList : $scope.activeList;
      };

      $scope.setFilter = function (filter) {
        $scope.activeFilter = filter;
        if (filter === 'trials') {
          $scope.gridData = $scope.trialsList;
        } else if (filter === 'all') {
          $scope.gridData = $scope.managedOrgsList;
        }
      };

      $scope.isLicenseInfoAvailable = function (licenses) {
        return PartnerService.isLicenseInfoAvailable(licenses);
      };

      var getLicenseObj = function (rowData, licenseTypeField) {
        var license = null;
        if (licenseTypeField === 'messaging') {
          license = rowData.messaging;
        } else if (licenseTypeField === 'conferencing') {
          license = rowData.conferencing;
        } else if (licenseTypeField === 'communications') {
          license = rowData.communications;
        }
        return license;
      };

      $scope.isLicenseTypeATrial = function (rowData, licenseTypeField) {
        return PartnerService.isLicenseATrial(getLicenseObj(rowData, licenseTypeField));
      };

      $scope.isLicenseTypeActive = function (rowData, licenseTypeField) {
        return PartnerService.isLicenseActive(getLicenseObj(rowData, licenseTypeField));
      };

      $scope.isLicenseTypeFree = function (rowData, licenseTypeField) {
        return PartnerService.isLicenseFree(getLicenseObj(rowData, licenseTypeField));
      };

      $scope.isPartnerOrg = function (rowData) {
        return rowData === Authinfo.getOrgId();
      };

      $scope.partnerClicked = function (rowData) {
        $scope.activeBadge = rowData === Authinfo.getOrgId();
      };

      if ($state.current.name === "partnercustomers.list") {
        LogMetricsService.logMetrics('Partner in customers page', LogMetricsService.getEventType('partnerCustomersPage'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
      }

      function launchCustomerPortal(trial) {
        var customer = trial;

        $window.open($state.href('login_swap', {
          customerOrgId: customer.customerOrgId,
          customerOrgName: customer.customerName
        }));
      }

    }
  ]);
