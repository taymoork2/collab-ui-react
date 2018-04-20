(function () {
  'use strict';

  angular.module('Squared')
    .controller('AddLinesCtrl', AddLinesCtrl);
  /* @ngInject */
  function AddLinesCtrl($stateParams, $scope, Notification, $translate, $q, CommonLineService, CsdmDataModelService, DialPlanService, FeatureToggleService, LocationsService) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;

    vm.telephonyInfo = {};
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
    vm.anyPoolEmpty = true;

    vm.loadLocations = loadLocations;
    vm.locationOptions = [];
    vm.selectedLocation = '';
    vm.locationUuid = '';

    vm.labelField = '';
    vm.ishI1484 = false;

    vm.returnInternalNumberlist = CommonLineService.returnInternalNumberList;
    vm.returnExternalNumberList = CommonLineService.returnExternalNumberList;
    vm.getInternalNumberPool = CommonLineService.getInternalNumberPool;
    vm.getExternalNumberPool = CommonLineService.getExternalNumberPool;
    vm.syncGridDidDn = syncGridDidDn;
    vm.checkDnOverlapsSteeringDigit = CommonLineService.checkDnOverlapsSteeringDigit;

    function loadLocations() {
      return FeatureToggleService.supports(FeatureToggleService.features.hI1484)
        .then(function (supported) {
          vm.ishI1484 = supported;
          if (vm.ishI1484) {
            return LocationsService.getLocationList()
              .then(function (locationOptions) {
                vm.locationOptions = locationOptions;
                _.forEach(locationOptions, function (result) {
                  if (result.defaultLocation == true) {
                    _.forEach(vm.addDnGridOptions.data, function (data) {
                      data.selectedLocation = { uuid: result.uuid, name: result.name };
                      vm.selectedLocation = data.selectedLocation.name;
                      vm.locationUuid = data.selectedLocation.uuid;
                    });
                  }
                });

                if (vm.locationOptions.length > 1) {
                  vm.locationColumn = {
                    field: 'location',
                    displayName: $translate.instant('usersPreview.location'),
                    cellTemplate: locationTemplate,
                  };
                  vm.addDnGridOptions.columnDefs.splice(1, 0, vm.locationColumn);
                }
              })
              .then(function () {
                vm.labelField = 'siteToSite';
                return CommonLineService.loadLocationInternalNumberPool(null, vm.locationUuid);
              });
          } else {
            vm.labelField = 'number';
            return CommonLineService.loadInternalNumberPool();
          }
        });
    }

    vm.hasNextStep = function () {
      return wizardData.function !== 'editServices' || wizardData.account.enableCalService;
    };

    vm.next = function () {
      var numbers = vm.getSelectedNumbers();
      $stateParams.wizard.next({
        account: {
          directoryNumber: numbers.directoryNumber,
          externalNumber: numbers.externalNumber,
          locationUuid: numbers.locationUuid,
        },
      }, wizardData.account.enableCalService ? 'calendar' : 'next');
    };

    vm.save = function () {
      vm.isLoading = true;
      var numbers = vm.getSelectedNumbers();
      if (numbers.directoryNumber || numbers.externalNumber || numbers.locationUuid) {
        CsdmDataModelService.reloadPlace(wizardData.account.cisUuid).then(function (place) {
          if (place) {
            CsdmDataModelService.updateCloudberryPlace(place, {
              entitlements: wizardData.account.entitlements,
              locationUuid: numbers.locationUuid,
              directoryNumber: numbers.directoryNumber,
              externalNumber: numbers.externalNumber,
            })
              .then(function () {
                $scope.$dismiss();
                Notification.success('addDeviceWizard.assignPhoneNumber.linesSaved');
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
      var entity = vm.addDnGridOptions.data[0];
      if (vm.ishI1484) {
        if (entity.selectedLocation && vm.locationOptions.length > 1) {
          vm.locationUuid = entity.selectedLocation.uuid;
        }
      }
      var directoryNumber;
      if (entity.assignedDn) {
        if (vm.ishI1484) {
          directoryNumber = entity.assignedDn.internal;
        } else {
          directoryNumber = entity.assignedDn.number;
        }
      }
      var externalNumber;
      if (entity.externalNumber && entity.externalNumber.uuid !== 'none') {
        externalNumber = entity.externalNumber.pattern;
      }
      return {
        directoryNumber: directoryNumber,
        externalNumber: externalNumber,
        locationUuid: vm.locationUuid,
      };
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };

    vm.isDisabled = function () {
      return vm.anyPoolEmpty || !vm.getSelectedNumbers().directoryNumber;
    };

    function activateDID() {
      $q.all([CommonLineService.loadExternalNumberPool(), CommonLineService.loadPrimarySiteInfo(), toggleShowExtensions(), loadLocations()])
        .finally(function () {
          $scope.externalNumber = _.head(CommonLineService.getExternalNumberPool());
          vm.telephonyInfo = CommonLineService.getTelephonyInfo();
          vm.anyPoolEmpty = !!(CommonLineService.getInternalNumberPool().length === 0 || CommonLineService.getExternalNumberPool().length === 0);

          if (vm.showExtensions === true) {
            CommonLineService.assignDNForUserList(vm.addDnGridOptions.data);
            $scope.validateDnForUser();
          } else {
            mapDidToDn(vm.addDnGridOptions.data);
          }
          vm.processing = false;
        });
    }

    function validateDnForUser() {
      if (CommonLineService.isDnNotAvailable(vm.addDnGridOptions.data)) {
        $scope.$emit('wizardNextButtonDisable', true);
      } else {
        $scope.$emit('wizardNextButtonDisable', false);
      }
    }

    function resetDns() {
      vm.isResetInProgress = true;
      vm.isResetEnabled = false;
      CommonLineService.loadInternalNumberPool().then(function () {
        CommonLineService.assignDNForUserList(vm.addDnGridOptions.data);
        validateDnForUser();
        vm.isReset = true;
        vm.isResetInProgress = false;
      }).catch(function () {
        vm.isResetInProgress = false;
        validateDnForUser();
      });
    }

    function mapDidToDn() {
      CommonLineService.mapDidToDn(vm.addDnGridOptions.data).then(function (externalNumberMapping) {
        $scope.externalNumberMapping = externalNumberMapping;
        CommonLineService.assignMapUserList(vm.addDnGridOptions.data.length, $scope.externalNumberMapping, vm.addDnGridOptions.data);
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
      return DialPlanService.getDialPlan().then(function (response) {
        var indexOfDidColumn = _.findIndex(vm.addDnGridOptions.columnDefs, {
          field: 'externalNumber',
        });
        var indexOfDnColumn = _.findIndex(vm.addDnGridOptions.columnDefs, {
          field: 'internalExtension',
        });
        if (response.extensionGenerated === 'true') {
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
      if (modifiedFieldName === 'location') {
        populateExtensions(rowEntity);
      }
      if (vm.showExtensions === false) {
        var dnLength = rowEntity.assignedDn.pattern.length;

        // if the internalNumber was changed, find a matching DID and set the externalNumber to match
        if (modifiedFieldName === 'internalNumber') {
          var matchingDid = _.find(CommonLineService.getExternalNumberPool(), function (extNum) {
            return extNum.pattern.substr(-dnLength) === rowEntity.assignedDn.pattern;
          });
          if (matchingDid) {
            rowEntity.externalNumber = matchingDid;
          }
        }
        // if the externalNumber was changed, find a matching DN and set the internalNumber to match
        if (modifiedFieldName === 'externalNumber') {
          var matchingDn = _.find(CommonLineService.getInternalNumberPool(), {
            pattern: rowEntity.externalNumber.pattern.substr(-dnLength),
          });
          if (matchingDn) {
            rowEntity.assignedDn = matchingDn;
          }
        }
      }
    }

    function populateExtensions(rowEntity) {
      var selectedLocationColumn = rowEntity.selectedLocation.uuid;
      return CommonLineService.loadLocationInternalNumberPool(null, selectedLocationColumn)
        .then(function (internalNumberPool) {
          rowEntity.assignedDn.siteToSite = internalNumberPool[0].siteToSite;
        });
    }

    $scope.noExtInPool = $translate.instant('usersPage.notApplicable');
    $scope.noExternalNum = $translate.instant('usersPage.notApplicable');

    var internalExtensionTemplate = '<div ng-show="row.entity.assignedDn !== undefined"> ' +
      '<cs-select name="internalNumber" ' +
      'ng-model="row.entity.assignedDn" options="grid.appScope.getInternalNumberPool()" ' +
      'refresh-data-fn="grid.appScope.returnInternalNumberlist(filter , row.entity.selectedLocation.uuid)" wait-time="0" ' +
      'placeholder="placeholder" input-placeholder="inputPlaceholder" ' +
      'on-change-fn="grid.appScope.syncGridDidDn(row.entity, \'internalNumber\')"' +
      'labelfield="{{grid.appScope.labelField}}" valuefield="uuid" required="true" filter="true"' +
      ' is-warn="{{grid.appScope.checkDnOverlapsSteeringDigit(row.entity)}}" warn-msg="{{\'usersPage.steeringDigitOverlapWarning\' | translate: { steeringDigitInTranslation: grid.appScope.telephonyInfo.steeringDigit } }}" > </cs-select></div>' +
      '<div ng-show="row.entity.assignedDn === undefined"> ' +
      '<cs-select name="noInternalNumber" ' +
      'ng-model="grid.appScope.noExtInPool" labelfield="grid.appScope.noExtInPool" is-disabled="true" > </cs-select>' +
      '<span class="error">{{\'usersPage.noExtensionInPool\' | translate }}</span> </div> ';

    var nameTemplate = CommonLineService.getNameTemplate();

    var locationTemplate = '<div>' +
      '<cs-select name="location" ' +
      'ng-model="row.entity.selectedLocation" options="grid.appScope.locationOptions" ' +
      'labelfield="name" valuefield="uuid" required="true" filter="true"' +
      'on-change-fn="grid.appScope.syncGridDidDn(row.entity, \'location\')"' +
      '</div>';

    var externalExtensionTemplate = '<div ng-show="row.entity.didDnMapMsg === undefined"> ' +
      '<cs-select name="externalNumber" ' +
      'ng-model="row.entity.externalNumber" options="grid.appScope.getExternalNumberPool()" ' +
      'refresh-data-fn="grid.appScope.returnExternalNumberList(filter)" wait-time="0" ' +
      'placeholder= "placeholder" input-placeholder="inputPlaceholder" ' +
      'on-change-fn="grid.appScope.syncGridDidDn(row.entity, \'externalNumber\')"' +
      'labelfield="pattern" valuefield="uuid" required="true" filter="true"> </cs-select></div> ' +
      '<div ng-show="row.entity.didDnMapMsg !== undefined"> ' +
      '<cs-select name="noExternalNumber" ' +
      'ng-model="row.entity.externalNumber" options="grid.appScope.getExternalNumberPool()" class="select-warning"' +
      'labelfield="pattern" valuefield="uuid" required="true" filter="true"> </cs-select>' +
      '<span class="warning did-map-error">{{row.entity.didDnMapMsg | translate }}</span> </div> ';

    vm.addDnGridOptions = {
      data: [{
        name: wizardData.account.name,
      }],
      appScopeProvider: vm,
      enableSorting: false,
      rowHeight: 45,
      columnDefs: [{
        field: 'name',
        displayName: $translate.instant('usersPage.nameHeader'),
        cellTemplate: nameTemplate,
      }, {
        field: 'externalNumber',
        displayName: $translate.instant('usersPage.directLineHeader'),
        cellTemplate: externalExtensionTemplate,
        maxWidth: 220,
        minWidth: 140,
      }, {
        field: 'internalExtension',
        displayName: $translate.instant('usersPage.extensionHeader'),
        cellTemplate: internalExtensionTemplate,
        maxWidth: 220,
        minWidth: 140,
      }],
    };

    // To differentiate the Place list change made by map operation
    //  and other manual/reset operation.
    $scope.$watch(function () {
      return vm.addDnGridOptions.data;
    }, function () {
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
    vm.activateDID();
  }
})();
