/* Note: This function will modify the input array in place
 * @param {Array} arr
 * @param {Array} keys
 * @param {Object} glossary
 */

function transform(arr, keys, glossary) {
    arr.forEach(obj => {
        keys.forEach(key => {
            if (!(_.isPlainObject(key) || _.isString(key))) {
                return;
            }
// If key is an plain object.            
            if (_.isPlainObject(key)) {
                const nextLevelArr = _.property(key.path)(obj);
// desect the array recursively.                
                transform(nextLevelArr, key.keys, glossary);
                return;
            }
// key must be a string here. Transform this key to bilingual.
            const sourceText = obj[key];
            const targetText = glossary.hasOwnProperty(sourceText) ? glossary[sourceText] : "";

            console.log(`Translating ${sourceText} => ${targetText}`);
            
            obj[key] = {
                en: sourceText,
                cn: targetText
            }
        });       
    });
    return arr;
}

module.exports = transform;