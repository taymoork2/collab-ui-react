module.exports = {
  plugins: ['stylelint-scss'],
  extends: ['stylelint-config-standard'],
  rules: {
    // Activate rules from the stylelint-scss plugin
    'scss/selector-no-redundant-nesting-selector': true,
    // Override stylelint-config-standard rules
    //'at-rule-empty-line-before': 'never', TO BE CONFIGURED
    'color-hex-case': null,
    'color-hex-length': null,
    // 'declaration-empty-line-before': 'never', TO BE CONFIGURED
    'length-zero-no-unit': null,
    'selector-type-no-unknown': null, // because of Angular Components
    // Add other rules configuration
    'at-rule-no-vendor-prefix': true,
    'font-family-name-quotes': 'always-where-recommended',
    'function-url-quotes': 'always',
    'media-feature-name-no-vendor-prefix': true,
    'property-no-vendor-prefix': true,
    'selector-attribute-quotes': 'always',
    'selector-no-vendor-prefix': true,
    'string-quotes': 'single',
    'value-no-vendor-prefix': true,
  },
};
