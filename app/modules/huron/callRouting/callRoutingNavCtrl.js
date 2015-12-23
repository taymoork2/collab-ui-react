(function () {
  'use strict';

  angular
    .module('uc.callrouting')
    .controller('CallRoutingNavCtrl', CallRoutingNavCtrl);

  /* @ngInject */
  function CallRoutingNavCtrl($scope, CallPark, Config) {
    var vm = this;
    vm.tabs = [{
      title: 'callRouting.autoAttendantTitle',
      state: 'autoattendant'
    }, {
      title: 'callRouting.callParkTitle',
      state: 'callpark'
    }, {
      title: 'callRouting.callPickUpTitle',
      state: 'callpickup'
    }, {
      title: 'callRouting.intercomGroupsTitle',
      state: 'intercomgroups'
    }, {
      title: 'callRouting.pagingGroupsTitle',
      state: 'paginggroups'
    }, {
      title: 'callRouting.huntGroupsTitle',
      state: 'huntgroups'
    }];

    init();

    function init() {
      updateCurrentCount();
      getCallParkCount();
      enableAA();
    }

    function enableAA() {
      if (Config.getEnv() === 'integration' || Config.getEnv() === 'dev') {
        for (var i = 0; i < vm.tabs.length; i++) {
          if (vm.tabs[i].title === 'callRouting.autoAttendantTitle') {
            vm.tabs[i].state = 'huronfeatures';
            return;
          }
        }
      }
    }

    function updateCurrentCount() {
      $scope.$on('callrouting-update', function (event, args) {
        updateCount(args);
      });
    }

    function getCallParkCount() {
      CallPark.list().then(function (callParks) {
        updateCount({
          state: 'callpark',
          count: callParks.length
        });
      });
    }

    function updateCount(args) {
      angular.forEach(vm.tabs, function (tab) {
        if (tab.state === args.state) {
          tab.count = args.count;
        }
      });
    }

  }
})();
