(function () {
  'use strict';

  angular.module('Squared')
    .controller('AddLinesCtrl', AddLinesCtrl);
  /* @ngInject */
  function AddLinesCtrl($stateParams, $state, $scope, Notification, $translate, $q, CommonLineService, Authinfo, PlaceService, CsdmCodeService, DialPlanService) {
    var vm = this;
    vm.wizardData = $stateParams.wizard.state().data;

    $scope.entitylist = [{
      name: vm.wizardData.deviceName
    }];
    $scope.internalNumberPool = [];
    $scope.externalNumberPool = [];
    $scope.telephonyInfo = {};
    vm.isMapped = false;
    vm.isMapInProgress = false;
    vm.isResetInProgress = false;
    vm.isMapEnabled = true;
    vm.processing = false;
    vm.showExtensions = false;
    vm.mapDidToDn = mapDidToDn;
    vm.resetDns = resetDns;
    vm.activateDID = activateDID;

    $scope.returnInternalNumberlist = CommonLineService.returnInternalNumberlist;
    $scope.syncGridDidDn = syncGridDidDn;
    $scope.checkDnOverlapsSteeringDigit = CommonLineService.checkDnOverlapsSteeringDigit;

    vm.next = function () {

      function successCallback(code) {
        if (code && code.activationCode && code.activationCode.length > 0) {
          $stateParams.wizard.next({
            deviceName: vm.wizardData.deviceName,
            code: code,
            cisUuid: Authinfo.getUserId(),
            userName: Authinfo.getUserName(),
            displayName: Authinfo.getUserName(),
            organizationId: Authinfo.getOrgId()
          });
        } else {
          $state.go('users.list');
        }
      }

      function failCallback() {

      }

      function addPlace() {
        _.forEach($scope.entitylist, function (entity) {
          var placeEntity = {
            name: entity.name,
            directoryNumber: entity.assignedDn.pattern
          };
          if (entity.externalNumber && entity.externalNumber.pattern !== 'None') {
            placeEntity.externalNumber = entity.externalNumber.pattern;
          }
          PlaceService.save({
              customerId: Authinfo.getOrgId()
            }, placeEntity, function (data, headers) {
              data.uuid = headers('location').split("/").pop();
              return data;
            }).$promise
            .then(successcb)
            .catch(function (error) {
              Notification.errorResponse(error, 'placesPage.placeError');
            });
        });
      }
      //This is temp code to be removed when CMI GDS code is ready
      function successcb(place) {
        vm.place = place;
        CsdmCodeService
          .createCodeForExisting(place.uuid)
          .then(successCallback) //, XhrNotificationService.notify)
          .catch(failCallback); //, XhrNotificationService.notify);
      }
      addPlace();
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };

    function activateDID() {

      $q.all([CommonLineService.loadInternalNumberPool(), CommonLineService.loadExternalNumberPool(), CommonLineService.loadPrimarySiteInfo(), toggleShowExtensions()])
        .finally(function () {
          $scope.internalNumberPool = CommonLineService.getInternalNumberPool();
          $scope.externalNumberPool = CommonLineService.getExternalNumberPool();
          $scope.externalNumber = $scope.externalNumberPool[0];
          $scope.telephonyInfo = CommonLineService.getTelephonyInfo();
          if (vm.showExtensions === true) {
            CommonLineService.assignDNForUserList($scope.entitylist);
            $scope.validateDnForUser();
          } else {
            mapDidToDn($scope.entitylist);
          }
          vm.processing = false;
        });
    }

    function validateDnForUser() {
      if (CommonLineService.isDnNotAvailable($scope.entitylist)) {
        $scope.$emit('wizardNextButtonDisable', true);
      } else {
        $scope.$emit('wizardNextButtonDisable', false);
      }
    }

    function resetDns() {
      vm.isResetInProgress = true;
      vm.isResetEnabled = false;
      CommonLineService.loadInternalNumberPool().then(function () {
        CommonLineService.assignDNForUserList($scope.entitylist);
        validateDnForUser();
        vm.isReset = true;
        vm.isResetInProgress = false;
      }).catch(function (response) {
        vm.isResetInProgress = false;
        validateDnForUser();
      });
    }

    function mapDidToDn() {
      CommonLineService.mapDidToDn($scope.entitylist).then(function (externalNumberMapping) {
        $scope.externalNumberMapping = externalNumberMapping;
        CommonLineService.assignMapUserList($scope.entitylist.length, $scope.externalNumberMapping, $scope.entitylist);
        vm.isMapped = true;
        vm.isMapInProgress = false;
        validateDnForUser();
      }).catch(function (response) {
        vm.isMapInProgress = false;
        vm.isMapped = false;
        vm.isMapEnabled = true;
        $scope.externalNumberMapping = [];
        Notification.errorResponse(response, 'directoryNumberPanel.externalNumberMappingError');
      });
    }

    function toggleShowExtensions() {
      return DialPlanService.getCustomerDialPlanDetails().then(function (response) {
        var indexOfDidColumn = _.findIndex(vm.addDnGridOptions.columnDefs, {
          field: 'externalNumber'
        });
        var indexOfDnColumn = _.findIndex(vm.addDnGridOptions.columnDefs, {
          field: 'internalExtension'
        });
        if (response.extensionGenerated === "true") {
          vm.showExtensions = false;
          vm.addDnGridOptions.columnDefs[indexOfDidColumn].visible = false;
          vm.addDnGridOptions.columnDefs[indexOfDnColumn].displayName = $translate.instant('usersPage.directLineHeader');
        } else {
          vm.showExtensions = true;
          vm.addDnGridOptions.columnDefs[indexOfDidColumn].visible = true;
          vm.addDnGridOptions.columnDefs[indexOfDnColumn].displayName = $translate.instant('usersPage.extensionHeader');
        }
      }).catch(function (response) {
        Notification.errorResponse(response, 'serviceSetupModal.customerDialPlanDetailsGetError');
      });
    }

    function syncGridDidDn(rowEntity, modifiedFieldName) {
      if (vm.showExtensions === false) {
        var dnLength = rowEntity.assignedDn.pattern.length;
        // if the internalNumber was changed, find a matching DID and set the externalNumber to match
        if (modifiedFieldName === "internalNumber") {
          var matchingDid = _.find($scope.externalNumberPool, function (extNum) {
            return extNum.pattern.substr(-dnLength) === rowEntity.assignedDn.pattern;
          });
          if (matchingDid) {
            rowEntity.externalNumber = matchingDid;
          }
        }
        // if the externalNumber was changed, find a matching DN and set the internalNumber to match
        if (modifiedFieldName === "externalNumber") {
          var matchingDn = _.find($scope.internalNumberPool, {
            pattern: rowEntity.externalNumber.pattern.substr(-dnLength)
          });
          if (matchingDn) {
            rowEntity.assignedDn = matchingDn;
          }
        }
      }
    }

    $scope.noExtInPool = $translate.instant('usersPage.notApplicable');
    $scope.noExternalNum = $translate.instant('usersPage.notApplicable');

    var internalExtensionTemplate = '<div ng-show="row.entity.assignedDn !== undefined"> ' +
      '<cs-select name="internalNumber" ' +
      'ng-model="row.entity.assignedDn" options="grid.appScope.internalNumberPool" ' +
      'refresh-data-fn="grid.appScope.returnInternalNumberlist(filter)" wait-time="0" ' +
      'placeholder="placeholder" input-placeholder="inputPlaceholder" ' +
      'on-change-fn="grid.appScope.syncGridDidDn(row.entity, \'internalNumber\')"' +
      'labelfield="pattern" valuefield="uuid" required="true" filter="true"' +
      ' is-warn="{{grid.appScope.checkDnOverlapsSteeringDigit(row.entity)}}" warn-msg="{{\'usersPage.steeringDigitOverlapWarning\' | translate: { steeringDigitInTranslation: telephonyInfo.steeringDigit } }}" > </cs-select></div>' +
      '<div ng-show="row.entity.assignedDn === undefined"> ' +
      '<cs-select name="noInternalNumber" ' +
      'ng-model="grid.appScope.noExtInPool" labelfield="grid.appScope.noExtInPool" is-disabled="true" > </cs-select>' +
      '<span class="error">{{\'usersPage.noExtensionInPool\' | translate }}</span> </div> ';

    var nameTemplate = CommonLineService.getNameTemplate();

    var externalExtensionTemplate = '<div ng-show="row.entity.didDnMapMsg === undefined"> ' +
      '<cs-select name="externalNumber" ' +
      'ng-model="row.entity.externalNumber" options="grid.appScope.externalNumberPool" ' +
      'refresh-data-fn="grid.appScope.loadExternalNumberPool(filter)" wait-time="0" ' +
      'placeholder= "placeholder" input-placeholder="inputPlaceholder" ' +
      'on-change-fn="grid.appScope.syncGridDidDn(row.entity, \'externalNumber\')"' +
      'labelfield="pattern" valuefield="uuid" required="true" filter="true"> </cs-select></div> ' +
      '<div ng-show="row.entity.didDnMapMsg !== undefined"> ' +
      '<cs-select name="grid.appScope.noExternalNumber" ' +
      'ng-model="row.entity.externalNumber" options="grid.appScope.externalNumberPool" class="select-warning"' +
      'labelfield="pattern" valuefield="uuid" required="true" filter="true"> </cs-select>' +
      '<span class="warning did-map-error">{{row.entity.didDnMapMsg | translate }}</span> </div> ';

    // To differentiate the Place list change made by map operation
    //  and other manual/reset operation.
    $scope.$watch('entitylist', function (newVal, oldVal) {
      if (vm.isMapped) {
        vm.isMapped = false;
      } else {
        vm.isMapEnabled = true;
      }

      if (vm.isReset) {
        vm.isReset = false;
      } else {
        vm.isResetEnabled = true;
      }
    }, true);

    $scope.isResetEnabled = false;
    validateDnForUser();

    vm.addDnGridOptions = {
      data: 'entitylist',
      enableHorizontalScrollbar: 0,
      enableRowSelection: false,
      multiSelect: false,
      rowHeight: 45,
      enableRowHeaderSelection: false,
      enableColumnResize: true,
      enableColumnMenus: false,
      columnDefs: [{
        field: 'name',
        displayName: $translate.instant('usersPage.nameHeader'),
        sortable: false,
        cellTemplate: nameTemplate,
        width: '*'
      }, {
        field: 'externalNumber',
        displayName: $translate.instant('usersPage.directLineHeader'),
        sortable: false,
        cellTemplate: externalExtensionTemplate,
        maxWidth: 220,
        minWidth: 140,
        width: '*'
      }, {
        field: 'internalExtension',
        displayName: $translate.instant('usersPage.extensionHeader'),
        sortable: false,
        cellTemplate: internalExtensionTemplate,
        maxWidth: 220,
        minWidth: 140,
        width: '*'
      }]
    };

    vm.activateDID();
  }
})();
