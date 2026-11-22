import type { Template } from '../../templates'

// The printed card's pages in every language but Gujarati: same pages, same sections, same marks; only the words change.
const tr: NonNullable<Template['tr']> = {
  en: [
    {
      title: 'Chandla Vidhi',
      sections: [
        { heading: '', body: '|| Shri Ganeshaya Namah ||' },
        { heading: '', body: '[[1-title|**Chandla Vidhi**]]' },
        { heading: '', body: '<<**Aryan**\n[[1-ring]]\n>>**Rushita**' },
        { heading: '', body: '[[1-rule]]\n***Sunday, 27-December-2026***\n[[1-rule]]' },
      ],
    },
    {
      title: 'Chandla Vidhi',
      sections: [
        { heading: '', body: '|| Shri Ganeshaya Namah ||' },
        { heading: '', body: '**Chandla Vidhi**' },
        { heading: '', body: 'With great joy we share that\nby the boundless grace of our Kuldevi Shri Brahmani Mataji,\nof Makhaniya (now Surat),\nson of Smt. Varshaben and Shri Bharatbhai Gopalbhai Beladiya' },
        { heading: '', body: '**Aryan** [[2-ring]] **Rushita**' },
        { heading: '', body: 'of Shivendranagar (now Surat),\ndaughter of Smt. Hansaben and Shri Rameshbhai Narshibhai Desai,\nwill have their Chandla Vidhi on Posh Sud 8, Samvat 2083,\nSunday, 27-12-2026, at 5:00 PM.\nPlease grace this happy occasion with your presence.' },
        { heading: '', body: '***Dinner***\n[[2-rule]]\non Sunday, 27-12-2026\nat 5:00 PM\nPlease come, ........ persons.' },
        { heading: '', body: '***Venue***\n[[2-rule]]\nShri Hari Krishna Hall\nFirst Floor, Nilkanth Plaza,\nStation Road, Rajkot' },
        { heading: '', body: '***Hosts***\n[[2-rule]]\nBharatbhai Gopalbhai Beladiya\nGopalbhai Ranchhodbhai Beladiya\nAlpeshbhai Gopalbhai Beladiya\n98765 43210, 91234 56789' },
      ],
    },
  ],
  hi: [
    {
      title: 'चांदला विधि',
      sections: [
        { heading: '', body: '॥ श्री गणेशाय नमः ॥' },
        { heading: '', body: '[[1-title|**चांदला विधि**]]' },
        { heading: '', body: '<<**आर्यन**\n[[1-ring]]\n>>**रुशिता**' },
        { heading: '', body: '[[1-rule]]\n***रविवार, 27-दिसंबर-2026***\n[[1-rule]]' },
      ],
    },
    {
      title: 'चांदला विधि',
      sections: [
        { heading: '', body: '॥ श्री गणेशाय नमः ॥' },
        { heading: '', body: '**चांदला विधि**' },
        { heading: '', body: 'सहर्ष सूचित करते हैं कि\nहमारी कुलदेवी श्री ब्रह्माणी माताजी की असीम कृपा से\nमाखणिया निवासी (हाल सूरत)\nअ.सौ. वर्षाबेन एवं श्री भरतभाई गोपालभाई बेलाडिया के सुपुत्र' },
        { heading: '', body: '**आर्यन** [[2-ring]] **रुशिता**' },
        { heading: '', body: 'शिवेंद्रनगर निवासी (हाल सूरत)\nअ.सौ. हंसाबेन एवं श्री रमेशभाई नरशीभाई देसाई की सुपुत्री\nके साथ संवत 2083 पौष शुक्ल 8, रविवार दिनांक 27-12-2026\nके शुभ दिन सायं 5:00 बजे चांदला विधि रखी गई है।\nअतः इस शुभ अवसर पर पधारकर शोभा बढ़ाएँ।' },
        { heading: '', body: '***भोजन समारोह***\n[[2-rule]]\nदिनांक 27-12-2026, रविवार को\nसायं 5:00 बजे\nआप ........ व्यक्ति पधारें।' },
        { heading: '', body: '***शुभ स्थल***\n[[2-rule]]\nश्री हरि कृष्ण हॉल\nपहली मंजिल, नीलकंठ प्लाज़ा,\nस्टेशन रोड, राजकोट' },
        { heading: '', body: '***निमंत्रक***\n[[2-rule]]\nभरतभाई गोपालभाई बेलाडिया\nगोपालभाई रणछोड़भाई बेलाडिया\nअल्पेशभाई गोपालभाई बेलाडिया\n98765 43210, 91234 56789' },
      ],
    },
  ],
  mr: [
    {
      title: 'चांदला विधि',
      sections: [
        { heading: '', body: '॥ श्री गणेशाय नमः ॥' },
        { heading: '', body: '[[1-title|**चांदला विधि**]]' },
        { heading: '', body: '<<**आर्यन**\n[[1-ring]]\n>>**रुशिता**' },
        { heading: '', body: '[[1-rule]]\n***रविवार, 27-डिसेंबर-2026***\n[[1-rule]]' },
      ],
    },
    {
      title: 'चांदला विधि',
      sections: [
        { heading: '', body: '॥ श्री गणेशाय नमः ॥' },
        { heading: '', body: '**चांदला विधि**' },
        { heading: '', body: 'कळविण्यास आनंद होतो की\nआमची कुलदेवी श्री ब्रह्माणी माताजी यांच्या असीम कृपेने\nमाखणिया निवासी (सध्या सुरत)\nअ.सौ. वर्षाबेन व श्री. भरतभाई गोपालभाई बेलाडिया यांचे सुपुत्र' },
        { heading: '', body: '**आर्यन** [[2-ring]] **रुशिता**' },
        { heading: '', body: 'शिवेंद्रनगर निवासी (सध्या सुरत)\nअ.सौ. हंसाबेन व श्री. रमेशभाई नरशीभाई देसाई यांची सुकन्या\nयांच्यासोबत संवत 2083 पौष शुद्ध 8, रविवार दि. 27-12-2026\nया शुभ दिवशी सायं. 5:00 वा. चांदला विधि ठेवला आहे.\nतरी या शुभ प्रसंगी उपस्थित राहून शोभा वाढवावी.' },
        { heading: '', body: '***भोजन समारंभ***\n[[2-rule]]\nदि. 27-12-2026, रविवार रोजी\nसायं. 5:00 वा.\nआपण ........ व्यक्तींनी यावे.' },
        { heading: '', body: '***शुभ स्थळ***\n[[2-rule]]\nश्री हरी कृष्ण हॉल\nपहिला मजला, नीलकंठ प्लाझा,\nस्टेशन रोड, राजकोट' },
        { heading: '', body: '***निमंत्रक***\n[[2-rule]]\nभरतभाई गोपालभाई बेलाडिया\nगोपालभाई रणछोडभाई बेलाडिया\nअल्पेशभाई गोपालभाई बेलाडिया\n98765 43210, 91234 56789' },
      ],
    },
  ],
  pa: [
    {
      title: 'ਚਾਂਦਲਾ ਵਿਧੀ',
      sections: [
        { heading: '', body: '॥ ਸ਼੍ਰੀ ਗਣੇਸ਼ਾਯ ਨਮਃ ॥' },
        { heading: '', body: '[[1-title|**ਚਾਂਦਲਾ ਵਿਧੀ**]]' },
        { heading: '', body: '<<**ਆਰੀਅਨ**\n[[1-ring]]\n>>**ਰੁਸ਼ਿਤਾ**' },
        { heading: '', body: '[[1-rule]]\n***ਐਤਵਾਰ, 27-ਦਸੰਬਰ-2026***\n[[1-rule]]' },
      ],
    },
    {
      title: 'ਚਾਂਦਲਾ ਵਿਧੀ',
      sections: [
        { heading: '', body: '॥ ਸ਼੍ਰੀ ਗਣੇਸ਼ਾਯ ਨਮਃ ॥' },
        { heading: '', body: '**ਚਾਂਦਲਾ ਵਿਧੀ**' },
        { heading: '', body: 'ਬੜੀ ਖੁਸ਼ੀ ਨਾਲ ਸੂਚਿਤ ਕਰਦੇ ਹਾਂ ਕਿ\nਸਾਡੀ ਕੁਲਦੇਵੀ ਸ਼੍ਰੀ ਬ੍ਰਹਮਾਣੀ ਮਾਤਾਜੀ ਦੀ ਅਪਾਰ ਕਿਰਪਾ ਨਾਲ\nਮਾਖਣੀਆ ਨਿਵਾਸੀ (ਹੁਣ ਸੂਰਤ)\nਸ਼੍ਰੀਮਤੀ ਵਰਸ਼ਾਬੇਨ ਅਤੇ ਸ਼੍ਰੀ ਭਰਤਭਾਈ ਗੋਪਾਲਭਾਈ ਬੇਲਾਡੀਆ ਦੇ ਸਪੁੱਤਰ' },
        { heading: '', body: '**ਆਰੀਅਨ** [[2-ring]] **ਰੁਸ਼ਿਤਾ**' },
        { heading: '', body: 'ਸ਼ਿਵੇਂਦਰਨਗਰ ਨਿਵਾਸੀ (ਹੁਣ ਸੂਰਤ)\nਸ਼੍ਰੀਮਤੀ ਹੰਸਾਬੇਨ ਅਤੇ ਸ਼੍ਰੀ ਰਮੇਸ਼ਭਾਈ ਨਰਸ਼ੀਭਾਈ ਦੇਸਾਈ ਦੀ ਸਪੁੱਤਰੀ\nਨਾਲ ਸੰਵਤ 2083 ਪੋਹ ਸੁਦੀ 8, ਐਤਵਾਰ ਮਿਤੀ 27-12-2026\nਦੇ ਸ਼ੁਭ ਦਿਨ ਸ਼ਾਮ 5:00 ਵਜੇ ਚਾਂਦਲਾ ਵਿਧੀ ਰੱਖੀ ਗਈ ਹੈ।\nਇਸ ਸ਼ੁਭ ਮੌਕੇ ਤੇ ਪਧਾਰ ਕੇ ਰੌਣਕ ਵਧਾਉਣਾ ਜੀ।' },
        { heading: '', body: '***ਪ੍ਰੀਤੀ ਭੋਜ***\n[[2-rule]]\nਮਿਤੀ 27-12-2026, ਐਤਵਾਰ ਨੂੰ\nਸ਼ਾਮ 5:00 ਵਜੇ\nਆਪ ਜੀ ........ ਵਿਅਕਤੀ ਪਧਾਰਨਾ।' },
        { heading: '', body: '***ਸ਼ੁਭ ਸਥਾਨ***\n[[2-rule]]\nਸ਼੍ਰੀ ਹਰੀ ਕ੍ਰਿਸ਼ਨ ਹਾਲ\nਪਹਿਲੀ ਮੰਜ਼ਿਲ, ਨੀਲਕੰਠ ਪਲਾਜ਼ਾ,\nਸਟੇਸ਼ਨ ਰੋਡ, ਰਾਜਕੋਟ' },
        { heading: '', body: '***ਸੱਦਾ ਦੇਣ ਵਾਲੇ***\n[[2-rule]]\nਭਰਤਭਾਈ ਗੋਪਾਲਭਾਈ ਬੇਲਾਡੀਆ\nਗੋਪਾਲਭਾਈ ਰਣਛੋੜਭਾਈ ਬੇਲਾਡੀਆ\nਅਲਪੇਸ਼ਭਾਈ ਗੋਪਾਲਭਾਈ ਬੇਲਾਡੀਆ\n98765 43210, 91234 56789' },
      ],
    },
  ],
  ta: [
    {
      title: 'சாந்த்லா விதி',
      sections: [
        { heading: '', body: '|| ஸ்ரீ கணேசாய நம: ||' },
        { heading: '', body: '[[1-title|**சாந்த்லா விதி**]]' },
        { heading: '', body: '<<**ஆர்யன்**\n[[1-ring]]\n>>**ருஷிதா**' },
        { heading: '', body: '[[1-rule]]\n***ஞாயிறு, 27-டிசம்பர்-2026***\n[[1-rule]]' },
      ],
    },
    {
      title: 'சாந்த்லா விதி',
      sections: [
        { heading: '', body: '|| ஸ்ரீ கணேசாய நம: ||' },
        { heading: '', body: '**சாந்த்லா விதி**' },
        { heading: '', body: 'மகிழ்ச்சியுடன் தெரிவிப்பது, எங்கள்\nகுலதெய்வம் ஸ்ரீ பிரம்மாணி மாதாவின் அருளால்\nமாகணியா (தற்போது சூரத்)\nதிருமதி வர்ஷாபென் & திரு பரத்பாய் கோபால்பாய் பெலாடியாவின் புதல்வன்' },
        { heading: '', body: '**ஆர்யன்** [[2-ring]] **ருஷிதா**' },
        { heading: '', body: 'சிவேந்திரநகர் (தற்போது சூரத்)\nதிருமதி ஹன்சாபென் & திரு ரமேஷ்பாய் நர்ஷிபாய் தேசாயின் புதல்வியுடன்\nசம்வத் 2083 பௌஷ வளர்பிறை 8, 27-12-2026 ஞாயிறு,\nமாலை 5:00 மணிக்கு சாந்த்லா விதி நடைபெறும்.\nஇந்த மங்கல நிகழ்வில் கலந்து சிறப்பிக்கவும்.' },
        { heading: '', body: '***விருந்து***\n[[2-rule]]\n27-12-2026 ஞாயிற்றுக்கிழமை\nமாலை 5:00 மணி\n........ நபர்களுடன் வருக.' },
        { heading: '', body: '***இடம்***\n[[2-rule]]\nஸ்ரீ ஹரி கிருஷ்ணா ஹால்\nமுதல் தளம், நீலகண்ட் பிளாசா,\nஸ்டேஷன் ரோடு, ராஜ்கோட்' },
        { heading: '', body: '***அழைப்பவர்கள்***\n[[2-rule]]\nபரத்பாய் கோபால்பாய் பெலாடியா\nகோபால்பாய் ரண்சோட்பாய் பெலாடியா\nஅல்பேஷ்பாய் கோபால்பாய் பெலாடியா\n98765 43210, 91234 56789' },
      ],
    },
  ],
}
export default tr
