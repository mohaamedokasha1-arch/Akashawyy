/* ===================================================== */
/* عكاشاوي (Akashawy) - المحرك الذكي AI-Powered Smart Logic */
/* النظام يقرأ ← يفهم ← يفكر ← يقرر ← يرد بنتيجة فريدة      */
/* ===================================================== */

/* ========== 0. أدوات عامة ========== */
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function wordCount(s) { return s.trim() ? s.trim().split(/\s+/).length : 0; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

const IS_LUCKY_DAY = new Date().getDay() === 5; // الجمعة = يوم محظوظ 🍀

/* ========== 1. نظام التاريخ (History System) ==========
   - حفظ آخر 5 عمليات لكل أداة في sessionStorage
   - يُمحى تلقائياً عند إغلاق المتصفح (خصوصية)
   - يمنع تكرار نفس النتيجة لنفس المستخدم */
function getHist(key) {
  try { return JSON.parse(sessionStorage.getItem('akashawy_hist_' + key)) || []; }
  catch (e) { return []; }
}
function pushHist(key, val) {
  try {
    const h = getHist(key);
    h.unshift(val);
    sessionStorage.setItem('akashawy_hist_' + key, JSON.stringify(h.slice(0, 5)));
  } catch (e) {}
}
function wasSeen(key, val) { return getHist(key).includes(val); }

// اختيار ذكي: يحاول اختيار عنصر غير مكرر من آخر 5 نتائج
function smartPick(arr, histKey) {
  for (let i = 0; i < 20; i++) {
    const item = rand(arr);
    if (!wasSeen(histKey, item)) { pushHist(histKey, item); return item; }
  }
  const item = rand(arr); pushHist(histKey, item); return item;
}

/* ========== 2. شاشة التفكير (AI Thinking Overlay) ========== */
let thinkTimer = null;
function aiThink(icon, title, steps, duration, done) {
  const o = document.getElementById('loadingOverlay');
  const i = document.getElementById('loadIcon');
  const stepsEl = document.getElementById('thinkSteps');
  i.textContent = icon;
  i.className = 'load-icon shake';
  document.getElementById('loadText').textContent = title;
  o.classList.add('show');
  let si = 0;
  stepsEl.textContent = steps[0];
  clearInterval(thinkTimer);
  thinkTimer = setInterval(() => {
    si = (si + 1) % steps.length;
    stepsEl.textContent = steps[si];
  }, Math.max(240, duration / steps.length));
  setTimeout(() => {
    clearInterval(thinkTimer);
    o.classList.remove('show');
    done();
  }, duration);
}

// عرض تحليل النظام (chips)
function renderAnalysis(elId, title, chips) {
  const el = document.getElementById(elId);
  el.innerHTML = '<span class="ai-title">🧠 ' + title + '</span>' +
    '<div class="ai-chips">' +
    chips.map(c => `<span class="ai-chip ${c.cls || ''}">${c.label}${c.val !== undefined ? ': <b>' + c.val + '</b>' : ''}</span>`).join('') +
    '</div>';
}

/* =====================================================
   3. الأداة الأولى: مولد الأعذار الرسمية - Smart AI Logic
   ===================================================== */

// المرحلة 1: قاعدة معرفة المواقف (خطورة + طارئة + سياق اجتماعي)
const SITUATION_META = [
  { name: 'تأخيري عن الشغل',            severity: 4, urgency: 6, cat: 'transport', ctx: 'المدير غالباً متضايق ومستني تبرير مقنع', persona: 'المدير' },
  { name: 'طردي من المحاضرة',           severity: 6, urgency: 5, cat: 'academic',  ctx: 'الدكتور محتاج يحس بالندم الحقيقي', persona: 'الدكتور' },
  { name: 'الخروجة اللي دمها تقيل',      severity: 2, urgency: 2, cat: 'social',    ctx: 'صاحبك هيزعل شوية بس بيعدّيها بضحكة', persona: 'صاحبك' },
  { name: 'تغيبي بدون إذن',             severity: 8, urgency: 9, cat: 'absence',   ctx: 'موقف رسمي وخطير، محتاج عذر محكم بلا ثغرات', persona: 'الإدارة' },
  { name: 'تأخر ردي على رسالتك',        severity: 3, urgency: 3, cat: 'social',    ctx: 'عتاب خفيف، محتاج لمسة ود', persona: 'اللي بعتلك' },
  { name: 'تأخيري في تسليم الشغل',      severity: 7, urgency: 8, cat: 'deadline',  ctx: 'المصداقية على المحك، العذر لازم يكون منطقي', persona: 'المسؤول' }
];

// المرحلة 2: أسباب مطابقة لنوع الموقف (مش عشوائية)
const REASONS_BY_CAT = {
  transport: [
    'السيارة حصل فيها عطل مفاجئ في نص الطريق ومفيش ميكانيكي فتح قبل العاشرة',
    'الطريق اتقفل بالكامل بسبب حادث، والميكروباص قرر ياخدنا في جولة سياحية إجبارية',
    'المترو وقف بينا في النفق عشرين دقيقة كاملة من غير أي تفسير',
    'الزحام النهارده كان تاريخي، حاجة تتحكي للأحفاد',
    'الأسانسير عطل وأنا جوّاه، وقعدت أستنى الإنقاذ زي أفلام الأكشن'
  ],
  academic: [
    'كنت صاحي طول الليل بذاكر لمادة تانية وجسمي خانني في اللحظة الحاسمة',
    'حصل ظرف عائلي مفاجئ خلاني مشتت ومش مركز بالمرة',
    'كنت بساعد زميل في أزمة حقيقية وضاع مني الوقت',
    'الصداع اللي جالي كان يكفي يوقف جيش كامل مش طالب واحد'
  ],
  social: [
    'الأسبوع ده كان ضغط فوق طاقة البشر، شغل ومشاوير ومسؤوليات ورا بعض',
    'الموبايل فصل شحن في أسوأ توقيت ممكن وأنا برا البيت',
    'نمت غصب عني من التعب، جسمي اتخذ القرار من غير ما يستشيرني',
    'حصلت ظروف بيتية طارئة استحوذت على اليوم كله'
  ],
  absence: [
    'حالة طبية طارئة استدعت تواجدي الفوري ولم يكن هناك وقت لإبلاغ أحد',
    'ظرف عائلي قهري خارج تماماً عن إرادتي تطلب سفري المفاجئ',
    'عطل شامل في وسائل الاتصال منعني من الإبلاغ رغم محاولاتي المتكررة',
    'أزمة سكنية مفاجئة (مواسير، كهرباء، جيران) قلبت اليوم رأساً على عقب'
  ],
  deadline: [
    'الملف النهائي حصل له تلف غير مفهوم قبل التسليم بساعات وقعدت أعيد بنائه',
    'الجهاز بتاعي قرر يعمل تحديث إجباري طويل في أسوأ لحظة في التاريخ',
    'ظهرت تعديلات مفاجئة في اللحظات الأخيرة استلزمت إعادة شغل كامل',
    'الكهرباء قطعت في منطقتنا ساعات طويلة والشحن خلص من كل الأجهزة'
  ]
};

// عناصر الأسلوب: مقدمات + تفاصيل مصداقية + خواتيم
const EXCUSE_STYLE = {
  dramatic: {
    intros: ['يا سيدي الفاضل...', 'والله يا فندم القصة أكبر مني...', 'بقلب يعتصره الألم أكتب لحضرتك...', 'اسمعني للآخر وبعدين احكم عليّ...'],
    details: [
      'وأنا كان قلبي بينقسم نصين، نص عايز يوصلك ونص واقف مشلول قدام الموقف',
      'والله كانت الدموع في عيني وأنا شايف الوقت بيمشي وأنا عاجز',
      'وقفت في نص الشارع بحس إن الدنيا كلها بتتآمر عليّ في يوم واحد',
      'وكل ثانية كانت بتعدي كنت بحس إنها ساعة كاملة من العذاب'
    ],
    closings: ['أعتذر بكل جوارحي وأتعهد بعدم التكرار إن شاء الله', 'وأرجو المسامحة من قلب حضرتك الكبير', 'سامحني المرة دي، وحقك عليّ لآخر العمر']
  },
  formal: {
    intros: ['السيد الفاضل المحترم،', 'تحية طيبة وبعد،', 'حضرة الأستاذ الموقر،', 'سيادة المدير المحترم،'],
    details: [
      'وقد بذلت كل ما في وسعي لتدارك الموقف دون جدوى',
      'وأحيط سيادتكم علماً بأنني حاولت التواصل فور حدوث الأمر',
      'مرفق طيه استعدادي الكامل لتعويض أي تأثير نتج عن ذلك',
      'وقد اتخذت الإجراءات اللازمة لضمان عدم تكرار مثل هذا الظرف'
    ],
    closings: ['وتفضلوا بقبول فائق الاحترام والتقدير', 'شاكراً لسيادتكم سعة الصدر وكريم التفهم', 'وأتعهد بالالتزام التام مستقبلاً']
  },
  light: {
    intros: ['يا معلم 😄...', 'باشا، هحكيلك حكاية...', 'يا زعيم، القصة سينما بجد...', 'اسمع بس وانت تحكم...'],
    details: [
      'قلت أكيد هتضحك لما تسمعها بدل ما تزعل 😅',
      'لو كنت مكاني كنت هتصور فيديو وتنزله ترند',
      'المهم إني وصلت في الآخر، والنية كانت صافية والله',
      'اعتبرها حلقة من مسلسل حياتي، والموسم الجاي أحسن'
    ],
    closings: ['وسامحني المرة دي وعليّ قهوة بكرة ☕', 'وخلاص اعتبرها غلطة الموسم، مش هتتكرر ✨', 'والوعد وعد رجالة: آخر مرة 😄']
  }
};

// جمل التعهد للمواقف الخطيرة (خطورة >= 7)
const SEVERITY_PLEDGES = [
  'وأنا مقدّر تماماً حجم الموقف وخطورته، ومش بحاول أهوّن منه',
  'وأعلم أن الثقة أهم من أي تبرير، ولذلك أضع نفسي تحت تصرفكم',
  'وأتحمل كامل المسؤولية عن أي تأثير حصل بسبب الموقف ده'
];

function generateExcuse(regen) {
  const sitIdx = +document.getElementById('excuseSituation').value;
  const style = document.querySelector('input[name="excuseStyle"]:checked').value;
  const meta = SITUATION_META[sitIdx];

  // ===== المرحلة 1+2: التحليل والتفكير =====
  const persuasion = clamp(60 + meta.severity * 3 + (style === 'formal' ? 8 : style === 'dramatic' ? 5 : 0) + Math.floor(Math.random() * 10), 55, 97);

  aiThink('🎭', 'عكاشاوي بيفكر في موقفك...', [
    '🔍 بحلل نوع الموقف: "' + meta.name + '"',
    '⚖️ بقيس الخطورة: ' + meta.severity + '/10',
    '🧠 بفهم السياق: ' + meta.ctx,
    '✍️ ببني عذر مقنع بدون تناقضات...',
    '🔄 بتأكد إني ما قلتلكش العذر ده قبل كده...'
  ], 950, () => {
    // ===== المرحلة 3: البناء الذكي (كل جزء مطابق للسياق) =====
    const S = EXCUSE_STYLE[style];
    const histKey = 'excuse_' + sitIdx + '_' + style;
    const intro = smartPick(S.intros, histKey + '_i');
    const reason = smartPick(REASONS_BY_CAT[meta.cat], histKey + '_r'); // سبب مطابق لنوع الموقف
    const detail = smartPick(S.details, histKey + '_d');               // تفصيلة مصداقية
    const closing = smartPick(S.closings, histKey + '_c');
    const pledge = meta.severity >= 7 ? '\n' + rand(SEVERITY_PLEDGES) + '،' : '';

    const excuse = `${intro}\nأعتذر بصدق عن ${meta.name}.\nالحقيقة أن ${reason}،\n${detail}.${pledge}\n${closing}.`;

    // ===== المرحلة 4: التحقق من الفرادة (عبر smartPick + سجل كامل) =====
    pushHist('excuse_full', excuse.slice(0, 60));

    renderAnalysis('excuseAnalysis', 'تحليل عكاشاوي قبل الرد:', [
      { label: '⚖️ خطورة الموقف', val: meta.severity + '/10', cls: meta.severity >= 7 ? 'hot' : 'cool' },
      { label: '🚨 درجة الطوارئ', val: meta.urgency + '/10' },
      { label: '👤 المستهدف', val: meta.persona },
      { label: '🎯 قوة الإقناع المتوقعة', val: persuasion + '%', cls: 'win' },
      { label: '🔄 مضمون عدم التكرار', val: '✓', cls: 'cool' }
    ]);

    const box = document.getElementById('excuseText');
    box.className = 'result-box style-' + style;
    document.getElementById('excuseResult').classList.add('show');
    typewriter(box, excuse, 16);
  });
}

/* =====================================================
   4. الأداة الثانية: مترجم لغة الشغل - Smart AI Translation
   ===================================================== */

const FORMAL_TO_CHAT = [
  ['برجاء التكرم بالإفادة في أسرع وقت', 'خلصوني خلص الله تكرمكم'],
  ['برجاء التكرم', 'لو تفضلت'],
  ['تفضل بإرسال التقرير', 'ابعتلي التقرير بقى'],
  ['أتطلع لسماع رأيك', 'قول لي رأيك صراحة'],
  ['قد يكون من الضروري', 'لازم نعمل كده'],
  ['في حالة عدم الالتزام', 'لو ما التزمتش هيحصل حاجة'],
  ['أرجو المسامحة', 'معك حق، أنا غلطت'],
  ['متطلبات العمل تستدعي', 'الشغلانة محتاجة'],
  ['آمل أن تلتزم بالمواعيد', 'لازم تيجي في الميعاد بقى'],
  ['جزاك الله خيراً', 'شكراً ياعم شكراً'],
  ['الإفادة في أسرع وقت', 'خلصوني خلص الله'],
  ['أود التأكيد على', 'عاوز أأكد على'],
  ['تحية طيبة وبعد', 'إزيك عامل إيه'],
  ['مع خالص التقدير والاحترام', 'سلام يا كبير'],
  ['يرجى العلم', 'خد بالك'],
  ['وفقاً لما تم الاتفاق عليه', 'زي ما اتفقنا'],
  ['نأمل سرعة الرد', 'رد علينا بقى الله يكرمك'],
  ['لا يسعني إلا أن أشكركم', 'تسلم إيدك والله'],
  ['سيتم اتخاذ الإجراءات اللازمة', 'هنتصرف يعني هنتصرف'],
  ['نعتذر عن أي إزعاج', 'معلش تعبناك معانا'],
  ['يحتاج اهتمام فوري', 'ما فيش وقت نضيعه'],
  ['هذه المرة', 'المرة دي (وآخر مرة)']
];

const CHAT_TO_FORMAL = FORMAL_TO_CHAT.map(([f, c]) => [c, f]).concat([
  ['خلصوني', 'برجاء سرعة الإنجاز والإفادة'],
  ['يا معلم', 'السيد الأستاذ المحترم'],
  ['ماشي', 'تم الاطلاع والموافقة على ما ورد'],
  ['طب وبعدين', 'نأمل توضيح الخطوات القادمة'],
  ['ده كتير أوي', 'نرى أن ذلك يتجاوز الحدود المتفق عليها'],
  ['هظبطها', 'سيتم التعامل مع الأمر على النحو الأمثل']
]);

// ===== محرك تحليل المشاعر والتوتر =====
const TENSION_WORDS = ['أسرع وقت', 'فوري', 'عاجل', 'ضروري', 'حالاً', 'هذه المرة', 'آخر مرة', 'لازم', 'اهتمام فوري', 'عدم الالتزام', 'إجراءات', 'إنذار', 'للأسف', 'غير مقبول', 'تقصير'];
const FRIENDLY_WORDS = ['جزاك', 'شكر', 'تقدير', 'خالص', 'تفضل', 'محبة', 'سعدت', 'ممتاز', 'رائع', 'تسلم', 'الله يكرمك'];

function analyzeTone(text) {
  let tension = 0, warmth = 0;
  TENSION_WORDS.forEach(w => { if (text.includes(w)) tension++; });
  FRIENDLY_WORDS.forEach(w => { if (text.includes(w)) warmth++; });
  tension += (text.match(/!/g) || []).length;
  if (tension >= 2 && tension > warmth) return { tone: 'angry', label: 'غضب مكبوت + استعجال 😤', level: 'عالي', cls: 'hot' };
  if (warmth > tension) return { tone: 'friendly', label: 'ود واسترخاء 😊', level: 'منخفض', cls: 'cool' };
  return { tone: 'neutral', label: 'محايد ومهني 😐', level: 'متوسط', cls: '' };
}

// إضافات تحافظ على نفس مشاعر النص الأصلي
const TONE_SUFFIX = {
  f2c: {
    angry: ['\n\n(الترجمة الحقيقية: الراجل معصب، اتصرف بسرعة ⚠️)', '\n\n(بين السطور: ده تحذير أخير متغلف بذوق 😅)', '\n\n(نصيحة عكاشاوي: رد دلوقتي حالاً، مش بعد الغدا)'],
    friendly: ['\n\n(اطمن، المزاج رايق والرسالة كلها ود ✨)', '\n\n(بين السطور: الراجل بيحبك، بس برضه خلص الشغل 😄)'],
    neutral: ['\n\n(رسالة عادية، لا تهديد ولا وعيد، اشتغل براحتك 👌)', '\n\n(بين السطور: روتين شغل عادي، متقلقش)']
  },
  c2f: {
    angry: ['\n\n(تم تلطيف الغضب وتحويله للغة دبلوماسية معتمدة 🎩)', '\n\n(الغضب اتلبس بدلة رسمية، بس لسه واضح للفاهمين 😄)'],
    friendly: ['\n\n(الود وصل بصيغة رسمية تليق بالمقام ✨)'],
    neutral: ['\n\n(صياغة رسمية معتمدة، جاهزة للإرسال الفوري 📨)', '\n\n(النص أصبح لائقاً لأعلى المستويات الإدارية 🏛️)']
  }
};

function updateTransDir() {
  const dir = document.querySelector('input[name="transDir"]:checked').value;
  const ta = document.getElementById('transInput');
  ta.placeholder = dir === 'f2c'
    ? 'أدخل النص هنا (اللغة الرسمية)... مثال: "برجاء التكرم بالإفادة في أسرع وقت"'
    : 'أدخل النص هنا (كلام الدردشة)... مثال: "خلصوني بقى الله يكرمكم"';
}

function updateTransCounter() {
  const n = wordCount(document.getElementById('transInput').value);
  const c = document.getElementById('transCounter');
  const h = document.getElementById('transHint');
  c.textContent = n + ' كلمة';
  if (n === 0) { h.textContent = ''; h.className = ''; }
  else if (n > 500) { h.textContent = '⚠️ كتير أوي! الحد الأقصى 500 كلمة'; h.className = 'bad'; }
  else { h.textContent = '✅ تمام'; h.className = 'ok'; }
}

const TRANS_FALLBACK_CHAT = [
  'يعني باختصار كده: {X} — بس من غير تكليف زيادة 😄',
  'اللي بيقولهولك بالبلدي: {X}. خلاص فهمت؟ يلا اشتغل 😅',
  'ترجمة عكاشاوي المعتمدة: {X} — وأي كلام رسمي زيادة ده ديكور',
  'الزبدة: {X}. الباقي مجاملات بروتوكولية'
];
const TRANS_FALLBACK_FORMAL = [
  'نتشرف بإحاطة سيادتكم علماً بأن: {X}، وتفضلوا بقبول فائق الاحترام.',
  'بالإشارة إلى الموضوع أعلاه، نفيدكم بأن: {X}، مع خالص التقدير.',
  'يطيب لنا أن نؤكد على أن: {X}، آملين كريم تفهمكم.',
  'وفقاً لمقتضيات العمل، نرجو العلم بأن: {X}، ولكم جزيل الشكر.'
];

function doTranslate() {
  const input = document.getElementById('transInput').value.trim();
  const n = wordCount(input);
  if (n === 0) { toast('✍️ اكتب النص الأول يا نجم!'); return; }
  if (n > 500) { toast('⚠️ النص أطول من 500 كلمة، اختصر شوية'); return; }

  const dir = document.querySelector('input[name="transDir"]:checked').value;

  // ===== المرحلة 1: الفهم العميق (تحليل المشاعر) =====
  const tone = analyzeTone(input);

  aiThink('🔄', 'عكاشاوي بيقرأ بين السطور...', [
    '📖 بقرأ الرسالة بتركيز...',
    '🌡️ بقيس مستوى التوتر: ' + tone.level,
    '🎭 المشاعر المكتشفة: ' + tone.label,
    '🔤 بفكك الجمل وأدور على المقابل الصح...',
    '✅ بتأكد إن الإحساس الأصلي وصل زي ما هو...'
  ], 950, () => {
    // ===== المرحلة 2+3: الترجمة السياقية =====
    const dict = dir === 'f2c' ? FORMAL_TO_CHAT : CHAT_TO_FORMAL;
    let result = input;
    let matchCount = 0;
    [...dict].sort((a, b) => b[0].length - a[0].length).forEach(([from, to]) => {
      if (result.includes(from)) { result = result.split(from).join(to); matchCount++; }
    });
    if (matchCount === 0) {
      const fb = dir === 'f2c' ? TRANS_FALLBACK_CHAT : TRANS_FALLBACK_FORMAL;
      result = smartPick(fb, 'trans_fb').replace('{X}', input);
    }
    // ===== المرحلة 4: الحفاظ على المشاعر (إضافة سياقية غير مكررة) =====
    result += smartPick(TONE_SUFFIX[dir][tone.tone], 'trans_sfx_' + dir + '_' + tone.tone);

    renderAnalysis('transAnalysis', 'تحليل عكاشاوي للرسالة:', [
      { label: '🌡️ مستوى التوتر', val: tone.level, cls: tone.cls },
      { label: '🎭 المشاعر', val: tone.label },
      { label: '🔤 عبارات تمت ترجمتها', val: matchCount || 'ترجمة كاملة بالمعنى' },
      { label: '🎯 دقة نقل الإحساس', val: (88 + Math.floor(Math.random() * 10)) + '%', cls: 'win' }
    ]);

    document.getElementById('transResult').classList.add('show');
    const box = document.getElementById('transText');
    box.className = 'result-box';
    typewriter(box, result, 14);
  });
}

function resetTranslator() {
  document.getElementById('transInput').value = '';
  document.getElementById('transResult').classList.remove('show');
  updateTransCounter();
  document.getElementById('transInput').focus();
}
function tryPhrase() {
  document.getElementById('transInput').value = 'جزاك الله خيراً';
  updateTransCounter();
  doTranslate();
}

/* =====================================================
   5. الأداة الثالثة: مُقيّم الهبد - Smart AI Analysis
   ===================================================== */

const HOBD_VERDICTS = [
  { min: 0, max: 30, text: 'محتوى نظيف (ومُمل) 😴', cls: 'green' },
  { min: 31, max: 60, text: 'هبد متوسط مع شوية محتوى 😐', cls: 'yellow' },
  { min: 61, max: 85, text: 'هبد مشهود له بالتفاني 😂', cls: 'orange' },
  { min: 86, max: 100, text: 'هبد نقي 💯 عظمة حقيقية', cls: 'red' }
];

const HOBD_OPENERS = [
  'الفقرة دي بتثبت أن الكمبيوتر اللي كتبها كان مصاب بالإحباط.',
  'وجدنا أثراً لمحاولة إنسانية ضعيفة... نقدّر المجهود على أي حال.',
  'ده مش هبد عادي... ده فن تجريدي متقدم يستحق معرضاً خاصاً.',
  'ويكيبيديا بعتت تسأل: هتقتبس كل حاجة ولا هتسيب لنا حاجة؟',
  'أسلوب الكتابة ده خارج من كتاب مدرسي سنة 1990 بالظبط.',
  'محاولة محترمة في النقل، لكن بدون فهم حقيقي للموضوع.',
  'النص ده كتبه حد كان بيفكر في الغدا مش في المشروع.'
];
const HOBD_ADVICE = [
  'نصيحة حقيقية: أضف مثال من حياتك ولو سطر واحد، هيفرق جداً.',
  'نصيحة حقيقية: قسّم الجمل الطويلة وهتلاقي النص بقى بني آدم.',
  'نصيحة حقيقية: اقرأ الفقرة بصوت عالي، لو زهقت في نصها فيه مشكلة.',
  'نصيحة حقيقية: غيّر أول جملة بحاجة من دماغك انت، دي أهم جملة.'
];

const HOBD_FILLER_WORDS = ['بينما', 'لاسيما', 'وبالتالي', 'ومن ثم', 'حيث', 'إذ', 'علاوة على ذلك', 'وجدير بالذكر', 'ومما لا شك فيه', 'في هذا الصدد', 'بشكل عام', 'من ناحية أخرى'];
const PERSONAL_MARKERS = ['أنا', 'رأيي', 'أعتقد', 'برأيي', 'من وجهة نظري', 'لاحظت', 'جربت', 'مثلاً في مصر', 'في بلدنا', 'شخصياً'];

function updateHobdCounter() {
  const n = wordCount(document.getElementById('hobdInput').value);
  const c = document.getElementById('hobdCounter');
  const h = document.getElementById('hobdHint');
  c.textContent = n + ' كلمة';
  if (n === 0) { h.textContent = ''; h.className = ''; }
  else if (n < 20) { h.textContent = '✍️ زوّد شوية كلام (20 كلمة على الأقل)'; h.className = 'warn'; }
  else if (n > 2000) { h.textContent = '⚠️ الحد الأقصى 2000 كلمة'; h.className = 'bad'; }
  else { h.textContent = '✅ جاهز للتحليل المخبري'; h.className = 'ok'; }
}

// ===== التحليل العميق: يقرأ ويفهم ويطلع أدلة حقيقية من النص =====
function deepAnalyzeHobd(text, level) {
  const words = text.trim().split(/\s+/);
  const n = words.length;
  const sentences = text.split(/[.!؟?؛\n]+/).filter(s => s.trim().length > 3);
  const avgLen = sentences.length ? Math.round(n / sentences.length) : n;

  // أكثر كلمة متكررة (دليل ضد الكاتب 😄)
  const freq = {};
  words.forEach(w => {
    const clean = w.replace(/[^\u0600-\u06FFa-zA-Z]/g, '');
    if (clean.length > 3) freq[clean] = (freq[clean] || 0) + 1;
  });
  let topWord = '', topCount = 0;
  Object.entries(freq).forEach(([w, c]) => { if (c > topCount) { topWord = w; topCount = c; } });

  const fillersFound = HOBD_FILLER_WORDS.filter(w => text.includes(w));
  const personalFound = PERSONAL_MARKERS.filter(w => text.includes(w));
  const noPunct = !/[.،؛!؟]/.test(text);

  // ===== الحكم الذكي =====
  let score = 30;
  if (avgLen > 40) score += 15; else if (avgLen >= 20) score += 5; else score -= 5;
  if (topCount >= 3) score += Math.min(20, topCount * 5);
  score += fillersFound.length * 5;
  if (noPunct) score += 10;
  if (/[0-9%#@*]/.test(text)) score += 5;
  score -= personalFound.length * 7; // لمسة إنسانية حقيقية = هبد أقل
  if (level === 'advanced') score += 8;
  if (level === 'lite') score -= 8;
  score += Math.floor(Math.random() * 11) - 5;
  score = clamp(Math.round(score), 5, 98);

  // ===== بناء التعليق الساخر الذكي (من أدلة النص نفسه) =====
  const evidence = [];
  if (topCount >= 3) evidence.push(`كلمة "${topWord}" اتكررت ${topCount} مرات — ده مش أسلوب كتابة، ده عذاب نفسي!`);
  if (fillersFound.length >= 2) evidence.push(`رصدنا ترسانة حشو أكاديمي كاملة: "${fillersFound.slice(0, 3).join('، ')}"... الله يكون في عون القارئ.`);
  if (noPunct) evidence.push('النص كله من غير علامة ترقيم واحدة — نفَس واحد من أول السطر لآخره، بطولة أولمبية.');
  if (avgLen > 40) evidence.push(`متوسط الجملة ${avgLen} كلمة — القارئ بينسى أول الجملة قبل ما يوصل لآخرها.`);
  if (personalFound.length > 0) evidence.push(`في المقابل: لقينا لمسة إنسانية حقيقية ("${personalFound[0]}") — نقطة احترام نادرة. 👏`);
  if (evidence.length === 0) evidence.push('النص متوازن بشكل مريب... يا إما شغل نضيف يا إما هبد محترف متخفي.');

  const comment = smartPick(HOBD_OPENERS, 'hobd_open') + '\n' + evidence.join('\n') + '\n' + rand(HOBD_ADVICE);

  return { score, avgLen, sentences: sentences.length, topWord, topCount, fillersFound, personalFound, noPunct, comment, n };
}

function evaluateHobd() {
  const text = document.getElementById('hobdInput').value.trim();
  const n = wordCount(text);
  if (n < 20) { toast('✍️ محتاجين 20 كلمة على الأقل عشان التحليل العلمي الدقيق 😄'); return; }
  if (n > 2000) { toast('⚠️ النص أطول من 2000 كلمة'); return; }

  const level = document.querySelector('input[name="hobdLevel"]:checked').value;

  aiThink('🧪', 'التحليل المخبري شغال...', [
    '📖 بقرأ النص بتمعن شديد...',
    '🔬 بدور على بصمات الـ copy-paste...',
    '🔁 بحسب الكلمات المتكررة...',
    '🕵️ بفتش عن أي لمسة إنسانية حقيقية...',
    '⚖️ بحسب النسبة النهائية بدقة علمية (مزيفة)...'
  ], 1300, () => {
    const r = deepAnalyzeHobd(text, level);
    const verdict = HOBD_VERDICTS.find(v => r.score >= v.min && r.score <= v.max);

    renderAnalysis('hobdAnalysis', 'أدلة التحليل المخبري:', [
      { label: '📏 عدد الجمل', val: r.sentences },
      { label: '📐 متوسط طول الجملة', val: r.avgLen + ' كلمة', cls: r.avgLen > 40 ? 'hot' : '' },
      { label: '🔁 أكثر كلمة تكراراً', val: r.topCount >= 3 ? `"${r.topWord}" (×${r.topCount})` : 'لا يوجد', cls: r.topCount >= 3 ? 'hot' : 'cool' },
      { label: '📦 كلمات الحشو', val: r.fillersFound.length, cls: r.fillersFound.length >= 2 ? 'hot' : '' },
      { label: '👤 لمسات إنسانية', val: r.personalFound.length, cls: r.personalFound.length ? 'win' : 'hot' }
    ]);

    document.getElementById('hobdResult').classList.add('show');

    const fill = document.getElementById('hobdFill');
    fill.className = 'meter-fill ' + verdict.cls;
    fill.style.width = '0%';
    setTimeout(() => { fill.style.width = r.score + '%'; }, 60);

    const pctEl = document.getElementById('hobdPct');
    let cur = 0;
    const step = Math.max(1, Math.round(r.score / 40));
    const timer = setInterval(() => {
      cur = Math.min(r.score, cur + step);
      pctEl.textContent = cur + '%';
      if (cur >= r.score) clearInterval(timer);
    }, 32);

    document.getElementById('hobdVerdict').textContent = '🎯 التقييم: "' + verdict.text + '"';
    setTimeout(() => typewriter(document.getElementById('hobdComment'), r.comment, 16), 700);
  });
}

function copyHobdResult() {
  const text = `🧪 نتيجة مُقيّم الهبد من عكاشاوي:\n📈 نسبة الهبد: ${document.getElementById('hobdPct').textContent}\n${document.getElementById('hobdVerdict').textContent}\n💬 ${document.getElementById('hobdComment').textContent}\n\n— Made by عكاشة 🎭`;
  copyToClipboard(text, '✅ تم النسخ! وريهم مستوى الهبد 😂');
}
function shareHobdResult() {
  const text = `🧪 قيّمت مشروعي على عكاشاوي وطلعت نسبة الهبد ${document.getElementById('hobdPct').textContent} 😂\n${document.getElementById('hobdVerdict').textContent}`;
  if (navigator.share) navigator.share({ text }).catch(() => {});
  else shareText(text, 'whatsapp');
}
function resetHobd() {
  document.getElementById('hobdInput').value = '';
  document.getElementById('hobdResult').classList.remove('show');
  updateHobdCounter();
  document.getElementById('hobdInput').focus();
}

/* =====================================================
   6. الأداة الرابعة: مذبحة القرارات - Smart AI Decision
   ===================================================== */

// قاموس التقييم المنطقي (مش 50-50 عشوائي!)
const POSITIVE_KEYWORDS = ['مبكر', 'بدري', 'قهوة', 'صحي', 'رياضة', 'أذاكر', 'مذاكرة', 'أنجز', 'شغل', 'أخلص', 'أوفر', 'ادخار', 'نجاح', 'مفيد', 'صح', 'التزام', 'أحضر', 'أنزل المحاضرة', 'أروح', 'أساعد', 'عيلتي', 'أهلي', 'نوم بدري', 'مية', 'فطار', 'خضار', 'مشي'];
const NEGATIVE_KEYWORDS = ['أتأخر', 'تأخير', 'أطنش', 'طنش', 'كسل', 'أزوغ', 'زوغان', 'أنام', 'مشكلة', 'خطر', 'ندم', 'غلط', 'مصاريف', 'أصرف', 'ديون', 'سهر', 'أجل', 'تأجيل', 'أهرب', 'وجع', 'صداع', 'زعل'];

function scoreOption(text) {
  let pos = 0, neg = 0;
  const found = { pos: [], neg: [] };
  POSITIVE_KEYWORDS.forEach(w => { if (text.includes(w)) { pos++; found.pos.push(w); } });
  NEGATIVE_KEYWORDS.forEach(w => { if (text.includes(w)) { neg++; found.neg.push(w); } });
  return { score: clamp(50 + pos * 10 - neg * 10 + Math.floor(Math.random() * 9) - 4, 10, 95), pos, neg, found };
}

const COIN_JUDGE_LOGIC_WIN = [
  'ياااه! قرار ذهبي — العقل والحظ اتفقوا 🏆',
  'العملة والمنطق في صف واحد، نادراً ما يحصل ده!',
  'قرار مدروس ومحظوظ في نفس الوقت، انت كسبان من كل الجهات',
  'الحظ وقف مع الخيار العاقل... معجزة عكاشاوية 😄'
];
const COIN_JUDGE_LUCK_WIN = [
  'الحظ عاند المنطق... والعملة كلمتها نهائية 😅',
  'العقل قال حاجة والعملة قالت حاجة تانية — واحنا مع العملة',
  'قرار جريء ضد كل التوقعات المنطقية، ربنا يستر 🎢',
  'المنطق اعترض، بس مين بيسمع كلام المنطق أصلاً؟'
];
const COIN_WISDOM_SMART = [
  'الحياة قصيرة، والكسل أطول! روح اختار الصحة والسعادة.',
  'القرار الصح مش دايماً الأسهل، بس النهارده طلعلك سهل وصح.',
  'لما العقل والحظ يتفقوا، اجري نفّذ قبل ما حد فيهم يغير رأيه.',
  'استثمر في نفسك، أرخص سهم وأعلى عائد في السوق.'
];
const COIN_WISDOM_RISKY = [
  'إن شاء الله تندم بخفة وليس بثقل 😄',
  'لو غلطت، دايماً في نسخة احتياطية (كذب بس اطمن).',
  'كل تجربة درس... والدرس ده شكله هيبقى غالي شوية.',
  'المغامرة ملح الحياة، بس متكترش ملح عشان الضغط.',
  'العملة قررت، وانت نفذ، ولو حصل حاجة قول العملة هي السبب.'
];

function validateCoin() {
  const o1 = document.getElementById('coinOpt1').value.trim();
  const o2 = document.getElementById('coinOpt2').value.trim();
  const btn = document.getElementById('coinBtn');
  const hint = document.getElementById('coinHint');
  if (!o1 || !o2) { btn.disabled = true; hint.textContent = o1 || o2 ? '✍️ اكتب الخيارين الاتنين' : ''; }
  else if (o1 === o2) { btn.disabled = true; hint.textContent = '🤨 الخيارين نفس الحاجة! غيّر واحد فيهم'; }
  else { btn.disabled = false; hint.textContent = ''; }
}

let coinFlipping = false;
function flipCoin() {
  if (coinFlipping) return;
  const o1 = document.getElementById('coinOpt1').value.trim();
  const o2 = document.getElementById('coinOpt2').value.trim();
  if (!o1 || !o2 || o1 === o2) { validateCoin(); return; }

  coinFlipping = true;

  // ===== المرحلة 1+2: فهم الخيارات والتحليل المنطقي =====
  const s1 = scoreOption(o1);
  const s2 = scoreOption(o2);
  // ===== المرحلة 3: الحساب الذكي — أفضلية منطقية + هامش حظ =====
  const probOpt1 = clamp(50 + (s1.score - s2.score) * 0.6, 22, 78);

  const resultArea = document.getElementById('coinResult');
  const outcome = document.getElementById('coinOutcome');
  const coin = document.getElementById('coin');
  const sparkles = document.getElementById('coinSparkles');

  resultArea.classList.add('show');
  outcome.style.display = 'none';
  sparkles.classList.remove('show');
  coin.classList.remove('landing', 'glow');
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 450);
  resultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });

  coin.classList.add('flipping');
  const faces = ['🎭', '⭐', '🎭', '⭐'];
  let fi = 0;
  const faceTimer = setInterval(() => { coin.textContent = faces[fi++ % faces.length]; }, 250);

  setTimeout(() => {
    clearInterval(faceTimer);
    coin.classList.remove('flipping');

    // القرار: مرجّح بالمنطق + هامش عشوائية للمتعة
    const pickFirst = Math.random() * 100 < probOpt1;
    const chosen = pickFirst ? o1 : o2;
    const chosenScore = pickFirst ? s1 : s2;
    const otherScore = pickFirst ? s2 : s1;
    const logicAgreed = chosenScore.score >= otherScore.score;

    coin.textContent = pickFirst ? '🎭' : '⭐';
    coin.classList.add('landing', 'glow');
    sparkles.classList.add('show');

    setTimeout(() => {
      // ===== المرحلة 4: الحكمة المطابقة لنوع القرار =====
      const judgment = smartPick(logicAgreed ? COIN_JUDGE_LOGIC_WIN : COIN_JUDGE_LUCK_WIN, 'coin_judge');
      const wisdom = smartPick(logicAgreed ? COIN_WISDOM_SMART : COIN_WISDOM_RISKY, 'coin_wisdom');

      renderAnalysis('coinAnalysis', 'تحليل عكاشاوي المنطقي قبل القلبة:', [
        { label: '🥇 درجة الخيار الأول', val: s1.score + '/100', cls: s1.score >= s2.score ? 'win' : '' },
        { label: '🥈 درجة الخيار الثاني', val: s2.score + '/100', cls: s2.score > s1.score ? 'win' : '' },
        { label: '🎲 احتمالية الخيار الأول', val: Math.round(probOpt1) + '%' },
        { label: logicAgreed ? '🤝 العقل والحظ' : '⚔️ العقل ضد الحظ', val: logicAgreed ? 'اتفقوا!' : 'اختلفوا!', cls: logicAgreed ? 'win' : 'hot' }
      ]);

      outcome.style.display = 'block';
      document.getElementById('coinJudgment').textContent = '🎯 الحكم: "' + judgment + '"';
      document.getElementById('coinChosen').textContent = '✅ الخيار المختار: "' + chosen + '"';
      typewriter(document.getElementById('coinWisdom'), wisdom, 22);
      coinFlipping = false;
    }, 950);
  }, 2200);
}

function copyCoinResult() {
  const text = `🪙 مذبحة القرارات - عكاشاوي:\n${document.getElementById('coinJudgment').textContent}\n${document.getElementById('coinChosen').textContent}\n💭 ${document.getElementById('coinWisdom').textContent}\n\n— Made by عكاشة 🎭`;
  copyToClipboard(text, '✅ تم نسخ القرار! نفّذ بقى من غير تفكير 😄');
}
function shareCoinResult() {
  const text = `🪙 العملة (الذكية) قررت عني على عكاشاوي:\n${document.getElementById('coinChosen').textContent} 😂`;
  if (navigator.share) navigator.share({ text }).catch(() => {});
  else shareText(text, 'whatsapp');
}

/* ========== 7. الملاحة والانتقالات ========== */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMenus();
  setTimeout(() => {
    const firstInput = page && page.querySelector('select, textarea, input[type="text"]');
    if (firstInput && window.innerWidth > 767) firstInput.focus();
  }, 350);
}
function toggleMobileMenu() { document.getElementById('mobileMenu').classList.toggle('open'); }
function navMobile(id) { showPage(id); }
function closeMenus() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('shareMenu').classList.remove('open');
}

/* ========== 8. الوضع الليلي/النهاري ========== */
function toggleTheme() {
  const html = document.documentElement;
  const isLight = html.getAttribute('data-theme') === 'light';
  html.setAttribute('data-theme', isLight ? 'dark' : 'light');
  document.getElementById('themeToggle').textContent = isLight ? '☀️' : '🌙';
  try { localStorage.setItem('akashawy_theme', isLight ? 'dark' : 'light'); } catch (e) {}
}
(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('akashawy_theme'); } catch (e) {}
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    document.getElementById('themeToggle').textContent = '🌙';
  }
})();

/* ========== 9. المشاركة والنسخ ========== */
function toggleShareMenu(e) {
  e.stopPropagation();
  document.getElementById('shareMenu').classList.toggle('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.share-wrap')) document.getElementById('shareMenu').classList.remove('open');
});

const SITE_MSG = '🎭 جرب منصة عكاشاوي - حل كل أزمتك اليومية بذكاء! أعذار مدروسة، مترجم بيفهم المشاعر، مقيّم هبد بيحلل بجد، وعملة بتفكر قبل ما تقع 😄';

function shareSite(platform) { shareText(SITE_MSG, platform); closeMenus(); }
function shareText(text, platform) {
  const url = location.href.split('#')[0];
  const full = encodeURIComponent(text + '\n' + url);
  const links = {
    whatsapp: 'https://wa.me/?text=' + full,
    twitter: 'https://twitter.com/intent/tweet?text=' + full,
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '&quote=' + encodeURIComponent(text)
  };
  window.open(links[platform], '_blank', 'noopener');
}
function copySiteLink() {
  copyToClipboard(location.href.split('#')[0], '🔗 تم نسخ رابط عكاشاوي!');
  closeMenus();
}

function copyToClipboard(text, msg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast(msg)).catch(() => fallbackCopy(text, msg));
  } else fallbackCopy(text, msg);
}
function fallbackCopy(text, msg) {
  const ta = document.createElement('textarea');
  ta.value = text; document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); toast(msg); } catch (e) { toast('❌ النسخ مش متاح في المتصفح ده'); }
  document.body.removeChild(ta);
}
function copyResult(elId, msg) {
  const text = document.getElementById(elId).textContent + '\n\n— Made by عكاشة 🎭';
  copyToClipboard(text, msg);
}
function shareResult(elId) {
  const text = document.getElementById(elId).textContent + '\n\n🎭 من منصة عكاشاوي';
  if (navigator.share) navigator.share({ text }).catch(() => {});
  else shareText(text, 'whatsapp');
}

/* ========== 10. Toast ========== */
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ========== 11. تأثير الكتابة التدريجية ========== */
function typewriter(el, text, speed = 22, done) {
  el.textContent = '';
  el.classList.add('typing');
  let i = 0;
  (function step() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(step, speed);
    } else {
      el.classList.remove('typing');
      if (done) done();
    }
  })();
}

/* ========== 12. معالجة الأخطاء العامة + التهيئة ========== */
window.addEventListener('error', () => {
  try { toast('😅 حصلت لخبطة صغيرة، جرب تاني وهتمشي إن شاء الله'); } catch (e) {}
});

(function init() {
  if (IS_LUCKY_DAY) {
    const b = document.getElementById('luckyBanner');
    if (b) b.style.display = 'block';
  }
  window.addEventListener('offline', () => toast('📡 النت فصل، بس متقلقش — عكاشاوي شغال أوفلاين!'));
})();
