import searchModule from '../index';
import { SearchTranslator } from './searchTranslator';
import { FieldQuery, OperatorOr, QueryParser, SearchElement } from './queryParser';
import { isNull } from 'util';

describe('SearchTranslator', () => {
  let transMock;

  beforeEach(function () {
    this.initModules(searchModule);
    this.injectDependencies('$translate', 'CsdmSearchService', 'UrlConfig', 'Authinfo', '$rootScope');

    const keyMock = {
      'CsdmStatus.connectionStatus.CONNECTED': 'Online',
      'CsdmStatus.connectionStatus.CONNECTED_WITH_ISSUES': 'Online, med problemer',
      'CsdmStatus.connectionStatus.DISCONNECTED': 'Ikke pålogget',
      'CsdmStatus.connectionStatus.OFFLINE_EXPIRED': 'Deaktivert',
      'CsdmStatus.connectionStatus.UNKNOWN': 'Ukjent',
      'CsdmStatus.WithDevices': 'Med enheter',
      'CsdmStatus.upgradeChannels.SpecialCharOne': '在线',
      'CsdmStatus.upgradeChannels.Stable': 'Stabil',
      'CsdmStatus.upgradeChannels.Latest': 'Siste',
      'CsdmStatus.upgradeChannels.Beta': 'Beta',
      'CsdmStatus.upgradeChannels.Preview': 'Forhåndsvisning',
      'CsdmStatus.activeInterface.lan': 'Kablet',
      'CsdmStatus.activeInterface.wlan': 'Trådløst',
      'CsdmStatus.errorCodes.mediaProtocol.type': 'Nettverksporter blokkert',
      'CsdmStatus.errorCodes.mediaProtocol.message': 'En brannmur kan blokkere media på UDP. Samtalekvalitet kan være redusert. For informasjon om krav til nettverksporter, se artikkelen <a href=\'https://support.ciscospark.com/customer/portal/articles/1911657\' class=\'issue-link\'>Brannmurer og nettverkskrav for Cisco Spark App</a>.',
      'CsdmStatus.errorCodes.TCPMediaFallback.type': 'Nettverksporter blokkert',
      'CsdmStatus.errorCodes.TCPMediaFallback.message': 'En brannmur kan blokkere media på UDP. Samtalekvalitet kan være redusert. For informasjon om krav til nettverksporter, se artikkelen <a href=\'https://support.ciscospark.com/customer/portal/articles/1911657\' class=\'issue-link\'>Brannmurer og nettverkskrav for Cisco Spark App</a>.',
      'CsdmStatus.errorCodes.MediaBlockingDetected.type': 'Nettverksporter blokkert',
      'CsdmStatus.errorCodes.MediaBlockingDetected.message': 'En brannmur kan blokkere media på UDP og TCP. Samtalekvalitet kan være redusert. For informasjon om krav til nettverksporter, se artikkelen <a href=\'https://support.ciscospark.com/customer/portal/articles/1911657\' class=\'issue-link\'>Brannmurer og nettverkskrav for Cisco Spark App</a>.',
      'CsdmStatus.errorCodes.TemperatureCheck.type': 'Høy temperatur',
      'CsdmStatus.errorCodes.TemperatureCheck.message': 'Systemtemperaturen er for høy.',
      'CsdmStatus.errorCodes.OSDVideoOutput.type': 'Hovedskjerm ikke funnet',
      'CsdmStatus.errorCodes.OSDVideoOutput.message': 'Sjekk at hovedskjermen er påslått og tilkoblet rett skjermport på videosystemet.',
      'CsdmStatus.errorCodes.noupgrade.type': 'Automatiske oppdateringer deaktivert',
      'CsdmStatus.errorCodes.noupgrade.message': 'Systemprogramvaren vil ikke bli oppdatert.',
      'CsdmStatus.errorCodes.NTPStatus.type': 'Tidsserver kan ikke nås',
      'CsdmStatus.errorCodes.NTPStatus.message': 'Koblingen til en NTP-server kunne ikke etableres. Tiden som vises på endepunktet kan være feil.',
      'CsdmStatus.errorCodes.AudioPairingInterference.type': 'Signalforstyrrelser fra andre enheter',
      'CsdmStatus.errorCodes.AudioPairingInterference.message': 'Det er ultralyd signalforstyrrelse i dette rommet fra andre enheter (f.eks. andre videosystemer) som kan forhindre paring mellom videosystemet og din telefon eller bærbare PC.',
      'CsdmStatus.errorCodes.ECReferenceDelay.type': 'Lydforsinkelse',
      'CsdmStatus.errorCodes.ECReferenceDelay.message': 'Skjerminnstillingene dine fører til en forsinkelse av lyden. Juster skjerminnstillingene dine til en passende modus (f.eks. spillemodus).',
      'CsdmStatus.errorCodes.UltrasoundSpeakerAvailability.type': 'Ingen innebygget ultralyd-høyttaler',
      'CsdmStatus.errorCodes.UltrasoundSpeakerAvailability.message': 'Denne maskinvareversjonen av SX10 har ikke en innebygget ultralyd-høyttaler.',
      'CsdmStatus.errorCodes.MissingEncryptionKey.type': 'Mangler krypteringsalternativnøkkel',
      'CsdmStatus.errorCodes.MissingEncryptionKey.message': 'Legg til en krypteringsalternativnøkkel.',
      'CsdmStatus.errorCodes.ConfiguredForTestAutomation.type': 'Konfigurert for testautomatisering',
      'CsdmStatus.errorCodes.ConfiguredForTestAutomation.message': 'Metrikk- og loggrapportering påvirkes.',
      'CsdmStatus.errorCodes.TouchPanelConnection.type': 'Berøringsskjerm nødvendig',
      'CsdmStatus.errorCodes.TouchPanelConnection.message': 'Det er ingen berøringsskjerm tilkoblet rom-enheten. Sjekk kabelen som kobler berøringsskjermen til rom-enheten.',
      'CsdmStatus.errorCodes.NetworkQuality.type': 'Pakketap oppdaget',
      'CsdmStatus.errorCodes.NetworkQuality.message': 'I løpet av den forrige samtalen oppdaget vi et nivå av pakketap som kan ha påvirket samtalekvaliteten. Pakketap forårsakes vanligvis av nettverksblokkering.',
      'CsdmStatus.errorCodes.unknown.type': 'En ukjent feil oppsto',
      'CsdmStatus.errorCodes.unknown.message': 'Enheten rapporterte en ukjent feil, og ingen beskrivelse er tilgjengelig. Feilkoden er: {{errorCode}}',
      'CsdmStatus.errorCodes.unknown.message_with_description': 'Enheten rapporterte en ukjent feil. Feilkoden er: {{errorCode}}. Beskrivelse: {{description}}',
    };

    transMock = this.$translate;
    spyOn(this.$translate, 'getTranslationTable').and.returnValue(keyMock);
    spyOn(this.$translate, 'proposedLanguage').and.returnValue('nb_NO');
  });

  it('should map correct search field', function () {
    expect('upgradechannel').toEqual(SearchTranslator.getSearchField('CsdmStatus.upgradeChannels.Preview'));
    expect('errorcodes').toEqual(SearchTranslator.getSearchField('CsdmStatus.errorCodes.TouchPanelConnection.message'));
    expect('connectionstatus').toEqual(SearchTranslator.getSearchField('CsdmStatus.connectionStatus.DISCONNECTED'));
    expect('upgradechannel').toEqual(SearchTranslator.getSearchField('CsdmStatus.upgradeChannels.Preview'));
    expect(SearchTranslator.getSearchField('Csdm.The.unknown.thing')).toBeUndefined();
  });

  it('should translate single term', function () {
    expectQueryToFindTranslation('krypteringsalternativnøkkel', 'errorcodes=MissingEncryptionKey');
    expectQueryToFindTranslation('Online, med problemer', 'connectionstatus=CONNECTED_WITH_ISSUES');
    expectQueryToFindTranslation('Deaktivert', 'connectionstatus=OFFLINE_EXPIRED or errorcodes=noupgrade');
    expectQueryToFindTranslation('Forhåndsvisning', 'upgradechannel=Preview');
    expectQueryToFindTranslation('Trådløst', 'activeinterface=wlan');
    expectQueryToFindTranslation('在线', 'upgradechannel=SpecialCharOne');
    expectQueryToFindTranslation('Med enheter', null);
  });

  it('should translate an incomplete single term', function () {
    expectQueryToFindTranslation('krypteringsalternativnø', 'errorcodes=MissingEncryptionKey');
    expectQueryToFindTranslation('Online, med problem', 'connectionstatus=CONNECTED_WITH_ISSUES');
    expectQueryToFindTranslation('Deaktiver', 'connectionstatus=OFFLINE_EXPIRED or errorcodes=noupgrade');
    expectQueryToFindTranslation('Forhåndsvisni', 'upgradechannel=Preview');
    expectQueryToFindTranslation('Trådløs', 'activeinterface=wlan');
  });

  it('should translate single phrase', function () {
    expectQueryToFindTranslation('"innebygget ultralyd-høyttaler"', 'errorcodes=UltrasoundSpeakerAvailability');
  });

  it('should not translate incorrect single phrase', function () {
    expectQueryToFindTranslation('"ultralyd-høyttaler innebygget"', null);
  });

  it('should not translate too wide searches', function () {
    expectQueryToFindTranslation('a', null);
    expectQueryToFindTranslation('Deaktiver', null, 1);
  });

  it('should translate an all expressions match', function () {
    expectQueryToFindTranslation('innebygget ultralyd-høyttaler', 'errorcodes=UltrasoundSpeakerAvailability');
  });

  it('should translate single field term', function () {
    expectQueryToFindTranslation('errorCodes:krypteringsalternativnøkkel', 'errorcodes=MissingEncryptionKey');
  });

  it('should not translate single field term matching only error key', function () {
    expectQueryToFindTranslation('errorCodes:MissingEncrypti', null);
  });

  it('should not translate single field term matching only error key', function () {
    expectQueryToFindTranslation('errorCodes:MissingEncrypti', null);
  });

  describe('translateQuery', () => {

    it('should translate single term', function () {
      expectQueryToTranslateTo('krypteringsalternativnøkkel', 'krypteringsalternativnøkkel or errorcodes=MissingEncryptionKey');
      expectQueryToTranslateTo('Online, med problemer', '(online, and med and problemer) or connectionstatus=CONNECTED_WITH_ISSUES');
      expectQueryToTranslateTo('Deaktivert', 'deaktivert or connectionstatus=OFFLINE_EXPIRED or errorcodes=noupgrade');
      expectQueryToTranslateTo('Forhåndsvisning', 'forhåndsvisning or upgradechannel=Preview');
      expectQueryToTranslateTo('Trådløst', 'trådløst or activeinterface=wlan');
      expectQueryToTranslateTo('在线', '在线 or upgradechannel=SpecialCharOne');
      expectQueryToTranslateTo('MedX enheterX', 'medx and enheterx');
      expectQueryToTranslateTo('"Med enheter"', '"med enheter"');
    });

    it('should translate multiple terms', function () {
      expectQueryToTranslateTo('krypteringsalternativnøkkel sx10x1', '(krypteringsalternativnøkkel or errorcodes=MissingEncryptionKey) and sx10x1');
      expectQueryToTranslateTo('sx10X1 krypteringsalternativnøkkel', 'sx10x1 and (krypteringsalternativnøkkel or errorcodes=MissingEncryptionKey)');
      expectQueryToTranslateTo('sx10X2 "innebygget ultralyd-høyttaler"', 'sx10x2 and ("innebygget ultralyd-høyttaler" or errorcodes=UltrasoundSpeakerAvailability)');
      expectQueryToTranslateTo('"innebygget ultralyd-høyttaler" sx10X ', '("innebygget ultralyd-høyttaler" or errorcodes=UltrasoundSpeakerAvailability) and sx10x');
      expectQueryToTranslateTo('sx10X3 innebygget ultralyd-høyttaler', 'sx10x3 and ((innebygget and ultralyd-høyttaler) or errorcodes=UltrasoundSpeakerAvailability)');
      expectQueryToTranslateTo('innebygget ultralyd-høyttaler sx10X ', '((innebygget and ultralyd-høyttaler) or errorcodes=UltrasoundSpeakerAvailability) and sx10x');
      expectQueryToTranslateTo('Nettverksporter blokkert', '(nettverksporter and blokkert) or errorcodes=mediaProtocol or errorcodes=TCPMediaFallback or errorcodes=MediaBlockingDetected');
      expectQueryToTranslateTo('"Nettverksporter blokkert"', '"nettverksporter blokkert" or errorcodes=mediaProtocol or errorcodes=TCPMediaFallback or errorcodes=MediaBlockingDetected');
    });

    it('should translate multiple terms ored', function () {
      expectQueryToTranslateTo('krypteringsalternativnøkkel or "innebygget ultralyd-høyttaler"', '(krypteringsalternativnøkkel or errorcodes=MissingEncryptionKey) or ("innebygget ultralyd-høyttaler" or errorcodes=UltrasoundSpeakerAvailability)');
    });

    it('should translate multiple terms anded', function () {
      expectQueryToTranslateTo('krypteringsalternativnøkkel and "innebygget ultralyd-høyttaler"', '(krypteringsalternativnøkkel or errorcodes=MissingEncryptionKey) and ("innebygget ultralyd-høyttaler" or errorcodes=UltrasoundSpeakerAvailability)');
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
      const searchTranslator = new SearchTranslator(transMock);
      const parsedQuery = QueryParser.parseQueryString(query);
      const translatedQuery = searchTranslator.translateQuery(parsedQuery);
      expect(translatedQuery.toQuery()).toBe(expectedQuery || '');
    }
  });

  function expectQueryToFindTranslation(query: string, expectedQuery: string | null, maxResult: number = 2) {
    const searchTranslator = new SearchTranslator(transMock);
    const parsedQuery = QueryParser.parseQueryString(query);
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

  describe('translateQueryField', () => {

    it('should translate all supported search fields', function () {
      expectFieldToTranslateTo('displayname', 'spacespage.nameheader');
      expectFieldToTranslateTo('cisuuid', 'cisuuid');
      expectFieldToTranslateTo('accounttype', 'accounttype');
      expectFieldToTranslateTo('activeinterface', 'deviceoverviewpage.networkconnectivity');
      expectFieldToTranslateTo('serial', 'deviceoverviewpage.serial');
      expectFieldToTranslateTo('mac', 'deviceoverviewpage.macaddr');
      expectFieldToTranslateTo('ip', 'deviceoverviewpage.ipaddr');
      expectFieldToTranslateTo('description', 'description');
      expectFieldToTranslateTo('productfamily', 'productfamily');
      expectFieldToTranslateTo('software', 'software');
      expectFieldToTranslateTo('upgradechannel', 'devicesettings.softwareupgradechannel');
      expectFieldToTranslateTo('product', 'spacespage.typeheader');
      expectFieldToTranslateTo('connectionstatus', 'spacespage.statusheader');
      expectFieldToTranslateTo('sipurl', 'deviceoverviewpage.sipurl');
      expectFieldToTranslateTo('errorcodes', 'deviceoverviewpage.issues');
      expectFieldToTranslateTo('tags', 'spacespage.tags');
    });

    it('should translate all supported search fields case insensitive', function () {
      expectFieldToTranslateTo('Displayname', 'spacespage.nameheader');
      expectFieldToTranslateTo('Upgradechannel', 'devicesettings.softwareupgradechannel');
      expectFieldToTranslateTo('DISPLAYNAME', 'spacespage.nameheader');
      expectFieldToTranslateTo('UPGRADECHANNEL', 'devicesettings.softwareupgradechannel');
      expectFieldToTranslateTo('displayname', 'spacespage.nameheader');
      expectFieldToTranslateTo('upgradechannel', 'devicesettings.softwareupgradechannel');
    });

    it('should not translate an unsupported search field', function () {
      expectFieldToTranslateTo('qwerty', 'qwerty');
    });

    function expectFieldToTranslateTo(fieldInQuery: string, expectedLocalizedField: string) {
      const searchTranslator = new SearchTranslator(transMock);
      const translatedQueryField = searchTranslator.translateQueryField(fieldInQuery);
      expect(translatedQueryField).toBe(expectedLocalizedField);
    }
  });

  describe('translateQueryValue', () => {

    it('should a translate connectionStatus search field value to upper', function () {
      expectQueryValueToTranslateTo('connectionstatus', 'uppercase1', 'CsdmStatus.connectionStatus.UPPERCASE1');
      expectQueryValueToTranslateTo('connEctionstaTus', 'uppercase1', 'CsdmStatus.connectionStatus.UPPERCASE1');

    });

    it('should a translate upgradechannel search field value to camel', function () {
      expectQueryValueToTranslateTo('upgradechannel', 'uppercase1', 'CsdmStatus.upgradeChannels.Uppercase1');
      expectQueryValueToTranslateTo('upgradechannel', 'uppercase1 two', 'CsdmStatus.upgradeChannels.Uppercase1Two');
      expectQueryValueToTranslateTo('upgraDechaNnel', 'uppErcase1', 'CsdmStatus.upgradeChannels.Uppercase1');

    });

    it('should a translate networkConnectivity search field value to lower', function () {
      expectQueryValueToTranslateTo('activeinterface', 'wlan', 'CsdmStatus.activeInterface.wlan');
      expectQueryValueToTranslateTo('actiVeinteRface', 'Wired', 'CsdmStatus.activeInterface.wired');
      expectQueryValueToTranslateTo('actiVeinteRface', 'wiRed', 'CsdmStatus.activeInterface.wired');
    });

    it('should not a translate value for unsupported field', function () {
      expectQueryValueToTranslateTo('qwertyX', 'qwerty', 'qwerty');
    });

    it('should not translate when not exact search', function () {
      const searchTranslator = new SearchTranslator(transMock);
      const queryElement = new FieldQuery('qwerty', 'qwertyX', FieldQuery.QueryTypeExact)
      const translatedQueryValue = searchTranslator.translateQueryValue(queryElement);
      expect(translatedQueryValue).toBe('qwerty');
    });

    function expectQueryValueToTranslateTo(fieldInQuery: string, fieldValue: string, expectedLocalizedValue: string) {
      const searchTranslator = new SearchTranslator(transMock);
      const queryElement = new FieldQuery(fieldValue, fieldInQuery, FieldQuery.QueryTypeExact)
      const translatedQueryValue = searchTranslator.translateQueryValue(queryElement);
      expect(translatedQueryValue).toBe(expectedLocalizedValue);
    }
  });
});

