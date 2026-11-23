import type { Template } from '../../templates'

// The printed card's pages in every language but Gujarati: same pages, same sections, same marks; only the words change.
const tr: NonNullable<Template['tr']> = {
  en: [
    {
      title: 'Simant Sanskar',
      sections: [
        { heading: '', body: '|| Shri Ganeshaya Namah ||' },
        { heading: '', body: '<<**Simant**\n>>**Sanskar**' },
        { heading: '', body: '***Patel Family***' },
        { heading: '', body: 'extends you a warm welcome.' },
      ],
    },
    {
      title: 'Simant Ceremony',
      sections: [
        { heading: '', body: '|| Shri Ganeshaya Namah ||' },
        { heading: '', body: '**Simant Sanskar**' },
        { heading: '', body: 'With joy we share that by the boundless\ngrace of our Kuldevi Shri Brahmani Mataji,\nof Depla (now Surat), son of Smt. Shobhanaben and\nShri Deepakbhai Manojbhai Patel' },
        { heading: '', body: '*wife of Shri Dhruvit*' },
        { heading: '', body: '**Smt. Nidhi**' },
        { heading: '', body: 'will have her Simant ceremony on Phagan Sud 4,\nSamvat 2081, Monday, 03-03-2025,\nat 5:30 PM. Please come on this happy occasion\nto bless our daughter-in-law.' },
        { heading: '', body: '[[2-rule]]\n*:: Dinner ::*\nat 5:00 PM\nPlease come, ........... persons.' },
        { heading: '', body: '[[2-rule]]\n*:: Venue ::*\nGokul Farm,\nopposite P.P. Savani School,\nAbrama Road, Mota Varachha, Surat.' },
      ],
    },
  ],
  hi: [
    {
      title: 'सीमंत संस्कार',
      sections: [
        { heading: '', body: '॥ श्री गणेशाय नमः ॥' },
        { heading: '', body: '<<**सीमंत**\n>>**संस्कार**' },
        { heading: '', body: '***पटेल परिवार***' },
        { heading: '', body: 'आपका हार्दिक स्वागत करता है।' },
      ],
    },
    {
      title: 'सीमंत विधि',
      sections: [
        { heading: '', body: '॥ श्री गणेशाय नमः ॥' },
        { heading: '', body: '**सीमंत संस्कार**' },
        { heading: '', body: 'सहर्ष सूचित करते हैं कि हमारी कुलदेवी\nश्री ब्रह्माणी माताजी की असीम कृपा से\nदेपला निवासी (हाल सूरत) श्रीमती शोभनाबेन एवं\nश्री दीपकभाई मनोजभाई पटेल के सुपुत्र' },
        { heading: '', body: '*श्री धृवित की धर्मपत्नी*' },
        { heading: '', body: '**श्रीमती निधि**' },
        { heading: '', body: 'के सीमंत संस्कार का शुभ मुहूर्त संवत 2081\nफाल्गुन शुक्ल 4, सोमवार, दिनांक 03-03-2025 को\nसायं 5:30 बजे रखा है, अतः इस शुभ अवसर पर\nहमारी पुत्रवधू को आशीर्वाद देने पधारें।' },
        { heading: '', body: '[[2-rule]]\n*:: भोजन समारोह ::*\nसायं 5:00 बजे\nआप ........... व्यक्ति पधारें।' },
        { heading: '', body: '[[2-rule]]\n*:: शुभ स्थल ::*\nगोकुल फार्म,\nपी.पी. सवाणी स्कूल के सामने,\nअबरामा रोड, मोटा वराछा, सूरत।' },
      ],
    },
  ],
  mr: [
    {
      title: 'सीमंत संस्कार',
      sections: [
        { heading: '', body: '॥ श्री गणेशाय नमः ॥' },
        { heading: '', body: '<<**सीमंत**\n>>**संस्कार**' },
        { heading: '', body: '***पटेल परिवार***' },
        { heading: '', body: 'आपले हार्दिक स्वागत करत आहे.' },
      ],
    },
    {
      title: 'डोहाळे जेवण',
      sections: [
        { heading: '', body: '॥ श्री गणेशाय नमः ॥' },
        { heading: '', body: '**सीमंत संस्कार**' },
        { heading: '', body: 'कळविण्यास आनंद होतो की आमची कुलदेवी\nश्री ब्रह्माणी माताजी यांच्या असीम कृपेने\nदेपला निवासी (सध्या सुरत) सौ. शोभनाबेन व\nश्री. दीपकभाई मनोजभाई पटेल यांचे सुपुत्र' },
        { heading: '', body: '*श्री. धृवित यांच्या धर्मपत्नी*' },
        { heading: '', body: '**सौ. निधी**' },
        { heading: '', body: 'यांच्या सीमंत विधीचा शुभ मुहूर्त संवत 2081\nफाल्गुन शुद्ध 4, सोमवार, दि. 03-03-2025 रोजी\nसायं. 5:30 वा. ठेवला आहे, तरी या शुभ प्रसंगी\nआमच्या सुनेला आशीर्वाद देण्यास अवश्य यावे.' },
        { heading: '', body: '[[2-rule]]\n*:: भोजन समारंभ ::*\nसायं. 5:00 वा.\nआपण ........... व्यक्तींनी यावे.' },
        { heading: '', body: '[[2-rule]]\n*:: शुभ स्थळ ::*\nगोकुळ फार्म,\nपी.पी. सवाणी स्कूलसमोर,\nअब्रामा रोड, मोटा वराछा, सुरत.' },
      ],
    },
  ],
  pa: [
    {
      title: 'ਗੋਦ ਭਰਾਈ',
      sections: [
        { heading: '', body: '॥ ਸ਼੍ਰੀ ਗਣੇਸ਼ਾਯ ਨਮਃ ॥' },
        { heading: '', body: '<<**ਗੋਦ**\n>>**ਭਰਾਈ**' },
        { heading: '', body: '***ਪਟੇਲ ਪਰਿਵਾਰ***' },
        { heading: '', body: 'ਆਪ ਜੀ ਦਾ ਹਾਰਦਿਕ ਸੁਆਗਤ ਕਰਦਾ ਹੈ।' },
      ],
    },
    {
      title: 'ਗੋਦ ਭਰਾਈ ਦੀ ਰਸਮ',
      sections: [
        { heading: '', body: '॥ ਸ਼੍ਰੀ ਗਣੇਸ਼ਾਯ ਨਮਃ ॥' },
        { heading: '', body: '**ਗੋਦ ਭਰਾਈ**' },
        { heading: '', body: 'ਬੜੀ ਖੁਸ਼ੀ ਨਾਲ ਸੂਚਿਤ ਕਰਦੇ ਹਾਂ ਕਿ ਸਾਡੀ ਕੁਲਦੇਵੀ\nਸ਼੍ਰੀ ਬ੍ਰਹਮਾਣੀ ਮਾਤਾਜੀ ਦੀ ਅਪਾਰ ਕਿਰਪਾ ਨਾਲ\nਦੇਪਲਾ ਨਿਵਾਸੀ (ਹੁਣ ਸੂਰਤ) ਸ਼੍ਰੀਮਤੀ ਸ਼ੋਭਨਾਬੇਨ ਅਤੇ\nਸ਼੍ਰੀ ਦੀਪਕਭਾਈ ਮਨੋਜਭਾਈ ਪਟੇਲ ਦੇ ਸਪੁੱਤਰ' },
        { heading: '', body: '*ਸ਼੍ਰੀ ਧ੍ਰਿਵਿਤ ਦੀ ਧਰਮਪਤਨੀ*' },
        { heading: '', body: '**ਸ਼੍ਰੀਮਤੀ ਨਿਧੀ**' },
        { heading: '', body: 'ਦੀ ਗੋਦ ਭਰਾਈ ਦਾ ਸ਼ੁਭ ਮਹੂਰਤ ਸੰਵਤ 2081\nਫੱਗਣ ਸੁਦੀ 4, ਸੋਮਵਾਰ, ਮਿਤੀ 03-03-2025 ਨੂੰ\nਸ਼ਾਮ 5:30 ਵਜੇ ਰੱਖਿਆ ਹੈ, ਇਸ ਸ਼ੁਭ ਮੌਕੇ ਤੇ\nਸਾਡੀ ਨੂੰਹ ਨੂੰ ਅਸੀਸ ਦੇਣ ਲਈ ਪਧਾਰਨਾ ਜੀ।' },
        { heading: '', body: '[[2-rule]]\n*:: ਪ੍ਰੀਤੀ ਭੋਜ ::*\nਸ਼ਾਮ 5:00 ਵਜੇ\nਆਪ ਜੀ ........... ਵਿਅਕਤੀ ਪਧਾਰਨਾ।' },
        { heading: '', body: '[[2-rule]]\n*:: ਸ਼ੁਭ ਸਥਾਨ ::*\nਗੋਕੁਲ ਫਾਰਮ,\nਪੀ.ਪੀ. ਸਵਾਣੀ ਸਕੂਲ ਦੇ ਸਾਹਮਣੇ,\nਅਬਰਾਮਾ ਰੋਡ, ਮੋਟਾ ਵਰਾਛਾ, ਸੂਰਤ।' },
      ],
    },
  ],
  ta: [
    {
      title: 'வளைகாப்பு விழா',
      sections: [
        { heading: '', body: '॥ ஸ்ரீ கணேசாய நமஃ ॥' },
        { heading: '', body: '<<**வளைகாப்பு**\n>>**விழா**' },
        { heading: '', body: '***படேல் குடும்பம்***' },
        { heading: '', body: 'தங்களை அன்புடன் வரவேற்கிறது.' },
      ],
    },
    {
      title: 'சீமந்தச் சடங்கு',
      sections: [
        { heading: '', body: '॥ ஸ்ரீ கணேசாய நமஃ ॥' },
        { heading: '', body: '**வளைகாப்பு விழா**' },
        { heading: '', body: 'மகிழ்ச்சியுடன் தெரிவிப்பது, எங்கள்\nகுலதெய்வம் ஸ்ரீ பிரம்மாணி மாதாவின்\nஅருளால் தேப்லா (தற்போது சூரத்)\nதிருமதி ஷோபனாபென் &\nதிரு தீபக்பாய் மனோஜ்பாய் படேல்\nஅவர்களின் புதல்வன்' },
        { heading: '', body: '*திரு த்ருவித்தின் துணைவியார்*' },
        { heading: '', body: '**திருமதி நிதி**' },
        { heading: '', body: 'சீமந்தம்: சம்வத் 2081 பால்குன வளர்பிறை 4,\n03-03-2025 திங்கள், மாலை 5:30 மணி.\nஎங்கள் மருமகளை ஆசீர்வதிக்க\nவருகை தாருங்கள்.' },
        { heading: '', body: '[[2-rule]]\n*:: விருந்து ::*\nமாலை 5:00 மணி\n........... நபர்களுடன் வருக.' },
        { heading: '', body: '[[2-rule]]\n*:: இடம் ::*\nகோகுல் ஃபார்ம்,\nபி.பி. சவானி பள்ளி எதிரில்,\nஅப்ராமா ரோடு, மோட்டா வராச்சா,\nசூரத்.' },
      ],
    },
  ],
}
export default tr
