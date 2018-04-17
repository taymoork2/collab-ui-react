(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgNotes', {
      template: require('modules/gemini/callbackGroup/details/cbgNotes.tpl.html'),
      controller: CbgNotesCtrl,
    });
  /* @ngInject */
  function CbgNotesCtrl($state, $scope, $stateParams, $translate, cbgService, Notification, PreviousState, gemService) {
    var vm = this;
    var showNotesNum = 5;
    var noteMaxByte = 2048;
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
        customerId: customerId,
        part: 'CG',
        siteId: ccaGroupId,
        note: vm.model.postData,
      };
      var notes = _.get(postData, 'note');
      vm.loading = true;
      if (gemService.getByteLength(notes) > noteMaxByte) {
        Notification.error('gemini.cbgs.notes.errorMsg.maxLength', { maxLength: noteMaxByte });
        return;
      }
      cbgService.postNote(postData).then(function (res) {
        vm.loading = false;

        vm.allNotes.unshift(res);
        vm.isShowAll = (_.size(vm.allNotes) > showNotesNum);
        vm.notes = (_.size(vm.allNotes) <= showNotesNum ? vm.allNotes : vm.allNotes.slice(0, showNotesNum));
        vm.model.postData = '';

        $scope.$$childTail.$$prevSibling.note.$setPristine();
        $scope.$emit('cbgNotesUpdated', vm.allNotes);
      }).catch(function (err) {
        Notification.errorResponse(err, 'errors.statusError', { status: err.status });
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
      var data = {
        siteId: ccaGroupId,
        objectId: '',
        customerId: customerId,
        actionFor: 'Callback Group',
      };

      cbgService.getHistories(data)
        .then(function (res) {
          vm.allNotes = _.remove(res, function (item) {
            return item.action === 'add_notes_cg';
          });
          vm.isShowAll = (_.size(vm.allNotes) > showNotesNum);
          vm.notes = (_.size(vm.allNotes) <= showNotesNum ? vm.allNotes : vm.allNotes.slice(0, showNotesNum));
          vm.loading = false;
        })
        .catch(function (err) {
          Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        });
    }
  }
})();
