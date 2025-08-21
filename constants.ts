
// Languages for text/Excel input, where English is the source and not a target.
export const LANGUAGES_FOR_TEXT_INPUT = [
  'fr', // French
  'es', // Spanish
  'pt', // Portuguese
  'de', // German
  'ru', // Russian
  'it', // Italian
  'uk', // Ukrainian
  'ro', // Romanian
  'cs', // Czech
  'pl', // Polish
  'nl', // Dutch
  'lt', // Lithuanian
  'et', // Estonian
  'lv', // Latvian
  'sk', // Slovak
  'hu', // Hungarian
  'bg', // Bulgarian
  'th', // Thai
  'vi', // Vietnamese
];

// Languages for ARB/JS/TS input, where the file may also need an 'en' key.
export const LANGUAGES_FOR_CODE_INPUT = [
  'en', // English
  ...LANGUAGES_FOR_TEXT_INPUT,
];
