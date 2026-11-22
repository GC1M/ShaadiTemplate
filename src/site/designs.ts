import type { SymbolId } from '../types'
import { SHOTS, type Photo } from './photos'

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
  demo: Content
}

// date is YYYY-MM-DD and time HH:MM, both in IST. where: the time and place in words ("7 pm, in the lawns").
// id: a short stable name, so replies still point at the right event after others are added or removed.
export type SiteEvent = { id?: string; name: string; date: string; time: string; where: string; note: string; photo?: Photo }
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
  // Optional line of invocation on the opening screen, and a short personal note from the couple before the closing.
  invocation?: string
  note?: string
  notes: string[]
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

export type WeddingEvent = { id: string; name: string; date: string; start: string; end: string; time: string; note: string; photo: Photo }
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

const CORMORANT = '"Cormorant Garamond", Georgia, serif'
const PINYON = '"Pinyon Script", cursive'
const GREAT_VIBES = '"Great Vibes", cursive'

export const LOOKS: Look[] = [
  {
    id: 'rajwada',
    name: 'Rajwada Rose',
    blurb: 'Maroon doors, gold scrolls and ivory walls, for a royal Rajasthani wedding.',
    tradition: 'Hindu wedding · Jaipur',
    layout: 'veil',
    theme: { bg: '#f8f2e9', raised: '#efe5d5', accent: '#b8862f', text: '#4a1020', soft: '#8c2a3c', display: CORMORANT, script: PINYON, panel: '#6d1426', panelText: '#fbf1e2' },
    elephants: true,
    demo: {
      couple: ['Aditi', 'Vihaan'],
      families: ['Aditi’s family', 'Vihaan’s family'],
      parents: ['Daughter of Smt. Sunita and Shri Rakesh Sharma, granddaughter of Late Shri Ramesh Chandra Sharma', 'Son of Smt. Kavita and Shri Ajay Rathore, grandson of Smt. Kamla Devi and Late Shri Mohan Singh Rathore'],
      notes: ['Complimentary valet parking at the main gate of the City Palace.', 'The baraat leaves the hotel at 6 pm. Bring your dancing shoes.', 'Jaipur nights are cool in December. A shawl for the pheras.'],
      compliments: ['Shri Mahesh Sharma and family (Chacha-Chachi)', 'Smt. Asha Gupta and family (Bua)', 'Shri Vikram Rathore and family (Mama-Mami)'],
      city: 'Jaipur',
      venue: 'City Palace, Jaipur',
      invite: 'With the blessings of Shri Ganesh and our elders, we joyfully invite you to celebrate the wedding of our children.',
      rsvpBy: '15 November',
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
      families: ['The bride’s family', 'The groom’s family'],
      parents: ['Daughter of Smt. Neelam and Shri Anil Malhotra, granddaughter of Smt. Kusum and Late Shri Prem Nath Malhotra', 'Son of Smt. Ritu and Shri Sanjeev Khanna, grandson of Smt. Savitri and Shri Ramesh Khanna'],
      compliments: ['Shri Rajiv Malhotra and family', 'Smt. Pooja Kapoor and family', 'Shri Deepak Khanna and family', 'Smt. Anju Sethi and family'],
      note: 'We have waited a long time to stand in a garden full of the people we love. Come hungry, come early, and stay until the last song.',
      notes: ['The ceremonies are on the lawns; flat shoes are kinder to the grass.', 'Parking is at the hotel porch with valet from 6 pm.', 'Children are very welcome. There is a play corner by the pool.'],
      city: 'New Delhi',
      venue: 'The Lodhi, Lodhi Road, New Delhi',
      invite: 'With the blessings of our elders, the Malhotra and Khanna families invite you to celebrate with us.',
      rsvpBy: '1 January',
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
    tradition: 'Hindu wedding · Varanasi',
    layout: 'veil',
    theme: { bg: '#141a33', raised: '#1d2546', accent: '#e2b04a', text: '#f2ecdf', soft: '#a9b6e0', display: '"Marcellus", Georgia, serif', script: GREAT_VIBES },
    storyStyle: 'carousel',
    cards: 'timeline',
    dateReveal: true,
    closing: 'garden',
    demo: {
      invocation: '॥ ॐ नमः शिवाय ॥',
      couple: ['Tara', 'Shaurya'],
      families: ['Tara’s family', 'Shaurya’s family'],
      parents: ['Daughter of Smt. Archana and Shri Alok Tripathi, granddaughter of Smt. Shanti and Late Shri Kailash Tripathi', 'Son of Smt. Meenu and Shri Vineet Mishra, grandson of Smt. Kamla and Shri Gopal Mishra'],
      compliments: ['Shri Ashok Tripathi and family', 'Smt. Rekha Pandey and family', 'Shri Manoj Mishra and family'],
      note: 'Varanasi is where both our families began. We cannot think of a better place to begin ours, with all of you on the ghats.',
      notes: ['Boats to the evening aarti leave the hotel jetty at 6 pm.', 'The lanes are narrow; e-rickshaws wait at the main gate.', 'Please dress modestly for the aarti on the ghats.'],
      city: 'Varanasi',
      venue: 'BrijRama Palace, Darbhanga Ghat, Varanasi',
      invite: 'By the grace of Mahadev and with the blessings of our elders, we invite you to our wedding on the ghats of Kashi.',
      rsvpBy: '15 October',
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
    tradition: 'Hindu wedding · Udaipur',
    layout: 'veil',
    theme: { bg: '#1e1519', raised: '#2a1f24', accent: '#c9a15b', text: '#f3ece3', soft: '#d7a79e', display: CORMORANT, script: CORMORANT },
    demo: {
      couple: ['Ananya', 'Arjun'],
      families: ['Ananya’s family', 'Arjun’s family'],
      parents: ['Daughter of Smt. Rekha and Shri Vivek Mehta', 'Son of Smt. Anjali and Shri Rajiv Kapoor'],
      notes: ['Udaipur airport is 40 minutes away; cars will be waiting for every flight on the 20th.', 'The pheras are outdoors by the lake. Bring a shawl for the evening.', 'Boats to the palace leave from the City Palace jetty every 20 minutes.'],
      city: 'Udaipur',
      venue: 'The Leela Palace, Lake Pichola, Udaipur',
      invite: 'With the blessings of our families, we would love you to be with us in Udaipur as we marry.',
      rsvpBy: '1 October',
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
      families: ['Simran’s family', 'Harjot’s family'],
      parents: ['Daughter of Sardarni Harpreet Kaur and Sardar Gurmeet Singh Gill', 'Son of Sardarni Jasleen Kaur and Sardar Manjit Singh Sandhu'],
      notes: ['Please cover your head during the Anand Karaj. Rumals are kept at the door.', 'Langar follows the ceremony; shoes come off at the gurdwara entrance.', 'Amritsar is cold in February. Pack a warm shawl for the evening.'],
      city: 'Amritsar',
      venue: 'Ranjit’s Svaasa, Amritsar',
      invite: 'With Waheguru’s grace and our families’ blessings, we invite you to our Anand Karaj in Amritsar.',
      rsvpBy: '15 December',
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
      families: ['Zoya’s family', 'Kabir’s family'],
      parents: ['Daughter of Begum Nasreen and Janab Imran Siddiqui', 'Son of Begum Farah and Janab Asif Rizvi'],
      notes: ['Seating for the nikah is separate for men and women, as the families prefer.', 'Dinner at the walima is served from 9:30 pm.', 'Valet parking is at the main porch of the hotel.'],
      city: 'Lucknow',
      venue: 'Taj Mahal Lucknow, Gomti Nagar',
      invite: 'By the grace of Allah and with our families’ duas, we invite you to our nikah in Lucknow.',
      rsvpBy: '10 September',
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
    tradition: 'Garden wedding · New Delhi',
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

export function toDesign(look: Look, c: Content = look.demo): Design {
  const { demo, ...rest } = look
  const at = <T,>(xs: T[], i: number) => xs[i % xs.length]
  const today = new Date().toISOString().slice(0, 10)
  return {
    ...rest,
    ...c,
    meet: c.meet?.map((m, i) => ({ name: c.couple[i] ?? '', bio: m.bio, photo: m.photo ?? demo.meet?.[i]?.photo ?? at(demo.photos.gallery, i) })),
    story: c.story.map((s, i) => ({ ...s, photo: s.photo ?? at(demo.story, i).photo! })),
    events: c.events.map((e, i) => {
      const date = /^\d{4}-\d\d-\d\d$/.test(e.date) ? e.date : today
      const time = /^\d\d:\d\d$/.test(e.time) ? e.time : '10:00'
      return { id: e.id ?? `e${i}`, name: e.name, date: longDate(date), start: ist(date, time), end: plus3h(date, time), time: e.where || clock(time), note: e.note, photo: e.photo ?? at(demo.events, i).photo! }
    }),
    mainEvent: c.mainEvent === undefined ? undefined : (c.events[c.mainEvent]?.id ?? `e${c.mainEvent}`),
    hero: c.photos.hero ?? demo.photos.hero!,
    venuePhoto: c.photos.venue ?? demo.photos.venue!,
    rsvpPhoto: c.photos.rsvp ?? demo.photos.rsvp!,
    blessPhoto: c.photos.bless ?? demo.photos.bless!,
    finale: c.photos.finale ?? demo.photos.finale,
    gallery: c.photos.gallery.length ? c.photos.gallery : demo.photos.gallery,
  }
}

export const mainOf = (d: Design) => d.events.find((e) => e.id === d.mainEvent) ?? d.events[1] ?? d.events[0]
export const lookById = (id: string) => LOOKS.find((l) => l.id === id)
export const DESIGNS = LOOKS.map((l) => toDesign(l))
// Trailing slashes, as GitHub Pages serves each page from <path>/index.html (vite.config.ts writes them).
export const designPath = (d: { id: string }) => `/websites/${d.id}/`
export const designByPath = (path: string) => DESIGNS.find((d) => d.id === path.split('/')[2])
// Go to another page of the app without loading it again (App.tsx listens for popstate).
export const go = (path: string) => {
  history.pushState(null, '', path)
  dispatchEvent(new PopStateEvent('popstate'))
}
