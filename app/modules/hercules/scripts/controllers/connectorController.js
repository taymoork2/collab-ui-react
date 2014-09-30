'use strict';

angular.module('Hercules')
  .controller('ConnectorCtrl', ['$scope', '$rootScope', 'Auth',
    function($scope, $rootScope, Auth) {
      Auth.isAuthorized($scope);
    }
  ]);
