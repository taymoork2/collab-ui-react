///<reference path="../../../../typings/tsd-testing.d.ts"/>
namespace domainManagement {
  declare let punycode:any;

  describe('DomainManagementAddCtrl', () => {

    let Config, $q, $rootScope, DomainManagmentAddCtrl, DomainManagementService = {
      addDomain: undefined,
      domainList: []
    };
    beforeEach(angular.mock.module('Core'));
    beforeEach(inject(($injector, _$q_, _$rootScope_, $controller, $translate, _Config_)=> {
      Config = _Config_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      DomainManagmentAddCtrl = $controller('DomainManageAddCtrl', {
        $stateParams: {loggedOnUser: ''},
        $previousState: {go: sinon.stub()},
        DomainManagementService: DomainManagementService,
        $translate: $translate
      });
    }));

    it('should have access to punycode.', ()=> {
      expect(punycode).not.toBeNull('punycode is undefined');
    });

    it('should encode IDN (top level and domain)', ()=> {
      let unEncoded = 'løv.no';
      let encoded = 'xn--lv-lka.no';
      DomainManagmentAddCtrl.domain = unEncoded;
      expect(DomainManagmentAddCtrl.encodedDomain).toBe(encoded);
    });
    it('should encode IDN (top level and domain)', ()=> {
      let unEncoded = 'Домены.бел';//remark: with uppercase д
      let encoded = 'xn--d1acufc5f.xn--90ais';
      DomainManagmentAddCtrl.domain = unEncoded;
      expect(DomainManagmentAddCtrl.encodedDomain).toBe(encoded);
    });

    it('should ignore UpperCase Domain names and treath them as valid', ()=> {
      let unEncoded = 'Test.com';
      let encoded = 'test.com';
      DomainManagmentAddCtrl.domain = unEncoded;
      expect(DomainManagmentAddCtrl.encodedDomain).toBe(encoded);
      expect(DomainManagmentAddCtrl.isValid).toBeTruthy();
      expect(DomainManagmentAddCtrl.intDomain).not.toBeNull();
      expect(DomainManagmentAddCtrl.intDomain.show).toBeFalsy('punycode should be qual to lowercase version of domain. e.g. no extra encoding');

    });

    it('should dissalow adding an existing domain', ()=> {
      let domain = 'alreadyadded.com';
      DomainManagementService.domainList = [{text: domain}];

      //type domain name.
      DomainManagmentAddCtrl.domain = domain;
      expect(DomainManagmentAddCtrl.isValid).toBeFalsy();
      expect(DomainManagmentAddCtrl.validate().error).toBe('domainManagement.add.invalidDomainAdded');
    });

    it('should dissalow adding an existing IDN', ()=> {
      let domain = 'Домены.бел';
      let encoded = 'xn--d1acufc5f.xn--90ais';
      DomainManagementService.domainList = [{text: encoded}];
      DomainManagmentAddCtrl.domain = domain;
      expect(DomainManagmentAddCtrl.isValid).toBeFalsy();
      expect(DomainManagmentAddCtrl.validate().error).toBe('domainManagement.add.invalidDomainAdded');
    });

    it('should add the given domain using addDomain on the service', ()=> {
      DomainManagementService.addDomain = sinon.stub().returns(
        $q.resolve());


      let unEncoded = 'test.com';
      //let encoded = 'test.com';
      DomainManagmentAddCtrl.domain = unEncoded;
      DomainManagmentAddCtrl.add();
      $rootScope.$digest();
      expect(DomainManagementService.addDomain.callCount).toBe(1);
    });

    it('should set error if addDomain on the service fails', ()=> {
      DomainManagementService.addDomain = sinon.stub().returns(
        $q.reject('error-during-add'));


      let unEncoded = 'test.com';
      //let encoded = 'test.com';
      DomainManagmentAddCtrl.domain = unEncoded;
      DomainManagmentAddCtrl.add();
      $rootScope.$digest();
      expect(DomainManagementService.addDomain.callCount).toBe(1);
      expect(DomainManagmentAddCtrl.error).toBe('error-during-add');
    });


  });
}
