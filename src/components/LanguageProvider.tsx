import { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "ar";

type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
};

type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
};

// Translations for both languages
const translations: Record<Language, Record<string, string>> = {
  en: {
    // App header
    "app.name": "FlashLearn",
    "app.description": "Spaced repetition flashcards",
    "app.decks": "decks",
    "app.cards": "cards",
    "app.deck": "deck",
    "app.card": "card",

    // Tabs
    "tabs.decks": "Flashcard Decks",
    "tabs.settings": "Settings",
    "tabs.about": "About",

    // Deck actions
    "deck.create": "Create Deck",
    "deck.name": "Deck Name",
    "deck.description": "Description",
    "deck.delete": "Delete Deck",
    "deck.edit": "Edit Deck",
    "deck.export": "Export Deck",
    "deck.study": "Study Deck",
    "deck.cancel": "Cancel",
    "deck.save": "Save",
    "deck.addCard": "Add Card",
    "deck.created": "Created",
    "deck.lastStudied": "Last Studied",
    "deck.never": "Never",
    "deck.cards": "Cards",
    "deck.empty": "No cards in this deck yet.",

    // DeckList component
    "decklist.title": "Your Flashcard Decks",
    "decklist.subtitle": "Select a deck to study or create a new one",
    "decklist.newDeck": "New Deck",
    "decklist.noDecks": "No decks yet",
    "decklist.createFirstPrompt": "Create your first flashcard deck to start learning. Add questions on the front and answers on the back.",
    "decklist.createFirstButton": "Create Your First Deck",
    "decklist.nameField": "Name",
    "decklist.namePlaceholder": "e.g., Spanish Vocabulary",
    "decklist.descriptionField": "Description (optional)",
    "decklist.descriptionPlaceholder": "What is this deck about?",
    "decklist.cancelButton": "Cancel",
    "decklist.createButton": "Create Deck",
    "decklist.enterDetails": "Enter a name and description for your new flashcard deck.",

    // DeckView component
    "deckview.studyNow": "Study Now",
    "deckview.addCard": "Add Card",
    "deckview.editDeck": "Edit Deck",
    "deckview.export": "Export",
    "deckview.deleteDeck": "Delete Deck",
    "deckview.cards": "Cards",
    "deckview.addAnother": "Add Another",
    "deckview.front": "Front",
    "deckview.back": "Back",
    "deckview.noCards": "This deck has no cards yet",
    "deckview.addFirstCard": "Add Your First Card",
    "deckview.editDeckTitle": "Edit Deck",
    "deckview.editDeckDesc": "Update the name and description of your deck.",
    "deckview.nameLabel": "Name",
    "deckview.descriptionLabel": "Description",
    "deckview.cancelButton": "Cancel",
    "deckview.saveChanges": "Save Changes",
    "deckview.addCardTitle": "Add New Card",
    "deckview.addCardDesc": "Create a new flashcard with front and back content.",
    "deckview.frontLabel": "Front",
    "deckview.frontPlaceholder": "Question or term",
    "deckview.backLabel": "Back",
    "deckview.backPlaceholder": "Answer or definition",
    "deckview.addCardButton": "Add Card",
    "deckview.editCardTitle": "Edit Card",
    "deckview.editCardDesc": "Update the content of your flashcard.",
    "deckview.saveCard": "Save Card",
    "deckview.deleteCardConfirm": "Are you sure you want to delete this card?",
    "deckview.deleteDeckConfirm": "Are you sure you want to delete \"{{deckName}}\" and all its cards?",
    "deckview.addCardsFirst": "Add Cards First",

    // Card actions
    "card.front": "Front (Question)",
    "card.back": "Back (Answer)",
    "card.edit": "Edit Card",
    "card.delete": "Delete Card",
    "card.save": "Save Card",
    "card.cancel": "Cancel",

    // Study view
    "study.showAnswer": "Show Answer",
    "study.again": "Again",
    "study.hard": "Hard",
    "study.good": "Good",
    "study.easy": "Easy",
    "study.complete": "Session Complete!",
    "study.congrats": "Congratulations! You've studied all cards in this deck.",
    "study.return": "Return to Decks",
    "study.restart": "Restart Study Session",
    "study.exit": "Exit",
    "study.studyAgain": "Study Again",
    "study.exitSession": "Exit Study Session",
    "study.card": "Card",
    "study.of": "of",
    "study.question": "Question",
    "study.answer": "Answer",
    "study.revealAnswer": "Reveal Answer",
    "study.tipText": "Tip: Use keyboard shortcuts: Space to reveal, 1-4 to rate cards",
    "study.noCards": "No Cards to Study",
    "study.noCardsDesc": "This deck doesn't have any cards yet. Add some cards first.",
    "study.backToDeck": "Back to Deck",
    "study.correct": "Correct",
    "study.incorrect": "Incorrect",
    "study.reviewTip": "Consider reviewing this deck again to improve your recall.",

    // Settings
    "settings.title": "Settings",
    "settings.importExport": "Import & Export",
    "settings.importExportDesc": "Import decks from JSON files or export your decks to share with others",
    "settings.importDeck": "Import Deck",
    "settings.importDeckDesc": "Import a deck from a JSON file. The file should contain a valid deck structure.",
    "settings.importButton": "Import Deck",
    "settings.importing": "Importing...",
    "settings.exportDeck": "Export Deck",
    "settings.exportDeckDesc": "You can export individual decks from the Decks tab by selecting a deck and clicking the Export button.",
    "settings.dataManagement": "Data Management",
    "settings.dataManagementDesc": "Manage your application data",
    "settings.clearData": "Clear All Data",
    "settings.clearDataDesc": "Delete all decks and cards. This action cannot be undone.",
    "settings.clearDataButton": "Clear All Data",
    "settings.confirmClearData": "Are you sure you want to delete all decks and cards? This cannot be undone.",
    "settings.theme": "Theme Settings",
    "settings.themeDesc": "Customize the application appearance",
    "settings.lightTheme": "Light",
    "settings.darkTheme": "Dark",
    "settings.systemTheme": "System",
    "settings.language": "Language",
    "settings.languageDesc": "Change the application language",
    "settings.english": "English",
    "settings.arabic": "العربية",
    "settings.about": "About FlashLearn",
    "settings.aboutDesc": "FlashLearn is a simple flashcard application that helps you study and memorize information effectively using spaced repetition. All data is stored locally in your browser.",
    "settings.howItWorks": "How it works",
    "settings.howItWorksDesc": "When studying, rate your recall from \"Again\" (didn't remember) to \"Easy\" (perfectly recalled). The application will use spaced repetition to optimize when you should review each card again.",

    // About page
    "about.title": "About",
    "about.appInfo": "Application Information",
    "about.appDescription": "Details about the FlashLearn application",
    "about.appLongDescription": "FlashLearn is a powerful flashcard application with spaced repetition algorithms to help you learn and memorize efficiently.",
    "about.version": "Version",
    "about.creatorInfo": "Creator Information",
    "about.creatorDescription": "Information about the developer of this application",
    "about.developer": "Developer",
    "about.freelancerProfile": "View Freelancer Profile",
    "about.contactMessage": "Feel free to contact for projects, suggestions, or improvements.",
    "about.features": "Features",
    "about.featuresDescription": "Main features of FlashLearn application",
    "about.feature1": "Create multiple decks for different subjects and topics",
    "about.feature2": "Spaced repetition algorithm for optimized learning",
    "about.feature3": "Dark mode support for comfortable studying at night",
    "about.feature4": "Arabic language support with RTL layout",
    "about.feature5": "Import and export decks to share with others",

    // Footer
    "footer.text": "FlashLearn • A simple flashcard application with spaced repetition"
  },
  ar: {
    // App header
    "app.name": "فلاش لرن",
    "app.description": "بطاقات تعليمية للمراجعة المتباعدة",
    "app.decks": "مجموعات",
    "app.cards": "بطاقات",
    "app.deck": "مجموعة",
    "app.card": "بطاقة",

    // Tabs
    "tabs.decks": "مجموعات البطاقات",
    "tabs.settings": "الإعدادات",
    "tabs.about": "حول",

    // Deck actions
    "deck.create": "إنشاء مجموعة",
    "deck.name": "اسم المجموعة",
    "deck.description": "الوصف",
    "deck.delete": "حذف المجموعة",
    "deck.edit": "تعديل المجموعة",
    "deck.export": "تصدير المجموعة",
    "deck.study": "دراسة المجموعة",
    "deck.cancel": "إلغاء",
    "deck.save": "حفظ",
    "deck.addCard": "إضافة بطاقة",
    "deck.created": "تاريخ الإنشاء",
    "deck.lastStudied": "آخر دراسة",
    "deck.never": "أبدًا",
    "deck.cards": "البطاقات",
    "deck.empty": "لا توجد بطاقات في هذه المجموعة بعد.",

    // DeckList component
    "decklist.title": "مجموعات البطاقات الخاصة بك",
    "decklist.subtitle": "اختر مجموعة للدراسة أو قم بإنشاء مجموعة جديدة",
    "decklist.newDeck": "مجموعة جديدة",
    "decklist.noDecks": "لا توجد مجموعات بعد",
    "decklist.createFirstPrompt": "قم بإنشاء مجموعة بطاقات تعليمية أولى للبدء في التعلم. أضف الأسئلة على الجهة الأمامية والإجابات على الخلف.",
    "decklist.createFirstButton": "إنشاء مجموعتك الأولى",
    "decklist.nameField": "الاسم",
    "decklist.namePlaceholder": "مثال: مفردات اللغة الإنجليزية",
    "decklist.descriptionField": "الوصف (اختياري)",
    "decklist.descriptionPlaceholder": "ما هو موضوع هذه المجموعة؟",
    "decklist.cancelButton": "إلغاء",
    "decklist.createButton": "إنشاء مجموعة",
    "decklist.enterDetails": "أدخل اسمًا ووصفًا لمجموعة البطاقات التعليمية الجديدة.",

    // DeckView component
    "deckview.studyNow": "الدراسة الآن",
    "deckview.addCard": "إضافة بطاقة",
    "deckview.editDeck": "تحرير المجموعة",
    "deckview.export": "تصدير",
    "deckview.deleteDeck": "حذف المجموعة",
    "deckview.cards": "البطاقات",
    "deckview.addAnother": "إضافة أخرى",
    "deckview.front": "الأمام",
    "deckview.back": "الخلف",
    "deckview.noCards": "لا توجد بطاقات في هذه المجموعة حتى الآن",
    "deckview.addFirstCard": "إضافة بطاقتك الأولى",
    "deckview.editDeckTitle": "تحرير المجموعة",
    "deckview.editDeckDesc": "تحديث اسم ووصف المجموعة الخاصة بك.",
    "deckview.nameLabel": "الاسم",
    "deckview.descriptionLabel": "الوصف",
    "deckview.cancelButton": "إلغاء",
    "deckview.saveChanges": "حفظ التغييرات",
    "deckview.addCardTitle": "إضافة بطاقة جديدة",
    "deckview.addCardDesc": "إنشاء بطاقة تعليمية جديدة بمحتوى أمامي وخلفي.",
    "deckview.frontLabel": "الأمام",
    "deckview.frontPlaceholder": "السؤال أو المصطلح",
    "deckview.backLabel": "الخلف",
    "deckview.backPlaceholder": "الإجابة أو التعريف",
    "deckview.addCardButton": "إضافة بطاقة",
    "deckview.editCardTitle": "تحرير البطاقة",
    "deckview.editCardDesc": "تحديث محتوى البطاقة التعليمية الخاصة بك.",
    "deckview.saveCard": "حفظ البطاقة",
    "deckview.deleteCardConfirm": "هل أنت متأكد أنك تريد حذف هذه البطاقة؟",
    "deckview.deleteDeckConfirm": "هل أنت متأكد أنك تريد حذف \"{{deckName}}\" وجميع بطاقاتها؟",
    "deckview.addCardsFirst": "أضف البطاقات أولاً",

    // Card actions
    "card.front": "الأمام (السؤال)",
    "card.back": "الخلف (الإجابة)",
    "card.edit": "تعديل البطاقة",
    "card.delete": "حذف البطاقة",
    "card.save": "حفظ البطاقة",
    "card.cancel": "إلغاء",

    // Study view
    "study.showAnswer": "عرض الإجابة",
    "study.again": "مجددًا",
    "study.hard": "صعب",
    "study.good": "جيد",
    "study.easy": "سهل",
    "study.complete": "اكتملت الجلسة!",
    "study.congrats": "تهانينا! لقد درست جميع البطاقات في هذه المجموعة.",
    "study.return": "العودة إلى المجموعات",
    "study.restart": "إعادة بدء جلسة الدراسة",
    "study.exit": "خروج",
    "study.studyAgain": "الدراسة مرة أخرى",
    "study.exitSession": "الخروج من جلسة الدراسة",
    "study.card": "بطاقة",
    "study.of": "من",
    "study.question": "سؤال",
    "study.answer": "إجابة",
    "study.revealAnswer": "إظهار الإجابة",
    "study.tipText": "نصيحة: استخدم اختصارات لوحة المفاتيح: مسافة للكشف، 1-4 لتقييم البطاقات",
    "study.noCards": "لا توجد بطاقات للدراسة",
    "study.noCardsDesc": "هذه المجموعة لا تحتوي على أي بطاقات بعد. أضف بعض البطاقات أولاً.",
    "study.backToDeck": "العودة إلى المجموعة",
    "study.correct": "الإجابات الصحيحة",
    "study.incorrect": "الإجابات الخاطئة",
    "study.reviewTip": "يُنصح بمراجعة هذه المجموعة مرة أخرى لتحسين قدرتك على التذكر.",

    // Settings
    "settings.title": "الإعدادات",
    "settings.importExport": "استيراد وتصدير",
    "settings.importExportDesc": "استيراد مجموعات من ملفات JSON أو تصدير مجموعاتك لمشاركتها مع الآخرين",
    "settings.importDeck": "استيراد مجموعة",
    "settings.importDeckDesc": "استيراد مجموعة من ملف JSON. يجب أن يحتوي الملف على بنية مجموعة صالحة.",
    "settings.importButton": "استيراد مجموعة",
    "settings.importing": "جاري الاستيراد...",
    "settings.exportDeck": "تصدير مجموعة",
    "settings.exportDeckDesc": "يمكنك تصدير مجموعات فردية من علامة تبويب المجموعات بتحديد مجموعة والنقر على زر التصدير.",
    "settings.dataManagement": "إدارة البيانات",
    "settings.dataManagementDesc": "إدارة بيانات التطبيق",
    "settings.clearData": "مسح جميع البيانات",
    "settings.clearDataDesc": "حذف جميع المجموعات والبطاقات. لا يمكن التراجع عن هذا الإجراء.",
    "settings.clearDataButton": "مسح جميع البيانات",
    "settings.confirmClearData": "هل أنت متأكد أنك تريد حذف جميع المجموعات والبطاقات؟ لا يمكن التراجع عن هذا الإجراء.",
    "settings.theme": "إعدادات المظهر",
    "settings.themeDesc": "تخصيص مظهر التطبيق",
    "settings.lightTheme": "فاتح",
    "settings.darkTheme": "داكن",
    "settings.systemTheme": "النظام",
    "settings.language": "اللغة",
    "settings.languageDesc": "تغيير لغة التطبيق",
    "settings.english": "English",
    "settings.arabic": "العربية",
    "settings.about": "حول فلاش لرن",
    "settings.aboutDesc": "فلاش لرن هو تطبيق بسيط للبطاقات التعليمية يساعدك على الدراسة وحفظ المعلومات بفعالية باستخدام المراجعة المتباعدة. يتم تخزين جميع البيانات محليًا في متصفحك.",
    "settings.howItWorks": "كيف يعمل",
    "settings.howItWorksDesc": "عند الدراسة، قم بتقييم تذكرك من \"مجددًا\" (لم تتذكر) إلى \"سهل\" (تذكرت بشكل مثالي). سيستخدم التطبيق المراجعة المتباعدة لتحسين موعد مراجعة كل بطاقة مرة أخرى.",

    // About page
    "about.title": "حول",
    "about.appInfo": "معلومات التطبيق",
    "about.appDescription": "تفاصيل حول تطبيق فلاش لرن",
    "about.appLongDescription": "فلاش لرن هو تطبيق قوي للبطاقات التعليمية مع خوارزميات المراجعة المتباعدة لمساعدتك على التعلم والحفظ بكفاءة.",
    "about.version": "الإصدار",
    "about.creatorInfo": "معلومات المطور",
    "about.creatorDescription": "معلومات عن مطور هذا التطبيق",
    "about.developer": "المطور",
    "about.freelancerProfile": "عرض الملف التعريفي",
    "about.contactMessage": "لا تتردد في التواصل للمشاريع أو الاقتراحات أو التحسينات.",
    "about.features": "المميزات",
    "about.featuresDescription": "الميزات الرئيسية لتطبيق فلاش لرن",
    "about.feature1": "إنشاء مجموعات متعددة لمختلف المواضيع والمواد",
    "about.feature2": "خوارزمية المراجعة المتباعدة للتعلم الأمثل",
    "about.feature3": "دعم الوضع الداكن للدراسة المريحة في الليل",
    "about.feature4": "دعم اللغة العربية مع تخطيط RTL",
    "about.feature5": "استيراد وتصدير المجموعات لمشاركتها مع الآخرين",

    // Footer
    "footer.text": "فلاش لرن • تطبيق بسيط للبطاقات التعليمية مع المراجعة المتباعدة"
  }
};

const initialState: LanguageProviderState = {
  language: "en",
  setLanguage: () => null,
  t: (key: string) => key,
  isRTL: false,
};

const LanguageProviderContext = createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = "en",
  storageKey = "flashcard-language",
  ...props
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage
  );

  const isRTL = language === "ar";

  useEffect(() => {
    const html = document.documentElement;

    if (isRTL) {
      html.setAttribute("dir", "rtl");
      html.classList.add("rtl");
    } else {
      html.setAttribute("dir", "ltr");
      html.classList.remove("rtl");
    }
  }, [isRTL]);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage: (language: Language) => {
      localStorage.setItem(storageKey, language);
      setLanguage(language);
    },
    t,
    isRTL,
  };

  return (
    <LanguageProviderContext.Provider {...props} value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);

  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider");

  return context;
};
