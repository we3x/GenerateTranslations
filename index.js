const XLSX = require("xlsx");
const fs = require("fs");
const argv = require("minimist")(process.argv.slice(2));

const LANG = [
  { code: "en", key: "English" },
  { code: "de", key: "German" },
  { code: "it", key: "Italian" },
  { code: "fr", key: "French" },
];

const addDeepParameter = (obj, keys, value) => {
  let [key, ...restKeys] = keys;
  if (restKeys.length === 0) {
    obj[key] = value;
  } else {
    obj[key] = addDeepParameter(obj[key] || {}, restKeys, value);
  }
  return obj;
};

if (!argv['src']) {
  console.error("You must specified --src parameter");
  return;
}

let dating_translations;
try {
  dating_translations = XLSX.readFile(argv['src']);
} catch (error) {
  console.error('Error while parsing source file')
}

let { Sheets, SheetNames } = dating_translations;

let translations = {};

LANG.map((lang) => {
  translations[lang.code] = {};
});

SheetNames.forEach((sheetName) => {
  let json_translations = XLSX.utils.sheet_to_json(Sheets[sheetName]);

  json_translations.forEach(({ Key, ...Translations }) => {
    if (!Key) return;

    let properties = [
      sheetName.toLocaleLowerCase().replace(/ /g, "_"),
      ...Key.split("."),
    ];

    LANG.forEach((lang) => {
      translations = addDeepParameter(
        translations,
        [lang.code, ...properties],
        Translations[lang.key]
      );
    });
  });
});

fs.writeFile("output.json", JSON.stringify(translations), (error) => {
  if (error) throw error;
  console.log(`[debug] success generate languages`);
});
