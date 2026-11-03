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
  2: [
    // ---------- 语素 ----------
    {
      sec: 'morph', sub: '后缀', zh: '面', keys: ['面'],
      t: { it: 'Il suffisso 面', en: 'The suffix 面' },
      p: {
        it: 'Come <span class="hz">边</span>, <span class="hz">面</span> <i>mian</i> (atono) dopo una parola di posizione ne fa un luogo: <span class="hz">里面</span> «dentro», <span class="hz">外面</span> «fuori», <span class="hz">上面</span> «sopra». Le due forme si equivalgono quasi sempre.',
        en: 'Like <span class="hz">边</span>, <span class="hz">面</span> <i>mian</i> (unstressed) after a position word makes it a place: <span class="hz">里面</span> “inside”, <span class="hz">外面</span> “outside”, <span class="hz">上面</span> “on top”. The two are nearly always interchangeable.',
      },
      ex: [
        ['外面下雨了。', 'Wàimian xià yǔ le.', 'Fuori piove.', "It's raining outside."],
        ['书包里面有什么？', 'Shūbāo lǐmian yǒu shénme?', "Che cosa c'è nello zaino?", "What's in the school bag?"],
      ],
    },

    // ---------- 词类 ----------
    {
      sec: 'words', sub: '名词 · 方位名词', zh: '左、右', keys: ['左', '右'],
      t: { it: 'Sinistra e destra', en: 'Left and right' },
      p: {
        it: '<span class="hz">左</span> e <span class="hz">右</span> si usano quasi sempre con <span class="hz">边</span>: <span class="hz">左边</span> «a sinistra», <span class="hz">右边</span> «a destra». Come le altre parole di posizione, vanno dopo il nome a cui si riferiscono.',
        en: '<span class="hz">左</span> and <span class="hz">右</span> nearly always come with <span class="hz">边</span>: <span class="hz">左边</span> “on the left”, <span class="hz">右边</span> “on the right”. Like the other position words, they follow the noun they refer to.',
      },
      ex: [
        ['医院在学校右边。', 'Yīyuàn zài xuéxiào yòubian.', "L'ospedale è a destra della scuola.", 'The hospital is to the right of the school.'],
      ],
    },
    {
      sec: 'words', sub: '动词 · 动词重叠', zh: 'AA、A一A、A了A、ABAB',
      t: { it: 'Il verbo ripetuto: «un po\'»', en: 'Doubled verbs: “a little”' },
      p: {
        it: 'Ripetere un verbo lo rende più leggero: «fare un po\'», «provare a fare». I verbi di una sillaba si ripetono così: <span class="hz">看看</span>, <span class="hz">看一看</span> (stesso senso); per un\'azione già fatta, <span class="hz">看了看</span>. Quelli di due sillabe si ripetono interi: <span class="hz">休息休息</span>, «riposarsi un po\'».',
        en: 'Repeating a verb makes it lighter: “do a bit of”, “have a go at”. One-syllable verbs repeat like this: <span class="hz">看看</span>, <span class="hz">看一看</span> (the same); for something done, <span class="hz">看了看</span>. Two-syllable ones repeat whole: <span class="hz">休息休息</span>, “have a little rest”.',
      },
      ex: [
        ['你看看这本书。', 'Nǐ kànkan zhè běn shū.', 'Dai un\'occhiata a questo libro.', 'Have a look at this book.'],
        ['他看了看手表。', 'Tā kàn le kàn shǒubiǎo.', "Ha dato un'occhiata all'orologio.", 'He glanced at his watch.'],
        ['我们休息休息吧。', 'Wǒmen xiūxi xiūxi ba.', 'Riposiamoci un po\'.', "Let's have a little rest."],
      ],
    },
    {
      sec: 'words', sub: '动词 · 能愿动词', zh: '可能', keys: ['可能'],
      t: { it: '可能: è possibile che', en: '可能: may, might' },
      p: {
        it: '<span class="hz">可能</span> <i>kěnéng</i> davanti al verbo dice che qualcosa è probabile: «forse», «può darsi». Può stare anche prima del soggetto. Al negativo: <span class="hz">可能不</span>, «forse non».',
        en: '<span class="hz">可能</span> <i>kěnéng</i> before the verb says something is likely: “maybe”, “might”. It can also come before the subject. Negative: <span class="hz">可能不</span>, “might not”.',
      },
      ex: [
        ['明天可能下雨。', 'Míngtiān kěnéng xià yǔ.', 'Domani forse piove.', 'It might rain tomorrow.'],
        ['他可能不来了。', 'Tā kěnéng bù lái le.', 'Forse non viene più.', 'He may not be coming after all.'],
      ],
    },
    {
      sec: 'words', sub: '动词 · 离合词', zh: '帮忙、游泳、跳舞、跑步', keys: ['帮忙', '游泳', '跳舞', '跑步'],
      t: { it: 'Altri verbi separabili', en: 'More separable verbs' },
      p: {
        it: 'Anche questi sono verbo + oggetto: <span class="hz">帮忙</span> «aiutare» è «aiutare-faccenda». Quindi non si dice <span class="hz">帮忙你</span>: o <span class="hz">帮你</span>, o <span class="hz">帮你的忙</span>, con la persona in mezzo. E «un po\'», «una volta» vanno in mezzo anche loro: <span class="hz">跑一会儿步</span>.',
        en: 'These are verb + object too: <span class="hz">帮忙</span> “to help” is “help-business”. So one does not say <span class="hz">帮忙你</span>: either <span class="hz">帮你</span>, or <span class="hz">帮你的忙</span>, with the person inside. Durations go inside as well: <span class="hz">跑一会儿步</span>.',
      },
      ex: [
        ['你能帮我一个忙吗？', 'Nǐ néng bāng wǒ yí ge máng ma?', 'Mi puoi fare un favore?', 'Can you do me a favour?'],
        ['我每天早上跑步。', 'Wǒ měi tiān zǎoshang pǎobù.', 'Corro tutte le mattine.', 'I go running every morning.'],
      ],
    },
    {
      sec: 'words', sub: '代词 · 疑问代词', zh: '为什么', keys: ['为什么'],
      t: { it: '为什么: perché', en: '为什么: why' },
      p: {
        it: '<span class="hz">为什么</span> <i>wèi shénme</i>, «per che cosa», chiede la causa; di solito sta dopo il soggetto. La risposta comincia spesso con <span class="hz">因为</span>.',
        en: '<span class="hz">为什么</span> <i>wèi shénme</i>, “for what”, asks the reason; it usually comes after the subject. The answer often starts with <span class="hz">因为</span>.',
      },
      ex: [
        ['你为什么不去？', 'Nǐ wèi shénme bú qù?', 'Perché non ci vai?', "Why aren't you going?"],
      ],
    },
    {
      sec: 'words', sub: '代词 · 人称代词', zh: '自己', keys: ['自己'],
      t: { it: '自己: se stesso', en: '自己: oneself' },
      p: {
        it: '<span class="hz">自己</span> <i>zìjǐ</i> vale per tutte le persone: «me stesso», «se stesso», «noi stessi». Dopo un pronome lo rafforza (<span class="hz">我自己</span>, «io stesso»); davanti a un verbo vuol dire «da solo».',
        en: '<span class="hz">自己</span> <i>zìjǐ</i> serves every person: “myself”, “himself”, “ourselves”. After a pronoun it stresses it (<span class="hz">我自己</span>, “I myself”); before a verb it means “by oneself”.',
      },
      ex: [
        ['这是我自己做的。', 'Zhè shì wǒ zìjǐ zuò de.', "L'ho fatto io stesso.", 'I made this myself.'],
        ['孩子自己去上学。', 'Háizi zìjǐ qù shàngxué.', 'Il bambino va a scuola da solo.', 'The child goes to school by himself.'],
      ],
    },
    {
      sec: 'words', sub: '代词 · 指示代词', zh: '那么、那样、这么、这样、每', keys: ['那么', '那样', '这么', '这样', '每'],
      t: { it: 'Così, in quel modo, ogni', en: 'So, like that, every' },
      p: {
        it: '<span class="hz">这么</span>/<span class="hz">那么</span> davanti a un aggettivo vogliono dire «così» (<span class="hz">这么贵</span>, «così caro»); <span class="hz">这样</span>/<span class="hz">那样</span> «in questo/quel modo», o «fatto così». <span class="hz">每</span> «ogni» vuole un classificatore (<span class="hz">每个人</span>), tranne con <span class="hz">天</span> e <span class="hz">年</span>, e spesso <span class="hz">都</span> dopo.',
        en: '<span class="hz">这么</span>/<span class="hz">那么</span> before an adjective mean “so” (<span class="hz">这么贵</span>, “so expensive”); <span class="hz">这样</span>/<span class="hz">那样</span> “this/that way”, or “like this”. <span class="hz">每</span> “every” wants a measure word (<span class="hz">每个人</span>), except with <span class="hz">天</span> and <span class="hz">年</span>, and often <span class="hz">都</span> after it.',
      },
      ex: [
        ['今天怎么这么冷？', 'Jīntiān zěnme zhème lěng?', 'Come mai oggi fa così freddo?', 'Why is it so cold today?'],
        ['每个人都有自己的爱好。', 'Měi ge rén dōu yǒu zìjǐ de àihào.', 'Ognuno ha i suoi passatempi.', 'Everyone has their own hobbies.'],
      ],
    },
    {
      sec: 'words', sub: '形容词 · 形容词重叠', zh: 'AA、AABB',
      t: { it: "L'aggettivo ripetuto", en: 'Doubled adjectives' },
      p: {
        it: 'Ripetuto, un aggettivo diventa più vivo e descrittivo: <span class="hz">高高的</span> «bello alto», <span class="hz">快快乐乐</span> «tutto contento». Quelli di due sillabe ripetono ogni sillaba (AABB). Di solito prendono <span class="hz">的</span>, e non vogliono <span class="hz">很</span>.',
        en: 'Doubled, an adjective becomes livelier and more vivid: <span class="hz">高高的</span> “nice and tall”, <span class="hz">快快乐乐</span> “happy as can be”. Two-syllable ones double each syllable (AABB). They usually take <span class="hz">的</span>, and never <span class="hz">很</span>.',
      },
      ex: [
        ['她的眼睛大大的。', 'Tā de yǎnjing dàdà de.', 'Ha degli occhi grandi grandi.', 'Her eyes are big and round.'],
        ['孩子们快快乐乐地玩儿。', 'Háizimen kuàikuài-lèlè de wánr.', 'I bambini giocano tutti contenti.', 'The children play happily.'],
      ],
    },
    {
      sec: 'words', sub: '数词', zh: '万、好多、多', keys: ['万', '多'],
      t: { it: 'Diecimila, e «tanti»', en: 'Ten thousand, and “many”' },
      p: {
        it: 'Il cinese conta per diecimila: <span class="hz">一万</span> è 10.000, e centomila è <span class="hz">十万</span>, «dieci diecimila». <span class="hz">好多</span> «un sacco di» funziona come un numero, davanti al nome.',
        en: 'Chinese counts in ten thousands: <span class="hz">一万</span> is 10,000, and a hundred thousand is <span class="hz">十万</span>, “ten ten-thousands”. <span class="hz">好多</span> “lots of” works like a number, before the noun.',
      },
      ex: [
        ['这个手机三千块钱，不是三万。', 'Zhège shǒujī sānqiān kuài qián, bú shì sānwàn.', 'Questo telefono costa tremila yuan, non trentamila.', 'This phone is three thousand yuan, not thirty thousand.'],
        ['商场里有好多人。', 'Shāngchǎng li yǒu hǎo duō rén.', "Al centro commerciale c'è un sacco di gente.", 'There are lots of people in the mall.'],
      ],
    },
    {
      sec: 'words', sub: '量词 · 名量词 · 动量词', zh: '（1）专用名量词：条、位、间、名　（2）借用名量词：包　动量词：次', keys: ['条', '位', '间', '名', '包', '次'],
      t: { it: 'Nuovi classificatori, e 次 «volte»', en: 'More measure words, and 次 “times”' },
      p: {
        it: '<span class="hz">条</span> per le cose lunghe (strade, fiumi, pantaloni, pesci), <span class="hz">位</span> per le persone con rispetto, <span class="hz">间</span> per le stanze, <span class="hz">名</span> per le persone in un ruolo (studenti, medici); <span class="hz">包</span> «pacchetto, sacchetto». <span class="hz">次</span> invece conta le volte, e va dopo il verbo: <span class="hz">去过两次</span>.',
        en: '<span class="hz">条</span> for long things (roads, rivers, trousers, fish), <span class="hz">位</span> for people, politely, <span class="hz">间</span> for rooms, <span class="hz">名</span> for people in a role (students, doctors); <span class="hz">包</span> “packet, bag”. <span class="hz">次</span> counts times instead, and goes after the verb: <span class="hz">去过两次</span>.',
      },
      ex: [
        ['这位老师姓王。', 'Zhè wèi lǎoshī xìng Wáng.', 'Questo insegnante si chiama Wang.', "This teacher's surname is Wang."],
        ['我买了一条裤子。', 'Wǒ mǎi le yì tiáo kùzi.', 'Ho comprato un paio di pantaloni.', 'I bought a pair of trousers.'],
        ['我去过两次中国。', 'Wǒ qù guo liǎng cì Zhōngguó.', 'Sono stato in Cina due volte.', 'I have been to China twice.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 程度副词', zh: '多、好、最', keys: ['多', '好', '最'],
      t: { it: 'Quanto!, proprio, il più', en: 'How!, so, most' },
      p: {
        it: 'Davanti a un aggettivo, <span class="hz">多</span> e <span class="hz">好</span> esclamano: <span class="hz">多漂亮啊！</span> «che bello!», <span class="hz">好冷！</span> «che freddo!». <span class="hz">最</span> <i>zuì</i> fa il superlativo: <span class="hz">最好</span> «il migliore».',
        en: 'Before an adjective, <span class="hz">多</span> and <span class="hz">好</span> exclaim: <span class="hz">多漂亮啊！</span> “how lovely!”, <span class="hz">好冷！</span> “so cold!”. <span class="hz">最</span> <i>zuì</i> makes the superlative: <span class="hz">最好</span> “the best”.',
      },
      ex: [
        ['今天的天气多好啊！', 'Jīntiān de tiānqì duō hǎo a!', 'Che bel tempo oggi!', 'What lovely weather today!'],
        ['我最喜欢踢足球。', 'Wǒ zuì xǐhuan tī zúqiú.', 'Quello che mi piace di più è giocare a calcio.', 'What I like most is playing football.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 范围副词', zh: '一起', keys: ['一起'],
      t: { it: '一起: insieme', en: '一起: together' },
      p: {
        it: '<span class="hz">一起</span> <i>yìqǐ</i> «insieme» è un avverbio e sta davanti al verbo; con chi, si dice prima con <span class="hz">和</span> o <span class="hz">跟</span>: <span class="hz">跟朋友一起去</span>.',
        en: '<span class="hz">一起</span> <i>yìqǐ</i> “together” is an adverb and stands before the verb; who with comes first, with <span class="hz">和</span> or <span class="hz">跟</span>: <span class="hz">跟朋友一起去</span>.',
      },
      ex: [
        ['我们一起去吃饭吧。', 'Wǒmen yìqǐ qù chīfàn ba.', 'Andiamo a mangiare insieme.', "Let's go and eat together."],
      ],
    },
    {
      sec: 'words', sub: '副词 · 时间副词', zh: '还、已经、有时（候）、快、快要、正', keys: ['还', '已经', '有时', '快', '快要', '正'],
      t: { it: 'Ancora, già, a volte, tra poco', en: 'Still, already, sometimes, soon' },
      p: {
        it: '<span class="hz">还</span> «ancora» (qualcosa continua) e <span class="hz">已经</span> «già», spesso con <span class="hz">了</span>. <span class="hz">有时候</span> «a volte». <span class="hz">快</span> e <span class="hz">快要</span> «sta per», con <span class="hz">了</span> in fondo. <span class="hz">正</span> come <span class="hz">正在</span>: «proprio mentre».',
        en: '<span class="hz">还</span> “still” (something goes on) and <span class="hz">已经</span> “already”, often with <span class="hz">了</span>. <span class="hz">有时候</span> “sometimes”. <span class="hz">快</span> and <span class="hz">快要</span> “about to”, with <span class="hz">了</span> at the end. <span class="hz">正</span> like <span class="hz">正在</span>: “just as”.',
      },
      ex: [
        ['他已经回家了。', 'Tā yǐjīng huí jiā le.', 'È già tornato a casa.', 'He has already gone home.'],
        ['快要下雨了。', 'Kuàiyào xià yǔ le.', 'Sta per piovere.', "It's about to rain."],
        ['我有时候走路去学校。', 'Wǒ yǒushíhou zǒulù qù xuéxiào.', 'A volte vado a scuola a piedi.', 'Sometimes I walk to school.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 频率副词', zh: '常、经常', keys: ['常', '经常'],
      t: { it: '常, 经常: spesso', en: '常, 经常: often' },
      p: {
        it: '<span class="hz">经常</span> <i>jīngcháng</i>, o più breve <span class="hz">常</span>, «spesso», davanti al verbo. Al negativo si dice <span class="hz">不常</span>.',
        en: '<span class="hz">经常</span> <i>jīngcháng</i>, or just <span class="hz">常</span>, “often”, before the verb. The negative is <span class="hz">不常</span>.',
      },
      ex: [
        ['我经常去那个书店。', 'Wǒ jīngcháng qù nàge shūdiàn.', 'Vado spesso in quella libreria.', 'I often go to that bookshop.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 否定副词', zh: '别', keys: ['别'],
      t: { it: '别: non fare', en: '别: don\'t' },
      p: {
        it: '<span class="hz">别</span> <i>bié</i> è il divieto, come <span class="hz">不要</span> ma più breve e colloquiale: <span class="hz">别走！</span> «non andartene!». Con <span class="hz">了</span> in fondo vuol dire «smettila di».',
        en: '<span class="hz">别</span> <i>bié</i> forbids, like <span class="hz">不要</span> but shorter and more colloquial: <span class="hz">别走！</span> “don\'t go!”. With <span class="hz">了</span> at the end it means “stop doing”.',
      },
      ex: [
        ['别忘了你的手机。', 'Bié wàng le nǐ de shǒujī.', 'Non dimenticare il telefono.', "Don't forget your phone."],
        ['别笑了！', 'Bié xiào le!', 'Smettila di ridere!', 'Stop laughing!'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 关联副词', zh: '再、就', keys: ['再', '就'],
      t: { it: '再 «e poi» e 就 «subito»', en: '再 “and then” and 就 “right away”' },
      p: {
        it: '<span class="hz">再</span> lega due azioni future: «prima questo, poi quello» (<span class="hz">吃了饭再走</span>). <span class="hz">就</span> dice che la seconda cosa segue subito o facilmente la prima: «e allora», «subito».',
        en: '<span class="hz">再</span> links two future actions: “first this, then that” (<span class="hz">吃了饭再走</span>). <span class="hz">就</span> says the second follows the first at once or easily: “then”, “right away”.',
      },
      ex: [
        ['我们吃了饭再去吧。', 'Wǒmen chī le fàn zài qù ba.', 'Andiamo dopo aver mangiato.', "Let's go after we've eaten."],
        ['他下了课就回家了。', 'Tā xià le kè jiù huí jiā le.', 'Finita la lezione è tornato subito a casa.', 'He went straight home after class.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 语气副词', zh: '都、就、还是', keys: ['都', '就', '还是'],
      t: { it: '都 «già», 就 «proprio», 还是 «meglio»', en: '都 “already”, 就 “just”, 还是 “better”' },
      p: {
        it: 'Questi avverbi colorano la frase. <span class="hz">都……了</span> «già», con un po\' di sorpresa: <span class="hz">都十点了</span>. <span class="hz">就</span> «proprio, esattamente»: <span class="hz">这就是我家</span>. <span class="hz">还是</span> «sarebbe meglio», dopo averci pensato.',
        en: 'These adverbs colour the sentence. <span class="hz">都……了</span> “already”, with some surprise: <span class="hz">都十点了</span>. <span class="hz">就</span> “just, exactly”: <span class="hz">这就是我家</span>. <span class="hz">还是</span> “better”, after some thought.',
      },
      ex: [
        ['都十点了，快起床！', 'Dōu shí diǎn le, kuài qǐchuáng!', 'Sono già le dieci, alzati!', "It's ten o'clock already, get up!"],
        ['这就是我的学校。', 'Zhè jiù shì wǒ de xuéxiào.', 'Ecco, questa è proprio la mia scuola.', 'This is my school.'],
        ['太远了，我们还是打车吧。', 'Tài yuǎn le, wǒmen háishi dǎchē ba.', 'È troppo lontano, meglio prendere un taxi.', "It's too far, we'd better take a taxi."],
      ],
    },
    {
      sec: 'words', sub: '介词', zh: '从（时间、处所、路径）；往', keys: ['从', '往'],
      t: { it: 'Da e verso: 从 e 往', en: 'From and towards: 从 and 往' },
      p: {
        it: '<span class="hz">从</span> <i>cóng</i> «da»: il punto di partenza, nel tempo o nello spazio, o il luogo da cui si passa. <span class="hz">往</span> <i>wǎng</i> «verso»: la direzione (<span class="hz">往前走</span>, «vai dritto»). Come le altre preposizioni, stanno prima del verbo.',
        en: '<span class="hz">从</span> <i>cóng</i> “from”: the starting point, in time or space, or the place one passes through. <span class="hz">往</span> <i>wǎng</i> “towards”: the direction (<span class="hz">往前走</span>, “go straight ahead”). Like other prepositions, they come before the verb.',
      },
      ex: [
        ['我从小就喜欢画画儿。', 'Wǒ cóngxiǎo jiù xǐhuan huà huàr.', 'Fin da piccolo mi piace disegnare.', "I've liked drawing since I was little."],
        ['往前走，就到车站了。', 'Wǎng qián zǒu, jiù dào chēzhàn le.', 'Vai dritto e arrivi alla stazione.', 'Go straight on and you reach the station.'],
      ],
    },
    {
      sec: 'words', sub: '介词 · 引出对象', zh: '给、比、跟', keys: ['给', '比', '跟'],
      t: { it: 'Per, che, con: 给, 比, 跟', en: 'For, than, with: 给, 比, 跟' },
      p: {
        it: '<span class="hz">给</span> «a, per» indica chi riceve: <span class="hz">给你打电话</span> «telefonarti». <span class="hz">比</span> fa i paragoni (vedi più sotto). <span class="hz">跟</span> «con» è come <span class="hz">和</span>, più parlato: <span class="hz">跟朋友说话</span>.',
        en: '<span class="hz">给</span> “to, for” marks who receives: <span class="hz">给你打电话</span> “call you”. <span class="hz">比</span> makes comparisons (see below). <span class="hz">跟</span> “with” is like <span class="hz">和</span>, more spoken: <span class="hz">跟朋友说话</span>.',
      },
      ex: [
        ['晚上我给你打电话。', 'Wǎnshang wǒ gěi nǐ dǎ diànhuà.', 'Stasera ti telefono.', "I'll call you tonight."],
        ['我跟妈妈一起去商场。', 'Wǒ gēn māma yìqǐ qù shāngchǎng.', 'Vado al centro commerciale con la mamma.', "I'm going to the mall with Mum."],
      ],
    },
    {
      sec: 'words', sub: '介词 · 连词', zh: '因为；跟；但、但是、那、虽然、还是、所以', keys: ['因为', '跟', '但', '但是', '那', '虽然', '还是', '所以'],
      t: { it: 'Congiunzioni: ma, perché, quindi, oppure', en: 'Conjunctions: but, because, so, or' },
      p: {
        it: '<span class="hz">但是</span> (o <span class="hz">但</span>) «ma», <span class="hz">因为</span> «perché» e <span class="hz">所以</span> «quindi», <span class="hz">虽然</span> «sebbene» legano due frasi, spesso in coppia (vedi le frasi complesse). <span class="hz">那</span> all\'inizio vuol dire «allora». <span class="hz">还是</span> «oppure» sta nelle domande; <span class="hz">跟</span> «e» unisce due nomi, come <span class="hz">和</span>.',
        en: '<span class="hz">但是</span> (or <span class="hz">但</span>) “but”, <span class="hz">因为</span> “because” and <span class="hz">所以</span> “so”, <span class="hz">虽然</span> “although” join two clauses, often in pairs (see complex sentences). <span class="hz">那</span> at the start means “then, in that case”. <span class="hz">还是</span> “or” belongs in questions; <span class="hz">跟</span> “and” joins two nouns, like <span class="hz">和</span>.',
      },
      ex: [
        ['我想去，但是没有时间。', 'Wǒ xiǎng qù, dànshì méiyǒu shíjiān.', 'Vorrei andarci, ma non ho tempo.', "I'd like to go, but I have no time."],
        ['你不想去？那我自己去吧。', 'Nǐ bù xiǎng qù? Nà wǒ zìjǐ qù ba.', 'Non vuoi andarci? Allora vado da solo.', "You don't want to go? Then I'll go on my own."],
      ],
    },
    {
      sec: 'words', sub: '助词 · 结构助词', zh: '得、地', keys: ['得', '地'],
      t: { it: '得 e 地, due «de»', en: '得 and 地, two more “de”' },
      p: {
        it: 'Si pronunciano entrambi <i>de</i>, come <span class="hz">的</span>, ma servono ad altro. <span class="hz">地</span> lega al verbo un modo di fare, prima: <span class="hz">慢慢地走</span> «camminare piano». <span class="hz">得</span> introduce dopo il verbo come riesce l\'azione: <span class="hz">说得很好</span> «parla bene».',
        en: 'Both sound <i>de</i>, like <span class="hz">的</span>, but do other jobs. <span class="hz">地</span> ties a manner to the verb, before it: <span class="hz">慢慢地走</span> “walk slowly”. <span class="hz">得</span> brings in, after the verb, how the action turns out: <span class="hz">说得很好</span> “speaks well”.',
      },
      ex: [
        ['他高兴地笑了。', 'Tā gāoxìng de xiào le.', 'Ha sorriso contento.', 'He smiled happily.'],
        ['她汉语说得很好。', 'Tā Hànyǔ shuō de hěn hǎo.', 'Parla molto bene il cinese.', 'She speaks Chinese very well.'],
      ],
    },
    {
      sec: 'words', sub: '助词 · 动态助词 · 语气助词', zh: '过、着；呢、吧、的、啊', keys: ['过', '着', '呢', '吧', '的', '啊'],
      t: { it: 'Nuove particelle', en: 'More particles' },
      p: {
        it: '<span class="hz">过</span> e <span class="hz">着</span> dopo il verbo indicano l\'esperienza e la durata (vedi l\'aspetto, più sotto). In fondo alla frase: <span class="hz">呢</span> insiste su un fatto («e invece è così»), <span class="hz">吧</span> invita o suppone, <span class="hz">的</span> afferma con sicurezza, <span class="hz">啊</span> (<i>a</i>) aggiunge calore o enfasi.',
        en: '<span class="hz">过</span> and <span class="hz">着</span> after the verb mark experience and duration (see aspect, below). At the end of a sentence: <span class="hz">呢</span> insists on a fact (“it is so, you know”), <span class="hz">吧</span> invites or supposes, <span class="hz">的</span> affirms with certainty, <span class="hz">啊</span> (<i>a</i>) adds warmth or stress.',
      },
      ex: [
        ['他会来的。', 'Tā huì lái de.', 'Verrà, vedrai.', "He'll come, I'm sure."],
        ['你快来啊！', 'Nǐ kuài lái a!', 'Dai, vieni!', 'Come on, hurry up!'],
      ],
    },

    // ---------- 短语 ----------
    {
      sec: 'phrases', sub: '结构类型', zh: '动补短语；“的”字短语；连谓短语；兼语短语',
      t: { it: 'Altri modi di combinare le parole', en: 'More ways words combine' },
      p: {
        it: '<b>Verbo + complemento</b>: dopo il verbo, il suo risultato (<span class="hz">看完</span> «finire di leggere»). <b>Sintagma con 的</b> senza nome: <span class="hz">红的</span> «quello rosso», <span class="hz">我的</span> «il mio». <b>Verbi in fila</b> (già visti). <b>Verbo a doppio ruolo</b>: l\'oggetto del primo verbo fa da soggetto al secondo (<span class="hz">请他来</span>, «invitarlo a venire»).',
        en: '<b>Verb + complement</b>: after the verb, its result (<span class="hz">看完</span> “finish reading”). <b>的 phrase</b> without a noun: <span class="hz">红的</span> “the red one”, <span class="hz">我的</span> “mine”. <b>Verbs in a row</b> (seen already). <b>Pivot</b>: the object of the first verb is the subject of the second (<span class="hz">请他来</span>, “ask him to come”).',
      },
      ex: [
        ['我不要黑色的，我要红色的。', 'Wǒ bú yào hēisè de, wǒ yào hóngsè de.', 'Non voglio quello nero, voglio quello rosso.', "I don't want the black one, I want the red one."],
      ],
    },
    {
      sec: 'phrases', sub: '固定短语 · 固定格式', zh: '什么的；还是……吧；要/快要/就要……了；都……了', keys: ['什么', '还是', '快要'],
      t: { it: 'Espressioni fisse', en: 'Set expressions' },
      p: {
        it: '<span class="hz">什么的</span> in fondo a un elenco: «eccetera». <span class="hz">还是……吧</span>: «sarebbe meglio…». <span class="hz">要……了</span>, <span class="hz">快要……了</span>, <span class="hz">就要……了</span>: «sta per…», dal più generico al più imminente. <span class="hz">都……了</span>: «già…!».',
        en: '<span class="hz">什么的</span> at the end of a list: “and so on”. <span class="hz">还是……吧</span>: “we\'d better…”. <span class="hz">要……了</span>, <span class="hz">快要……了</span>, <span class="hz">就要……了</span>: “about to…”, from vaguest to most imminent. <span class="hz">都……了</span>: “already…!”.',
      },
      ex: [
        ['我买了苹果、牛奶什么的。', 'Wǒ mǎi le píngguǒ, niúnǎi shénme de.', 'Ho comprato mele, latte e così via.', 'I bought apples, milk and so on.'],
        ['火车就要开了。', 'Huǒchē jiù yào kāi le.', 'Il treno sta per partire.', 'The train is about to leave.'],
      ],
    },

    // ---------- 句子成分 ----------
    {
      sec: 'parts', sub: '主语 · 谓语 · 定语', zh: '受事主语；名词性短语作谓语；动词性短语、主谓短语作定语',
      t: { it: "L'oggetto in testa, e frasi che descrivono", en: 'The object first, and clauses that describe' },
      p: {
        it: 'Ciò di cui si parla può aprire la frase anche se è l\'oggetto: <span class="hz">作业做完了</span>, «i compiti, (li ho) finiti». E per descrivere un nome si può mettere davanti, con <span class="hz">的</span>, un verbo o un\'intera frase: <span class="hz">我买的书</span> «il libro che ho comprato».',
        en: 'What the sentence is about can open it even when it is the object: <span class="hz">作业做完了</span>, “the homework, (I\'ve) finished”. And to describe a noun, a verb or a whole clause can go before it, with <span class="hz">的</span>: <span class="hz">我买的书</span> “the book I bought”.',
      },
      ex: [
        ['你的书我看完了。', 'Nǐ de shū wǒ kàn wán le.', 'Il tuo libro l\'ho finito.', "Your book, I've finished it."],
        ['昨天来的那个人是谁？', 'Zuótiān lái de nàge rén shì shéi?', "Chi era quella persona che è venuta ieri?", 'Who was the person who came yesterday?'],
      ],
    },
    {
      sec: 'parts', sub: '补语 · 结果补语', zh: '动词+错/懂/好/会/完', keys: ['错', '懂', '好', '会', '完'],
      t: { it: 'Il risultato dopo il verbo', en: 'The result after the verb' },
      p: {
        it: 'Il cinese distingue fare e riuscire: <span class="hz">听</span> è «ascoltare», <span class="hz">听懂</span> «ascoltare e capire». Dopo il verbo si mette il risultato: <span class="hz">错</span> sbagliato, <span class="hz">懂</span> capito, <span class="hz">好</span> fatto bene, pronto, <span class="hz">会</span> imparato, <span class="hz">完</span> finito. Al negativo si usa <span class="hz">没</span>: <span class="hz">没听懂</span>.',
        en: 'Chinese tells doing from succeeding: <span class="hz">听</span> is “listen”, <span class="hz">听懂</span> “listen and understand”. The result goes after the verb: <span class="hz">错</span> wrong, <span class="hz">懂</span> understood, <span class="hz">好</span> done, ready, <span class="hz">会</span> learnt, <span class="hz">完</span> finished. The negative takes <span class="hz">没</span>: <span class="hz">没听懂</span>.',
      },
      ex: [
        ['对不起，我没听懂。', 'Duìbuqǐ, wǒ méi tīng dǒng.', 'Scusa, non ho capito.', "Sorry, I didn't understand."],
        ['这个字你写错了。', 'Zhège zì nǐ xiě cuò le.', 'Questo carattere l\'hai scritto sbagliato.', "You've written this character wrong."],
      ],
    },
    {
      sec: 'parts', sub: '补语 · 趋向补语', zh: '动词+来/去；动词+上/下/进/出/过/回；动词+出来/出去/过来/过去/回来/回去/进来/进去/起来/上来/上去/下来/下去', keys: ['来', '去', '出来', '回来', '进去', '起来'],
      t: { it: 'La direzione dopo il verbo', en: 'The direction after the verb' },
      p: {
        it: 'Dopo un verbo di movimento si dice la direzione. <span class="hz">来</span> è verso chi parla, <span class="hz">去</span> lontano da chi parla: <span class="hz">进来</span> «entra (qui)», <span class="hz">进去</span> «entra (là)». Le direzioni (<span class="hz">上</span>, <span class="hz">下</span>, <span class="hz">进</span>, <span class="hz">出</span>, <span class="hz">过</span>, <span class="hz">回</span>, <span class="hz">起</span>) si combinano con <span class="hz">来</span>/<span class="hz">去</span>: <span class="hz">走回来</span> «tornare indietro (qui) a piedi».',
        en: 'After a verb of motion comes the direction. <span class="hz">来</span> is towards the speaker, <span class="hz">去</span> away from them: <span class="hz">进来</span> “come in”, <span class="hz">进去</span> “go in”. The directions (<span class="hz">上</span>, <span class="hz">下</span>, <span class="hz">进</span>, <span class="hz">出</span>, <span class="hz">过</span>, <span class="hz">回</span>, <span class="hz">起</span>) combine with <span class="hz">来</span>/<span class="hz">去</span>: <span class="hz">走回来</span> “walk back (here)”.',
      },
      ex: [
        ['请进来！', 'Qǐng jìnlai!', 'Entra, prego!', 'Please come in!'],
        ['他从教室跑出去了。', 'Tā cóng jiàoshì pǎo chūqu le.', "È uscito di corsa dall'aula.", 'He ran out of the classroom.'],
      ],
    },
    {
      sec: 'parts', sub: '补语 · 状态补语', zh: '动词+得+形容词性短语', keys: ['得'],
      t: { it: 'Come riesce l\'azione: 得', en: 'How it turns out: 得' },
      p: {
        it: 'Per giudicare come si fa qualcosa (bene, in fretta, tardi) si mette dopo il verbo <span class="hz">得</span> e un aggettivo: <span class="hz">跑得快</span> «corre veloce». Se c\'è un oggetto, il verbo si ripete o l\'oggetto va prima: <span class="hz">他汉语说得很好</span>.',
        en: 'To judge how something is done (well, fast, late), put <span class="hz">得</span> and an adjective after the verb: <span class="hz">跑得快</span> “runs fast”. With an object, the verb repeats or the object comes first: <span class="hz">他汉语说得很好</span>.',
      },
      ex: [
        ['你今天来得很早。', 'Nǐ jīntiān lái de hěn zǎo.', 'Oggi sei arrivato presto.', "You're early today."],
        ['他写字写得很好看。', 'Tā xiě zì xiě de hěn hǎokàn.', 'Scrive i caratteri molto bene.', 'He writes characters beautifully.'],
      ],
    },
    {
      sec: 'parts', sub: '补语 · 数量补语', zh: '表示动作持续的时间；形容词+数量补语',
      t: { it: 'Per quanto tempo, di quanto', en: 'For how long, by how much' },
      p: {
        it: 'Anche la durata va dopo il verbo: <span class="hz">学了两年</span>, «ha studiato per due anni». Dopo un aggettivo, un numero dice di quanto: <span class="hz">大两岁</span>, «più grande di due anni».',
        en: 'A length of time goes after the verb too: <span class="hz">学了两年</span>, “studied for two years”. After an adjective, a number says by how much: <span class="hz">大两岁</span>, “two years older”.',
      },
      ex: [
        ['我学了两年汉语。', 'Wǒ xué le liǎng nián Hànyǔ.', 'Ho studiato cinese per due anni.', 'I studied Chinese for two years.'],
        ['哥哥比我大三岁。', 'Gēge bǐ wǒ dà sān suì.', 'Mio fratello ha tre anni più di me.', 'My brother is three years older than me.'],
      ],
    },

    // ---------- 句子的类型 ----------
    {
      sec: 'types', sub: '单句 · 主谓谓语句', zh: '主谓句4：主谓谓语句',
      t: { it: 'Un tema, e una frase su di esso', en: 'A topic, and a sentence about it' },
      p: {
        it: 'Il predicato può essere a sua volta una frase con il suo soggetto: <span class="hz">他身体很好</span>, alla lettera «lui, il corpo è buono», cioè «sta bene di salute». La prima parte dice di che cosa si parla, la seconda che cosa se ne dice.',
        en: 'The predicate can itself be a clause with its own subject: <span class="hz">他身体很好</span>, literally “he, body is good”, that is “he is in good health”. The first part says what we are talking about, the second what we say of it.',
      },
      ex: [
        ['他身体很好。', 'Tā shēntǐ hěn hǎo.', 'Sta bene di salute.', 'He is in good health.'],
        ['这个商场东西很便宜。', 'Zhège shāngchǎng dōngxi hěn piányi.', 'In questo centro commerciale la roba costa poco.', 'Things are cheap in this mall.'],
      ],
    },
    {
      sec: 'types', sub: '句类', zh: '用“还是”连接的选择问句；用“别”的祈使句', keys: ['还是', '别'],
      t: { it: 'Domande con «oppure», divieti con 别', en: 'Questions with “or”, bans with 別' },
      p: {
        it: 'Per chiedere di scegliere tra due cose: «A <span class="hz">还是</span> B?», senza <span class="hz">吗</span>. Nelle affermazioni, «oppure» è un\'altra parola (<span class="hz">或者</span>, al livello 3).',
        en: 'To ask for a choice between two things: “A <span class="hz">还是</span> B?”, with no <span class="hz">吗</span>. In statements, “or” is another word (<span class="hz">或者</span>, at level 3).',
      },
      ex: [
        ['你喝红茶还是绿茶？', 'Nǐ hē hóngchá háishi lǜchá?', 'Bevi tè nero o tè verde?', 'Will you have black tea or green tea?'],
        ['别说话了，上课了。', 'Bié shuōhuà le, shàngkè le.', 'Basta chiacchierare, comincia la lezione.', "Stop talking, class has started."],
      ],
    },
    {
      sec: 'types', sub: '“是”字句 · “有”字句', zh: '是：表示说明或特征；有：表示达到', keys: ['是', '有'],
      t: { it: 'Altri usi di 是 e 有', en: 'More uses of 是 and 有' },
      p: {
        it: '<span class="hz">是</span> serve anche a spiegare o a descrivere una caratteristica: <span class="hz">他是黑头发</span>, «ha i capelli neri». <span class="hz">有</span> davanti a una misura vuol dire «arrivare a»: <span class="hz">他有一米八</span>, «è alto un metro e ottanta».',
        en: '<span class="hz">是</span> can also explain or describe a feature: <span class="hz">他是黑头发</span>, “he has black hair”. <span class="hz">有</span> before a measure means “come up to”: <span class="hz">他有一米八</span>, “he is one metre eighty”.',
      },
      ex: [
        ['我是坐公交车来的，他是走路来的。', 'Wǒ shì zuò gōngjiāochē lái de, tā shì zǒulù lái de.', 'Io sono venuto in autobus, lui a piedi.', 'I came by bus, he came on foot.'],
        ['从这儿到机场有多远？', 'Cóng zhèr dào jīchǎng yǒu duō yuǎn?', "Quanto c'è da qui all'aeroporto?", 'How far is it from here to the airport?'],
      ],
    },
    {
      sec: 'types', sub: '存现句', zh: '处所+动词+着(+数量短语)+名词', keys: ['着'],
      t: { it: 'In un luogo sta…', en: 'In a place there sits…' },
      p: {
        it: 'Al posto di <span class="hz">有</span>, il verbo che dice come sta la cosa, con <span class="hz">着</span>: «sul tavolo sta posato un libro». Il luogo apre la frase, la cosa la chiude.',
        en: 'Instead of <span class="hz">有</span>, the verb that says how the thing is, with <span class="hz">着</span>: “on the table lies a book”. The place opens the sentence, the thing closes it.',
      },
      ex: [
        ['门口站着一个人。', 'Ménkǒu zhàn zhe yí ge rén.', "Sulla porta c'è una persona in piedi.", 'Someone is standing at the door.'],
        ['椅子上坐着一个小孩儿。', 'Yǐzi shang zuò zhe yí ge xiǎoháir.', 'Sulla sedia è seduto un bambino.', 'A child is sitting on the chair.'],
      ],
    },
    {
      sec: 'types', sub: '比较句', zh: 'A比B+形容词（+数量补语/程度补语）；A有/没有B（+这么/那么）+形容词；A比B+动词+得+形容词', keys: ['比', '没有'],
      t: { it: 'I paragoni con 比', en: 'Comparisons with 比' },
      p: {
        it: '«A è più alto di B» si dice <b>A <span class="hz">比</span> B + aggettivo</b>, senza <span class="hz">很</span>. Di quanto, dopo: <span class="hz">比我高一点儿</span>, <span class="hz">高多了</span> «molto più alto». «Non è alto come B»: <b>A <span class="hz">没有</span> B (那么) + aggettivo</b>. Con un verbo: <span class="hz">他跑得比我快</span>, «corre più veloce di me».',
        en: '“A is taller than B” is <b>A <span class="hz">比</span> B + adjective</b>, with no <span class="hz">很</span>. By how much, after: <span class="hz">比我高一点儿</span>, <span class="hz">高多了</span> “much taller”. “Not as tall as B”: <b>A <span class="hz">没有</span> B (那么) + adjective</b>. With a verb: <span class="hz">他跑得比我快</span>, “he runs faster than me”.',
      },
      ex: [
        ['今天比昨天冷。', 'Jīntiān bǐ zuótiān lěng.', 'Oggi fa più freddo di ieri.', "It's colder today than yesterday."],
        ['我没有他那么高。', 'Wǒ méiyǒu tā nàme gāo.', 'Non sono alto come lui.', "I'm not as tall as him."],
        ['他跑得比我快多了。', 'Tā pǎo de bǐ wǒ kuài duō le.', 'Corre molto più veloce di me.', 'He runs much faster than me.'],
      ],
    },
    {
      sec: 'types', sub: '“是……的”句', zh: '强调时间、地点、方式、动作者', keys: ['是', '的'],
      t: { it: '是……的: quando, dove, come', en: '是……的: when, where, how' },
      p: {
        it: 'Per un fatto già avvenuto, quando quello che interessa è un dettaglio (quando, dove, come, chi), lo si mette tra <span class="hz">是</span> e <span class="hz">的</span>: «è <i>ieri</i> che sono arrivato». <span class="hz">是</span> si può omettere, <span class="hz">的</span> no.',
        en: 'For something already done, when the point is a detail (when, where, how, who), that detail goes between <span class="hz">是</span> and <span class="hz">的</span>: “it was <i>yesterday</i> that I came”. <span class="hz">是</span> may be dropped, <span class="hz">的</span> may not.',
      },
      ex: [
        ['你是什么时候来的？', 'Nǐ shì shénme shíhou lái de?', 'Quando sei arrivato?', 'When did you get here?'],
        ['我是坐飞机来的。', 'Wǒ shì zuò fēijī lái de.', 'Sono venuto in aereo.', 'I came by plane.'],
      ],
    },
    {
      sec: 'types', sub: '兼语句 · 双宾语句', zh: '主语+请/叫/让……+宾语1+动词+宾语2；主语+动词+给+宾语1+宾语2', keys: ['请', '叫', '让', '给'],
      t: { it: 'Far fare, e dare a qualcuno', en: 'Getting someone to do, and giving' },
      p: {
        it: 'Con <span class="hz">请</span> «invitare», <span class="hz">叫</span> e <span class="hz">让</span> «far fare, dire di», la persona è insieme l\'oggetto del primo verbo e il soggetto del secondo: «mamma dice a me di comprare il pane». E molti verbi di passaggio prendono <span class="hz">给</span> prima di chi riceve: <span class="hz">送给他</span>, «regalare a lui».',
        en: 'With <span class="hz">请</span> “invite”, <span class="hz">叫</span> and <span class="hz">让</span> “have, tell to”, the person is both the object of the first verb and the subject of the second: “Mum tells me to buy bread”. And many verbs of handing over take <span class="hz">给</span> before the receiver: <span class="hz">送给他</span>, “give to him”.',
      },
      ex: [
        ['妈妈让我去买面包。', 'Māma ràng wǒ qù mǎi miànbāo.', 'La mamma mi ha mandato a comprare il pane.', 'Mum told me to go and buy bread.'],
        ['我送给她一本书。', 'Wǒ sòng gěi tā yì běn shū.', 'Le ho regalato un libro.', 'I gave her a book.'],
      ],
    },

    // ---------- 复句 ----------
    {
      sec: 'complex', sub: '选择复句 · 转折复句 · 因果复句', zh: '（是）……，还是……；虽然……，但是……；因为……，所以……', keys: ['还是', '虽然', '但是', '因为', '所以'],
      t: { it: 'Oppure, sebbene, perché: le coppie', en: 'Or, although, because: the pairs' },
      p: {
        it: 'Il cinese ama le congiunzioni in coppia, una per frase: <span class="hz">虽然……，但是……</span> «sebbene…, (ma)…», <span class="hz">因为……，所以……</span> «poiché…, (quindi)…». In italiano la seconda si tace; in cinese no, ed è la prima che può cadere.',
        en: 'Chinese likes conjunctions in pairs, one per clause: <span class="hz">虽然……，但是……</span> “although…, (but)…”, <span class="hz">因为……，所以……</span> “because…, (so)…”. English drops the second; Chinese does not, and it is the first that may go.',
      },
      ex: [
        ['虽然很累，但是我很高兴。', 'Suīrán hěn lèi, dànshì wǒ hěn gāoxìng.', 'Sono stanco, ma contento.', "I'm tired, but happy."],
        ['因为下雨，所以我没去。', 'Yīnwèi xià yǔ, suǒyǐ wǒ méi qù.', 'Non ci sono andato perché pioveva.', "I didn't go because it was raining."],
        ['你是今天走，还是明天走？', 'Nǐ shì jīntiān zǒu, háishi míngtiān zǒu?', 'Parti oggi o domani?', 'Are you leaving today or tomorrow?'],
      ],
    },
    {
      sec: 'complex', sub: '紧缩复句', zh: '一……就……', keys: ['一', '就'],
      t: { it: '一……就……: appena… subito', en: '一……就……: as soon as' },
      p: {
        it: '<span class="hz">一</span> davanti al primo verbo e <span class="hz">就</span> davanti al secondo: «appena succede A, succede B».',
        en: '<span class="hz">一</span> before the first verb and <span class="hz">就</span> before the second: “as soon as A happens, B does”.',
      },
      ex: [
        ['他一回家就睡觉了。', 'Tā yì huí jiā jiù shuìjiào le.', 'Appena tornato a casa è andato a dormire.', 'He went to bed as soon as he got home.'],
      ],
    },

    // ---------- 动作的态 ----------
    {
      sec: 'aspect', sub: '持续态', zh: '动词+着：表示状态的持续；表示动作的持续', keys: ['着'],
      t: { it: '着: uno stato che dura', en: '着: a lasting state' },
      p: {
        it: '<span class="hz">着</span> <i>zhe</i> dopo il verbo dice che una situazione dura: la porta <span class="hz">开着</span> «è aperta», lui <span class="hz">穿着</span> una giacca «indossa». Con due verbi, il primo con <span class="hz">着</span> fa da sfondo al secondo: <span class="hz">笑着说</span>, «dire sorridendo».',
        en: '<span class="hz">着</span> <i>zhe</i> after the verb says a situation lasts: the door <span class="hz">开着</span> “is open”, he <span class="hz">穿着</span> a jacket, “is wearing”. With two verbs, the first with <span class="hz">着</span> is the background to the second: <span class="hz">笑着说</span>, “say with a smile”.',
      },
      ex: [
        ['门开着，你进来吧。', 'Mén kāi zhe, nǐ jìnlai ba.', 'La porta è aperta, entra pure.', 'The door is open, come in.'],
        ['她笑着说：“没关系。”', 'Tā xiào zhe shuō: “Méi guānxi.”', 'Disse sorridendo: «Non importa».', 'She said with a smile: “It doesn\'t matter.”'],
      ],
    },
    {
      sec: 'aspect', sub: '经历态', zh: '用动态助词“过”表示', keys: ['过'],
      t: { it: '过: averlo già fatto', en: '过: having done it before' },
      p: {
        it: '<span class="hz">过</span> <i>guo</i> dopo il verbo dice che una cosa è stata fatta almeno una volta nella vita: un\'esperienza. Al negativo: <span class="hz">没……过</span>, «non è mai successo».',
        en: '<span class="hz">过</span> <i>guo</i> after the verb says something has been done at least once: an experience. Negative: <span class="hz">没……过</span>, “never have”.',
      },
      ex: [
        ['你去过中国吗？', 'Nǐ qù guo Zhōngguó ma?', 'Sei mai stato in Cina?', 'Have you ever been to China?'],
        ['我没吃过饺子。', 'Wǒ méi chī guo jiǎozi.', 'Non ho mai mangiato i ravioli cinesi.', "I've never had dumplings."],
      ],
    },

    // ---------- 特殊表达法 ----------
    {
      sec: 'special', sub: '数的表达法', zh: '序数：数词+量词；概数：几；数词+多+量词；数词+量词+多', keys: ['几', '多'],
      t: { it: 'Numeri d\'ordine senza 第, e numeri approssimati', en: 'Ordinals without 第, and rough numbers' },
      p: {
        it: 'Spesso l\'ordinale non vuole <span class="hz">第</span>: <span class="hz">三楼</span> «terzo piano», <span class="hz">二号</span> «il numero due». Per un numero approssimato: <span class="hz">几</span> «qualche» (<span class="hz">几十个</span>, «qualche decina»); <span class="hz">多</span> «e passa», prima del classificatore dopo le decine (<span class="hz">二十多个</span>), dopo con un numero sotto il dieci (<span class="hz">一个多月</span>, «poco più di un mese»).',
        en: 'Ordinals often go without <span class="hz">第</span>: <span class="hz">三楼</span> “third floor”, <span class="hz">二号</span> “number two”. For a rough number: <span class="hz">几</span> “a few” (<span class="hz">几十个</span>, “a few dozen”); <span class="hz">多</span> “odd”, before the measure word after tens (<span class="hz">二十多个</span>), after it with a number under ten (<span class="hz">一个多月</span>, “a month or so”).',
      },
      ex: [
        ['我们班有二十多个学生。', 'Wǒmen bān yǒu èrshí duō ge xuésheng.', 'Nella nostra classe ci sono più di venti studenti.', 'There are twenty-odd students in our class.'],
        ['他在中国住了一个多月。', 'Tā zài Zhōngguó zhù le yí ge duō yuè.', 'È stato in Cina poco più di un mese.', 'He stayed in China a little over a month.'],
      ],
    },
  ],
  3: [
    // ---------- 语素 ----------
    {
      sec: 'morph', sub: '前缀 · 后缀', zh: '老—；—家、—子、—员', keys: ['老', '家', '子', '员'],
      t: { it: '老 davanti, 家, 子, 员 dietro', en: '老 in front, 家, 子, 员 behind' },
      p: {
        it: '<span class="hz">老</span> davanti a un cognome è il modo familiare e rispettoso di chiamare una persona più anziana: <span class="hz">老王</span>. Dietro: <span class="hz">家</span> fa chi è maestro in qualcosa (<span class="hz">画家</span> «pittore»), <span class="hz">员</span> chi ha un ruolo (<span class="hz">运动员</span> «atleta»), <span class="hz">子</span> fa nomi di oggetti (<span class="hz">桌子</span>, <span class="hz">筷子</span>).',
        en: '<span class="hz">老</span> before a surname is the familiar, respectful way to address someone older: <span class="hz">老王</span>. Behind: <span class="hz">家</span> makes a master of something (<span class="hz">画家</span> “painter”), <span class="hz">员</span> someone in a role (<span class="hz">运动员</span> “athlete”), <span class="hz">子</span> names of things (<span class="hz">桌子</span>, <span class="hz">筷子</span>).',
      },
      ex: [
        ['老王是我的同事。', 'Lǎo Wáng shì wǒ de tóngshì.', 'Lao Wang è un mio collega.', 'Lao Wang is a colleague of mine.'],
        ['他想当运动员。', 'Tā xiǎng dāng yùndòngyuán.', "Vuole fare l'atleta.", 'He wants to be an athlete.'],
      ],
    },

    // ---------- 词类 ----------
    {
      sec: 'words', sub: '名词 · 方位名词', zh: '东、南、西、北、北方、东方、南方、西方、中间', keys: ['东', '南', '西', '北', '北方', '东方', '南方', '西方', '中间'],
      t: { it: 'I punti cardinali, e «in mezzo»', en: 'The compass points, and “in the middle”' },
      p: {
        it: 'I punti cardinali si combinano partendo da est o ovest: <span class="hz">东北</span> «nord-est», <span class="hz">西南</span> «sud-ovest». <span class="hz">北方</span>, <span class="hz">南方</span> sono il Nord e il Sud di un paese; <span class="hz">东方</span>, <span class="hz">西方</span> anche l\'Oriente e l\'Occidente. <span class="hz">中间</span> «in mezzo», dopo il nome come le altre parole di posizione.',
        en: 'Compass points combine starting from east or west: <span class="hz">东北</span> “north-east”, <span class="hz">西南</span> “south-west”. <span class="hz">北方</span>, <span class="hz">南方</span> are a country\'s North and South; <span class="hz">东方</span>, <span class="hz">西方</span> also the East and the West. <span class="hz">中间</span> “in the middle”, after the noun like the other position words.',
      },
      ex: [
        ['他是南方人，不习惯北方的冬天。', 'Tā shì nánfāng rén, bù xíguàn běifāng de dōngtiān.', "È del Sud, non è abituato all'inverno del Nord.", "He's a southerner, not used to northern winters."],
        ['公园在两条马路中间。', 'Gōngyuán zài liǎng tiáo mǎlù zhōngjiān.', 'Il parco è tra due strade.', 'The park is between two roads.'],
      ],
    },
    {
      sec: 'words', sub: '动词 · 能愿动词', zh: '需要、该、应该、愿意、得', keys: ['需要', '该', '应该', '愿意', '得'],
      t: { it: 'Dovere e volere', en: 'Must, should, be willing' },
      p: {
        it: '<span class="hz">应该</span> (o <span class="hz">该</span>) «dovere», come consiglio o come ciò che è giusto. <span class="hz">得</span> <i>děi</i> «dovere» per forza, nel parlato; il suo negativo è <span class="hz">不用</span>. <span class="hz">需要</span> «avere bisogno di». <span class="hz">愿意</span> «essere disposto a, volere volentieri».',
        en: '<span class="hz">应该</span> (or <span class="hz">该</span>) “should”, as advice or what is right. <span class="hz">得</span> <i>děi</i> “have to”, in speech; its negative is <span class="hz">不用</span>. <span class="hz">需要</span> “need to”. <span class="hz">愿意</span> “be willing to”.',
      },
      ex: [
        ['你应该多锻炼身体。', 'Nǐ yīnggāi duō duànliàn shēntǐ.', 'Dovresti fare più movimento.', 'You should exercise more.'],
        ['太晚了，我得走了。', 'Tài wǎn le, wǒ děi zǒu le.', 'È tardi, devo andare.', "It's late, I have to go."],
        ['你愿意跟我一起去吗？', 'Nǐ yuànyì gēn wǒ yìqǐ qù ma?', 'Vuoi venire con me?', 'Would you like to come with me?'],
      ],
    },
    {
      sec: 'words', sub: '动词 · 离合词', zh: '动宾式：放假、见面、结婚、洗澡；动补式：离开、完成、分开', keys: ['放假', '见面', '结婚', '洗澡', '离开', '完成', '分开'],
      t: { it: 'Verbi separabili: con oggetto e con risultato', en: 'Separable verbs: with an object, with a result' },
      p: {
        it: 'Alcuni sono verbo + oggetto: <span class="hz">见面</span> «vedersi» è «vedere-faccia», quindi «vedersi con lui» è <span class="hz">跟他见面</span>, e la durata va in mezzo (<span class="hz">放三天假</span>). Altri sono verbo + risultato, come <span class="hz">离开</span> «andarsene»: in mezzo ci va <span class="hz">得</span> o <span class="hz">不</span>, «riuscire o no» (<span class="hz">离不开</span>, «non poter fare a meno»).',
        en: 'Some are verb + object: <span class="hz">见面</span> “meet” is “see-face”, so “meet him” is <span class="hz">跟他见面</span>, and durations go inside (<span class="hz">放三天假</span>). Others are verb + result, like <span class="hz">离开</span> “leave”: <span class="hz">得</span> or <span class="hz">不</span> go inside, “can or can\'t” (<span class="hz">离不开</span>, “can\'t do without”).',
      },
      ex: [
        ['我明天跟朋友见面。', 'Wǒ míngtiān gēn péngyou jiànmiàn.', 'Domani vedo un amico.', "I'm meeting a friend tomorrow."],
        ['我们放了一个星期的假。', 'Wǒmen fàng le yí ge xīngqī de jià.', 'Abbiamo fatto una settimana di vacanza.', 'We had a week off.'],
      ],
    },
    {
      sec: 'words', sub: '代词 · 疑问代词', zh: '怎样；任指：疑问代词+都……、疑问代词+疑问代词；不定指', keys: ['怎样', '谁', '什么', '哪儿'],
      t: { it: 'Parole interrogative che non chiedono', en: 'Question words that ask nothing' },
      p: {
        it: '<span class="hz">怎样</span> è un <span class="hz">怎么样</span> più scritto. Le parole interrogative hanno anche usi non interrogativi: con <span class="hz">都</span> o <span class="hz">也</span> vogliono dire «qualunque» (<span class="hz">谁都知道</span> «lo sanno tutti»); ripetute, legano due frasi (<span class="hz">你去哪儿，我就去哪儿</span>, «dove vai tu, vado io»); da sole, «qualcosa», «qualcuno».',
        en: '<span class="hz">怎样</span> is a more written <span class="hz">怎么样</span>. Question words also work as non-questions: with <span class="hz">都</span> or <span class="hz">也</span> they mean “any” (<span class="hz">谁都知道</span> “everyone knows”); repeated, they link two clauses (<span class="hz">你去哪儿，我就去哪儿</span>, “wherever you go, I go”); alone, “something”, “someone”.',
      },
      ex: [
        ['这件事谁都知道。', 'Zhè jiàn shì shéi dōu zhīdào.', 'Questa cosa la sanno tutti.', 'Everybody knows this.'],
        ['你想吃什么就吃什么。', 'Nǐ xiǎng chī shénme jiù chī shénme.', 'Mangia quello che vuoi.', 'Eat whatever you like.'],
        ['我饿了，想吃点儿什么。', 'Wǒ è le, xiǎng chī diǎnr shénme.', 'Ho fame, vorrei mangiare qualcosa.', "I'm hungry, I'd like something to eat."],
      ],
    },
    {
      sec: 'words', sub: '代词 · 人称代词 · 指示代词', zh: '别人、咱们；别的、其他', keys: ['别人', '咱们', '别的', '其他'],
      t: { it: 'Gli altri, noi due', en: 'Others, us two' },
      p: {
        it: '<span class="hz">别人</span> «gli altri, qualcun altro». <span class="hz">咱们</span> è un «noi» che include chi ascolta, del parlato del nord. <span class="hz">别的</span> e <span class="hz">其他</span> «altro», davanti al nome: <span class="hz">别的东西</span>, <span class="hz">其他人</span>.',
        en: '<span class="hz">别人</span> “other people, someone else”. <span class="hz">咱们</span> is a “we” that includes the listener, from northern speech. <span class="hz">别的</span> and <span class="hz">其他</span> “other”, before the noun: <span class="hz">别的东西</span>, <span class="hz">其他人</span>.',
      },
      ex: [
        ['咱们走吧。', 'Zánmen zǒu ba.', 'Andiamo (noi due).', "Let's go (you and I)."],
        ['你还要别的吗？', 'Nǐ hái yào biéde ma?', 'Vuoi qualcos\'altro?', 'Would you like anything else?'],
      ],
    },
    {
      sec: 'words', sub: '量词 · 名量词', zh: '把、双、张、种、层、封、页、辆、节、所、班、段、头、句；公斤、斤、角、毛、刻、米；碗、盘', keys: ['把', '双', '张', '种', '层', '封', '页', '辆', '节', '所', '班', '段', '头', '句', '公斤', '斤', '角', '毛', '刻', '米', '碗', '盘'],
      t: { it: 'Altri classificatori, e le unità di misura', en: 'More measure words, and units' },
      p: {
        it: 'Ognuno dice qualcosa della forma o del tipo: <span class="hz">张</span> per le cose piatte (carta, tavoli, foto), <span class="hz">把</span> per quelle con un manico (sedie, ombrelli), <span class="hz">双</span> per le paia, <span class="hz">辆</span> per i veicoli, <span class="hz">封</span> per le lettere, <span class="hz">节</span> per le lezioni, <span class="hz">种</span> «tipo». Anche le unità sono classificatori: <span class="hz">公斤</span> «chilo», <span class="hz">斤</span> «mezzo chilo», <span class="hz">米</span> «metro»; <span class="hz">角</span> (scritto) e <span class="hz">毛</span> (parlato) sono un decimo di yuan, <span class="hz">刻</span> un quarto d\'ora.',
        en: 'Each says something about shape or kind: <span class="hz">张</span> for flat things (paper, tables, photos), <span class="hz">把</span> for things with a handle (chairs, umbrellas), <span class="hz">双</span> for pairs, <span class="hz">辆</span> for vehicles, <span class="hz">封</span> for letters, <span class="hz">节</span> for lessons, <span class="hz">种</span> “kind”. Units are measure words too: <span class="hz">公斤</span> “kilo”, <span class="hz">斤</span> “half a kilo”, <span class="hz">米</span> “metre”; <span class="hz">角</span> (written) and <span class="hz">毛</span> (spoken) are a tenth of a yuan, <span class="hz">刻</span> a quarter of an hour.',
      },
      ex: [
        ['我买了一双鞋和两张票。', 'Wǒ mǎi le yì shuāng xié hé liǎng zhāng piào.', 'Ho comprato un paio di scarpe e due biglietti.', 'I bought a pair of shoes and two tickets.'],
        ['苹果五块五毛一斤。', 'Píngguǒ wǔ kuài wǔ máo yì jīn.', 'Le mele costano cinque yuan e mezzo al mezzo chilo.', 'Apples are five yuan fifty a jin.'],
        ['现在八点一刻。', 'Xiànzài bā diǎn yí kè.', 'Sono le otto e un quarto.', "It's a quarter past eight."],
      ],
    },
    {
      sec: 'words', sub: '量词 · 动量词 · 量词重叠', zh: '口、回、遍、声；个个、张张', keys: ['口', '回', '遍', '声'],
      t: { it: 'Quante volte, e «ognuno»', en: 'How many times, and “each one”' },
      p: {
        it: 'Contano le azioni: <span class="hz">遍</span> una volta dall\'inizio alla fine (<span class="hz">看了两遍</span>, «letto due volte da cima a fondo»), <span class="hz">回</span> come <span class="hz">次</span>, più parlato, <span class="hz">口</span> un boccone o un sorso, <span class="hz">声</span> un suono, una chiamata. Un classificatore ripetuto vuol dire «ognuno, tutti»: <span class="hz">个个</span>, <span class="hz">张张</span>.',
        en: 'They count actions: <span class="hz">遍</span> once from start to finish (<span class="hz">看了两遍</span>, “read twice through”), <span class="hz">回</span> like <span class="hz">次</span>, more spoken, <span class="hz">口</span> a bite or a sip, <span class="hz">声</span> a sound, a call. A doubled measure word means “each, every one”: <span class="hz">个个</span>, <span class="hz">张张</span>.',
      },
      ex: [
        ['请再说一遍。', 'Qǐng zài shuō yí biàn.', 'Ripeti, per favore.', 'Please say it again.'],
        ['他的孩子个个都很聪明。', 'Tā de háizi gègè dōu hěn cōngming.', 'I suoi figli sono tutti molto svegli.', 'His children are all very bright.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 程度副词', zh: '比较、还、更、特别、挺、有些、越、极', keys: ['比较', '还', '更', '特别', '挺', '有些', '越', '极'],
      t: { it: 'Abbastanza, ancora di più, molto', en: 'Fairly, even more, very' },
      p: {
        it: 'Si aggiungono alla scala del grado: <span class="hz">比较</span> «abbastanza, piuttosto»; <span class="hz">还</span> «passabile» (<span class="hz">还可以</span>, «non c\'è male»); <span class="hz">挺……的</span> «proprio» (parlato); <span class="hz">特别</span> «particolarmente»; <span class="hz">有些</span> «un po\'»; <span class="hz">更</span> «ancora più», nei confronti. <span class="hz">越</span> e <span class="hz">极</span> vivono nelle strutture <span class="hz">越……越……</span> e <span class="hz">……极了</span> (più sotto).',
        en: 'They add to the scale of degree: <span class="hz">比较</span> “fairly, rather”; <span class="hz">还</span> “passably” (<span class="hz">还可以</span>, “not bad”); <span class="hz">挺……的</span> “quite” (spoken); <span class="hz">特别</span> “especially”; <span class="hz">有些</span> “a little”; <span class="hz">更</span> “even more”, in comparisons. <span class="hz">越</span> and <span class="hz">极</span> live in the patterns <span class="hz">越……越……</span> and <span class="hz">……极了</span> (below).',
      },
      ex: [
        ['这个菜挺好吃的。', 'Zhège cài tǐng hǎochī de.', 'Questo piatto è proprio buono.', 'This dish is pretty good.'],
        ['今天比较冷，明天更冷。', 'Jīntiān bǐjiào lěng, míngtiān gèng lěng.', 'Oggi fa piuttosto freddo, domani ancora di più.', "It's rather cold today, and colder still tomorrow."],
      ],
    },
    {
      sec: 'words', sub: '副词 · 范围副词', zh: '就、一块儿、一共、只、到处、只是', keys: ['就', '一块儿', '一共', '只', '到处', '只是'],
      t: { it: 'Solo, in tutto, dappertutto', en: 'Only, in all, everywhere' },
      p: {
        it: '<span class="hz">只</span> e <span class="hz">就</span> «solo», davanti al verbo; <span class="hz">只是</span> «soltanto, è solo che». <span class="hz">一共</span> «in tutto». <span class="hz">一块儿</span> «insieme», come <span class="hz">一起</span>. <span class="hz">到处</span> «dappertutto», spesso con <span class="hz">都</span>.',
        en: '<span class="hz">只</span> and <span class="hz">就</span> “only”, before the verb; <span class="hz">只是</span> “merely, it\'s just that”. <span class="hz">一共</span> “in all”. <span class="hz">一块儿</span> “together”, like <span class="hz">一起</span>. <span class="hz">到处</span> “everywhere”, often with <span class="hz">都</span>.',
      },
      ex: [
        ['一共多少钱？', 'Yígòng duōshao qián?', 'Quanto fa in tutto?', 'How much is it altogether?'],
        ['我只有一个妹妹。', 'Wǒ zhǐ yǒu yí ge mèimei.', 'Ho solo una sorella minore.', 'I have only one younger sister.'],
        ['春天到处都是花。', 'Chūntiān dàochù dōu shì huā.', 'In primavera ci sono fiori dappertutto.', 'In spring there are flowers everywhere.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 时间副词', zh: '才、马上、先、一会儿、刚、刚刚、一直', keys: ['才', '马上', '先', '一会儿', '刚', '刚刚', '一直'],
      t: { it: 'Appena, subito, prima, sempre', en: 'Only just, at once, first, all along' },
      p: {
        it: '<span class="hz">刚</span>/<span class="hz">刚刚</span> «appena» (è successo da poco). <span class="hz">马上</span> «subito». <span class="hz">先</span> «prima» (di un\'altra cosa). <span class="hz">一直</span> «sempre, di continuo» (e, per le strade, «dritto»). <span class="hz">才</span> dice che qualcosa avviene più tardi del previsto: <span class="hz">十点才起床</span>, «si è alzato solo alle dieci», al contrario di <span class="hz">就</span>, «già».',
        en: '<span class="hz">刚</span>/<span class="hz">刚刚</span> “just” (it happened a moment ago). <span class="hz">马上</span> “at once”. <span class="hz">先</span> “first” (before something else). <span class="hz">一直</span> “all along, continuously” (and, of roads, “straight on”). <span class="hz">才</span> says something happens later than expected: <span class="hz">十点才起床</span>, “didn\'t get up till ten”, the opposite of <span class="hz">就</span>, “already”.',
      },
      ex: [
        ['我刚到家。', 'Wǒ gāng dào jiā.', 'Sono appena arrivato a casa.', "I've just got home."],
        ['他十点才起床。', 'Tā shí diǎn cái qǐchuáng.', 'Si è alzato solo alle dieci.', "He didn't get up till ten."],
        ['你等一下，我马上来。', 'Nǐ děng yíxià, wǒ mǎshàng lái.', 'Aspetta un attimo, arrivo subito.', "Wait a moment, I'll be right there."],
      ],
    },
    {
      sec: 'words', sub: '副词 · 频率副词 · 关联副词', zh: '总、总是、又、常常；一边', keys: ['总是', '又', '常常', '一边'],
      t: { it: 'Sempre, di nuovo, intanto', en: 'Always, again, meanwhile' },
      p: {
        it: '<span class="hz">总是</span> (o <span class="hz">总</span>) «sempre». <span class="hz">又</span> «di nuovo», per qualcosa che è già successo un\'altra volta (<span class="hz">再</span> invece è per il futuro). <span class="hz">一边</span> «mentre, intanto», di solito in coppia (vedi le frasi complesse).',
        en: '<span class="hz">总是</span> (or <span class="hz">总</span>) “always”. <span class="hz">又</span> “again”, for something that has happened once more (<span class="hz">再</span> is for the future). <span class="hz">一边</span> “while, meanwhile”, usually in pairs (see complex sentences).',
      },
      ex: [
        ['他又迟到了。', 'Tā yòu chídào le.', 'È arrivato di nuovo in ritardo.', "He's late again."],
        ['她总是很忙。', 'Tā zǒngshì hěn máng.', 'È sempre molto impegnata.', 'She is always very busy.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 情态副词', zh: '大概、必须、差不多、一定、好像、几乎', keys: ['大概', '必须', '差不多', '一定', '好像', '几乎'],
      t: { it: 'Probabilmente, per forza, quasi', en: 'Probably, must, almost' },
      p: {
        it: 'Dicono quanto è certo o necessario quello che si afferma: <span class="hz">大概</span> «probabilmente», <span class="hz">好像</span> «sembra che», <span class="hz">一定</span> «di sicuro» (o «assolutamente», in un consiglio), <span class="hz">必须</span> «bisogna», <span class="hz">差不多</span> e <span class="hz">几乎</span> «quasi».',
        en: 'They say how sure or necessary the statement is: <span class="hz">大概</span> “probably”, <span class="hz">好像</span> “it seems”, <span class="hz">一定</span> “surely” (or “be sure to”, in advice), <span class="hz">必须</span> “must”, <span class="hz">差不多</span> and <span class="hz">几乎</span> “almost”.',
      },
      ex: [
        ['他好像生病了。', 'Tā hǎoxiàng shēngbìng le.', 'Sembra che si sia ammalato.', 'He seems to be ill.'],
        ['你一定要来啊！', 'Nǐ yídìng yào lái a!', 'Devi venire assolutamente!', 'You must come!'],
        ['作业我差不多做完了。', 'Zuòyè wǒ chàbuduō zuò wán le.', 'I compiti li ho quasi finiti.', "I've nearly finished my homework."],
      ],
    },
    {
      sec: 'words', sub: '副词 · 语气副词 · 否定副词', zh: '当然、其实、终于、才、就；不必、不用', keys: ['当然', '其实', '终于', '才', '就', '不用'],
      t: { it: 'Certo, in realtà, finalmente; non serve', en: 'Of course, actually, at last; no need' },
      p: {
        it: '<span class="hz">当然</span> «certo», <span class="hz">其实</span> «in realtà» (corregge un\'idea), <span class="hz">终于</span> «finalmente». <span class="hz">才</span> e <span class="hz">就</span> danno anche enfasi: <span class="hz">这才是</span> «ecco che cos\'è davvero», <span class="hz">就是他</span> «è proprio lui». <span class="hz">不用</span> e <span class="hz">不必</span> «non serve, non c\'è bisogno».',
        en: '<span class="hz">当然</span> “of course”, <span class="hz">其实</span> “actually” (correcting an idea), <span class="hz">终于</span> “at last”. <span class="hz">才</span> and <span class="hz">就</span> add stress too: <span class="hz">这才是</span> “now this is really”, <span class="hz">就是他</span> “it\'s him, no one else”. <span class="hz">不用</span> and <span class="hz">不必</span> “no need to”.',
      },
      ex: [
        ['等了一个小时，车终于来了。', 'Děng le yí ge xiǎoshí, chē zhōngyú lái le.', "Dopo un'ora di attesa, l'autobus è finalmente arrivato.", 'After waiting an hour, the bus finally came.'],
        ['他看起来很年轻，其实已经五十岁了。', 'Tā kàn qǐlai hěn niánqīng, qíshí yǐjīng wǔshí suì le.', 'Sembra giovane, ma in realtà ha già cinquant\'anni.', "He looks young, but he's actually fifty."],
        ['不用谢！', 'Búyòng xiè!', 'Non c\'è di che!', "You're welcome!"],
      ],
    },
    {
      sec: 'words', sub: '介词', zh: '为、向、关于；为了；把、被；根据', keys: ['为', '向', '关于', '为了', '把', '被', '根据'],
      t: { it: 'Per, verso, riguardo a, secondo', en: 'For, towards, about, according to' },
      p: {
        it: '<span class="hz">为</span> «per (qualcuno)», <span class="hz">为了</span> «per (uno scopo)». <span class="hz">向</span> «verso», una direzione o una persona (<span class="hz">向你学习</span>, «imparare da te»). <span class="hz">关于</span> «riguardo a», spesso in testa alla frase. <span class="hz">根据</span> «secondo, in base a». <span class="hz">把</span> e <span class="hz">被</span> costruiscono due frasi speciali (più sotto).',
        en: '<span class="hz">为</span> “for (someone)”, <span class="hz">为了</span> “for (a purpose)”. <span class="hz">向</span> “towards”, a direction or a person (<span class="hz">向你学习</span>, “learn from you”). <span class="hz">关于</span> “about”, often opening the sentence. <span class="hz">根据</span> “according to”. <span class="hz">把</span> and <span class="hz">被</span> build two special sentences (below).',
      },
      ex: [
        ['妈妈为我做了一个蛋糕。', 'Māma wèi wǒ zuò le yí ge dàngāo.', 'La mamma mi ha fatto una torta.', 'Mum made a cake for me.'],
        ['我想看关于中国历史的书。', 'Wǒ xiǎng kàn guānyú Zhōngguó lìshǐ de shū.', 'Vorrei leggere libri sulla storia della Cina.', 'I want to read books about Chinese history.'],
      ],
    },
    {
      sec: 'words', sub: '连词 · 助词', zh: '或、或者；只有、只要、不但、而且、如果、可、可是、然后；的话', keys: ['或者', '只有', '只要', '不但', '而且', '如果', '可是', '然后', '的话'],
      t: { it: 'Oppure, se, poi', en: 'Or, if, then' },
      p: {
        it: '<span class="hz">或者</span> (o <span class="hz">或</span>) è «oppure» nelle affermazioni; nelle domande si usa <span class="hz">还是</span>. <span class="hz">可是</span> (o <span class="hz">可</span>) è un «ma» più parlato di <span class="hz">但是</span>; <span class="hz">然后</span> «poi, dopo». <span class="hz">如果</span> e <span class="hz">……的话</span> «se», <span class="hz">只要</span>, <span class="hz">只有</span>, <span class="hz">不但……而且</span> si vedono nelle frasi complesse, più sotto.',
        en: '<span class="hz">或者</span> (or <span class="hz">或</span>) is “or” in statements; in questions it is <span class="hz">还是</span>. <span class="hz">可是</span> (or <span class="hz">可</span>) is a more spoken “but” than <span class="hz">但是</span>; <span class="hz">然后</span> “then, afterwards”. <span class="hz">如果</span> and <span class="hz">……的话</span> “if”, <span class="hz">只要</span>, <span class="hz">只有</span>, <span class="hz">不但……而且</span> come in the complex sentences, below.',
      },
      ex: [
        ['周末我在家看书或者看电影。', 'Zhōumò wǒ zài jiā kàn shū huòzhě kàn diànyǐng.', 'Nel fine settimana leggo o guardo un film a casa.', 'At weekends I read or watch a film at home.'],
        ['我很想去，可是没有时间。', 'Wǒ hěn xiǎng qù, kěshì méiyǒu shíjiān.', 'Ci andrei volentieri, ma non ho tempo.', "I'd love to go, but I have no time."],
      ],
    },

    // ---------- 短语 ----------
    {
      sec: 'phrases', sub: '其他结构类型', zh: '同位短语；动补短语；数量重叠：数词+量词+数词+量词',
      t: { it: 'Apposizioni, risultati, «uno per uno»', en: 'Appositions, results, “one by one”' },
      p: {
        it: 'Due nomi per la stessa cosa, uno accanto all\'altro: <span class="hz">我们大家</span> «noi tutti», <span class="hz">首都北京</span> «la capitale Pechino». Il verbo con il suo risultato forma un\'unità (<span class="hz">洗干净</span> «lavare (fino a) pulito»). E un numero col classificatore ripetuto dice «uno per uno»: <span class="hz">一个一个地</span>.',
        en: 'Two nouns for the same thing, side by side: <span class="hz">我们大家</span> “all of us”. A verb with its result makes a unit (<span class="hz">洗干净</span> “wash (until) clean”). And a number with its measure word repeated says “one by one”: <span class="hz">一个一个地</span>.',
      },
      ex: [
        ['请大家一个一个地进来。', 'Qǐng dàjiā yí ge yí ge de jìnlai.', 'Entrate uno alla volta, per favore.', 'Please come in one at a time.'],
        ['衣服洗干净了。', 'Yīfu xǐ gānjìng le.', 'I vestiti sono lavati e puliti.', 'The clothes are washed clean.'],
      ],
    },
    {
      sec: 'phrases', sub: '固定短语', zh: '不A不B；不一会儿、看来、在……看来、越来越、看起来、看上去、一般来说、不怎么样', keys: ['越来越', '看来', '看起来', '一般', '不怎么样'],
      t: { it: 'Espressioni fisse', en: 'Set expressions' },
      p: {
        it: '<span class="hz">不A不B</span> con due opposti: «né troppo A né troppo B», cioè giusto (<span class="hz">不大不小</span>). <span class="hz">越来越</span> «sempre più». <span class="hz">看起来</span>, <span class="hz">看上去</span> «sembra, ha l\'aria», <span class="hz">看来</span> «a quanto pare», <span class="hz">在我看来</span> «secondo me». <span class="hz">一般来说</span> «di solito, in genere». <span class="hz">不一会儿</span> «poco dopo». <span class="hz">不怎么样</span> «così così, niente di che».',
        en: '<span class="hz">不A不B</span> with two opposites: “neither too A nor too B”, just right (<span class="hz">不大不小</span>). <span class="hz">越来越</span> “more and more”. <span class="hz">看起来</span>, <span class="hz">看上去</span> “looks, seems”, <span class="hz">看来</span> “it appears”, <span class="hz">在我看来</span> “in my view”. <span class="hz">一般来说</span> “generally speaking”. <span class="hz">不一会儿</span> “before long”. <span class="hz">不怎么样</span> “so-so, nothing special”.',
      },
      ex: [
        ['这双鞋不大不小，正合适。', 'Zhè shuāng xié bú dà bù xiǎo, zhèng héshì.', 'Queste scarpe non sono né grandi né piccole, giuste.', 'These shoes are neither big nor small, just right.'],
        ['天气越来越冷了。', 'Tiānqì yuè lái yuè lěng le.', 'Fa sempre più freddo.', "It's getting colder and colder."],
        ['那个饭馆的菜不怎么样。', 'Nàge fànguǎn de cài bù zěnmeyàng.', 'In quel ristorante si mangia così così.', 'The food at that restaurant is nothing special.'],
      ],
    },
    {
      sec: 'phrases', sub: '固定格式', zh: '除了……（以外），……还/也/都……；从……起；对……来说；在……上/下/中；（在）……以前/以后', keys: ['除了', '以外', '以前', '以后'],
      t: { it: 'Strutture fisse: oltre a, da… in poi, per…', en: 'Set patterns: besides, from… on, for…' },
      p: {
        it: '<span class="hz">除了……以外</span> con <span class="hz">还</span>/<span class="hz">也</span> vuol dire «oltre a», con <span class="hz">都</span> «tranne». <span class="hz">从……起</span> «da… in poi». <span class="hz">对……来说</span> «per (qualcuno)». <span class="hz">在……上/下/中</span> «nell\'ambito di». <span class="hz">……以前</span>, <span class="hz">……以后</span> vanno <b>dopo</b> ciò che segnano: <span class="hz">吃饭以后</span> «dopo mangiato».',
        en: '<span class="hz">除了……以外</span> with <span class="hz">还</span>/<span class="hz">也</span> means “besides”, with <span class="hz">都</span> “except”. <span class="hz">从……起</span> “from… on”. <span class="hz">对……来说</span> “for (someone)”. <span class="hz">在……上/下/中</span> “in, as for”. <span class="hz">……以前</span>, <span class="hz">……以后</span> come <b>after</b> what they mark: <span class="hz">吃饭以后</span> “after eating”.',
      },
      ex: [
        ['除了数学以外，他还喜欢体育。', 'Chúle shùxué yǐwài, tā hái xǐhuan tǐyù.', 'Oltre alla matematica, gli piace anche lo sport.', 'Besides maths, he likes sport too.'],
        ['对我来说，数学太难了。', 'Duì wǒ lái shuō, shùxué tài nán le.', 'Per me la matematica è troppo difficile.', 'For me, maths is too hard.'],
        ['睡觉以前别喝咖啡。', 'Shuìjiào yǐqián bié hē kāfēi.', 'Non bere caffè prima di dormire.', "Don't drink coffee before bed."],
      ],
    },
    {
      sec: 'phrases', sub: '固定格式', zh: '一……也/都+不/没……；一点儿也不；越……越……；X什么（啊）；该……了', keys: ['一点儿', '越', '该'],
      t: { it: 'Strutture fisse: per niente, più… più', en: 'Set patterns: not at all, the more… the more' },
      p: {
        it: '<span class="hz">一点儿也不</span> «per niente»; <span class="hz">一个……也没……</span> «neanche uno». <span class="hz">越……越……</span> «più… più…». <span class="hz">该……了</span> «è ora di». E <span class="hz">什么</span> dopo un verbo o un aggettivo ripetuto contesta: <span class="hz">贵什么啊</span>, «ma che caro!» (non è caro affatto).',
        en: '<span class="hz">一点儿也不</span> “not at all”; <span class="hz">一个……也没……</span> “not a single one”. <span class="hz">越……越……</span> “the more… the more…”. <span class="hz">该……了</span> “it\'s time to”. And <span class="hz">什么</span> after a verb or adjective objects to it: <span class="hz">贵什么啊</span>, “expensive, my foot!”.',
      },
      ex: [
        ['这个电影一点儿也不好看。', 'Zhège diànyǐng yìdiǎnr yě bù hǎokàn.', 'Questo film non è bello per niente.', 'This film is no good at all.'],
        ['雨越下越大。', 'Yǔ yuè xià yuè dà.', 'Piove sempre più forte.', 'The rain is getting heavier.'],
        ['十二点了，该睡觉了。', 'Shí\'èr diǎn le, gāi shuìjiào le.', 'È mezzanotte, è ora di dormire.', "It's midnight, time for bed."],
      ],
    },

    // ---------- 句子成分 ----------
    {
      sec: 'parts', sub: '主语 · 定语', zh: '动词性、形容词性短语作主语；主谓短语作主语；多项定语', keys: [],
      t: { it: 'Un\'azione come soggetto; più descrizioni insieme', en: 'An action as subject; several modifiers' },
      p: {
        it: 'Il soggetto può essere un\'azione, senza nessuna trasformazione: <span class="hz">学汉语很有意思</span>, «studiare cinese è interessante». Quando più elementi descrivono un nome, l\'ordine abituale è: di chi, quale, quanti, com\'è, che cosa: <span class="hz">我的那两本新书</span>, «quei due miei libri nuovi».',
        en: 'The subject may be an action, unchanged: <span class="hz">学汉语很有意思</span>, “learning Chinese is interesting”. When several things describe a noun, the usual order is: whose, which, how many, what like, what: <span class="hz">我的那两本新书</span>, “those two new books of mine”.',
      },
      ex: [
        ['学汉语很有意思。', 'Xué Hànyǔ hěn yǒu yìsi.', 'Studiare cinese è interessante.', 'Learning Chinese is interesting.'],
        ['我的那两本新书呢？', 'Wǒ de nà liǎng běn xīn shū ne?', 'Dove sono quei miei due libri nuovi?', 'Where are those two new books of mine?'],
      ],
    },
    {
      sec: 'parts', sub: '补语 · 结果补语', zh: '动词+到/住/走/上', keys: ['到', '住', '走', '上'],
      t: { it: 'Altri risultati: 到, 住, 走, 上', en: 'More results: 到, 住, 走, 上' },
      p: {
        it: '<span class="hz">到</span> «raggiungere» (lo scopo o un punto): <span class="hz">找到</span> «trovare», <span class="hz">买到</span> «riuscire a comprare». <span class="hz">住</span> «fermo, fissato»: <span class="hz">记住</span> «ricordare, imparare a memoria». <span class="hz">走</span> «via»: <span class="hz">拿走</span> «portare via». <span class="hz">上</span> «chiuso, attaccato»: <span class="hz">关上</span> «chiudere».',
        en: '<span class="hz">到</span> “reach” (the aim or a point): <span class="hz">找到</span> “find”, <span class="hz">买到</span> “manage to buy”. <span class="hz">住</span> “fixed, firm”: <span class="hz">记住</span> “remember, learn by heart”. <span class="hz">走</span> “away”: <span class="hz">拿走</span> “take away”. <span class="hz">上</span> “closed, attached”: <span class="hz">关上</span> “close”.',
      },
      ex: [
        ['你的手机我找到了。', 'Nǐ de shǒujī wǒ zhǎo dào le.', 'Il tuo telefono l\'ho trovato.', "I've found your phone."],
        ['请记住我的电话号码。', 'Qǐng jì zhù wǒ de diànhuà hàomǎ.', 'Ricordati il mio numero di telefono.', 'Please remember my phone number.'],
      ],
    },
    {
      sec: 'parts', sub: '补语 · 趋向补语', zh: '引申用法：动词+出/起/下；动词+上/起来（开始）；动词+下去/下来（持续）', keys: ['出来', '起来', '下去', '下来'],
      t: { it: 'Direzioni in senso figurato', en: 'Directions, figuratively' },
      p: {
        it: 'Le direzioni dopo il verbo hanno anche sensi astratti. <span class="hz">出</span>, <span class="hz">起</span>, <span class="hz">下</span> danno un risultato: <span class="hz">想出来</span> «farsi venire in mente», <span class="hz">想起来</span> «ricordarsi». <span class="hz">起来</span> e <span class="hz">上</span> l\'inizio: <span class="hz">笑起来</span> «mettersi a ridere». <span class="hz">下去</span> il continuare: <span class="hz">说下去</span> «continua a parlare»; <span class="hz">下来</span> il fermarsi o il restare: <span class="hz">停下来</span> «fermarsi».',
        en: 'Directions after the verb also have abstract senses. <span class="hz">出</span>, <span class="hz">起</span>, <span class="hz">下</span> give a result: <span class="hz">想出来</span> “come up with”, <span class="hz">想起来</span> “remember”. <span class="hz">起来</span> and <span class="hz">上</span> a start: <span class="hz">笑起来</span> “burst out laughing”. <span class="hz">下去</span> going on: <span class="hz">说下去</span> “go on talking”; <span class="hz">下来</span> coming to rest or staying: <span class="hz">停下来</span> “stop”.',
      },
      ex: [
        ['我想起来了，他姓李。', 'Wǒ xiǎng qǐlai le, tā xìng Lǐ.', 'Mi è tornato in mente: si chiama Li.', "I remember now, his surname is Li."],
        ['大家都笑起来了。', 'Dàjiā dōu xiào qǐlai le.', 'Si sono messi tutti a ridere.', 'Everyone burst out laughing.'],
        ['你说下去，我在听。', 'Nǐ shuō xiàqu, wǒ zài tīng.', 'Continua pure, ti ascolto.', "Go on, I'm listening."],
      ],
    },
    {
      sec: 'parts', sub: '补语 · 可能补语', zh: '动词+得/不+动词/形容词', keys: ['得', '不'],
      t: { it: 'Riuscire o no: 得 e 不 nel mezzo', en: 'Can or can\'t: 得 and 不 in the middle' },
      p: {
        it: 'Tra il verbo e il suo risultato si mette <span class="hz">得</span> per dire che si riesce, <span class="hz">不</span> che non si riesce: <span class="hz">听得懂</span> «riesco a capire (ascoltando)», <span class="hz">看不见</span> «non riesco a vedere». È il modo più naturale di dire «non posso» quando dipende dalle circostanze.',
        en: 'Between a verb and its result, <span class="hz">得</span> says one can manage, <span class="hz">不</span> that one can\'t: <span class="hz">听得懂</span> “can understand (by listening)”, <span class="hz">看不见</span> “can\'t see”. It is the most natural way to say “can\'t” when circumstances decide.',
      },
      ex: [
        ['老师说的话你听得懂吗？', 'Lǎoshī shuō de huà nǐ tīng de dǒng ma?', "Riesci a capire quello che dice l'insegnante?", 'Can you understand what the teacher says?'],
        ['太远了，我看不清楚。', 'Tài yuǎn le, wǒ kàn bu qīngchu.', 'È troppo lontano, non riesco a vedere bene.', "It's too far, I can't see clearly."],
      ],
    },
    {
      sec: 'parts', sub: '补语 · 程度补语 · 数量补语', zh: '形容词+得很；形容词/动词+极了/坏了；动作结束到某个时间点的间隔时间', keys: ['极', '坏'],
      t: { it: 'Moltissimo; e da quanto tempo', en: 'Extremely; and since when' },
      p: {
        it: 'Dopo un aggettivo, <span class="hz">得很</span>, <span class="hz">极了</span> e <span class="hz">坏了</span> (per cose spiacevoli o forti) vogliono dire «moltissimo»: <span class="hz">好极了</span> «benissimo», <span class="hz">累坏了</span> «stanco morto». E una durata dopo un\'azione già conclusa dice da quanto tempo è finita: <span class="hz">他来中国三年了</span>, «è in Cina da tre anni».',
        en: 'After an adjective, <span class="hz">得很</span>, <span class="hz">极了</span> and <span class="hz">坏了</span> (for strong or unpleasant things) mean “extremely”: <span class="hz">好极了</span> “excellent”, <span class="hz">累坏了</span> “dead tired”. And a length of time after a finished action says how long ago it ended: <span class="hz">他来中国三年了</span>, “he came to China three years ago”.',
      },
      ex: [
        ['今天我累坏了。', 'Jīntiān wǒ lèi huài le.', 'Oggi sono stanco morto.', "I'm worn out today."],
        ['他来中国三年了。', 'Tā lái Zhōngguó sān nián le.', 'È venuto in Cina tre anni fa.', 'He came to China three years ago.'],
      ],
    },

    // ---------- 句子的类型 ----------
    {
      sec: 'types', sub: '句类', zh: '“怎样+动词”的特指问句；反问句：不是……吗？', keys: ['怎样', '不是'],
      t: { it: 'Come si fa?; Non è forse…?', en: 'How do you…?; Isn\'t it…?' },
      p: {
        it: '<span class="hz">怎样</span> (o <span class="hz">怎么</span>) davanti al verbo chiede il modo: «come si fa a…?». E una domanda retorica con <span class="hz">不是……吗？</span> è un modo forte di affermare: «non è forse…?», cioè «ma sì che…».',
        en: '<span class="hz">怎样</span> (or <span class="hz">怎么</span>) before the verb asks the way: “how does one…?”. And a rhetorical <span class="hz">不是……吗？</span> is a strong way to assert: “isn\'t it…?”, that is “of course it is”.',
      },
      ex: [
        ['这个字怎样写？', 'Zhège zì zěnyàng xiě?', 'Come si scrive questo carattere?', 'How do you write this character?'],
        ['你不是说你会来吗？', 'Nǐ bú shì shuō nǐ huì lái ma?', 'Non avevi detto che venivi?', "Didn't you say you'd come?"],
      ],
    },
    {
      sec: 'types', sub: '“把”字句', zh: '主语+把+宾语+动词+在/到+处所；主语+把+宾语1+动词（+给）+宾语2；主语+把+宾语+动词+补语', keys: ['把'],
      t: { it: 'La frase con 把: che cosa si fa a che cosa', en: 'The 把 sentence: what is done to what' },
      p: {
        it: 'Con <span class="hz">把</span> l\'oggetto passa davanti al verbo, e la frase racconta che cosa gli succede: dove finisce, a chi va, in che stato resta. Il verbo non può restare nudo: vuole dopo di sé un luogo, un destinatario o un risultato. «Metti il libro sul tavolo»: <span class="hz">把书放在桌子上</span>.',
        en: 'With <span class="hz">把</span> the object moves before the verb, and the sentence tells what happens to it: where it ends up, who gets it, what state it is left in. The verb can\'t stand bare: it wants a place, a receiver or a result after it. “Put the book on the table”: <span class="hz">把书放在桌子上</span>.',
      },
      ex: [
        ['请把书放在桌子上。', 'Qǐng bǎ shū fàng zài zhuōzi shang.', 'Metti il libro sul tavolo, per favore.', 'Please put the book on the table.'],
        ['我把照片发给你。', 'Wǒ bǎ zhàopiàn fā gěi nǐ.', 'Ti mando la foto.', "I'll send you the photo."],
        ['他把作业做完了。', 'Tā bǎ zuòyè zuò wán le.', 'Ha finito i compiti.', 'He has finished his homework.'],
      ],
    },
    {
      sec: 'types', sub: '被动句', zh: '主语+被+宾语+动词+其他成分；主语+被+动词+其他成分', keys: ['被'],
      t: { it: 'Il passivo con 被', en: 'The passive with 被' },
      p: {
        it: '<span class="hz">被</span> fa il passivo: «il soggetto <span class="hz">被</span> (chi lo fa) verbo + qualcosa». Si usa soprattutto per cose spiacevoli (rubato, rotto, criticato), e come nel <span class="hz">把</span> il verbo non resta nudo. Chi agisce si può tacere: <span class="hz">被偷了</span>, «è stato rubato».',
        en: '<span class="hz">被</span> makes the passive: “the subject <span class="hz">被</span> (by whom) verb + something”. It is used mostly for unwelcome things (stolen, broken, scolded), and as with <span class="hz">把</span> the verb can\'t stand bare. The doer may be left out: <span class="hz">被偷了</span>, “was stolen”.',
      },
      ex: [
        ['我的自行车被人骑走了。', 'Wǒ de zìxíngchē bèi rén qí zǒu le.', 'Qualcuno se n\'è andato con la mia bicicletta.', 'Somebody rode off on my bike.'],
        ['蛋糕被弟弟吃完了。', 'Dàngāo bèi dìdi chī wán le.', 'La torta l\'ha finita mio fratello.', 'The cake was eaten up by my little brother.'],
      ],
    },
    {
      sec: 'types', sub: '连动句 · 重动句', zh: '动词1+着+动词2；主语+动词+宾语+动词+补语', keys: ['着'],
      t: { it: 'Facendo una cosa, un\'altra; il verbo ripetuto', en: 'Doing one thing while another; the verb repeated' },
      p: {
        it: 'Con <span class="hz">着</span> dopo il primo verbo, la prima azione accompagna la seconda: <span class="hz">走着去</span> «andare a piedi», <span class="hz">笑着说</span>. E quando un verbo ha sia un oggetto sia un complemento (durata, giudizio), si ripete: <span class="hz">他看书看了三个小时</span>, «ha letto per tre ore».',
        en: 'With <span class="hz">着</span> after the first verb, the first action goes along with the second: <span class="hz">走着去</span> “go on foot”, <span class="hz">笑着说</span>. And when a verb has both an object and a complement (length, judgement), it repeats: <span class="hz">他看书看了三个小时</span>, “he read for three hours”.',
      },
      ex: [
        ['不远，我们走着去吧。', 'Bù yuǎn, wǒmen zǒu zhe qù ba.', 'Non è lontano, andiamo a piedi.', "It's not far, let's walk."],
        ['他看书看了三个小时。', 'Tā kàn shū kàn le sān ge xiǎoshí.', 'Ha letto per tre ore.', 'He read for three hours.'],
      ],
    },
    {
      sec: 'types', sub: '比较句', zh: 'A比B+更/还+形容词；A跟B一样（+形容词）；A不比B+形容词；A比B+多/少/早/晚+动词+数量短语', keys: ['更', '一样', '比'],
      t: { it: 'Altri paragoni: uguale, ancora più', en: 'More comparisons: the same, even more' },
      p: {
        it: '<span class="hz">比……更/还</span> «ancora più di». «A è come B»: <span class="hz">A跟B一样</span>, con l\'aggettivo dopo se serve (<span class="hz">一样高</span>, «alti uguali»). <span class="hz">A不比B高</span> nega un\'idea altrui: «non è più alto (come pensi)». E con <span class="hz">多</span>, <span class="hz">少</span>, <span class="hz">早</span>, <span class="hz">晚</span> davanti al verbo: <span class="hz">比我早来十分钟</span>, «è arrivato dieci minuti prima di me».',
        en: '<span class="hz">比……更/还</span> “even more than”. “A is like B”: <span class="hz">A跟B一样</span>, with the adjective after if needed (<span class="hz">一样高</span>, “equally tall”). <span class="hz">A不比B高</span> denies someone\'s idea: “isn\'t taller (as you think)”. And with <span class="hz">多</span>, <span class="hz">少</span>, <span class="hz">早</span>, <span class="hz">晚</span> before the verb: <span class="hz">比我早来十分钟</span>, “came ten minutes earlier than me”.',
      },
      ex: [
        ['我的手机跟你的一样。', 'Wǒ de shǒujī gēn nǐ de yíyàng.', 'Il mio telefono è uguale al tuo.', 'My phone is the same as yours.'],
        ['今天比昨天还热。', 'Jīntiān bǐ zuótiān hái rè.', 'Oggi fa ancora più caldo di ieri.', "It's even hotter today than yesterday."],
        ['他比我早来了十分钟。', 'Tā bǐ wǒ zǎo lái le shí fēnzhōng.', 'È arrivato dieci minuti prima di me.', 'He came ten minutes earlier than me.'],
      ],
    },
    {
      sec: 'types', sub: '存现句', zh: '处所词+动词+补语+（了）+数量短语+人/物（出现、消失）',
      t: { it: 'Qualcuno arriva, qualcosa sparisce', en: 'Someone appears, something goes' },
      p: {
        it: 'Per dire che in un luogo qualcuno o qualcosa compare o sparisce, il luogo apre la frase e chi arriva la chiude, dopo il verbo: «davanti è venuta una persona», «in classe sono andati via due studenti». Chi arriva di solito è nuovo, sconosciuto, e ha un numero.',
        en: 'To say that someone or something appears in, or leaves, a place, the place opens the sentence and the newcomer closes it, after the verb: “in front came a person”, “from the class left two students”. The newcomer is usually new, unknown, and has a number.',
      },
      ex: [
        ['前面走过来一个人。', 'Qiánmian zǒu guòlai yí ge rén.', 'Davanti sta arrivando una persona.', 'Someone is walking towards us.'],
        ['我们班走了两个同学。', 'Wǒmen bān zǒu le liǎng ge tóngxué.', 'Dalla nostra classe se ne sono andati due compagni.', 'Two classmates have left our class.'],
      ],
    },
    {
      sec: 'types', sub: '“是……的”句', zh: '强调说话人的看法或态度', keys: ['是', '的'],
      t: { it: '是……的: un giudizio deciso', en: '是……的: a firm view' },
      p: {
        it: 'Messo intorno a un giudizio, <span class="hz">是……的</span> lo rende sicuro e convinto, «è proprio così»: <span class="hz">这个问题是很重要的</span>. A differenza del livello 2 non c\'entra il passato.',
        en: 'Put around a judgement, <span class="hz">是……的</span> makes it firm and convinced, “it really is so”: <span class="hz">这个问题是很重要的</span>. Unlike level 2, it has nothing to do with the past.',
      },
      ex: [
        ['学习汉语是很有用的。', 'Xuéxí Hànyǔ shì hěn yǒuyòng de.', 'Studiare cinese è davvero utile.', 'Learning Chinese really is useful.'],
      ],
    },

    // ---------- 复句 ----------
    {
      sec: 'complex', sub: '承接复句 · 选择复句', zh: '先……，再/然后……；或者……，或者……', keys: ['先', '再', '然后', '或者'],
      t: { it: 'Prima… poi; o… o', en: 'First… then; either… or' },
      p: {
        it: '<span class="hz">先……，再……</span> per due azioni future in ordine, <span class="hz">先……，然后……</span> anche per quelle passate. <span class="hz">或者……，或者……</span> «o… o…», tra due possibilità.',
        en: '<span class="hz">先……，再……</span> for two future actions in order, <span class="hz">先……，然后……</span> for past ones too. <span class="hz">或者……，或者……</span> “either… or…”, between two options.',
      },
      ex: [
        ['我们先吃饭，然后去看电影。', 'Wǒmen xiān chīfàn, ránhòu qù kàn diànyǐng.', 'Prima mangiamo, poi andiamo al cinema.', "First we'll eat, then go to the cinema."],
        ['你或者今天来，或者明天来，都可以。', 'Nǐ huòzhě jīntiān lái, huòzhě míngtiān lái, dōu kěyǐ.', 'Vieni oggi o domani, va bene uguale.', 'Come today or tomorrow, either is fine.'],
      ],
    },
    {
      sec: 'complex', sub: '并列复句', zh: '一会儿……，一会儿……；又……，又……；一边……，一边……', keys: ['一会儿', '又', '一边'],
      t: { it: 'Ora… ora; sia… sia; mentre', en: 'Now… now; both… and; while' },
      p: {
        it: '<span class="hz">一会儿……一会儿……</span> «ora… ora…», cose che si alternano. <span class="hz">又……又……</span> «sia… sia…», due qualità insieme. <span class="hz">一边……一边……</span> due azioni nello stesso momento.',
        en: '<span class="hz">一会儿……一会儿……</span> “now… now…”, things that alternate. <span class="hz">又……又……</span> “both… and…”, two qualities at once. <span class="hz">一边……一边……</span> two actions at the same time.',
      },
      ex: [
        ['这里的水果又便宜又新鲜。', 'Zhèlǐ de shuǐguǒ yòu piányi yòu xīnxiān.', 'Qui la frutta è economica e fresca.', 'The fruit here is both cheap and fresh.'],
        ['他一边吃饭，一边看手机。', 'Tā yìbiān chīfàn, yìbiān kàn shǒujī.', 'Mangia guardando il telefono.', 'He looks at his phone while he eats.'],
        ['天气一会儿冷，一会儿热。', 'Tiānqì yíhuìr lěng, yíhuìr rè.', 'Il tempo è ora freddo, ora caldo.', 'The weather is cold one moment, hot the next.'],
      ],
    },
    {
      sec: 'complex', sub: '递进复句 · 转折复句', zh: '不但……，而且……；虽然……，可是……', keys: ['不但', '而且', '虽然', '可是'],
      t: { it: 'Non solo… ma anche; sebbene… però', en: 'Not only… but also; although… yet' },
      p: {
        it: '<span class="hz">不但……，而且……</span> aggiunge qualcosa di più forte: «non solo… ma anche». <span class="hz">虽然……，可是……</span> è la coppia di «sebbene» con il <span class="hz">可是</span> parlato.',
        en: '<span class="hz">不但……，而且……</span> adds something stronger: “not only… but also”. <span class="hz">虽然……，可是……</span> is the “although” pair with spoken <span class="hz">可是</span>.',
      },
      ex: [
        ['她不但会唱歌，而且跳舞也跳得很好。', 'Tā búdàn huì chàng gē, érqiě tiàowǔ yě tiào de hěn hǎo.', 'Non solo sa cantare, ma balla anche molto bene.', 'Not only can she sing, she dances very well too.'],
      ],
    },
    {
      sec: 'complex', sub: '假设复句 · 条件复句', zh: '如果……，就……；……的话，就……；只有……，才……；只要……，就……', keys: ['如果', '的话', '只有', '只要', '才', '就'],
      t: { it: 'Se; solo se; basta che', en: 'If; only if; as long as' },
      p: {
        it: 'L\'ipotesi apre la frase: <span class="hz">如果……</span>, o <span class="hz">……的话</span> in fondo alla prima parte, o tutti e due; nella seconda <span class="hz">就</span>. Per le condizioni: <span class="hz">只要……就……</span> «basta che… e…» (condizione sufficiente), <span class="hz">只有……才……</span> «solo se… allora» (condizione necessaria).',
        en: 'The supposition comes first: <span class="hz">如果……</span>, or <span class="hz">……的话</span> at the end of the first part, or both; <span class="hz">就</span> in the second. For conditions: <span class="hz">只要……就……</span> “as long as… then” (enough), <span class="hz">只有……才……</span> “only if… then” (needed).',
      },
      ex: [
        ['如果明天下雨，我们就不去了。', 'Rúguǒ míngtiān xià yǔ, wǒmen jiù bú qù le.', 'Se domani piove, non ci andiamo.', "If it rains tomorrow, we won't go."],
        ['只要你努力，就能学好汉语。', 'Zhǐyào nǐ nǔlì, jiù néng xué hǎo Hànyǔ.', 'Basta che ti impegni, e il cinese lo impari bene.', 'As long as you work hard, you can learn Chinese well.'],
        ['只有多练习，才能说得好。', 'Zhǐyǒu duō liànxí, cái néng shuō de hǎo.', 'Solo esercitandosi molto si riesce a parlare bene.', 'Only by practising a lot can you speak well.'],
      ],
    },
    {
      sec: 'complex', sub: '目的复句 · 紧缩复句', zh: '为了……，……；……了……（就）……', keys: ['为了', '了', '就'],
      t: { it: 'Per…; fatto questo, quello', en: 'In order to…; once this, then that' },
      p: {
        it: '<span class="hz">为了……</span> apre la frase con lo scopo: «per…». E <span class="hz">了</span> dopo il primo verbo, con <span class="hz">就</span> davanti al secondo, dice che la seconda azione segue appena finita la prima.',
        en: '<span class="hz">为了……</span> opens the sentence with the aim: “in order to…”. And <span class="hz">了</span> after the first verb, with <span class="hz">就</span> before the second, says the second action follows as soon as the first is done.',
      },
      ex: [
        ['为了身体健康，他每天锻炼。', 'Wèile shēntǐ jiànkāng, tā měi tiān duànliàn.', 'Per stare in salute, fa esercizio tutti i giorni.', 'To stay healthy, he exercises every day.'],
        ['我下了班就回家。', 'Wǒ xià le bān jiù huí jiā.', 'Finito il lavoro torno a casa.', "I'll go home as soon as I finish work."],
      ],
    },

    // ---------- 特殊表达法 ----------
    {
      sec: 'special', sub: '数的表达法 · 概数', zh: '用“大概”表示概数；相邻数词连用表示概数', keys: ['大概'],
      t: { it: 'Numeri approssimati: circa, tre o quattro', en: 'Rough numbers: about, three or four' },
      p: {
        it: '<span class="hz">大概</span> davanti al numero, «circa». Oppure due numeri vicini in fila, senza «o»: <span class="hz">三四个</span> «tre o quattro», <span class="hz">七八天</span> «sette o otto giorni».',
        en: '<span class="hz">大概</span> before the number, “about”. Or two neighbouring numbers in a row, with no “or”: <span class="hz">三四个</span> “three or four”, <span class="hz">七八天</span> “seven or eight days”.',
      },
      ex: [
        ['教室里大概有三十个人。', 'Jiàoshì li dàgài yǒu sānshí ge rén.', "In aula ci sono una trentina di persone.", 'There are about thirty people in the classroom.'],
        ['我在北京住了七八天。', 'Wǒ zài Běijīng zhù le qī bā tiān.', 'Sono stato a Pechino sette o otto giorni.', 'I stayed in Beijing seven or eight days.'],
      ],
    },
  ],
  4: [
    // ---------- 词类 ----------
    {
      sec: 'words', sub: '动词 · 能愿动词', zh: '敢', keys: ['敢'],
      t: { it: '敢: avere il coraggio di', en: '敢: dare' },
      p: {
        it: '<span class="hz">敢</span> <i>gǎn</i> davanti al verbo: «osare, avere il coraggio di». Si usa molto al negativo: <span class="hz">不敢</span>, «non oso, ho paura di».',
        en: '<span class="hz">敢</span> <i>gǎn</i> before the verb: “dare, have the nerve to”. It is common in the negative: <span class="hz">不敢</span>, “daren\'t, am afraid to”.',
      },
      ex: [
        ['我不敢一个人走夜路。', 'Wǒ bù gǎn yí ge rén zǒu yè lù.', 'Non ho il coraggio di camminare da solo di notte.', "I daren't walk alone at night."],
      ],
    },
    {
      sec: 'words', sub: '代词 · 指示代词', zh: '各、各位、各种、任何、此', keys: ['各', '各位', '各种', '任何', '此'],
      t: { it: 'Ciascuno, ogni tipo, qualsiasi', en: 'Each, all kinds, any' },
      p: {
        it: '<span class="hz">各</span> «ciascuno», davanti a nomi di gruppi o a un classificatore: <span class="hz">各国</span>, <span class="hz">各位</span> «signore e signori». <span class="hz">各种</span> «ogni tipo di». <span class="hz">任何</span> «qualsiasi», spesso con <span class="hz">都</span> o in frasi negative. <span class="hz">此</span> è un «questo» scritto: <span class="hz">因此</span>, <span class="hz">此外</span>.',
        en: '<span class="hz">各</span> “each”, before group nouns or a measure word: <span class="hz">各国</span>, <span class="hz">各位</span> “ladies and gentlemen”. <span class="hz">各种</span> “all kinds of”. <span class="hz">任何</span> “any”, often with <span class="hz">都</span> or in negatives. <span class="hz">此</span> is a written “this”: <span class="hz">因此</span>, <span class="hz">此外</span>.',
      },
      ex: [
        ['各位朋友，大家好！', 'Gè wèi péngyou, dàjiā hǎo!', 'Cari amici, buongiorno a tutti!', 'Dear friends, hello everyone!'],
        ['有任何问题都可以问我。', 'Yǒu rènhé wèntí dōu kěyǐ wèn wǒ.', 'Per qualsiasi domanda potete chiedere a me.', 'Ask me if you have any questions.'],
      ],
    },
    {
      sec: 'words', sub: '量词', zh: '打、袋、棵、台、幅；脸、手、盒、屋子、桌子；场、顿、趟', keys: ['打', '袋', '棵', '台', '幅', '盒', '场', '顿', '趟'],
      t: { it: 'Classificatori: alberi, macchine, pasti, viaggi', en: 'Measure words: trees, machines, meals, trips' },
      p: {
        it: '<span class="hz">棵</span> per gli alberi, <span class="hz">台</span> per le macchine (computer, televisori), <span class="hz">幅</span> per i quadri, <span class="hz">打</span> «dozzina», <span class="hz">袋</span> e <span class="hz">盒</span> «sacchetto» e «scatola». Una parte del corpo o uno spazio fa da classificatore per dire «pieno di»: <span class="hz">一脸的汗</span> «la faccia tutta sudata», <span class="hz">一屋子人</span> «una stanza piena di gente». Per le azioni: <span class="hz">场</span> per gli eventi (una partita, una pioggia), <span class="hz">顿</span> per i pasti e le sgridate, <span class="hz">趟</span> per un viaggio andata e ritorno.',
        en: '<span class="hz">棵</span> for trees, <span class="hz">台</span> for machines (computers, televisions), <span class="hz">幅</span> for pictures, <span class="hz">打</span> “dozen”, <span class="hz">袋</span> and <span class="hz">盒</span> “bag” and “box”. A body part or a space works as a measure word for “full of”: <span class="hz">一脸的汗</span> “a face covered in sweat”, <span class="hz">一屋子人</span> “a roomful of people”. For actions: <span class="hz">场</span> for events (a match, a rain), <span class="hz">顿</span> for meals and tellings-off, <span class="hz">趟</span> for a round trip.',
      },
      ex: [
        ['院子里有两棵大树。', 'Yuànzi li yǒu liǎng kē dà shù.', "Nel cortile ci sono due grandi alberi.", 'There are two big trees in the yard.'],
        ['我去了一趟超市。', 'Wǒ qù le yí tàng chāoshì.', 'Sono andato e tornato dal supermercato.', 'I made a trip to the supermarket.'],
        ['昨天下了一场大雨。', 'Zuótiān xià le yì cháng dà yǔ.', 'Ieri è venuto giù un acquazzone.', 'There was a heavy downpour yesterday.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 程度副词', zh: '十分、更加、稍、稍微、尤其、多么', keys: ['十分', '更加', '稍微', '尤其', '多么'],
      t: { it: 'Del tutto, ancora di più, un po\', soprattutto', en: 'Very, all the more, slightly, especially' },
      p: {
        it: '<span class="hz">十分</span> «assai», più formale di <span class="hz">非常</span>. <span class="hz">更加</span> «ancora di più». <span class="hz">稍微</span> (o <span class="hz">稍</span>) «leggermente», spesso con <span class="hz">一点儿</span> o <span class="hz">一下</span>. <span class="hz">尤其</span> «soprattutto». <span class="hz">多么</span> esclama: «quanto…!».',
        en: '<span class="hz">十分</span> “very”, more formal than <span class="hz">非常</span>. <span class="hz">更加</span> “all the more”. <span class="hz">稍微</span> (or <span class="hz">稍</span>) “slightly”, often with <span class="hz">一点儿</span> or <span class="hz">一下</span>. <span class="hz">尤其</span> “especially”. <span class="hz">多么</span> exclaims: “how…!”.',
      },
      ex: [
        ['请你稍微等一下。', 'Qǐng nǐ shāowēi děng yíxià.', 'Aspetta solo un momento, per favore.', 'Please wait just a moment.'],
        ['我喜欢运动，尤其是游泳。', 'Wǒ xǐhuan yùndòng, yóuqí shì yóuyǒng.', 'Mi piace lo sport, soprattutto il nuoto.', 'I like sport, especially swimming.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 范围副词', zh: '共、全、光、仅、仅仅、至少', keys: ['共', '全', '光', '仅仅', '至少'],
      t: { it: 'Tutto, solo, almeno', en: 'All, only, at least' },
      p: {
        it: '<span class="hz">全</span> «tutto, interamente», spesso con <span class="hz">都</span>. <span class="hz">共</span> «in tutto», più scritto di <span class="hz">一共</span>. <span class="hz">光</span> «solo» (parlato) e <span class="hz">仅</span>, <span class="hz">仅仅</span> «soltanto» (scritto). <span class="hz">至少</span> «almeno».',
        en: '<span class="hz">全</span> “all, wholly”, often with <span class="hz">都</span>. <span class="hz">共</span> “in all”, more written than <span class="hz">一共</span>. <span class="hz">光</span> “only” (spoken) and <span class="hz">仅</span>, <span class="hz">仅仅</span> “merely” (written). <span class="hz">至少</span> “at least”.',
      },
      ex: [
        ['全家人都来了。', 'Quán jiā rén dōu lái le.', 'È venuta tutta la famiglia.', 'The whole family came.'],
        ['从这儿到机场至少要一个小时。', 'Cóng zhèr dào jīchǎng zhìshǎo yào yí ge xiǎoshí.', "Da qui all'aeroporto ci vuole almeno un'ora.", 'It takes at least an hour from here to the airport.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 时间副词', zh: '按时、从来、赶紧、赶快、已、忽然、将、将要、从、本来', keys: ['按时', '从来', '赶紧', '赶快', '忽然', '将', '本来'],
      t: { it: 'Puntuale, mai, in fretta, all\'improvviso', en: 'On time, ever, quickly, suddenly' },
      p: {
        it: '<span class="hz">按时</span> «puntualmente». <span class="hz">从来</span> con una negazione, «mai» (<span class="hz">从来不</span>, <span class="hz">从来没</span>); anche <span class="hz">从</span> da solo, più scritto. <span class="hz">赶紧</span>, <span class="hz">赶快</span> «in fretta, subito». <span class="hz">忽然</span> «all\'improvviso». <span class="hz">将</span>, <span class="hz">将要</span> «sta per, avverrà» (scritto); <span class="hz">已</span> «già» (scritto). <span class="hz">本来</span> «all\'inizio, in origine».',
        en: '<span class="hz">按时</span> “on time”. <span class="hz">从来</span> with a negative, “never” (<span class="hz">从来不</span>, <span class="hz">从来没</span>); also <span class="hz">从</span> alone, more written. <span class="hz">赶紧</span>, <span class="hz">赶快</span> “hurry, at once”. <span class="hz">忽然</span> “suddenly”. <span class="hz">将</span>, <span class="hz">将要</span> “will, is to” (written); <span class="hz">已</span> “already” (written). <span class="hz">本来</span> “originally, at first”.',
      },
      ex: [
        ['他从来不迟到。', 'Tā cónglái bù chídào.', 'Non arriva mai in ritardo.', 'He is never late.'],
        ['快下雨了，赶紧回家吧。', 'Kuài xià yǔ le, gǎnjǐn huí jiā ba.', 'Sta per piovere, torniamo subito a casa.', "It's about to rain, let's hurry home."],
        ['我本来想去，后来没时间了。', 'Wǒ běnlái xiǎng qù, hòulái méi shíjiān le.', 'Volevo andarci, ma poi non ho avuto tempo.', 'I meant to go, but then I had no time.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 频率副词 · 方式副词', zh: '重新、往往、偶尔、再次、老；故意、互相、相互', keys: ['重新', '往往', '偶尔', '再次', '老', '故意', '互相'],
      t: { it: 'Da capo, spesso, ogni tanto; apposta, a vicenda', en: 'Afresh, tend to, now and then; on purpose, each other' },
      p: {
        it: '<span class="hz">重新</span> «da capo, di nuovo». <span class="hz">再次</span> «ancora una volta» (scritto). <span class="hz">往往</span> «di solito, tende a» (per regolarità osservate). <span class="hz">偶尔</span> «ogni tanto». <span class="hz">老</span> «sempre», spesso con fastidio. <span class="hz">故意</span> «apposta». <span class="hz">互相</span>, <span class="hz">相互</span> «a vicenda».',
        en: '<span class="hz">重新</span> “afresh, over again”. <span class="hz">再次</span> “once again” (written). <span class="hz">往往</span> “tend to, usually” (for observed patterns). <span class="hz">偶尔</span> “now and then”. <span class="hz">老</span> “always”, often with annoyance. <span class="hz">故意</span> “on purpose”. <span class="hz">互相</span>, <span class="hz">相互</span> “each other”.',
      },
      ex: [
        ['这个字写错了，请重新写一遍。', 'Zhège zì xiě cuò le, qǐng chóngxīn xiě yí biàn.', 'Questo carattere è sbagliato, riscrivilo da capo.', 'This character is wrong, please write it again.'],
        ['同学们应该互相帮助。', 'Tóngxuémen yīnggāi hùxiāng bāngzhù.', 'I compagni dovrebbero aiutarsi a vicenda.', 'Classmates should help each other.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 关联副词 · 情态副词', zh: '却；也许、恐怕', keys: ['却', '也许', '恐怕'],
      t: { it: 'Eppure; forse, temo', en: 'Yet; perhaps, I\'m afraid' },
      p: {
        it: '<span class="hz">却</span> «eppure, invece» è un avverbio: sta dopo il soggetto, non all\'inizio come <span class="hz">但是</span>. <span class="hz">也许</span> «forse». <span class="hz">恐怕</span> «temo che», per una previsione sgradita.',
        en: '<span class="hz">却</span> “yet, however” is an adverb: it comes after the subject, not first like <span class="hz">但是</span>. <span class="hz">也许</span> “perhaps”. <span class="hz">恐怕</span> “I\'m afraid”, for an unwelcome guess.',
      },
      ex: [
        ['他很努力，成绩却不太好。', 'Tā hěn nǔlì, chéngjì què bú tài hǎo.', 'Si impegna molto, eppure i voti non sono buoni.', 'He works hard, yet his marks are not good.'],
        ['恐怕今天来不及了。', 'Kǒngpà jīntiān lái bu jí le.', 'Temo che oggi non si faccia in tempo.', "I'm afraid there's not enough time today."],
      ],
    },
    {
      sec: 'words', sub: '副词 · 语气副词', zh: '竟然、究竟、到底、难道、正好、确实、只好、千万、差（一）点儿', keys: ['竟然', '究竟', '到底', '难道', '正好', '确实', '只好', '千万', '差点儿'],
      t: { it: 'Addirittura, insomma, per fortuna, per poco', en: 'Actually, after all, just right, nearly' },
      p: {
        it: '<span class="hz">竟然</span> «addirittura» (con sorpresa). <span class="hz">到底</span> e <span class="hz">究竟</span> nelle domande: «insomma, alla fine?». <span class="hz">难道</span> apre una domanda retorica (più sotto). <span class="hz">正好</span> «proprio al momento giusto». <span class="hz">确实</span> «davvero». <span class="hz">只好</span> «non resta che». <span class="hz">千万</span> «assolutamente», in raccomandazioni. <span class="hz">差点儿</span> «per poco (non)».',
        en: '<span class="hz">竟然</span> “actually, to my surprise”. <span class="hz">到底</span> and <span class="hz">究竟</span> in questions: “on earth, in the end?”. <span class="hz">难道</span> opens a rhetorical question (below). <span class="hz">正好</span> “just right, as it happens”. <span class="hz">确实</span> “indeed”. <span class="hz">只好</span> “have no choice but”. <span class="hz">千万</span> “be sure to”, in warnings. <span class="hz">差点儿</span> “nearly”.',
      },
      ex: [
        ['你到底去不去？', 'Nǐ dàodǐ qù bu qù?', 'Insomma, ci vai o no?', 'Are you going or not, then?'],
        ['没有车了，我们只好走回去。', 'Méiyǒu chē le, wǒmen zhǐhǎo zǒu huíqu.', 'Non ci sono più autobus, non ci resta che tornare a piedi.', "There's no more bus, we'll have to walk back."],
        ['我差点儿忘了。', 'Wǒ chàdiǎnr wàng le.', 'Per poco me ne dimenticavo.', 'I nearly forgot.'],
      ],
    },
    {
      sec: 'words', sub: '副词 · 语气副词', zh: '才、就、并、还', keys: ['才', '就', '并', '还'],
      t: { it: '才, 就, 并, 还 per dare enfasi', en: '才, 就, 并, 还 for emphasis' },
      p: {
        it: '<span class="hz">并</span> davanti a una negazione la rafforza: <span class="hz">并不</span> «non è affatto (come pensi)». <span class="hz">还</span> «persino, addirittura». <span class="hz">才</span> sottolinea con forza (<span class="hz">我才不去呢</span>, «figurati se ci vado»), <span class="hz">就</span> insiste su una decisione (<span class="hz">我就不去</span>, «e io non ci vado»).',
        en: '<span class="hz">并</span> before a negative strengthens it: <span class="hz">并不</span> “not at all (as you think)”. <span class="hz">还</span> “even”. <span class="hz">才</span> stresses hard (<span class="hz">我才不去呢</span>, “as if I\'d go”), <span class="hz">就</span> insists on a choice (<span class="hz">我就不去</span>, “I\'m just not going”).',
      },
      ex: [
        ['这个问题并不难。', 'Zhège wèntí bìng bù nán.', 'Questo problema non è affatto difficile.', "This problem isn't hard at all."],
        ['他还是个孩子，还不懂。', 'Tā hái shì ge háizi, hái bù dǒng.', 'È ancora un bambino, non capisce ancora.', "He's still a child, he doesn't understand yet."],
      ],
    },
    {
      sec: 'words', sub: '介词', zh: '自、当、由、随着、等；将、由、叫、让；由于；对于、与；作为、按、按照', keys: ['当', '随着', '由', '由于', '对于', '与', '作为', '按照'],
      t: { it: 'Preposizioni più formali', en: 'More formal prepositions' },
      p: {
        it: 'Molte sono versioni scritte di parole già note. Tempo: <span class="hz">当……的时候</span> «quando», <span class="hz">随着</span> «con il passare di», <span class="hz">自</span> «da», <span class="hz">等</span> «quando, appena (sarà)». Chi fa: <span class="hz">由</span> «da parte di» (<span class="hz">由他负责</span>), <span class="hz">叫</span>, <span class="hz">让</span> nel passivo, <span class="hz">将</span> come <span class="hz">把</span>. Causa: <span class="hz">由于</span> «a causa di». Oggetto: <span class="hz">对于</span> «riguardo a», <span class="hz">与</span> «con». Base: <span class="hz">按照</span> (o <span class="hz">按</span>) «secondo», <span class="hz">作为</span> «in qualità di».',
        en: 'Many are written versions of known words. Time: <span class="hz">当……的时候</span> “when”, <span class="hz">随着</span> “along with, as”, <span class="hz">自</span> “from”, <span class="hz">等</span> “when, once”. Doer: <span class="hz">由</span> “by” (<span class="hz">由他负责</span>), <span class="hz">叫</span>, <span class="hz">让</span> in the passive, <span class="hz">将</span> like <span class="hz">把</span>. Cause: <span class="hz">由于</span> “owing to”. Object: <span class="hz">对于</span> “regarding”, <span class="hz">与</span> “with”. Basis: <span class="hz">按照</span> (or <span class="hz">按</span>) “according to”, <span class="hz">作为</span> “as”.',
      },
      ex: [
        ['等你回来，我们再吃饭。', 'Děng nǐ huílai, wǒmen zài chīfàn.', 'Mangiamo quando torni.', "We'll eat when you get back."],
        ['请按照老师说的做。', 'Qǐng ànzhào lǎoshī shuō de zuò.', "Fate come ha detto l'insegnante.", 'Please do as the teacher said.'],
        ['作为学生，你应该认真学习。', 'Zuòwéi xuésheng, nǐ yīnggāi rènzhēn xuéxí.', 'Da studente, dovresti studiare seriamente.', 'As a student, you should study seriously.'],
      ],
    },
    {
      sec: 'words', sub: '连词', zh: '并、而、与；此外、既然、甚至、不过、并且、不光、不仅、另外、要是、因此、由于、加上', keys: ['而', '此外', '既然', '甚至', '不过', '并且', '不仅', '另外', '要是', '因此', '加上'],
      t: { it: 'Congiunzioni: inoltre, quindi, anzi, però', en: 'Conjunctions: besides, therefore, even, but' },
      p: {
        it: '<span class="hz">并且</span>, <span class="hz">而且</span> «e inoltre»; <span class="hz">另外</span>, <span class="hz">此外</span> «a parte questo». <span class="hz">甚至</span> «persino, anzi». <span class="hz">不过</span> «però» (più leggero di <span class="hz">但是</span>). <span class="hz">因此</span> «perciò», <span class="hz">由于</span> «poiché». <span class="hz">要是</span> «se» (parlato). <span class="hz">既然</span> «visto che». <span class="hz">加上</span> «e in più». <span class="hz">而</span> lega due parti in contrasto o in sequenza, nello scritto; <span class="hz">与</span> «e» tra nomi.',
        en: '<span class="hz">并且</span>, <span class="hz">而且</span> “and also”; <span class="hz">另外</span>, <span class="hz">此外</span> “besides”. <span class="hz">甚至</span> “even”. <span class="hz">不过</span> “but” (lighter than <span class="hz">但是</span>). <span class="hz">因此</span> “therefore”, <span class="hz">由于</span> “since”. <span class="hz">要是</span> “if” (spoken). <span class="hz">既然</span> “seeing that”. <span class="hz">加上</span> “and on top of that”. <span class="hz">而</span> links two parts in contrast or sequence, in writing; <span class="hz">与</span> “and” between nouns.',
      },
      ex: [
        ['这件衣服很好看，不过有点儿贵。', 'Zhè jiàn yīfu hěn hǎokàn, búguò yǒudiǎnr guì.', "Questo vestito è bello, però un po' caro.", "This piece of clothing looks nice, but it's a bit pricey."],
        ['他很忙，甚至没有时间吃饭。', 'Tā hěn máng, shènzhì méiyǒu shíjiān chīfàn.', 'È così impegnato che non ha nemmeno il tempo di mangiare.', "He's so busy he doesn't even have time to eat."],
      ],
    },
    {
      sec: 'words', sub: '助词 · 叹词', zh: '等、者、之、就是；啊、嗯', keys: ['等', '者', '之', '就是', '嗯'],
      t: { it: 'Eccetera, chi fa, di; ah, mh', en: 'Etc., -er, of; ah, mm' },
      p: {
        it: '<span class="hz">等</span> in fondo a un elenco, «eccetera» (scritto). <span class="hz">者</span> fa «chi fa qualcosa»: <span class="hz">作者</span> «autore», <span class="hz">读者</span> «lettore». <span class="hz">之</span> è un <span class="hz">的</span> antico, in espressioni fisse (<span class="hz">之一</span>, «uno di»). <span class="hz">就是</span> in fondo, «ecco, tutto qui». <span class="hz">啊</span> «ah!» di sorpresa, <span class="hz">嗯</span> «mh, sì».',
        en: '<span class="hz">等</span> at the end of a list, “etc.” (written). <span class="hz">者</span> makes “one who does”: <span class="hz">作者</span> “author”, <span class="hz">读者</span> “reader”. <span class="hz">之</span> is an old <span class="hz">的</span>, in set phrases (<span class="hz">之一</span>, “one of”). <span class="hz">就是</span> at the end, “that\'s all, fine”. <span class="hz">啊</span> “ah!” of surprise, <span class="hz">嗯</span> “mm, yes”.',
      },
      ex: [
        ['北京是中国最大的城市之一。', 'Běijīng shì Zhōngguó zuì dà de chéngshì zhī yī.', 'Pechino è una delle città più grandi della Cina.', "Beijing is one of China's biggest cities."],
        ['嗯，我知道了。', 'Ńg, wǒ zhīdào le.', 'Mh, ho capito.', 'Mm, got it.'],
      ],
    },

    // ---------- 短语 ----------
    {
      sec: 'phrases', sub: '结构类型 · 固定短语', zh: '数词+形容词+量词；一A一B、无A无B、有A有B；来得及/来不及、有的是、说不定、不怎么、就是说', keys: ['来得及', '来不及', '有的是', '说不定', '不怎么'],
      t: { it: 'Espressioni fisse', en: 'Set expressions' },
      p: {
        it: 'Un aggettivo come <span class="hz">大</span>, <span class="hz">满</span> può stare tra il numero e il classificatore: <span class="hz">一大碗</span> «una gran ciotola». I quadrisillabi: <span class="hz">一A一B</span>, <span class="hz">有A有B</span> (<span class="hz">有说有笑</span>, «parlando e ridendo»), <span class="hz">无A无B</span> «senza né A né B». E poi: <span class="hz">来得及</span>/<span class="hz">来不及</span> «fare / non fare in tempo», <span class="hz">有的是</span> «ce n\'è in abbondanza», <span class="hz">说不定</span> «chissà, può darsi», <span class="hz">不怎么</span> «non molto», <span class="hz">就是说</span> «cioè».',
        en: 'An adjective like <span class="hz">大</span> or <span class="hz">满</span> can sit between the number and the measure word: <span class="hz">一大碗</span> “a big bowlful”. Four-syllable patterns: <span class="hz">一A一B</span>, <span class="hz">有A有B</span> (<span class="hz">有说有笑</span>, “chatting and laughing”), <span class="hz">无A无B</span> “with neither A nor B”. Then: <span class="hz">来得及</span>/<span class="hz">来不及</span> “there\'s / there isn\'t time”, <span class="hz">有的是</span> “there\'s plenty of”, <span class="hz">说不定</span> “perhaps, who knows”, <span class="hz">不怎么</span> “not very”, <span class="hz">就是说</span> “that is to say”.',
      },
      ex: [
        ['别着急，时间有的是。', 'Bié zháojí, shíjiān yǒudeshì.', 'Calma, di tempo ce n\'è quanto vuoi.', "Don't worry, there's plenty of time."],
        ['说不定他已经到了。', 'Shuōbudìng tā yǐjīng dào le.', 'Può darsi che sia già arrivato.', 'Maybe he has already arrived.'],
        ['他们有说有笑地走进来。', 'Tāmen yǒu shuō yǒu xiào de zǒu jìnlai.', 'Sono entrati chiacchierando e ridendo.', 'They came in chatting and laughing.'],
      ],
    },
    {
      sec: 'phrases', sub: '固定格式', zh: '一+量词+比+一+量词；在……方面；够……的；拿……来说；再也不/没……；怎么都/也+不/没……；为了……而……', keys: ['方面', '够', '再也'],
      t: { it: 'Strutture fisse: sempre più, quanto a, mai più', en: 'Set patterns: ever more, as for, never again' },
      p: {
        it: '<span class="hz">一天比一天</span> «di giorno in giorno sempre più». <span class="hz">在……方面</span> «per quanto riguarda». <span class="hz">够……的</span> «proprio, davvero» (<span class="hz">够累的</span>). <span class="hz">拿……来说</span> «prendiamo ad esempio». <span class="hz">再也不</span>/<span class="hz">再也没</span> «mai più». <span class="hz">怎么也不</span> «in nessun modo». <span class="hz">为了……而……</span> «fare qualcosa allo scopo di».',
        en: '<span class="hz">一天比一天</span> “day by day, ever more”. <span class="hz">在……方面</span> “as regards”. <span class="hz">够……的</span> “really, quite” (<span class="hz">够累的</span>). <span class="hz">拿……来说</span> “take… for example”. <span class="hz">再也不</span>/<span class="hz">再也没</span> “never again”. <span class="hz">怎么也不</span> “no matter what, not”. <span class="hz">为了……而……</span> “do something in order to”.',
      },
      ex: [
        ['天气一天比一天冷了。', 'Tiānqì yì tiān bǐ yì tiān lěng le.', 'Fa più freddo di giorno in giorno.', "It's getting colder by the day."],
        ['我再也不吃这么多了。', 'Wǒ zài yě bù chī zhème duō le.', 'Non mangerò mai più così tanto.', "I'll never eat this much again."],
        ['这个字我怎么也记不住。', 'Zhège zì wǒ zěnme yě jì bu zhù.', 'Questo carattere non riesco proprio a ricordarlo.', "I just can't remember this character."],
      ],
    },
    {
      sec: 'phrases', sub: '固定格式', zh: '动词+一X是一X；（没）有什么（好）X的；X是X，Y是Y；X也得X，不X也得X；X就是了；还X呢；你X你的吧；让/叫你X你就X；说什么/怎么（着）也得X；X就X（点儿）吧；X是X', keys: ['就是'],
      t: { it: 'Modi di dire del parlato', en: 'Spoken turns of phrase' },
      p: {
        it: 'Strutture con una parola ripetuta, tipiche della lingua parlata: <span class="hz">没有什么好怕的</span> «non c\'è niente da temere»; <span class="hz">你忙你的吧</span> «tu pensa alle tue cose»; <span class="hz">贵就贵点儿吧</span> «se costa di più, pazienza»; <span class="hz">还学生呢</span> «e saresti uno studente?»; <span class="hz">说什么也得去</span> «ci devo andare a ogni costo»; <span class="hz">好是好，就是贵</span> «buono è buono, ma costa».',
        en: 'Patterns with a repeated word, typical of speech: <span class="hz">没有什么好怕的</span> “there\'s nothing to be afraid of”; <span class="hz">你忙你的吧</span> “carry on with what you\'re doing”; <span class="hz">贵就贵点儿吧</span> “so it\'s dearer, never mind”; <span class="hz">还学生呢</span> “and you call yourself a student?”; <span class="hz">说什么也得去</span> “I must go whatever happens”; <span class="hz">好是好，就是贵</span> “it\'s good all right, but pricey”.',
      },
      ex: [
        ['这件衣服好看是好看，就是太贵了。', 'Zhè jiàn yīfu hǎokàn shì hǎokàn, jiùshì tài guì le.', 'Questo vestito è bello, sì, ma costa troppo.', "This piece of clothing is nice all right, but it's too expensive."],
        ['你忙你的吧，我自己去。', 'Nǐ máng nǐ de ba, wǒ zìjǐ qù.', 'Tu pensa alle tue cose, vado da solo.', "You carry on, I'll go on my own."],
        ['这有什么好哭的？', 'Zhè yǒu shénme hǎo kū de?', "Che c'è da piangere?", "What's there to cry about?"],
      ],
    },

    // ---------- 句子成分 ----------
    {
      sec: 'parts', sub: '补语 · 程度补语 · 可能补语', zh: '形容词/心理动词+死了/厉害；动词+得/不+了', keys: ['死', '厉害', '了'],
      t: { it: 'Da morire; riuscire o no: 得了, 不了', en: 'To death; can or can\'t: 得了, 不了' },
      p: {
        it: 'Dopo un aggettivo o un verbo di sentimento, <span class="hz">死了</span> e <span class="hz">得厉害</span> vogliono dire «da morire, tremendamente»: <span class="hz">饿死了</span> «muoio di fame». E <span class="hz">得了</span> <i>de liǎo</i> / <span class="hz">不了</span> <i>bu liǎo</i> dopo un verbo dicono se è possibile farlo: <span class="hz">吃不了</span> «non riesco a mangiarlo (tutto)», <span class="hz">去不了</span> «non posso andarci».',
        en: 'After an adjective or a verb of feeling, <span class="hz">死了</span> and <span class="hz">得厉害</span> mean “to death, terribly”: <span class="hz">饿死了</span> “starving”. And <span class="hz">得了</span> <i>de liǎo</i> / <span class="hz">不了</span> <i>bu liǎo</i> after a verb say whether it can be done: <span class="hz">吃不了</span> “can\'t eat (all of) it”, <span class="hz">去不了</span> “can\'t go”.',
      },
      ex: [
        ['今天热死了！', 'Jīntiān rè sǐ le!', 'Oggi si muore di caldo!', "It's boiling today!"],
        ['菜太多了，我们吃不了。', 'Cài tài duō le, wǒmen chī bu liǎo.', 'È troppo cibo, non riusciamo a mangiarlo tutto.', "There's too much food, we can't eat it all."],
        ['明天我有事，去不了。', 'Míngtiān wǒ yǒu shì, qù bu liǎo.', 'Domani ho un impegno, non posso venire.', "I'm busy tomorrow, I can't come."],
      ],
    },

    // ---------- 句子的类型 ----------
    {
      sec: 'types', sub: '句类 · 反问句', zh: '难道……吗？；由疑问代词构成的反问句', keys: ['难道'],
      t: { it: 'Domande retoriche: 难道, e «chi lo sa?»', en: 'Rhetorical questions: 难道, and “who knows?”' },
      p: {
        it: '<span class="hz">难道……吗？</span> «non vorrai dire che…?», con sorpresa o rimprovero. Anche le parole interrogative fanno domande retoriche, che valgono come negazioni: <span class="hz">谁知道？</span> «chi lo sa?» (= nessuno), <span class="hz">哪儿有？</span> «ma dove?» (= non c\'è).',
        en: '<span class="hz">难道……吗？</span> “surely you don\'t mean…?”, with surprise or reproach. Question words also make rhetorical questions that work as negatives: <span class="hz">谁知道？</span> “who knows?” (= nobody), <span class="hz">哪儿有？</span> “where?” (= there isn\'t).',
      },
      ex: [
        ['难道你不认识我了吗？', 'Nándào nǐ bú rènshi wǒ le ma?', 'Non mi riconosci più?', "Don't you recognise me any more?"],
        ['我哪儿有时间玩儿？', 'Wǒ nǎr yǒu shíjiān wánr?', 'E dove lo trovo il tempo per divertirmi?', 'Where would I find time to have fun?'],
      ],
    },
    {
      sec: 'types', sub: '“把”字句', zh: '主语+把+宾语+动词（+一/了）+动词；+动词+了；+动词+动量补语/时量补语；+状语+动词', keys: ['把'],
      t: { it: 'Altre forme del 把', en: 'More shapes of 把' },
      p: {
        it: 'Il verbo dopo <span class="hz">把</span> non può restare nudo, ma basta poco: ripeterlo (<span class="hz">把桌子擦一擦</span>), un <span class="hz">了</span> (<span class="hz">把药吃了</span>, «prendi la medicina»), quante volte o quanto a lungo (<span class="hz">把课文读三遍</span>), o un avverbio davanti (<span class="hz">把东西往里搬</span>).',
        en: 'The verb after <span class="hz">把</span> can\'t stand bare, but little is enough: doubling it (<span class="hz">把桌子擦一擦</span>), a <span class="hz">了</span> (<span class="hz">把药吃了</span>, “take the medicine”), how many times or how long (<span class="hz">把课文读三遍</span>), or an adverbial in front (<span class="hz">把东西往里搬</span>).',
      },
      ex: [
        ['你把药吃了吗？', 'Nǐ bǎ yào chī le ma?', 'Hai preso la medicina?', 'Have you taken your medicine?'],
        ['请把课文读三遍。', 'Qǐng bǎ kèwén dú sān biàn.', 'Leggete il testo tre volte.', 'Please read the text three times.'],
      ],
    },
    {
      sec: 'types', sub: '被动句 · 兼语句', zh: '主语+叫/让+宾语+动词+其他成分；表扬/批评……；选……当/做；使/让', keys: ['叫', '让', '表扬', '批评', '使'],
      t: { it: 'Passivo con 叫 e 让; lodare, eleggere, rendere', en: 'Passive with 叫 and 让; praise, elect, make' },
      p: {
        it: 'Nel parlato il passivo si fa anche con <span class="hz">叫</span> e <span class="hz">让</span>, ma allora chi agisce va detto: <span class="hz">让他吃了</span>. E altre frasi a doppio ruolo: lodare o criticare qualcuno per qualcosa (<span class="hz">老师表扬他写得好</span>), eleggere qualcuno a una carica (<span class="hz">选他当班长</span>), rendere qualcuno in un certo stato con <span class="hz">使</span> o <span class="hz">让</span> (<span class="hz">这件事让我很高兴</span>).',
        en: 'In speech the passive is also made with <span class="hz">叫</span> and <span class="hz">让</span>, but then the doer must be named: <span class="hz">让他吃了</span>. And more pivot sentences: praising or criticising someone for something (<span class="hz">老师表扬他写得好</span>), electing someone to a role (<span class="hz">选他当班长</span>), making someone feel some way with <span class="hz">使</span> or <span class="hz">让</span> (<span class="hz">这件事让我很高兴</span>).',
      },
      ex: [
        ['我的蛋糕让弟弟吃了。', 'Wǒ de dàngāo ràng dìdi chī le.', 'La mia torta se l\'è mangiata mio fratello.', 'My cake got eaten by my little brother.'],
        ['大家选他当班长。', 'Dàjiā xuǎn tā dāng bānzhǎng.', 'Lo hanno eletto tutti capoclasse.', 'Everyone chose him as class monitor.'],
        ['这个消息使我很高兴。', 'Zhège xiāoxi shǐ wǒ hěn gāoxìng.', 'Questa notizia mi ha reso molto felice.', 'This news made me very happy.'],
      ],
    },
    {
      sec: 'types', sub: '比较句 · 双重否定句', zh: 'A不如B（+形容词）；跟……相比；用双重否定表示强调', keys: ['不如', '相比'],
      t: { it: 'Non è all\'altezza; due negazioni', en: 'Not as good as; double negatives' },
      p: {
        it: '<span class="hz">A不如B</span> «A non vale B», o con un aggettivo «non è… come B». <span class="hz">跟……相比</span> «rispetto a». E due negazioni fanno un\'affermazione più forte: <span class="hz">不能不去</span> «non posso non andarci», cioè «devo».',
        en: '<span class="hz">A不如B</span> “A is not as good as B”, or with an adjective “not as… as B”. <span class="hz">跟……相比</span> “compared with”. And two negatives make a stronger positive: <span class="hz">不能不去</span> “can\'t not go”, that is “must”.',
      },
      ex: [
        ['坐公交车不如骑自行车快。', 'Zuò gōngjiāochē bùrú qí zìxíngchē kuài.', "L'autobus non è veloce come la bicicletta.", 'The bus is not as quick as cycling.'],
        ['这件事我不能不告诉他。', 'Zhè jiàn shì wǒ bù néng bú gàosu tā.', 'Questa cosa non posso non dirgliela.', 'I have to tell him about this.'],
      ],
    },

    // ---------- 复句 ----------
    {
      sec: 'complex', sub: '并列复句 · 承接复句', zh: '不是……，而是……；既……，又/也……；一方面……，另一方面……；首先……，其次/然后……；……，于是……', keys: ['而是', '既', '一方面', '首先', '其次', '于是'],
      t: { it: 'Non… ma; da un lato… dall\'altro; prima, poi, così', en: 'Not… but; on the one hand…; first, then, so' },
      p: {
        it: '<span class="hz">不是……，而是……</span> «non… ma…», correggendo. <span class="hz">既……又……</span> «sia… sia…». <span class="hz">一方面……另一方面……</span> «da un lato… dall\'altro». Per mettere in ordine: <span class="hz">首先……其次/然后……</span> «innanzitutto… poi». <span class="hz">于是</span> «e così, allora», per una conseguenza nel racconto.',
        en: '<span class="hz">不是……，而是……</span> “not… but…”, correcting. <span class="hz">既……又……</span> “both… and…”. <span class="hz">一方面……另一方面……</span> “on the one hand… on the other”. To set out in order: <span class="hz">首先……其次/然后……</span> “first… second/then”. <span class="hz">于是</span> “and so”, for a consequence in a story.',
      },
      ex: [
        ['他不是不想来，而是没有时间。', 'Tā bú shì bù xiǎng lái, ér shì méiyǒu shíjiān.', 'Non è che non voglia venire, è che non ha tempo.', "It's not that he doesn't want to come, he has no time."],
        ['这里的东西既便宜又好。', 'Zhèlǐ de dōngxi jì piányi yòu hǎo.', 'Qui la roba è economica e buona.', 'Things here are both cheap and good.'],
        ['下雨了，于是我们回家了。', 'Xià yǔ le, yúshì wǒmen huí jiā le.', 'Si è messo a piovere, e così siamo tornati a casa.', 'It started raining, so we went home.'],
      ],
    },
    {
      sec: 'complex', sub: '递进复句 · 选择复句', zh: '……，甚至……；不仅/不光……，还/而且……；……，并且……；连……也/都……，……更……；不是……，就是……', keys: ['甚至', '不仅', '不光', '并且', '连', '就是'],
      t: { it: 'Non solo, persino; o l\'uno o l\'altro', en: 'Not only, even; if not one, the other' },
      p: {
        it: '<span class="hz">不仅</span>/<span class="hz">不光</span> «non solo», con <span class="hz">还</span> o <span class="hz">而且</span> dopo. <span class="hz">连……也/都……</span> «persino»: <span class="hz">连他都知道</span>, «lo sa perfino lui», e se c\'è un seguito, <span class="hz">更</span> «a maggior ragione». <span class="hz">不是……就是……</span> «se non è A, è B», tra due sole possibilità.',
        en: '<span class="hz">不仅</span>/<span class="hz">不光</span> “not only”, with <span class="hz">还</span> or <span class="hz">而且</span> after. <span class="hz">连……也/都……</span> “even”: <span class="hz">连他都知道</span>, “even he knows”, and if more follows, <span class="hz">更</span> “all the more”. <span class="hz">不是……就是……</span> “if not A, then B”, between just two options.',
      },
      ex: [
        ['这个问题连老师都不知道，我更不知道了。', 'Zhège wèntí lián lǎoshī dōu bù zhīdào, wǒ gèng bù zhīdào le.', "Questa risposta non la sa nemmeno l'insegnante, figurati io.", "Not even the teacher knows this, let alone me."],
        ['周末他不是看书，就是运动。', 'Zhōumò tā bú shì kàn shū, jiù shì yùndòng.', 'Nel fine settimana o legge o fa sport.', 'At weekends he either reads or does sport.'],
      ],
    },
    {
      sec: 'complex', sub: '转折复句', zh: '尽管……，但是/可是……；……，然而……；……，不过……；……X是X，就是/不过……', keys: ['尽管', '然而', '不过'],
      t: { it: 'Sebbene, tuttavia', en: 'Although, however' },
      p: {
        it: '<span class="hz">尽管……，但是……</span> «per quanto…, tuttavia…», più forte di <span class="hz">虽然</span>. <span class="hz">然而</span> «tuttavia» (scritto), <span class="hz">不过</span> «però» (leggero). E <span class="hz">X是X，就是……</span> ammette una cosa per poi limitarla: «bello è bello, ma…».',
        en: '<span class="hz">尽管……，但是……</span> “even though…, still…”, stronger than <span class="hz">虽然</span>. <span class="hz">然而</span> “however” (written), <span class="hz">不过</span> “but” (light). And <span class="hz">X是X，就是……</span> grants something then limits it: “nice it is, but…”.',
      },
      ex: [
        ['尽管很累，但是他还是坚持跑完了。', 'Jǐnguǎn hěn lèi, dànshì tā háishi jiānchí pǎo wán le.', 'Per quanto fosse stanco, ha tenuto duro fino alla fine della corsa.', 'Tired as he was, he kept going to the end of the run.'],
      ],
    },
    {
      sec: 'complex', sub: '假设复句 · 条件复句', zh: '……，否则……；要是……，就……；不管……，都/也……；无论……，都/也……', keys: ['否则', '要是', '不管', '无论'],
      t: { it: 'Altrimenti; se; comunque', en: 'Otherwise; if; no matter' },
      p: {
        it: '<span class="hz">要是……就……</span> «se…» parlato. <span class="hz">否则</span> «altrimenti», all\'inizio della seconda frase. <span class="hz">不管</span> (parlato) e <span class="hz">无论</span> (scritto) «comunque, qualunque»: la prima parte contiene una domanda o un\'alternativa, la seconda <span class="hz">都</span> o <span class="hz">也</span>.',
        en: '<span class="hz">要是……就……</span> spoken “if…”. <span class="hz">否则</span> “otherwise”, opening the second clause. <span class="hz">不管</span> (spoken) and <span class="hz">无论</span> (written) “no matter”: the first part holds a question or an alternative, the second <span class="hz">都</span> or <span class="hz">也</span>.',
      },
      ex: [
        ['快走吧，否则要迟到了。', 'Kuài zǒu ba, fǒuzé yào chídào le.', 'Sbrighiamoci, altrimenti arriviamo tardi.', "Let's hurry, or we'll be late."],
        ['不管天气怎么样，他都去跑步。', 'Bùguǎn tiānqì zěnmeyàng, tā dōu qù pǎobù.', 'Con qualunque tempo, lui va a correre.', 'Whatever the weather, he goes running.'],
      ],
    },
    {
      sec: 'complex', sub: '因果复句 · 目的复句 · 让步复句 · 紧缩复句', zh: '既然……，就……；（由于）……，因此……；……，好……；即使……，也……；就是……，也……；不……也……', keys: ['既然', '由于', '因此', '好', '即使'],
      t: { it: 'Visto che; perciò; così da; anche se', en: 'Since; therefore; so that; even if' },
      p: {
        it: '<span class="hz">既然……就……</span> «visto che…, allora…». <span class="hz">由于……，因此……</span> «poiché…, perciò…», scritto. <span class="hz">好</span> davanti al secondo verbo: «così da» (<span class="hz">带上伞，好不淋雨</span>). <span class="hz">即使</span> (o <span class="hz">就是</span>) <span class="hz">……也……</span> «anche se». <span class="hz">不……也……</span> «anche senza».',
        en: '<span class="hz">既然……就……</span> “seeing that…, then…”. <span class="hz">由于……，因此……</span> “since…, therefore…”, written. <span class="hz">好</span> before the second verb: “so as to” (<span class="hz">带上伞，好不淋雨</span>). <span class="hz">即使</span> (or <span class="hz">就是</span>) <span class="hz">……也……</span> “even if”. <span class="hz">不……也……</span> “even without”.',
      },
      ex: [
        ['既然你不舒服，就早点儿回家吧。', 'Jìrán nǐ bù shūfu, jiù zǎo diǎnr huí jiā ba.', 'Visto che non stai bene, torna a casa presto.', "Since you're not feeling well, go home early."],
        ['即使下雨，我们也要去。', 'Jíshǐ xià yǔ, wǒmen yě yào qù.', 'Anche se piove, ci andiamo lo stesso.', "Even if it rains, we're still going."],
        ['把我的电话号码记下来，好给我打电话。', 'Bǎ wǒ de diànhuà hàomǎ jì xiàlai, hǎo gěi wǒ dǎ diànhuà.', 'Segnati il mio numero, così mi puoi chiamare.', 'Write down my number so you can call me.'],
      ],
    },

    // ---------- 特殊表达法 ----------
    {
      sec: 'special', sub: '数的表示法', zh: '数词+来+量词；大约、左右、前后；小数、分数、百分数、倍数', keys: ['来', '大约', '左右', '前后', '百分之', '倍'],
      t: { it: 'Numeri approssimati, decimali, percentuali, multipli', en: 'Rough numbers, decimals, percentages, multiples' },
      p: {
        it: '<span class="hz">来</span> dopo le decine, «una…ina»: <span class="hz">十来个</span> «una decina». <span class="hz">大约</span> davanti al numero «circa»; <span class="hz">左右</span> dopo «circa»; <span class="hz">前后</span> dopo una data «intorno a». Decimali con <span class="hz">点</span> (<span class="hz">三点五</span>, 3,5); frazioni «su tante parti, tante» (<span class="hz">三分之一</span>, un terzo); percentuali <span class="hz">百分之</span> + numero (<span class="hz">百分之二十</span>); multipli con <span class="hz">倍</span> (<span class="hz">两倍</span>, il doppio).',
        en: '<span class="hz">来</span> after tens, “or so”: <span class="hz">十来个</span> “ten or so”. <span class="hz">大约</span> before the number “about”; <span class="hz">左右</span> after it “or so”; <span class="hz">前后</span> after a date “around”. Decimals with <span class="hz">点</span> (<span class="hz">三点五</span>, 3.5); fractions “of so many parts, so many” (<span class="hz">三分之一</span>, a third); percentages <span class="hz">百分之</span> + number (<span class="hz">百分之二十</span>); multiples with <span class="hz">倍</span> (<span class="hz">两倍</span>, twice).',
      },
      ex: [
        ['来了十来个人。', 'Lái le shí lái ge rén.', 'Sono venute una decina di persone.', 'Ten or so people came.'],
        ['我每天八点左右到公司。', 'Wǒ měi tiān bā diǎn zuǒyòu dào gōngsī.', 'Arrivo in ufficio ogni giorno verso le otto.', 'I get to the office at about eight every day.'],
        ['班里百分之六十的学生是女生。', 'Bān li bǎi fēn zhī liùshí de xuésheng shì nǚshēng.', 'Il sessanta per cento della classe sono ragazze.', 'Sixty per cent of the class are girls.'],
      ],
    },
  ],
};
