// Style Dictionary config for @ara/tokens (Tier-1)
// Inputs  : tokens/core/**/*.json, tokens/semantic/**/*.json, tokens/system/**/*.json
// Outputs : dist/tokens/variables.css (:root CSS variables), dist/tokens/tokens.json (nested)
// Transforms: attribute/cti, name/cti/kebab, time/seconds, size/rem, color/hex
// Notes   : semantic 네임스페이스(alias)  system이 semantic만 참조(순환/충돌 방지)

module.exports = {
  source: ['tokens/core/**/*.json','tokens/semantic/**/*.json','tokens/system/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      transforms: ['attribute/cti', 'name/cti/kebab', 'time/seconds', 'size/rem', 'color/hex'],
      buildPath: 'dist/tokens/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: { selector: ':root' },
        },
      ],
    },
    json: {
      transformGroup: 'js',
      transforms: ['attribute/cti', 'name/cti/kebab', 'time/seconds', 'size/rem', 'color/hex'],
      buildPath: 'dist/tokens/',
      files: [{ destination: 'tokens.json', format: 'json/nested' }],
    },
  },
};
