(function () {
  'use strict';

  angular.module('Squared')
    .controller('AddLinesCtrl', AddLinesCtrl);
  /* @ngInject */
  function AddLinesCtrl($stateParams, $scope, Notification, $translate, $q, CommonLineService, CsdmDataModelService, DialPlanService) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;

    $scope.entitylist = [{
      name: wizardData.account.name
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
    vm.isLoading = false;
    vm.isDisabled = true;

    $scope.returnInternalNumberlist = CommonLineService.returnInternalNumberList;
    $scope.returnExternalNumberList = CommonLineService.returnExternalNumberList;
    $scope.syncGridDidDn = syncGridDidDn;
    $scope.checkDnOverlapsSteeringDigit = CommonLineService.checkDnOverlapsSteeringDigit;

    vm.hasNextStep = function () {
      return wizardData.function !== 'editServices';
    };

    vm.next = function () {
      var numbers = vm.getSelectedNumbers();
      $stateParams.wizard.next({
        account: {
          directoryNumber: numbers.directoryNumber,
          externalNumber: numbers.externalNumber
        }
      });
    };

    vm.save = function () {
      vm.isLoading = true;
      var numbers = vm.getSelectedNumbers();
      if (numbers.directoryNumber || numbers.externalNumber) {
        CsdmDataModelService.getPlacesMap().then(function (list) {
          var place = _.find(_.values(list), { 'cisUuid': wizardData.account.cisUuid });
          if (place) {
            CsdmDataModelService.updateCloudberryPlace(place, wizardData.account.entitlements, numbers.directoryNumber, numbers.externalNumber)
              .then(function () {
                $scope.$dismiss();
                Notification.success("addDeviceWizard.assignPhoneNumber.linesSaved");
              }, function (error) {
                vm.isLoading = false;
                Notification.errorResponse(error, 'addDeviceWizard.assignPhoneNumber.placeEditError');
              });
          } else {
            vm.isLoading = false;
            Notification.warning('addDeviceWizard.assignPhoneNumber.placeNotFound');
          }
        }, function (error) {
          vm.isLoading = false;
          Notification.errorResponse(error, 'addDeviceWizard.assignPhoneNumber.placeEditError');
        });
      } else {
        vm.isLoading = false;
        Notification.warning('addDeviceWizard.assignPhoneNumber.placeEditNoChanges');
      }
    };

    vm.getSelectedNumbers = function () {
      var entity = $scope.entitylist[0];
      var directoryNumber;
      if (entity.assignedDn) {
        directoryNumber = entity.assignedDn.pattern;
      }
      var externalNumber;
      if (entity.externalNumber && entity.externalNumber.pattern !== 'None') {
        externalNumber = entity.externalNumber.pattern;
      }
      return {
        directoryNumber: directoryNumber,
        externalNumber: externalNumber
      };
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
          /*if ($scope.internalNumberPool.length === 0 || $scope.externalNumberPool.length === 0) {
            vm.isDisabled = true;
          } else {
            vm.isDisabled = false;
          }*/

          vm.isDisabled = !!($scope.internalNumberPool.length === 0 || $scope.externalNumberPool.length === 0);


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
      }).catch(function () {
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
      'refresh-data-fn="grid.appScope.returnExternalNumberList(filter)" wait-time="0" ' +
      'placeholder= "placeholder" input-placeholder="inputPlaceholder" ' +
      'on-change-fn="grid.appScope.syncGridDidDn(row.entity, \'externalNumber\')"' +
      'labelfield="pattern" valuefield="uuid" required="true" filter="true"> </cs-select></div> ' +
      '<div ng-show="row.entity.didDnMapMsg !== undefined"> ' +
      '<cs-select name="noExternalNumber" ' +
      'ng-model="row.entity.externalNumber" options="grid.appScope.externalNumberPool" class="select-warning"' +
      'labelfield="pattern" valuefield="uuid" required="true" filter="true"> </cs-select>' +
      '<span class="warning did-map-error">{{row.entity.didDnMapMsg | translate }}</span> </div> ';

    // To differentiate the Place list change made by map operation
    //  and other manual/reset operation.
    $scope.$watch('entitylist', function () {
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
