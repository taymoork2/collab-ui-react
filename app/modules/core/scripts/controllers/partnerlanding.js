'use strict';
/* global moment */

angular.module('Core')
  .controller('PartnerHomeCtrl', ['$scope', '$rootScope', '$stateParams', 'Notification', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config', '$translate', 'PartnerService', '$filter', '$state', 'ExternalNumberPool', 'LogMetricsService', '$log',

    function ($scope, $rootScope, $stateParams, Notification, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config, $translate, PartnerService, $filter, $state, ExternalNumberPool, LogMetricsService, $log) {

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
      $scope.filter = 'ALL';
      $scope.isCustomerPartner = Authinfo.isCustomerPartner ? true : false;
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
          showPartnerEdit: true,
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
              $scope.trialsList = PartnerService.loadRetrievedDataToList(data.trials, true);
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
        PartnerService.getManagedOrgsList(function (data, status) {
          $scope.showManagedOrgsRefresh = false;
          if (data.success && data.organizations) {
            if (data.organizations.length > 0) {
              $scope.managedOrgsList = PartnerService.loadRetrievedDataToList(data.organizations, false);
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
      $scope.trialsGrid = {
        data: 'activeList',
        multiSelect: false,
        showFilter: true,
        rowHeight: 38,
        headerRowHeight: 38,
        selectedItems: [],
        sortInfo: {
          fields: ['endDate', 'customerName', 'numUsers'],
          directions: ['asc']
        },

        columnDefs: [{
          field: 'customerName',
          displayName: $translate.instant('partnerHomePage.trialsCustomerName')
        }, {
          field: 'endDate',
          displayName: $translate.instant('partnerHomePage.trialsEndDate')
        }, {
          field: 'numUsers',
          displayName: $translate.instant('partnerHomePage.trialsNumUsers')
        }]
      };

      var actionsTemplate = '<span dropdown>' +
        '<button id="{{row.entity.customerName}}ActionsButton" class="btn-icon btn-actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-primary" role="menu">' +
        '<li ng-show="row.entity.isAllowedToManage" id="{{row.entity.customerName}}LaunchCustomerButton"><a href="" ng-click="$event.stopPropagation(); closeActionsDropdown();" ui-sref="login_swap({customerOrgId: row.entity.customerOrgId, customerOrgName: row.entity.customerName})" target="_blank"><span translate="customerPage.launchButton"></span></a></li>' +
        '<li cr-feature-toggle feature-show="pstnSetup" ng-show="row.entity.isSquaredUcOffer" id="{{row.entity.customerName}}PstnSetup"><a href="" ng-click="$event.stopPropagation(); closeActionsDropdown();" ui-sref="pstnSetup({customerId: row.entity.customerOrgId, customerName: row.entity.customerName})"><span translate="pstnSetup.setupPstn"></span></a></li>' +
        '<li cr-feature-toggle feature-hide="pstnSetup" ng-show="row.entity.isSquaredUcOffer" id="{{row.entity.customerName}}UploadNumbers"><a href="" ng-click="$event.stopPropagation(); closeActionsDropdown();" ui-sref="didadd({currentOrg: row.entity})"><span translate="customerPage.uploadNumbers"></span></a></li>' +
        '</ul>' +
        '</span>';

      var rowTemplate = '<div id="{{row.entity.customerName}}" orgId="{{row.entity.customerOrgId}}" ng-style="{ \'cursor\': row.cursor }"' +
        ' ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"' +
        ' ng-click="showCustomerDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var serviceTemplate = '<div class="ngCellText align-center">' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && isLicenseTypeActive(row.entity, col.field)"' +
        ' class="badge" ng-class="{\'badge-active\': row.entity.status != \'CANCELED\', \'badge-disabled\': row.entity.status === \'CANCELED\'}"' +
        ' translate="customerPage.active"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && isLicenseTypeATrial(row.entity, col.field)"' +
        ' class="badge" ng-class="{\'badge-trial\': row.entity.status != \'CANCELED\', \'badge-disabled\': row.entity.status === \'CANCELED\'}" translate="customerPage.trial"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && isLicenseTypeFree(row.entity, col.field)"' +
        ' ng-class="{\'free\': row.entity.status != \'CANCELED\', \'free-disabled\': row.entity.status === \'CANCELED\'}" translate="customerPage.free"></span></div>';

      var notesTemplate = '<div class="ngCellText">' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && row.entity.status === \'ACTIVE\' && row.entity.daysLeft > 0"' +
        ' translate="customerPage.daysRemaining" translate-values="{count: row.entity.daysLeft}"></span>' +
        '<span ng-if="row.entity.isTrial && isLicenseInfoAvailable(row.entity.licenseList) && row.entity.status === \'ACTIVE\' && row.entity.daysLeft === 0"' +
        ' class="red" translate="customerPage.expiringToday"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && row.entity.status === \'ACTIVE\' && row.entity.daysLeft < 0"' +
        ' class="red" translate="customerPage.expired"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && row.entity.status === \'CANCELED\'"' +
        ' translate="customerPage.suspended"> </span>' +
        '<span ng-if="!isLicenseInfoAvailable(row.entity.licenseList)"' +
        ' class="red" translate="customerPage.licenseInfoNotAvailable"></span></div>';

      $scope.gridOptions = {
        data: 'gridData',
        multiSelect: false,
        showFilter: false,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: false,
        sortInfo: {
          fields: ['customerName'],
          directions: ['asc']
        },

        columnDefs: [{
          field: 'customerName',
          displayName: $translate.instant('customerPage.customerNameHeader'),
          width: '25%'
        }, {
          field: 'messaging',
          displayName: $translate.instant('customerPage.messaging'),
          width: '12%',
          cellTemplate: serviceTemplate,
          headerClass: 'align-center',
          sortFn: serviceSort
        }, {
          field: 'conferencing',
          displayName: $translate.instant('customerPage.conferencing'),
          width: '12%',
          cellTemplate: serviceTemplate,
          headerClass: 'align-center',
          sortFn: serviceSort
        }, {
          field: 'communications',
          displayName: $translate.instant('customerPage.communications'),
          width: '12%',
          cellTemplate: serviceTemplate,
          headerClass: 'align-center',
          sortFn: serviceSort
        }, {
          field: 'notes',
          displayName: $translate.instant('customerPage.notes'),
          cellTemplate: notesTemplate,
          sortFn: notesSort
        }, {
          field: 'action',
          displayName: $translate.instant('customerPage.actionHeader'),
          sortable: false,
          cellTemplate: actionsTemplate,
          width: '90px'
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
        if (a.customerName.toLowerCase() > b.customerName.toLowerCase()) {
          return 1;
        } else if (a.customerName.toLowerCase() < b.customerName.toLowerCase()) {
          return -1;
        } else {
          return 0;
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

      $scope.$on('ngGridEventScroll', function () {
        if ($scope.load) {
          $scope.currentDataPosition++;
          $scope.load = false;
          getTrialsList($scope.currentDataPosition * Config.usersperpage + 1);
        }
      });

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

      if ($state.current.name === "partnercustomers.list") {
        LogMetricsService.logMetrics('Partner in customers page', LogMetricsService.getEventType('partnerCustomersPage'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
      }

    }
  ]);
