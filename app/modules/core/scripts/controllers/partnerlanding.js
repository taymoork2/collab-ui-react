'use strict';
/* global moment */

angular.module('Core')
  .controller('PartnerHomeCtrl', ['$scope', '$rootScope', '$stateParams', 'Notification', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config', '$translate', 'PartnerService', '$filter', '$state', '$modal', 'ExternalNumberPool',

    function ($scope, $rootScope, $stateParams, Notification, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config, $translate, PartnerService, $filter, $state, $modal, ExternalNumberPool) {
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
      $scope.startDate = new Date();
      $scope.customerName = null;
      $scope.customerEmail = null;
      $scope.licenseDuration = 90;
      $scope.licenseCount = 100;
      $scope.showAddTrial = true;
      $scope.editTerms = true;
      $scope.currentTrial = null;
      $scope.showTrialsRefresh = true;
      $scope.nameError = false;
      $scope.emailError = false;
      $scope.filter = 'ALL';
      $scope.addTrialModalInstance = null;
      $scope.editTrialModalInstance = null;
      $scope.showPartnerEdit = false;

      $scope.formReset = function () {
        $scope.customerName = null;
        $scope.customerEmail = null;
        $scope.licenseDuration = 90;
        $scope.licenseCount = 100;
        $scope.showAddTrial = true;
        $scope.editTerms = true;
        $scope.currentTrial = null;
        $scope.nameError = false;
        $scope.emailError = false;
        $scope.totalTrialsData = [];
        $scope.currentCustomer = null;
      };

      $scope.openAddTrialModal = function () {
        $scope.addTrialModalInstance = $modal.open({
          templateUrl: 'modules/core/views/addTrialModal.tpl.html',
          controller: 'PartnerHomeCtrl',
          windowClass: 'modal-addtrial-dialog',
          scope: $scope
        });
      };

      $scope.openEditTrialModal = function () {
        $scope.editTrialModalInstance = $modal.open({
          templateUrl: 'modules/core/views/editTrialModal.tpl.html',
          controller: 'PartnerHomeCtrl',
          scope: $scope
        });
      };

      $scope.startTrial = function () {
        var createdDate = new Date();
        $scope.nameError = false;
        $scope.emailError = false;
        angular.element('#startTrialButton').button('loading');
        PartnerService.startTrial($scope.customerName, $scope.customerEmail, 'COLLAB', $scope.licenseCount, $scope.licenseDuration, $scope.startDate, function (data, status) {
          angular.element('#startTrialButton').button('reset');
          if (data.success === true) {
            $scope.addTrialModalInstance.close();
            var successMessage = ['A trial was successfully started for ' + $scope.customerName + ' with ' + $scope.licenseCount + ' licenses ' + ' for ' + $scope.licenseDuration + ' days.'];
            Notification.notify(successMessage, 'success');
            setTimeout(function () {
              getTrialsList();
            }, 1000);
          } else {
            Notification.notify([data.message], 'error');
            if ((data.message).indexOf('Org') > -1) {
              $scope.nameError = true;
            } else if ((data.message).indexOf('Admin User') > -1) {
              $scope.emailError = true;
            }
          }
        });
      };

      $scope.editTrial = function () {
        var createdDate = new Date();
        angular.element('#saveSendButton').button('loading');
        PartnerService.editTrial($scope.licenseDuration, $scope.currentTrial.trialId, $scope.licenseCount, $scope.currentTrial.usage, $scope.currentTrial.customerOrgId, function (data, status) {
          angular.element('#saveSendButton').button('reset');
          if (data.success === true) {
            $scope.editTrialModalInstance.close();
            var successMessage = ['You have successfully edited a trial for ' + $scope.currentTrial.customerName + ' with ' + $scope.licenseCount + ' licenses ' + ' for ' + $scope.licenseDuration + ' days.'];
            Notification.notify(successMessage, 'success');
            setTimeout(function () {
              getTrialsList();
            }, 1000);
          } else {
            Notification.notify([data.message], 'error');
          }
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
                  daysUsed: 0,
                  percentUsed: 0,
                  duration: trial.trialPeriod,
                  offer: '',
                  status: null,
                  isAllowedToManage: true
                };

                if (trial.offers) {
                  for (var cnt in trial.offers) {
                    var offer = trial.offers[cnt];
                    if (offer && offer.id === 'COLLAB') {
                      trialObj.offer = offer.id;
                      trialObj.usage = offer.usageCount;
                      trialObj.licenses = offer.licenseCount;
                      break;
                    }
                  }
                }

                var now = moment().format('MMM D, YYYY');
                var then = edate;
                var start = moment(trial.startDate).format('MMM D, YYYY');

                var daysDone = moment(now).diff(start, 'days');
                trialObj.daysUsed = daysDone;
                trialObj.percentUsed = eval(Math.round((daysDone / trial.trialPeriod) * 100));

                var daysLeft = moment(then).diff(now, 'days');
                trialObj.daysLeft = daysLeft;
                if (daysLeft >= 0) {
                  trialObj.status = $translate.instant('customerPage.active');
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
                  daysUsed: 0,
                  percentUsed: 0,
                  duration: org.trialPeriod,
                  offer: '',
                  status: null,
                  isAllowedToManage: org.isAllowedToManage,
                  state: org.state
                };

                if (org.offers) {
                  for (var cnt in org.offers) {
                    var offer = org.offers[cnt];
                    if (offer && offer.id === 'COLLAB') {
                      orgObj.offer = offer.id;
                      orgObj.usage = offer.usageCount;
                      orgObj.licenses = offer.licenseCount;
                      break;
                    }
                  }
                }

                var now = moment().format('MMM D, YYYY');
                var then = edate;
                var start = moment(org.startDate).format('MMM D, YYYY');

                var daysDone = moment(now).diff(start, 'days');
                orgObj.daysUsed = daysDone;
                orgObj.percentUsed = eval(Math.round((daysDone / org.trialPeriod) * 100));

                var daysLeft = moment(then).diff(now, 'days');
                orgObj.daysLeft = daysLeft;
                $scope.totalOrgsData.push(orgObj);
              }
              Log.debug('total managed orgs records found:' + $scope.totalOrgsData.length);
              $scope.activeCount = $scope.activeList.length;
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

      $scope.getProgressValue = function (obj) {
        if (obj.daysLeft <= 0) {
          return obj.duration;
        } else {
          return obj.daysUsed;
        }
      };

      $scope.getProgressPercent = function (obj) {
        var percent = ($scope.getProgressValue(obj) / obj.duration) * 100;
        return percent;
      };

      $scope.getProgressDuration = function (obj) {
        return obj.duration;
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

      getTrialsList();
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
        '</ul>' +
        '</span>';

      var rowTemplate = '<div id="{{row.entity.customerName}}" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showCustomerDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var licenseTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-show="row.entity.trialId" ng-cell-text>{{row.entity.usage}}/{{row.entity.licenses}}</span></div>';

      var statusTemplate = '<div class="ngCellText"><div style="width:225px; height:6px"><span>{{row.entity.state}}</span> </div></div>';

      var progressTemplate = '<div class="ngCellText">' +
        '<div ng-show="row.entity.trialId" class="progress"><div class="progress-bar" ng-class="{\'danger-bar\': row.entity.daysLeft <= 5, \'warning-bar\': (row.entity.daysLeft < row.entity.duration/2), \'success-bar\': (row.entity.daysLeft >= row.entity.duration/2)}" role="progressbar" aria-valuenow="{{getProgressValue(row.entity)}}" aria-valuemin="0" aria-valuemax="{{getProgressDuration(row.entity)}}" style="width: {{getProgressPercent(row.entity)}}%;"></div></div>' +
        '</div>';

      var daysLeftTemplate = '<div class="ngCellText"><div ng-show="row.entity.trialId" ng-class="{\'trial-danger-text\': row.entity.daysLeft <= 5}"><span>{{getGridDaysLeft(row.entity.daysLeft)}}</span></div></div>';

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
          displayName: $filter('translate')('customerPage.customerNameHeader'),
          width: '25%'
        }, {
          field: 'offer',
          displayName: $filter('translate')('customerPage.trialIdHeader'),
          sortable: true,
          width: '14%'
        }, {
          field: 'license',
          displayName: $filter('translate')('customerPage.licenseHeader'),
          sortable: false,
          cellTemplate: licenseTemplate,
          width: '10%'
        }, {
          field: 'status',
          displayName: $filter('translate')('customerPage.statusHeader'),
          sortable: true,
          cellTemplate: statusTemplate,
          width: '105'
        }, {
          field: 'progress',
          displayName: null,
          sortable: false,
          cellTemplate: progressTemplate
        }, {
          field: 'daysLeft',
          displayName: $filter('translate')('customerPage.statusDaysLeft'),
          sortable: true,
          cellTemplate: daysLeftTemplate,
          width: '120'
        }, {
          field: 'action',
          displayName: $filter('translate')('customerPage.actionHeader'),
          sortable: false,
          cellTemplate: actionsTemplate,
          width: '90'
        }]
      };

      $scope.showCustomerDetails = function (customer) {
        $scope.currentTrial = customer;
        $state.go('partnercustomers.list.preview');
      };

      $scope.sort = {
        by: 'customerName',
        order: 'ascending'
      };

      $scope.exportBtn = {
        disabled: true
      };

      $scope.$on('ngGridEventScroll', function () {
        var ngGridView = $scope.gridOptions.ngGrid.$viewport[0];
        var scrollTop = ngGridView.scrollTop;
        var scrollOffsetHeight = ngGridView.offsetHeight;
        var currentScroll = scrollTop + scrollOffsetHeight;
        var scrollHeight = ngGridView.scrollHeight;

        if ($scope.load) {
          $scope.currentDataPosition++;
          console.log($scope.currentDataPosition * Config.usersperpage + 1);
          $scope.load = false;
          getTrialsList($scope.currentDataPosition * Config.usersperpage + 1);
          console.log('Scrolled .. ');
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

      $scope.openModal = function () {
        console.log("open");
        $modal.open({
          templateUrl: 'modules/huron/didAdd/didAdd.tpl.html',
          controller: 'DidAddCtrl'
        });
      };

      $scope.deleteDIDs = function () {
        console.log("delete");
        ExternalNumberPool.deleteAll();
      };

      $scope.setFilter = function (filter) {
        $scope.activeFilter = filter;
        if (filter === 'trials') {
          $scope.gridData = $scope.trialsList;
        } else if (filter === 'all') {
          $scope.gridData = $scope.managedOrgsList;
        }
      };
    }
  ]);
