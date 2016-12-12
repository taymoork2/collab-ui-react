(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgDetails', {
      templateUrl: 'modules/gemini/callbackGroup/details/cbgDetails.tpl.html',
      controller: CbgDetailsCtrl
    });

  /* @ngInject */
  function CbgDetailsCtrl($state, $modal, $rootScope, $stateParams, $translate, $window, Notification, PreviousState, cbgService, gemService) {
    var vm = this;
    var showHistoriesNum = 5;
    var groupId = _.get($stateParams, 'info.groupId', '');

    vm.notes = [];
    vm.histories = [];
    vm.loading = true;
    vm.$onInit = $onInit;
    vm.onApprove = onApprove;
    vm.onDecline = onDecline;
    vm.onComplete = onComplete;
    vm.remedyTicketLoading = true;
    vm.onShowAllHistories = onShowAllHistories;
    vm.onOpenRemedyTicket = onOpenRemedyTicket;
    vm.onCancelSubmission = onCancelSubmission;
    vm.cbgs = _.get($stateParams, 'info.cbgs', []);
    vm.customerId = _.get($stateParams, 'info.customerId', '');


    function $onInit() {
      $state.current.data.displayName = $translate.instant('gemini.cbgs.overview');

      getNotes();
      getHistories();
      getRemedyTicket();
      getCurrentCallbackGroup();
    }

    function onCancelSubmission() {
      $modal.open({
        type: 'dialog',
        templateUrl: 'modules/gemini/callbackGroup/details/cancelSubmissionConfirm.tpl.html'
      }).result.then(function () {
        setButtonStatus('CancelSubmission');
        updateCallbackGroupStatus('cancel');
      });
    }

    function onApprove() {
      $modal.open({
        type: 'dialog',
        templateUrl: 'modules/gemini/callbackGroup/details/approveConfirm.tpl.html'
      }).result.then(function () {
        vm.isNotReload = false;
        updateCallbackGroupStatus('approve');
        $modal.open({
          type: 'dialog',
          templateUrl: 'modules/gemini/callbackGroup/details/provisionConfirm.tpl.html'
        }).result.then(function () {
          vm.isNotReload = false;
          updateCallbackGroupStatus('provision');
        });
      });
    }

    function onComplete() {
      setButtonStatus('Complete');
      updateCallbackGroupStatus('provision');
    }

    function onDecline() {
      $modal.open({
        type: 'small',
        controllerAs: 'ctrl',
        controller: /* @ngInject */function ($modalInstance) {
          var ctrl = this;
          ctrl.onSave = onSave;
          function onSave() {
            vm.comments = ctrl.comments;
            $modalInstance.close();
          }
        },
        templateUrl: 'modules/gemini/callbackGroup/details/declineSmallDialog.tpl.html'
      }).result.then(function () {
        updateCallbackGroupStatus('decline', { comments: vm.comments });
      });
    }

    function onOpenRemedyTicket() {
      $window.open(vm.remedyTicket.ticketUrl, '_blank');
    }

    function onShowAllHistories() {
      vm.histories = vm.allHistories;
      vm.isShowAllHistories = false;
    }

    function getCurrentCallbackGroup() {
      cbgService.getOneCallbackGroup(vm.customerId, groupId)
        .then(function (res) {
          var resJson = _.get(res.content, 'data');
          if (resJson.returnCode) {
            Notification.error('Failed to get callback Group');
            return;
          }
          vm.model = resJson.body;
          var status = vm.model.status;
          vm.isShowCommplet = (status === 'A');
          vm.model.isEdit = !(status === 'S' || status === 'A');
          vm.isShowDeclineApprove = (gemService.isAvops() && status === 'S');
          vm.isShowCancelSubmission = (gemService.isServicePartner() && (status === 'S'));
          vm.model.status_ = (vm.model.status ? $translate.instant('gemini.cbgs.field.status.' + vm.model.status) : '');
          vm.loading = false;
        })
        .catch(function (err) {
          Notification.errorResponse(err, 'errors.statusError', { status: err.status }); // TODO will defined the wording
        });
    }

    function getNotes() {
      cbgService.getNotes(vm.customerId, groupId)
        .then(function (res) {
          var returnCode = _.get(res.content, 'data.returnCode');
          if (returnCode) {
            Notification.error('Fail to get notes');//TODO wording
            return;
          }
          vm.notes = _.get(res.content, 'data.body');
        });
    }

    function getRemedyTicket() {
      gemService.getCbgRemedyTicket(vm.customerId)
        .then(function (res) {
          var resArr = _.get(res.content, 'data');
          vm.remedyTicket = _.first(resArr);
          vm.remedyTicketLoading = false;
        });

    }

    function getHistories() {
      cbgService.getHistories(vm.customerId, groupId)
        .then(function (res) {
          var resJson = _.get(res.content, 'data');
          if (resJson.returnCode) {
            Notification.error('Fail to get activity logs');//TODO wording
            return;
          }
          vm.allHistories = resJson.body;
          vm.histories = (_.size(vm.allHistories) <= showHistoriesNum ? vm.allHistories : _.slice(vm.allHistories, 0, showHistoriesNum));
          vm.isShowAllHistories = (_.size(vm.allHistories) > showHistoriesNum);
        });
    }

    function updateCallbackGroupStatus(operation, data) {
      cbgService.updateCallbackGroupStatus(vm.customerId, vm.model.ccaGroupId, operation, data)
        .then(function (res) {
          var resJson = _.get(res.content, 'data');
          if (resJson.returnCode) {
            Notification.notify(gemService.showError(resJson.returnCode));
            return;
          }
          $rootScope.$emit('cbgsUpdate', true);
          if (!vm.isNotReload) {
            $state.reload();
          }
        })
        .catch(function (err) {
          Notification.errorResponse(err, 'errors.statusError', { status: err.status }); // TODO will defined the wording
        });
    }

    function setButtonStatus(name) {
      vm['btn' + name + 'Loading'] = !vm['btn' + name + 'Loading'];
      vm['btn' + name + 'Disable'] = !vm['btn' + name + 'Disable'];
    }
  }
})();
