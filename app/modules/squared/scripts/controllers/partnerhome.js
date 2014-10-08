'use strict';
/* global moment */

angular.module('Squared')
  .controller('PartnerHomeCtrl', ['$scope', '$rootScope', 'Notification', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config', '$translate', 'PartnerService',
    function($scope, $rootScope, Notification, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config, $translate, PartnerService ) {

		var getTrialsList = function() {
			$scope.getPending = true;
			$scope.trialsList = [];
			PartnerService.getTrialsList(function(data, status) {
				if (data.success) {
					if (data.trials.length > 0) {
						for (var index in data.trials) {
							var date = moment(data.trials[index].startDate).add(data.trials[index].trialPeriod, 'days').format('MMM D, YYYY');
							var trial = {
								customerName:data.trials[index].customerOrgId,
								endDate:date,
								numUsers:data.trials[index].licenseCount
							};
							$scope.trialsList.push(trial);
						}
						Log.debug('trial records found');
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
