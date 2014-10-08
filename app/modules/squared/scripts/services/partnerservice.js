'use strict';

angular.module('Squared')
  .service('PartnerService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Log', 'Authinfo', 'Auth',
    function($http, $rootScope, $location, Storage, Config, Log, Authinfo, Auth) {

	var token = Storage.get('accessToken');
	var trialsUrl = Config.getAdminServiceUrl() + 'trials';

	return {
		getTrialsList: function(callback) {

			$http.defaults.headers.common.Authorization = 'Bearer ' + token;
			$http.get(trialsUrl)
				.success(function(data, status) {
					data.success = true;
					Log.debug('Retrieved trials list');
					callback(data, status);
				})
				.error(function(data, status) {
					data.success = false;
					data.status = status;
					callback(data, status);
					Auth.handleStatus(status);
				});
		}
	};
}
  ]);