(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('CallRoutingNavCtrl', CallRoutingNavCtrl);

  /* @ngInject */
  function CallRoutingNavCtrl() {
    /*jshint validthis: true */
    var vm = this;
    vm.tabs = [{
      title: 'callRouting.autoAttendantTitle',
      state: 'underconstruction'
    }, {
      title: 'callRouting.callParkTitle',
      state: 'callpark'
    }, {
      title: 'callRouting.callPickUpTitle',
      state: 'underconstruction'
    }, {
      title: 'callRouting.intercomGroupsTitle',
      state: 'underconstruction'
    }, {
      title: 'callRouting.pagingGroupsTitle',
      state: 'underconstruction'
    }, {
      title: 'callRouting.huntGroupsTitle',
      state: 'underconstruction'
    }];

  }
})();
