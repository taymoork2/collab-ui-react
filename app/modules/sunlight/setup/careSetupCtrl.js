(function () {
  'use strict';

  angular.module('Sunlight')
    .controller('CareSetupCtrl', CareSetupCtrl);

  function CareSetupCtrl($scope) {
    // var callbackUrl = 'https://admin.ciscospark.com/%23/cscallback';
    var callbackUrl = 'http://127.0.0.1:8000/#/cscallback?connectionData=hello';
    // $scope.ccfsUrl = 'https://ccfs.rciad.ciscoccservice.com/v1/authorize?callbackUrl=' + callbackUrl + '&appType=sunlight&delegation=true';
    $scope.ccfsUrl = callbackUrl;
    _.set($scope.wizard, 'isNextDisabled', true);
    this.wizard = $scope.wizard;
    setTimeout((function () {
      _.set(this.wizard, 'wizardNextLoad', true);
    }.bind(this)), 5000);
    setTimeout((function () {
      _.set(this.wizard, 'isNextDisabled', false);
      _.set(this.wizard, 'wizardNextLoad', false);
    }.bind(this)), 10000);
  }
})();
