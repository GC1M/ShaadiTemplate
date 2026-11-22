import type { Template } from '../../templates'

// The printed card's pages in every language but Gujarati: same pages, same sections, same marks; only the words change.
const tr: NonNullable<Template['tr']> = {
  en: [
    {
      title: 'Chandla Vidhi',
      sections: [
        { heading: '', body: '*|| Shri Ganeshaya Namah ||*' },
        { heading: '', body: '**Chandla Vidhi**' },
        { heading: '', body: 'Dear ______________________' },
        { heading: '', body: 'With great joy we share that by the boundless grace\nof our Kuldevi Shri Ashapura Mataji, the Chandla Vidhi of\nthe son of Smt. Shetalben and Shri Pankajbhai Patel' },
        { heading: '', body: '**Chi. Aryan**' },
        { heading: '', body: 'with' },
        { heading: '', body: '**Chi. Rushita**' },
        { heading: '', body: 'daughter of Smt. Dakshaben and Shri Rajubhai Patel, is arranged.\nPlease grace this happy occasion with your presence.' },
        { heading: '', body: '**Sunday, 08 March 2026**\nat 10:00 AM' },
        { heading: '', body: '***Venue***\nTasty Meals Restaurant and Banquet,\nSecond Floor, Supreme Square, Bapa Sitaram Chowk Road,\nKrishnanagar, New Naroda, Ahmedabad' },
        { heading: '', body: '***Hosts***\nShri Pankajbhai Rasikbhai Patel\nSmt. Shetalben Pankajbhai Patel' },
      ],
    },
  ],
  hi: [
    {
      title: 'चांदला विधि',
      sections: [
        { heading: '', body: '*॥ श्री गणेशाय नमः ॥*' },
        { heading: '', body: '**चांदला विधि**' },
        { heading: '', body: 'स्नेही स्वजन ______________________' },
        { heading: '', body: 'सहर्ष सूचित करते हैं कि हमारी कुलदेवी\nश्री आशापुरा माताजी की असीम कृपा से\nअ.सौ. शेतलबेन एवं श्री पंकजभाई पटेल के सुपुत्र' },
        { heading: '', body: '**चि. आर्यन**' },
        { heading: '', body: 'संग' },
        { heading: '', body: '**चि. रुशिता**' },
        { heading: '', body: 'अ.सौ. दक्षाबेन एवं श्री राजूभाई पटेल की सुपुत्री की चांदला विधि रखी है।\nअतः इस शुभ अवसर पर पधारकर शोभा बढ़ाएँ।' },
        { heading: '', body: '**रविवार 08 मार्च 2026**\nसुबह 10:00 बजे' },
        { heading: '', body: '***स्थल***\nटेस्टी मील्स रेस्टोरेंट एंड बैंक्वेट,\nदूसरी मंज़िल, सुप्रीम स्क्वेयर, बापा सीताराम चौक रोड,\nकृष्णनगर, नया नरोडा, अहमदाबाद' },
        { heading: '', body: '***निमंत्रक***\nश्री पंकजभाई रसिकभाई पटेल\nश्रीमती शेतलबेन पंकजभाई पटेल' },
      ],
    },
  ],
  mr: [
    {
      title: 'चांदला विधि',
      sections: [
        { heading: '', body: '*॥ श्री गणेशाय नमः ॥*' },
        { heading: '', body: '**चांदला विधि**' },
        { heading: '', body: 'स्नेही स्वजन ______________________' },
        { heading: '', body: 'कळविण्यास आनंद होतो की आमची कुलदेवी\nश्री आशापुरा माताजी यांच्या असीम कृपेने\nअ.सौ. शेतलबेन व श्री. पंकजभाई पटेल यांचे सुपुत्र' },
        { heading: '', body: '**चि. आर्यन**' },
        { heading: '', body: 'सोबत' },
        { heading: '', body: '**चि. रुशिता**' },
        { heading: '', body: 'अ.सौ. दक्षाबेन व श्री. राजूभाई पटेल यांची सुकन्या, यांचा चांदला विधि ठेवला आहे.\nतरी या शुभ प्रसंगी उपस्थित राहून शोभा वाढवावी.' },
        { heading: '', body: '**रविवार 08 मार्च 2026**\nसकाळी 10:00 वा.' },
        { heading: '', body: '***स्थळ***\nटेस्टी मील्स रेस्टॉरंट अँड बँक्वेट,\nदुसरा मजला, सुप्रीम स्क्वेअर, बापा सीताराम चौक रोड,\nकृष्णनगर, नवा नरोडा, अहमदाबाद' },
        { heading: '', body: '***निमंत्रक***\nश्री. पंकजभाई रसिकभाई पटेल\nसौ. शेतलबेन पंकजभाई पटेल' },
      ],
    },
  ],
  pa: [
    {
      title: 'ਚਾਂਦਲਾ ਵਿਧੀ',
      sections: [
        { heading: '', body: '*॥ ਸ਼੍ਰੀ ਗਣੇਸ਼ਾਯ ਨਮਃ ॥*' },
        { heading: '', body: '**ਚਾਂਦਲਾ ਵਿਧੀ**' },
        { heading: '', body: 'ਪਿਆਰੇ ਸੱਜਣ ______________________' },
        { heading: '', body: 'ਬੜੀ ਖੁਸ਼ੀ ਨਾਲ ਸੂਚਿਤ ਕਰਦੇ ਹਾਂ ਕਿ ਸਾਡੀ ਕੁਲਦੇਵੀ\nਸ਼੍ਰੀ ਆਸ਼ਾਪੁਰਾ ਮਾਤਾਜੀ ਦੀ ਅਪਾਰ ਕਿਰਪਾ ਨਾਲ\nਸ਼੍ਰੀਮਤੀ ਸ਼ੇਤਲਬੇਨ ਅਤੇ ਸ਼੍ਰੀ ਪੰਕਜਭਾਈ ਪਟੇਲ ਦੇ ਸਪੁੱਤਰ' },
        { heading: '', body: '**ਚਿ. ਆਰੀਅਨ**' },
        { heading: '', body: 'ਸੰਗ' },
        { heading: '', body: '**ਚਿ. ਰੁਸ਼ਿਤਾ**' },
        { heading: '', body: 'ਸ਼੍ਰੀਮਤੀ ਦਕਸ਼ਾਬੇਨ ਅਤੇ ਸ਼੍ਰੀ ਰਾਜੂਭਾਈ ਪਟੇਲ ਦੀ ਸਪੁੱਤਰੀ ਦੀ ਚਾਂਦਲਾ ਵਿਧੀ ਰੱਖੀ ਹੈ।\nਇਸ ਸ਼ੁਭ ਮੌਕੇ ਤੇ ਪਧਾਰ ਕੇ ਸ਼ੋਭਾ ਵਧਾਉਣਾ ਜੀ।' },
        { heading: '', body: '**ਐਤਵਾਰ 08 ਮਾਰਚ 2026**\nਸਵੇਰੇ 10:00 ਵਜੇ' },
        { heading: '', body: '***ਸਥਾਨ***\nਟੇਸਟੀ ਮੀਲਜ਼ ਰੈਸਟੋਰੈਂਟ ਐਂਡ ਬੈਂਕੁਇਟ,\nਦੂਜੀ ਮੰਜ਼ਿਲ, ਸੁਪਰੀਮ ਸਕੁਏਅਰ, ਬਾਪਾ ਸੀਤਾਰਾਮ ਚੌਕ ਰੋਡ,\nਕ੍ਰਿਸ਼ਨਨਗਰ, ਨਵਾਂ ਨਰੋਡਾ, ਅਹਿਮਦਾਬਾਦ' },
        { heading: '', body: '***ਸੱਦਾ ਦੇਣ ਵਾਲੇ***\nਸ਼੍ਰੀ ਪੰਕਜਭਾਈ ਰਸਿਕਭਾਈ ਪਟੇਲ\nਸ਼੍ਰੀਮਤੀ ਸ਼ੇਤਲਬੇਨ ਪੰਕਜਭਾਈ ਪਟੇਲ' },
      ],
    },
  ],
  ta: [
    {
      title: 'சாந்த்லா விதி',
      sections: [
        { heading: '', body: '*|| ஸ்ரீ கணேசாய நம: ||*' },
        { heading: '', body: '**சாந்த்லா விதி**' },
        { heading: '', body: 'அன்புள்ள ______________________' },
        { heading: '', body: 'மகிழ்ச்சியுடன் தெரிவிப்பது, எங்கள் குலதெய்வம்\nஸ்ரீ ஆஷாபுரா மாதாவின் அருளால்\nதிருமதி ஷேதல்பென் & திரு பங்கஜ்பாய் படேல் அவர்களின் புதல்வன்' },
        { heading: '', body: '**செல்வன் ஆர்யன்**' },
        { heading: '', body: 'உடன்' },
        { heading: '', body: '**செல்வி ருஷிதா**' },
        { heading: '', body: 'திருமதி தக்ஷாபென் & திரு ராஜுபாய் படேல் அவர்களின் புதல்வி, சாந்த்லா விதி நடைபெறும்.\nஇந்த நன்னாளில் வருகை தந்து சிறப்பிக்கவும்.' },
        { heading: '', body: '**ஞாயிறு 08 மார்ச் 2026**\nகாலை 10:00 மணி' },
        { heading: '', body: '***இடம்***\nடேஸ்டி மீல்ஸ் ரெஸ்டாரன்ட் அண்ட் பேங்க்வெட்,\nஇரண்டாம் தளம், சுப்ரீம் ஸ்கொயர், பாபா சீதாராம் சௌக் ரோடு,\nகிருஷ்ணநகர், நியூ நரோடா, அகமதாபாத்' },
        { heading: '', body: '***அழைப்பாளர்கள்***\nதிரு பங்கஜ்பாய் ரசிக்பாய் படேல்\nதிருமதி ஷேதல்பென் பங்கஜ்பாய் படேல்' },
      ],
    },
  ],
}
export default tr
