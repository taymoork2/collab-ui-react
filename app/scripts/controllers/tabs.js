'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('TabsCtrl', ['$rootScope','$scope', '$location', 'Log', 'Utils', '$filter', 'Auth',
		function($rootScope, $scope, $location, Log, Utils, $filter, Auth) {

			$scope.tabs = [{
				title: 'tabs.homeTab',
				path: '/home'
			}, {
				title: 'tabs.userTab',
				path: '/users'
			}, {
				title: 'tabs.orgTab',
				path: '/orgs'
			}, {
				title: 'tabs.reportTab',
				path: '/reports'
			}, {
        title: 'tabs.logsTab',
        path: '/logs'

      }];

			$scope.navType = 'pills';

			var setActiveTab = function() {
				$scope.tabs[1].active = 'true';
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

			$scope.getTabTitle = function(title) {
				return $filter('translate')(title);
			};

			$scope.changeTab = function(tabPath) {
				if (Auth.isLoggedIn()) {
	        $rootScope.loggedIn = true;
	      } else if (!Auth.isAllowedPath()) {
	        $rootScope.loggedIn = false;
	        tabPath = '/login';
	      }
				if (Utils.isAdminPage()) {
					Log.debug('using path: ' + tabPath);
					$location.path(tabPath);
				}
			};
		}
	]);
