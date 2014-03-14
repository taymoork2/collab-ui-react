'use strict';

angular.module('wx2AdminWebClientApp')
	.factory('Localize', ['$location',
		function($location) {
			return {
				appTitle: 'Squared Admin Portal',
				genericTitle: 'Squared',

				varTitle: function() {
					if ($location.url().indexOf('downloads') === -1) {
						return this.appTitle;
					} else {
						return this.genericTitle;
					}
				}
			};
		}
	]);