(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgSites', {
      controller: cbgSitesCtrl,
      template: require('modules/gemini/callbackGroup/details/cbgSites.tpl.html'),
    });

  /* @ngInject */
  function cbgSitesCtrl($state, $modal, $rootScope, $stateParams, $translate, cbgService, PreviousState, Notification) {
    var vm = this;
    vm.onClick = onClick;
    vm.$onInit = $onInit;
    vm.onCancel = onCancel;
    var obj = _.get($stateParams, 'obj', {});
    vm.cbgs = _.get(obj, 'cbgs', []);
    vm.currCbg = _.get(obj, 'currCbg', {});
    vm.customerId = _.get(obj, 'customerId', '');
    vm.sites = _.get(obj, 'currCbg.callbackGroupSites', []);

    function $onInit() {
      if (vm.cbgs.length) {
        _.remove(vm.cbgs, function (obj) {
          var isSelf = (obj.ccaGroupId === vm.currCbg.ccaGroupId); // don't move to self
          return isSelf || !obj.groupId;
        });

        _.forEach(vm.sites, function (item) {
          var resArr = _.words(item.siteUrl, /^[a-z][\w]+/g);
          item.globalSite = 'https://' + _.trim(item.siteUrl) + '/' + _.trim(resArr[0]) + '/globalcallin.php';
        });
      }
      $state.current.data.displayName = $translate.instant('gemini.cbgs.field.totalSites');
    }

    function onClick(site, toCbg) {
      $modal.open({
        type: 'dialog',
        template: require('modules/gemini/callbackGroup/details/moveSiteConfirm.tpl.html'),
      }).result.then(function () {
        moveSite(site, toCbg);
      });
    }

    function moveSite(site, toCbg) {
      vm.showLoading = true;

      var data = {
        siteId: site.siteId,
        siteUrl: site.siteUrl,
        spCustomerId: vm.customerId,
        targetGroupId: toCbg.toCcaGroupId,
        targetGroupName: toCbg.toGroupName, // TO,  targetGroupName , DB: Object_ID
        sourceGroupId: vm.currCbg.ccaGroupId,
        sourceGroupName: vm.currCbg.groupName, // From, DB: Object_Name
      };

      cbgService.moveSite(data).then(function () {
        _.remove(vm.sites, function (obj) {
          return obj.siteId === site.siteId;
        });
        $rootScope.$emit('cbgsUpdate', true);
      }).catch(function (err) {
        Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      }).finally(function () {
        vm.showLoading = false;
      });
    }

    function onCancel() {
      PreviousState.go();
    }
  }
})();
