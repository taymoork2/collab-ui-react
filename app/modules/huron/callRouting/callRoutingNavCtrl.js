(function () {
  'use strict';

  angular
    .module('uc.callrouting')
    .controller('CallRoutingNavCtrl', CallRoutingNavCtrl);

  /* @ngInject */
  function CallRoutingNavCtrl($scope, CallPark) {
    var vm = this;
    vm.tabs = [{
      title: 'callRouting.autoAttendantTitle',
      state: 'autoattendant.landing'
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
