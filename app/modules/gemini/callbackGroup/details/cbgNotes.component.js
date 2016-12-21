(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgNotes', {
      templateUrl: 'modules/gemini/callbackGroup/details/cbgNotes.tpl.html',
      controller: CbgNotesCtrl
    });
  /* @ngInject */
  function CbgNotesCtrl($state, $stateParams, $translate, cbgService, Notification, PreviousState, gemService) {
    var vm = this;
    var showNotesNum = 5;
    var customerId = _.get($stateParams, 'obj.customerId', '');
    var ccaGroupId = _.get($stateParams, 'obj.info.ccaGroupId', '');

    vm.allNotes = [];
    vm.loading = true;
    vm.onSave = onSave;
    vm.$onInit = $onInit;
    vm.onCancel = onCancel;
    vm.onShowAll = onShowAll;

    function $onInit() {
      getNotes();
      $state.current.data.displayName = $translate.instant('gemini.cbgs.notes.notes');
    }

    function onSave() {
      var postData = {
        customerID: customerId,
        siteID: ccaGroupId,
        action: 'add_note',
        objectName: vm.model.postData
      };
      vm.loading = true;
      cbgService.postNote(postData).then(function (res) {
        var resJson = _.get(res.content, 'data.body');
        var arr = [];
        vm.loading = false;
        if (resJson.returnCode) {
          Notification.notify(gemService.showError(resJson.returnCode));
          return;
        }
        arr.push(resJson);
        vm.notes = arr.concat(vm.notes);
        vm.model.postData = '';
      });
    }

    function onShowAll() {
      vm.notes = vm.allNotes;
      vm.isShowAll = false;
    }

    function onCancel() {
      PreviousState.go();
    }

    function getNotes() {
      cbgService.getNotes(customerId, ccaGroupId)
        .then(function (res) {
          var resJson = _.get(res.content, 'data');
          if (resJson.returnCode) {
            Notification.notify(gemService.showError(resJson.returnCode));
            return;
          }
          vm.allNotes = resJson.body;
          vm.isShowAll = (_.size(vm.allNotes) > showNotesNum);
          vm.notes = (_.size(vm.allNotes) <= showNotesNum ? vm.allNotes : vm.allNotes.slice(0, showNotesNum));
          vm.loading = false;
        });
    }
  }
})();
