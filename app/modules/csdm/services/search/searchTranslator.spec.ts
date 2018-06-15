import searchModule from '../index';
import { SearchTranslator } from './searchTranslator';
import { QueryParser } from './queryParser';
import { isNull, isUndefined } from 'util';
import { OperatorOr, SearchElement } from './searchElement';

const keyMock = {
  'CsdmStatus.connectionStatus.CONNECTED': 'Online',
  'CsdmStatus.connectionStatus.CONNECTED_WITH_ISSUES': 'Online, med problemer',
  'CsdmStatus.connectionStatus.DISCONNECTED': 'Ikke pålogget',
  'CsdmStatus.connectionStatus.OFFLINE_EXPIRED': 'Deaktivert',
  'CsdmStatus.WithDevices': 'Med enheter',
  'CsdmStatus.upgradeChannels.Specialcharone': '在线',
  'CsdmStatus.upgradeChannels.Stable': 'Stabil',
  'CsdmStatus.upgradeChannels.Stable_Preview': 'Stable Preview',
  'CsdmStatus.upgradeChannels.Latest': 'Siste',
  'CsdmStatus.upgradeChannels.Beta': 'Beta',
  'CsdmStatus.upgradeChannels.Preview': 'Forhåndsvisning',
  'CsdmStatus.activeInterface.lan': 'Kablet',
  'CsdmStatus.activeInterface.wlan': 'Trådløst',
  'CsdmStatus.activeInterface.wlan2': 'translated.CsdmStatus.activeInterface.wlan2',
  'CsdmStatus.errorCodes.mediaprotocol.type': 'Nettverksporter blokkert',
  'CsdmStatus.errorCodes.mediaprotocol.message': 'En brannmur kan blokkere media på UDP. Samtalekvalitet kan være redusert. For informasjon om krav til nettverksporter, se artikkelen <a href=\'https://support.ciscospark.com/customer/portal/articles/1911657\' class=\'issue-link\'>Brannmurer og nettverkskrav for Cisco Spark App</a>.',
  'CsdmStatus.errorCodes.tcpmediafallback.type': 'Nettverksporter blokkert',
  'CsdmStatus.errorCodes.tcpmediafallback.message': 'En brannmur kan blokkere media på UDP. Samtalekvalitet kan være redusert. For informasjon om krav til nettverksporter, se artikkelen <a href=\'https://support.ciscospark.com/customer/portal/articles/1911657\' class=\'issue-link\'>Brannmurer og nettverkskrav for Cisco Spark App</a>.',
  'CsdmStatus.errorCodes.mediablockingdetected.type': 'Nettverksporter blokkert',
  'CsdmStatus.errorCodes.mediablockingdetected.message': 'En brannmur kan blokkere media på UDP og TCP. Samtalekvalitet kan være redusert. For informasjon om krav til nettverksporter, se artikkelen <a href=\'https://support.ciscospark.com/customer/portal/articles/1911657\' class=\'issue-link\'>Brannmurer og nettverkskrav for Cisco Spark App</a>.',
  'CsdmStatus.errorCodes.temperaturecheck.type': 'Høy temperatur',
  'CsdmStatus.errorCodes.temperaturecheck.message': 'Systemtemperaturen er for høy.',
  'CsdmStatus.errorCodes.osdvideooutput.type': 'Hovedskjerm ikke funnet',
  'CsdmStatus.errorCodes.osdvideooutput.message': 'Sjekk at hovedskjermen er påslått og tilkoblet rett skjermport på videosystemet.',
  'CsdmStatus.errorCodes.noupgrade.type': 'Automatiske oppdateringer deaktivert',
  'CsdmStatus.errorCodes.noupgrade.message': 'Systemprogramvaren vil ikke bli oppdatert.',
  'CsdmStatus.errorCodes.ntpstatus.type': 'Tidsserver kan ikke nås',
  'CsdmStatus.errorCodes.ntpstatus.message': 'Koblingen til en NTP-server kunne ikke etableres. Tiden som vises på endepunktet kan være feil.',
  'CsdmStatus.errorCodes.audiopairinginterference.type': 'Signalforstyrrelser fra andre enheter',
  'CsdmStatus.errorCodes.audiopairinginterference.message': 'Det er ultralyd signalforstyrrelse i dette rommet fra andre enheter (f.eks. andre videosystemer) som kan forhindre paring mellom videosystemet og din telefon eller bærbare PC.',
  'CsdmStatus.errorCodes.ecreferencedelay.type': 'Lydforsinkelse',
  'CsdmStatus.errorCodes.ecreferencedelay.message': 'Skjerminnstillingene dine fører til en forsinkelse av lyden. Juster skjerminnstillingene dine til en passende modus (f.eks. spillemodus).',
  'CsdmStatus.errorCodes.ultrasoundspeakeravailability.type': 'Ingen innebygget ultralyd-høyttaler',
  'CsdmStatus.errorCodes.ultrasoundspeakeravailability.message': 'Denne maskinvareversjonen av SX10 har ikke en innebygget ultralyd-høyttaler.',
  'CsdmStatus.errorCodes.missingencryptionkey.type': 'Mangler krypteringsalternativnøkkel',
  'CsdmStatus.errorCodes.missingencryptionkey.message': 'Legg til en krypteringsalternativnøkkel.',
  'CsdmStatus.errorCodes.configuredfortestautomation.type': 'Konfigurert for testautomatisering',
  'CsdmStatus.errorCodes.configuredfortestautomation.message': 'Metrikk- og loggrapportering påvirkes.',
  'CsdmStatus.errorCodes.touchpanelconnection.type': 'Berøringsskjerm nødvendig',
  'CsdmStatus.errorCodes.touchpanelconnection.message': 'Det er ingen berøringsskjerm tilkoblet rom-enheten. Sjekk kabelen som kobler berøringsskjermen til rom-enheten.',
  'CsdmStatus.errorCodes.provisioningdeveloperoptions.type': 'Oppgradering blokkert ',
  'CsdmStatus.errorCodes.provisioningdeveloperoptions.message': 'Dette systemet har blitt konfigurert til å ikke oppgradere automatisk.',
  'CsdmStatus.errorCodes.networkquality.type': 'Pakketap oppdaget',
  'CsdmStatus.errorCodes.networkquality.message': 'I løpet av den forrige samtalen oppdaget vi et nivå av pakketap som kan ha påvirket samtalekvaliteten. Pakketap forårsakes vanligvis av nettverksblokkering.',
  'CsdmStatus.errorCodes.unknown.type': 'En ukjent feil oppsto',
  'CsdmStatus.errorCodes.unknown.message': 'Enheten rapporterte en ukjent feil, og ingen beskrivelse er tilgjengelig. Feilkoden er: {{errorCode}}',
  'CsdmStatus.errorCodes.unknown.message_with_description': 'Enheten rapporterte en ukjent feil. Feilkoden er: {{errorCode}}. Beskrivelse: {{description}}',
  'common.unknown': 'Ukjent',
};

describe('SearchTranslator', () => {
  let transMock, missingTrans;

  beforeEach(function () {
    this.initModules(searchModule);
    this.injectDependencies('$translate');
    transMock = this.$translate;
    missingTrans = () => 'missing trans...';
    spyOn(this.$translate, 'getTranslationTable').and.returnValue(keyMock);
    spyOn(this.$translate, 'proposedLanguage').and.returnValue('nb_NO');
  });

  afterEach(() => {
    transMock = null;
  });

  describe('findTranslations', () => {

    it('should map correct search field', function () {
      expect('upgradechannel').toEqual(SearchTranslator.getSearchField('CsdmStatus.upgradeChannels.Preview'));
      expect('errorcodes').toEqual(SearchTranslator.getSearchField('CsdmStatus.errorCodes.TouchPanelConnection.message'));
      expect('connectionstatus').toEqual(SearchTranslator.getSearchField('CsdmStatus.connectionStatus.DISCONNECTED'));
      expect('upgradechannel').toEqual(SearchTranslator.getSearchField('CsdmStatus.upgradeChannels.Preview'));
      expect(SearchTranslator.getSearchField('Csdm.The.unknown.thing')).toBeUndefined();
    });

    it('should map correct translation key prefix', function () {
      expect('CsdmStatus.upgradeChannels.').toEqual(SearchTranslator.getFieldTranslationKeyPrefix('upgradechannel'));
      expect('CsdmStatus.errorCodes.').toEqual(SearchTranslator.getFieldTranslationKeyPrefix('errorcodes'));
      expect('CsdmStatus.connectionStatus.').toEqual(SearchTranslator.getFieldTranslationKeyPrefix('connectionstatus'));
      expect('CsdmStatus.upgradeChannels.').toEqual(SearchTranslator.getFieldTranslationKeyPrefix('upgradechannel'));
      expect(SearchTranslator.getFieldTranslationKeyPrefix('madeupfield')).toBeUndefined();
    });

    it('should translate single term', function () {
      expectQueryToFindTranslation('krypteringsalternativnøkkel', 'errorcodes=missingencryptionkey');
      expectQueryToFindTranslation('oppgradere automatisk', 'errorcodes=provisioningdeveloperoptions');
      expectQueryToFindTranslation('Online, med problemer', 'connectionstatus=CONNECTED_WITH_ISSUES');
      expectQueryToFindTranslation('Deaktivert', 'connectionstatus=OFFLINE_EXPIRED or errorcodes=noupgrade');
      expectQueryToFindTranslation('Forhåndsvisning', 'upgradechannel=Preview');
      expectQueryToFindTranslation('Trådløst', 'activeinterface=wlan');
      expectQueryToFindTranslation('在线', 'upgradechannel=Specialcharone');
      expectQueryToFindTranslation('Med enheter', null);
    });

    it('should translate an incomplete single term', function () {
      expectQueryToFindTranslation('krypteringsalternativnø', 'errorcodes=missingencryptionkey');
      expectQueryToFindTranslation('Online, med problem', 'connectionstatus=CONNECTED_WITH_ISSUES');
      expectQueryToFindTranslation('Deaktiver', 'connectionstatus=OFFLINE_EXPIRED or errorcodes=noupgrade');
      expectQueryToFindTranslation('Forhåndsvisni', 'upgradechannel=Preview');
      expectQueryToFindTranslation('Trådløs', 'activeinterface=wlan');
    });

    it('should translate single phrase', function () {
      expectQueryToFindTranslation('"innebygget ultralyd-høyttaler"', 'errorcodes=ultrasoundspeakeravailability');
    });

    it('should not translate incorrect single phrase', function () {
      expectQueryToFindTranslation('"ultralyd-høyttaler innebygget"', null);
    });

    it('should not translate too wide searches', function () {
      expectQueryToFindTranslation('a', null);
      expectQueryToFindTranslation('Deaktiver', null, 1);
    });

    it('should translate an all expressions match', function () {
      expectQueryToFindTranslation('innebygget ultralyd-høyttaler', 'errorcodes=ultrasoundspeakeravailability');
    });

    it('should translate single field term', function () {
      expectQueryToFindTranslation('errorCodes:krypteringsalternativnøkkel', 'errorcodes=missingencryptionkey');
    });

    it('should not translate single field term matching only error key', function () {
      expectQueryToFindTranslation('errorCodes:MissingEncrypti', null);
    });

    it('should not translate single field term matching only error key', function () {
      expectQueryToFindTranslation('errorCodes:MissingEncrypti', null);
    });

    function expectQueryToFindTranslation(query: string, expectedQuery: string | null, maxResult: number = 2) {
      const searchTranslator = new SearchTranslator(transMock, missingTrans);
      const parsedQuery = new QueryParser(searchTranslator).parseQueryString(query);
      const translatedQueries = searchTranslator.findTranslations(parsedQuery, maxResult);

      if (isNull(expectedQuery)) {
        if (translatedQueries.length > 0) {
          expect(new OperatorOr(translatedQueries).toQuery()).toBeNull();
        }
        expect(translatedQueries.length).toBe(0);
      } else {
        expect(translatedQueries.length).toBeGreaterThanOrEqual(1);
        let res: SearchElement;
        if (translatedQueries.length > 1) {
          res = new OperatorOr(translatedQueries);
        } else {
          res = translatedQueries[0];
        }

        expect(expectedQuery).toBe(res.toQuery());
      }
    }
  });

  describe('translateQuery', () => {

    it('should translate single term', function () {
      expectQueryToTranslateTo('krypteringsalternativnøkkel', 'krypteringsalternativnøkkel or errorcodes=missingencryptionkey');
      expectQueryToTranslateTo('Online, med problemer', '(online, and med and problemer) or connectionstatus=CONNECTED_WITH_ISSUES');
      expectQueryToTranslateTo('Deaktivert', 'deaktivert or connectionstatus=OFFLINE_EXPIRED or errorcodes=noupgrade');
      expectQueryToTranslateTo('Forhåndsvisning', 'forhåndsvisning or upgradechannel=Preview');
      expectQueryToTranslateTo('Trådløst', 'trådløst or activeinterface=wlan');
      expectQueryToTranslateTo('在线', '在线 or upgradechannel=Specialcharone');
      expectQueryToTranslateTo('MedX enheterX', 'medx and enheterx');
      expectQueryToTranslateTo('"Med enheter"', '"med enheter"');
    });

    it('should translate multiple terms', function () {
      expectQueryToTranslateTo('krypteringsalternativnøkkel sx10x1', '(krypteringsalternativnøkkel or errorcodes=missingencryptionkey) and sx10x1');
      expectQueryToTranslateTo('sx10X1 krypteringsalternativnøkkel', 'sx10x1 and (krypteringsalternativnøkkel or errorcodes=missingencryptionkey)');
      expectQueryToTranslateTo('sx10X2 "innebygget ultralyd-høyttaler"', 'sx10x2 and ("innebygget ultralyd-høyttaler" or errorcodes=ultrasoundspeakeravailability)');
      expectQueryToTranslateTo('"innebygget ultralyd-høyttaler" sx10X ', '("innebygget ultralyd-høyttaler" or errorcodes=ultrasoundspeakeravailability) and sx10x');
      expectQueryToTranslateTo('sx10X3 innebygget ultralyd-høyttaler', 'sx10x3 and ((innebygget and ultralyd-høyttaler) or errorcodes=ultrasoundspeakeravailability)');
      expectQueryToTranslateTo('innebygget ultralyd-høyttaler sx10X ', '((innebygget and ultralyd-høyttaler) or errorcodes=ultrasoundspeakeravailability) and sx10x');
      expectQueryToTranslateTo('Nettverksporter blokkert', '(nettverksporter and blokkert) or errorcodes=mediaprotocol or errorcodes=tcpmediafallback or errorcodes=mediablockingdetected');
      expectQueryToTranslateTo('"Nettverksporter blokkert"', '"nettverksporter blokkert" or errorcodes=mediaprotocol or errorcodes=tcpmediafallback or errorcodes=mediablockingdetected');
    });

    it('should translate multiple terms ored', function () {
      expectQueryToTranslateTo('krypteringsalternativnøkkel or "innebygget ultralyd-høyttaler"', '(krypteringsalternativnøkkel or errorcodes=missingencryptionkey) or ("innebygget ultralyd-høyttaler" or errorcodes=ultrasoundspeakeravailability)');
    });

    it('should translate multiple terms anded', function () {
      expectQueryToTranslateTo('krypteringsalternativnøkkel and "innebygget ultralyd-høyttaler"', '(krypteringsalternativnøkkel or errorcodes=missingencryptionkey) and ("innebygget ultralyd-høyttaler" or errorcodes=ultrasoundspeakeravailability)');
    });

    it('should expectQueryToTranslateTo an partial expression match', function () {
      expectQueryToTranslateTo('med problemer sx20', '((med and problemer) or connectionstatus=CONNECTED_WITH_ISSUES) and sx20');
    });

    it('should translate an partial expression match with no match before', function () {
      expectQueryToTranslateTo('sx20 med problemer', 'sx20 and ((med and problemer) or connectionstatus=CONNECTED_WITH_ISSUES)');
    });

    it('should translate an partial expression match with no match before', function () {
      expectQueryToTranslateTo('"spark board" deaktivert 70', '"spark board" and (deaktivert or connectionstatus=OFFLINE_EXPIRED or errorcodes=noupgrade) and 70');
    });

    it('should allow for parenthesis', function () {
      expectQueryToTranslateTo('(med problemer) AND (sxx or 88)', '((med and problemer) or connectionstatus=CONNECTED_WITH_ISSUES) and (sxx or 88)');
    });

    function expectQueryToTranslateTo(query: string, expectedQuery: string | null) {
      const searchTranslator = new SearchTranslator(transMock, missingTrans);
      const parsedQuery = new QueryParser(searchTranslator).parseQueryString(query);
      const translatedQuery = searchTranslator.translateQuery(parsedQuery);
      expect(_.toLower(translatedQuery.toQuery())).toBe(_.toLower(expectedQuery || ''));
    }
  });

  describe('translateQueryField', () => {

    beforeEach(function () {
      spyOn(transMock, 'instant').and.callFake(key => 'translated.' + key);
    });

    it('should translate all supported search fields', function () {
      expectFieldToTranslateTo('displayname', 'translated.spacespage.nameheader');
      expectFieldToTranslateTo('cisuuid', 'cisuuid');
      expectFieldToTranslateTo('accounttype', 'accounttype');
      expectFieldToTranslateTo('activeinterface', 'translated.deviceoverviewpage.networkconnectivity');
      expectFieldToTranslateTo('serial', 'translated.deviceoverviewpage.serial');
      expectFieldToTranslateTo('mac', 'translated.deviceoverviewpage.macaddr');
      expectFieldToTranslateTo('ip', 'translated.deviceoverviewpage.ipaddr');
      expectFieldToTranslateTo('description', 'description');
      expectFieldToTranslateTo('productfamily', 'productfamily');
      expectFieldToTranslateTo('software', 'translated.deviceoverviewpage.software');
      expectFieldToTranslateTo('upgradechannel', 'translated.devicesettings.softwareupgradechannel');
      expectFieldToTranslateTo('product', 'translated.spacespage.typeheader');
      expectFieldToTranslateTo('connectionstatus', 'translated.spacespage.statusheader');
      expectFieldToTranslateTo('sipurl', 'translated.deviceoverviewpage.sipurl');
      expectFieldToTranslateTo('errorcodes', 'translated.deviceoverviewpage.issues');
      expectFieldToTranslateTo('tag', 'translated.spacespage.tags');
    });

    it('should translate all supported search fields case insensitive', function () {
      expectFieldToTranslateTo('Displayname', 'translated.spacespage.nameheader');
      expectFieldToTranslateTo('Upgradechannel', 'translated.devicesettings.softwareupgradechannel');
      expectFieldToTranslateTo('DISPLAYNAME', 'translated.spacespage.nameheader');
      expectFieldToTranslateTo('UPGRADECHANNEL', 'translated.devicesettings.softwareupgradechannel');
      expectFieldToTranslateTo('displayname', 'translated.spacespage.nameheader');
      expectFieldToTranslateTo('upgradechannel', 'translated.devicesettings.softwareupgradechannel');
    });

    it('should not translate an unsupported search field', function () {
      expectFieldToTranslateTo('qwerty', 'qwerty');
    });

    function expectFieldToTranslateTo(fieldInQuery: string, expectedLocalizedField: string) {
      const searchTranslator = new SearchTranslator(transMock, missingTrans);
      const translatedQueryField = searchTranslator.translateQueryField(fieldInQuery);
      expect(translatedQueryField).toBe(expectedLocalizedField);
    }
  });

  describe('getTranslatedQueryFieldDisplayName', () => {

    beforeEach(function () {
      spyOn(transMock, 'instant').and.callFake(key => 'translated.' + key);
    });

    it('should translate all supported search fields', function () {
      expectFieldToTranslateToDisplayName('displayname', 'translated.spacesPage.nameHeader');
      expectFieldToTranslateToDisplayName('cisuuid', 'cisuuid');
      expectFieldToTranslateToDisplayName('accounttype', 'accounttype');
      expectFieldToTranslateToDisplayName('activeinterface', 'translated.deviceOverviewPage.networkConnectivity');
      expectFieldToTranslateToDisplayName('serial', 'translated.deviceOverviewPage.serial');
      expectFieldToTranslateToDisplayName('mac', 'translated.deviceOverviewPage.macAddr');
      expectFieldToTranslateToDisplayName('ip', 'translated.deviceOverviewPage.ipAddr');
      expectFieldToTranslateToDisplayName('description', 'description');
      expectFieldToTranslateToDisplayName('productfamily', 'productfamily');
      expectFieldToTranslateToDisplayName('software', 'translated.deviceOverviewPage.software');
      expectFieldToTranslateToDisplayName('upgradechannel', 'translated.deviceSettings.softwareUpgradeChannel');
      expectFieldToTranslateToDisplayName('product', 'translated.spacesPage.typeHeader');
      expectFieldToTranslateToDisplayName('connectionstatus', 'translated.spacesPage.statusHeader');
      expectFieldToTranslateToDisplayName('sipurl', 'translated.deviceOverviewPage.sipUrl');
      expectFieldToTranslateToDisplayName('errorcodes', 'translated.deviceOverviewPage.issues');
      expectFieldToTranslateToDisplayName('tag', 'translated.spacesPage.tags');
    });

    it('should translate all supported search fields case insensitive', function () {
      expectFieldToTranslateToDisplayName('Displayname', 'translated.spacesPage.nameHeader');
      expectFieldToTranslateToDisplayName('Upgradechannel', 'translated.deviceSettings.softwareUpgradeChannel');
      expectFieldToTranslateToDisplayName('DISPLAYNAME', 'translated.spacesPage.nameHeader');
      expectFieldToTranslateToDisplayName('UPGRADECHANNEL', 'translated.deviceSettings.softwareUpgradeChannel');
      expectFieldToTranslateToDisplayName('displayname', 'translated.spacesPage.nameHeader');
      expectFieldToTranslateToDisplayName('upgradechannel', 'translated.deviceSettings.softwareUpgradeChannel');
    });

    it('should not translate an unsupported search field', function () {
      expectFieldToTranslateToDisplayName('qwerty', 'qwerty');
    });

    function expectFieldToTranslateToDisplayName(fieldInQuery: string, expectedLocalizedField: string) {
      const searchTranslator = new SearchTranslator(transMock, missingTrans);
      const translatedQueryField = searchTranslator.getTranslatedQueryFieldDisplayName(fieldInQuery);
      expect(translatedQueryField).toBe(expectedLocalizedField);
    }
  });

  describe('getUniversalFieldName', () => {
    beforeEach(function () {
      spyOn(transMock, 'instant').and.callFake(key => 'translated.' + key);
    });

    it('should translate all supported search fields', function () {
      expectLookupByTranslatedField('translated.spacesPage.nameHeader', 'displayname');
      expectLookupByTranslatedField('translated.spacesPage.statusHeader', 'connectionstatus');
      expectLookupByTranslatedField('translated.deviceSettings.softwareUpgradeChannel', 'upgradechannel');
      expectLookupByTranslatedField('translated.deviceOverviewPage.networkConnectivity', 'activeinterface');
      expectLookupByTranslatedField('translated.spacesPage.typeHeader', 'product');
      expectLookupByTranslatedField('translated.deviceOverviewPage.macAddr', 'mac');
      expectLookupByTranslatedField('translated.deviceOverviewPage.ipAddr', 'ip');
      expectLookupByTranslatedField('translated.deviceOverviewPage.sipUrl', 'sipurl');
      expectLookupByTranslatedField('translated.deviceOverviewPage.issues', 'errorcodes');
      expectLookupByTranslatedField('translated.deviceOverviewPage.serial', 'serial');
      expectLookupByTranslatedField('translated.spacesPage.tags', 'tag');
      expectLookupByTranslatedField('translated.deviceOverviewPage.software', 'software');
    });

    it('should translate supported search fields case insensitive', function () {
      expectLookupByTranslatedField('Translated.SPACESPAGE.typeHeader', 'product');
      expectLookupByTranslatedField('translated.deviceoverviewpage.ipaddr', 'ip');
    });

    it('should not translate an unsupported search field', function () {
      expectLookupByTranslatedField('qwertyX', undefined);
    });

    function expectLookupByTranslatedField(localizedField: string, expectedField: string | undefined) {
      const searchTranslator = new SearchTranslator(transMock, missingTrans);
      const field = searchTranslator.getFieldName(localizedField);
      if (isUndefined(expectedField)) {
        expect(field).toBeUndefined();
      } else {
        expect(field).toBe(expectedField + '');
      }
    }
  });

  describe('lookupTranslatedQueryValueDisplayName', () => {

    beforeEach(function () {
      spyOn(transMock, 'instant').and.callFake(key => 'translated.' + key);
    });

    it('should a translate connectionStatus search field value to upper', function () {
      expectQueryValueToTranslateTo('connectionstatus', 'uppercase1', 'translated.CsdmStatus.connectionStatus.UPPERCASE1');
      expectQueryValueToTranslateTo('connEctionstaTus', 'uppercase1', 'translated.CsdmStatus.connectionStatus.UPPERCASE1');
    });

    it('should a translate upgradechannel search field value to camel', function () {
      expectQueryValueToTranslateTo('upgradechannel', 'UPPERCASE', 'translated.CsdmStatus.upgradeChannels.Uppercase');
      expectQueryValueToTranslateTo('upgradechannel', 'uppercase two', 'translated.CsdmStatus.upgradeChannels.Uppercase_Two');
      expectQueryValueToTranslateTo('upgraDechaNnel', 'uppErcase', 'translated.CsdmStatus.upgradeChannels.Uppercase');
    });

    it('should a translate networkConnectivity search field value to lower', function () {
      expectQueryValueToTranslateTo('activeinterface', 'wlan', 'translated.CsdmStatus.activeInterface.wlan');
      expectQueryValueToTranslateTo('actiVeinteRface', 'Lan', 'translated.CsdmStatus.activeInterface.lan');
      expectQueryValueToTranslateTo('actiVeinteRface', 'lAn', 'translated.CsdmStatus.activeInterface.lan');
    });

    //Not supported unless we reverse-lookup in the translation table.
    xit('should lookup a single value for active interface', function () {
      const searchTranslator = new SearchTranslator(transMock, missingTrans);
      const fieldValueLookedup = searchTranslator.lookupTranslatedQueryValue('translated.CsdmStatus.activeInterface.wlan', 'activeinterface');
      expect(fieldValueLookedup).toBe('wlan');
    });

    it('should not a translate value for unsupported field', function () {
      expectQueryValueToTranslateTo('qwertyX', 'qwerty', 'qwerty');
    });

    it('should translate to \'common.unknown\' for fields we expect to have unknowns', function () {
      expectQueryValueToTranslateTo('connectionstatus', 'UNKNOWN', 'translated.common.unknown');
      expectQueryValueToTranslateTo('upgradechannel', 'unknown', 'translated.common.unknown');
      expectQueryValueToTranslateTo('activeinterface', 'Unknown', 'translated.common.unknown');
    });

    function expectQueryValueToTranslateTo(fieldInQuery: string, fieldValue: string, expectedLocalizedValue: string) {
      const searchTranslator = new SearchTranslator(transMock, missingTrans);
      const translatedQueryValue = searchTranslator.lookupTranslatedQueryValueDisplayName(fieldValue, fieldInQuery);
      expect(translatedQueryValue).toBe(expectedLocalizedValue);
    }

    it('should not lookup unknown translated value', function () {
      const searchTranslator = new SearchTranslator(transMock, missingTrans);
      const translatedQueryValue = searchTranslator.lookupTranslatedQueryValue('translated.CsdmStatus.activeInterface.wlanXX', 'activeinterface');
      expect(translatedQueryValue).toBeUndefined();
    });
  });

  describe('lookupTranslatedQueryValue', () => {
    beforeEach(function () {
      spyOn(transMock, 'instant').and.callFake(key => keyMock[key] ? keyMock[key] : 'missingtranslation:' + key);
    });

    it('should translate connectionStatus', function () {
      expectQueryValueToTranslateBothWays('connectionstatus', 'CONNECTED', 'Online');
      expectQueryValueToTranslateBothWays('conneCtionstAtus', 'CONNECTED_with_ISSUES', 'Online, med problemer');
    });

    it('should translate upgradechannel', function () {
      expectQueryValueToTranslateBothWays('upgradechannel', 'specialcharone', '在线');
      expectQueryValueToTranslateBothWays('upgradechannel', 'Latest', 'Siste');
    });

    it('should translate networkConnectivity', function () {
      expectQueryValueToTranslateBothWays('activeinterface', 'wlan', 'Trådløst');
      expectQueryValueToTranslateBothWays('actiVeinteRface', 'lan', 'Kablet');
    });

    it('should translate errorCodes', function () {
      expectQueryValueToTranslateBothWays('errorCodes', 'osdvideooutput', 'Hovedskjerm ikke funnet');
      expectQueryValueToTranslateBothWays('erroRcodes', 'noupgrade', 'Automatiske oppdateringer deaktivert');
    });

    it('should not a translate value for unsupported field', function () {
      expectQueryValueToTranslateBothWays('qwertyX', 'qwerty', 'qwerty');
    });

    function expectQueryValueToTranslateBothWays(fieldInQuery: string, fieldValue: string, expectedLocalizedValue: string) {
      const searchTranslator = new SearchTranslator(transMock, () => 'we have no missing trans provider');
      const translatedQueryValue = searchTranslator.lookupTranslatedQueryValueDisplayName(fieldValue, fieldInQuery);
      expect(translatedQueryValue).toBe(expectedLocalizedValue);

      const fieldValueLookedup = searchTranslator.lookupTranslatedQueryValue(expectedLocalizedValue, fieldInQuery);
      expect(_.toLower(fieldValueLookedup)).toBe(_.toLower(fieldValue));

      const fieldValueLookedupByFieldVal = searchTranslator.lookupTranslatedQueryValue(fieldValue, fieldInQuery);
      expect(_.toLower(fieldValueLookedupByFieldVal)).toBe(_.toLower(fieldValue));
    }
  });
});
