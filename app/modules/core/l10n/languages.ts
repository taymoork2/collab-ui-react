export const languageConfigs = [{
  value: 'da_DK',
  label: 'languages.danish',
  browserCodes: ['da_DK', 'da'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/da_DK.json')), 'da_DK'),
}, {
  value: 'de_DE',
  label: 'languages.german',
  browserCodes: ['de_DE', 'de', 'de_AT', 'de_CH'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/de_DE.json')), 'de_DE'),
}, {
  value: 'en_US',
  label: 'languages.englishAmerican',
  browserCodes: ['en_US', 'en'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/en_US.json')), 'en_US'),
}, {
  value: 'en_GB',
  label: 'languages.englishBritish',
  browserCodes: ['en_GB', 'en_IE'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/en_GB.json')), 'en_GB'),
}, {
  value: 'es_ES',
  label: 'languages.spanishSpain',
  browserCodes: ['es_ES', 'es'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/es_ES.json')), 'es_ES'),
}, {
  value: 'es_CO',
  label: 'languages.spanishColumbian',
  browserCodes: ['es_CO', 'es_419', 'es_XL', 'es_MX'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/es_CO.json')), 'es_CO'),
}, {
  value: 'fr_FR',
  label: 'languages.french',
  browserCodes: ['fr_FR', 'fr', 'fr_CH', 'fr_BE'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/fr_FR.json')), 'fr_FR'),
}, {
  value: 'fr_CA',
  label: 'languages.frenchCanadian',
  browserCodes: ['fr_CA'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/fr_CA.json')), 'fr_CA'),
}, {
  value: 'id_ID',
  label: 'languages.indonesian',
  browserCodes: ['id_ID', 'id'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/id_ID.json')), 'id_ID'),
}, {
  value: 'it_IT',
  label: 'languages.italian',
  browserCodes: ['it_IT', 'it', 'it_CH'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/it_IT.json')), 'it_IT'),
}, {
  value: 'ja_JP',
  label: 'languages.japanese',
  browserCodes: ['ja_JP', 'ja'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/ja_JP.json')), 'ja_JP'),
}, {
  value: 'ko_KR',
  label: 'languages.korean',
  browserCodes: ['ko_KR', 'ko'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/ko_KR.json')), 'ko_KR'),
}, {
  value: 'nb_NO',
  label: 'languages.norwegian',
  browserCodes: ['nb_NO', 'nb', 'no', 'nn', 'nn_NO'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/nb_NO.json')), 'nb_NO'),
}, {
  value: 'nl_NL',
  label: 'languages.dutch',
  browserCodes: ['nl_NL', 'nl', 'nl_BE'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/nl_NL.json')), 'nl_NL'),
}, {
  value: 'pl_PL',
  label: 'languages.polish',
  browserCodes: ['pl_PL', 'pl'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/pl_PL.json')), 'pl_PL'),
}, {
  value: 'pt_BR',
  label: 'languages.portugueseBrazillian',
  browserCodes: ['pt_BR', 'pt', 'pt_PT'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/pt_BR.json')), 'pt_BR'),
}, {
  value: 'ru_RU',
  label: 'languages.russian',
  browserCodes: ['ru_RU', 'ru'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/ru_RU.json')), 'ru_RU'),
}, {
  value: 'sv_SE',
  label: 'languages.swedish',
  browserCodes: ['sv_SE', 'sv'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/sv_SE.json')), 'sv_SE'),
}, {
  value: 'tr_TR',
  label: 'languages.turkish',
  browserCodes: ['tr_TR', 'tr'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/tr_TR.json')), 'tr_TR'),
}, {
  value: 'zh_CN',
  label: 'languages.chineseMandarin',
  browserCodes: ['zh_CN', 'zh'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/zh_CN.json')), 'zh_CN'),
}, {
  value: 'zh_TW',
  label: 'languages.chineseTraditional',
  browserCodes: ['zh_TW'],
  loadJson: (resolve) => (require as any).ensure([], () => resolve(require('l10n/zh_TW.json')), 'zh_TW'),
}];
