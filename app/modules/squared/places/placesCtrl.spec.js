'use strict';

describe('Controller: PlacesCtrl', function () {
  var $scope, $controller, $state, $timeout, $q, controller;
  var CsdmDataModelService, Userservice, Authinfo, FeatureToggleService, ServiceDescriptor;
  var accounts = getJSONFixture('squared/json/accounts.json');

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$state_, _$timeout_, _$q_, _CsdmDataModelService_, _Userservice_, _Authinfo_, _FeatureToggleService_, _ServiceDescriptor_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    $timeout = _$timeout_;
    $q = _$q_;
    CsdmDataModelService = _CsdmDataModelService_;
    Userservice = _Userservice_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    ServiceDescriptor = _ServiceDescriptor_;
  }

  function initSpies() {
    spyOn(Userservice, 'getUser');
    spyOn(FeatureToggleService, 'csdmATAGetStatus').and.returnValue($q.resolve());
    spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'csdmPlaceCalendarGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'atlasF237ResourceGroupGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'atlasHerculesGoogleCalendarGetStatus').and.returnValue($q.resolve(true));
    spyOn(ServiceDescriptor, 'getServices').and.returnValue($q.resolve([]));
    spyOn(CsdmDataModelService, 'subscribeToChanges').and.returnValue(true);
  }

  function initController() {

    controller = $controller('PlacesCtrl', {
      $scope: $scope,
      $state: $state,
      $timeout: $timeout,
      CsdmDataModelService: CsdmDataModelService,
    });
  }

  describe('bigOrg', function () {

    beforeEach(function () {
      spyOn(CsdmDataModelService, 'isBigOrg').and.returnValue($q.resolve(true));
    });

    beforeEach(initController);

    describe('init', function () {

      it('should init controller', function () {
        expect(controller).toBeDefined();
      });

      it('should be in searching org state', function () {
        expect(controller.listState).toEqual(controller.listStates.searching);
      });
    });

    describe('initialized', function () {

      beforeEach(function () {
        $scope.$apply();
      });

      describe('listState', function () {

        it('should be in bigorg state', function () {
          expect(controller.listState).toEqual(controller.listStates.bigorg);
        });

        beforeEach(function () {
          $scope.$apply();
          $timeout.flush(10000);
        });

        describe('searched with short string', function () {

          it('should not search', function () {
            controller.setCurrentSearch("a");
            $timeout.flush(10000);
            expect(controller.listState).toEqual(controller.listStates.bigorg);
          });
        });

        describe('searched with long string', function () {

          var searchPart1 = accounts[Object.keys(accounts)[1]].displayName.substr(0, 3);
          var searchPart2 = accounts[Object.keys(accounts)[1]].displayName.substr(3, 2);

          beforeEach(function () {
            controller.setCurrentSearch(searchPart1);
          });

          describe('searching', function () {
            beforeEach(function () {
              spyOn(CsdmDataModelService, 'getSearchPlacesMap').and.returnValue({
                then: function () {
                },
              });
            });

            it('should search', function () {

              $timeout.flush(10000);
              expect(controller.listState).toEqual(controller.listStates.searching);
            });
          });

          describe('with places', function () {

            beforeEach(function () {
              spyOn(CsdmDataModelService, 'getSearchPlacesMap').and.returnValue($q.resolve(accounts));
              $scope.$apply();
              $timeout.flush(10000);
            });

            describe('listState', function () {

              it('should be in showresult state', function () {
                expect(controller.listState).toEqual(controller.listStates.showresult);
              });

              it('should be in emptyresult state if next search is client-side with no matches', function () {
                controller.setCurrentSearch(searchPart1 + "sdfdsfds");
                $timeout.flush(10000);
                expect(controller.listState).toEqual(controller.listStates.emptyresult);
              });

              it('should be in showresult state if next search is client-side with matches', function () {
                controller.setCurrentSearch(searchPart1 + searchPart2);
                $timeout.flush(10000);
                expect(controller.listState).toEqual(controller.listStates.showresult);
              });

              it('should be in bigorg state if next search is too narrow', function () {
                controller.setCurrentSearch('a');
                $timeout.flush(10000);
                expect(controller.listState).toEqual(controller.listStates.bigorg);
              });
            });
          });

          describe('without places', function () {
            beforeEach(function () {
              spyOn(CsdmDataModelService, 'getSearchPlacesMap').and.returnValue($q.resolve({}));
              $scope.$apply();
              $timeout.flush(10000);
            });

            describe('listState', function () {
              it('should be in emptyresult state', function () {
                expect(controller.listState).toEqual(controller.listStates.emptyresult);
              });
            });
          });
        });
      });
    });
  });

  describe('not bigOrg', function () {
    beforeEach(function () {
      spyOn(CsdmDataModelService, 'isBigOrg').and.returnValue($q.resolve(false));
    });

    beforeEach(initController);

    describe('init', function () {

      it('should init controller', function () {
        expect(controller).toBeDefined();
      });

      it('should be in searching state', function () {
        expect(controller.listState).toEqual(controller.listStates.searching);
      });
    });

    describe('initialized with places', function () {

      beforeEach(function () {
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve(accounts));
        $scope.$apply();
        $timeout.flush(10000);
      });

      describe('listState', function () {

        it('should be in showresult state', function () {
          expect(controller.listState).toEqual(controller.listStates.showresult);
        });

        it('should be in emptyresult state if search with no matches', function () {
          controller.setCurrentSearch("aasdfefsdfdsf");
          $timeout.flush(10000);
          expect(controller.listState).toEqual(controller.listStates.emptyresult);
        });

        it('should be in showresult state if search with matches', function () {
          controller.setCurrentSearch(accounts[Object.keys(accounts)[1]].displayName);
          $timeout.flush(10000);
          expect(controller.listState).toEqual(controller.listStates.showresult);
        });
      });
    });

    describe('initialized without places', function () {
      beforeEach(function () {
        spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve({}));
        $scope.$apply();
        $timeout.flush(10000);
      });

      describe('listState', function () {
        it('should be in noplaces state', function () {
          expect(controller.listState).toEqual(controller.listStates.noplaces);
        });
      });

      describe('startAddPlaceFlow function', function () {
        var userCisUuid;
        var email;
        var orgId;
        var adminFirstName;
        var adminLastName;
        var adminDisplayName;
        var adminUserName;
        var adminCisUuid;
        var adminOrgId;
        var isEntitledToHuron;
        var isEntitledToRoomSystem;
        beforeEach(function () {
          isEntitledToHuron = true;
          isEntitledToRoomSystem = true;
          userCisUuid = 'userCisUuid';
          email = 'email@address.com';
          orgId = 'orgId';
          adminFirstName = 'adminFirstName';
          adminLastName = 'adminLastName';
          adminDisplayName = 'adminDisplayName';
          adminUserName = 'adminUserName';
          adminCisUuid = 'adminCisUuid';
          adminOrgId = 'adminOrgId';
          controller.showATA = true;
          controller.adminUserDetails = {
            firstName: adminFirstName,
            lastName: adminLastName,
            displayName: adminDisplayName,
            userName: adminUserName,
            cisUuid: adminCisUuid,
            organizationId: adminOrgId,
          };
          spyOn(controller, 'isOrgEntitledToHuron').and.returnValue(isEntitledToHuron);
          spyOn(Authinfo, 'isDeviceMgmt').and.returnValue(isEntitledToRoomSystem);
          spyOn(Authinfo, 'getUserId').and.returnValue(userCisUuid);
          spyOn(Authinfo, 'getPrimaryEmail').and.returnValue(email);
          spyOn(Authinfo, 'getOrgId').and.returnValue(orgId);
          spyOn($state, 'go');
          controller.startAddPlaceFlow();
          $scope.$apply();
        });

        it('should set the wizardState with correct fields for the wizard', function () {
          expect($state.go).toHaveBeenCalled();
          var wizardState = $state.go.calls.mostRecent().args[1].wizard.state().data;
          expect(wizardState.title).toBe('addDeviceWizard.newSharedSpace.title');
          expect(wizardState.function).toBe('addPlace');
          expect(wizardState.showATA).toBe(true);
          expect(wizardState.atlasHerculesGoogleCalendarFeatureToggle).toBe(true);
          expect(wizardState.csdmHybridCalendarFeature).toBe(true);
          expect(wizardState.csdmHybridCallFeature).toBe(true);
          expect(wizardState.admin.firstName).toBe(adminFirstName);
          expect(wizardState.admin.lastName).toBe(adminLastName);
          expect(wizardState.admin.displayName).toBe(adminDisplayName);
          expect(wizardState.admin.userName).toBe(adminUserName);
          expect(wizardState.admin.cisUuid).toBe(adminCisUuid);
          expect(wizardState.admin.organizationId).toBe(adminOrgId);
          expect(wizardState.isEntitledToHuron).toBe(isEntitledToHuron);
          expect(wizardState.isEntitledToRoomSystem).toBe(isEntitledToRoomSystem);
          expect(wizardState.account.type).toBe('shared');
          expect(wizardState.account.organizationId).toBe(orgId);
          expect(wizardState.recipient.displayName).toBe(adminDisplayName);
          expect(wizardState.recipient.cisUuid).toBe(userCisUuid);
          expect(wizardState.recipient.email).toBe(email);
          expect(wizardState.recipient.organizationId).toBe(adminOrgId);
        });
      });
    });
  });
});
