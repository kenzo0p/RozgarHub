import { DEFAULT_LANGUAGE, type Language } from './constants.js';

/**
 * Server-side i18n for user-facing notifications and SMS.
 *
 * The UI language lives in the browser, but messages we *generate* (in-app
 * notifications, accept/reject SMS) must reach a worker in their own language
 * even when they never open the app. Each user stores a `language` preference;
 * we look it up and render the message from this dictionary.
 *
 * Keys are flat, dot-namespaced strings. `{var}` placeholders are interpolated.
 * Anything missing in a language falls back to English, so a partial
 * translation never ships a raw key.
 */
type Dict = Record<string, string>;

const messages: Record<Language, Dict> = {
  en: {
    'application_received.title': 'New application received',
    'application_received.message': 'A new applicant has applied for "{jobTitle}"',
    'application_received.sms': 'RozgarHub: New application for "{jobTitle}". Open the app to review.',
    'application_accepted.title': 'Application accepted',
    'application_accepted.message': 'Your application for "{jobTitle}" has been accepted',
    'application_accepted.sms': 'RozgarHub: Good news! You have been accepted for "{jobTitle}". Open the app to contact the employer.',
    'application_rejected.title': 'Application rejected',
    'application_rejected.message': 'Your application for "{jobTitle}" was not selected this time',
    'application_rejected.sms': 'RozgarHub: Update on your application for "{jobTitle}": not selected this time.',
    'welcome.title': 'Welcome to RozgarHub!',
    'welcome.employee': 'Start exploring jobs that match your skills. Update your profile and skills to get personalized recommendations.',
    'welcome.employer': 'Start by creating your company profile, then post your first job to find the right workers.',
    'password_changed.title': 'Password changed',
    'password_changed.message': 'Your password has been successfully reset. If you did not do this, please contact support immediately.',
    'review_received.title': 'You received a rating',
    'review_received.message': 'You got a {rating}★ rating for "{jobTitle}"',
  },
  hi: {
    'application_received.title': 'नया आवेदन प्राप्त हुआ',
    'application_received.message': '"{jobTitle}" के लिए एक नए उम्मीदवार ने आवेदन किया है',
    'application_received.sms': 'RozgarHub: "{jobTitle}" के लिए नया आवेदन। समीक्षा के लिए ऐप खोलें।',
    'application_accepted.title': 'आवेदन स्वीकृत',
    'application_accepted.message': '"{jobTitle}" के लिए आपका आवेदन स्वीकार कर लिया गया है',
    'application_accepted.sms': 'RozgarHub: खुशखबरी! "{jobTitle}" के लिए आपका चयन हो गया है। नियोक्ता से संपर्क करने के लिए ऐप खोलें।',
    'application_rejected.title': 'आवेदन अस्वीकृत',
    'application_rejected.message': '"{jobTitle}" के लिए आपका आवेदन इस बार चयनित नहीं हुआ',
    'application_rejected.sms': 'RozgarHub: "{jobTitle}" के लिए आपके आवेदन की स्थिति: इस बार चयन नहीं हुआ।',
    'welcome.title': 'RozgarHub में आपका स्वागत है!',
    'welcome.employee': 'अपने कौशल से मेल खाती नौकरियाँ खोजना शुरू करें। व्यक्तिगत सुझाव पाने के लिए अपनी प्रोफ़ाइल और कौशल अपडेट करें।',
    'welcome.employer': 'अपनी कंपनी प्रोफ़ाइल बनाकर शुरू करें, फिर सही कामगार खोजने के लिए अपनी पहली नौकरी पोस्ट करें।',
    'password_changed.title': 'पासवर्ड बदल गया',
    'password_changed.message': 'आपका पासवर्ड सफलतापूर्वक रीसेट कर दिया गया है। यदि यह आपने नहीं किया, तो कृपया तुरंत सहायता से संपर्क करें।',
    'review_received.title': 'आपको एक रेटिंग मिली',
    'review_received.message': '"{jobTitle}" के लिए आपको {rating}★ रेटिंग मिली',
  },
  mr: {
    'application_received.title': 'नवीन अर्ज प्राप्त झाला',
    'application_received.message': '"{jobTitle}" साठी एका नवीन उमेदवाराने अर्ज केला आहे',
    'application_received.sms': 'RozgarHub: "{jobTitle}" साठी नवीन अर्ज. पुनरावलोकनासाठी अ‍ॅप उघडा.',
    'application_accepted.title': 'अर्ज स्वीकारला',
    'application_accepted.message': '"{jobTitle}" साठी तुमचा अर्ज स्वीकारण्यात आला आहे',
    'application_accepted.sms': 'RozgarHub: आनंदाची बातमी! "{jobTitle}" साठी तुमची निवड झाली आहे. नियोक्त्याशी संपर्क साधण्यासाठी अ‍ॅप उघडा.',
    'application_rejected.title': 'अर्ज नाकारला',
    'application_rejected.message': '"{jobTitle}" साठी तुमचा अर्ज यावेळी निवडला गेला नाही',
    'application_rejected.sms': 'RozgarHub: "{jobTitle}" साठी तुमच्या अर्जाची स्थिती: यावेळी निवड झाली नाही.',
    'welcome.title': 'RozgarHub मध्ये आपले स्वागत आहे!',
    'welcome.employee': 'तुमच्या कौशल्यांशी जुळणाऱ्या नोकऱ्या शोधण्यास सुरुवात करा. वैयक्तिक शिफारसींसाठी तुमची प्रोफाइल आणि कौशल्ये अपडेट करा.',
    'welcome.employer': 'तुमची कंपनी प्रोफाइल तयार करून सुरुवात करा, नंतर योग्य कामगार शोधण्यासाठी तुमची पहिली नोकरी पोस्ट करा.',
    'password_changed.title': 'पासवर्ड बदलला',
    'password_changed.message': 'तुमचा पासवर्ड यशस्वीरित्या रीसेट झाला आहे. जर हे तुम्ही केले नसेल, तर कृपया त्वरित सपोर्टशी संपर्क साधा.',
    'review_received.title': 'तुम्हाला रेटिंग मिळाली',
    'review_received.message': '"{jobTitle}" साठी तुम्हाला {rating}★ रेटिंग मिळाली',
  },
  bn: {
    'application_received.title': 'নতুন আবেদন পাওয়া গেছে',
    'application_received.message': '"{jobTitle}" এর জন্য একজন নতুন প্রার্থী আবেদন করেছেন',
    'application_received.sms': 'RozgarHub: "{jobTitle}" এর জন্য নতুন আবেদন। পর্যালোচনা করতে অ্যাপ খুলুন।',
    'application_accepted.title': 'আবেদন গৃহীত',
    'application_accepted.message': '"{jobTitle}" এর জন্য আপনার আবেদন গৃহীত হয়েছে',
    'application_accepted.sms': 'RozgarHub: সুসংবাদ! "{jobTitle}" এর জন্য আপনি নির্বাচিত হয়েছেন। নিয়োগকর্তার সাথে যোগাযোগ করতে অ্যাপ খুলুন।',
    'application_rejected.title': 'আবেদন প্রত্যাখ্যাত',
    'application_rejected.message': '"{jobTitle}" এর জন্য আপনার আবেদন এবার নির্বাচিত হয়নি',
    'application_rejected.sms': 'RozgarHub: "{jobTitle}" এর জন্য আপনার আবেদনের অবস্থা: এবার নির্বাচিত হয়নি।',
    'welcome.title': 'RozgarHub-এ স্বাগতম!',
    'welcome.employee': 'আপনার দক্ষতার সাথে মানানসই চাকরি খোঁজা শুরু করুন। ব্যক্তিগত সুপারিশ পেতে আপনার প্রোফাইল ও দক্ষতা আপডেট করুন।',
    'welcome.employer': 'আপনার কোম্পানির প্রোফাইল তৈরি করে শুরু করুন, তারপর সঠিক কর্মী খুঁজতে আপনার প্রথম চাকরি পোস্ট করুন।',
    'password_changed.title': 'পাসওয়ার্ড পরিবর্তিত হয়েছে',
    'password_changed.message': 'আপনার পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে। যদি আপনি এটি না করে থাকেন, তবে অনুগ্রহ করে অবিলম্বে সহায়তার সাথে যোগাযোগ করুন।',
    'review_received.title': 'আপনি একটি রেটিং পেয়েছেন',
    'review_received.message': '"{jobTitle}" এর জন্য আপনি {rating}★ রেটিং পেয়েছেন',
  },
  gu: {
    'application_received.title': 'નવી અરજી પ્રાપ્ત થઈ',
    'application_received.message': '"{jobTitle}" માટે એક નવા ઉમેદવારે અરજી કરી છે',
    'application_received.sms': 'RozgarHub: "{jobTitle}" માટે નવી અરજી. સમીક્ષા માટે એપ ખોલો.',
    'application_accepted.title': 'અરજી સ્વીકૃત',
    'application_accepted.message': '"{jobTitle}" માટે તમારી અરજી સ્વીકારવામાં આવી છે',
    'application_accepted.sms': 'RozgarHub: સારા સમાચાર! "{jobTitle}" માટે તમારી પસંદગી થઈ છે. નોકરીદાતાનો સંપર્ક કરવા એપ ખોલો.',
    'application_rejected.title': 'અરજી નકારી',
    'application_rejected.message': '"{jobTitle}" માટે તમારી અરજી આ વખતે પસંદ થઈ નથી',
    'application_rejected.sms': 'RozgarHub: "{jobTitle}" માટે તમારી અરજીની સ્થિતિ: આ વખતે પસંદગી થઈ નથી.',
    'welcome.title': 'RozgarHub માં આપનું સ્વાગત છે!',
    'welcome.employee': 'તમારી કુશળતાને અનુરૂપ નોકરીઓ શોધવાનું શરૂ કરો. વ્યક્તિગત ભલામણો મેળવવા તમારી પ્રોફાઇલ અને કુશળતા અપડેટ કરો.',
    'welcome.employer': 'તમારી કંપની પ્રોફાઇલ બનાવીને શરૂ કરો, પછી યોગ્ય કામદારો શોધવા તમારી પ્રથમ નોકરી પોસ્ટ કરો.',
    'password_changed.title': 'પાસવર્ડ બદલાયો',
    'password_changed.message': 'તમારો પાસવર્ડ સફળતાપૂર્વક રીસેટ થયો છે. જો આ તમે કર્યું ન હોય, તો કૃપા કરીને તરત જ સપોર્ટનો સંપર્ક કરો.',
    'review_received.title': 'તમને રેટિંગ મળ્યું',
    'review_received.message': '"{jobTitle}" માટે તમને {rating}★ રેટિંગ મળ્યું',
  },
  pa: {
    'application_received.title': 'ਨਵੀਂ ਅਰਜ਼ੀ ਪ੍ਰਾਪਤ ਹੋਈ',
    'application_received.message': '"{jobTitle}" ਲਈ ਇੱਕ ਨਵੇਂ ਉਮੀਦਵਾਰ ਨੇ ਅਰਜ਼ੀ ਦਿੱਤੀ ਹੈ',
    'application_received.sms': 'RozgarHub: "{jobTitle}" ਲਈ ਨਵੀਂ ਅਰਜ਼ੀ। ਸਮੀਖਿਆ ਲਈ ਐਪ ਖੋਲ੍ਹੋ।',
    'application_accepted.title': 'ਅਰਜ਼ੀ ਸਵੀਕਾਰ ਕੀਤੀ',
    'application_accepted.message': '"{jobTitle}" ਲਈ ਤੁਹਾਡੀ ਅਰਜ਼ੀ ਸਵੀਕਾਰ ਕਰ ਲਈ ਗਈ ਹੈ',
    'application_accepted.sms': 'RozgarHub: ਖੁਸ਼ਖਬਰੀ! "{jobTitle}" ਲਈ ਤੁਹਾਡੀ ਚੋਣ ਹੋ ਗਈ ਹੈ। ਮਾਲਕ ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਲਈ ਐਪ ਖੋਲ੍ਹੋ।',
    'application_rejected.title': 'ਅਰਜ਼ੀ ਰੱਦ ਕੀਤੀ',
    'application_rejected.message': '"{jobTitle}" ਲਈ ਤੁਹਾਡੀ ਅਰਜ਼ੀ ਇਸ ਵਾਰ ਚੁਣੀ ਨਹੀਂ ਗਈ',
    'application_rejected.sms': 'RozgarHub: "{jobTitle}" ਲਈ ਤੁਹਾਡੀ ਅਰਜ਼ੀ ਦੀ ਸਥਿਤੀ: ਇਸ ਵਾਰ ਚੋਣ ਨਹੀਂ ਹੋਈ।',
    'welcome.title': 'RozgarHub ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ!',
    'welcome.employee': 'ਆਪਣੇ ਹੁਨਰ ਨਾਲ ਮੇਲ ਖਾਂਦੀਆਂ ਨੌਕਰੀਆਂ ਲੱਭਣੀਆਂ ਸ਼ੁਰੂ ਕਰੋ। ਨਿੱਜੀ ਸਿਫ਼ਾਰਸ਼ਾਂ ਲਈ ਆਪਣੀ ਪ੍ਰੋਫ਼ਾਈਲ ਅਤੇ ਹੁਨਰ ਅੱਪਡੇਟ ਕਰੋ।',
    'welcome.employer': 'ਆਪਣੀ ਕੰਪਨੀ ਪ੍ਰੋਫ਼ਾਈਲ ਬਣਾ ਕੇ ਸ਼ੁਰੂ ਕਰੋ, ਫਿਰ ਸਹੀ ਕਾਮੇ ਲੱਭਣ ਲਈ ਆਪਣੀ ਪਹਿਲੀ ਨੌਕਰੀ ਪੋਸਟ ਕਰੋ।',
    'password_changed.title': 'ਪਾਸਵਰਡ ਬਦਲਿਆ',
    'password_changed.message': 'ਤੁਹਾਡਾ ਪਾਸਵਰਡ ਸਫਲਤਾਪੂਰਵਕ ਰੀਸੈਟ ਹੋ ਗਿਆ ਹੈ। ਜੇ ਇਹ ਤੁਸੀਂ ਨਹੀਂ ਕੀਤਾ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਸਹਾਇਤਾ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
    'review_received.title': 'ਤੁਹਾਨੂੰ ਰੇਟਿੰਗ ਮਿਲੀ',
    'review_received.message': '"{jobTitle}" ਲਈ ਤੁਹਾਨੂੰ {rating}★ ਰੇਟਿੰਗ ਮਿਲੀ',
  },
  ta: {
    'application_received.title': 'புதிய விண்ணப்பம் பெறப்பட்டது',
    'application_received.message': '"{jobTitle}" க்கு ஒரு புதிய விண்ணப்பதாரர் விண்ணப்பித்துள்ளார்',
    'application_received.sms': 'RozgarHub: "{jobTitle}" க்கு புதிய விண்ணப்பம். மதிப்பாய்வு செய்ய ஆப்பைத் திறக்கவும்.',
    'application_accepted.title': 'விண்ணப்பம் ஏற்கப்பட்டது',
    'application_accepted.message': '"{jobTitle}" க்கான உங்கள் விண்ணப்பம் ஏற்றுக்கொள்ளப்பட்டது',
    'application_accepted.sms': 'RozgarHub: நல்ல செய்தி! "{jobTitle}" க்கு நீங்கள் தேர்ந்தெடுக்கப்பட்டீர்கள். வேலை வழங்குநரைத் தொடர்பு கொள்ள ஆப்பைத் திறக்கவும்.',
    'application_rejected.title': 'விண்ணப்பம் நிராகரிக்கப்பட்டது',
    'application_rejected.message': '"{jobTitle}" க்கான உங்கள் விண்ணப்பம் இந்த முறை தேர்ந்தெடுக்கப்படவில்லை',
    'application_rejected.sms': 'RozgarHub: "{jobTitle}" க்கான உங்கள் விண்ணப்ப நிலை: இந்த முறை தேர்வு செய்யப்படவில்லை.',
    'welcome.title': 'RozgarHub-க்கு வரவேற்கிறோம்!',
    'welcome.employee': 'உங்கள் திறன்களுக்கு ஏற்ற வேலைகளைத் தேடத் தொடங்குங்கள். தனிப்பயன் பரிந்துரைகளைப் பெற உங்கள் சுயவிவரத்தையும் திறன்களையும் புதுப்பிக்கவும்.',
    'welcome.employer': 'உங்கள் நிறுவன சுயவிவரத்தை உருவாக்கித் தொடங்குங்கள், பிறகு சரியான தொழிலாளர்களைக் கண்டறிய உங்கள் முதல் வேலையை இடுங்கள்.',
    'password_changed.title': 'கடவுச்சொல் மாற்றப்பட்டது',
    'password_changed.message': 'உங்கள் கடவுச்சொல் வெற்றிகரமாக மீட்டமைக்கப்பட்டது. இதை நீங்கள் செய்யவில்லை என்றால், உடனடியாக ஆதரவைத் தொடர்பு கொள்ளவும்.',
    'review_received.title': 'உங்களுக்கு மதிப்பீடு கிடைத்தது',
    'review_received.message': '"{jobTitle}" க்கு உங்களுக்கு {rating}★ மதிப்பீடு கிடைத்தது',
  },
  te: {
    'application_received.title': 'కొత్త దరఖాస్తు అందింది',
    'application_received.message': '"{jobTitle}" కోసం కొత్త అభ్యర్థి దరఖాస్తు చేశారు',
    'application_received.sms': 'RozgarHub: "{jobTitle}" కోసం కొత్త దరఖాస్తు. సమీక్షించడానికి యాప్ తెరవండి.',
    'application_accepted.title': 'దరఖాస్తు ఆమోదించబడింది',
    'application_accepted.message': '"{jobTitle}" కోసం మీ దరఖాస్తు ఆమోదించబడింది',
    'application_accepted.sms': 'RozgarHub: శుభవార్త! "{jobTitle}" కోసం మీరు ఎంపికయ్యారు. యజమానిని సంప్రదించడానికి యాప్ తెరవండి.',
    'application_rejected.title': 'దరఖాస్తు తిరస్కరించబడింది',
    'application_rejected.message': '"{jobTitle}" కోసం మీ దరఖాస్తు ఈసారి ఎంపిక కాలేదు',
    'application_rejected.sms': 'RozgarHub: "{jobTitle}" కోసం మీ దరఖాస్తు స్థితి: ఈసారి ఎంపిక కాలేదు.',
    'welcome.title': 'RozgarHub కు స్వాగతం!',
    'welcome.employee': 'మీ నైపుణ్యాలకు సరిపోయే ఉద్యోగాలను అన్వేషించడం ప్రారంభించండి. వ్యక్తిగత సిఫార్సుల కోసం మీ ప్రొఫైల్ మరియు నైపుణ్యాలను నవీకరించండి.',
    'welcome.employer': 'మీ కంపెనీ ప్రొఫైల్‌ను సృష్టించడం ద్వారా ప్రారంభించండి, ఆపై సరైన కార్మికులను కనుగొనడానికి మీ మొదటి ఉద్యోగాన్ని పోస్ట్ చేయండి.',
    'password_changed.title': 'పాస్‌వర్డ్ మార్చబడింది',
    'password_changed.message': 'మీ పాస్‌వర్డ్ విజయవంతంగా రీసెట్ చేయబడింది. ఇది మీరు చేయకపోతే, దయచేసి వెంటనే మద్దతును సంప్రదించండి.',
    'review_received.title': 'మీకు రేటింగ్ వచ్చింది',
    'review_received.message': '"{jobTitle}" కోసం మీకు {rating}★ రేటింగ్ వచ్చింది',
  },
};

/**
 * Resolve a localized string for the given language, interpolating {vars}.
 * Falls back to English for any missing language or key.
 */
export function tn(
  lang: Language | undefined,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = (lang && messages[lang]) || messages[DEFAULT_LANGUAGE];
  const value = dict[key] ?? messages[DEFAULT_LANGUAGE][key] ?? key;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, k: string) =>
    vars[k] != null ? String(vars[k]) : '',
  );
}
