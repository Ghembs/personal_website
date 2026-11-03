// The grammar of each HSK level, after the grammar syllabus (HSK 语法大纲) of
// the HSK syllabus 2025: its items, in its order and under its headings, with
// the forms it lists (`zh`). The explanations and the examples are ours, and
// the examples use only the words of that level (scripts/check-grammar.mjs).
// An item: t (title), sub (the syllabus's own heading), zh (its forms; `keys`,
// the words in them to link to their cards), p (explanation), ex: [[hanzi, pinyin, italiano, english]].

const SECTIONS = {
  morph: { zh: '语素', it: 'Prefissi e suffissi', en: 'Prefixes and suffixes' },
  words: { zh: '词类', it: 'Le classi di parole', en: 'Word classes' },
  phrases: { zh: '短语', it: 'I sintagmi', en: 'Phrases' },
  parts: { zh: '句子成分', it: 'Le parti della frase', en: 'Parts of the sentence' },
  types: { zh: '句子的类型', it: 'I tipi di frase', en: 'Kinds of sentence' },
  complex: { zh: '复句', it: 'Le frasi complesse', en: 'Complex sentences' },
  aspect: { zh: '动作的态', it: "L'aspetto dell'azione", en: 'Aspect' },
  special: { zh: '特殊表达法', it: 'Espressioni particolari', en: 'Special expressions' },
};

const GRAMMAR = {
  1: [
    // ---------- 语素 ----------
    {
      sec: 'morph', sub: '前缀', zh: '小—、第—', keys: ['小', '第'],
      t: { it: 'Due prefissi: 小 e 第', en: 'Two prefixes: 小 and 第' },
      p: {
        it: '<span class="hz">第</span> <i>dì</i> davanti a un numero ne fa un ordinale: <span class="hz">第一</span> «primo», <span class="hz">第三</span> «terzo». <span class="hz">小</span> <i>xiǎo</i> davanti a un cognome è il modo familiare di chiamare chi è più giovane di noi, o un collega: «il piccolo Wang».',
        en: '<span class="hz">第</span> <i>dì</i> before a number makes it an ordinal: <span class="hz">第一</span> “first”, <span class="hz">第三</span> “third”. <span class="hz">小</span> <i>xiǎo</i> before a surname is the familiar way to address someone younger, or a colleague: “little Wang”.',
      },
      ex: [
        ['这是我第一天上班。', 'Zhè shì wǒ dì yī tiān shàngbān.', 'È il mio primo giorno di lavoro.', 'It is my first day at work.'],
        ['小王是我的同学。', 'Xiǎo Wáng shì wǒ de tóngxué.', 'Xiao Wang è un mio compagno di classe.', 'Xiao Wang is a classmate of mine.'],
      ],
    },
    {
      sec: 'morph', sub: '后缀', zh: '—们、—边', keys: ['们', '边'],
      t: { it: 'Due suffissi: 们 e 边', en: 'Two suffixes: 们 and 边' },
      p: {
        it: '<span class="hz">们</span> <i>men</i> fa il plurale, ma solo dei pronomi e dei nomi di persona, e solo quando non c\'è già un numero: <span class="hz">我们</span> «noi», <span class="hz">老师们</span> «gli insegnanti». <span class="hz">边</span> <i>bian</i> (spesso atono) dopo una parola di posizione ne fa un luogo: <span class="hz">外边</span> «fuori», <span class="hz">前边</span> «davanti».',
        en: '<span class="hz">们</span> <i>men</i> makes a plural, but only of pronouns and nouns for people, and only when no number is there already: <span class="hz">我们</span> “we”, <span class="hz">老师们</span> “the teachers”. <span class="hz">边</span> <i>bian</i> (often unstressed) after a position word makes it a place: <span class="hz">外边</span> “outside”, <span class="hz">前边</span> “in front”.',
      },
      ex: [
        ['同学们好！', 'Tóngxuémen hǎo!', 'Buongiorno, ragazzi! (a una classe)', 'Hello, everyone! (to a class)'],
        ['他在外边。', 'Tā zài wàibian.', 'È fuori.', 'He is outside.'],
      ],
    },

    // ---------- 词类 ----------
    {
      sec: 'words', sub: '名词 · 方位名词', zh: '上、下、里、外、前、后', keys: ['上', '下', '里', '外', '前', '后'],
      t: { it: 'Le parole di posizione', en: 'Position words' },
      p: {
        it: 'Dove l\'italiano usa una preposizione prima del nome («sul tavolo», «in casa»), il cinese mette una parola di posizione <b>dopo</b> il nome: <span class="hz">桌子上</span> «tavolo-sopra», <span class="hz">家里</span> «casa-dentro». Spesso si aggiunge anche <span class="hz">在</span> davanti: <span class="hz">在桌子上</span>.',
        en: 'Where English puts a preposition before the noun (“on the table”, “in the house”), Chinese puts a position word <b>after</b> it: <span class="hz">桌子上</span> “table-on”, <span class="hz">家里</span> “home-in”. Often <span class="hz">在</span> comes in front as well: <span class="hz">在桌子上</span>.',
      },
      ex: [
        ['书在桌子上。', 'Shū zài zhuōzi shang.', 'Il libro è sul tavolo.', 'The book is on the table.'],
        ['医院后边有一个饭店。', 'Yīyuàn hòubian yǒu yí ge fàndiàn.', "Dietro l'ospedale c'è un ristorante.", 'There is a restaurant behind the hospital.'],
      ],
    },
    {
      sec: 'words', sub: '动词 · 能愿动词', zh: '会、能；想、要；可以', keys: ['会', '能', '想', '要', '可以'],
      t: { it: 'I verbi modali', en: 'Modal verbs' },
      p: {
        it: 'Stanno davanti al verbo, come «sapere», «potere», «volere». <span class="hz">会</span> <i>huì</i> è saper fare qualcosa che si è imparato (nuotare, una lingua); <span class="hz">能</span> <i>néng</i> è essere in grado, avere le condizioni; <span class="hz">可以</span> <i>kěyǐ</i> è avere il permesso. <span class="hz">想</span> <i>xiǎng</i> è avere voglia, <span class="hz">要</span> <i>yào</i> è volere con decisione (o dovere). La negazione si mette davanti al modale: <span class="hz">不会</span>, <span class="hz">不能</span>.',
        en: 'They come before the verb, like “can”, “may”, “want”. <span class="hz">会</span> <i>huì</i> is knowing how to do something learnt (swimming, a language); <span class="hz">能</span> <i>néng</i> is being able, having the means; <span class="hz">可以</span> <i>kěyǐ</i> is being allowed. <span class="hz">想</span> <i>xiǎng</i> is feeling like it, <span class="hz">要</span> <i>yào</i> is wanting firmly (or having to). The negation goes before the modal: <span class="hz">不会</span>, <span class="hz">不能</span>.',
      },
      ex: [
        ['我会说汉语。', 'Wǒ huì shuō Hànyǔ.', 'So parlare cinese.', 'I can speak Chinese.'],
        ['你可以坐这儿。', 'Nǐ kěyǐ zuò zhèr.', 'Puoi sederti qui.', 'You may sit here.'],
        ['我想喝茶。', 'Wǒ xiǎng hē chá.', 'Ho voglia di un tè.', 'I would like some tea.'],
      ],
    },
    {
      sec: 'words', sub: '动词 · 离合词', zh: '看病、睡觉、说话、上课、下课、上班、下班、生病', keys: ['看病', '睡觉', '说话', '上课', '下课', '上班', '下班', '生病'],
      t: { it: 'I verbi separabili', en: 'Separable verbs' },
      p: {
        it: 'Sono verbi fatti di un verbo e del suo oggetto: <span class="hz">睡觉</span> «dormire» è alla lettera «dormire-sonno», <span class="hz">说话</span> «parlare» è «dire-parole». Per questo non prendono un altro oggetto: la persona con cui si parla va prima, con <span class="hz">和</span>. E le due parti si possono separare, per esempio per metterci in mezzo <span class="hz">了</span> o una durata (lo si vedrà ai livelli successivi).',
        en: 'They are made of a verb and its object: <span class="hz">睡觉</span> “to sleep” is literally “sleep-sleep”, <span class="hz">说话</span> “to talk” is “say-words”. So they take no other object: who you talk to comes before, with <span class="hz">和</span>. And the two parts can come apart, to put <span class="hz">了</span> or a length of time between them (as the next levels show).',
      },
      ex: [
        ['我想和你说话。', 'Wǒ xiǎng hé nǐ shuōhuà.', 'Voglio parlare con te. (non *说话你)', 'I want to talk to you. (not *说话你)'],
        ['他生病了，今天不上班。', 'Tā shēngbìng le, jīntiān bú shàngbān.', 'Si è ammalato, oggi non va al lavoro.', 'He is ill, he is not going to work today.'],
      ],
    },
    {
      sec: 'words', sub: '代词 · 疑问代词', zh: '多、多少、几、哪、哪儿、哪里、哪些、什么、谁、怎么、怎么样', keys: ['多', '多少', '几', '哪', '哪儿', '哪里', '哪些', '什么', '谁', '怎么', '怎么样'],
      t: { it: 'Le parole interrogative', en: 'Question words' },
      p: {
        it: 'Restano dove starebbe la risposta, senza spostare nulla e senza <span class="hz">吗</span>. <span class="hz">几</span> <i>jǐ</i> chiede un numero piccolo (sotto il dieci, di solito) e vuole un classificatore; <span class="hz">多少</span> <i>duōshao</i> va bene per qualunque numero. <span class="hz">多</span> davanti a un aggettivo chiede «quanto»: <span class="hz">多大</span> «quanti anni», <span class="hz">多远</span> «quanto lontano». <span class="hz">怎么</span> chiede il modo («come si fa»), <span class="hz">怎么样</span> un giudizio («com\'è»).',
        en: 'They stay where the answer would be, moving nothing and without <span class="hz">吗</span>. <span class="hz">几</span> <i>jǐ</i> asks for a small number (usually under ten) and wants a measure word; <span class="hz">多少</span> <i>duōshao</i> suits any number. <span class="hz">多</span> before an adjective asks “how”: <span class="hz">多大</span> “how old”, <span class="hz">多远</span> “how far”. <span class="hz">怎么</span> asks the way (“how do you”), <span class="hz">怎么样</span> an opinion (“how is it”).',
      },
      ex: [
        ['你去哪儿？', 'Nǐ qù nǎr?', 'Dove vai?', 'Where are you going?'],
        ['你家有几口人？', 'Nǐ jiā yǒu jǐ kǒu rén?', 'Quanti siete in famiglia?', 'How many people are there in your family?'],
        ['这个多少钱？', 'Zhège duōshao qián?', 'Quanto costa questo?', 'How much is this?'],
      ],
    },
    {
      sec: 'words', sub: '代词 · 人称代词', zh: '我、你、您、他、她、我们、你们、他们、她们、它、它们、大家', keys: ['我', '你', '您', '他', '她', '它', '我们', '你们', '他们', '她们', '它们', '大家'],
      t: { it: 'I pronomi personali', en: 'Personal pronouns' },
      p: {
        it: 'Non cambiano forma: <span class="hz">我</span> è «io», «me» e «mi». <span class="hz">他</span>, <span class="hz">她</span> e <span class="hz">它</span> (lui, lei, esso) si pronunciano tutti <i>tā</i> e si distinguono solo per iscritto. <span class="hz">您</span> <i>nín</i> è il «lei» di cortesia, <span class="hz">大家</span> <i>dàjiā</i> è «tutti».',
        en: 'They never change form: <span class="hz">我</span> is “I” and “me”. <span class="hz">他</span>, <span class="hz">她</span> and <span class="hz">它</span> (he, she, it) all sound <i>tā</i> and differ only in writing. <span class="hz">您</span> <i>nín</i> is the polite “you”, <span class="hz">大家</span> <i>dàjiā</i> is “everybody”.',
      },
      ex: [
        ['您好！', 'Nín hǎo!', 'Buongiorno! (di cortesia)', 'Hello! (polite)'],
        ['他爱她，她也爱他。', 'Tā ài tā, tā yě ài tā.', 'Lui la ama, e lei ama lui.', 'He loves her, and she loves him.'],
      ],
    },
    {
      sec: 'words', sub: '代词 · 指示代词', zh: '这、那、这儿、那儿、这里、那里、这些、那些、有的、这个、那个、有些', keys: ['这', '那', '这儿', '那儿', '这里', '那里', '这些', '那些', '有的', '这个', '那个', '有些'],
      t: { it: 'I dimostrativi', en: 'Demonstratives' },
      p: {
        it: '<span class="hz">这</span> <i>zhè</i> «questo» e <span class="hz">那</span> <i>nà</i> «quello» vogliono un classificatore prima del nome: <span class="hz">这个人</span>, <span class="hz">那本书</span>. Per il luogo: <span class="hz">这儿</span>/<span class="hz">这里</span> «qui», <span class="hz">那儿</span>/<span class="hz">那里</span> «lì» (le forme con <span class="hz">儿</span> sono del nord). <span class="hz">这些</span>, <span class="hz">那些</span> sono i plurali; <span class="hz">有的</span> e <span class="hz">有些</span> vogliono dire «alcuni».',
        en: '<span class="hz">这</span> <i>zhè</i> “this” and <span class="hz">那</span> <i>nà</i> “that” want a measure word before the noun: <span class="hz">这个人</span>, <span class="hz">那本书</span>. For places: <span class="hz">这儿</span>/<span class="hz">这里</span> “here”, <span class="hz">那儿</span>/<span class="hz">那里</span> “there” (the forms with <span class="hz">儿</span> are northern). <span class="hz">这些</span>, <span class="hz">那些</span> are the plurals; <span class="hz">有的</span> and <span class="hz">有些</span> mean “some”.',
      },
      ex: [
        ['这本书是我的。', 'Zhè běn shū shì wǒ de.', 'Questo libro è mio.', 'This book is mine.'],
        ['有的人喜欢吃米饭，有的人喜欢吃面包。', 'Yǒude rén xǐhuan chī mǐfàn, yǒude rén xǐhuan chī miànbāo.', 'Ad alcuni piace il riso, ad altri il pane.', 'Some people like rice, some like bread.'],
      ],
    },
    {
      sec: 'words', sub: '数词', zh: '一、二/两、三、四、五、六、七、八、九、零、十、百、半、千', keys: ['二', '两', '零', '百', '千', '半'],
      t: { it: 'I numeri', en: 'Numbers' },
      p: {
        it: 'I numeri si compongono come si leggono: <span class="hz">十二</span> «dieci-due» = 12, <span class="hz">二十</span> «due-dieci» = 20, <span class="hz">一百零五</span> = 105 (lo zero intermedio si dice). Il due ha due forme: <span class="hz">二</span> <i>èr</i> per contare e dentro i numeri, <span class="hz">两</span> <i>liǎng</i> davanti a un classificatore. <span class="hz">半</span> <i>bàn</i> «mezzo» va prima del classificatore da solo (<span class="hz">半个</span>), dopo se c\'è un intero (<span class="hz">一个半</span>, «uno e mezzo»).',
        en: 'Numbers are built as they are read: <span class="hz">十二</span> “ten-two” = 12, <span class="hz">二十</span> “two-ten” = 20, <span class="hz">一百零五</span> = 105 (a zero inside is spoken). Two has two forms: <span class="hz">二</span> <i>èr</i> for counting and inside numbers, <span class="hz">两</span> <i>liǎng</i> before a measure word. <span class="hz">半</span> <i>bàn</i> “half” goes before the measure word alone (<span class="hz">半个</span>), after it with a whole (<span class="hz">一个半</span>, “one and a half”).',
      },
      ex: [
        ['我有两个哥哥。', 'Wǒ yǒu liǎng ge gēge.', 'Ho due fratelli maggiori.', 'I have two older brothers.'],
        ['我们学校有二十二个老师。', 'Wǒmen xuéxiào yǒu èrshí\'èr ge lǎoshī.', 'La nostra scuola ha ventidue insegnanti.', 'Our school has twenty-two teachers.'],
      ],
    },
    {
      sec: 'words', sub: '量词 · 名量词', zh: '（1）专用名量词：本、个、家、口、块、件、只、元　（2）借用名量词：杯', keys: ['本', '个', '家', '口', '块', '件', '只', '元', '杯'],
      t: { it: 'I classificatori dei nomi', en: 'Measure words for nouns' },
      p: {
        it: 'Tra un numero (o <span class="hz">这</span>, <span class="hz">那</span>, <span class="hz">几</span>) e il nome serve un classificatore, scelto secondo la cosa contata: <span class="hz">本</span> per i libri, <span class="hz">家</span> per negozi e aziende, <span class="hz">口</span> per i membri della famiglia, <span class="hz">件</span> per vestiti e faccende, <span class="hz">只</span> per gli animali, <span class="hz">块</span> e <span class="hz">元</span> per il denaro; <span class="hz">个</span> è il più generico. Anche un contenitore fa da classificatore: <span class="hz">一杯水</span> «un bicchiere d\'acqua».',
        en: 'Between a number (or <span class="hz">这</span>, <span class="hz">那</span>, <span class="hz">几</span>) and the noun comes a measure word, chosen by what is counted: <span class="hz">本</span> for books, <span class="hz">家</span> for shops and firms, <span class="hz">口</span> for family members, <span class="hz">件</span> for clothes and matters, <span class="hz">只</span> for animals, <span class="hz">块</span> and <span class="hz">元</span> for money; <span class="hz">个</span> is the most general. A container works as one too: <span class="hz">一杯水</span> “a glass of water”.',
      },
      ex: [
        ['我家有三口人。', 'Wǒ jiā yǒu sān kǒu rén.', 'In famiglia siamo in tre.', 'There are three of us in my family.'],
        ['我想喝一杯水。', 'Wǒ xiǎng hē yì bēi shuǐ.', "Vorrei un bicchiere d'acqua.", 'I would like a glass of water.'],
        ['那只狗很大。', 'Nà zhī gǒu hěn dà.', 'Quel cane è grande.', 'That dog is big.'],
      ],
    },
    {
      sec: 'words', sub: '量词 · 时量词', zh: '日、号、岁、点、分、年、天', keys: ['日', '号', '岁', '点', '分', '年', '天'],
      t: { it: 'Unità di tempo e di età', en: 'Units of time and age' },
      p: {
        it: 'Queste parole sono già unità di misura, e si contano direttamente, senza classificatore: <span class="hz">三天</span> «tre giorni», <span class="hz">两年</span> «due anni», <span class="hz">五岁</span> «cinque anni (d\'età)». <span class="hz">号</span> e <span class="hz">日</span> sono il giorno del mese: <span class="hz">号</span> nel parlato, <span class="hz">日</span> nello scritto. I mesi invece, come durata, vogliono <span class="hz">个</span>: <span class="hz">三个月</span>.',
        en: 'These words are units already, and are counted directly, with no measure word: <span class="hz">三天</span> “three days”, <span class="hz">两年</span> “two years”, <span class="hz">五岁</span> “five years old”. <span class="hz">号</span> and <span class="hz">日</span> are the day of the month: <span class="hz">号</span> in speech, <span class="hz">日</span> in writing. Months, as a length of time, do want <span class="hz">个</span>: <span class="hz">三个月</span>.',
      },
      ex: [
        ['我今年二十岁。', 'Wǒ jīnnián èrshí suì.', 'Quest\'anno compio vent\'anni.', 'I am twenty this year.'],
        ['一年有十二个月。', 'Yì nián yǒu shí\'èr ge yuè.', "Un anno ha dodici mesi.", 'A year has twelve months.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 程度副词', zh: '非常、很、太、真、有（一）点儿', keys: ['非常', '很', '太', '真'],
      t: { it: 'Gli avverbi di grado', en: 'Adverbs of degree' },
      p: {
        it: 'Vanno davanti all\'aggettivo. <span class="hz">很</span> si mette quasi sempre, anche quando non vuol dire davvero «molto» (vedi l\'introduzione); <span class="hz">非常</span> è «molto» sul serio, <span class="hz">真</span> «davvero». <span class="hz">太</span> è «troppo», e con <span class="hz">了</span> in fondo diventa un\'esclamazione: <span class="hz">太好了！</span> «benissimo!». <span class="hz">有点儿</span> «un po\'» si usa per le cose sgradite: <span class="hz">有点儿贵</span>, «un po\' caro».',
        en: 'They go before the adjective. <span class="hz">很</span> is nearly always there, even when it does not really mean “very” (see the introduction); <span class="hz">非常</span> is “very” in earnest, <span class="hz">真</span> “really”. <span class="hz">太</span> is “too”, and with <span class="hz">了</span> at the end it becomes an exclamation: <span class="hz">太好了！</span> “great!”. <span class="hz">有点儿</span> “a bit” is for unwelcome things: <span class="hz">有点儿贵</span>, “a bit pricey”.',
      },
      ex: [
        ['今天太热了！', 'Jīntiān tài rè le!', 'Oggi fa troppo caldo!', 'It is far too hot today!'],
        ['这件衣服有点儿贵。', 'Zhè jiàn yīfu yǒudiǎnr guì.', "Questo vestito è un po' caro.", 'This piece of clothing is a bit pricey.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 范围副词', zh: '都', keys: ['都'],
      t: { it: '都: tutti', en: '都: all' },
      p: {
        it: '<span class="hz">都</span> <i>dōu</i> è un avverbio: sta davanti al verbo e riassume ciò che lo precede, che quindi deve essere plurale. Dove l\'italiano dice «tutti noi siamo», il cinese dice «noi tutti siamo».',
        en: '<span class="hz">都</span> <i>dōu</i> is an adverb: it stands before the verb and sums up what comes before it, which must therefore be plural. Where English says “all of us are”, Chinese says “we all are”.',
      },
      ex: [
        ['我们都是学生。', 'Wǒmen dōu shì xuésheng.', 'Siamo tutti studenti.', 'We are all students.'],
        ['爸爸和妈妈都在家。', 'Bàba hé māma dōu zài jiā.', 'Papà e mamma sono tutti e due a casa.', 'Dad and Mum are both at home.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 时间副词', zh: '在、正在', keys: ['在', '正在'],
      t: { it: '在 e 正在: stare facendo', en: '在 and 正在: in the middle of' },
      p: {
        it: 'Davanti a un verbo, <span class="hz">在</span> e <span class="hz">正在</span> dicono che l\'azione è in corso, come «stare + gerundio»; <span class="hz">正在</span> insiste sul momento preciso. Spesso la frase finisce con <span class="hz">呢</span> (vedi l\'aspetto progressivo, più sotto).',
        en: 'Before a verb, <span class="hz">在</span> and <span class="hz">正在</span> say that the action is going on, like “be + -ing”; <span class="hz">正在</span> stresses the very moment. The sentence often ends in <span class="hz">呢</span> (see the progressive aspect, below).',
      },
      ex: [
        ['他在看书。', 'Tā zài kàn shū.', 'Sta leggendo.', 'He is reading.'],
        ['妈妈正在做饭。', 'Māma zhèngzài zuòfàn.', 'La mamma sta cucinando proprio adesso.', 'Mum is cooking right now.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 频率副词', zh: '再', keys: ['再'],
      t: { it: '再: di nuovo (dopo)', en: '再: again (later)' },
      p: {
        it: '<span class="hz">再</span> <i>zài</i> davanti al verbo vuol dire «di nuovo, un\'altra volta», per qualcosa che deve ancora succedere. Da qui il saluto <span class="hz">再见</span>, «arrivederci», alla lettera «di nuovo vedersi».',
        en: '<span class="hz">再</span> <i>zài</i> before the verb means “again, once more”, for something still to happen. Hence the goodbye <span class="hz">再见</span>, literally “again see”.',
      },
      ex: [
        ['明天再来吧。', 'Míngtiān zài lái ba.', 'Torna domani.', 'Come again tomorrow.'],
        ['请你再说一下。', 'Qǐng nǐ zài shuō yíxià.', 'Puoi ripetere, per favore?', 'Could you say it again, please?'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 关联副词', zh: '还、也', keys: ['还', '也'],
      t: { it: '也 e 还: anche, ancora', en: '也 and 还: also, still' },
      p: {
        it: '<span class="hz">也</span> <i>yě</i> «anche» è un avverbio: va sempre dopo il soggetto e davanti al verbo, mai all\'inizio come in italiano («anch\'io» = <span class="hz">我也</span>). <span class="hz">还</span> <i>hái</i> davanti al verbo aggiunge qualcosa («in più») o dice che qualcosa continua («ancora»).',
        en: '<span class="hz">也</span> <i>yě</i> “also” is an adverb: it always goes after the subject and before the verb (“me too” = <span class="hz">我也</span>). <span class="hz">还</span> <i>hái</i> before the verb adds something (“as well”) or says that something goes on (“still”).',
      },
      ex: [
        ['我也是中国人。', 'Wǒ yě shì Zhōngguó rén.', 'Anch\'io sono cinese.', 'I am Chinese too.'],
        ['他还在睡觉。', 'Tā hái zài shuìjiào.', 'Sta ancora dormendo.', 'He is still asleep.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 否定副词', zh: '不、没（有）、不要', keys: ['不', '没', '不要'],
      t: { it: 'Le negazioni', en: 'Negation' },
      p: {
        it: '<span class="hz">不</span> <i>bù</i> nega il presente, il futuro, le abitudini e le intenzioni. <span class="hz">没</span> o <span class="hz">没有</span> <i>méi(yǒu)</i> nega ciò che è successo, e il verbo <span class="hz">有</span> («non avere»). <span class="hz">不要</span> <i>búyào</i> davanti a un verbo è un divieto: «non fare».',
        en: '<span class="hz">不</span> <i>bù</i> negates the present, the future, habits and intentions. <span class="hz">没</span> or <span class="hz">没有</span> <i>méi(yǒu)</i> negates what happened, and the verb <span class="hz">有</span> (“not have”). <span class="hz">不要</span> <i>búyào</i> before a verb forbids: “don\'t”.',
      },
      ex: [
        ['我不喝茶。', 'Wǒ bù hē chá.', 'Non bevo tè.', "I don't drink tea."],
        ['他昨天没来。', 'Tā zuótiān méi lái.', 'Ieri non è venuto.', "He didn't come yesterday."],
        ['上课的时候不要说话。', 'Shàngkè de shíhou búyào shuōhuà.', 'Durante la lezione non si parla.', "Don't talk during class."],
      ],
    },
    {
      sec: 'words', sub: '介词', zh: '在（引出时间、处所）；和、对（引出对象）', keys: ['在', '和', '对'],
      t: { it: 'Le preposizioni 在, 和, 对', en: 'The prepositions 在, 和, 对' },
      p: {
        it: 'In cinese la preposizione con il suo nome sta <b>prima</b> del verbo. <span class="hz">在</span> indica dove (o quando) succede: <span class="hz">在家吃饭</span> «mangiare a casa». <span class="hz">和</span> è «con»: <span class="hz">和朋友去</span>. <span class="hz">对</span> è «verso, nei confronti di»: <span class="hz">对我很好</span> «è gentile con me».',
        en: 'In Chinese a preposition with its noun comes <b>before</b> the verb. <span class="hz">在</span> says where (or when) something happens: <span class="hz">在家吃饭</span> “eat at home”. <span class="hz">和</span> is “with”: <span class="hz">和朋友去</span>. <span class="hz">对</span> is “towards, to”: <span class="hz">对我很好</span> “is kind to me”.',
      },
      ex: [
        ['我在学校学习汉语。', 'Wǒ zài xuéxiào xuéxí Hànyǔ.', 'Studio cinese a scuola.', 'I study Chinese at school.'],
        ['我和朋友去吃饭。', 'Wǒ hé péngyou qù chīfàn.', 'Vado a mangiare con un amico.', 'I am going out to eat with a friend.'],
        ['老师对我们很好。', 'Lǎoshī duì wǒmen hěn hǎo.', "L'insegnante è gentile con noi.", 'The teacher is kind to us.'],
      ],
    },
    {
      sec: 'words', sub: '连词', zh: '和（连接词语或短语）', keys: ['和'],
      t: { it: '和: «e» tra due nomi', en: '和: “and” between nouns' },
      p: {
        it: '<span class="hz">和</span> <i>hé</i> unisce parole e sintagmi, soprattutto nomi e pronomi: <span class="hz">我和你</span>. Non unisce due frasi, e di solito nemmeno due verbi: lì il cinese mette le frasi una accanto all\'altra, o usa <span class="hz">也</span> e <span class="hz">还</span>.',
        en: '<span class="hz">和</span> <i>hé</i> joins words and phrases, nouns and pronouns above all: <span class="hz">我和你</span>. It does not join two sentences, and usually not two verbs either: there Chinese sets the sentences side by side, or uses <span class="hz">也</span> and <span class="hz">还</span>.',
      },
      ex: [
        ['我喜欢米饭和面包。', 'Wǒ xǐhuan mǐfàn hé miànbāo.', 'Mi piacciono il riso e il pane.', 'I like rice and bread.'],
      ],
    },
    {
      sec: 'words', sub: '助词 · 结构助词', zh: '的', keys: ['的'],
      t: { it: '的: «di», e ciò che descrive il nome', en: '的: “of”, and what describes a noun' },
      p: {
        it: '<span class="hz">的</span> <i>de</i> lega al nome ciò che lo descrive, che sta sempre prima: il possessore (<span class="hz">我的书</span> «il mio libro»), un aggettivo con <span class="hz">很</span> (<span class="hz">很好的朋友</span>), un\'intera frase (<span class="hz">我买的书</span> «il libro che ho comprato»). Con i familiari e le cose molto vicine spesso cade: <span class="hz">我妈妈</span>.',
        en: '<span class="hz">的</span> <i>de</i> ties to a noun what describes it, which always comes first: the owner (<span class="hz">我的书</span> “my book”), an adjective with <span class="hz">很</span> (<span class="hz">很好的朋友</span>), a whole clause (<span class="hz">我买的书</span> “the book I bought”). With family and close things it is often dropped: <span class="hz">我妈妈</span>.',
      },
      ex: [
        ['这是我的手机。', 'Zhè shì wǒ de shǒujī.', 'Questo è il mio telefono.', 'This is my phone.'],
        ['他是我很好的朋友。', 'Tā shì wǒ hěn hǎo de péngyou.', 'È un mio caro amico.', 'He is a very good friend of mine.'],
      ],
    },
    {
      sec: 'words', sub: '助词 · 动态助词', zh: '了', keys: ['了'],
      t: { it: '了 dopo il verbo', en: '了 after the verb' },
      p: {
        it: 'Dopo il verbo, <span class="hz">了</span> <i>le</i> dice che l\'azione si è compiuta. Si vede meglio più sotto, nell\'aspetto compiuto.',
        en: 'After the verb, <span class="hz">了</span> <i>le</i> says that the action is complete. See the perfective aspect, below.',
      },
      ex: [
        ['我买了一本书。', 'Wǒ mǎi le yì běn shū.', 'Ho comprato un libro.', 'I bought a book.'],
      ],
    },
    {
      sec: 'words', sub: '助词 · 语气助词', zh: '吧、了、吗、呢', keys: ['吧', '了', '吗', '呢'],
      t: { it: 'Le particelle di fine frase', en: 'Sentence-final particles' },
      p: {
        it: 'Chiudono la frase e ne cambiano il tono. <span class="hz">吗</span> <i>ma</i> la fa diventare una domanda sì/no. <span class="hz">吧</span> <i>ba</i> addolcisce: propone («andiamo, dai») o chiede conferma («sei italiano, vero?»). <span class="hz">呢</span> <i>ne</i> rimanda la domanda («e tu?»), chiede dov\'è qualcosa («e il mio telefono?») o sottolinea che un\'azione è in corso. <span class="hz">了</span> <i>le</i> in fondo dice che qualcosa è cambiato.',
        en: 'They close the sentence and change its tone. <span class="hz">吗</span> <i>ma</i> makes it a yes/no question. <span class="hz">吧</span> <i>ba</i> softens it: a suggestion (“let\'s go”) or a check (“you\'re Italian, aren\'t you?”). <span class="hz">呢</span> <i>ne</i> turns the question back (“and you?”), asks where something is (“and my phone?”) or stresses that something is going on. <span class="hz">了</span> <i>le</i> at the end says something has changed.',
      },
      ex: [
        ['我很好，你呢？', 'Wǒ hěn hǎo, nǐ ne?', 'Io sto bene, e tu?', "I'm fine, and you?"],
        ['我们去吧。', 'Wǒmen qù ba.', 'Andiamo, dai.', "Let's go."],
        ['你是学生吗？', 'Nǐ shì xuésheng ma?', 'Sei uno studente?', 'Are you a student?'],
      ],
    },
    {
      sec: 'words', sub: '叹词', zh: '喂', keys: ['喂'],
      t: { it: '喂: «pronto?»', en: '喂: “hello?”' },
      p: {
        it: '<span class="hz">喂</span> si dice rispondendo al telefono, quasi sempre <i>wéi</i>, con il secondo tono. Detto <i>wèi</i>, secco, è un «ehi!» per richiamare qualcuno, e non è molto cortese.',
        en: '<span class="hz">喂</span> is how you answer the phone, nearly always <i>wéi</i>, rising. Said <i>wèi</i>, sharply, it is a “hey!” to call someone, not very polite.',
      },
      ex: [
        ['喂，你好！', 'Wéi, nǐ hǎo!', 'Pronto, buongiorno!', 'Hello? Good morning!'],
      ],
    },

    // ---------- 短语 ----------
    {
      sec: 'phrases', sub: '结构类型', zh: '联合短语、偏正短语、动宾短语、主谓短语；数量短语、介宾短语、方位短语',
      t: { it: 'Come si combinano le parole', en: 'How words combine' },
      p: {
        it: 'Prima delle frasi, i pezzi con cui si fanno. <b>Coordinazione</b>: due parole alla pari, <span class="hz">爸爸妈妈</span>, <span class="hz">我和你</span>. <b>Modificatore + testa</b>: ciò che descrive viene prima, <span class="hz">好朋友</span>, <span class="hz">很忙</span>. <b>Verbo + oggetto</b>: <span class="hz">喝茶</span>. <b>Soggetto + predicato</b>, anche dentro una frase più grande: <span class="hz">他很忙</span>. E poi <b>numero + classificatore</b> (<span class="hz">三本</span>), <b>preposizione + nome</b> (<span class="hz">在家</span>), <b>nome + parola di posizione</b> (<span class="hz">桌子上</span>).',
        en: 'Before sentences, the pieces they are made of. <b>Coordination</b>: two words on a par, <span class="hz">爸爸妈妈</span>, <span class="hz">我和你</span>. <b>Modifier + head</b>: what describes comes first, <span class="hz">好朋友</span>, <span class="hz">很忙</span>. <b>Verb + object</b>: <span class="hz">喝茶</span>. <b>Subject + predicate</b>, even inside a larger sentence: <span class="hz">他很忙</span>. Then <b>number + measure word</b> (<span class="hz">三本</span>), <b>preposition + noun</b> (<span class="hz">在家</span>), <b>noun + position word</b> (<span class="hz">桌子上</span>).',
      },
      ex: [
        ['我知道他很忙。', 'Wǒ zhīdào tā hěn máng.', 'So che è molto impegnato.', 'I know he is very busy.'],
      ],
    },

    // ---------- 句子成分 ----------
    {
      sec: 'parts', sub: '主语 · 谓语 · 宾语', zh: '名词、代词、数词或数量短语作谓语；动词、形容词作谓语',
      t: { it: 'Soggetto, predicato, oggetto', en: 'Subject, predicate, object' },
      p: {
        it: 'Soggetto e oggetto sono nomi, pronomi o sintagmi nominali, nell\'ordine soggetto-verbo-oggetto. Il predicato può essere un verbo, un aggettivo (senza «essere») e, per età, date, prezzi e provenienze, anche un nome o un numero: <span class="hz">今天星期一</span> «oggi (è) lunedì», <span class="hz">他二十岁</span> «ha vent\'anni».',
        en: 'Subjects and objects are nouns, pronouns or noun phrases, in subject-verb-object order. The predicate may be a verb, an adjective (with no “to be”) and, for ages, dates, prices and origins, a noun or a number too: <span class="hz">今天星期一</span> “today (is) Monday”, <span class="hz">他二十岁</span> “he is twenty”.',
      },
      ex: [
        ['今天星期一。', 'Jīntiān xīngqīyī.', 'Oggi è lunedì.', 'Today is Monday.'],
        ['这个十块钱。', 'Zhège shí kuài qián.', 'Questo costa dieci yuan.', 'This one is ten yuan.'],
      ],
    },
    {
      sec: 'parts', sub: '定语', zh: '名词性词语、形容词性短语、数量短语作定语',
      t: { it: 'Tutto ciò che descrive va prima del nome', en: 'Whatever describes comes before the noun' },
      p: {
        it: 'Numeri, possessori, aggettivi: in cinese stanno sempre <b>prima</b> del nome che descrivono, di solito in quest\'ordine: di chi, quanti, com\'è. Tra un aggettivo di una sillaba e il nome il <span class="hz">的</span> non serve; con <span class="hz">很</span> o un aggettivo più lungo sì.',
        en: 'Numbers, owners, adjectives: in Chinese they always come <b>before</b> the noun they describe, usually in this order: whose, how many, what like. Between a one-syllable adjective and the noun no <span class="hz">的</span> is needed; with <span class="hz">很</span> or a longer one it is.',
      },
      ex: [
        ['我的三个好朋友', 'wǒ de sān ge hǎo péngyou', 'i miei tre buoni amici', 'my three good friends'],
        ['很大的商店', 'hěn dà de shāngdiàn', 'un negozio molto grande', 'a very big shop'],
      ],
    },
    {
      sec: 'parts', sub: '状语', zh: '副词、形容词作状语；表示时间、处所的词语作状语',
      t: { it: 'Quando, dove, come: prima del verbo', en: 'When, where, how: before the verb' },
      p: {
        it: 'Avverbi, tempo e luogo stanno prima del verbo, di solito in quest\'ordine: chi, quando, dove, che cosa fa. Il tempo può andare anche in testa alla frase, prima del soggetto; il luogo no.',
        en: 'Adverbs, time and place come before the verb, usually in this order: who, when, where, what they do. The time may also open the sentence, before the subject; the place may not.',
      },
      ex: [
        ['我明天在家学习。', 'Wǒ míngtiān zài jiā xuéxí.', 'Domani studio a casa.', 'Tomorrow I am studying at home.'],
        ['明天我去北京。', 'Míngtiān wǒ qù Běijīng.', 'Domani vado a Pechino.', 'Tomorrow I am going to Beijing.'],
      ],
    },
    {
      sec: 'parts', sub: '补语 · 数量补语', zh: '动词+动量补语', keys: ['一下'],
      t: { it: 'Quante volte: dopo il verbo', en: 'How many times: after the verb' },
      p: {
        it: 'Il numero di volte che si fa qualcosa va <b>dopo</b> il verbo, al contrario degli avverbi. Il più comune è <span class="hz">一下</span> <i>yíxià</i>, «una volta, un attimo», che rende più leggera una richiesta: <span class="hz">看一下</span> «dai un\'occhiata».',
        en: 'How many times something is done goes <b>after</b> the verb, unlike adverbs. The commonest is <span class="hz">一下</span> <i>yíxià</i>, “once, a moment”, which softens a request: <span class="hz">看一下</span> “have a look”.',
      },
      ex: [
        ['你看一下这本书。', 'Nǐ kàn yíxià zhè běn shū.', "Dai un'occhiata a questo libro.", 'Have a look at this book.'],
        ['我想问一下。', 'Wǒ xiǎng wèn yíxià.', 'Vorrei chiedere una cosa.', 'I would like to ask something.'],
      ],
    },

    // ---------- 句子的类型 ----------
    {
      sec: 'types', sub: '句型 · 单句', zh: '动词谓语句、形容词谓语句、名词谓语句；非主谓句',
      t: { it: 'Frasi con un verbo, con un aggettivo, con un nome', en: 'Sentences with a verb, an adjective, a noun' },
      p: {
        it: 'A seconda di che cosa fa da predicato: un verbo (<span class="hz">我喝茶</span>), un aggettivo (<span class="hz">他很高</span>), un nome o un numero (<span class="hz">明天星期三</span>). Alcune frasi non hanno soggetto: il tempo che fa, gli avvisi, i saluti.',
        en: 'By what the predicate is: a verb (<span class="hz">我喝茶</span>), an adjective (<span class="hz">他很高</span>), a noun or a number (<span class="hz">明天星期三</span>). Some sentences have no subject: the weather, notices, greetings.',
      },
      ex: [
        ['下雨了。', 'Xià yǔ le.', 'Piove. (si è messo a piovere)', "It's raining. (it has started)"],
        ['我女儿很漂亮。', 'Wǒ nǚ\'ér hěn piàoliang.', 'Mia figlia è molto carina.', 'My daughter is very pretty.'],
      ],
    },
    {
      sec: 'types', sub: '句类', zh: '陈述句；疑问句：是非问句、特指问句、正反问句；祈使句；感叹句',
      t: { it: 'Affermare, chiedere, chiedere di fare, esclamare', en: 'Stating, asking, telling, exclaiming' },
      p: {
        it: 'Le domande sono di tre tipi: sì/no con <span class="hz">吗</span>; con una parola interrogativa al posto della risposta; ripetendo il verbo con <span class="hz">不</span> in mezzo, «vai o non vai?». Per chiedere di fare qualcosa si usa <span class="hz">请</span> («per favore»), <span class="hz">吧</span> o <span class="hz">不要</span>. Per esclamare, <span class="hz">太……了</span> o <span class="hz">真</span>.',
        en: 'Questions come in three kinds: yes/no with <span class="hz">吗</span>; with a question word where the answer goes; repeating the verb with <span class="hz">不</span> between, “go or not go?”. To ask someone to do something: <span class="hz">请</span> (“please”), <span class="hz">吧</span> or <span class="hz">不要</span>. To exclaim, <span class="hz">太……了</span> or <span class="hz">真</span>.',
      },
      ex: [
        ['你去不去？', 'Nǐ qù bu qù?', 'Ci vai o no?', 'Are you going or not?'],
        ['请坐！', 'Qǐng zuò!', 'Prego, si sieda!', 'Please, sit down!'],
        ['这个菜真好吃！', 'Zhège cài zhēn hǎochī!', 'Questo piatto è davvero buono!', 'This dish is really good!'],
      ],
    },
    {
      sec: 'types', sub: '特殊句型 · “是”字句', zh: '表示等同或类属', keys: ['是'],
      t: { it: '是: A è B', en: '是: A is B' },
      p: {
        it: '<span class="hz">是</span> <i>shì</i> collega due nomi: A è B, la stessa cosa o un tipo di B. Non si usa davanti agli aggettivi, né per dire dove si trova qualcosa (lì c\'è <span class="hz">在</span>). Si nega con <span class="hz">不</span>: <span class="hz">不是</span>.',
        en: '<span class="hz">是</span> <i>shì</i> links two nouns: A is B, the same thing or a kind of B. It is not used before adjectives, nor to say where something is (that is <span class="hz">在</span>). It is negated with <span class="hz">不</span>: <span class="hz">不是</span>.',
      },
      ex: [
        ['他是我哥哥。', 'Tā shì wǒ gēge.', 'È mio fratello maggiore.', 'He is my older brother.'],
        ['我不是老师，我是学生。', 'Wǒ bú shì lǎoshī, wǒ shì xuésheng.', 'Non sono un insegnante, sono uno studente.', 'I am not a teacher, I am a student.'],
      ],
    },
    {
      sec: 'types', sub: '特殊句型 · “有”字句', zh: '表示领有', keys: ['有', '没有'],
      t: { it: '有: avere', en: '有: to have' },
      p: {
        it: '<span class="hz">有</span> <i>yǒu</i> è «avere». È l\'unico verbo che non si nega con <span class="hz">不</span> ma con <span class="hz">没</span>: <span class="hz">没有</span>, «non avere».',
        en: '<span class="hz">有</span> <i>yǒu</i> is “to have”. It is the one verb negated not with <span class="hz">不</span> but with <span class="hz">没</span>: <span class="hz">没有</span>, “not have”.',
      },
      ex: [
        ['我有两个妹妹。', 'Wǒ yǒu liǎng ge mèimei.', 'Ho due sorelle minori.', 'I have two younger sisters.'],
        ['我没有车。', 'Wǒ méiyǒu chē.', 'Non ho la macchina.', "I don't have a car."],
      ],
    },
    {
      sec: 'types', sub: '特殊句型 · 存现句', zh: '处所+是+名词；处所+有+数量短语+名词',
      t: { it: "C'è, ci sono: il luogo all'inizio", en: 'There is: the place first' },
      p: {
        it: 'Per dire che in un luogo c\'è qualcosa, il luogo apre la frase: «luogo + <span class="hz">有</span> + quanti + che cosa». Con <span class="hz">是</span> invece si dice che cosa occupa quel luogo: «davanti è la scuola».',
        en: 'To say that something is in a place, the place opens the sentence: “place + <span class="hz">有</span> + how many + what”. With <span class="hz">是</span> one says what fills that place: “in front is the school”.',
      },
      ex: [
        ['桌子上有一本书。', 'Zhuōzi shang yǒu yì běn shū.', "Sul tavolo c'è un libro.", 'There is a book on the table.'],
        ['前边是我们的学校。', 'Qiánbian shì wǒmen de xuéxiào.', 'Lì davanti c\'è la nostra scuola.', 'Ahead is our school.'],
      ],
    },
    {
      sec: 'types', sub: '特殊句型 · 连动句', zh: '前后动作先后发生，后一动作是前一动作的目的；前一动作是后一动作的方式',
      t: { it: 'Più verbi in fila', en: 'Verbs in a row' },
      p: {
        it: 'Due verbi possono stare uno dopo l\'altro senza congiunzioni, nell\'ordine in cui le cose succedono. Il secondo può essere lo scopo del primo («vado al negozio [a] comprare»), oppure il primo il modo del secondo («prendo l\'aereo [e] vado»).',
        en: 'Two verbs can follow each other with no conjunction, in the order things happen. The second may be the aim of the first (“go to the shop [to] buy”), or the first the means of the second (“take the plane [and] go”).',
      },
      ex: [
        ['我去商店买东西。', 'Wǒ qù shāngdiàn mǎi dōngxi.', 'Vado al negozio a fare la spesa.', 'I am going to the shop to buy things.'],
        ['他坐飞机去北京。', 'Tā zuò fēijī qù Běijīng.', 'Va a Pechino in aereo.', 'He is flying to Beijing.'],
      ],
    },
    {
      sec: 'types', sub: '特殊句型 · 双宾语句', zh: '主语+动词+宾语1+宾语2',
      t: { it: 'Due oggetti: a chi, che cosa', en: 'Two objects: to whom, what' },
      p: {
        it: 'Alcuni verbi, come «dare», «chiedere», «insegnare», prendono due oggetti senza preposizioni: prima la persona, poi la cosa. «Ti do un libro» è <span class="hz">给你一本书</span>, alla lettera «do te un libro».',
        en: 'Some verbs, like “give”, “ask”, “teach”, take two objects with no preposition: first the person, then the thing. “I give you a book” is <span class="hz">给你一本书</span>.',
      },
      ex: [
        ['妈妈给我一个苹果。', 'Māma gěi wǒ yí ge píngguǒ.', 'La mamma mi dà una mela.', 'Mum gives me an apple.'],
        ['我问老师一个问题。', 'Wǒ wèn lǎoshī yí ge wèntí.', "Faccio una domanda all'insegnante.", 'I ask the teacher a question.'],
      ],
    },

    // ---------- 复句 ----------
    {
      sec: 'complex', sub: '不用关联词语的复句 · 并列复句', zh: '……，也……；……，还……', keys: ['也', '还'],
      t: { it: 'Due frasi in fila, con 也 o 还', en: 'Two clauses side by side, with 也 or 还' },
      p: {
        it: 'Per aggiungere una cosa all\'altra il cinese non usa <span class="hz">和</span>: mette le due frasi in fila, e nella seconda <span class="hz">也</span> («anche») o <span class="hz">还</span> («e inoltre») davanti al verbo.',
        en: 'To add one thing to another Chinese does not use <span class="hz">和</span>: it sets the two clauses side by side, with <span class="hz">也</span> (“also”) or <span class="hz">还</span> (“and also”) before the verb of the second.',
      },
      ex: [
        ['我会说汉语，也会写汉字。', 'Wǒ huì shuō Hànyǔ, yě huì xiě Hànzì.', 'So parlare cinese, e so anche scrivere i caratteri.', 'I can speak Chinese, and write characters too.'],
        ['我有一个哥哥，还有一个妹妹。', 'Wǒ yǒu yí ge gēge, hái yǒu yí ge mèimei.', 'Ho un fratello maggiore, e anche una sorella minore.', 'I have an older brother, and a younger sister as well.'],
      ],
    },

    // ---------- 动作的态 ----------
    {
      sec: 'aspect', sub: '完成态', zh: '用动态助词“了₁”表示', keys: ['了'],
      t: { it: 'Azione compiuta: 了 dopo il verbo', en: 'Completed action: 了 after the verb' },
      p: {
        it: 'Il cinese non ha tempi verbali: <span class="hz">了</span> dopo il verbo dice che l\'azione è <b>compiuta</b>, non quando. Con un oggetto di solito vuole anche un numero o qualcosa che lo precisi (<span class="hz">买了一本书</span>). Al negativo <span class="hz">了</span> sparisce: <span class="hz">没买</span>.',
        en: 'Chinese has no tenses: <span class="hz">了</span> after the verb says the action is <b>complete</b>, not when. With an object it usually wants a number or something to pin it down too (<span class="hz">买了一本书</span>). In the negative <span class="hz">了</span> goes: <span class="hz">没买</span>.',
      },
      ex: [
        ['昨天我看了一个电影。', 'Zuótiān wǒ kàn le yí ge diànyǐng.', 'Ieri ho visto un film.', 'Yesterday I saw a film.'],
        ['我没看那个电影。', 'Wǒ méi kàn nàge diànyǐng.', 'Quel film non l\'ho visto.', "I didn't see that film."],
      ],
    },
    {
      sec: 'aspect', sub: '变化态', zh: '用动态助词“了₂”表示', keys: ['了'],
      t: { it: 'Qualcosa è cambiato: 了 in fondo', en: 'Something has changed: 了 at the end' },
      p: {
        it: 'In fondo alla frase, <span class="hz">了</span> dice che la situazione adesso è diversa da prima: «ora ha vent\'anni», «non ci vado più», «si è messo a piovere».',
        en: 'At the end of the sentence, <span class="hz">了</span> says that things are now different from before: “he is twenty now”, “I\'m not going any more”, “it has started raining”.',
      },
      ex: [
        ['他二十岁了。', 'Tā èrshí suì le.', 'Adesso ha vent\'anni.', 'He is twenty now.'],
        ['我不去了。', 'Wǒ bú qù le.', 'Non ci vado più.', "I'm not going after all."],
      ],
    },
    {
      sec: 'aspect', sub: '进行态', zh: '在/正在+动词；在/正在+动词……+呢；……呢', keys: ['在', '正在', '呢'],
      t: { it: 'Azione in corso', en: 'Action in progress' },
      p: {
        it: 'Che un\'azione sia in corso si dice con <span class="hz">在</span> o <span class="hz">正在</span> davanti al verbo, con <span class="hz">呢</span> in fondo, o con tutti e due insieme. Al negativo: <span class="hz">没在</span>.',
        en: 'That an action is going on is said with <span class="hz">在</span> or <span class="hz">正在</span> before the verb, with <span class="hz">呢</span> at the end, or both. In the negative: <span class="hz">没在</span>.',
      },
      ex: [
        ['他正在吃饭呢。', 'Tā zhèngzài chīfàn ne.', 'Sta mangiando proprio adesso.', 'He is having his meal right now.'],
        ['我看书呢。', 'Wǒ kàn shū ne.', 'Sto leggendo.', 'I am reading.'],
      ],
    },

    // ---------- 特殊表达法 ----------
    {
      sec: 'special', sub: '数的表达法 · 钱数表示法', zh: '钱数表示法', keys: ['块', '元', '钱'],
      t: { it: 'I prezzi', en: 'Prices' },
      p: {
        it: 'La moneta cinese è lo <i>yuan</i>: <span class="hz">元</span> per iscritto, <span class="hz">块</span> <i>kuài</i> a voce, spesso seguito da <span class="hz">钱</span>. Il prezzo fa da predicato da solo, senza verbo: «questo dieci yuan».',
        en: 'Chinese money is the <i>yuan</i>: <span class="hz">元</span> in writing, <span class="hz">块</span> <i>kuài</i> in speech, often followed by <span class="hz">钱</span>. A price is a predicate on its own, with no verb: “this ten yuan”.',
      },
      ex: [
        ['这本书二十五块钱。', 'Zhè běn shū èrshíwǔ kuài qián.', 'Questo libro costa venticinque yuan.', 'This book costs twenty-five yuan.'],
      ],
    },
    {
      sec: 'special', sub: '数的表达法 · 序数表达法', zh: '第+数词', keys: ['第'],
      t: { it: 'Gli ordinali', en: 'Ordinals' },
      p: {
        it: '<span class="hz">第</span> più il numero, e poi di solito il classificatore: <span class="hz">第一次</span> «la prima volta», <span class="hz">第三个</span> «il terzo».',
        en: '<span class="hz">第</span> plus the number, then usually the measure word: <span class="hz">第一次</span> “the first time”, <span class="hz">第三个</span> “the third one”.',
      },
      ex: [
        ['我是第一个来的。', 'Wǒ shì dì yī ge lái de.', 'Sono arrivato per primo.', 'I was the first to come.'],
      ],
    },
    {
      sec: 'special', sub: '时间表示法', zh: '年、月、日、星期表示法；钟点表示法', keys: ['年', '月', '号', '星期', '点', '分', '半', '现在'],
      t: { it: 'Date e ore', en: 'Dates and times' },
      p: {
        it: 'Le date vanno dal più grande al più piccolo: anno, mese, giorno, giorno della settimana. L\'anno si legge cifra per cifra (<span class="hz">二〇二六年</span> <i>èr líng èr liù nián</i>); i mesi sono «mese uno», «mese due»…; i giorni della settimana «settimana uno» (lunedì) fino a «settimana sei», e la domenica è <span class="hz">星期天</span>. Le ore: <span class="hz">点</span> per l\'ora, <span class="hz">分</span> per i minuti, <span class="hz">半</span> per la mezza.',
        en: 'Dates go from largest to smallest: year, month, day, weekday. The year is read digit by digit (<span class="hz">二〇二六年</span> <i>èr líng èr liù nián</i>); months are “month one”, “month two”…; weekdays “week one” (Monday) to “week six”, and Sunday is <span class="hz">星期天</span>. Times: <span class="hz">点</span> for the hour, <span class="hz">分</span> for minutes, <span class="hz">半</span> for half past.',
      },
      ex: [
        ['今天十一月三号，星期二。', 'Jīntiān shíyī yuè sān hào, xīngqī\'èr.', 'Oggi è martedì tre novembre.', 'Today is Tuesday, the third of November.'],
        ['现在三点十分。', 'Xiànzài sān diǎn shí fēn.', 'Sono le tre e dieci.', 'It is ten past three.'],
        ['我七点半起床。', 'Wǒ qī diǎn bàn qǐchuáng.', 'Mi alzo alle sette e mezza.', 'I get up at half past seven.'],
      ],
    },
  ],
};
