(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($log, $translate) {
    var vm = this;
    vm.pageTitle = $translate.instant('overview.pageTitle');
    vm.cards = [
      {name: 'Room Systems',    num: n(), icon: 'icon-circle-message',        level: 'info'},
      {name: 'Message',         num: n(), icon: 'icon-circle-calendar',       level: 'warn'},
      {name: 'Meeting',         num: n(), icon: 'icon-circle-comp-pos',       level: 'error'},
      {name: 'Call',            num: n(), icon: 'icon-circle-contact-centre', level: 'info'},
      {name: 'Hybrid Services', num: n(), icon: 'icon-circle-localize',       level: 'info'}
    ];
    function n() {
      return Math.floor(Math.random() * 99999);
    }
  }
})();
