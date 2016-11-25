(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgDetails', {
      templateUrl: 'modules/gemini/callbackGroup/details/cbgDetails.tpl.html',
      controller: cbgDetailsCtrl
    });

  /* @ngInject */
  function cbgDetailsCtrl($state, $stateParams, $translate, Notification, cbgService) {
    var vm = this;
    var MAXNUM = 5;
    var allActivityLogs = [];
    var groupId = _.get($stateParams, 'info.groupId', '');
    vm.$onInit = $onInit;
    vm.loading = true;
    vm.cbgs = _.get($stateParams, 'info.cbgs', []);
    vm.customerId = _.get($stateParams, 'info.customerId', '');
    vm.needShowMore = false;
    vm.activityLogs = [];
    vm.notes = [];
    vm.onShowMoreLogs = onShowMoreLogs;

    function $onInit() {
      $state.current.data.displayName = $translate.instant('gemini.cbgs.overview');

      cbgService.getOneCallbackGroup(vm.customerId, groupId)
        .then(function (res) {
          var resJson = _.get(res.content, 'data');
          if (resJson.returnCode) {
            Notification.error('Failed to get callback Group');
            return;
          }
          vm.model = resJson.body;
          vm.model.isEdit = true;
          vm.model.status_ = (vm.model.status ? $translate.instant('gemini.cbgs.field.status.' + vm.model.status) : '');
          if (vm.model.status === 'S' || vm.model.status === 'A') {
            vm.model.isEdit = false;
          }
          vm.loading = false;
        })
        .catch(function (err) {
          Notification.errorResponse(err, 'errors.statusError', { status: err.status }); // TODO will defined the wording
        });

      loadNotes();
      getActivityLogs();
    }

    function getFirstFewLogs(activityLogs) {
      return _.size(activityLogs) <= MAXNUM ? activityLogs : activityLogs.slice(0, MAXNUM);
    }

    function getActivityLogs() {
      cbgService.listActivityLog(vm.customerId).then(function (res) {
        var resJson = _.get(res.content, 'data');
        var json = resJson.body;
        if (resJson.returnCode) {
          Notification.error('Fail to get activity logs');//TODO wording
          return;
        }
        allActivityLogs = json;
        vm.activityLogs = getFirstFewLogs(json);
        setShowMoreLink();
      });
    }

    function loadNotes() {
      cbgService.listNotes(vm.customerId, groupId).then(function (res) {
        var resJson = _.get(res.content, 'data');
        if (resJson.returnCode) {
          Notification.error('Fail to get notes');//TODO wording
          return;
        }
        vm.notes = resJson.body;
      });
    }

    function onShowMoreLogs() {
      vm.activityLogs = allActivityLogs;
      vm.needShowMore = false;
    }

    function setShowMoreLink() {
      vm.needShowMore = allActivityLogs.length > MAXNUM;
    }
  }
})();
