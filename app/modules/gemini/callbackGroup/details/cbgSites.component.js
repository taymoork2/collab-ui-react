(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgSites', {
      controller: cbgSitesCtrl,
      templateUrl: 'modules/gemini/callbackGroup/details/cbgSites.tpl.html'
    });

  /* @ngInject */
  function cbgSitesCtrl($state, $modal, $rootScope, $stateParams, $translate, cbgService, Notification) {
    var vm = this;
    vm.onClick = onClick;
    vm.$onInit = $onInit;
    var obj = _.get($stateParams, 'obj', {});
    vm.cbgs = _.get(obj, 'cbgs', []);
    vm.currCbg = _.get(obj, 'currCbg', {});
    vm.customerId = _.get(obj, 'customerId', '');
    vm.sites = _.get(obj, 'currCbg.callbackGroupSites', []);

    function $onInit() {
      if (vm.cbgs.length) {
        _.remove(vm.cbgs, function (obj) {
          return obj.ccaGroupId === vm.currCbg.ccaGroupId; // don't move to self
        });
      }
      $state.current.data.displayName = $translate.instant('gemini.cbgs.field.totalSites');
    }

    function onClick(site, toGroupId) {
      $modal.open({
        type: 'dialog',
        templateUrl: 'modules/gemini/callbackGroup/details/moveSiteConfirm.tpl.html'
      }).result.then(function () {
        moveSite(site, toGroupId);
      });
    }

    function moveSite(site, toGroupId) {
      var data = {
        siteId: site.siteId,
        siteUrl: site.siteUrl,
        targetGroupId: toGroupId,
        groupName: vm.currCbg.groupName,
        sourceGroupId: vm.currCbg.ccaGroupId
      };
      cbgService.moveSite(vm.customerId, data).then(function (res) {
        var resJson = _.get(res.content, 'data');
        if (resJson.returnCode) {
          Notification.error('Failed to Move Site!');
          return;
        }
        _.remove(vm.sites, function (obj) {
          return obj.siteId === site.siteId;
        });
        $rootScope.$emit('cbgsUpdate', true);
      });
    }
  }
})();
