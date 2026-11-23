import type { Template } from '../../templates'

// The printed card's pages in every language but Gujarati: same pages, same sections, same marks; only the words change.
const tr: NonNullable<Template['tr']> = {
  en: [
    {
      title: 'Simant Sanskar',
      sections: [
        { heading: '', body: '*|| Shri Ganeshaya Namah ||*' },
        { heading: '', body: 'The sweetest, most beautiful\nand fulfilling moment of married life is' },
        { heading: '', body: '**Motherhood**' },
        { heading: '', body: 'And the proud, auspicious moment\nof first motherhood is' },
        { heading: '', body: '**Simant Sanskar**' },
      ],
    },
    {
      title: 'Simant Ceremony',
      sections: [
        { heading: '', body: '*|| Shri Ganeshaya Namah ||*' },
        { heading: '', body: 'With great joy we share that\nby the boundless grace and blessings of our Kuldevi Mahalakshmi Mataji,\nson of Smt. Ranjanben and Shri Madhavlal Manilal Patel' },
        { heading: '', body: '*wife of Chi. Shubham*' },
        { heading: '', body: '*Smt. Hiral*' },
        { heading: '', body: 'will have her Simant ceremony on Vikram Samvat 2082,\nPhagun Sud 2, Thursday, 19-02-2026,\nfrom 10:00 AM, in the Vedic tradition\nas the scriptures prescribe. Please come to bless\nour daughter-in-law and grace the occasion.' },
        { heading: '', body: '*:: Lunch ::*\nThursday, 19-02-2026,\nfrom 10:45 AM until your arrival' },
        { heading: '', body: '*:: Venue ::*\nVangi Restaurant, Shop No. 6, 7,\nCelister Building, Rajpath Rangoli Road,\nBodakdev, Ahmedabad, Gujarat' },
      ],
    },
    {
      title: 'Patel Family',
      sections: [
        { heading: '', body: '*|| Shri Ganeshaya Namah ||*' },
        { heading: '', body: '*:: Invited by ::*\nLate Manilal Ishwardas Patel\nShri Madhavlal Manilal Patel\nSmt. Ranjanben Madhavlal Patel\nKumar Mayankkumar Madhavlal Patel\nMo. 98765 43210, 91234 56789' },
        { heading: '', body: '**Patel Family**' },
        { heading: '', body: 'warmly welcomes you.' },
      ],
    },
  ],
  hi: [
    {
      title: 'सीमंत संस्कार',
      sections: [
        { heading: '', body: '*॥ श्री गणेशाय नमः ॥*' },
        { heading: '', body: 'दाम्पत्य जीवन की मधुर, सुंदर\nऔर समृद्ध घड़ी है' },
        { heading: '', body: '**मातृत्व**' },
        { heading: '', body: 'प्रथम मातृत्व प्राप्ति का गौरवमय\nशुभ क्षण है' },
        { heading: '', body: '**सीमंत संस्कार**' },
      ],
    },
    {
      title: 'सीमंत विधि',
      sections: [
        { heading: '', body: '*॥ श्री गणेशाय नमः ॥*' },
        { heading: '', body: 'सहर्ष सूचित करते हैं कि\nहमारी कुलदेवी महालक्ष्मी माताजी की असीम कृपा और आशीर्वाद से\nश्रीमती रंजनबेन एवं श्री माधवलाल मणिलाल पटेल के सुपुत्र' },
        { heading: '', body: '*चि. शुभम की धर्मपत्नी*' },
        { heading: '', body: '*श्रीमती हीरल*' },
        { heading: '', body: 'की सीमंत विधि का शुभ मुहूर्त विक्रम संवत 2082\nफाल्गुन सुदी द्वितीया, गुरुवार, दि. 19-02-2026 को\nप्रातः 10:00 बजे से वैदिक परंपरा एवं शास्त्रोक्त\nरीति से निश्चित है, अतः इस शुभ अवसर पर पुत्रवधू को\nआशीर्वाद देने पधारकर शोभा बढ़ाएँ।' },
        { heading: '', body: '*:: भोजन समारोह ::*\nगुरुवार, दि. 19-02-2026 को\nप्रातः 10:45 बजे से आपके आगमन तक' },
        { heading: '', body: '*:: शुभ स्थल ::*\nवांगी रेस्टोरेंट, शॉप नं. 6, 7,\nसेलिस्टर बिल्डिंग, राजपथ रंगोली रोड,\nबोडकदेव, अहमदाबाद, गुजरात' },
      ],
    },
    {
      title: 'पटेल परिवार',
      sections: [
        { heading: '', body: '*॥ श्री गणेशाय नमः ॥*' },
        { heading: '', body: '*:: निमंत्रक ::*\nस्व. मणिलाल ईश्वरदास पटेल\nश्री माधवलाल मणिलाल पटेल\nश्रीमती रंजनबेन माधवलाल पटेल\nकुमार मयंककुमार माधवलाल पटेल\nमो. 98765 43210, 91234 56789' },
        { heading: '', body: '**पटेल परिवार**' },
        { heading: '', body: 'आपका हार्दिक स्वागत करता है।' },
      ],
    },
  ],
  mr: [
    {
      title: 'डोहाळे जेवण',
      sections: [
        { heading: '', body: '*॥ श्री गणेशाय नमः ॥*' },
        { heading: '', body: 'दांपत्य जीवनातील मधुर, सुंदर\nआणि समृद्ध क्षण म्हणजे' },
        { heading: '', body: '**मातृत्व**' },
        { heading: '', body: 'पहिल्या मातृत्वाचा अभिमानास्पद\nशुभ क्षण म्हणजे' },
        { heading: '', body: '**सीमंत संस्कार**' },
      ],
    },
    {
      title: 'सीमंत विधी',
      sections: [
        { heading: '', body: '*॥ श्री गणेशाय नमः ॥*' },
        { heading: '', body: 'कळविण्यास अत्यंत आनंद होतो की\nआमची कुलदेवी महालक्ष्मी मातेच्या असीम कृपेने व आशीर्वादाने\nअ.सौ. रंजनबेन व श्री. माधवलाल मणिलाल पटेल यांचे सुपुत्र' },
        { heading: '', body: '*चि. शुभम यांच्या धर्मपत्नी*' },
        { heading: '', body: '*अ.सौ. हीरल*' },
        { heading: '', body: 'यांच्या सीमंत विधीचा शुभ मुहूर्त विक्रम संवत 2082\nफाल्गुन शुद्ध द्वितीया, गुरुवार, दि. 19-02-2026 रोजी\nसकाळी 10:00 वाजल्यापासून वैदिक परंपरा व शास्त्रोक्त\nपद्धतीने ठरला आहे, तरी या शुभ प्रसंगी आमच्या सुनेला\nआशीर्वाद देण्यास उपस्थित राहून शोभा वाढवावी.' },
        { heading: '', body: '*:: भोजन समारंभ ::*\nगुरुवार, दि. 19-02-2026 रोजी\nसकाळी 10:45 वाजल्यापासून आपल्या आगमनापर्यंत' },
        { heading: '', body: '*:: शुभ स्थळ ::*\nवांगी रेस्टॉरंट, शॉप नं. 6, 7,\nसेलिस्टर बिल्डिंग, राजपथ रंगोली रोड,\nबोडकदेव, अहमदाबाद, गुजरात' },
      ],
    },
    {
      title: 'पटेल परिवार',
      sections: [
        { heading: '', body: '*॥ श्री गणेशाय नमः ॥*' },
        { heading: '', body: '*:: निमंत्रक ::*\nकै. मणिलाल ईश्वरदास पटेल\nश्री. माधवलाल मणिलाल पटेल\nअ.सौ. रंजनबेन माधवलाल पटेल\nकुमार मयंककुमार माधवलाल पटेल\nमो. 98765 43210, 91234 56789' },
        { heading: '', body: '**पटेल परिवार**' },
        { heading: '', body: 'आपले हार्दिक स्वागत करीत आहे.' },
      ],
    },
  ],
  pa: [
    {
      title: 'ਗੋਦ ਭਰਾਈ',
      sections: [
        { heading: '', body: '*॥ ਸ਼੍ਰੀ ਗਣੇਸ਼ਾਯ ਨਮਃ ॥*' },
        { heading: '', body: 'ਵਿਆਹੁਤਾ ਜੀਵਨ ਦੀ ਮਿੱਠੀ, ਸੁੰਦਰ\nਅਤੇ ਖ਼ੁਸ਼ਹਾਲ ਘੜੀ ਹੈ' },
        { heading: '', body: '**ਮਮਤਾ**' },
        { heading: '', body: 'ਪਹਿਲੀ ਵਾਰ ਮਾਂ ਬਣਨ ਦਾ ਮਾਣਮੱਤਾ\nਸ਼ੁਭ ਪਲ ਹੈ' },
        { heading: '', body: '**ਗੋਦ ਭਰਾਈ**' },
      ],
    },
    {
      title: 'ਗੋਦ ਭਰਾਈ ਦੀ ਰਸਮ',
      sections: [
        { heading: '', body: '*॥ ਸ਼੍ਰੀ ਗਣੇਸ਼ਾਯ ਨਮਃ ॥*' },
        { heading: '', body: 'ਬੜੀ ਖ਼ੁਸ਼ੀ ਨਾਲ ਸੂਚਿਤ ਕਰਦੇ ਹਾਂ ਕਿ\nਸਾਡੀ ਕੁਲਦੇਵੀ ਮਹਾਲਕਸ਼ਮੀ ਮਾਤਾ ਜੀ ਦੀ ਅਸੀਮ ਕਿਰਪਾ ਅਤੇ ਅਸ਼ੀਰਵਾਦ ਨਾਲ\nਸ਼੍ਰੀਮਤੀ ਰੰਜਨਬੇਨ ਅਤੇ ਸ਼੍ਰੀ ਮਾਧਵਲਾਲ ਮਣੀਲਾਲ ਪਟੇਲ ਦੇ ਸਪੁੱਤਰ' },
        { heading: '', body: '*ਚਿ. ਸ਼ੁਭਮ ਦੀ ਧਰਮਪਤਨੀ*' },
        { heading: '', body: '*ਸ਼੍ਰੀਮਤੀ ਹੀਰਲ*' },
        { heading: '', body: 'ਦੀ ਗੋਦ ਭਰਾਈ ਦਾ ਸ਼ੁਭ ਮਹੂਰਤ ਵਿਕਰਮ ਸੰਮਤ 2082\nਫੱਗਣ ਸੁਦੀ ਦੂਜ, ਵੀਰਵਾਰ, 19-02-2026 ਨੂੰ\nਸਵੇਰੇ 10:00 ਵਜੇ ਤੋਂ ਵੈਦਿਕ ਪਰੰਪਰਾ ਅਤੇ ਸ਼ਾਸਤਰਾਂ ਦੀ\nਰੀਤ ਨਾਲ ਤੈਅ ਹੈ, ਸੋ ਇਸ ਸ਼ੁਭ ਮੌਕੇ ਸਾਡੀ ਨੂੰਹ ਨੂੰ\nਅਸ਼ੀਰਵਾਦ ਦੇਣ ਪਧਾਰ ਕੇ ਸ਼ੋਭਾ ਵਧਾਉਣਾ ਜੀ।' },
        { heading: '', body: '*:: ਭੋਜਨ ::*\nਵੀਰਵਾਰ, 19-02-2026 ਨੂੰ\nਸਵੇਰੇ 10:45 ਵਜੇ ਤੋਂ ਤੁਹਾਡੇ ਆਉਣ ਤੱਕ' },
        { heading: '', body: '*:: ਸ਼ੁਭ ਸਥਾਨ ::*\nਵਾਂਗੀ ਰੈਸਟੋਰੈਂਟ, ਸ਼ਾਪ ਨੰ. 6, 7,\nਸੇਲਿਸਟਰ ਬਿਲਡਿੰਗ, ਰਾਜਪਥ ਰੰਗੋਲੀ ਰੋਡ,\nਬੋਡਕਦੇਵ, ਅਹਿਮਦਾਬਾਦ, ਗੁਜਰਾਤ' },
      ],
    },
    {
      title: 'ਪਟੇਲ ਪਰਿਵਾਰ',
      sections: [
        { heading: '', body: '*॥ ਸ਼੍ਰੀ ਗਣੇਸ਼ਾਯ ਨਮਃ ॥*' },
        { heading: '', body: '*:: ਸੱਦਾ ਦੇਣ ਵਾਲੇ ::*\nਸਵ. ਮਣੀਲਾਲ ਈਸ਼ਵਰਦਾਸ ਪਟੇਲ\nਸ਼੍ਰੀ ਮਾਧਵਲਾਲ ਮਣੀਲਾਲ ਪਟੇਲ\nਸ਼੍ਰੀਮਤੀ ਰੰਜਨਬੇਨ ਮਾਧਵਲਾਲ ਪਟੇਲ\nਕੁਮਾਰ ਮਯੰਕਕੁਮਾਰ ਮਾਧਵਲਾਲ ਪਟੇਲ\nਫ਼ੋਨ: 98765 43210, 91234 56789' },
        { heading: '', body: '**ਪਟੇਲ ਪਰਿਵਾਰ**' },
        { heading: '', body: 'ਤੁਹਾਡਾ ਦਿਲੋਂ ਸੁਆਗਤ ਕਰਦਾ ਹੈ।' },
      ],
    },
  ],
  ta: [
    {
      title: 'சீமந்தம்',
      sections: [
        { heading: '', body: '*॥ ஸ்ரீ கணேசாய நமஃ ॥*' },
        { heading: '', body: 'இல்லற வாழ்வின் இனிய, அழகிய\nவளமான தருணம் என்பது' },
        { heading: '', body: '**தாய்மை**' },
        { heading: '', body: 'முதல் தாய்மை பெறும் பெருமைமிகு\nசுப தருணம் என்பது' },
        { heading: '', body: '**சீமந்தம்**' },
      ],
    },
    {
      title: 'வளைகாப்பு விழா',
      sections: [
        { heading: '', body: '*॥ ஸ்ரீ கணேசாய நமஃ ॥*' },
        { heading: '', body: 'மிக்க மகிழ்ச்சியுடன் தெரிவிப்பது என்னவென்றால்\nஎங்கள் குலதெய்வம் மகாலட்சுமி அன்னையின் அளவற்ற அருளாலும் ஆசியாலும்\nதிருமதி ரஞ்சன்பென், திரு மாதவ்லால் மணிலால் படேல் அவர்களின் மகன்' },
        { heading: '', body: '*சி. ஷுபம் அவர்களின் துணைவி*' },
        { heading: '', body: '*திருமதி ஹீரல்*' },
        { heading: '', body: 'அவர்களின் வளைகாப்பு சுப முகூர்த்தம் விக்ரம் சம்வத் 2082\nபங்குனி சுக்ல துவிதியை, வியாழன், 19-02-2026 அன்று\nகாலை 10:00 மணி முதல் வேத மரபுப்படி\nசாஸ்திர முறையில் நடைபெறும். எங்கள் மருமகளை\nஆசீர்வதிக்க வருகை தந்து விழாவைச் சிறப்பிக்கவும்.' },
        { heading: '', body: '*:: விருந்து ::*\nவியாழன், 19-02-2026 அன்று\nகாலை 10:45 மணி முதல் தங்கள் வருகை வரை' },
        { heading: '', body: '*:: இடம் ::*\nவாங்கி ரெஸ்டாரன்ட், கடை எண் 6, 7,\nசெலிஸ்டர் பில்டிங், ராஜ்பத் ரங்கோலி ரோடு,\nபோடக்தேவ், அகமதாபாத், குஜராத்' },
      ],
    },
    {
      title: 'படேல் குடும்பம்',
      sections: [
        { heading: '', body: '*॥ ஸ்ரீ கணேசாய நமஃ ॥*' },
        { heading: '', body: '*:: அழைப்போர் ::*\nஅமரர் மணிலால் ஈஷ்வர்தாஸ் படேல்\nதிரு மாதவ்லால் மணிலால் படேல்\nதிருமதி ரஞ்சன்பென் மாதவ்லால் படேல்\nகுமார் மயங்க்குமார் மாதவ்லால் படேல்\nதொலைபேசி: 98765 43210, 91234 56789' },
        { heading: '', body: '**படேல் குடும்பம்**' },
        { heading: '', body: 'தங்களை அன்புடன் வரவேற்கிறது.' },
      ],
    },
  ],
}
export default tr
