const glossary = require('../glossary/en-cn.json');

function translate (source) {
    if (!glossary.hasOwnProperty(source)) {
        return source;
    }
    return glossary[source] ? glossary[source] : source;
}

if (require.main == module) {
    console.log(translate('UK GDP growth'));
    console.log(translate('% change previous quarter'));
    console.log(translate('€ per £'));
}

module.exports = translate;

