var KeyCodes = require('modules/core/accessibility').KeyCodes;

describe('Controller: PlacesCtrl', function () {
  beforeEach(function () {
    this.initModules('Core', 'Squared');
    this.injectDependencies(
      '$controller',
      '$httpBackend',
      '$q',
      '$scope',
      '$state',
      '$timeout',
      'Authinfo',
      'CsdmDataModelService',
      'FeatureToggleService',
      'GridService',
      'RemPlaceModal',
      'ServiceDescriptorService',
      'Userservice'
    );

    this.accounts = getJSONFixture('squared/json/accounts.json');
    this.url = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/places/?type=all&query=xy';

    spyOn(this.GridService, 'selectRow');
    spyOn(this.Userservice, 'getUser');
    spyOn(this.$state, 'go');
    spyOn(this.RemPlaceModal, 'open');
    spyOn(this.FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.ServiceDescriptorService, 'getServices').and.returnValue(this.$q.resolve([]));
    spyOn(this.CsdmDataModelService, 'subscribeToChanges').and.returnValue(true);

    this.initController = function () {
      this.controller = this.$controller('PlacesCtrl', {
        $scope: this.$scope,
        $state: this.$state,
        $timeout: this.$timeout,
        CsdmDataModelService: this.CsdmDataModelService,
      });
    };
  });

  describe('bigOrg', function () {
    beforeEach(function () {
      spyOn(this.CsdmDataModelService, 'isBigOrg').and.returnValue(this.$q.resolve(true));
      this.$httpBackend.whenGET(this.url).respond(this.$q.reject({ status: 502 }));
      this.initController();
    });

    describe('init', function () {
      it('should init controller', function () {
        expect(this.controller).toBeDefined();
        expect(this.controller.filteredView).toBeDefined();
      });

      it('should be in initializing state', function () {
        expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.initializing);
      });
    });

    describe('initialized', function () {
      beforeEach(function () {
        this.$scope.$apply();
      });

      describe('grid functions', function () {
        beforeEach(function () {
          this.entity = { place: 'place' };
          this.placeOverview = 'place-overview';
          this.event = {
            keyCode: KeyCodes.ENTER,
            stopPropagation: jasmine.createSpy('stopPropagation'),
          };
        });

        it('deletePlace should call RemPlaceModal.open', function () {
          this.controller.deletePlace(this.event, this.entity);
          expect(this.event.stopPropagation).toHaveBeenCalled();
          expect(this.RemPlaceModal.open).toHaveBeenCalledWith(this.entity);
        });

        it('keyboardDeletePlace should call deletePlace when keyCode is Enter or Space', function () {
          this.controller.keyboardDeletePlace(this.event, this.entity);
          expect(this.event.stopPropagation).toHaveBeenCalled();
          expect(this.RemPlaceModal.open).toHaveBeenCalledWith(this.entity);
        });

        it('keyboardDeletePlace should not call deletePlace when keyCode is not Enter or Space', function () {
          this.event.keyCode = 0;
          this.controller.keyboardDeletePlace(this.event, this.entity);
          expect(this.event.stopPropagation).toHaveBeenCalled();
          expect(this.RemPlaceModal.open).not.toHaveBeenCalled();
        });

        it('showPlaceDetails should set the currentPlace', function () {
          this.controller.showPlaceDetails(this.entity);
          expect(this.controller.currentPlace).toEqual(this.entity);
          expect(this.$state.go).toHaveBeenCalledWith(this.placeOverview, {
            currentPlace: this.entity,
          });
        });

        it('selectRow should call showPlaceDetails and GridService.selectRow', function () {
          this.controller.selectRow({}, { entity: this.entity });
          expect(this.GridService.selectRow).toHaveBeenCalled();
          expect(this.controller.currentPlace).toEqual(this.entity);
          expect(this.$state.go).toHaveBeenCalledWith(this.placeOverview, {
            currentPlace: this.entity,
          });
        });
      });

      describe('listState', function () {
        beforeEach(function () {
          this.$scope.$apply();
          this.$timeout.flush(10000);
        });

        it('should be in searchonly state', function () {
          expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.searchonly);
        });

        it('with short string should not search', function () {
          expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.searchonly);
          this.controller.filteredView.setCurrentSearch('a');
          this.$timeout.flush(10000);
          expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.searchonly);
        });

        describe('searched with long string', function () {
          beforeEach(function () {
            this.searchPart1 = this.accounts[Object.keys(this.accounts)[1]].displayName.substr(0, 3);
            this.searchPart2 = this.accounts[Object.keys(this.accounts)[1]].displayName.substr(3, 2);

            this.controller.filteredView.setCurrentSearch(this.searchPart1);
          });

          it('should search', function () {
            spyOn(this.CsdmDataModelService, 'getSearchPlacesMap').and.returnValue({ then: _.noop });
            this.$timeout.flush(10000);
            expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.searching);
          });

          describe('listState', function () {
            beforeEach(function () {
              spyOn(this.CsdmDataModelService, 'getSearchPlacesMap').and.returnValue(this.$q.resolve(this.accounts));
              this.$scope.$apply();
              this.$timeout.flush(10000);
            });

            it('should be in showresult state', function () {
              expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.showresult);
            });

            it('should be in emptysearchresult state if next search is client-side with no matches', function () {
              this.controller.filteredView.setCurrentSearch(this.searchPart1 + 'sdfdsfds');
              this.$timeout.flush(10000);
              expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.emptysearchresult);
            });

            it('should be in showresult state if next search is client-side with matches', function () {
              this.controller.filteredView.setCurrentSearch(this.searchPart1 + this.searchPart2);
              this.$timeout.flush(10000);
              expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.showresult);
            });

            it('should be in searchonly state if next search is too narrow', function () {
              this.controller.filteredView.setCurrentSearch('a');
              this.$timeout.flush(10000);
              expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.searchonly);
            });
          });

          describe('without places', function () {
            beforeEach(function () {
              spyOn(this.CsdmDataModelService, 'getSearchPlacesMap').and.returnValue(this.$q.resolve({}));
              this.$scope.$apply();
              this.$timeout.flush(10000);
            });

            describe('listState', function () {
              it('should be in emptysearchresult state', function () {
                expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.emptysearchresult);
              });
            });
          });
        });
      });
    });
  });

  describe('not bigOrg', function () {
    beforeEach(function () {
      spyOn(this.CsdmDataModelService, 'isBigOrg').and.returnValue(this.$q.resolve(false));
      this.$httpBackend.whenGET(this.url).respond(this.$q.resolve({}));
      this.initController();
    });

    describe('init', function () {
      it('should init controller', function () {
        expect(this.controller).toBeDefined();
        expect(this.controller.filteredView).toBeDefined();
      });

      it('should be in searching state', function () {
        expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.initializing);
      });
    });

    describe('listState', function () {
      beforeEach(function () {
        spyOn(this.CsdmDataModelService, 'getPlacesMap').and.returnValue(this.$q.resolve(this.accounts));
        this.$scope.$apply();
        this.$timeout.flush(10000);
      });

      it('should be in showresult state', function () {
        expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.showresult);
      });

      it('should be in emptysearchresult state if search with no matches', function () {
        this.controller.filteredView.setCurrentSearch('aasdfefsdfdsf');
        this.$timeout.flush(10000);
        expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.emptysearchresult);
      });

      it('should be in showresult state if search with matches', function () {
        this.controller.filteredView.setCurrentSearch(this.accounts[Object.keys(this.accounts)[1]].displayName);
        this.$timeout.flush(10000);
        expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.showresult);
      });
    });

    describe('initialized without places', function () {
      beforeEach(function () {
        spyOn(this.CsdmDataModelService, 'getPlacesMap').and.returnValue(this.$q.resolve({}));
        this.$scope.$apply();
        this.$timeout.flush(10000);
      });

      it('listState should be in emptydatasource state', function () {
        expect(this.controller.filteredView.listState).toEqual(this.controller.filteredView.emptydatasource);
      });

      describe('startAddPlaceFlow function', function () {
        beforeEach(function () {
          this.isEntitledToHuron = true;
          this.isEntitledToRoomSystem = true;
          this.userCisUuid = 'userCisUuid';
          this.email = 'email@address.com';
          this.orgId = 'orgId';
          this.adminFirstName = 'adminFirstName';
          this.adminLastName = 'adminLastName';
          this.adminDisplayName = 'adminDisplayName';
          this.adminUserName = 'adminUserName';
          this.adminCisUuid = 'adminCisUuid';
          this.adminOrgId = 'adminOrgId';
          this.controller.adminUserDetails = {
            firstName: this.adminFirstName,
            lastName: this.adminLastName,
            displayName: this.adminDisplayName,
            userName: this.adminUserName,
            cisUuid: this.adminCisUuid,
            organizationId: this.adminOrgId,
          };
          spyOn(this.controller, 'isOrgEntitledToHuron').and.returnValue(this.isEntitledToHuron);
          spyOn(this.Authinfo, 'isDeviceMgmt').and.returnValue(this.isEntitledToRoomSystem);
          spyOn(this.Authinfo, 'getUserId').and.returnValue(this.userCisUuid);
          spyOn(this.Authinfo, 'getPrimaryEmail').and.returnValue(this.email);
          spyOn(this.Authinfo, 'getOrgId').and.returnValue(this.orgId);
          this.controller.startAddPlaceFlow();
          this.$scope.$apply();
        });

        it('should set the wizardState with correct fields for the wizard', function () {
          expect(this.$state.go).toHaveBeenCalled();
          var wizardState = this.$state.go.calls.mostRecent().args[1].wizard.state().data;
          expect(wizardState.title).toBe('addDeviceWizard.newSharedSpace.title');
          expect(wizardState.function).toBe('addPlace');
          expect(wizardState.csdmHybridCallFeature).toBe(true);
          expect(wizardState.admin.firstName).toBe(this.adminFirstName);
          expect(wizardState.admin.lastName).toBe(this.adminLastName);
          expect(wizardState.admin.displayName).toBe(this.adminDisplayName);
          expect(wizardState.admin.userName).toBe(this.adminUserName);
          expect(wizardState.admin.cisUuid).toBe(this.adminCisUuid);
          expect(wizardState.admin.organizationId).toBe(this.adminOrgId);
          expect(wizardState.isEntitledToHuron).toBe(this.isEntitledToHuron);
          expect(wizardState.isEntitledToRoomSystem).toBe(this.isEntitledToRoomSystem);
          expect(wizardState.account.type).toBe('shared');
          expect(wizardState.account.organizationId).toBe(this.orgId);
          expect(wizardState.recipient.displayName).toBe(this.adminDisplayName);
          expect(wizardState.recipient.cisUuid).toBe(this.userCisUuid);
          expect(wizardState.recipient.email).toBe(this.email);
          expect(wizardState.recipient.organizationId).toBe(this.adminOrgId);
        });
      });
    });
  });
});
