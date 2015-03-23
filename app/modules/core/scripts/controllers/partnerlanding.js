'use strict';
/* global moment */

angular.module('Core')
  .controller('PartnerHomeCtrl', ['$scope', '$rootScope', '$stateParams', 'Notification', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config', '$translate', 'PartnerService', '$filter', '$state', 'ExternalNumberPool', 'LogMetricsService',

    function ($scope, $rootScope, $stateParams, Notification, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config, $translate, PartnerService, $filter, $state, ExternalNumberPool, LogMetricsService) {

      $scope.load = true;
      $scope.currentDataPosition = 0;
      $scope.trialPreviewActive = false;
      if ($state.params.filter) {
        $scope.activeFilter = $state.params.filter;
      } else {
        $scope.activeFilter = 'all';
      }

      $scope.daysExpired = 5;
      $scope.displayRows = 10;
      $scope.expiredRows = 3;
      $scope.currentTrial = null;
      $scope.showTrialsRefresh = true;
      $scope.filter = 'ALL';
      $scope.isCustomerPartner = Authinfo.isCustomerPartner;

      $scope.openAddTrialModal = function () {
        LogMetricsService.logMetrics('In trial page', LogMetricsService.getEventType('trialPage'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1);
        $state.go('trialAdd.info').then(function () {
          $state.modal.result.then(function () {
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
          $state.modal.result.then(function () {
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

      var getTrialsList = function () {
        $scope.showTrialsRefresh = true;
        $scope.activeList = [];
        $scope.expiredList = [];
        $scope.trialsList = [];
        $scope.totalTrialsData = [];
        PartnerService.getTrialsList(function (data, status) {
          $scope.showTrialsRefresh = false;
          if (data.success) {
            $scope.totalTrials = data.trials.length;

            if (data.trials.length > 0) {
              for (var index in data.trials) {
                var trial = data.trials[index];
                var edate = moment(trial.startDate).add(trial.trialPeriod, 'days').format('MMM D, YYYY');
                var trialObj = {
                  trialId: trial.trialId,
                  customerOrgId: trial.customerOrgId,
                  customerName: trial.customerName,
                  customerEmail: trial.customerEmail,
                  endDate: edate,
                  numUsers: trial.licenseCount,
                  daysLeft: 0,
                  usage: 0,
                  licenses: 0,
                  licenseList: [],
                  daysUsed: 0,
                  percentUsed: 0,
                  duration: trial.trialPeriod,
                  offer: '',
                  status: null,
                  isAllowedToManage: true,
                  isSquaredUcOffer: false
                };

                if (trial.offers) {
                  trialObj.offers = trial.offers;
                  var offerNames = [];
                  for (var cnt in trial.offers) {
                    var offer = trial.offers[cnt];
                    if (!offer) {
                      continue;
                    }
                    switch (offer.id) {
                    case Config.trials.collab:
                      offerNames.push($translate.instant('trials.collab'));
                      break;
                    case Config.trials.squaredUC:
                      trialObj.isSquaredUcOffer = true;
                      offerNames.push($translate.instant('trials.squaredUC'));
                      break;
                    }
                    trialObj.usage = offer.usageCount;
                    trialObj.licenses = offer.licenseCount;
                  }
                  trialObj.offer = offerNames.join(', ');
                }

                trialObj.licenseList = trial.licenses;
                var now = moment().format('MMM D, YYYY');
                var then = edate;
                var start = moment(trial.startDate).format('MMM D, YYYY');

                var daysDone = moment(now).diff(start, 'days');
                trialObj.daysUsed = daysDone;
                trialObj.percentUsed = Math.round((daysDone / trial.trialPeriod) * 100);

                var daysLeft = moment(then).diff(now, 'days');
                trialObj.daysLeft = daysLeft;
                trialObj.status = trial.state;
                if (daysLeft >= 0) {
                  $scope.activeList.push(trialObj);
                } else {
                  //trialObj.daysLeft = Math.abs(daysLeft);
                  trialObj.status = $translate.instant('customerPage.expired');
                  $scope.expiredList.push(trialObj);
                }
                $scope.totalTrialsData.push(trialObj);
              }
              $scope.showExpired = $scope.expiredList.length > 0;
              Log.debug('active trial records found:' + $scope.activeList.length);
              Log.debug('total trial records found:' + $scope.totalTrialsData.length);
              $scope.activeCount = $scope.activeList.length;
              $scope.trialsList = $scope.totalTrialsData;
              $scope.totalTrials = $scope.trialsList.length;
              if ($scope.activeFilter === 'all') {
                $scope.gridData = $scope.managedOrgsList;
              } else {
                $scope.gridData = $scope.trialsList;
              }
            } else {
              $scope.getPending = false;
              Log.debug('No trial records found');
            }
          } else {
            Log.debug('Failed to retrieve trial information. Status: ' + status);
            $scope.getPending = false;
            Notification.notify([$translate.instant('partnerHomePage.errGetTrialsQuery', {
              status: status
            })], 'error');
          }
        });
      };

      var getManagedOrgsList = function () {
        $scope.showManagedOrgsRefresh = true;
        $scope.managedOrgsList = [];
        $scope.totalOrgsData = [];
        PartnerService.getManagedOrgsList(function (data, status) {
          $scope.showManagedOrgsRefresh = false;
          if (data.success) {
            $scope.totalOrgs = data.organizations.length;

            if (data.organizations.length > 0) {
              for (var index in data.organizations) {
                var org = data.organizations[index];
                var edate = moment(org.startDate).add(org.trialPeriod, 'days').format('MMM D, YYYY');
                var orgObj = {
                  trialId: org.trialId,
                  customerOrgId: org.customerOrgId,
                  customerName: org.customerName,
                  customerEmail: org.customerEmail,
                  endDate: edate,
                  numUsers: org.licenseCount,
                  daysLeft: 0,
                  usage: 0,
                  licenses: 0,
                  licenseList: [],
                  daysUsed: 0,
                  percentUsed: 0,
                  duration: org.trialPeriod,
                  offer: '',
                  status: null,
                  isAllowedToManage: org.isAllowedToManage,
                  state: org.state,
                  isSquaredUcOffer: false
                };

                if (org.offers) {
                  orgObj.offers = org.offers;
                  var offerNames = [];
                  for (var cnt in org.offers) {
                    var offer = org.offers[cnt];
                    if (!offer) {
                      continue;
                    }
                    switch (offer.id) {
                    case Config.trials.collab:
                      offerNames.push($translate.instant('trials.collab'));
                      break;
                    case Config.trials.squaredUC:
                      orgObj.isSquaredUcOffer = true;
                      offerNames.push($translate.instant('trials.squaredUC'));
                      break;
                    }
                    orgObj.usage = offer.usageCount;
                    orgObj.licenses = offer.licenseCount;
                  }
                  orgObj.offer = offerNames.join(', ');
                }

                orgObj.licenseList = org.licenses;
                var now = moment().format('MMM D, YYYY');
                var then = edate;
                var start = moment(org.startDate).format('MMM D, YYYY');
                orgObj.status = org.state;

                var daysDone = moment(now).diff(start, 'days');
                orgObj.daysUsed = daysDone;
                orgObj.percentUsed = Math.round((daysDone / org.trialPeriod) * 100);

                var daysLeft = moment(then).diff(now, 'days');
                orgObj.daysLeft = daysLeft;
                $scope.totalOrgsData.push(orgObj);
              }
              Log.debug('total managed orgs records found:' + $scope.totalOrgsData.length);
              if ($scope.activeList)
                $scope.activeCount = $scope.activeList.length;
              else
                $scope.activeCount = 0;
              $scope.managedOrgsList = $scope.totalOrgsData;

              if ($scope.activeFilter === 'all') {
                $scope.gridData = $scope.managedOrgsList;
              } else {
                $scope.gridData = $scope.trialsList;
              }

            } else {
              Log.debug('No managed orgs records found');
            }
          } else {
            Log.debug('Failed to retrieve managed orgs information. Status: ' + status);
            Notification.notify([$translate.instant('partnerHomePage.errGetTrialsQuery', {
              status: status
            })], 'error');
          }
        });
      };

      $scope.getDaysLeft = function (daysLeft) {
        if (daysLeft < 0) {
          return $translate.instant('customerPage.expired');
        } else if (daysLeft === 0) {
          return $translate.instant('customerPage.expiresToday');
        } else {
          return daysLeft;
        }
      };

      $scope.getGridDaysLeft = function (daysLeft) {
        if (daysLeft <= 0) {
          return 0;
        } else {
          return daysLeft;
        }
      };

      $scope.getDaysAgo = function (days) {
        return Math.abs(days);
      };

      $scope.getUsagePercent = function (trial) {
        return Math.round((trial.usage / trial.licenses) * 100);
      };

      $scope.closeActionsDropdown = function () {
        angular.element('.open').removeClass('open');
      };

      if (!$scope.isCustomerPartner) {
        getTrialsList();
      }
      getManagedOrgsList();

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
        '<li ng-show="row.entity.isSquaredUcOffer" id="{{row.entity.customerName}}UploadNumbers"><a href="" ng-click="$event.stopPropagation(); closeActionsDropdown();" ui-sref="didadd({currentOrg: row.entity})"><span translate="customerPage.uploadNumbers"></span></a></li>' +
        '</ul>' +
        '</span>';

      var rowTemplate = '<div id="{{row.entity.customerName}}" orgId="{{row.entity.customerOrgId}}" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showCustomerDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var serviceTemplate = '<div class="ngCellText align-center">' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && isLicenseActive(getLicense(row.entity.licenseList, col.field))" class="badge badge-primary" ng-class="{\'badge-disabled\': row.entity.status === \'SUSPENDED\'}" translate="customerPage.active"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && isLicenseATrial(getLicense(row.entity.licenseList, col.field))" class="badge badge-warning" ng-class="{\'badge-disabled\': row.entity.status === \'SUSPENDED\'}" translate="customerPage.trial"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && isLicenseFree(getLicense(row.entity.licenseList, col.field))" class="free" ng-class="{\'disabled\': row.entity.status === \'SUSPENDED\'}" translate="customerPage.free"></span></div>';

      var notesTemplate = '<div class="ngCellText">' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && row.entity.status === \'ACTIVE\' && row.entity.daysLeft > 0" translate="customerPage.daysRemaining" translate-values="{count: row.entity.daysLeft}"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && row.entity.status === \'ACTIVE\' && row.entity.daysLeft == 0" class="red" translate="customerPage.expiringToday"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && row.entity.status === \'ACTIVE\' && row.entity.daysLeft < 0" class="red" translate="customerPage.expired"></span>' +
        '<span ng-if="isLicenseInfoAvailable(row.entity.licenseList) && row.entity.status === \'SUSPENDED\'" translate="customerPage.suspended"> </span>' +
        '<span ng-if="!isLicenseInfoAvailable(row.entity.licenseList)" class="red" translate="customerPage.licenseInfoNotAvailable"></span></div>';

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
          headerClass: 'align-center'
        }, {
          field: 'conferencing',
          displayName: $translate.instant('customerPage.conferencing'),
          width: '12%',
          cellTemplate: serviceTemplate,
          headerClass: 'align-center'
        }, {
          field: 'communications',
          displayName: $translate.instant('customerPage.communications'),
          width: '12%',
          cellTemplate: serviceTemplate,
          headerClass: 'align-center'
        }, {
          field: 'notes',
          displayName: $translate.instant('customerPage.notes'),
          cellTemplate: notesTemplate,
        }, {
          field: 'action',
          displayName: $translate.instant('customerPage.actionHeader'),
          sortable: false,
          cellTemplate: actionsTemplate,
          width: '90px'
        }]
      };

      $scope.showCustomerDetails = function (customer) {
        $scope.currentTrial = customer;
        updatePhoneNumberCount(customer.customerOrgId);
        $state.go('partnercustomers.list.preview');
      };

      $scope.$on('DIDS_UPDATED', function () {
        updatePhoneNumberCount($scope.currentTrial.customerOrgId);
      });

      function updatePhoneNumberCount(orgId) {
        ExternalNumberPool.getAll(orgId).then(function (results) {
          if (angular.isDefined(results) && angular.isDefined(results.length) && results.length > 0) {
            $scope.noOfPhoneNumbers = results.length;
          }
        });
      }

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
          //console.log($scope.currentDataPosition * Config.usersperpage + 1);
          $scope.load = false;
          getTrialsList($scope.currentDataPosition * Config.usersperpage + 1);
          //console.log('Scrolled .. ');
        }
      });

      $rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('partnercustomers.list.preview.*')) {
          $scope.trialPreviewActive = true;
        } else if ($state.includes('partnercustomers.list.preview')) {
          $scope.trialPreviewActive = true;
        } else {
          $scope.trialPreviewActive = false;
        }
      });

      $scope.filterList = function (filterBy) {
        $scope.filter = filterBy;
        $scope.trialsList = filterBy === 'ALL' ? $scope.totalTrialsData : $scope.activeList;
      };

      $scope.setFilter = function (filter) {
        $scope.activeFilter = filter;
        if (filter === 'trials') {
          $scope.gridData = $scope.trialsList;
        } else if (filter === 'all') {
          $scope.gridData = $scope.managedOrgsList;
        }
      };

      $scope.getLicense = function (licenses, licenseTypeField) {
        var offerName;
        if (licenseTypeField === 'messaging') {
          offerName = 'MS';
        } else if (licenseTypeField === 'conferencing') {
          offerName = 'CF';
        } else if (licenseTypeField === 'communications') {
          offerName = 'CO';
        }

        if (angular.isDefined(licenses) && angular.isDefined(licenses.length)) {
          for (var i = 0; i < licenses.length; i++) {
            if (licenses[i].offerName === offerName) {
              return licenses[i];
            }
          }
        }
        return null;
      };

      $scope.isLicenseInfoAvailable = function (licenses) {
        return angular.isDefined(licenses) && licenses !== null && angular.isDefined(licenses.length) && licenses.length > 0;
      };

      $scope.isLicenseATrial = function (license) {
        return angular.isDefined(license) && license !== null && license.isTrial === true;
      };

      $scope.isLicenseActive = function (license) {
        return angular.isDefined(license) && license !== null && license.isTrial === false;
      };

      $scope.isLicenseFree = function (license) {
        return angular.isUndefined(license) || license === null;
      };

      if ($state.current.name === "partnercustomers.list") {
        LogMetricsService.logMetrics('Partner in customers page', LogMetricsService.getEventType('partnerCustomersPage'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1);
      }
    }
  ]);
