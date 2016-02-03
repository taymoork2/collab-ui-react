///<reference path="../../../../typings/tsd-testing.d.ts"/>
namespace domainManagement {
  declare let punycode:any;

  describe('DomainManagementAddCtrl', () => {

    let Config, DomainManagmentAddCtrl, DomainManagementService = {domainList: []};
    beforeEach(angular.mock.module('Core'));
    beforeEach(inject(($injector, $controller, $translate, _Config_)=> {
      Config = _Config_;
      DomainManagmentAddCtrl = $controller('DomainManageAddCtrl', {
        $stateParams: {loggedOnUser: ''},
        $previousState: null,
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


  });
}
