'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('TabsCtrl', ['$scope', '$location', 'Log', 'Utils',
		function($scope, $location, Log, Utils) {

			$scope.tabs = [{
				title: 'Home',
				path: '/home'
			}, {
				title: 'Organizations',
				path: '/orgs'
			}, {
				title: 'User Accounts',
				path: '/users'
			}, {
				title: 'Templates',
				path: '/templates'
			}, {
				title: 'Policies',
				path: '/policies'
			}, {
				title: 'Reports',
				path: '/reports'
			}];

			$scope.navType = 'pills';

			var setActiveTab = function() {
				var curPath = $location.path();
				for (var idx in $scope.tabs) {
					var tab = $scope.tabs[idx];
					if (tab.path === curPath) {
						tab.active = 'true';
						break;
					}
				}
			};
			setActiveTab();

			$scope.changeTab = function(tabPath) {
				if(!Utils.hideForRoute('downloads'))
				{
					Log.debug('using path: ' + tabPath);
					$location.path(tabPath);
				}
			};
		}
	]);