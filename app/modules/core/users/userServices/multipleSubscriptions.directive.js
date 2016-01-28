(function () {
	'use strict';

	angular
		.module('Core');
		.directive('multipleSubscriptions', multipleSubscriptions);

	function multipleSubscriptions() {
		var directive = {
			restrict: 'E',
			templateUrl: 'module/core/users/userServices/multipleSubscriptions.tpl.html',
			controller: 'MultipleSubscriptionsCtrl',
			controllerAs: 'multipleSubscriptions'
		};

		return directive;
	}

})();