'use strict';
/* global moment */

angular.module('Core')
  .controller('PartnerHomeCtrl', ['$scope', '$rootScope', 'Notification', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config', '$translate', 'PartnerService', '$filter', '$state',
    function($scope, $rootScope, Notification, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config, $translate, PartnerService, $filter, $state ) {

    $scope.load = true;
    $scope.currentDataPosition = 0;
    $scope.trialPreviewActive = false;

    $scope.daysExpired = 5;
    $scope.displayRows = 10;
    $scope.expiredRows = 3;
    $scope.startDate = new Date();
    Notification.init($scope);
    $scope.popup = Notification.popup;
    $scope.customerName = null;
    $scope.customerEmail = null;
    $scope.licenseDuration = 30;
    $scope.licenseCount = 50;
    $scope.showAddTrial = true;
    $scope.editTerms = true;
    $scope.currentTrial = null;
    $scope.showTrialsRefresh = true;
    $scope.nameError = false;
    $scope.emailError = false;
    $scope.totalTrialsData = [];

    $scope.formReset = function(){
      $scope.customerName = null;
      $scope.customerEmail = null;
      $scope.licenseDuration = 30;
      $scope.licenseCount = 50;
      $scope.trialForm.$setPristine(true);
      $scope.showAddTrial = true;
      $scope.editTerms = true;
      $scope.nameError = false;
      $scope.emailError = false;
    };

    $scope.startTrial = function(){
      var createdDate = new Date();
      $scope.nameError = false;
      $scope.emailError = false;
      angular.element('#startTrialButton').button('loading');
      PartnerService.startTrial($scope.customerName, $scope.customerEmail, 'COLLAB', $scope.licenseCount, $scope.licenseDuration, $scope.startDate, function(data, status){
        angular.element('#startTrialButton').button('reset');
        $scope.trialForm.$setPristine(true);
        if(data.success === true ){
          $("#addTrialDialog").modal("hide");
          var successMessage = ['A trial was successfully started for ' + $scope.customerName + ' with ' + $scope.licenseCount + ' licenses ' + ' for ' + $scope.licenseDuration + ' days.'];
          Notification.notify(successMessage, 'success');
          setTimeout(function(){
            getTrialsList();
          }, 1000);
        }
        else{
          Notification.notify([data.message], 'error');
          if((data.message).indexOf('Org') > -1){
            $scope.nameError = true;
          }
          else if((data.message).indexOf('Admin User') > -1){
            $scope.emailError = true;
          }
        }
      });
    };

    $scope.editTrial = function(){
      var createdDate = new Date();
      angular.element('#saveSendButton').button('loading');
      PartnerService.editTrial($scope.licenseDuration, $scope.currentTrial.trialId, $scope.licenseCount, $scope.currentTrial.usage, function(data, status){
          angular.element('#saveSendButton').button('reset');
          if(data.success === true ){
            $("#editTrialDialog").modal("hide");
            var successMessage = ['You have successfully edited a trial for ' + $scope.currentTrial.customerName + ' with ' + $scope.licenseCount + ' licenses ' + ' for ' + $scope.licenseDuration + ' days.'];
            Notification.notify(successMessage, 'success');
            setTimeout(function(){
              getTrialsList();
            }, 1000);
          }
          else{
            Notification.notify([data.message], 'error');
          }
        });
    };

    $scope.setTrial = function(trial){
      $scope.currentTrial = trial;
    };

		var getTrialsList = function() {
      $scope.showTrialsRefresh = true;
			$scope.getPending = true;
			$scope.trialsList = [];
			$scope.expiredList = [];
			PartnerService.getTrialsList(function(data, status) {
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
								endDate: edate,
								numUsers: trial.licenseCount,
								daysLeft: 0,
								usage: 0,
								licenses: 0,
								daysUsed: 0,
								percentUsed: 0,
								duration: trial.trialPeriod,
                offer: '',
                status: trial.state
							};

							if (trial.offers)
							{
								for (var cnt in trial.offers) {
									var offer = trial.offers[cnt];
									if (offer && offer.id === 'COLLAB')
									{
                    trialObj.offer = offer.id;
										trialObj.usage = offer.usageCount;
										trialObj.licenses = offer.licenseCount;
										break;
									}
								}
							}

							var now  = moment().format('MMM D, YYYY');
							var then = edate;
							var start = moment(trial.startDate).format('MMM D, YYYY');

							var daysDone = moment(now).diff(start, 'days');
							trialObj.daysUsed = daysDone;
							trialObj.percentUsed = eval(Math.round((daysDone/trial.trialPeriod)*100));

							var daysLeft = moment(then).diff(now, 'days');
							trialObj.daysLeft = daysLeft;
							if (daysLeft >= 0) {
								$scope.trialsList.push(trialObj);
							}
							else
							{
								trialObj.daysLeft = Math.abs(daysLeft);
								$scope.expiredList.push(trialObj);
							}
              $scope.totalTrialsData.push(trialObj);
						}
						$scope.showExpired = $scope.expiredList.length > 0;
						Log.debug('trial records found:' + $scope.trialsList.length);
					} else {
						$scope.getPending = false;
						Log.debug('No trial records found');
					}
				} else {
					Log.debug('Failed to retrieve trial information. Status: ' + status);
					$scope.getPending = false;
					Notification.notify([$translate.instant('partnerHomePage.errGetTrialsQuery',
						{ status: status })], 'error');
				}
			});
		};

    $scope.getProgressStatus = function(obj) {
      if(!obj){
        obj = $scope.currentTrial;
      }
      if (obj.daysLeft <= 5) {
        return 'danger';
      }
      else if (obj.daysLeft < (obj.duration/2)) {
        return 'warning';
      }
    };

    $scope.getDaysLeft = function(daysLeft) {
      if (daysLeft === 0) {
        return $translate.instant('partnerHomePage.expireToday');
      }
      else {
        return daysLeft;
      }
    };

    $scope.getUsagePercent = function(trial) {
      return Math.round((trial.usage/trial.licenses) * 100);
    };

		getTrialsList();

		$scope.showAll = function() {
		};

		$scope.newTrialName = null;
		$scope.trialsGrid = {
			data: 'trialsList',
			multiSelect: false,
			showFilter: true,
			rowHeight: 38,
			headerRowHeight: 38,
			selectedItems: [],
			sortInfo: { fields: ['endDate','customerName','numUsers'],
				directions: ['asc']},

			columnDefs: [{field:'customerName', displayName:$translate.instant('partnerHomePage.trialsCustomerName')},
				{field:'endDate', displayName:$translate.instant('partnerHomePage.trialsEndDate')},
				{field:'numUsers', displayName:$translate.instant('partnerHomePage.trialsNumUsers')}]
		};


    var actionsTemplate = '<span dropdown>' +
      '<button class="btn-icon btn-actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
      '<i class="icon icon-three-dots"></i>' +
      '</button>' +
      '<ul class="dropdown-menu" role="menu">' +
      '<li><a href="#"><span translate="partnerHomePage.custDetail"></span></a></li>' +
      '</ul>' +
      '</span>';

    var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showCustomerDetails(row.entity)">' +
      '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
      '<div ng-cell></div>' +
      '</div>';

    var licenseTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity.usage}}/{{row.entity.licenses}}</span></div>';

    var percentTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{getUsagePercent(row.entity)}} %</span></div>';

    var statusTemplate = '<div class="ngCellText"><div style="width:225px; height:6px"><span>{{row.entity.status}}</span> ' +
              '<div><progressbar class="trial-progress" max="row.entity.duration" value="row.entity.daysUsed" type="{{getProgressStatus(row.entity)}}"></progressbar></div>' +
              '</div><div ng-class="{\'trial-danger-text\': trial.daysLeft <= 5}" class="trial-days"><span>{{row.entity.daysLeft}}</span></div></div>';

    $scope.gridOptions = {
      data: 'totalTrialsData',
      multiSelect: false,
      showFilter: false,
      rowHeight: 44,
      rowTemplate: rowTemplate,
      headerRowHeight: 44,
      useExternalSorting: true,

      columnDefs: [{
        field: 'customerName',
        displayName: $filter('translate')('customerPage.customerNameHeader'),
        width: '20%'
      }, {
        field: 'offer',
        displayName: $filter('translate')('customerPage.trialIdHeader'),
        sortable : false,
        width: '14%'
      }, {
        field: 'license',
        displayName: $filter('translate')('customerPage.licenseHeader'),
        sortable: false,
        cellTemplate: licenseTemplate,
        width: '10%'
      }, {
        field: 'usagePercent',
        displayName: $filter('translate')('customerPage.usageHeader'),
        sortable: false,
        cellTemplate: percentTemplate,
        width: '12%'
      }, {
        field: 'status',
        displayName: $filter('translate')('customerPage.statusHeader'),
        sortable: false,
        cellTemplate: statusTemplate
      }, {
        field: 'action',
        displayName: $filter('translate')('customerPage.actionHeader'),
        sortable: false,
        cellTemplate: actionsTemplate,
        width: '8%'
      }]
    };

    $scope.exportCSV = function() {

    };

    $scope.sort = {
      by: 'customerName',
      order: 'ascending'
    };

    $scope.exportBtn = {
      disabled: true
    };

    $scope.$on('ngGridEventScroll', function() {
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

    $rootScope.$on('$stateChangeSuccess', function() {
      if ($state.includes('users.list.preview.*')) {
        $scope.trialPreviewActive = true;
      } else if ($state.includes('users.list.preview')) {
        $scope.trialPreviewActive = true;
      } else {
        $scope.trialPreviewActive = false;
      }
    });

    // this event fires 3x when sorting is done, so watch for sortInfo change
    $scope.$on('ngGridEventSorted', function(event, sortInfo) {
      $scope.sortInfo = sortInfo;
    });

    $scope.$watch('sortInfo', function(newValue, oldValue) {
      // if newValue === oldValue then page is initializing, so ignore event,
      // otherwise getUserList() is called multiple times.
      if (newValue !== oldValue) {
        if ($scope.sortInfo) {
          switch ($scope.sortInfo.fields[0]) {
            case 'customerName':
              $scope.sort.by = 'customerName';
              break;
          }

          if ($scope.sortInfo.directions[0] === 'asc') {
            $scope.sort.order = 'ascending';
          } else {
            $scope.sort.order = 'descending';
          }
        }
        getTrialsList();
      }
    }, true);

	}
  ]);
