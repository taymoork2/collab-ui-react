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
      {name: 'Room Systems',    num: n(), icon: 'icon-circle-message',        level: 'info',  levelText: 'Excellent'},
      {name: 'Message',         num: n(), icon: 'icon-circle-calendar',       level: 'warn',  levelText: 'Warning'},
      {name: 'Meeting',         num: n(), icon: 'icon-circle-comp-pos',       level: 'error', levelText: 'Error'},
      {name: 'Call',            num: n(), icon: 'icon-circle-contact-centre', level: 'info',  levelText: 'Check status'},
      {name: 'Hybrid Services', num: n(), icon: 'icon-circle-localize',       level: 'info',  levelText: 'Excellent'}
    ];
    function n() {
      return Math.floor(Math.random() * 99999);
    }
  }
})();
