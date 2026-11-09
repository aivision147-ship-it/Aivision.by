import { catalogTemplates } from "@/data/catalog-presets";

export type ProgramRow = { time: string; title: string; text: string };

export const sampleBlocks = {
  names: true,
  photo: true,
  date: true,
  place: true,
  placePhoto: true,
  program: true,
  timer: true,
  map: true,
  dress: true,
  palette: true,
  words: true,
  gifts: true,
  flowers: true,
  kids: true,
  shoot: true,
  contacts: true,
  rsvp: true,
  term: true,
} as const;

export type SampleBlock = keyof typeof sampleBlocks;

export type MiddleDraft = {
  partner1: string;
  partner2: string;
  date: string;
  time: string;
  city: string;
  venueType: string;
  venue: string;
  address: string;
  howToGet: string;
  placePhoto: string;
  placePhotoPick: "" | "aisle" | "arch" | "sea" | "own";
  placeX: number;
  placeY: number;
  placeScale: number;
  intro: string;
  dressTitle: string;
  dressText: string;
  dressColors: { hex: string }[];
  gifts: string;
  flowers: string;
  kids: string;
  shoot: string;
  program: ProgramRow[];
  phone: string;
  telegram: string;
  messengers: { telegram: boolean; viber: boolean; whatsapp: boolean };
  rsvpDeadline: string;
  replyVia: "mail" | "telegram" | "viber" | "whatsapp";
  replyTo: string;
  photo: string;
  photoX: number;
  photoY: number;
  photoScale: number;
  photoEdge: number;
  photoTone: number;
  photoPick: string;
  shown: Record<SampleBlock, boolean>;
};

export type Preset = {
  id: string;
  file: string;
  name: string;
  sample: string;
  config: Record<string, unknown>;
};

const edition = {
  template: "edition",
  siteId: "veronika-artem",
  couple: { partner1: "Вероника", partner2: "Артём", monogram: "В·А" },
  date: { start: "2027-08-21T16:00:00+03:00", end: "2027-08-21T23:30:00+03:00", timezone: "Europe/Minsk" },
  location: {
    city: "Минск",
    venueType: "Особняк",
    venue: "Особняк «Графит»",
    address: "ул. Липовая Аллея, 7, Минск",
    coords: [53.9045, 27.5615],
    mapUrl: "",
    howToGet: "Парковка во дворе особняка. От станции метро «Площадь Победы» 10 минут пешком.",
  },
  photo: { hero: "", caption: "Фото пары · 4:5" },
  texts: {
    masthead: "Вяселле",
    issue: "Выпуск № 1",
    intro: [
      "Мы долго выбирали слова, а потом поняли, что всё очень просто: мы женимся и очень хотим, чтобы в этот день рядом были именно вы.",
      "Будет красивый вечер в старом особняке, хорошая музыка, ужин и много поводов поднять бокал. Остальное — ваши улыбки.",
    ],
    signature: "Вероника и Артём",
    belarusian: "Будзем вельмі рады бачыць вас на нашым вяселлі!",
    closing: "Тираж — все, кого мы любим.",
  },
  program: [
    { time: "15:30", title: "Сбор гостей", text: "Игристое и лёгкие закуски в саду особняка" },
    { time: "16:00", title: "Церемония", text: "Выездная регистрация в зимнем саду" },
    { time: "17:00", title: "Фото и фуршет", text: "Общее фото на парадной лестнице" },
    { time: "18:00", title: "Ужин", text: "Банкет в Белом зале, тосты и первый танец" },
    { time: "23:00", title: "Финал вечера", text: "Торт, бенгальские огни и такси до дома" },
  ],
  gifts: {
    text: "Самый ценный подарок — ваше присутствие. Если хотите порадовать нас ещё, мы будем благодарны за вклад в наше первое большое путешествие.",
    flowers: "Пожалуйста, не дарите цветы: на следующий день мы улетаем. Лучше бутылка вина, которую мы откроем на годовщину.",
  },
  dressCode: {
    title: "Вечерний дресс-код",
    text: "Вечерние наряды в монохроме. Будем рады классическим костюмам, платьям в пол и миди. Пожалуйста, без белого и ярких принтов.",
    colors: [
      { name: "Чёрный", hex: "#151413" },
      { name: "Графит", hex: "#4a4845" },
      { name: "Мокко", hex: "#7b6450" },
      { name: "Шампань", hex: "#d8c7a6" },
      { name: "Слоновая кость", hex: "#efe8da" },
    ],
  },
  contacts: [
    { name: "Вероника", role: "Невеста", phone: "+375 29 000-00-01", telegram: "" },
    { name: "Ольга", role: "Координатор свадьбы", phone: "+375 44 000-00-02", telegram: "" },
  ],
  rsvp: { endpoint: "", deadline: "2027-07-20", maxGuests: 4, drinks: ["Игристое", "Красное вино", "Белое вино", "Крепкое", "Без алкоголя"] },
  theme: { paper: "#f3efe7", ink: "#121110", accent: "#8c6f4a" },
};

const vasilek = {
  template: "vasilek",
  siteId: "alina-maksim",
  couple: { partner1: "Алина", partner2: "Максим", monogram: "А&М" },
  date: { start: "2027-07-10T15:00:00+03:00", end: "2027-07-11T00:00:00+03:00", timezone: "Europe/Minsk" },
  location: {
    city: "Мядельский р-н",
    venueType: "Агроусадьба",
    venue: "Агроусадьба «Медуница»",
    address: "д. Верасы, ул. Луговая, 3, Мядельский р-н, Минская обл.",
    coords: [54.8722, 26.7653],
    mapUrl: "",
    howToGet: "Для гостей из Минска — автобус от ст. м. «Уручье» в 12:30 и обратно в 00:30. Свою машину можно оставить на парковке усадьбы.",
  },
  photo: { hero: "", caption: "Здесь будет ваше фото" },
  texts: {
    pre: "Приглашаем на нашу свадьбу",
    intro: [
      "Летом, когда цветут васильки, мы скажем друг другу «да». Хотим, чтобы этот день был тёплым, простым и настоящим, как прогулка по лугу босиком.",
      "Будем рады разделить его с самыми близкими. Приезжайте к озеру: будут венки, живая музыка, ужин под шатром и костёр до звёзд.",
    ],
    signature: "Алина и Максим",
    belarusian: "Сардэчна запрашаем на наша вяселле",
    closing: "До встречи на лугу!",
  },
  program: [
    { time: "14:30", title: "Сбор гостей", text: "Лимонад, ягоды и знакомство у озера" },
    { time: "15:00", title: "Выездная регистрация", text: "Церемония на деревянном помосте у воды" },
    { time: "16:00", title: "Фото на лугу", text: "Плетём венки и делаем общий кадр" },
    { time: "17:00", title: "Ужин под шатром", text: "Тосты, первый танец и живая музыка" },
    { time: "21:30", title: "Купальский костёр", text: "Пускаем венки по воде и загадываем желания" },
    { time: "23:30", title: "Торт и фейерверк", text: "Сладкий финал вечера" },
  ],
  gifts: {
    text: "Мы не хотим обременять вас поиском подарка. Если захотите, конверт станет вкладом в наш маленький дом с садом.",
    flowers: "Вместо букетов принесите, пожалуйста, бутылку хорошего вина или книгу с подписью — мы соберём свою «библиотеку пожеланий».",
  },
  dressCode: {
    title: "Летний луг",
    text: "Лёгкие ткани и природные оттенки. Удобная обувь: церемония на траве. Вечером у озера прохладно — возьмите накидку.",
    colors: [
      { name: "Василёк", hex: "#4467b8" },
      { name: "Небо", hex: "#9fb4e3" },
      { name: "Ромашка", hex: "#f4efe2" },
      { name: "Пшеница", hex: "#d6b56f" },
      { name: "Шалфей", hex: "#9bb08a" },
    ],
  },
  contacts: [
    { name: "Алина", role: "Невеста", phone: "+375 29 000-00-11", telegram: "" },
    { name: "Максим", role: "Жених", phone: "+375 33 000-00-12", telegram: "" },
  ],
  rsvp: { endpoint: "", deadline: "2027-06-10", maxGuests: 5, drinks: ["Вино", "Игристое", "Крепкое", "Сидр", "Без алкоголя"] },
  theme: { paper: "#f8f3ea", ink: "#25314f", blue: "#4467b8", sky: "#9fb4e3", gold: "#c9a25a" },
};

const kadry = {
  template: "kadry",
  siteId: "darya-nikita",
  couple: { partner1: "Даша", partner2: "Никита", monogram: "Д+Н" },
  date: { start: "2027-09-18T16:00:00+03:00", end: "2027-09-19T00:30:00+03:00", timezone: "Europe/Minsk" },
  location: {
    city: "Гомель",
    venueType: "Лофт",
    venue: "Лофт «Фабрика 1927»",
    address: "ул. Речная, 14, Гомель",
    coords: [52.4345, 30.9754],
    mapUrl: "",
    howToGet: "Вход со стороны набережной, парковка у ворот. Регистрация в 13:30 — только для семьи.",
  },
  photo: { hero: "", caption: "ваше фото" },
  texts: {
    sticker: "МЫ ЖЕНИМСЯ • МЫ ЖЕНИМСЯ • ",
    intro: [
      "Мы решили: хватит просто встречаться — пора устроить самую большую вечеринку в нашей жизни.",
      "Будет вкусный ужин, лучший диджей Гомеля и танцпол до утра. Без скучных конкурсов, обещаем. Не хватает только вас.",
    ],
    signature: "Даша и Никита",
    belarusian: "Чакаем вас! Будзе весела.",
    closing: "До встречи на танцполе!",
  },
  program: [
    { time: "13:30", title: "Регистрация", text: "Дворец бракосочетания — для самых близких" },
    { time: "16:00", title: "Сбор гостей", text: "Welcome-бар и фотозона в лофте" },
    { time: "17:00", title: "Ужин", text: "Длинный стол, тосты, первый танец" },
    { time: "20:00", title: "Вечеринка", text: "DJ-сет и танцпол до упаду" },
    { time: "23:30", title: "Торт", text: "И сюрприз для всех гостей" },
  ],
  gifts: {
    text: "Лучший подарок — конверт: мы копим на путешествие в Японию. Обещаем прислать открытку из Киото!",
    flowers: "Цветы не нужны — они завянут, пока мы танцуем. Лучше приходите в хорошем настроении.",
  },
  dressCode: {
    title: "Яркий коктейль",
    text: "Смело! Коктейльные платья, яркие рубашки, костюмы любого цвета. Главное — удобная обувь для танцев.",
    colors: [
      { name: "Коралл", hex: "#e8553d" },
      { name: "Масло", hex: "#f2d27a" },
      { name: "Пудра", hex: "#f2c6bb" },
      { name: "Олива", hex: "#55623a" },
      { name: "Слива", hex: "#3a1f3d" },
    ],
  },
  contacts: [
    { name: "Даша", role: "Невеста", phone: "+375 29 000-00-21", telegram: "" },
    { name: "Никита", role: "Жених", phone: "+375 25 000-00-22", telegram: "" },
  ],
  rsvp: { endpoint: "", deadline: "2027-08-20", maxGuests: 4, drinks: ["Вино", "Коктейли", "Крепкое", "Пиво", "Без алкоголя"] },
  stories: { autoplaySec: 9 },
  theme: { coral: "#e8553d", ink: "#17131a", cream: "#f6efe6", butter: "#f2d27a", blush: "#f2c6bb", olive: "#55623a", plum: "#3a1f3d" },
};

const rushnik = {
  template: "rushnik",
  siteId: "alesya-andrey",
  couple: { partner1: "Алеся", partner2: "Андрей", monogram: "А·А" },
  date: { start: "2027-06-26T14:00:00+03:00", end: "2027-06-27T00:00:00+03:00", timezone: "Europe/Minsk" },
  location: {
    city: "Гродненский р-н",
    venueType: "Усадьба",
    venue: "Сядзіба «Ліпавы гай»",
    address: "аг. Каменка, ул. Садовая, 21, Гродненский р-н",
    coords: [53.6694, 23.8131],
    mapUrl: "",
    howToGet: "25 минут от центра Гродно. Для гостей будет трансфер от Дворца бракосочетания в 12:45 и обратно в 23:30.",
  },
  photo: { hero: "", caption: "Фото пары" },
  texts: {
    beTop: "Запрашаем на вяселле",
    intro: [
      "Наши бабушки вышивали рушники к свадьбе внуков задолго до того, как мы познакомились. Теперь пришло время развернуть их.",
      "Мы приглашаем вас на день, в котором будет всё, что мы любим: старый липовый сад, каравай, живые цимбалы, долгий стол и танцы до ночи.",
    ],
    signature: "Алеся и Андрей",
    belarusian: "Каханне — гэта калі разам і ў радасці, і ў працы.",
    closing: "Да сустрэчы! До встречи!",
  },
  program: [
    { time: "13:30", title: "Сбор гостей и каравай", text: "Встречаем хлебом-солью у ворот усадьбы" },
    { time: "14:00", title: "Выездная церемония", text: "В липовой аллее, под звуки цимбал" },
    { time: "15:00", title: "Фуршет и фотосессия", text: "Сад, качели, лимонад и игристое" },
    { time: "16:00", title: "Свадебный стол", text: "Блюда белорусской кухни от шефа усадьбы" },
    { time: "20:00", title: "Танцы", text: "Живая музыка и диджей" },
    { time: "22:30", title: "Торт и снятие фаты", text: "Старинный обряд — тихо и красиво" },
  ],
  gifts: {
    text: "Будем благодарны за подарки в конвертах — они помогут нам достроить дом под Гродно. Пусть у него будут ваши кирпичики.",
    flowers: "Пожалуйста, без живых цветов: вместо букета подарите нам семена или саженец — посадим ваш сад.",
  },
  dressCode: {
    title: "Лён и молоко",
    text: "Будем рады натуральным тканям и светлым тонам. Детали с вышивкой или красный акцент — особенно приветствуются.",
    colors: [
      { name: "Малако", hex: "#f6f1e7" },
      { name: "Лён", hex: "#d9ccb4" },
      { name: "Чырвоны", hex: "#a51d24" },
      { name: "Мох", hex: "#6f7351" },
      { name: "Чорны", hex: "#2b1d1a" },
    ],
  },
  contacts: [
    { name: "Алеся", role: "Невеста", phone: "+375 29 000-00-31", telegram: "" },
    { name: "Марына", role: "Сестра невесты, отвечает на вопросы", phone: "+375 44 000-00-32", telegram: "" },
  ],
  rsvp: { endpoint: "", deadline: "2027-05-26", maxGuests: 5, drinks: ["Вино", "Игристое", "Наливка", "Крепкое", "Без алкоголя"] },
  theme: { linen: "#f1eadc", white: "#fbf8f2", red: "#a51d24", deep: "#2b1d1a" },
};

const vyshyvka = {
  template: "vyshyvka",
  lang: "be",
  siteId: "alyaksandr-maryya",
  couple: { partner1: "Аляксандр", partner2: "Марыя", monogram: "А·М" },
  date: { start: "2027-08-15T15:00:00+03:00", end: "2027-08-15T23:30:00+03:00", timezone: "Europe/Minsk" },
  location: {
    city: "г. Мінск",
    venueType: "Сядзіба",
    venue: "Сядзіба «Ліпавы сад»",
    address: "вул. Садовая, 12, Мінск",
    coords: [53.9023, 27.5619],
    mapUrl: "",
    howToGet: "Бясплатная парковка каля сядзібы. Для гасцей будзе трансфер ад станцыі метро «Плошча Перамогі» а 14:00 і назад а 23:30.",
  },
  photo: { hero: "", caption: "Фота пары", placeholder: true },
  texts: {
    heroTitle: ["Запрашэнне", "на вяселле"],
    lead: "Дарагія нашы родныя і сябры!",
    beTop: "Запрашэнне на вяселле",
    intro: [
      "Мы вельмі хочам, каб у самы важны дзень нашага жыцця побач былі тыя, хто нам дарагі.",
      "Запрашаем вас падзяліць з намі радасць і стаць часткай нашага свята — з караваем, песнямі, танцамі і шчырымі словамі.",
    ],
    signature: "Аляксандр і Марыя",
    belarusian: "Дзе згода ў сям'і, там і шчасце.",
    quoteLabel: "Народная мудрасць",
    closing: "Да сустрэчы на нашым вяселлі!",
  },
  program: [
    { time: "14:30", title: "Збор гасцей", text: "Келіх ігрыстага і жывая музыка ў садзе" },
    { time: "15:00", title: "Выязная цырымонія", text: "Пад аркай з вышыванымі ручнікамі" },
    { time: "16:00", title: "Каравай і віншаванні", text: "Сустракаем маладых хлебам-соллю" },
    { time: "17:00", title: "Святочная вячэра", text: "Стравы беларускай кухні ад шэфа сядзібы" },
    { time: "20:00", title: "Танцы", text: "Жывы гурт і дыджэй" },
    { time: "22:30", title: "Торт і феерверк", text: "Салодкі фінал вечара" },
  ],
  gifts: {
    text: "Найлепшы падарунак для нас — ваша прысутнасць. Калі хочаце павіншаваць, будзем удзячныя за ўклад у наш першы сямейны бюджэт.",
    flowers: "Калі ласка, не дарыце кветак — адразу пасля свята мы ад'язджаем у падарожжа. Замест букета прынясіце бутэльку віна: адкрыем яе на першую гадавіну!",
  },
  details: [
    { title: "Дзеці", text: "Мы вельмі любім вашых малых, але гэты вечар будзе для дарослых. Калі ласка, паклапаціцеся пра няню загадзя." },
    { title: "Фота і відэа", text: "Падчас цырымоніі просім адкласці тэлефоны — усё здыме наш фатограф. Потым фатаграфуйце колькі заўгодна!" },
  ],
  dressCode: {
    title: "Лён, белы і чырвоны",
    text: "Будзем рады, калі ў вашым убранні з'явіцца вышыванка, чырвоны акцэнт або натуральныя тканіны. Белы колер, калі ласка, пакіньце нявесце.",
    colors: [
      { name: "Малочны", hex: "#f4efe8" },
      { name: "Лён", hex: "#d8cbb5" },
      { name: "Пудравы", hex: "#e6c3c1" },
      { name: "Чырвоны", hex: "#b3202a" },
      { name: "Вугальны", hex: "#2f2a2a" },
    ],
  },
  contacts: [
    { name: "Марыя", role: "Нявеста", phone: "+375 29 000-00-41", telegram: "" },
    { name: "Вольга", role: "Арганізатар вяселля — адкажа на ўсе пытанні", phone: "+375 44 000-00-42", telegram: "" },
  ],
  rsvp: { endpoint: "", deadline: "2027-07-15", maxGuests: 4, drinks: ["Віно", "Ігрыстае", "Наліўка", "Моцнае", "Без алкаголю"] },
  theme: { linen: "#f4efea", paper: "#fbf8f4", red: "#b3202a", ink: "#2a2626" },
};

const zoloto = {
  template: "zoloto",
  lang: "ru",
  siteId: "aleksandr-mariya",
  couple: { partner1: "Александр", partner2: "Мария", monogram: "А·М" },
  date: { start: "2027-08-15T16:00:00+03:00", end: "2027-08-15T23:30:00+03:00", timezone: "Europe/Minsk" },
  location: {
    city: "г. Минск",
    venueType: "Церемония",
    venue: "Дворец бракосочетаний",
    address: "",
    mapUrl: "https://yandex.by/maps/?text=%D0%94%D0%B2%D0%BE%D1%80%D0%B5%D1%86%20%D0%B1%D1%80%D0%B0%D0%BA%D0%BE%D1%81%D0%BE%D1%87%D0%B5%D1%82%D0%B0%D0%BD%D0%B8%D0%B9%2C%20%D0%9C%D0%B8%D0%BD%D1%81%D0%BA",
    howToGet: "После церемонии гостей ждёт трансфер до ресторана. Отправление от Дворца бракосочетаний в 17:00, обратно — в 23:30.",
  },
  photo: { hero: "", caption: "Фото пары", placeholder: true },
  texts: {
    heroTitle: ["Приглашение", "на свадьбу"],
    storyTitle: "О нас",
    storySub: "Наша история любви",
    intro: [
      "Мы познакомились пять лет назад — случайно, в дождливый вечер, под одним зонтом. С тех пор каждый наш день стал немного теплее.",
      "Теперь мы хотим, чтобы в самый важный день нашей жизни рядом были самые дорогие люди. Приходите разделить с нами радость!",
    ],
    signature: "Александр и Мария",
    belarusian: "Любовь не смотрит глазами, а смотрит сердцем.",
    quoteLabel: "Уильям Шекспир",
    closing: "До встречи на нашей свадьбе!",
  },
  program: [
    { time: "16:00", title: "Церемония", text: "Дворец бракосочетаний" },
    { time: "18:00", title: "Банкет", text: "Ужин, тосты и первый танец" },
    { time: "21:00", title: "Вечеринка", text: "Танцы до полуночи" },
  ],
  gifts: {
    text: "Лучший подарок для нас — ваше присутствие. Если хотите нас порадовать, будем благодарны за вклад в наш первый семейный бюджет.",
    flowers: "Пожалуйста, не дарите цветы — сразу после свадьбы мы уезжаем в путешествие. Вместо букета принесите бутылку вина: откроем её на первую годовщину!",
  },
  details: [
    { title: "Дети", icon: "child", text: "Мы очень любим ваших малышей, но этот вечер будет для взрослых. Пожалуйста, позаботьтесь о няне заранее." },
    { title: "Фото и видео", icon: "camera", text: "Во время церемонии просим отложить телефоны — всё снимет наш фотограф. Потом фотографируйте сколько угодно!" },
  ],
  dressCode: {
    title: "Чёрный и золото",
    text: "Будем рады вечерним нарядам в чёрных, золотых и тёплых бежевых тонах. Белый цвет, пожалуйста, оставьте невесте.",
    colors: [
      { name: "Чёрный", hex: "#141210" },
      { name: "Шампань", hex: "#e8d6b0" },
      { name: "Золото", hex: "#c9a052" },
      { name: "Шоколад", hex: "#4a3526" },
      { name: "Слоновая кость", hex: "#f3ecdd" },
    ],
  },
  contacts: [
    { name: "Мария", role: "Невеста", phone: "+375 29 000-00-51", telegram: "" },
    { name: "Ольга", role: "Организатор свадьбы — ответит на все вопросы", phone: "+375 44 000-00-52", telegram: "" },
  ],
  rsvp: {
    endpoint: "",
    deadline: "2027-07-15",
    maxGuests: 4,
    drinks: ["Вино", "Игристое", "Крепкое", "Коктейли", "Без алкоголя"],
    buttonLabel: "Подтвердить присутствие",
  },
  theme: { bg: "#0e0d0c", gold: "#d8b46e", ivory: "#ece2cf" },
};

const lux = {
  template: "lux",
  lang: "ru",
  siteId: "aleksandr-mariya-lux",
  couple: { partner1: "Александр", partner2: "Мария", monogram: "А·М" },
  date: { start: "2027-08-15T16:00:00+03:00", end: "2027-08-15T23:30:00+03:00", timezone: "Europe/Minsk" },
  location: {
    city: "г. Минск",
    venueType: "Торжественная церемония",
    venue: "Дворец бракосочетаний",
    address: "",
    mapUrl: "https://yandex.by/maps/?text=%D0%94%D0%B2%D0%BE%D1%80%D0%B5%D1%86%20%D0%B1%D1%80%D0%B0%D0%BA%D0%BE%D1%81%D0%BE%D1%87%D0%B5%D1%82%D0%B0%D0%BD%D0%B8%D0%B9%2C%20%D0%9C%D0%B8%D0%BD%D1%81%D0%BA",
    howToGet: "Для гостей предусмотрен трансфер от Дворца бракосочетаний к месту праздничного ужина в 17:15 и обратно по окончании вечера.",
  },
  photo: { hero: "", bw: true, caption: "Фотография пары", placeholder: true },
  texts: {
    lead: ["Имеем честь пригласить Вас", "на торжество нашего бракосочетания"],
    intro: [
      "Дорогие родные и друзья! С радостью сообщаем Вам о нашем решении соединить свои судьбы.",
      "Будем счастливы, если в этот торжественный день Вы будете рядом с нами. Ваше присутствие станет для нас лучшим подарком.",
    ],
    signature: "Александр и Мария",
    closing: "С искренним уважением и надеждой на встречу,",
  },
  program: [
    { time: "15:30", title: "Сбор гостей", text: "Приветственный бокал шампанского" },
    { time: "16:00", title: "Церемония", text: "Дворец бракосочетаний" },
    { time: "18:00", title: "Праздничный ужин", text: "Ресторан, торжественные тосты" },
    { time: "21:00", title: "Первый танец", text: "Вечерняя программа и бал" },
    { time: "23:30", title: "Завершение вечера", text: "Трансфер для гостей" },
  ],
  gifts: {
    text: "Ваше присутствие — лучший подарок для нас. Если Вы пожелаете сделать подарок, мы будем признательны за вклад в наше свадебное путешествие.",
    flowers: "Просим Вас воздержаться от цветов: сразу после торжества мы отправляемся в путешествие.",
  },
  details: [
    { title: "Дети", text: "Торжество предполагает присутствие только взрослых гостей. Благодарим Вас за понимание." },
    { title: "Фотосъёмка", text: "Во время церемонии просим воздержаться от съёмки — эту работу выполнит наш фотограф." },
  ],
  dressCode: {
    title: "Смокинг",
    text: "Для джентльменов — смокинг, для дам — вечернее платье в пол. Будем признательны за сдержанную палитру.",
    colors: [
      { name: "Чёрный", hex: "#0a0a0a" },
      { name: "Графит", hex: "#3a3a3c" },
      { name: "Шампань", hex: "#d9c8a6" },
      { name: "Слоновая кость", hex: "#efe8da" },
    ],
  },
  contacts: [
    { name: "Ольга Васильева", role: "Координатор торжества", phone: "+375 44 000-00-61", telegram: "" },
    { name: "Мария", role: "Невеста", phone: "+375 29 000-00-62", telegram: "" },
  ],
  rsvp: {
    endpoint: "",
    deadline: "2027-07-15",
    maxGuests: 2,
    drinks: ["Шампанское", "Белое вино", "Красное вино", "Крепкие напитки", "Без алкоголя"],
  },
  theme: { bg: "#0c0c0b", gold: "#b9a477", ivory: "#e8e2d6" },
};

const bordo = {
  template: "bordo",
  lang: "ru",
  siteId: "aleksandr-mariya-bordo",
  couple: { partner1: "Александр", partner2: "Мария", monogram: "А·М" },
  date: { start: "2027-08-15T16:00:00+03:00", end: "2027-08-15T23:30:00+03:00", timezone: "Europe/Minsk" },
  location: {
    city: "г. Минск",
    venueType: "Торжественная церемония",
    venue: "Дворец бракосочетаний",
    address: "",
    mapUrl: "https://yandex.by/maps/?text=%D0%94%D0%B2%D0%BE%D1%80%D0%B5%D1%86%20%D0%B1%D1%80%D0%B0%D0%BA%D0%BE%D1%81%D0%BE%D1%87%D0%B5%D1%82%D0%B0%D0%BD%D0%B8%D0%B9%2C%20%D0%9C%D0%B8%D0%BD%D1%81%D0%BA",
    howToGet: "Для гостей предусмотрен трансфер от Дворца бракосочетаний к месту праздничного ужина в 17:15 и обратно по окончании вечера.",
  },
  photo: { hero: "", bw: true, caption: "Фотография пары", placeholder: true },
  texts: {
    lead: ["Имеем честь пригласить Вас", "на торжество нашего бракосочетания"],
    intro: [
      "Дорогие родные и друзья! С радостью сообщаем Вам о нашем решении соединить свои судьбы.",
      "Будем счастливы, если в этот торжественный день Вы будете рядом с нами. Ваше присутствие станет для нас лучшим подарком.",
    ],
    signature: "Александр и Мария",
    closing: "С искренним уважением и надеждой на встречу,",
  },
  program: [
    { time: "15:30", title: "Сбор гостей", text: "Приветственный бокал шампанского" },
    { time: "16:00", title: "Церемония", text: "Дворец бракосочетаний" },
    { time: "18:00", title: "Праздничный ужин", text: "Ресторан, торжественные тосты" },
    { time: "21:00", title: "Первый танец", text: "Вечерняя программа и бал" },
    { time: "23:30", title: "Завершение вечера", text: "Трансфер для гостей" },
  ],
  gifts: {
    text: "Ваше присутствие — лучший подарок для нас. Если Вы пожелаете сделать подарок, мы будем признательны за вклад в наше свадебное путешествие.",
    flowers: "Просим Вас воздержаться от цветов: сразу после торжества мы отправляемся в путешествие.",
  },
  details: [
    { title: "Дети", text: "Торжество предполагает присутствие только взрослых гостей. Благодарим Вас за понимание." },
    { title: "Фотосъёмка", text: "Во время церемонии просим воздержаться от съёмки — эту работу выполнит наш фотограф." },
  ],
  dressCode: {
    title: "Смокинг",
    text: "Для джентльменов — смокинг, для дам — вечернее платье в пол. Будем признательны за сдержанную палитру.",
    colors: [
      { name: "Чёрный", hex: "#0a0a0a" },
      { name: "Бордо", hex: "#5a1220" },
      { name: "Серебро", hex: "#c3c6cd" },
      { name: "Жемчуг", hex: "#ece8e4" },
    ],
  },
  contacts: [
    { name: "Ольга Васильева", role: "Координатор торжества", phone: "+375 44 000-00-61", telegram: "" },
    { name: "Мария", role: "Невеста", phone: "+375 29 000-00-62", telegram: "" },
  ],
  rsvp: {
    endpoint: "",
    deadline: "2027-07-15",
    maxGuests: 2,
    drinks: ["Шампанское", "Белое вино", "Красное вино", "Крепкие напитки", "Без алкоголя"],
  },
  theme: { bg: "#2a0a10", silver: "#c3c6cd", ivory: "#eeeaec" },
};

const izumrud = {
  template: "izumrud",
  lang: "ru",
  siteId: "aleksandr-mariya-izumrud",
  couple: { partner1: "Александр", partner2: "Мария", monogram: "А·М" },
  date: { start: "2027-08-15T16:00:00+03:00", end: "2027-08-15T23:30:00+03:00", timezone: "Europe/Minsk" },
  location: {
    city: "г. Минск",
    venueType: "Торжественная церемония",
    venue: "Дворец бракосочетаний",
    address: "",
    mapUrl: "https://yandex.by/maps/?text=%D0%94%D0%B2%D0%BE%D1%80%D0%B5%D1%86%20%D0%B1%D1%80%D0%B0%D0%BA%D0%BE%D1%81%D0%BE%D1%87%D0%B5%D1%82%D0%B0%D0%BD%D0%B8%D0%B9%2C%20%D0%9C%D0%B8%D0%BD%D1%81%D0%BA",
    howToGet: "Для гостей предусмотрен трансфер от Дворца бракосочетаний к месту праздничного ужина в 17:15 и обратно по окончании вечера.",
  },
  photo: { hero: "", bw: true, caption: "Фотография пары", placeholder: true },
  texts: {
    lead: ["Имеем честь пригласить Вас", "на торжество нашего бракосочетания"],
    intro: [
      "Дорогие родные и друзья! С радостью сообщаем Вам о нашем решении соединить свои судьбы.",
      "Будем счастливы, если в этот торжественный день Вы будете рядом с нами. Ваше присутствие станет для нас лучшим подарком.",
    ],
    signature: "Александр и Мария",
    closing: "С искренним уважением и надеждой на встречу,",
  },
  program: [
    { time: "15:30", title: "Сбор гостей", text: "Приветственный бокал шампанского" },
    { time: "16:00", title: "Церемония", text: "Дворец бракосочетаний" },
    { time: "18:00", title: "Праздничный ужин", text: "Ресторан, торжественные тосты" },
    { time: "21:00", title: "Первый танец", text: "Вечерняя программа и бал" },
    { time: "23:30", title: "Завершение вечера", text: "Трансфер для гостей" },
  ],
  gifts: {
    text: "Ваше присутствие — лучший подарок для нас. Если Вы пожелаете сделать подарок, мы будем признательны за вклад в наше свадебное путешествие.",
    flowers: "Просим Вас воздержаться от цветов: сразу после торжества мы отправляемся в путешествие.",
  },
  details: [
    { title: "Дети", text: "Торжество предполагает присутствие только взрослых гостей. Благодарим Вас за понимание." },
    { title: "Фотосъёмка", text: "Во время церемонии просим воздержаться от съёмки — эту работу выполнит наш фотограф." },
  ],
  dressCode: {
    title: "Смокинг",
    text: "Для джентльменов — смокинг, для дам — вечернее платье в пол. Будем признательны за сдержанную палитру.",
    colors: [
      { name: "Чёрный", hex: "#0a0a0a" },
      { name: "Изумруд", hex: "#1d4a38" },
      { name: "Золото", hex: "#bfaa7b" },
      { name: "Слоновая кость", hex: "#efe8da" },
    ],
  },
  contacts: [
    { name: "Ольга Васильева", role: "Координатор торжества", phone: "+375 44 000-00-61", telegram: "" },
    { name: "Мария", role: "Невеста", phone: "+375 29 000-00-62", telegram: "" },
  ],
  rsvp: {
    endpoint: "",
    deadline: "2027-07-15",
    maxGuests: 2,
    drinks: ["Шампанское", "Белое вино", "Красное вино", "Крепкие напитки", "Без алкоголя"],
  },
  theme: { bg: "#10211a", gold: "#bfaa7b", ivory: "#ece7dc" },
  intro: { envelope: true, hint: "Нажмите, чтобы открыть" },
};

export const middleTemplates: Preset[] = [
  { id: "edition", file: "/templates/edition.html", name: "Журнал", sample: "Вероника и Артём", config: edition },
  { id: "vasilek", file: "/templates/vasilek.html", name: "Луг", sample: "Алина и Максим", config: vasilek },
  { id: "kadry", file: "/templates/kadry.html", name: "Сторис", sample: "Даша и Никита", config: kadry },
  { id: "rushnik", file: "/templates/rushnik.html", name: "Рушник", sample: "Алеся и Андрей", config: rushnik },
  { id: "vyshyvka", file: "/templates/vyshyvka.html", name: "Вышыўка", sample: "Аляксандр і Марыя", config: vyshyvka },
  { id: "zoloto", file: "/templates/zoloto.html", name: "Золото", sample: "Александр и Мария", config: zoloto },
  { id: "lux", file: "/templates/lux.html", name: "Люкс", sample: "Александр и Мария", config: lux },
  { id: "bordo", file: "/templates/bordo.html", name: "Бордо", sample: "Александр и Мария", config: bordo },
  { id: "izumrud", file: "/templates/izumrud.html", name: "Изумруд", sample: "Александр и Мария", config: izumrud },
  ...catalogTemplates,
];

export function draftFromPreset(preset: Preset): MiddleDraft {
  const couple = preset.config.couple as { partner1: string; partner2: string };
  const date = preset.config.date as { start: string };
  const location = preset.config.location as { city: string; venueType: string; venue: string; address: string; howToGet: string };
  const texts = preset.config.texts as { intro: string[] };
  const dress = preset.config.dressCode as { title: string; text: string };
  const gifts = preset.config.gifts as { text: string; flowers: string };
  const details = (preset.config.details as { title?: string; text?: string }[] | undefined) ?? [];
  const contacts = preset.config.contacts as { phone: string; telegram?: string }[];
  const rsvp = preset.config.rsvp as { deadline?: string };
  return {
    partner1: couple.partner1,
    partner2: couple.partner2,
    date: date.start.slice(0, 10),
    time: date.start.slice(11, 16),
    city: location.city,
    venueType: location.venueType,
    venue: location.venue,
    address: location.address,
    howToGet: location.howToGet,
    placePhoto: "",
    placePhotoPick: "",
    placeX: 50,
    placeY: 50,
    placeScale: 100,
    intro: texts.intro.join("\n\n"),
    dressTitle: dress.title,
    dressText: dress.text,
    dressColors: Array.from({ length: 6 }, () => ({ hex: "" })),
    gifts: gifts.text,
    flowers: gifts.flowers,
    kids: details.find((item) => item.title === "Дети")?.text ?? "",
    shoot: details.find((item) => item.title === "Фотосъёмка")?.text ?? "",
    program: (preset.config.program as ProgramRow[]).map((row) => ({ ...row })),
    phone: contacts[0]?.phone ?? "",
    telegram: contacts[0]?.telegram ?? "",
    messengers: { telegram: true, viber: true, whatsapp: true },
    rsvpDeadline: rsvp?.deadline ?? "",
    replyVia: "mail",
    replyTo: "",
    photo: "",
    photoX: 50,
    photoY: 40,
    photoScale: 100,
    photoEdge: 0,
    photoTone: 0,
    photoPick: "",
    shown: { ...sampleBlocks },
  };
}

export function isDemoCoupleData(draft: Pick<MiddleDraft, "partner1" | "partner2" | "date">, preset: Preset) {
  const couple = preset.config.couple as { partner1?: string; partner2?: string } | undefined;
  const start = (preset.config.date as { start?: string } | undefined)?.start ?? "";
  const partner1 = draft.partner1.trim();
  const partner2 = draft.partner2.trim();
  const date = draft.date.trim();
  if (!partner1 || !partner2 || !date) return true;
  const namesDemo = partner1 === (couple?.partner1 ?? "") && partner2 === (couple?.partner2 ?? "");
  const dateDemo = date === start.slice(0, 10);
  return namesDemo || dateDemo;
}

export function configFromDraft(preset: Preset, draft: MiddleDraft) {
  const base = structuredClone(preset.config) as Record<string, unknown>;
  const couple = base.couple as { partner1: string; partner2: string; monogram: string };
  couple.partner1 = draft.partner1 || "Имя";
  couple.partner2 = draft.partner2 || "Имя";
  couple.monogram = `${(draft.partner1 || "И").slice(0, 1)}·${(draft.partner2 || "И").slice(0, 1)}`;
  const start = `${draft.date}T${draft.time || "15:00"}:00+03:00`;
  const date = base.date as { start: string; end: string };
  date.start = start;
  date.end = `${draft.date}T23:30:00+03:00`;
  const location = base.location as { city: string; venueType: string; venue: string; address: string; howToGet: string; coords?: number[] };
  const sameAddress = location.address === draft.address && location.city === draft.city;
  location.city = draft.city;
  location.venueType = draft.venueType;
  location.venue = draft.venue;
  location.address = draft.address;
  location.howToGet = draft.howToGet;
  (location as { photo?: string }).photo = draft.shown.placePhoto ? draft.placePhoto : "";
  if (!sameAddress) delete location.coords;
  const photo = base.photo as { hero: string };
  if (draft.photo) photo.hero = draft.photo;
  const texts = base.texts as { intro: string[]; signature: string };
  texts.intro = draft.intro.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  texts.signature = `${couple.partner1} и ${couple.partner2}`;
  base.program = draft.program.filter((row) => row.time || row.title || row.text);
  const dress = base.dressCode as { title: string; text: string; colors: { name: string; hex: string }[] };
  dress.title = draft.dressTitle;
  dress.text = draft.dressText;
  dress.colors = draft.shown.palette ? draft.dressColors.filter((item) => item.hex).map((item) => ({ name: "", hex: item.hex })) : [];
  const gifts = base.gifts as { text: string; flowers: string };
  gifts.text = draft.gifts;
  gifts.flowers = draft.flowers;
  const details = (base.details as { title?: string; text?: string }[] | undefined) ?? [];
  for (const item of details) {
    if (item.title === "Дети") item.text = draft.shown.kids ? draft.kids : "";
    if (item.title === "Фотосъёмка") item.text = draft.shown.shoot ? draft.shoot : "";
  }
  base.blocks = draft.shown;
  const contacts = base.contacts as { name: string; phone: string; telegram?: string; showTelegram?: boolean; showViber?: boolean; showWhatsapp?: boolean }[];
  for (const person of contacts) {
    person.showTelegram = draft.messengers.telegram;
    person.showViber = draft.messengers.viber;
    person.showWhatsapp = draft.messengers.whatsapp;
  }
  if (contacts[0]) {
    contacts[0].name = couple.partner1;
    contacts[0].phone = draft.phone;
    contacts[0].telegram = draft.telegram;
  }
  const rsvp = base.rsvp as { deadline?: string; replyTo?: string; replyVia?: string; endpoint?: string };
  if (rsvp) {
    rsvp.deadline = draft.rsvpDeadline;
    rsvp.replyVia = draft.replyVia;
    rsvp.replyTo = draft.replyTo;
    rsvp.endpoint = "";
  }
  base.siteId = "";
  return base;
}

export const publishedRsvpEndpoint = "https://aivision.by/api/rsvp.php";

export function withPublishedRsvp<T extends Record<string, unknown>>(config: T, siteId: string): T {
  const next = structuredClone(config) as T & { siteId: string; rsvp: Record<string, unknown> };
  next.siteId = siteId;
  const rsvp = (next.rsvp && typeof next.rsvp === "object" ? next.rsvp : {}) as Record<string, unknown>;
  rsvp.endpoint = publishedRsvpEndpoint;
  next.rsvp = rsvp;
  return next;
}
