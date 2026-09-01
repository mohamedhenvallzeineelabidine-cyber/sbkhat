/* =========================================================================
   config.js : LE SEUL FICHIER À MODIFIER
   الملف الوحيد الذي تحتاج إلى تعديله

   Tout le contenu du site vient d'ici : nom, couleurs, أعصار, أنشطة,
   داعمون, moyens de don, contacts. Aucune donnée réelle n'est incluse.
   ========================================================================= */

window.CONFIG = {

  /* ---------- 1. IDENTITÉ / الهوية ------------------------------------- */
  org: {
    fullName:   "المنظمة الشبابية لإنماء قرية اسبيخات",
    shortName:  "المنظمة الشبابية لإنماء قرية اسبيخات",
    titleLine1: "المنظمة الشبابية لإنماء",   // 1re ligne du titre d'accueil
    titleLine2: "قرية اسبيخات",              // 2e ligne (mise en avant)
    country:    "موريتانيا 🇲🇷",
    metaDescription: "منصة عضوية وأنشطة المنظمة الشبابية لإنماء قرية اسبيخات"
  },

  /* ---------- 2. COULEURS / الألوان ------------------------------------ */
  // Modifier ici change tout le site (elles sont injectées en CSS).
  theme: {
    primary:     "#14563F",   // vert principal
    primaryDeep: "#0B2E22",   // vert foncé
    gold:        "#C9992F",   // doré (accent)
    paper:       "#F7F5EF"    // fond
  },

  /* ---------- 3. CONTACT ----------------------------------------------- */
  contact: {
    whatsapp: "",             // ex : "22212345678" (indicatif sans +, sans espaces)
    email:    "",             // ex : "contact@example.org"
    facebook: ""              // ex : "https://facebook.com/..."
  },

  /* ---------- 4. BASE DE DONNEES (Google Sheets) -----------------------
     Colle ici l'adresse de l'application web Apps Script (finit par /exec).
     Tant qu'elle est vide, le site utilise les listes statiques plus bas.
     -------------------------------------------------------------------- */
  api: {
    url: "https://script.google.com/macros/s/AKfycbxeEMK6Z-XlRInTP8eDqbA6_-wmZzTU9o0l_O4tWdwugVgfPVWZ4PBfv6cCk_YbWbs/exec"   // ex : "https://script.google.com/macros/s/AKfy.../exec"
  },

  /* ---------- 5. INSCRIPTION / استمارة الانضمام ------------------------ */
  registration: {
    // "sheets"    : enregistré dans Google Sheets (nécessite api.url)
    // "whatsapp"  : le formulaire ouvre WhatsApp avec le message pré-rempli
    // "formspree" : le formulaire est envoyé à une adresse e-mail via Formspree
    // "closed"    : inscriptions fermées
    mode: "sheets",
    formspreeEndpoint: ""     // ex : "https://formspree.io/f/xxxxxxx"
  },

  /* ---------- 6. الأعصار (groupes d'âge) -------------------------------
     Ajoute une ligne par عصر. Tout est à zéro : aucune donnée réelle.
       name     : nom du عصر
       target   : nombre total de personnes du عصر
       members  : nombre d'inscrits
       accounts : nombre de comptes sur l'application
     Exemple :
       { name: "البدريين", target: 40, members: 0, accounts: 0 },
     -------------------------------------------------------------------- */
  // Ignorées si api.url est renseignée (les données viennent alors du tableur).
  ages: [
    // { name: "العصر الأول",  target: 0, members: 0, accounts: 0 },
    // { name: "العصر الثاني", target: 0, members: 0, accounts: 0 },
  ],

  /* ---------- 7. الأنشطة ------------------------------------------------
       title, date, status ("upcoming" | "running" | "ended"),
       description, image (ex: "assets/img/mon-activite.jpg" ou ""), link
     -------------------------------------------------------------------- */
  activities: [
    // {
    //   title: "اسم النشاط",
    //   date: "12 و 13 سبتمبر",
    //   status: "upcoming",
    //   description: "وصف قصير للنشاط",
    //   image: "",
    //   link: ""
    // },
  ],

  /* ---------- 8. الداعمون ----------------------------------------------
       name + amount (0 = montant masqué) + note
     -------------------------------------------------------------------- */
  supporters: [
    // { name: "اسم الداعم", amount: 0, note: "" },
  ],

  /* ---------- 9. ادعم / dons ------------------------------------------- */
  donation: {
    enabled:  true,
    currency: "أوقية",
    goal:     0,              // 0 = pas de barre d'objectif
    raised:   0,
    methods: [
      // { label: "بنكيلي", value: "48171733" },
      // { label: "مصرفي",  value: "48171733" },
    ],
    note: ""                  // texte libre affiché sous les moyens de don
  },

  /* ---------- 10. COMPTES MEMBRES --------------------------------------- */
  // Ce site est statique : il n'y a pas de base de données.
  // Si tu ajoutes plus tard un service de comptes, mets son adresse ici
  // et le bouton « تسجيل الدخول » pointera dessus.
  auth: {
    loginUrl: "",             // ex : "https://mon-app.onrender.com/login"
    adminUrl: ""
  },

  /* ---------- 11. LIBELLÉS DU MENU / أسماء الصفحات --------------------- */
  nav: {
    home:       "الرئيسية",
    activities: "الأنشطة",
    supporters: "الداعمون",
    donate:     "ادعم",
    ages:       "الأعصار"
  }
};
