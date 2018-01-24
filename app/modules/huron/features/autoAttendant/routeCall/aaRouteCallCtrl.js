(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteCallMenuCtrl', AARouteCallMenuCtrl);

  /* @ngInject */
  function AARouteCallMenuCtrl($scope, $translate, AutoAttendantHybridCareService, AAUiModelService, AACommonService, QueueHelperService, $q) {
    var vm = this;
    vm.queues = [];
    vm.actionPlaceholder = $translate.instant('autoAttendant.actionPlaceholder');

    vm.options = [{
      label: $translate.instant('autoAttendant.phoneMenuRouteUser'),
      value: 'routeToUser',
    },
    {
      label: $translate.instant('autoAttendant.phoneMenuRouteAA'),
      value: 'goto',
    },
    {
      label: $translate.instant('autoAttendant.phoneMenuRouteToExtNum'),
      value: 'route',
    }];

    vm.selected = {
      label: '',
      value: '',
    };

    vm.setSelects = setSelects;

    function setSelects() {
      var val;

      /* look for matching action in menuEntries
         Set label from our list. Will trigger the html and the
         appropriate controller will setup the select list
       */

      _.forEach(vm.options, function (option) {
        val = _.find(vm.menuEntry.actions, {
          name: option.value,
        });
        if (!_.isUndefined(val)) {
          if (val.name === option.value) {
            vm.selected = option;
            return true;
          }
        }
      });
    }

    /**
     * This push the Route To Queue option in Route Call List and push get all the queues
    */
    function getQueues() {
      var deferred = $q.defer();
      QueueHelperService.listQueues().then(function (aaQueueList) {
        if (aaQueueList.length > 0) {
          vm.options.push({
            label: $translate.instant('autoAttendant.phoneMenuRouteQueue'),
            value: 'routeToQueue',
          });
          _.each(aaQueueList, function (aaQueue) {
            var idPos = aaQueue.queueUrl.lastIndexOf('/');
            vm.queues.push({
              description: aaQueue.queueName,
              id: aaQueue.queueUrl.substr(idPos + 1),
            });
          });
        }
        return deferred.resolve();
      }, function (response) {
        if (response.status === 404) {
          return deferred.resolve();
        }
        return deferred.reject(response);
      });
      return deferred.promise;
    }

    function sortAndSetActionType() {
      vm.options.sort(AACommonService.sortByProperty('label'));
      setSelects();
    }

    function setUpFeatureToggles() {
      if (AACommonService.isRouteSIPAddressToggle()) {
        vm.options.push({
          label: $translate.instant('autoAttendant.phoneMenuRouteToSipEndpoint'),
          value: 'routeToSipEndpoint',
        });
      }
      /* spark call options will be shown in case
       * 1. hybrid toggle is disabled
       * 2. hybrid toggle is enabled and customer have spark call configuration */
      if ((!AACommonService.isHybridEnabledOnOrg()) ||
        (AACommonService.isHybridEnabledOnOrg() && AutoAttendantHybridCareService.isSparkCallConfigured())) {
        vm.options.push({
          label: $translate.instant('autoAttendant.phoneMenuRouteVM'),
          value: 'routeToVoiceMail',
        }, {
          label: $translate.instant('autoAttendant.phoneMenuRouteHunt'),
          value: 'routeToHuntGroup',
        });
      }
    }

    function activate() {
      var ui = AAUiModelService.getUiModel();
      vm.menuEntry = ui[$scope.schedule].entries[$scope.index];
      setUpFeatureToggles();
      getQueues().finally(function () {
        sortAndSetActionType();
      });
    }

    activate();
  }
})();
