'use strict';
/* global moment */

angular.module('Squared')
  .controller('PartnerHomeCtrl', ['$scope', '$rootScope', 'Notification', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config', '$translate', 'PartnerService',
    function($scope, $rootScope, Notification, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config, $translate, PartnerService ) {

    $scope.daysExpired = 5;
    $scope.displayRows = 8;
    $scope.expiredRows = 3;

		var getTrialsList = function() {
			$scope.getPending = true;
			$scope.trialsList = [];
			$scope.expiredList = [];
			PartnerService.getTrialsList(function(data, status) {
				if (data.success) {
					$scope.totalTrials = data.trials.length;

					if (data.trials.length > 0) {
						for (var index in data.trials) {
							var trial = data.trials[index];
							var edate = moment(trial.startDate).add(trial.trialPeriod, 'days').format('MMM D, YYYY');
							var trialObj = {
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

							var now  = moment();
							var then = edate;
							var start = moment(trial.startDate).format('MMM D, YYYY');

							var daysDone = moment(now).diff(start, 'days');
							trialObj.daysUsed = daysDone;
							trialObj.percentUsed = eval((daysDone/trial.trialPeriod)*100);

							var daysLeft = moment(then).diff(now, 'days');
							trialObj.daysLeft = daysLeft;
							if (daysLeft >= 0)
							{
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
