import type { SymbolId } from '../types'
import { COUPLE, PEOPLE, SHOTS, type Photo } from './photos'
import { song } from './music'

// The sample wedding website designs, in the order the gallery shows them. Every couple, family and story here is
// fictional demo content; the venues are real places so the map links work.

// A design is a look (colours, layout and which ornaments to show) plus content (the couple, events, story and
// photos). Each look ships with demo content; a couple's own content (site/SiteEditor.tsx) can wear any look.
// toDesign() joins the two into the Design that WeddingSite.tsx draws.

export type Look = {
  id: string
  name: string
  blurb: string
  tradition: string
  // veil: full-bleed photo with the names over it. split: photo beside a paper panel. arch: the photo in a tall arch.
  layout: 'veil' | 'split' | 'arch'
  // Page colours (bg, raised surface, accent, text, soft accent) and the display face, set as the .ov tokens.
  // panel/panelText: an optional contrast colour for scrolls, date tiles, the gate and the ceremonies section.
  theme: { bg: string; raised: string; accent: string; text: string; soft: string; display: string; script: string; panel?: string; panelText?: string }
  // A pair of caparisoned elephants either side of the save-the-date.
  elephants?: boolean
  // The story as scattered polaroids or swipeable chapter cards instead of hanging frames; scalloped (cusped) arch
  // cards or a timeline for the ceremonies; a countdown over a photo or a garden photo to close instead of the sign.
  storyStyle?: 'rail' | 'polaroids' | 'carousel'
  cards?: 'arch' | 'cusp' | 'timeline'
  closing?: 'sign' | 'countdown' | 'garden'
  // Opening screen: carved doors (default) or a tri-fold card whose side flaps (in `flap`, with a lotus sprig and
  // an elephant each) fold away; `emblem` puts a sacred emblem at the top of the card.
  gate?: 'doors' | 'trifold'
  flap?: string
  emblem?: SymbolId
  // A save-the-date the guest reveals with a tap.
  dateReveal?: boolean
  // A design with its own painted scenes, drawn by its own component in site/bespoke/ instead of the shared
  // sections; cover is its opening screen for the designs page (public/site-art/<id>/cover.webp). The themed
  // websites are their own pages in public/microsites/<id>/ (site/bespoke/Themed.tsx), shown apart on the designs page.
  bespoke?: 'mahal' | 'aangan' | 'nightcall' | 'webline' | 'forgeheart' | 'vicenights'
  cover?: string
  demo: Content
}

// date is YYYY-MM-DD and time HH:MM, both in IST. where: the time and place in words ("7 pm, in the lawns").
// id: a short stable name, so replies still point at the right event after others are added or removed.
// map: optional directions for this event, a maps link or an address; blank shows none. Events saved before the
// field existed (no map at all) keep pointing at the main venue.
export type SiteEvent = { id?: string; name: string; date: string; time: string; where: string; note: string; map?: string; photo?: Photo }
// Any photo left out falls back to the look's demo photo in the same place.
export type Content = {
  couple: [string, string]
  families: [string, string]
  // Who each of the couple is the child of, for the unrolling family scrolls.
  parents: [string, string]
  // Optional "meet the bride and groom" letters, one per partner.
  meet?: { bio: string; photo?: Photo }[]
  // Optional "with best compliments from" scroll: the families sending the invitation.
  compliments?: string[]
  // Optional: the couple's names in their own script, as they would be written on the card ("अदिति संग विहान"),
  // shown on the opening screen and under the names on the cover.
  nativeNames?: string
  // Optional line of invocation on the opening screen, and a short personal note from the couple before the closing.
  invocation?: string
  note?: string
  // Optional line under the venue: where to stay, how to get there.
  stay?: string
  // Optional background music: `track:<id>` (site/music.tsx) or a YouTube link. A themed website's own track is
  // THEME (its public/microsites/<id>/theme.mp3).
  music?: string
  // Sections the couple turned off. Only the ones a design draws whatever the couple writes; the rest go away
  // when left blank. date: the save-the-date countdown; gallery: Aangan's gallery (it falls back to the cover photo).
  hide?: ('rsvp' | 'blessings' | 'date' | 'gallery')[]
  notes: string[]
  // Both optional: events in different places give each event its own directions instead.
  city: string
  venue: string
  invite: string
  rsvpBy: string
  story: { year: string; title: string; body: string; photo?: Photo }[]
  events: SiteEvent[]
  // Which event is the wedding itself, for the hero date, save-the-date and countdown (default: the second).
  mainEvent?: number
  photos: { hero?: Photo; venue?: Photo; rsvp?: Photo; bless?: Photo; finale?: Photo; gallery: Photo[] }
}

// place: the event's own address, for its calendar entry (blank: the main venue).
export type WeddingEvent = { id: string; name: string; date: string; start: string; end: string; time: string; note: string; map?: string; place?: string; photo: Photo }
export type Design = Omit<Look, 'demo'> &
  Omit<Content, 'events' | 'meet' | 'story' | 'photos' | 'mainEvent'> & {
    mainEvent?: string
    meet?: { name: string; bio: string; photo: Photo }[]
    story: { year: string; title: string; body: string; photo: Photo }[]
    events: WeddingEvent[]
    finale?: Photo
    hero: Photo
    venuePhoto: Photo
    gallery: Photo[]
    rsvpPhoto: Photo
    blessPhoto: Photo
  }

// A themed website's own soundtrack, shaped like a track id so saved sites keep it (worker/src/index.ts).
export const THEME = 'track:theme'

const CORMORANT = '"Cormorant Garamond", Georgia, serif'
const PINYON = '"Pinyon Script", cursive'
const GREAT_VIBES = '"Great Vibes", cursive'

export const LOOKS: Look[] = [
  {
    id: 'rajwada',
    name: 'Rajwada Rose',
    blurb: 'Maroon doors, gold scrolls and ivory walls, for a royal Rajasthani wedding.',
    tradition: 'Royal Rajasthani wedding · Jaipur',
    layout: 'veil',
    theme: { bg: '#f8f2e9', raised: '#efe5d5', accent: '#b8862f', text: '#4a1020', soft: '#8c2a3c', display: CORMORANT, script: PINYON, panel: '#6d1426', panelText: '#fbf1e2' },
    elephants: true,
    demo: {
      couple: ['Aditi', 'Vihaan'],
      nativeNames: 'अदिति संग विहान',
      families: ['Aditi’s family', 'Vihaan’s family'],
      parents: ['Daughter of Smt. Sunita and Shri Rakesh Sharma, granddaughter of Late Shri Ramesh Chandra Sharma', 'Son of Smt. Kavita and Shri Ajay Rathore, grandson of Smt. Kamla Devi and Late Shri Mohan Singh Rathore'],
      notes: ['Complimentary valet parking at the main gate of the City Palace.', 'The baraat leaves the hotel at 6 pm. Bring your dancing shoes.', 'Jaipur nights are cool in December. A shawl for the pheras.'],
      compliments: ['Shri Mahesh Sharma and family (Chacha-Chachi)', 'Smt. Asha Gupta and family (Bua)', 'Shri Vikram Rathore and family (Mama-Mami)'],
      city: 'Jaipur',
      venue: 'City Palace, Jaipur',
      invite: 'With the blessings of Shri Ganesh and our elders, we joyfully invite you to celebrate the wedding of our children.',
      rsvpBy: '15 November',
      music: song('lamhon-1'),
      story: [
        { year: '2018', title: 'Two seats on the Shatabdi', body: 'Delhi to Jaipur, one window seat, one argument about it, and four hours of talking after.', photo: SHOTS.silhouette },
        { year: '2022', title: 'The long way round', body: 'Her in Bengaluru, him in London, and every festival spent counting down to the next visit home.', photo: SHOTS.sunsetTree },
        { year: '2026', title: 'At Amer, at dusk', body: 'He asked on the fort walls with both families hiding behind a pillar. Everyone cried.', photo: SHOTS.ring },
      ],
      events: [
        { name: 'Mehendi', date: '2027-12-09', time: '16:00', where: '4 pm, in the Sarvato Bhadra courtyard', note: 'Henna, folk singers and chai. Wear green or pink.', photo: SHOTS.henna },
        { name: 'Vivaah', date: '2027-12-10', time: '19:00', where: '7 pm baraat, pheras at the auspicious hour', note: 'The baraat, the varmala and seven pheras under the stars.', photo: SHOTS.diyas },
        { name: 'Reception', date: '2027-12-11', time: '19:30', where: '7:30 pm, in the Mubarak Mahal lawns', note: 'Dinner, music and the families finally sitting down together.', photo: SHOTS.mubarakMahal },
      ],
      photos: { hero: SHOTS.mubarakMahal, venue: SHOTS.amerCourt, rsvp: SHOTS.amerCourt, bless: SHOTS.marigold, gallery: [SHOTS.twirl, SHOTS.embrace, SHOTS.marigold, SHOTS.diyaLedge] },
    },
  },
  {
    id: 'mandir',
    name: 'Mandir Utsav',
    blurb: 'Temple sandstone, peacocks and lotus ponds, with polaroids and a countdown.',
    tradition: 'Gujarati wedding · Modhera',
    layout: 'veil',
    theme: { bg: '#f7efe0', raised: '#efe2c8', accent: '#a8701f', text: '#4b2a12', soft: '#a3462d', display: CORMORANT, script: GREAT_VIBES },
    storyStyle: 'polaroids',
    cards: 'cusp',
    closing: 'countdown',
    demo: {
      couple: ['Krupa', 'Nirav'],
      nativeNames: 'કૃપા અને નીરવ',
      families: ['Krupa’s family', 'Nirav’s family'],
      parents: ['Daughter of Smt. Hetal and Shri Jayesh Patel', 'Son of Smt. Bhavna and Shri Ketan Shah'],
      meet: [
        { bio: 'A paediatric dentist who has never lost a game of antakshari, and the only person in her family who can make undhiyu the way her Ba did.', photo: SHOTS.twirl },
        { bio: 'A civil engineer who builds bridges by day and over-plans every holiday by night. He has a spreadsheet for this wedding too.', photo: SHOTS.embrace },
      ],
      notes: ['The pheras are in the open courtyard. Hats and sunglasses for the afternoon.', 'Buses leave Ahmedabad at 7 am and come back after dinner.', 'Garba is on the first night. Bring your chaniya choli and your stamina.'],
      city: 'Modhera',
      venue: 'Modhera, Mehsana, Gujarat',
      invite: 'Shri Ganeshay Namah. With joy in our hearts, our families invite you to bless Krupa and Nirav as they begin their life together.',
      rsvpBy: '1 December',
      story: [
        { year: '2017', title: 'Navratri, the ninth night', body: 'He stepped on her foot in the middle of a garba circle and apologised for the next nine rounds.', photo: SHOTS.bazaar },
        { year: '2020', title: 'Chai on the terrace', body: 'Lockdown in the same society in Ahmedabad: two terraces, one wall, a lot of chai passed across it.', photo: SHOTS.sunsetTree },
        { year: '2023', title: 'Two families, one table', body: 'Dinner at her Ba’s house, where his mother asked for the dhokla recipe before dessert.', photo: SHOTS.marigold },
        { year: '2026', title: 'At the stepwell', body: 'He asked on the steps of the Modhera kund at sunrise. She said yes before the sun cleared the shrine.', photo: SHOTS.ring },
      ],
      mainEvent: 2,
      events: [
        { name: 'Garba Night', date: '2028-01-07', time: '20:00', where: '8 pm, on the lawns', note: 'Dhol, dandiya and three generations in one circle.', photo: SHOTS.diyaLedge },
        { name: 'Pithi', date: '2028-01-08', time: '10:00', where: '10 am, in the courtyard', note: 'Turmeric, songs and a lot of laughter. Wear yellow.', photo: SHOTS.marigold },
        { name: 'Hast Melap', date: '2028-01-08', time: '16:30', where: '4:30 pm, in the mandap', note: 'The joining of hands and the four pheras at golden hour.', photo: SHOTS.modhera },
        { name: 'Reception', date: '2028-01-09', time: '19:30', where: '7:30 pm, in Ahmedabad', note: 'Dinner and dancing back in the city.', photo: SHOTS.lotus },
      ],
      photos: { hero: SHOTS.modhera, venue: SHOTS.modhera, rsvp: SHOTS.peacock, bless: SHOTS.lotus, finale: SHOTS.chhatriLake, gallery: [SHOTS.peacock, SHOTS.lotus, SHOTS.twirl] },
    },
  },
  {
    id: 'gulabi-bagh',
    name: 'Gulabi Bagh',
    blurb: 'Blush pink and sage, with a date the guest reveals and a timeline of every function.',
    tradition: 'Hindu wedding · New Delhi',
    layout: 'arch',
    theme: { bg: '#fbf4f1', raised: '#f4e6e1', accent: '#b0566b', text: '#3d2a2e', soft: '#6f8a6a', display: CORMORANT, script: GREAT_VIBES },
    gate: 'trifold',
    flap: '#e4f1e2',
    emblem: 'ganesha',
    elephants: true,
    storyStyle: 'carousel',
    cards: 'timeline',
    dateReveal: true,
    closing: 'garden',
    demo: {
      invocation: 'श्री गणेशाय नमः',
      couple: ['Ishita', 'Aarav'],
      nativeNames: 'इशिता संग आरव',
      families: ['The bride’s family', 'The groom’s family'],
      parents: ['Daughter of Smt. Neelam and Shri Anil Malhotra, granddaughter of Smt. Kusum and Late Shri Prem Nath Malhotra', 'Son of Smt. Ritu and Shri Sanjeev Khanna, grandson of Smt. Savitri and Shri Ramesh Khanna'],
      compliments: ['Shri Rajiv Malhotra and family', 'Smt. Pooja Kapoor and family', 'Shri Deepak Khanna and family', 'Smt. Anju Sethi and family'],
      note: 'We have waited a long time to stand in a garden full of the people we love. Come hungry, come early, and stay until the last song.',
      notes: ['The ceremonies are on the lawns; flat shoes are kinder to the grass.', 'Parking is at the hotel porch with valet from 6 pm.', 'Children are very welcome. There is a play corner by the pool.'],
      city: 'New Delhi',
      venue: 'The Lodhi, Lodhi Road, New Delhi',
      invite: 'With the blessings of our elders, the Malhotra and Khanna families invite you to celebrate with us.',
      rsvpBy: '1 January',
      music: song('kalank'),
      story: [
        { year: '2017', title: 'Saturday Debate Club', body: 'She won the argument; he asked for a rematch over coffee. Neither remembers the topic.', photo: SHOTS.silhouette },
        { year: '2020', title: 'Long Distance Lockdown', body: 'Delhi to Pune on video every night at ten, with the same cup of chai on both screens.', photo: SHOTS.sunsetTree },
        { year: '2024', title: 'Meet The Parents', body: 'His mother made rajma; her father asked for seconds. That settled it.', photo: SHOTS.embrace },
        { year: '2026', title: 'Under The Bougainvillea', body: 'He asked in her grandmother’s garden, with every aunt watching from the window.', photo: SHOTS.ring },
      ],
      mainEvent: 4,
      events: [
        { name: 'Ring Ceremony', date: '2028-02-10', time: '19:00', where: '7 pm, in the Ballroom', note: 'Rings, toasts and a family dinner.', photo: SHOTS.ring },
        { name: 'Mehendi', date: '2028-02-11', time: '12:00', where: '12 noon, by the pool', note: 'Henna, chaat and a dhol.', photo: SHOTS.henna },
        { name: 'Haldi', date: '2028-02-12', time: '10:00', where: '10 am, on the terrace', note: 'Wear yellow you can lose.', photo: SHOTS.marigold },
        { name: 'Sangeet', date: '2028-02-12', time: '19:30', where: '7:30 pm, on the lawns', note: 'Both families have been rehearsing for months.', photo: SHOTS.diyaLedge },
        { name: 'Vivaah', date: '2028-02-13', time: '18:00', where: '6 pm baraat, pheras at 9', note: 'The baraat, the varmala and the pheras under the stars.', photo: SHOTS.diyas },
      ],
      photos: { hero: SHOTS.bougainvillea, venue: SHOTS.lodhi, rsvp: SHOTS.bougainvillea, bless: SHOTS.lodhi, finale: SHOTS.lodhi, gallery: [SHOTS.twirl, SHOTS.bougainvillea] },
    },
  },
  {
    id: 'neel-kamal',
    name: 'Neel Kamal',
    blurb: 'Indigo night and lamp gold by the Ganga, with a tap-to-reveal date and a timeline.',
    tradition: 'Banarasi wedding · Varanasi',
    layout: 'veil',
    theme: { bg: '#141a33', raised: '#1d2546', accent: '#e2b04a', text: '#f2ecdf', soft: '#a9b6e0', display: '"Marcellus", Georgia, serif', script: GREAT_VIBES },
    storyStyle: 'carousel',
    cards: 'timeline',
    dateReveal: true,
    closing: 'garden',
    demo: {
      invocation: '॥ ॐ नमः शिवाय ॥',
      couple: ['Tara', 'Shaurya'],
      nativeNames: 'तारा संग शौर्य',
      families: ['Tara’s family', 'Shaurya’s family'],
      parents: ['Daughter of Smt. Archana and Shri Alok Tripathi, granddaughter of Smt. Shanti and Late Shri Kailash Tripathi', 'Son of Smt. Meenu and Shri Vineet Mishra, grandson of Smt. Kamla and Shri Gopal Mishra'],
      compliments: ['Shri Ashok Tripathi and family', 'Smt. Rekha Pandey and family', 'Shri Manoj Mishra and family'],
      note: 'Varanasi is where both our families began. We cannot think of a better place to begin ours, with all of you on the ghats.',
      notes: ['Boats to the evening aarti leave the hotel jetty at 6 pm.', 'The lanes are narrow; e-rickshaws wait at the main gate.', 'Please dress modestly for the aarti on the ghats.'],
      city: 'Varanasi',
      venue: 'BrijRama Palace, Darbhanga Ghat, Varanasi',
      invite: 'By the grace of Mahadev and with the blessings of our elders, we invite you to our wedding on the ghats of Kashi.',
      rsvpBy: '15 October',
      music: song('kalank'),
      story: [
        { year: '2016', title: 'Same Train Every Diwali', body: 'Delhi to Varanasi, the same coach, four Diwalis in a row before either of them said hello.', photo: SHOTS.silhouette },
        { year: '2019', title: 'Kachori At Dawn', body: 'Their first date was breakfast at five in the morning in a lane only he knew.', photo: SHOTS.sunsetTree },
        { year: '2023', title: 'Two Cities One Plan', body: 'Mumbai and Bengaluru, a shared calendar and a countdown to every long weekend.', photo: SHOTS.embrace },
        { year: '2026', title: 'On The Ganga', body: 'He asked on a boat at sunrise. The boatman clapped first.', photo: SHOTS.ring },
      ],
      mainEvent: 3,
      events: [
        { name: 'Tilak', date: '2027-11-19', time: '11:00', where: '11 am, in the courtyard', note: 'The bride’s family welcomes the groom.', photo: SHOTS.marigold },
        { name: 'Haldi', date: '2027-11-20', time: '10:00', where: '10 am, on the terrace', note: 'Turmeric and laughter above the river.', photo: SHOTS.rangoli },
        { name: 'Ganga Aarti', date: '2027-11-20', time: '18:00', where: '6 pm, by boat', note: 'We watch the evening aarti together from the water.', photo: SHOTS.aarti },
        { name: 'Vivaah', date: '2027-11-21', time: '19:00', where: '7 pm, on the ghat', note: 'Pheras by the river, then dinner on the terrace.', photo: SHOTS.diyas },
      ],
      photos: { hero: SHOTS.aarti, venue: SHOTS.ghatBoats, rsvp: SHOTS.ghatBoats, bless: SHOTS.diyaLedge, finale: SHOTS.ghatBoats, gallery: [SHOTS.diyaLedge, SHOTS.rangoli] },
    },
  },
  {
    id: 'pichola',
    name: 'Pichola Nights',
    blurb: 'Kohl and zari gold over the lake at night, for a palace wedding.',
    tradition: 'Palace wedding · Udaipur',
    layout: 'veil',
    theme: { bg: '#1e1519', raised: '#2a1f24', accent: '#c9a15b', text: '#f3ece3', soft: '#d7a79e', display: CORMORANT, script: CORMORANT },
    demo: {
      couple: ['Ananya', 'Arjun'],
      nativeNames: 'अनन्या संग अर्जुन',
      families: ['Ananya’s family', 'Arjun’s family'],
      parents: ['Daughter of Smt. Rekha and Shri Vivek Mehta', 'Son of Smt. Anjali and Shri Rajiv Kapoor'],
      notes: ['Udaipur airport is 40 minutes away; cars will be waiting for every flight on the 20th.', 'The pheras are outdoors by the lake. Bring a shawl for the evening.', 'Boats to the palace leave from the City Palace jetty every 20 minutes.'],
      city: 'Udaipur',
      venue: 'The Leela Palace, Lake Pichola, Udaipur',
      invite: 'With the blessings of our families, we would love you to be with us in Udaipur as we marry.',
      rsvpBy: '1 October',
      music: song('lamhon-2'),
      story: [
        { year: '2016', title: 'A borrowed umbrella', body: 'First week of college in Pune, the monsoon came early, and Arjun had the only umbrella at the bus stop. Ananya kept it for a month.', photo: SHOTS.silhouette },
        { year: '2019', title: 'Bengaluru to Delhi', body: 'Two jobs, two cities, and three years of video calls that started with “have you eaten?”', photo: SHOTS.sunsetTree },
        { year: '2025', title: 'The question, on Lake Pichola', body: 'A boat, a sunset and a ring that nearly went overboard. She said yes before he finished asking.', photo: SHOTS.ring },
      ],
      events: [
        { name: 'Mehendi', date: '2027-11-20', time: '16:00', where: '4 pm until late, on the lake lawns', note: 'Floor seating and a lot of henna. Wear something you can sit cross-legged in.', photo: SHOTS.henna },
        { name: 'Haldi', date: '2027-11-21', time: '10:00', where: '10 am, in the courtyard', note: 'You will be painted yellow. Wear white you don’t mind losing.', photo: SHOTS.marigold },
        { name: 'Pheras', date: '2027-11-21', time: '15:30', where: '3:30 pm, by the water', note: 'Seven rounds of the fire as the sun goes down, then dinner on the lawns.', photo: SHOTS.diyas },
      ],
      photos: { hero: SHOTS.lakePalace, venue: SHOTS.lakePalace, rsvp: SHOTS.embrace, bless: SHOTS.diyaLedge, gallery: [SHOTS.twirl, SHOTS.embrace, SHOTS.ring, SHOTS.diyaLedge] },
    },
  },
  {
    id: 'phulkari',
    name: 'Phulkari Mela',
    blurb: 'Rani pink and saffron on cream, as bright as a phulkari dupatta.',
    tradition: 'Sikh Anand Karaj · Amritsar',
    layout: 'split',
    theme: { bg: '#fbf3e4', raised: '#f3e3c8', accent: '#b4235a', text: '#3a1420', soft: '#b5501a', display: '"Rozha One", Georgia, serif', script: GREAT_VIBES },
    demo: {
      couple: ['Simran', 'Harjot'],
      nativeNames: 'ਸਿਮਰਨ ਤੇ ਹਰਜੋਤ',
      families: ['Simran’s family', 'Harjot’s family'],
      parents: ['Daughter of Sardarni Harpreet Kaur and Sardar Gurmeet Singh Gill', 'Son of Sardarni Jasleen Kaur and Sardar Manjit Singh Sandhu'],
      notes: ['Please cover your head during the Anand Karaj. Rumals are kept at the door.', 'Langar follows the ceremony; shoes come off at the gurdwara entrance.', 'Amritsar is cold in February. Pack a warm shawl for the evening.'],
      city: 'Amritsar',
      venue: 'Ranjit’s Svaasa, Amritsar',
      invite: 'With Waheguru’s grace and our families’ blessings, we invite you to our Anand Karaj in Amritsar.',
      rsvpBy: '15 December',
      music: song('uchiyaan'),
      story: [
        { year: '2018', title: 'Bhangra practice', body: 'Two left feet in the same college bhangra team. The coach paired them so they would stop ruining everyone else’s steps.', photo: SHOTS.bazaar },
        { year: '2022', title: 'Toronto winters', body: 'Harjot moved for work; Simran sent pinnis by post every Lohri so he would come home.', photo: SHOTS.sunsetTree },
        { year: '2026', title: 'Yes, at the Golden Temple', body: 'They asked both families for their blessing on the same evening, by the sarovar.', photo: SHOTS.goldenTemple },
      ],
      events: [
        { name: 'Jaago', date: '2028-02-04', time: '20:00', where: '8 pm, until the lamps go out', note: 'The aunties carry the gaagar; everyone else dances behind it. Bring your loudest voice.', photo: SHOTS.diyaLedge },
        { name: 'Anand Karaj', date: '2028-02-05', time: '09:00', where: '9 am, followed by langar', note: 'Heads covered for everyone; rumals are kept at the door if you forget.', photo: SHOTS.goldenTemple },
        { name: 'Reception', date: '2028-02-05', time: '19:30', where: '7:30 pm, on the lawns', note: 'Dinner, the doli at midnight, and a dhol you will hear from the gate.', photo: SHOTS.twirl },
      ],
      photos: { hero: SHOTS.twirl, venue: SHOTS.goldenTemple, rsvp: SHOTS.phulkari, bless: SHOTS.bazaar, gallery: [SHOTS.phulkari, SHOTS.bazaar, SHOTS.marigold, SHOTS.embrace] },
    },
  },
  {
    id: 'kovil',
    name: 'Kovil Gold',
    blurb: 'Temple maroon and turmeric gold, with jasmine and a gopuram arch.',
    tradition: 'Tamil wedding · Madurai',
    layout: 'arch',
    theme: { bg: '#3b0d14', raised: '#4d1520', accent: '#e0a526', text: '#fbefd9', soft: '#f0b9a0', display: '"Marcellus", Georgia, serif', script: CORMORANT },
    demo: {
      couple: ['Meenakshi', 'Karthik'],
      nativeNames: 'மீனாட்சி & கார்த்திக்',
      families: ['Meenakshi’s family', 'Karthik’s family'],
      parents: ['Daughter of Smt. Lakshmi and Shri Venkatesh Iyer', 'Son of Smt. Revathi and Shri Sundaram Pillai'],
      notes: ['The muhurtham is at 7:15 am sharp. Please be seated by 7.', 'Shoes come off at the mandapam; there is a counter by the steps.', 'Madurai is warm in May. Cotton and silk both welcome.'],
      city: 'Madurai',
      venue: 'Heritage Madurai, Madurai',
      invite: 'With the blessings of our elders, we request the honour of your presence at our wedding in Madurai.',
      rsvpBy: '20 April',
      story: [
        { year: '2017', title: 'Carnatic class, back row', body: 'The only two students who never practised. They bonded over pretending to know the raga.', photo: SHOTS.silhouette },
        { year: '2021', title: 'Chennai filter coffee', body: 'Every Sunday at the same Mylapore café, arguing about who makes the better decoction.', photo: SHOTS.sunsetTree },
        { year: '2026', title: 'The families meet', body: 'One horoscope reading, three rounds of sweets and a wedding date everyone agreed on.', photo: SHOTS.ring },
      ],
      events: [
        { name: 'Nichayathartham', date: '2027-05-14', time: '18:00', where: '6 pm, in the courtyard', note: 'The formal engagement: trays of fruit and silk exchanged between the families.', photo: SHOTS.rangoli },
        { name: 'Muhurtham', date: '2027-05-15', time: '07:00', where: '7:15 am sharp, the auspicious hour', note: 'Early start for the thali. Breakfast on banana leaf right after.', photo: SHOTS.jasmine },
        { name: 'Reception', date: '2027-05-15', time: '19:00', where: '7 pm, by the pool', note: 'Nadaswaram, then a long dinner. Silk or cotton, whatever keeps you cool.', photo: SHOTS.diyas },
      ],
      photos: { hero: SHOTS.gopuram, venue: SHOTS.gopuram, rsvp: SHOTS.jasmine, bless: SHOTS.diyas, gallery: [SHOTS.jasmine, SHOTS.rangoli, SHOTS.marigold, SHOTS.diyas] },
    },
  },
  {
    id: 'sage-lace',
    name: 'Sage and Lace',
    blurb: 'Ivory, sage green and a script hand, for a church wedding by the sea.',
    tradition: 'Christian wedding · Goa',
    layout: 'arch',
    theme: { bg: '#f6f3ec', raised: '#e9e5d9', accent: '#5a7254', text: '#263127', soft: '#8a6a52', display: CORMORANT, script: PINYON },
    demo: {
      couple: ['Ria', 'Joel'],
      families: ['The bride’s family', 'The groom’s family'],
      parents: ['Daughter of Mrs. Sylvia and Mr. Anthony Fernandes', 'Son of Mrs. Grace and Mr. Peter D’Souza'],
      notes: ['The Basilica asks guests to cover their shoulders inside.', 'A shuttle runs from Panjim to Old Goa at 10 am and to Vagator after the mass.', 'The reception is on sand. Flat shoes will thank you.'],
      city: 'Goa',
      venue: 'Basilica of Bom Jesus, Old Goa',
      invite: 'Together with our families, we invite you to celebrate our marriage in Goa.',
      rsvpBy: '1 November',
      story: [
        { year: '2015', title: 'Choir practice', body: 'Ria sang alto, Joel pretended he could sing at all. The choir master noticed before they did.', photo: SHOTS.silhouette },
        { year: '2020', title: 'Lockdown letters', body: 'Six months of handwritten letters between Panjim and Mumbai, every one of them kept.', photo: SHOTS.sunsetTree },
        { year: '2026', title: 'On the Chapora rocks', body: 'He proposed at sunset; the ring was in his pocket, the speech was not.', photo: SHOTS.goaDusk },
      ],
      events: [
        { name: 'Roce', date: '2028-01-07', time: '17:00', where: '5 pm, at the bride’s home', note: 'Coconut milk and laughter; wear something you can wash.', photo: SHOTS.marigold },
        { name: 'Nuptial Mass', date: '2028-01-08', time: '11:00', where: '11 am, at the Basilica', note: 'Please be seated by 10:45. Shoulders covered inside the church.', photo: SHOTS.basilica },
        { name: 'Reception', date: '2028-01-08', time: '19:00', where: '7 pm, on the beach at Vagator', note: 'The first dance, a live band and a long table under the stars.', photo: SHOTS.goaDusk },
      ],
      photos: { hero: SHOTS.basilica, venue: SHOTS.basilica, rsvp: SHOTS.goaDusk, bless: SHOTS.sunsetTree, gallery: [SHOTS.goaDusk, SHOTS.ring, SHOTS.sunsetTree, SHOTS.silhouette] },
    },
  },
  {
    id: 'noor',
    name: 'Noor Mahal',
    blurb: 'Deep emerald and silver under Lucknow’s arches, for a nikah.',
    tradition: 'Nikah · Lucknow',
    layout: 'veil',
    theme: { bg: '#0f2723', raised: '#17352f', accent: '#d2c08a', text: '#eef2ec', soft: '#9fc7b4', display: '"Amiri", Georgia, serif', script: '"Amiri", Georgia, serif' },
    demo: {
      couple: ['Zoya', 'Kabir'],
      nativeNames: 'زویا اور کبیر',
      families: ['Zoya’s family', 'Kabir’s family'],
      parents: ['Daughter of Begum Nasreen and Janab Imran Siddiqui', 'Son of Begum Farah and Janab Asif Rizvi'],
      notes: ['Seating for the nikah is separate for men and women, as the families prefer.', 'Dinner at the walima is served from 9:30 pm.', 'Valet parking is at the main porch of the hotel.'],
      city: 'Lucknow',
      venue: 'Taj Mahal Lucknow, Gomti Nagar',
      invite: 'By the grace of Allah and with our families’ duas, we invite you to our nikah in Lucknow.',
      rsvpBy: '10 September',
      music: song('lamhon-1'),
      story: [
        { year: '2016', title: 'A shared bookshelf', body: 'The same Urdu poetry book, borrowed from the same library, one week apart. Her notes were in the margins.', photo: SHOTS.silhouette },
        { year: '2021', title: 'Eid in two cities', body: 'Sheer khurma over video call, Lucknow to Hyderabad, three years running.', photo: SHOTS.sunsetTree },
        { year: '2026', title: 'The rishta', body: 'The families met over biryani and never stopped talking. We just had to agree.', photo: SHOTS.ring },
      ],
      events: [
        { name: 'Mehendi', date: '2027-10-21', time: '17:00', where: '5 pm, in the garden', note: 'Dholak, songs and henna. Green is the colour of the evening.', photo: SHOTS.henna },
        { name: 'Nikah', date: '2027-10-22', time: '16:00', where: '4 pm, after Asr', note: 'The nikah, then sherbet and dates for everyone.', photo: SHOTS.imambara },
        { name: 'Walima', date: '2027-10-23', time: '20:00', where: '8 pm, in the ballroom', note: 'Awadhi dinner, qawwali, and the families finally sitting still.', photo: SHOTS.diyaLedge },
      ],
      photos: { hero: SHOTS.imambara, venue: SHOTS.imambara, rsvp: SHOTS.imambara, bless: SHOTS.embrace, gallery: [SHOTS.embrace, SHOTS.henna, SHOTS.ring, SHOTS.diyaLedge] },
    },
  },
  {
    id: 'ink-linen',
    name: 'Ink and Linen',
    blurb: 'Black ink on white linen. Quiet, modern, and all about the photos.',
    tradition: 'Modern minimal wedding · New Delhi',
    layout: 'split',
    theme: { bg: '#fafaf7', raised: '#efefe9', accent: '#1d1d1b', text: '#1d1d1b', soft: '#6e6e66', display: '"Gloock", Georgia, serif', script: '"Gloock", Georgia, serif' },
    demo: {
      couple: ['Kavya', 'Rohan'],
      families: ['Kavya’s side', 'Rohan’s side'],
      parents: ['Daughter of Meera and Sanjay Rao', 'Son of Nandini and Arvind Bhalla'],
      notes: ['Sunder Nursery is a heritage garden; heels sink in the grass.', 'Parking is at the Mathura Road gate. Carts run to the lawn.', 'Unplugged ceremony, please. Our photographer has it covered.'],
      city: 'New Delhi',
      venue: 'Sunder Nursery, New Delhi',
      invite: 'We are getting married in the garden, and we would love you there.',
      rsvpBy: '15 January',
      music: song('uchiyaan'),
      story: [
        { year: '2019', title: 'Same studio, different desks', body: 'Two architects, one shared printer that never worked. They fixed it together. Eventually.', photo: SHOTS.lodhi },
        { year: '2023', title: 'Saturday walks', body: 'Lodhi Garden at 7 am, chai at 8, every week for four years.', photo: SHOTS.embrace },
        { year: '2026', title: 'A sketchbook question', body: 'The last page of his sketchbook had a drawing of a ring and a question mark.', photo: SHOTS.ring },
      ],
      events: [
        { name: 'Sangeet', date: '2028-02-25', time: '19:30', where: '7:30 pm', note: 'A small stage and very rehearsed cousins. Black tie, optional.', photo: SHOTS.diyaLedge },
        { name: 'Wedding', date: '2028-02-26', time: '16:00', where: '4 pm, in the garden', note: 'The ceremony under the trees, then tea on the lawn.', photo: SHOTS.lodhi },
        { name: 'Dinner', date: '2028-02-26', time: '19:30', where: '7:30 pm', note: 'Long tables, short speeches. We promise.', photo: SHOTS.sunsetTree },
      ],
      photos: { hero: SHOTS.lodhi, venue: SHOTS.lodhi, rsvp: SHOTS.sunsetTree, bless: SHOTS.embrace, gallery: [SHOTS.embrace, SHOTS.silhouette, SHOTS.sunsetTree, SHOTS.ring] },
    },
  },
  {
    id: 'mahal',
    name: 'Mahal at Dusk',
    blurb: 'A painted palace at dusk, elephants and a curtain the couple pull open.',
    tradition: 'Royal palace wedding · Udaipur',
    layout: 'veil',
    bespoke: 'mahal',
    cover: '/site-art/mahal/cover.webp',
    theme: { bg: '#f6e7dc', raised: '#efd9cb', accent: '#8a5d22', text: '#3d1e2e', soft: '#a84e66', display: '"Bodoni Moda", Didot, serif', script: CORMORANT },
    demo: {
      invocation: 'श्री गणेशाय नमः',
      couple: ['Mrinalini', 'Advait'],
      nativeNames: 'मृणालिनी संग अद्वैत',
      families: ['The Chundawat family', 'The Mehta family'],
      parents: ['Daughter of Smt. Shailja and Shri Jaswant Singh Chundawat, granddaughter of Rani Padmavati Chundawat', 'Son of Smt. Revati and Shri Nikhil Mehta, grandson of Smt. Kamla and Late Shri Bhanu Prakash Mehta'],
      compliments: ['Shri Hemant Singh and family (Kaka-Kaki)', 'Smt. Usha Bhandari and family (Bua)', 'Shri Rajeev Mehta and family (Tauji-Taiji)'],
      note: 'We met in this city, fell for it a second time together, and could not imagine saying yes anywhere else. Come early, stay late, and dance with us by the lake.',
      notes: ['Boats to Jagmandir leave from the Bansi Ghat jetty, every twenty minutes from 6 pm.', 'Valet parking is at the City Palace main gate on Badi Pol.', 'Udaipur evenings turn cool in November. Bring a shawl for the boat ride.'],
      city: 'Udaipur',
      venue: 'City Palace, Udaipur',
      invite: 'With the blessings of Shri Ganesh and our elders, the Chundawat and Mehta families invite you to the wedding of their children.',
      rsvpBy: '15 October',
      music: song('lamhon-2'),
      story: [
        { year: '2018', title: 'Rain at Saheliyon ki Bari', body: 'A monsoon afternoon at Saheliyon ki Bari, one umbrella between two strangers, and a long walk to find a rickshaw.', photo: SHOTS.silhouette },
        { year: '2021', title: 'Letters across two cities', body: 'Her in Jaipur, him in Pune, and a postcard every Sunday that both families pretended not to read.', photo: SHOTS.sunsetTree },
        { year: '2026', title: 'On the palace steps', body: 'He asked on the ghat below the City Palace as the lamps came on, with her grandmother watching from a boat.', photo: SHOTS.ring },
      ],
      mainEvent: 4,
      events: [
        { name: 'Haldi', date: '2027-11-26', time: '10:00', where: '10 am, in the Zenana Mahal courtyard', note: 'Turmeric, marigolds and every cousin in yellow.', photo: SHOTS.marigold },
        { name: 'Mehendi', date: '2027-11-26', time: '15:00', where: '3 pm, on the Fateh Prakash lawns', note: 'Henna, folk songs from Mewar and chai that never runs out.', photo: SHOTS.henna },
        { name: 'Sangeet', date: '2027-11-26', time: '20:00', where: '8 pm, in the Durbar Hall, Fateh Prakash', note: 'Two families, one stage and many rehearsed steps.', photo: SHOTS.diyaLedge },
        { name: 'Sagan', date: '2027-11-27', time: '11:00', where: '11 am, in the Manek Chowk', note: 'The elders bless the couple before the evening begins.', photo: SHOTS.diyas },
        { name: 'Shaadi', date: '2027-11-27', time: '18:30', where: '6:30 pm baraat, pheras by the lake', note: 'The baraat, the varmala and seven pheras as the sun sets over Pichola.', photo: SHOTS.lakePalace },
        { name: 'Reception', date: '2027-11-28', time: '19:30', where: '7:30 pm, at Jagmandir island', note: 'Dinner on the island, music on the water, and the boats home under the stars.', photo: SHOTS.lakePalace },
      ],
      photos: { hero: SHOTS.lakePalace, venue: SHOTS.lakePalace, rsvp: SHOTS.lakePalace, bless: SHOTS.sunsetTree, gallery: [SHOTS.twirl, SHOTS.embrace, SHOTS.bazaar, SHOTS.lodhi] },
    },
  },
  {
    id: 'aangan',
    name: 'Diya Aangan',
    blurb: 'Pull the rope and a dark haveli courtyard lights up with diyas.',
    tradition: 'Haveli courtyard wedding · Jaipur',
    layout: 'veil',
    bespoke: 'aangan',
    cover: '/site-art/aangan/cover.webp',
    theme: { bg: '#14100c', raised: '#21190f', accent: '#d8a957', text: '#f7eedc', soft: '#eab0b8', display: CORMORANT, script: GREAT_VIBES },
    demo: {
      couple: ['Naina', 'Dev'],
      nativeNames: 'नैना संग देव',
      families: ['Naina’s family', 'Dev’s family'],
      parents: ['Daughter of Smt. Rekha and Shri Alok Mathur, granddaughter of Late Shri Har Prasad Mathur', 'Son of Smt. Usha and Shri Vinod Bhandari, grandson of Smt. Shanti Devi Bhandari'],
      compliments: ['Shri Pramod Mathur and family (Tauji-Taiji)', 'Smt. Lata Saxena and family (Mausi)', 'Shri Rakesh Bhandari and family (Chacha-Chachi)'],
      notes: [
        'Wear colour. The courtyard is lit with diyas, and jewel tones glow in it.',
        'Cars drop guests at the Gangapole gate; the last few steps through the bazaar are on foot.',
        'Every meal is Rajasthani and vegetarian, with dal baati at the Sangeet.',
        'February nights in Jaipur turn cold after sunset. Bring a shawl for the pheras.',
        'Children are welcome at every function, and there is a puppet show for them at the Mehendi.',
      ],
      city: 'Jaipur',
      venue: 'Samode Haveli, Gangapole, Jaipur',
      stay: 'Rooms for out-of-town guests are held at the haveli and at Alsisar Haveli nearby until 1 January 2028.',
      invite: 'With the blessings of our elders, our two families invite you to light the diyas with us at our wedding.',
      note: 'The courtyard is only full once you are in it. Come early, stay late, and dance with our grandmothers.',
      rsvpBy: '10 January',
      music: song('lamhon-1'),
      story: [
        { year: '2022', title: 'The wrong train', body: 'He boarded the Ajmer Shatabdi by mistake, she had the seat he thought was his, and neither of them got off at the right station.', photo: SHOTS.silhouette },
        { year: '2024', title: 'Kite season', body: 'Two Makar Sankrantis on her family’s terrace in the walled city, and he still cannot fly a patang.', photo: SHOTS.embrace },
        { year: '2026', title: 'At Panna Meena', body: 'He asked on the stepwell steps at Amer at sunrise, with his sister filming from behind a pillar.', photo: SHOTS.ring },
      ],
      mainEvent: 3,
      events: [
        { name: 'Mehendi', date: '2028-02-10', time: '16:00', where: '4 pm, in the haveli courtyard', note: 'Henna, Langa singers and too much chai. Wear green.', photo: SHOTS.bazaar },
        { name: 'Haldi', date: '2028-02-11', time: '10:00', where: '10 am, by the pool', note: 'Turmeric gets everywhere, so wear yellow you won’t miss.', photo: SHOTS.embrace },
        { name: 'Sangeet', date: '2028-02-11', time: '19:30', where: '7:30 pm, in the Sheesh Mahal', note: 'Both families have rehearsed. Nobody is ready.', photo: SHOTS.twirl },
        { name: 'Shaadi', date: '2028-02-12', time: '18:30', where: '6:30 pm baraat, pheras by the courtyard fire', note: 'The baraat sets out from the Gangapole gate. Seven pheras under the stars.', photo: SHOTS.ring },
        { name: 'Reception', date: '2028-02-13', time: '19:30', where: '7:30 pm, on the terrace lawns', note: 'Dinner by lamplight, then the dance floor.', photo: SHOTS.silhouette },
        { name: 'Vidaai', date: '2028-02-14', time: '10:00', where: '10 am, at the haveli gate', note: 'Come and see Naina off. Bring tissues.', photo: SHOTS.diyaLedge },
      ],
      photos: { hero: SHOTS.twirl, venue: SHOTS.amerCourt, rsvp: SHOTS.diyaLedge, bless: SHOTS.diyaLedge, gallery: [SHOTS.embrace, SHOTS.bazaar, SHOTS.silhouette, SHOTS.ring] },
    },
  },
  {
    id: 'nightcall',
    name: 'Night Call',
    blurb: 'A rainy city at night, a searchlight in the sky and a save-the-night card.',
    tradition: 'Comic noir wedding · Mumbai',
    layout: 'veil',
    bespoke: 'nightcall',
    cover: '/microsites/nightcall/cover.webp',
    theme: { bg: '#140a12', raised: '#21101b', accent: '#ff3b4a', text: '#f4e9ee', soft: '#ffd3d8', display: '"Oswald", Impact, sans-serif', script: CORMORANT },
    demo: {
      invocation: '|| Shri Ganeshaya Namah ||',
      music: THEME,
      couple: ['Kabir', 'Anaya'],
      families: ['The Malhotra family', 'The Desai family'],
      parents: ['Son of Mrs. Neeta and Mr. Sanjay Malhotra', 'Daughter of Mrs. Rekha and Mr. Arvind Desai'],
      city: 'Mumbai',
      venue: 'Taj Lands End, Bandstand, Bandra West, Mumbai',
      invite: 'Together with their families, Mr. Sanjay and Mrs. Neeta Malhotra and Mr. Arvind and Mrs. Rekha Desai request the honour of your presence at the wedding of their children.',
      note: 'The city has seen a lot of nights. This is the one we want you there for. Come early, stay late, and answer the call.',
      notes: [
        'Valet parking is at the main porch of the hotel on Bandstand.',
        'The sea breeze picks up after dark. Bring a shawl for the wedding lawns.',
        'Children are welcome at every function.',
      ],
      rsvpBy: '1 February',
      story: [
        { year: '2019', title: 'Two umbrellas, one bus stop', body: 'A July downpour in Bandra, one broken umbrella and the longest wait for the 220 bus.', photo: COUPLE },
        { year: '2026', title: 'Lights over the sea link', body: 'He asked on the promenade as the city lights came on, with both families pretending to jog past.', photo: COUPLE },
      ],
      mainEvent: 3,
      events: [
        { name: 'Haldi', date: '2027-02-18', time: '11:00', where: '11 am, on the poolside lawns', note: 'Turmeric, marigolds and a lot of laughing.', photo: SHOTS.marigold },
        { name: 'Mehendi', date: '2027-02-18', time: '16:00', where: '4 pm, in the courtyard', note: 'Henna, chai and the first round of family stories.', photo: SHOTS.henna },
        { name: 'Sangeet', date: '2027-02-19', time: '20:00', where: '8 pm, in the ballroom', note: 'Both families take the floor. Rehearsals were optional.', photo: SHOTS.diyaLedge },
        { name: 'Wedding', date: '2027-02-20', time: '19:00', where: '7 pm, on the sea-facing lawns', note: 'Seven pheras under the night sky, then dinner by the sea.', photo: SHOTS.diyas },
        { name: 'Reception', date: '2027-02-21', time: '20:00', where: '8 pm, on the rooftop terrace', note: 'Dinner, music and one last dance over the city.', photo: SHOTS.sunsetTree },
      ],
      photos: { hero: COUPLE, venue: SHOTS.diyas, rsvp: SHOTS.diyaLedge, bless: SHOTS.marigold, gallery: [] },
    },
  },
  {
    id: 'webline',
    name: 'Web Line',
    blurb: 'A comic-book issue: a skyscraper cover, panel pages and a web shot where you tap.',
    tradition: 'Superhero comic wedding · Bengaluru',
    layout: 'veil',
    bespoke: 'webline',
    cover: '/microsites/webline/cover.webp',
    theme: { bg: '#0b1d5c', raised: '#132a78', accent: '#ff4a5e', text: '#f7f1e3', soft: '#f4dfa0', display: '"Bangers", Impact, sans-serif', script: CORMORANT },
    demo: {
      invocation: '|| Shri Ganeshaya Namah ||',
      music: THEME,
      couple: ['Aarav', 'Ishita'],
      families: ['The Rao family', 'The Bansal family'],
      parents: ['Son of Mrs. Lata and Mr. Prakash Rao', 'Daughter of Mrs. Kavita and Mr. Manoj Bansal'],
      city: 'Bengaluru',
      venue: 'ITC Gardenia, Residency Road, Bengaluru',
      invite: 'Mr. Prakash and Mrs. Lata Rao and Mr. Manoj and Mrs. Kavita Bansal request the honour of your presence as their children team up for life.',
      note: 'Every hero needs a crew. Ours is you. Come for the vows, stay for the dancing, and bring your best rooftop moves.',
      notes: [
        'Parking is in the hotel basement, entry from Residency Road.',
        'Bengaluru evenings in March are mild. No shawls needed, dancing shoes are.',
        'Children are welcome at every function.',
      ],
      rsvpBy: '15 February',
      story: [
        { year: '2020', title: 'Crossed paths', body: 'Two people reaching for the last copy of the same comic in a Church Street bookshop. Neither let go.', photo: COUPLE },
        { year: '2026', title: 'The question', body: 'He asked on a rooftop under a full moon, with a banner his cousins held upside down.', photo: COUPLE },
      ],
      mainEvent: 3,
      events: [
        { name: 'Haldi', date: '2027-03-04', time: '11:00', where: '11 am, at the garden terrace', note: 'Turmeric, marigolds and a lot of laughing.', photo: SHOTS.marigold },
        { name: 'Mehendi', date: '2027-03-04', time: '16:00', where: '4 pm, in the courtyard', note: 'Henna, music and a long golden afternoon.', photo: SHOTS.henna },
        { name: 'Sangeet', date: '2027-03-05', time: '20:00', where: '8 pm, in the ballroom', note: 'Choreography is optional. Dancing is not.', photo: SHOTS.diyaLedge },
        { name: 'Wedding', date: '2027-03-06', time: '19:00', where: '7 pm, in the grand hall', note: 'Seven vows, then one very good party.', photo: SHOTS.diyas },
        { name: 'Reception', date: '2027-03-07', time: '20:00', where: '8 pm, on the rooftop', note: 'Dinner under the open sky, then one last dance.', photo: SHOTS.sunsetTree },
      ],
      photos: { hero: COUPLE, venue: SHOTS.diyas, rsvp: SHOTS.diyaLedge, bless: SHOTS.marigold, gallery: [] },
    },
  },
  {
    id: 'forgeheart',
    name: 'Forge Heart',
    blurb: 'Red and gold armour and a helmet that builds itself as you scroll.',
    tradition: 'Armoured tech wedding · New Delhi',
    layout: 'veil',
    bespoke: 'forgeheart',
    cover: '/microsites/forgeheart/cover.webp',
    theme: { bg: '#16191e', raised: '#21252c', accent: '#d9b36a', text: '#efe8da', soft: '#c9ced6', display: '"Cinzel", Georgia, serif', script: CORMORANT },
    demo: {
      invocation: '|| Shri Ganeshaya Namah ||',
      music: THEME,
      couple: ['Vivaan', 'Meera'],
      families: ['The Khanna family', 'The Arora family'],
      parents: ['Son of Mrs. Pooja and Mr. Rajiv Khanna', 'Daughter of Mrs. Nisha and Mr. Sameer Arora'],
      city: 'New Delhi',
      venue: 'The Leela Palace, Chanakyapuri, New Delhi',
      invite: 'Mr. Rajiv and Mrs. Pooja Khanna and Mr. Sameer and Mrs. Nisha Arora, with the love of both families, request the honour of your presence at the wedding of their children.',
      note: 'Two families who once lived a few streets apart are about to become one very loud household. Come as you are, and stay as long as the music does.',
      notes: [
        'Valet parking is at the hotel porch on Diplomatic Enclave.',
        'Delhi evenings in April are warm. Light fabrics for the lawns.',
        'Children are welcome at every function.',
      ],
      rsvpBy: '1 April',
      story: [
        { year: '2018', title: 'First contact', body: 'A college robotics fest, one borrowed soldering iron and a project that only worked when both of them held it.', photo: COUPLE },
        { year: '2026', title: 'Systems go', body: 'He asked in the workshop where they met, with a ring the robot was supposed to hand over and dropped.', photo: COUPLE },
      ],
      mainEvent: 3,
      events: [
        { name: 'Haldi', date: '2027-04-15', time: '11:00', where: '11 am, at the garden terrace', note: 'Turmeric, marigolds and a lot of laughing.', photo: SHOTS.marigold },
        { name: 'Mehendi', date: '2027-04-15', time: '16:00', where: '4 pm, in the courtyard', note: 'Henna, music and a long golden afternoon.', photo: SHOTS.henna },
        { name: 'Sangeet', date: '2027-04-16', time: '20:00', where: '8 pm, in the ballroom', note: 'Choreography is optional. Dancing is not.', photo: SHOTS.diyaLedge },
        { name: 'Wedding', date: '2027-04-17', time: '19:00', where: '7 pm, in the grand hall', note: 'Seven vows, then one very good party.', photo: SHOTS.diyas },
        { name: 'Reception', date: '2027-04-18', time: '20:00', where: '8 pm, on the rooftop', note: 'Dinner under the open sky, then one last dance.', photo: SHOTS.sunsetTree },
      ],
      photos: { hero: COUPLE, venue: SHOTS.diyas, rsvp: SHOTS.diyaLedge, bless: SHOTS.marigold, gallery: [] },
    },
  },
  {
    id: 'vicenights',
    name: 'Vice Nights',
    blurb: 'Golden hour on a beach turns to neon night as you scroll.',
    tradition: 'Open-world game style wedding · Goa',
    layout: 'veil',
    bespoke: 'vicenights',
    cover: '/microsites/vicenights/cover.webp',
    theme: { bg: '#1a0b24', raised: '#2b1240', accent: '#ff4f9a', text: '#fff1dc', soft: '#e9d3c2', display: '"Anton", Impact, sans-serif', script: CORMORANT },
    demo: {
      invocation: '|| Shri Ganeshaya Namah ||',
      couple: ['Vihaan', 'Kiara'],
      families: ['The Mehra family', 'The Kapoor family'],
      parents: ['Son of Mrs. Sunita and Mr. Rakesh Mehra', 'Daughter of Mrs. Anjali and Mr. Vikram Kapoor'],
      city: 'Goa',
      venue: 'The Grand Hall, Candolim, Goa',
      invite: 'With the love of both families, Mr. Rakesh and Mrs. Sunita Mehra and Mr. Vikram and Mrs. Anjali Kapoor invite you to celebrate the wedding of their children.',
      note: 'Two families who once lived a few streets apart are about to become one very loud household. Come as you are, and stay as long as the music does.',
      notes: [
        'Each function has a dress code where it matters. For everything else, festive and comfortable wins.',
        'Valet parking is available at every venue.',
        'Children are welcome at every function.',
      ],
      rsvpBy: '10 January',
      story: [
        { year: '2017', title: 'A few streets apart', body: 'Grew up a few streets apart, took the long way round, and finally teamed up for good.', photo: COUPLE },
        { year: '2026', title: 'The main quest', body: 'He asked on the beach at sunset: ten years of side quests, and this was the main one.', photo: COUPLE },
      ],
      mainEvent: 3,
      events: [
        { name: 'Haldi', date: '2027-02-12', time: '11:00', where: '11 am, on the garden terrace', note: 'Turmeric, marigolds and a lot of laughing. Wear sunshine yellow, nothing you’d mind staining.', photo: SHOTS.marigold },
        { name: 'Mehendi', date: '2027-02-12', time: '16:00', where: '4 pm, in the courtyard', note: 'Henna, music and a long golden afternoon.', photo: SHOTS.henna },
        { name: 'Sangeet', date: '2027-02-13', time: '20:00', where: '8 pm, in the ballroom', note: 'Choreography is optional. Dancing is not.', photo: SHOTS.diyaLedge },
        { name: 'Wedding', date: '2027-02-14', time: '19:00', where: '7 pm, in The Grand Hall', note: 'Seven vows, then one very good party.', photo: SHOTS.diyas },
        { name: 'Reception', date: '2027-02-15', time: '20:00', where: '8 pm, on the rooftop', note: 'Dinner under the open sky, then one last dance. Black tie with a splash of pink.', photo: SHOTS.sunsetTree },
      ],
      photos: { hero: COUPLE, venue: SHOTS.diyas, rsvp: SHOTS.diyaLedge, bless: SHOTS.marigold, gallery: [] },
    },
  },
]

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const ist = (date: string, time: string) => `${date.replace(/-/g, '')}T${time.replace(':', '')}00`
// "Friday, 10 December 2027" from 2027-12-10.
const longDate = (date: string) => {
  const d = new Date(`${date}T00:00:00Z`)
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}
// "7:30 pm" from 19:30.
const clock = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'am' : 'pm'}`
}
// Three hours after the start, for the calendar entry.
const plus3h = (date: string, time: string) => {
  const d = new Date(`${date}T${time}:00Z`)
  d.setUTCHours(d.getUTCHours() + 3)
  return d.toISOString().slice(0, 16).replace(/[-:]/g, '') + '00'
}

// A real calendar day and clock time: the shape alone lets 2027-02-31 or 25:61 through, and those make Date throw
// (toISOString) or print "undefined" in Safari.
const realDate = (d: string) => {
  const t = new Date(`${d}T00:00:00Z`)
  return /^\d{4}-\d\d-\d\d$/.test(d) && !isNaN(t.getTime()) && t.toISOString().startsWith(d)
}
const realTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)

export function toDesign(look: Look, c: Content = look.demo): Design {
  const { demo, ...rest } = look
  const at = <T,>(xs: T[], i: number) => xs[i % xs.length]
  // A couple's site never shows the sample couple: a place they left empty that the sample fills with the
  // strangers gets the couple's own photos, or else the design's places and things.
  const own = c !== demo
  const mine = [c.photos.hero, c.photos.venue, ...c.photos.gallery].filter((p): p is Photo => !!p)
  const places = [...new Set([demo.photos.hero, demo.photos.venue, demo.photos.rsvp, demo.photos.bless, demo.photos.finale, ...demo.photos.gallery, ...demo.events.map((e) => e.photo)])].filter((p): p is Photo => !!p && !PEOPLE.has(p))
  const fill = <P extends Photo | undefined>(p: P, i = 0): P => (own && p && PEOPLE.has(p) ? (at(mine.length ? mine : places.length ? places : [SHOTS.marigold], i) as P) : p)
  const venueMap = mapsUrl(c.venue.trim() || c.city)
  const today = new Date().toISOString().slice(0, 10)
  return {
    ...rest,
    ...c,
    // A blank family is named after its side, so the RSVP never offers an empty choice; no venue yet shows the city.
    families: c.families.map((f, i) => f.trim() || `${c.couple[i]}’s family`) as [string, string],
    venue: c.venue.trim() || c.city,
    // No RSVP form, so no "Reply by" pointing at it.
    rsvpBy: c.hide?.includes('rsvp') ? '' : c.rsvpBy,
    meet: c.meet?.map((m, i) => ({ name: c.couple[i] ?? '', bio: m.bio, photo: m.photo ?? fill(demo.meet?.[i]?.photo ?? at(demo.photos.gallery, i), i) })),
    story: c.story.map((s, i) => ({ ...s, photo: s.photo ?? fill(at(demo.story, i).photo!, i) })),
    events: c.events.map((e, i) => {
      const date = realDate(e.date) ? e.date : today
      const time = realTime(e.time) ? e.time : '10:00'
      // The samples point every event at their one venue; a couple's event has directions only if they gave some.
      const given = e.map?.trim() ?? ''
      const link = /^https?:\/\//i.test(given)
      const map = own && e.map !== undefined ? (link ? given : mapsUrl(given) || undefined) : venueMap || undefined
      // "In the haveli courtyard" alone would hide the start time; words with a time in them replace it.
      const when = !e.where ? clock(time) : /\p{Nd}/u.test(e.where) ? e.where : `${clock(time)}, ${e.where}`
      return { id: e.id ?? `e${i}`, name: e.name, date: longDate(date), start: ist(date, time), end: plus3h(date, time), time: when, note: e.note, map, place: link ? undefined : given || undefined, photo: e.photo ?? fill(at(demo.events, i).photo!, i) }
    }),
    mainEvent: c.mainEvent === undefined ? undefined : (c.events[c.mainEvent]?.id ?? `e${c.mainEvent}`),
    hero: c.photos.hero ?? fill(demo.photos.hero!),
    venuePhoto: c.photos.venue ?? fill(demo.photos.venue!),
    rsvpPhoto: c.photos.rsvp ?? fill(demo.photos.rsvp!, 1),
    blessPhoto: c.photos.bless ?? fill(demo.photos.bless!, 2),
    finale: c.photos.finale ?? fill(demo.photos.finale, 3),
    // A couple's gallery is only their own photos: the design's would show up among their story as if theirs.
    gallery: own ? c.photos.gallery : demo.photos.gallery,
    // Ganesha's emblem stays only on a site that invokes him.
    emblem: own && rest.emblem === 'ganesha' && !invokesGanesh(c.invocation) ? undefined : rest.emblem,
  }
}

// An invocation that names Ganesh, in the scripts the site is written in.
// His names and the shlokas that call on him without naming him (Vakratunda Mahakaya, Gajanana, Ekadanta...).
export const invokesGanesh = (s = '') =>
  /ganesh|ganpat|ganapat|vinayak|vakratund|gajanan|lambodar|ekadant|gajmukh|gajamukh|गणेश|गणप|विनायक|वक्रतुण्ड|वक्रतुंड|गजानन|लम्बोदर|लंबोदर|एकदन्त|एकदंत|गजमुख|ગણેશ|ગણપ|વિનાયક|વક્રતુંડ|ગજાનન|લંબોદર|એકદંત|ਗਣੇਸ਼|ਗਣਪਤ|விநாயக|கணேச|கணபதி|பிள்ளையார்|వినాయక|గణేశ|గణపతి|ಗಣೇಶ|ಗಣಪತಿ|വിനായക|ഗണപതി/i.test(s)
// A Google Maps search for a place; blank when there is no place to search for.
// A function's id in a guest pass link (?events=sangeet,wedding): its name in plain lowercase letters and dashes, or
// f1, f2... by its place in the list when the name has no Latin letters (a function named in Gujarati or Hindi).
export const passId = (name: string, i: number) => name.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `f${i + 1}`
export const mapsUrl = (q: string) => (q.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q.trim())}` : '')
export const mainOf = (d: Design) => d.events.find((e) => e.id === d.mainEvent) ?? d.events[1] ?? d.events[0]
export const lookById = (id: string) => LOOKS.find((l) => l.id === id)
export const DESIGNS = LOOKS.map((l) => toDesign(l))
// Trailing slashes, as GitHub Pages serves each page from <path>/index.html (vite.config.ts writes them).
export const designPath = (d: { id: string }) => `/websites/${d.id}/`
// Page titles, shared by the app and the static copies the build writes (vite.config.ts), so search sees one title.
export const WEBSITES_TITLE = 'Free Wedding Website Designs with RSVP | ShaadiTemplate'
export const designKind = (d: { tradition: string }) => {
  const t = d.tradition.split(' · ')[0]
  return /wedding/i.test(t) ? t : `${t} wedding`
}
// The words a search engine reads on a sample design's page: the site itself is the fictional couple's, and its
// own heading only appears once a guest opens the gate (WeddingSite.tsx).
export function designIntro(d: Pick<Design, 'name' | 'tradition' | 'blurb' | 'couple' | 'city' | 'events'>) {
  const names = d.events.map((e) => e.name)
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]
  return {
    heading: `${d.name}: a free ${designKind(d)} website`,
    body: `${d.blurb} The live sample is ${d.couple[0]} and ${d.couple[1]}'s site: their story, ${list} with times and add to calendar, the venue in ${d.city} on a map, RSVP and guest blessings. Make it yours with your own names, functions and photos, then send one link to every guest on WhatsApp. It is free, and stays online until 30 days after your last function.`,
  }
}
export const designTitle = (d: { name: string; tradition: string }) => `${d.name}: Free ${designKind(d).replace(/\b[a-z]/g, (c) => c.toUpperCase())} Website`
export const designByPath = (path: string) => DESIGNS.find((d) => d.id === path.split('/')[2])
// Go to another page of the app without loading it again (App.tsx listens for popstate).
export const go = (path: string) => {
  history.pushState(null, '', path)
  dispatchEvent(new PopStateEvent('popstate'))
}
