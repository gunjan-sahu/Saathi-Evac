import type { UserRole } from "@/lib/contracts"

export type Lang = "en" | "hi"
export const LANG_KEY = "sahaara.lang"

export const UI = {
  en: {
    back: "Choose another role",
    signInAs: (r: string) => `Sign in as ${r.toLowerCase()}`,
    desc: (r: string) => `Use the account your coordinator created for you. Only ${r.toLowerCase()} accounts can enter this portal.`,
    username: "Username",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    show: "Show password",
    hide: "Hide password",
    errUser: "Enter your username (at least 3 characters).",
    errPass: "Enter your password.",
    badResponse: "Unexpected response from the sign-in service.",
    demoTitle: "Explore with Demo Credentials",
    demoNote: "For demonstration only.",
    copy: "Copy",
    copied: "Copied",
    fill: "Fill form",
    firstTime: "First time here?",
    createCoord: "Create the first coordinator account",
    signInEyebrow: (r: string) => `${r} sign-in`,
    chips: ["Role-based access", "Hindi & English", "Privacy by default"],
  },
  hi: {
    back: "दूसरी भूमिका चुनें",
    signInAs: (r: string) => `${r} के रूप में साइन इन करें`,
    desc: (r: string) => `अपने समन्वयक द्वारा बनाया गया खाता उपयोग करें। केवल ${r} खाते इस पोर्टल में प्रवेश कर सकते हैं।`,
    username: "उपयोगकर्ता नाम",
    password: "पासवर्ड",
    signIn: "साइन इन",
    signingIn: "साइन इन हो रहा है…",
    show: "पासवर्ड दिखाएँ",
    hide: "पासवर्ड छिपाएँ",
    errUser: "अपना उपयोगकर्ता नाम दर्ज करें (कम से कम 3 अक्षर)।",
    errPass: "अपना पासवर्ड दर्ज करें।",
    badResponse: "साइन-इन सेवा से अप्रत्याशित उत्तर मिला।",
    demoTitle: "डेमो क्रेडेंशियल्स के साथ आज़माएँ",
    demoNote: "केवल प्रदर्शन के लिए।",
    copy: "कॉपी",
    copied: "कॉपी हो गया",
    fill: "फ़ॉर्म भरें",
    firstTime: "पहली बार?",
    createCoord: "पहला समन्वयक खाता बनाएँ",
    signInEyebrow: (r: string) => `${r} साइन-इन`,
    chips: ["भूमिका-आधारित पहुँच", "हिंदी और अंग्रेज़ी", "डिफ़ॉल्ट रूप से गोपनीयता"],
  },
}

export const ROLE_HI: Record<UserRole, { label: string; portal: string; tagline: string; points: string[] }> = {
  coordinator: {
    label: "समन्वयक",
    portal: "आपातकालीन कमान सेंटर",
    tagline: "सब कुछ देखें। सबको जोड़ें।",
    points: ["आयोजन और चेतावनियाँ शुरू करें", "कतार और लाइव मैप देखें"],
  },
  volunteer: {
    label: "स्वयंसेवक",
    portal: "सामुदायिक केंद्र",
    tagline: "वह इंसान बनें जिसका कोई इंतज़ार कर रहा है।",
    points: ["लोगों का पंजीकरण करें, ऑफ़लाइन भी", "चेक-इन करें: रास्ते में, पहुँच गया"],
  },
  rescue: {
    label: "बचाव दल",
    portal: "फ़ील्ड ऑपरेशंस",
    tagline: "जानें किसे क्या चाहिए, और कहाँ।",
    points: ["ज़रूरत के क्रम में मिशन, स्थान सहित", "स्वास्थ्य डेटा केवल आपदा के दौरान"],
  },
}