'use strict';

describe('EditServicesCtrl: Ctrl', function () {
  var controller, $stateParams, $q, $state, $scope, CsdmDataModelService, Notification;
  var $controller;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Squared'));

  beforeEach(inject(function (_$controller_, _$q_, $rootScope, _$stateParams_, _$state_, _CsdmDataModelService_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    CsdmDataModelService = _CsdmDataModelService_;
    Notification = _Notification_;
  }));

  function initController() {
    controller = $controller('EditServicesCtrl', {
      $scope: $scope,
      $state: $state,
      CsdmDataModelService: CsdmDataModelService
    });
  }

  afterEach(function () {
    jasmine.getJSONFixtures().clearCache();
  });
  beforeEach(installPromiseMatchers);

  describe('initial selection', function () {
    it('sparkCall is selected if "ciscouc" is present', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                entitlements: ['ciscouc']
              }
            }
          };
        }
      };
      initController();

      expect(controller.service).toBe('sparkCall');
    });

    it('sparkOnly is selected if "ciscouc" and "fusionec" is not present', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                entitlements: ['something']
              }
            }
          };
        }
      };
      initController();

      expect(controller.service).toBe('sparkOnly');
    });

    it('sparkCallConnect is selected if "fusionec" is present', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                entitlements: ['fusionec']
              }
            }
          };
        }
      };
      initController();

      expect(controller.service).toBe('sparkCallConnect');
    });
  });

  describe('init of ctrl', function () {
    it('should set sparkCallConnectEnabled to false if toggle is not present and entitlement is not set', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              csdmHybridCall: false,
              account: {
                entitlements: ['something']
              }
            }
          };
        }
      };
      initController();
      $scope.$apply();
      expect(controller.sparkCallConnectEnabled).toBe(false);
    });

    it('should set sparkCallConnectEnabled to true if toggle is not present and entitlement is already set', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              csdmHybridCall: false,
              account: {
                entitlements: ['fusionec']
              }
            }
          };
        }
      };
      initController();
      $scope.$digest();
      expect(controller.sparkCallConnectEnabled).toBe(true);
    });

    it('should set sparkCallConnectEnabled to true if toggle is present', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              csdmHybridCall: true,
              account: {
                entitlements: ['something']
              }
            }
          };
        }
      };
      initController();
      $scope.$digest();
      expect(controller.sparkCallConnectEnabled).toBe(true);
    });
  });

  describe('wizard functions', function () {
    var deviceCisUuid;
    beforeEach(function () {
      deviceCisUuid = 'deviceId';
    });

    describe('hasNextStep', function () {
      it('should be true when editServiceIsn`t set', function () {
        var state = function () {
          return {
            data: {
              csdmHybridCall: true,
              account: {
                entitlements: ['something']
              },
              function: 'anotherFunction'
            }
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          }
        };
        initController();

        expect(controller.hasNextStep()).toBe(true);
      });

      it('should be true when service is sparkCall and it is not the previous service', function () {
        var state = function () {
          return {
            data: {
              account: {
                entitlements: ['fusionec']
              },
              function: 'editServices'
            }
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          }
        };
        initController();
        controller.service = 'sparkCall';

        expect(controller.hasNextStep()).toBe(true);
      });

      it('should be true when service is sparkCallConnect and it is not the previouis service', function () {
        var state = function () {
          return {
            data: {
              account: {
                entitlements: ['ciscouc']
              },
              function: 'editServices'
            }
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          }
        };
        initController();
        controller.service = 'sparkCallConnect';

        expect(controller.hasNextStep()).toBe(true);
      });

      it('should be false when editService is set and it is the previous service', function () {
        var state = function () {
          return {
            data: {
              account: {
                entitlements: ['something']
              },
              function: 'editServices'
            }
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          }
        };
        initController();
        expect(controller.hasNextStep()).toBe(false);
      });
    });

    describe('next', function () {
      var state;
      it('selecting sparkCall should pass on all fields required by the next step including cicouc entitlement', function () {
        state = function () {
          return {
            data: {
              account: {
                entitlements: ['something']
              }
            }
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          }
        };
        spyOn($stateParams.wizard, 'next');
        initController();
        controller.service = 'sparkCall';
        controller.next();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.entitlements).toEqual(['something', 'ciscouc']);
      });

      it('selecting sparkCallConnect should pass on all fields required by the next step including fusionec entitlement', function () {
        state = function () {
          return {
            data: {
              account: {
                entitlements: ['something']
              }
            }
          };
        };
        $stateParams.wizard = {
          state: state,
          next: function () {
          }
        };
        spyOn($stateParams.wizard, 'next');
        initController();
        controller.service = 'sparkCallConnect';
        controller.next();
        expect($stateParams.wizard.next).toHaveBeenCalled();
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.entitlements).toEqual(['something', 'fusionec']);
      });
    });

    describe('Save', function () {
      beforeEach(function () {
        $scope.$dismiss = function () {
        };
        spyOn($scope, '$dismiss');
        spyOn(Notification, 'success');
        spyOn(Notification, 'warning');
        spyOn(Notification, 'errorWithTrackingId');
      });

      it('should just close the modal if place does not have "ciscouc" entitlement', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {}
              }
            };
          }
        };
        initController();
        controller.save();
        expect($scope.$dismiss).toHaveBeenCalled();
      });

      it('should remove the "ciscouc" entitlement and close the modal', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: ['ciscouc', 'something']
                }
              }
            };
          }
        };
        var place = { cisUuid: deviceCisUuid };
        CsdmDataModelService.getPlacesMap = function () {
        };
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.when({ 'http://placeurl': place }));
        CsdmDataModelService.updateCloudberryPlace = function () {
        };
        spyOn(CsdmDataModelService, 'updateCloudberryPlace').and.returnValue($q.when());
        initController();
        controller.service = 'sparkOnly';
        controller.save();
        $scope.$digest();
        expect(CsdmDataModelService.updateCloudberryPlace).toHaveBeenCalledWith(place, ['something']);
        expect($scope.$dismiss).toHaveBeenCalled();
        expect(Notification.success).toHaveBeenCalled();
      });

      it('display warning when place not found', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: ['ciscouc']
                }
              }
            };
          }
        };
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.when({ 'http://placeurl': {} }));
        initController();
        controller.service = 'sparkOnly';
        controller.save();
        $scope.$digest();
        expect(Notification.warning).toHaveBeenCalled();
        expect($scope.$dismiss).toHaveBeenCalledTimes(0);
      });

      it('display error when fetching places fails', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: ['ciscouc']
                }
              }
            };
          }
        };
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.reject());
        initController();
        controller.service = 'sparkOnly';
        controller.save();
        $scope.$digest();
        expect(Notification.errorWithTrackingId).toHaveBeenCalled();
        expect($scope.$dismiss).toHaveBeenCalledTimes(0);
      });

      it('display error when update fails', function () {
        $stateParams.wizard = {
          state: function () {
            return {
              data: {
                account: {
                  cisUuid: deviceCisUuid,
                  entitlements: ['ciscouc']
                }
              }
            };
          }
        };
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.when({ 'http://placeurl': { cisUuid: deviceCisUuid } }));
        spyOn(CsdmDataModelService, 'updateCloudberryPlace').and.returnValue($q.reject());
        initController();
        controller.service = 'sparkOnly';
        controller.save();
        $scope.$digest();
        expect(Notification.errorWithTrackingId).toHaveBeenCalled();
        expect($scope.$dismiss).toHaveBeenCalledTimes(0);
      });
    });
  });
});
