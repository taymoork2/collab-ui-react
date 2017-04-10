(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgNotes', {
      templateUrl: 'modules/gemini/callbackGroup/details/cbgNotes.tpl.html',
      controller: CbgNotesCtrl,
    });
  /* @ngInject */
  function CbgNotesCtrl($state, $scope, $stateParams, $translate, cbgService, Notification, PreviousState, gemService) {
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
        objectName: vm.model.postData,
      };
      var notes = _.get(postData, 'objectName');
      vm.loading = true;
      if (getByteLength(notes) > 2048) {
        return;
      }
      cbgService.postNote(postData).then(function (res) {
        var resJson = _.get(res.content, 'data.body');
        vm.loading = false;
        if (resJson.returnCode) {
          Notification.notify(gemService.showError(resJson.returnCode));
          return;
        }
        vm.allNotes.unshift(resJson);
        vm.isShowAll = (_.size(vm.allNotes) > showNotesNum);
        vm.notes = (_.size(vm.allNotes) <= showNotesNum ? vm.allNotes : vm.allNotes.slice(0, showNotesNum));
        vm.model.postData = '';

        $scope.$emit('cbgNotesUpdated', vm.allNotes);
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

    function getByteLength(str) {
      var totalLength = 0;
      var charCode;
      for (var i = 0; i < str.length; i++) {
        charCode = str.charCodeAt(i);
        if (charCode < 0x007f) {
          totalLength = totalLength + 1;
        } else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
          totalLength += 2;
        } else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
          totalLength += 3;
        }
      }
      return totalLength;
    }
  }
})();
