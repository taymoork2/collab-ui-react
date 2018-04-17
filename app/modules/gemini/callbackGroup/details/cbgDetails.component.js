(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgDetails', {
      template: require('modules/gemini/callbackGroup/details/cbgDetails.tpl.html'),
      controller: CbgDetailsCtrl,
    });

  /* @ngInject */
  function CbgDetailsCtrl($state, $modal, $scope, $rootScope, $stateParams, $translate, $window, Notification, PreviousState, cbgService, gemService) {
    var vm = this;
    var showHistoriesNum = 5;
    var groupId = _.get($stateParams, 'info.groupId', '');

    vm.notes = [];
    vm.histories = [];
    vm.loading = true;
    vm.hisLoading = true;
    vm.$onInit = $onInit;
    vm.remedyTicketLoading = true;
    vm.onShowAllHistories = onShowAllHistories;
    vm.onOpenRemedyTicket = onOpenRemedyTicket;
    vm.onCancelSubmission = onCancelSubmission;
    vm.cbgs = _.get($stateParams, 'info.cbgs', []);
    vm.groupId = _.get($stateParams, 'info.groupId', '');
    vm.customerId = _.get($stateParams, 'info.customerId', '');

    function $onInit() {
      listenNotesUpdated();
      getRemedyTicket();
      getCurrentCallbackGroup();
      $state.current.data.displayName = $translate.instant('gemini.cbgs.overview');
    }

    function listenNotesUpdated() {
      var deregister = $rootScope.$on('cbgNotesUpdated', function (event, data) {
        event.preventDefault();
        vm.notes = data;
      });
      $scope.$on('$destroy', deregister);
    }

    function onCancelSubmission() {
      $modal.open({
        type: 'dialog',
        template: require('modules/gemini/callbackGroup/details/cancelSubmissionConfirm.tpl.html'),
      }).result.then(function () {
        setButtonStatus('CancelSubmission');
        cancelCBSubmission();
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
          vm.model = res;
          var status = vm.model.status;
          vm.isShowReject = status === 'R';
          vm.model.isEdit = !(status === 'S' || status === 'A');
          vm.isShowCancelSubmission = (gemService.isServicePartner() && (status === 'S'));
          vm.model.status_ = (vm.model.status ? $translate.instant('gemini.cbgs.field.status.' + vm.model.status) : '');
          vm.loading = false;

          getHistories();
        })
        .catch(function (err) {
          Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        });
    }

    function getRemedyTicket() {
      var type = 9;
      gemService.getRemedyTicket(vm.customerId, groupId, type)
        .then(function (res) {
          var resArr = _.filter(res, function (item) {
            return item.description === vm.groupId;
          });

          vm.remedyTicket = _.first(resArr);
          if (vm.remedyTicket) {
            vm.remedyTicket.createTime = moment(vm.remedyTicket.createTime).toDate().toString();
            vm.remedyTicket.status = _.replace(vm.remedyTicket.status, /Cancelled/, 'Canceled');
          }

          vm.remedyTicketLoading = false;
        });
    }

    function getHistories() {
      var data = {
        siteId: groupId,
        objectId: vm.model.groupName,
        customerId: vm.customerId,
        actionFor: 'Callback Group',
      };
      cbgService.getHistories(data)
        .then(function (res) {
          vm.hisLoading = false;
          vm.allHistories = res;
          vm.notes = _.remove(res, function (item) {
            return item.action === 'add_notes_cg';
          });

          _.forEach(vm.allHistories, function (item) {
            if (_.includes(item.action, 'site')) {
              var moveSiteMsg = item.siteID + ' ' + $translate.instant('gemini.cbgs.moveFrom') + ' ' + item.objectID + ' to ' + item.objectName;
              item.objectName = '';
              item.moveSiteMsg = moveSiteMsg;
              item.action = $translate.instant('gemini.cbgs.siteMoved');
            }
            item.action = _.upperFirst(item.action);
          });
          vm.histories = (_.size(vm.allHistories) <= showHistoriesNum ? vm.allHistories : _.slice(vm.allHistories, 0, showHistoriesNum));
          vm.isShowAllHistories = (_.size(vm.allHistories) > showHistoriesNum);
        });
    }

    function cancelCBSubmission() {
      cbgService.cancelCBSubmission(vm.customerId, vm.model.ccaGroupId)
        .then(function () {
          $state.reload();
          $rootScope.$emit('cbgsUpdate', true);
        })
        .catch(function (err) {
          Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        });
    }

    function setButtonStatus(name) {
      vm['btn' + name + 'Loading'] = !vm['btn' + name + 'Loading'];
      vm['btn' + name + 'Disable'] = !vm['btn' + name + 'Disable'];
    }
  }
})();
