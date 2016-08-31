(function () {
  'use strict';

  angular.module('Sunlight')
    .controller('CsCallbackCtrl', CsCallbackCtrl);

  function CsCallbackCtrl($location, $state, Log) {
    var connectionData = $location.search().connectionData;
    Log.debug('ConnectionData: ' + connectionData);
    Log.debug('URL: ' + $location.absUrl());
    function init() {
      setTimeout(function () {
        Log.debug('Debug: redirecting to care setup');
        $state.go('setupwizardmodal', {
          currentTab: 'careSetup',
          connectionData: connectionData
        });
      }, 2000);
    }
    Log.debug('Debug: in CsCallbackCtrl');
    init();
  }
})();
