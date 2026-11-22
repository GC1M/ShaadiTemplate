import type { Template } from '../../templates'

// The printed card's pages in every language but Gujarati: same pages, same sections, same marks; only the words change.
const tr: NonNullable<Template['tr']> = {
  en: [
    {
      title: 'Chandla Vidhi',
      sections: [
        { heading: '', body: '|| Shri Ganeshaya Namah ||' },
        { heading: '', body: '**Chandla Vidhi**' },
        { heading: '', body: '~AR~' },
        { heading: '', body: '**Chi. Aryan**\n[[1-ring]]\n**Chi. Rushita**' },
      ],
    },
    {
      title: 'Chandla Vidhi',
      sections: [
        { heading: '', body: '|| Shri Ganeshaya Namah ||' },
        { heading: '', body: 'With great joy we share that\nby the boundless grace of our Kuldevi Shri Brahmani Mataji,\nof Makhaniya (now Surat), son of\nSmt. Varshaben and Shri Bharatbhai Gopalbhai Beladiya' },
        { heading: '', body: '**Chi. Aryan**\n[[1-ring]]\n**Chi. Rushita**' },
        { heading: '', body: 'of Shivendranagar (now Surat), daughter of\nSmt. Hansaben and Shri Rameshbhai Narshibhai Desai,\nwill have their Chandla Vidhi on Samvat 2083 Posh Vad 2, Sunday, 24-01-2027\nat 5:00 PM on this auspicious day.\nPlease grace the occasion with your presence.' },
      ],
    },
    {
      title: 'Dinner',
      sections: [
        { heading: '', body: '***Dinner***\n[[3-rule]]\non Sunday, 24-01-2027\nat 5:00 PM\nPlease come, ........ persons.' },
        { heading: '', body: '***Venue***\n[[3-rule]]\nShri Hari Krishna Hall\nFirst Floor, Nilkanth Plaza,\nStation Road, Rajkot' },
        { heading: '', body: '***Hosts***\n[[3-rule]]\nBharatbhai Gopalbhai Beladiya\nGopalbhai Ranchhodbhai Beladiya\nAlpeshbhai Gopalbhai Beladiya\n98765 43210, 91234 56789' },
      ],
    },
  ],
  hi: [
    {
      title: 'चांदला विधि',
      sections: [
        { heading: '', body: '॥ श्री गणेशाय नमः ॥' },
        { heading: '', body: '**चांदला विधि**' },
        { heading: '', body: '~AR~' },
        { heading: '', body: '**चि. आर्यन**\n[[1-ring]]\n**चि. रुशिता**' },
      ],
    },
    {
      title: 'चांदला विधि',
      sections: [
        { heading: '', body: '॥ श्री गणेशाय नमः ॥' },
        { heading: '', body: 'सहर्ष सूचित करते हैं कि\nहमारी कुलदेवी श्री ब्रह्माणी माताजी की असीम कृपा से\nमाखणिया निवासी (हाल सूरत)\nअ.सौ. वर्षाबेन एवं श्री भरतभाई गोपालभाई बेलाडिया के सुपुत्र' },
        { heading: '', body: '**चि. आर्यन**\n[[1-ring]]\n**चि. रुशिता**' },
        { heading: '', body: 'शिवेन्द्रनगर निवासी (हाल सूरत)\nअ.सौ. हंसाबेन एवं श्री रमेशभाई नरशीभाई देसाई की सुपुत्री\nके साथ संवत 2083 पौष कृष्ण 2, रविवार दिनांक 24-01-2027\nके शुभ दिन सायं 5:00 बजे चांदला विधि रखी है।\nअतः इस शुभ अवसर पर पधारकर शोभा बढ़ाएँ।' },
      ],
    },
    {
      title: 'भोजन समारोह',
      sections: [
        { heading: '', body: '***भोजन समारोह***\n[[3-rule]]\nदिनांक 24-01-2027, रविवार\nसायं 5:00 बजे\nआप ........ व्यक्ति पधारें।' },
        { heading: '', body: '***शुभ स्थल***\n[[3-rule]]\nश्री हरि कृष्ण हॉल\nपहली मंज़िल, नीलकंठ प्लाज़ा,\nस्टेशन रोड, राजकोट' },
        { heading: '', body: '***निमंत्रक***\n[[3-rule]]\nभरतभाई गोपालभाई बेलाडिया\nगोपालभाई रणछोड़भाई बेलाडिया\nअल्पेशभाई गोपालभाई बेलाडिया\n98765 43210, 91234 56789' },
      ],
    },
  ],
  mr: [
    {
      title: 'चांदला विधि',
      sections: [
        { heading: '', body: '॥ श्री गणेशाय नमः ॥' },
        { heading: '', body: '**चांदला विधि**' },
        { heading: '', body: '~AR~' },
        { heading: '', body: '**चि. आर्यन**\n[[1-ring]]\n**चि. रुशिता**' },
      ],
    },
    {
      title: 'चांदला विधि',
      sections: [
        { heading: '', body: '॥ श्री गणेशाय नमः ॥' },
        { heading: '', body: 'कळविण्यास आनंद होतो की\nआमची कुलदेवी श्री ब्रह्माणी माताजी यांच्या असीम कृपेने\nमाखणिया निवासी (सध्या सुरत)\nअ.सौ. वर्षाबेन व श्री. भरतभाई गोपालभाई बेलाडिया यांचे सुपुत्र' },
        { heading: '', body: '**चि. आर्यन**\n[[1-ring]]\n**चि. रुशिता**' },
        { heading: '', body: 'शिवेंद्रनगर निवासी (सध्या सुरत)\nअ.सौ. हंसाबेन व श्री. रमेशभाई नरशीभाई देसाई यांची सुकन्या\nयांचा संवत 2083 पौष वद्य 2, रविवार दि. 24-01-2027\nया शुभ दिवशी सायं. 5:00 वा. चांदला विधि ठेवला आहे.\nतरी या शुभ प्रसंगी उपस्थित राहून शोभा वाढवावी.' },
      ],
    },
    {
      title: 'भोजन समारंभ',
      sections: [
        { heading: '', body: '***भोजन समारंभ***\n[[3-rule]]\nदि. 24-01-2027, रविवार रोजी\nसायं. 5:00 वा.\nआपण ........ व्यक्तींनी यावे.' },
        { heading: '', body: '***शुभ स्थळ***\n[[3-rule]]\nश्री हरि कृष्ण हॉल\nपहिला मजला, नीलकंठ प्लाझा,\nस्टेशन रोड, राजकोट' },
        { heading: '', body: '***निमंत्रक***\n[[3-rule]]\nभरतभाई गोपालभाई बेलाडिया\nगोपालभाई रणछोडभाई बेलाडिया\nअल्पेशभाई गोपालभाई बेलाडिया\n98765 43210, 91234 56789' },
      ],
    },
  ],
  pa: [
    {
      title: 'ਚਾਂਦਲਾ ਵਿਧੀ',
      sections: [
        { heading: '', body: '॥ ਸ਼੍ਰੀ ਗਣੇਸ਼ਾਯ ਨਮਃ ॥' },
        { heading: '', body: '**ਚਾਂਦਲਾ ਵਿਧੀ**' },
        { heading: '', body: '~AR~' },
        { heading: '', body: '**ਚਿ. ਆਰੀਅਨ**\n[[1-ring]]\n**ਚਿ. ਰੁਸ਼ਿਤਾ**' },
      ],
    },
    {
      title: 'ਚਾਂਦਲਾ ਵਿਧੀ',
      sections: [
        { heading: '', body: '॥ ਸ਼੍ਰੀ ਗਣੇਸ਼ਾਯ ਨਮਃ ॥' },
        { heading: '', body: 'ਬੜੀ ਖੁਸ਼ੀ ਨਾਲ ਸੂਚਿਤ ਕਰਦੇ ਹਾਂ ਕਿ\nਸਾਡੀ ਕੁਲਦੇਵੀ ਸ਼੍ਰੀ ਬ੍ਰਹਮਾਣੀ ਮਾਤਾਜੀ ਦੀ ਅਪਾਰ ਕਿਰਪਾ ਨਾਲ\nਮਾਖਣੀਆ ਨਿਵਾਸੀ (ਹੁਣ ਸੂਰਤ)\nਸ਼੍ਰੀਮਤੀ ਵਰਸ਼ਾਬੇਨ ਅਤੇ ਸ਼੍ਰੀ ਭਰਤਭਾਈ ਗੋਪਾਲਭਾਈ ਬੇਲਾਡੀਆ ਦੇ ਸਪੁੱਤਰ' },
        { heading: '', body: '**ਚਿ. ਆਰੀਅਨ**\n[[1-ring]]\n**ਚਿ. ਰੁਸ਼ਿਤਾ**' },
        { heading: '', body: 'ਸ਼ਿਵੇਂਦਰਨਗਰ ਨਿਵਾਸੀ (ਹੁਣ ਸੂਰਤ)\nਸ਼੍ਰੀਮਤੀ ਹੰਸਾਬੇਨ ਅਤੇ ਸ਼੍ਰੀ ਰਮੇਸ਼ਭਾਈ ਨਰਸ਼ੀਭਾਈ ਦੇਸਾਈ ਦੀ ਸਪੁੱਤਰੀ\nਨਾਲ ਸੰਵਤ 2083 ਪੋਹ ਵਦੀ 2, ਐਤਵਾਰ ਮਿਤੀ 24-01-2027\nਦੇ ਸ਼ੁਭ ਦਿਨ ਸ਼ਾਮ 5:00 ਵਜੇ ਚਾਂਦਲਾ ਵਿਧੀ ਰੱਖੀ ਹੈ।\nਇਸ ਸ਼ੁਭ ਮੌਕੇ ਤੇ ਪਧਾਰ ਕੇ ਸ਼ੋਭਾ ਵਧਾਉਣਾ ਜੀ।' },
      ],
    },
    {
      title: 'ਪ੍ਰੀਤੀ ਭੋਜ',
      sections: [
        { heading: '', body: '***ਪ੍ਰੀਤੀ ਭੋਜ***\n[[3-rule]]\nਮਿਤੀ 24-01-2027, ਐਤਵਾਰ\nਸ਼ਾਮ 5:00 ਵਜੇ\nਆਪ ਜੀ ........ ਵਿਅਕਤੀ ਪਧਾਰਨਾ।' },
        { heading: '', body: '***ਸ਼ੁਭ ਸਥਾਨ***\n[[3-rule]]\nਸ਼੍ਰੀ ਹਰੀ ਕ੍ਰਿਸ਼ਨ ਹਾਲ\nਪਹਿਲੀ ਮੰਜ਼ਿਲ, ਨੀਲਕੰਠ ਪਲਾਜ਼ਾ,\nਸਟੇਸ਼ਨ ਰੋਡ, ਰਾਜਕੋਟ' },
        { heading: '', body: '***ਸੱਦਾ ਦੇਣ ਵਾਲੇ***\n[[3-rule]]\nਭਰਤਭਾਈ ਗੋਪਾਲਭਾਈ ਬੇਲਾਡੀਆ\nਗੋਪਾਲਭਾਈ ਰਣਛੋੜਭਾਈ ਬੇਲਾਡੀਆ\nਅਲਪੇਸ਼ਭਾਈ ਗੋਪਾਲਭਾਈ ਬੇਲਾਡੀਆ\n98765 43210, 91234 56789' },
      ],
    },
  ],
  ta: [
    {
      title: 'சாந்த்லா விதி',
      sections: [
        { heading: '', body: '|| ஸ்ரீ கணேசாய நம: ||' },
        { heading: '', body: '**சாந்த்லா விதி**' },
        { heading: '', body: '~AR~' },
        { heading: '', body: '**செல்வன் ஆர்யன்**\n[[1-ring]]\n**செல்வி ருஷிதா**' },
      ],
    },
    {
      title: 'சாந்த்லா விதி',
      sections: [
        { heading: '', body: '|| ஸ்ரீ கணேசாய நம: ||' },
        { heading: '', body: 'மகிழ்ச்சியுடன் தெரிவிப்பது, எங்கள்\nகுலதெய்வம் ஸ்ரீ பிரம்மாணி மாதாவின் அருளால்\nமாகணியா (தற்போது சூரத்)\nதிருமதி வர்ஷாபென் & திரு பரத்பாய் கோபால்பாய் பேலாடியா அவர்களின் புதல்வன்' },
        { heading: '', body: '**செல்வன் ஆர்யன்**\n[[1-ring]]\n**செல்வி ருஷிதா**' },
        { heading: '', body: 'ஷிவேந்திரநகர் (தற்போது சூரத்)\nதிருமதி ஹன்சாபென் & திரு ரமேஷ்பாய் நர்ஷிபாய் தேசாய் அவர்களின் புதல்வி\nஆகியோரின் சாந்த்லா விதி சம்வத் 2083 பௌஷ தேய்பிறை 2, ஞாயிறு 24-01-2027\nஅன்று மாலை 5:00 மணிக்கு நடைபெறும்.\nஇந்த நன்னாளில் வருகை தந்து சிறப்பிக்கவும்.' },
      ],
    },
    {
      title: 'விருந்து',
      sections: [
        { heading: '', body: '***விருந்து***\n[[3-rule]]\n24-01-2027 ஞாயிறு அன்று\nமாலை 5:00 மணி\n........ நபர்களுடன் வருக.' },
        { heading: '', body: '***இடம்***\n[[3-rule]]\nஸ்ரீ ஹரி கிருஷ்ணா ஹால்\nமுதல் தளம், நீலகண்ட் பிளாசா,\nஸ்டேஷன் ரோடு, ராஜ்கோட்' },
        { heading: '', body: '***அழைப்பாளர்கள்***\n[[3-rule]]\nபரத்பாய் கோபால்பாய் பேலாடியா\nகோபால்பாய் ரண்சோட்பாய் பேலாடியா\nஅல்பேஷ்பாய் கோபால்பாய் பேலாடியா\n98765 43210, 91234 56789' },
      ],
    },
  ],
}
export default tr
