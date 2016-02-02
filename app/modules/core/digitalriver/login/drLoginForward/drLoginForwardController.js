'use strict';

angular.module('Core')
    .controller('drLoginForwardController', ['$scope', '$window', 'Userservice', '$cookies', '$translate',
      function ($scope, $window, Userservice, $cookies, $translate) {

      var vm = this;

      Userservice.getUser('me',
        function (userData, status) {
          if (status != 200 || !userData.success) {
            $scope.error = userData.message;
          } else {

	      Userservice.getUserAuthToken(userData.id)
		  .then(function (userAuthResult) {
			  if (userAuthResult.data.success === true) {
			      $cookies.atlasDrCookie = userAuthResult.data.data.token;
			      $window.location.href = "http://www.digitalriver.com/";
			  } else {
			      vm.error = _.get(userAuthResult.message,'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
			  }
		      }, function (userAuthResult, status) {
			  vm.error = _.get(userAuthResult,'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
		      });

          }
        });
    }
  ]);
