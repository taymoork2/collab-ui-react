(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgNotes', {
      templateUrl: 'modules/gemini/callbackGroup/details/cbgNotes.tpl.html',
      controller: CbgNotesCtrl
    });
  /* @ngInject */
  function CbgNotesCtrl($state, $stateParams, $translate, cbgService, Notification) {
    var vm = this;
    var customerId = _.get($stateParams, 'obj.customerId', '');
    var ccaGroupId = _.get($stateParams, 'obj.info.ccaGroupId', '');
    var MAXNUM = 5;
    var allNotes = [];
    vm.loading = true;
    vm.notes = [];
    vm.$onInit = $onInit;
    vm.needShowMore = false;
    vm.onNotePost = onNotePost;
    vm.onShowMoreNotes = onShowMoreNotes;

    function $onInit() {
      loadNotes();
      $state.current.data.displayName = $translate.instant('gemini.cbgs.notes.notes');
    }

    function onNotePost() {
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
          Notification.error(resJson.message);//TODO
          return;
        }
        arr.push(resJson);
        vm.notes = arr.concat(vm.notes);
        vm.model.postData = '';
      });
    }

    function getFirstFewNotes() {
      vm.notes = _.size(allNotes) <= MAXNUM ? allNotes : allNotes.slice(0, MAXNUM);
    }

    function loadNotes() {
      cbgService.listNotes(customerId, ccaGroupId).then(function (res) {
        var resJson = _.get(res.content, 'data');
        if (resJson.returnCode) {
          Notification.error('Fail to get notes');//TODO wording
          return;
        }
        allNotes = resJson.body;
        getFirstFewNotes();
        setShowMoreLink();
        vm.loading = false;
      });
    }

    function onShowMoreNotes() {
      vm.notes = allNotes;
      vm.needShowMore = false;
    }

    function setShowMoreLink() {
      vm.needShowMore = allNotes.length > MAXNUM;
    }
  }
})();
