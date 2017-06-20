'use strict';

describe('Controller: PlacesCtrl', function () {
  var $scope, $controller, $state, $timeout, $q, controller, $httpBackend;
  var CsdmDataModelService, Userservice, Authinfo, FeatureToggleService, ServiceDescriptor;
  var accounts = getJSONFixture('squared/json/accounts.json');

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$httpBackend_, _$state_, _$timeout_, _$q_, _CsdmDataModelService_, _Userservice_, _Authinfo_, _FeatureToggleService_, _ServiceDescriptor_) {
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
    $httpBackend = _$httpBackend_;
  }

  function initSpies() {
    spyOn(Userservice, 'getUser');
    spyOn(FeatureToggleService, 'csdmATAGetStatus').and.returnValue($q.resolve());
    spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'csdmPlaceCalendarGetStatus').and.returnValue($q.resolve(true));
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

      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/places/?type=all&query=xy')
        .respond($q.reject({ status: 502 }));
    });

    beforeEach(initController);

    describe('init', function () {
      it('should init controller', function () {
        expect(controller).toBeDefined();
        expect(controller.filteredView).toBeDefined();
      });

      it('should be in initializing state', function () {
        expect(controller.filteredView.listState).toEqual(controller.filteredView.initializing);
      });
    });

    describe('initialized', function () {
      beforeEach(function () {
        $scope.$apply();
      });

      describe('listState', function () {
        it('should be in searchonly state', function () {
          expect(controller.filteredView.listState).toEqual(controller.filteredView.searchonly);
        });

        beforeEach(function () {
          $scope.$apply();
          $timeout.flush(10000);
        });

        describe('searched with short string', function () {
          it('should not search', function () {
            expect(controller.filteredView.listState).toEqual(controller.filteredView.searchonly);
            controller.filteredView.setCurrentSearch('a');
            $timeout.flush(10000);
            expect(controller.filteredView.listState).toEqual(controller.filteredView.searchonly);
          });
        });

        describe('searched with long string', function () {
          var searchPart1 = accounts[Object.keys(accounts)[1]].displayName.substr(0, 3);
          var searchPart2 = accounts[Object.keys(accounts)[1]].displayName.substr(3, 2);

          beforeEach(function () {
            controller.filteredView.setCurrentSearch(searchPart1);
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
              expect(controller.filteredView.listState).toEqual(controller.filteredView.searching);
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
                expect(controller.filteredView.listState).toEqual(controller.filteredView.showresult);
              });

              it('should be in emptysearchresult state if next search is client-side with no matches', function () {
                controller.filteredView.setCurrentSearch(searchPart1 + 'sdfdsfds');
                $timeout.flush(10000);
                expect(controller.filteredView.listState).toEqual(controller.filteredView.emptysearchresult);
              });

              it('should be in showresult state if next search is client-side with matches', function () {
                controller.filteredView.setCurrentSearch(searchPart1 + searchPart2);
                $timeout.flush(10000);
                expect(controller.filteredView.listState).toEqual(controller.filteredView.showresult);
              });

              it('should be in searchonly state if next search is too narrow', function () {
                controller.filteredView.setCurrentSearch('a');
                $timeout.flush(10000);
                expect(controller.filteredView.listState).toEqual(controller.filteredView.searchonly);
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
              it('should be in emptysearchresult state', function () {
                expect(controller.filteredView.listState).toEqual(controller.filteredView.emptysearchresult);
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
      $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/places/?type=all&query=xy')
        .respond($q.resolve({}));
    });

    beforeEach(initController);

    describe('init', function () {
      it('should init controller', function () {
        expect(controller).toBeDefined();
        expect(controller.filteredView).toBeDefined();
      });

      it('should be in searching state', function () {
        expect(controller.filteredView.listState).toEqual(controller.filteredView.initializing);
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
          expect(controller.filteredView.listState).toEqual(controller.filteredView.showresult);
        });

        it('should be in emptysearchresult state if search with no matches', function () {
          controller.filteredView.setCurrentSearch('aasdfefsdfdsf');
          $timeout.flush(10000);
          expect(controller.filteredView.listState).toEqual(controller.filteredView.emptysearchresult);
        });

        it('should be in showresult state if search with matches', function () {
          controller.filteredView.setCurrentSearch(accounts[Object.keys(accounts)[1]].displayName);
          $timeout.flush(10000);
          expect(controller.filteredView.listState).toEqual(controller.filteredView.showresult);
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
        it('should be in emptydatasource state', function () {
          expect(controller.filteredView.listState).toEqual(controller.filteredView.emptydatasource);
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
