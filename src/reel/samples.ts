import type { Media } from './engine'

// Sample wedding photos and clips, so every format plays as a finished reel before the family adds anything. All
// from Wikimedia Commons (CC0 / CC BY / CC BY-SA), hotlinked like the website samples (src/site/photos.ts) and
// credited under the preview. Commons serves them with CORS, so the canvas stays exportable.

export interface Sample {
  path: string // after /wikipedia/commons/
  w: number
  h: number
  kind: 'image' | 'video'
  url?: string // videos: a transcoded WebM
  secs?: number
  by: string
  licence: string
  alt: string
}

export const SAMPLES: Record<string, Sample> = {
  bridePortrait: { path: '8/80/Hindu_Bride%2C_Ahmedabad%2C_Gujarat.jpg', w: 2032, h: 2750, kind: 'image', by: 'Yann Forget', licence: 'CC BY-SA 4.0', alt: 'Gujarati bride in red and gold, portrait' },
  brideSmile: { path: '5/5a/Nepali_hindu_bride.JPG', w: 3456, h: 5184, kind: 'image', by: 'Nirmal Dulal', licence: 'CC BY-SA 4.0', alt: 'Smiling bride with folded hands greeting guests' },
  brideNamaskaram: { path: '0/09/Bride_offering_her_respects_to_God_through_a_traditional_gesture_known_as_Namaskaram_%2801%29-1.jpg', w: 4000, h: 6000, kind: 'image', by: 'I.Mahesh (derivative by Cart)', licence: 'CC BY-SA 4.0', alt: 'Bride in silk saree with folded hands after the mangalsutra' },
  brideMirror: { path: '7/79/Bride_adjusting_her_nose_piercing.jpg', w: 3486, h: 5228, kind: 'image', by: 'iMahesh', licence: 'CC BY-SA 4.0', alt: 'Bride adjusting her nath while getting ready' },
  brideMakeup: { path: 'e/ea/Minimalistic_Magic_With_Indian_Bridal_Makeup.jpg', w: 3747, h: 5632, kind: 'image', by: 'TAPAS KUMAR HALDER', licence: 'CC BY-SA 4.0', alt: 'Maharashtrian bride in bridal makeup' },
  groom: { path: '3/32/Hindu_Bridegroom%2C_Ahmedabad%2C_Gujarat.jpg', w: 1820, h: 3830, kind: 'image', by: 'Yann Forget', licence: 'CC BY-SA 4.0', alt: 'Gujarati groom in sherwani and safa' },
  groomOnWay: { path: '7/79/Indian_groom_on_it%27s_way_to_meet_his_bride.jpg', w: 3024, h: 4032, kind: 'image', by: 'Pulkithada01', licence: 'CC BY-SA 4.0', alt: 'Groom on his way to meet his bride' },
  groomGuests: { path: 'b/b2/Indian_Traditional_Wedding_Images_%2840%29.jpg', w: 5568, h: 3712, kind: 'image', by: 'AmanAgrahari01', licence: 'CC BY-SA 4.0', alt: 'Groom with the women of the family, Maharashtra' },
  baraatParents: { path: 'e/e3/Baraat.jpg', w: 3024, h: 4032, kind: 'image', by: 'Thenotsoboringgirl', licence: 'CC BY-SA 4.0', alt: 'Parents of the groom dancing in the baraat' },
  firstLook: { path: '4/43/A_bride_and_groom_greeting_for_the_first_time_in_wedding_ceremony.jpg', w: 5760, h: 3840, kind: 'image', by: 'Wikilover90', licence: 'CC BY-SA 4.0', alt: 'Bride and groom greeting each other for the first time' },
  varmala: { path: 'a/ac/Varmala_ceremony.jpg', w: 3264, h: 3922, kind: 'image', by: 'Kashish1711', licence: 'CC BY-SA 4.0', alt: 'Bride and groom exchanging varmala' },
  pheras: { path: '3/3b/Seven_circumambulations.jpg', w: 3752, h: 5444, kind: 'image', by: 'Bhumish143', licence: 'CC BY-SA 4.0', alt: 'Couple taking the pheras around the sacred fire' },
  sindoor: { path: 'f/f9/Bengali_bride_during_sindoor_daan_IMG_7811_1.jpg', w: 2987, h: 2941, kind: 'image', by: 'Sumita Roy Dutta', licence: 'CC BY-SA 4.0', alt: 'Groom applying sindoor to the bride' },
  haldiFriends: { path: '2/25/Haldi_MyBFF.jpg', w: 3024, h: 4032, kind: 'image', by: 'Thenotsoboringgirl', licence: 'CC BY-SA 4.0', alt: 'Friends at the haldi' },
  mehendi: { path: 'd/dc/Mehendi-clad_Hands_-_Bengali_Hindu_Bride_-_Howrah_2015-12-06_7384.JPG', w: 4000, h: 6016, kind: 'image', by: 'Biswarup Ganguly', licence: 'CC BY 3.0', alt: 'Bridal mehendi on both hands' },
  sangeet: { path: 'c/cd/Indian_wedding_sangeet.jpg', w: 7008, h: 4672, kind: 'image', by: '03Ani03', licence: 'CC BY-SA 4.0', alt: 'Sangeet dance performance' },
  dance: { path: '6/68/Wedding_dance.jpg', w: 8256, h: 5504, kind: 'image', by: '03Ani03', licence: 'CC BY-SA 4.0', alt: 'Guests dancing at a wedding' },
  garba: { path: '2/24/Garba_at_Indian_Wedding.jpg', w: 4608, h: 3456, kind: 'image', by: 'Yugaljoshi', licence: 'CC BY-SA 4.0', alt: 'Garba the night before the wedding' },
  familyDance: { path: 'f/ff/Groom%27s_family_dancing_at_wedding_ceremony.jpg', w: 5760, h: 3840, kind: 'image', by: 'Wikilover90', licence: 'CC BY-SA 4.0', alt: 'Family of the groom dancing' },
  brotherDance: { path: '5/59/Bride_Dance_with_brother.jpg', w: 4928, h: 3264, kind: 'image', by: 'Sheetall', licence: 'CC BY-SA 4.0', alt: 'Bride dancing with her brother' },
  vidaai: { path: '1/16/Farewells_in_Indian_Wedding.jpg', w: 3840, h: 5760, kind: 'image', by: 'Wikilover90', licence: 'CC BY-SA 4.0', alt: 'The bride leaving at the vidaai' },
  father: { path: 'a/a5/Father%27s_angel.jpg', w: 2592, h: 2592, kind: 'image', by: 'Aditya.singh112', licence: 'CC BY-SA 4.0', alt: 'Bride talking to her father during the pheras' },
  phoolonKiChaadar: { path: 'a/a1/Bride_making_appearance_under_the_flower_bed.jpg', w: 5760, h: 3840, kind: 'image', by: 'Wikilover90', licence: 'CC BY-SA 4.0', alt: 'Bride entering under a phoolon ki chaadar' },
  brideEntry: { path: '8/84/Bride_entering_her_wedding_mandap.jpg', w: 3840, h: 5760, kind: 'image', by: 'Wikilover90', licence: 'CC BY-SA 4.0', alt: 'Bride walking into the mandap' },
  mandap: { path: 'c/c0/Indian_Wedding_Mandap_Decoration.jpg', w: 3840, h: 5760, kind: 'image', by: 'Wikilover90', licence: 'CC BY-SA 4.0', alt: 'Decorated wedding mandap' },
  mithai: { path: '3/30/Laddu_preparation_for_Punjabi_wedding_06.jpg', w: 7952, h: 5304, kind: 'image', by: 'Satdeep Gill', licence: 'CC BY-SA 4.0', alt: 'Laddus being made for a Punjabi wedding' },
  jewellery: { path: '5/56/Jewelry_for_Indian_Wedding.jpg', w: 3456, h: 4608, kind: 'image', by: 'Yugaljoshi', licence: 'CC BY-SA 4.0', alt: 'Bridal jewellery' },
  bridesmaids: { path: 'b/b4/Bridesmaids_wearing_Phulkari_dupattas_at_a_Punjabi_wedding_in_the_US%2C_2019.jpg', w: 1628, h: 2078, kind: 'image', by: 'Sheebamadanloewinger', licence: 'CC BY-SA 4.0', alt: 'Bridesmaids in phulkari dupattas' },
  sisters: { path: '4/46/Bride%27s_sisters_welcoming_a_groom_in_ribbon_cutting_ceremony.jpg', w: 3840, h: 5760, kind: 'image', by: 'Wikilover90', licence: 'CC BY-SA 4.0', alt: 'Sisters of the bride at the ribbon cutting for the groom' },
  couple: { path: '1/10/Tradition_coupled_with_fun.jpg', w: 4016, h: 6016, kind: 'image', by: 'Bindya-nair', licence: 'CC BY-SA 4.0', alt: 'Bride and groom, candid portrait' },
  reception: { path: 'd/d4/Query_for_love_DSCN2304_reception.jpg', w: 2700, h: 3600, kind: 'image', by: 'Sumita Roy Dutta', licence: 'CC BY-SA 4.0', alt: 'Couple at the reception' },
  diya: { path: '1/10/Diya_at_a_wedding_in_Tamil_Nadu_01.jpg', w: 3648, h: 5472, kind: 'image', by: 'Kritzolina', licence: 'CC BY-SA 4.0', alt: 'Lit diya at a wedding' },
  mehendiClip: { path: '8/81/Video_clips_of_First_time_experiencing_Indian_Wedding_culture_Mehendi_and_the_expressions_VID_20241214_173254.webm', w: 1080, h: 1920, kind: 'video', url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/81/Video_clips_of_First_time_experiencing_Indian_Wedding_culture_Mehendi_and_the_expressions_VID_20241214_173254.webm/Video_clips_of_First_time_experiencing_Indian_Wedding_culture_Mehendi_and_the_expressions_VID_20241214_173254.webm.480p.vp9.webm', secs: 6, by: 'Sumita Roy Dutta', licence: 'CC BY-SA 4.0', alt: 'Mehendi at the wedding' },
  kaleereClip: { path: '4/42/Making_Kaleere.webm', w: 478, h: 850, kind: 'video', url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/4/42/Making_Kaleere.webm/Making_Kaleere.webm.480p.vp9.webm', secs: 60, by: 'KshitijShimla', licence: 'CC BY-SA 4.0', alt: 'Kaleere being tied, close-up' },
}

const file = (s: Sample) => decodeURIComponent(s.path.split('/').pop()!)
export const sampleSrc = (s: Sample, px = 1280) => {
  if (s.kind === 'video') return s.url!
  const name = s.path.split('/').pop()!
  // Commons refuses thumbnails wider than the original.
  return s.w > px ? `https://upload.wikimedia.org/wikipedia/commons/thumb/${s.path}/${px}px-${name}` : `https://upload.wikimedia.org/wikipedia/commons/${s.path}`
}
export const sampleLink = (s: Sample) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file(s))}`

const cache = new Map<string, Promise<Media>>()

// Loaded once per session and shared by every format that uses it.
export function loadSample(key: string): Promise<Media> {
  const s = SAMPLES[key]
  if (!s) return Promise.reject(new Error(`no sample ${key}`))
  let p = cache.get(key)
  if (!p) {
    p =
      s.kind === 'video'
        ? new Promise<Media>((ok, fail) => {
            const v = Object.assign(document.createElement('video'), { crossOrigin: 'anonymous', src: s.url!, muted: true, playsInline: true, loop: true, preload: 'auto' })
            v.style.cssText = 'position:fixed;left:-10px;top:0;width:1px;height:1px;opacity:0;pointer-events:none'
            document.body.append(v)
            v.onloadeddata = () => ok(v)
            v.onerror = () => fail(new Error(key))
            setTimeout(() => fail(new Error(`${key}: timeout`)), 20_000)
          })
        : fetch(sampleSrc(s)).then(async (r) => {
            if (!r.ok) throw new Error(`${key}: ${r.status}`)
            return createImageBitmap(await r.blob())
          })
    p.catch(() => cache.delete(key)) // let a later visit retry
    cache.set(key, p)
  }
  return p
}
