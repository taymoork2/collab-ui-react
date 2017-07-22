import { ExternalLinkedAccountHelperService } from './external-acct-helper.service';

describe('ExternalLinkedAccountHelperService: get for save', () => {
  let test: { ExtLinkHelperService: ExternalLinkedAccountHelperService };
  beforeEach(angular.mock.module('Squared'));
  beforeEach(inject(function (ExtLinkHelperService) {
    test = this;
    test.ExtLinkHelperService = ExtLinkHelperService;
  }));

  afterEach(() => {

  });

  describe('with no ext links and no new', () => {
    it('should return a null object', () => {
      const result = test.ExtLinkHelperService.getExternalLinkedAccountForSave([], [], ['some entitlement']);
      expect(result).toBeNull();
    });
  });

  describe('with no extLinks, and one new', () => {
    let result;
    it('should add the new extLink to the list', () => {
      result = test.ExtLinkHelperService.getExternalLinkedAccountForSave([], [{
        providerID: 'squared-fusion-uc',
        accountGUID: 'test@example.com',
      }], []);
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].operation).toBeUndefined();
    });
  });

  describe('with extLinks, and no new', () => {
    let result;
    beforeEach(() => {
      result = test.ExtLinkHelperService.getExternalLinkedAccountForSave([{
        providerID: 'squared-fusion-uc',
        accountGUID: 'old@example.com',
      }], [], ['squared-fusion-uc']);
    });
    it('should not add existing link', () => {
      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });
  describe('with extLinks, and not part of entitlements', () => {
    let result;
    beforeEach(() => {
      result = test.ExtLinkHelperService.getExternalLinkedAccountForSave([{
        providerID: 'squared-fusion-uc',
        accountGUID: 'old@example.com',
      }], [], ['squared-fusion-cal']);
    });
    it('should clean out old existing link', () => {
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].operation).toBe('delete');
      expect(result[0].accountGUID).toBe('old@example.com');
    });
  });

  describe('with extLinks, and not part of entitlements', () => {
    let result;
    beforeEach(() => {
      result = test.ExtLinkHelperService.getExternalLinkedAccountForSave([{
        providerID: 'a-new-service',
        accountGUID: 'old@example.com',
      }], [], ['squared-fusion-uc']);
    });
    it('should not clean out old existing link which is not whitelisted for cleaning', () => {
      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('with extLinks, and one new', () => {
    let result;
    beforeEach(() => {
      result = test.ExtLinkHelperService.getExternalLinkedAccountForSave([{
        providerID: 'squared-fusion-uc',
        accountGUID: 'old@example.com',
      }], [{
        providerID: 'squared-fusion-uc',
        accountGUID: 'test@example.com',
      }], ['squared-fusion-uc']);
    });
    it('should add the new extLink to the list', () => {
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].operation).toBe('delete');
      expect(result[0].accountGUID).toBe('old@example.com');

      expect(result[1].operation).toBeUndefined();
    });

    it('should add the new extLink to the end of the list', () => {
      expect(result).toBeDefined();
      expect(result[1].accountGUID).toBe('test@example.com');
    });
  });

  describe('with extLinks, and one new but equal to existing', () => {
    let result;
    beforeEach(() => {
      result = test.ExtLinkHelperService.getExternalLinkedAccountForSave([{
        providerID: 'squared-fusion-uc',
        accountGUID: 'old@example.com',
      }], [{
        providerID: 'squared-fusion-uc',
        accountGUID: 'old@example.com',
      }], ['squared-fusion-uc']);
    });
    it('should return a null, no change', () => {
      expect(result).toBeNull();
    });
  });

  describe('with extLinks, and two new but one equal to existing', () => {
    let result;
    beforeEach(() => {
      result = test.ExtLinkHelperService.getExternalLinkedAccountForSave([{
        providerID: 'squared-fusion-uc',
        accountGUID: 'old@example.com',
      }], [{
        providerID: 'squared-fusion-uc',
        accountGUID: 'old@example.com',
      }, {
        providerID: 'squared-fusion-cal',
        accountGUID: 'cal@example.com',
      }], ['squared-fusion-uc', 'squared-fusion-cal']);
    });
    it('should return ext link with the one which is actually new', () => {
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].operation).toBeUndefined();
      expect(result[0].accountGUID).toBe('cal@example.com');
      expect(result[0].providerID).toBe('squared-fusion-cal');
    });
  });
});
