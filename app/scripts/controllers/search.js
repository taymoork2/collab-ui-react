'use strict';

angular.module('wx2AdminWebClientApp')
.controller('SearchCtrl', ['$scope', '$rootScope', 'Log',
	function($scope, $rootScope, Log) {

		$scope.searchItem = function() {
			var str = $scope.searchStr;
			Log.debug('search string is:' + str);
			$rootScope.$broadcast('SEARCH_ITEM', str);
		};

	}
]);