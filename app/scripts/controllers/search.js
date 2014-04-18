'use strict';

angular.module('wx2AdminWebClientApp')
.controller('SearchCtrl', ['$scope', '$rootScope', 'Log',
	function($scope, $rootScope, Log) {

		var timeoutVal = 500;
		var timer = 0;

		$scope.searchItem = function() {
			stop();
			var str = $scope.searchStr;
			if (str === '')
			{
				str = undefined;
			}
			//str = encodeURIComponent(str);
			Log.debug('search string is:' + str);
			$rootScope.searchStr = str;

			timer = setTimeout(function(){
				Log.debug('starting broadcast for: ' + str);
				sendStrBroadcast(str);
			}, timeoutVal);
		};

		function sendStrBroadcast(str){
			$rootScope.$broadcast('SEARCH_ITEM', str);
		}

		function stop() {
			if (timer) {
				clearTimeout(timer);
				timer = 0;
			}
		}
	}
]);