'use strict';
/* global moment */

angular.module('Core')
  .controller('PartnerHomeCtrl', ['$scope', '$rootScope', 'Notification', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config', '$translate', 'PartnerService',
    function($scope, $rootScope, Notification, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config, $translate, PartnerService ) {

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
								duration: trial.trialPeriod
							};

							if (trial.offers)
							{
								for (var cnt in trial.offers) {
									var offer = trial.offers[cnt];
									if (offer && offer.id === 'COLLAB')
									{
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
							trialObj.percentUsed = eval((daysDone/trial.trialPeriod)*100);

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

	}
  ]);
