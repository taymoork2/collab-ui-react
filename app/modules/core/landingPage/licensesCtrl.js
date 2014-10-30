'use strict';
/* global moment */

angular.module('Core')

.controller('LicensesCtrl', ['$scope', 'Authinfo', 'PartnerService', 'Orgservice', 'Log', 'Notification', '$translate',
	function($scope, Authinfo, PartnerService, Orgservice, Log, Notification, $translate) {

		$scope.packageInfo = {
			name: '&nbsp;',
			termMax: 0,
			termUsed: 0,
			termRemaining: 0,
			termUnits: 'days'
		};

		$scope.licenses = {
			total: '',
			used: 0,
			unlicensed: 0,
			domain: ''
		};

		var isOnTrial = false;
		var isDomainClaimed = false;

		$scope.isOnTrial = function() {
			return isOnTrial;
		};

		$scope.isDomainClaimed = function() {
			return isDomainClaimed;
		};

		$scope.isAdmin = function() {
			return Authinfo.isAdmin();
		};

		var populateLicenseData = function(trial) {
			$scope.packageInfo.termMax = trial.trialPeriod;

			if (trial.offers) {
				var offer = trial.offers[0];
				if (offer) {
					$scope.packageInfo.name = offer.id;
					$scope.licenses.total = offer.licenseCount;
					$scope.licenses.used = offer.usageCount;
				}
			}

			var now = moment();
			var start = moment(trial.startDate).format('MMM D, YYYY');
			var daysDone = moment(now).diff(start, 'days');

			$scope.packageInfo.termUsed = daysDone;
			$scope.packageInfo.termRemaining = trial.trialPeriod - daysDone;

		};

		var getTrials = function() {
			PartnerService.getTrialsList(function(data, status) {
				if (data.success) {

					Log.debug('trial records found:' + data.trials.length);

					if (data.trials.length > 0) {
						isOnTrial = true;
						var trial = data.trials[0];

						populateLicenseData(trial);

					} else {
						// not on trial, get usage from CI?
						$scope.packageInfo.name = 'Default Collab Package';
						$scope.licenses.total = 'Unlimited';
					}
				} else {
					Log.debug('Failed to retrieve trial information. Status: ' + status);
					// Notification.notify([$translate.instant('homePage.errGetTrialsQuery', {
					// 	status: status
					// })], 'error');
				}
			});
		};

		var getorgInfo = function() {
			Orgservice.getOrg(function(data, status) {
				if (data.success) {
					var domainList = '';
					if (data.domains) {
						isDomainClaimed = true;
						for (var i = 0; i < data.domains.length; i++) {
							domainList = domainList + data.domains[i] + ' ';
						}

						$scope.licenses.domain = domainList;
					}

				} else {
					Log.debug('Get existing org failed. Status: ' + status);
				}
			});
		};

		getTrials();

		getorgInfo();
	}
]);