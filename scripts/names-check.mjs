// Fails when name fields would pick a dictionary word over the name (Priya -> प्रिय "dear" instead of प्रिया).
// The lists are Google Input Tools' real answers, top first.
//
//   node scripts/names-check.mjs        (CI runs this)
import assert from 'node:assert/strict'
import { runnerImport } from 'vite'

const { module: m } = await runnerImport('/src/transliterate.tsx', { configFile: false, logLevel: 'error' })
const cases = [
  ['hi', 'priya', 'प्रिय प्रिया परिया प्रिये प्रीय', 'प्रिया'],
  ['hi', 'kavya', 'काव्य काव्या कव्य क़व्य कव्या', 'काव्या'],
  ['hi', 'ananya', 'अनन्य अनन्या अनान्य अन्यान्य आणण्या', 'अनन्या'],
  ['mr', 'shukla', 'शुक्ल शुक्ला शुकला सुकला शुक्रला', 'शुक्ला'],
  ['gu', 'divya', 'દિવ્ય દિવ્યા દીવ્ય દિવ્યાં દીવ્યા', 'દિવ્યા'],
  ['pa', 'krupa', 'ਕਰੂਪ ਕਰੁਪਾ ਕਰੂਪਾ ਕੁਰੂਪ ਕਰੁਪ', 'ਕਰੁਪਾ'],
  ['ta', 'dhanya', 'தான்ய தன்யா தான்யா தனியா தன்ய', 'தன்யா'],
  // Already right, or not a final "a": left alone.
  ['hi', 'sharma', 'शर्मा शर्म शरमा षर्मा शार्मा', 'शर्मा'],
  ['hi', 'rohan', 'रोहन रोहण रोहं रोहान रोहां', 'रोहन'],
  ['gu', 'harsh', 'હર્ષ હર્ષા હરશ', 'હર્ષ'],
]
for (const [lang, latin, list, want] of cases) {
  const got = m.nameFirst(list.split(' '), latin, lang)
  assert.equal(got[0], want, `${lang} ${latin}`)
  assert.deepEqual([...got].sort(), list.split(' ').sort(), `${lang} ${latin} keeps every spelling`)
}
assert.deepEqual(m.nameFirst(['abc'], 'priya', 'en'), ['abc'])
console.log(`All ${cases.length} name spellings pick the name`)
