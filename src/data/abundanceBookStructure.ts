export interface ChapterEssence {
  id: string;
  chapterNumber: number;
  titleZh: string;
  titleEn: string;
  subtitleZh: string;
  subtitleEn: string;
  corePhilosophyZh: string;
  corePhilosophyEn: string;
  awakeningEssenceZh: string;
  awakeningEssenceEn: string;
  practiceKeyZh: string;
  practiceKeyEn: string;
  goldenMantras: {
    textZh: string;
    textEn: string;
    insightZh: string;
  }[];
  reflectionPrompts: string[];
}

export interface UserBookNote {
  id: string;
  chapterId?: string;
  chapterTitle?: string;
  quoteOrTitle: string;
  reflection: string;
  category: 'wealth' | 'worth' | 'surrender' | 'gratitude' | 'now' | 'general';
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const ABUNDANCE_CHAPTERS_DATA: ChapterEssence[] = [
  {
    id: 'ch-1',
    chapterNumber: 1,
    titleZh: '认出丰盛的原初本质',
    titleEn: 'Recognizing the True Nature of Abundance',
    subtitleZh: '本自具足 • 非向外抓取',
    subtitleEn: 'Inherent Wholeness • Beyond External Grasping',
    corePhilosophyZh: '世俗心智常将“丰盛”等同于物质的堆砌、名利的累积与外界的认可。然而，建立在“我不够”之上的抓取，只会不断喂养内在的匮乏感。生命最根本的真相是：你本就是完整无缺的整体，不需要向外求索来证明自己的价值。',
    corePhilosophyEn: 'The worldly mind equates abundance with material accumulation, status, and external validation. However, striving born of "not enough" only fuels internal scarcity. The ultimate truth of life is that you are already complete; nothing external is needed to prove your worth.',
    awakeningEssenceZh: '丰盛不是做加法，而是做减法。剥离掉“我缺少什么”的潜意识认知滤镜，认出你的存在本身就是宇宙至高无上的丰盛杰作。向内体认自己的圆满，外在的世界自然与之共振。',
    awakeningEssenceEn: 'Abundance is not addition, but subtraction. Strip away the subconscious filter of "what I lack", and realize your existence itself is a cosmic masterpiece of wholeness. Recognize inner completeness, and outer reality naturally resonates.',
    practiceKeyZh: '在感到匮乏或攀比时，将右手放在心口，深呼吸三次，在心中默念：“我本自具足，生命借由我而完整。”',
    practiceKeyEn: 'Whenever feeling lack or comparison, place your right hand on your chest, take three deep breaths, and affirm: "I am inherently complete. Life is whole through me."',
    goldenMantras: [
      {
        textZh: '真正的丰盛不是去占有什么，而是认出你本自具足的生命本质。',
        textEn: 'True abundance is not possessing anything, but recognizing that your essence is already complete and whole.',
        insightZh: '你就是生命的全部，任何外在的追求，都比不上向内体认自己的圆满。'
      },
      {
        textZh: '你不需要去创造丰盛，因为你本来就处于丰盛之中。你只需要认出这个实相。',
        textEn: 'You do not need to create abundance, because you are already within it. You only need to recognize this reality.',
        insightZh: '丰盛是生命的底色，匮乏只是头脑投射出的暂时阴影。'
      }
    ],
    reflectionPrompts: [
      '在我的日常生活中，我在哪些事情上最容易产生“我还不够好/不够多”的错觉？',
      '如果放下所有的证明与攀比，我此时此刻最深沉的平安是什么？'
    ]
  },
  {
    id: 'ch-2',
    chapterNumber: 2,
    titleZh: '解构小我的匮乏预设',
    titleEn: 'Deconstructing Ego’s Scarcity Presets',
    subtitleZh: '看清竞争与恐惧的幻相',
    subtitleEn: 'Seeing Through Fear and Competition',
    corePhilosophyZh: '小我（Ego）的生存机制完全构筑在分离感与竞争逻辑之上。它不断对你耳语：资源是有限的、别人得到了你就失去了、时间快要来不及了。这些根深蒂固的恐惧预设，筑起了阻隔丰盛流动的内在藩篱。',
    corePhilosophyEn: 'The ego’s survival mechanism thrives on separation and zero-sum competition. It constantly whispers: resources are finite, if others gain you lose, time is running out. These deep-seated fears erect barriers blocking the effortless flow of abundance.',
    awakeningEssenceZh: '在无限的宇宙生命整体中，没有匮乏，也没有争夺。别人的绽放不仅不会夺走你的机会，反而为整个世界开拓了更大的可能性。属于你的神圣天命，没有任何人能够剥夺。',
    awakeningEssenceEn: 'In the infinite Whole, there is no lack and no competition. Another’s blooming does not diminish your share; it expands the field of possibilities. Nothing truly aligned with your divine destiny can ever be stolen.',
    practiceKeyZh: '觉察到嫉妒或焦虑升起时，不批判自己，微笑着对那股情绪说：“谢谢你提醒我，但我选择安住在宇宙无限的繁华与共享中。”',
    practiceKeyEn: 'When envy or anxiety arises, smile at the emotion without judgment: "Thank you for reminding me, but I choose to rest in infinite cosmic prosperity."',
    goldenMantras: [
      {
        textZh: '在无限的整体中，没有竞争，只有永无止境的绽放和分享。',
        textEn: 'In the infinite Whole, there is no competition—only endless blooming and mutual sharing.',
        insightZh: '放下与任何人的较劲，用赞叹取代嫉妒，丰盛自会成倍回流。'
      },
      {
        textZh: '唯有当你停止与生命抗争、停止自我证明时，最纯粹的喜悦与繁荣才会降临。',
        textEn: 'Only when you stop fighting with life and stop proving yourself, do true joy and prosperity descend.',
        insightZh: '不再证明自己有价值，因为你的存在本身就是不可替代的尊贵。'
      }
    ],
    reflectionPrompts: [
      '我最近是否曾因为他人的成就而感到隐秘的紧绷？',
      '我愿意真心祝福身边所有人的成功与喜悦吗？'
    ]
  },
  {
    id: 'ch-3',
    chapterNumber: 3,
    titleZh: '全然臣服与交托给整体',
    titleEn: 'Total Surrender to the Greater Whole',
    subtitleZh: '放下掌控 • 顺流而行',
    subtitleEn: 'Releasing Control • Flowing with Grace',
    corePhilosophyZh: '大部分的人生痛苦与疲惫，都来自我们试图以微小的个人意愿去对抗大生命的流动。我们紧紧抓住每一个预设的结果，为一点偏差而惶恐不安。臣服并非软弱退缩，而是将有限的自我完全交托给无限智慧的生命源头。',
    corePhilosophyEn: 'Most life suffering comes from trying to micromanage reality with personal will. We grasp stubbornly at specific outcomes and panic over deviations. Surrender is not weak submission; it is entrusting our limited ego to the supreme wisdom of the Source.',
    awakeningEssenceZh: '“一切都是最好的安排。”这不是一句盲目的安慰，而是宇宙运行的至深实相。当你放开双手退后一步，不再阻碍生命的自然展开，宇宙最完美的解决方案便会以不可思议的方式降临。',
    awakeningEssenceEn: '"Everything is the most perfect arrangement." This is not blind comfort, but the profound law of reality. When you release your grip and step back, the universe’s most sublime resolution manifests effortlessly.',
    practiceKeyZh: '面对难题或僵局时，闭上眼睛，深深呼气，将紧绷的肩膀下沉，默念：“我放手，我交托，我信赖宇宙最好的安排。”',
    practiceKeyEn: 'Facing any deadlock, close your eyes, exhale deeply, relax your shoulders, and affirm: "I let go, I surrender, I trust the perfect divine order."',
    goldenMantras: [
      {
        textZh: '丰盛不是累积，而是放手。唯有当你放手，退回无限的整体，生命才会丰盛地涌来。',
        textEn: 'Abundance is not accumulation, but letting go. When you surrender into the Whole, life floods in richly.',
        insightZh: '小我总想抓取更多，而放手的你本就拥有宇宙的一切。'
      },
      {
        textZh: '接纳眼前的一切，哪怕是最细小的挫折，也是化装成考验的宏大祝福。',
        textEn: 'Accept everything before you; even the smallest setback is a grand blessing in disguise.',
        insightZh: '在每一个不如意背后，都藏着生命要送给你的升维礼物。'
      }
    ],
    reflectionPrompts: [
      '我现在正紧紧抓住哪件事不肯放手？如果我今天彻底交托，会发生什么？',
      '回看过去某次曾以为是“灾难”的经历，它是如何变成日后最好的礼物的？'
    ]
  },
  {
    id: 'ch-4',
    chapterNumber: 4,
    titleZh: '无条件感恩的共振奇迹',
    titleEn: 'The Quantum Resonance of Unconditional Gratitude',
    subtitleZh: '“谢谢”是通向丰盛的最快捷径',
    subtitleEn: '“Thank You” Is the Direct Shortcut',
    corePhilosophyZh: '世俗的感恩往往是有条件的：“因为我得到了好结果，所以我感谢”。但杨定一博士揭示，最深沉的丰盛调频是无条件的感恩——不要去想谢什么，只是发自内心持续地念诵“谢谢”，这是消融一切匮乏、不满与恐惧的最纯净振动。',
    corePhilosophyEn: 'Conventional gratitude is conditional: "I thank because I received." But Dr. Jan reveals true abundance is unconditional gratitude. Don’t analyze reasons; simply chant "Thank you" continuously from the heart—the purest frequency dissolving all lack.',
    awakeningEssenceZh: '对顺境说谢谢，对逆境也说谢谢。每一声真诚的“谢谢”，都在打碎小我制造的怨怼与隔阂，将你的潜意识频率瞬间提升至与造化同频的丰盛场域。',
    awakeningEssenceEn: 'Say thank you to ease, and thank you to hardship. Every genuine "thank you" dissolves resentment and lifts your subconscious into the harmonic field of creation.',
    practiceKeyZh: '无论何时何地，心念一转就默念“谢谢你，我爱你”。在清晨醒来和夜晚入睡前，让心中的“谢谢”如溪流般流淌整整一分钟。',
    practiceKeyEn: 'Whenever thoughts drift, softly chant "Thank you, I love you." Let gratitude flow like a gentle stream upon waking and before sleep.',
    goldenMantras: [
      {
        textZh: '“谢谢”是消融一切匮乏、不满与恐惧最快、最直接的捷径。它与宇宙的完美脉动共鸣。',
        textEn: '"Thank you" is the fastest shortcut to dissolve all scarcity, resentment, and fear. It pulses with the universe.',
        insightZh: '不要去追问理由，单纯地沉浸在“谢谢”的神圣振动中。'
      },
      {
        textZh: '把所有的担忧、不满、愤怒交付给“谢谢”。“谢谢”会把它们带回源头，转化为最好的安排。',
        textEn: 'Hand over all worries and anger to "Thank you". It will return them to Source and transmute them into grace.',
        insightZh: '以感恩之火，融化心智的一切冰霜。'
      }
    ],
    reflectionPrompts: [
      '今天我有哪三件微小的事情想要由衷地说一声“谢谢”？',
      '面对当前让我感到有些棘手的人或事，我能否尝试在心里对他说一声“谢谢你”？'
    ]
  },
  {
    id: 'ch-5',
    chapterNumber: 5,
    titleZh: '活在永恒的此时此刻',
    titleEn: 'Resting in the Eternal Here and Now',
    subtitleZh: '当下的力量 • 时间幻象的解脱',
    subtitleEn: 'The Power of Presence • Beyond the Trap of Time',
    corePhilosophyZh: '人类的所有焦虑都寄生于“未来”，所有的悔恨都滞留于“过去”。然而，过去只存在于记忆，未来只存在于想象，唯一真实、拥有全部能量与生机的，唯有“此时、此地、此刻”。',
    corePhilosophyEn: 'All human anxiety parasitizes on the "future", and all remorse lingers in the "past". Yet past is only memory and future is only projection. The only realm endowed with true life and power is the Here and Now.',
    awakeningEssenceZh: '丰盛从来不在明天。等待未来的丰盛，本质上是对当下丰盛的否定。当你把注意力完全收回到眼前的呼吸、身体的触感与胸膛的虚空中，你便脱离了时间的囚笼，安住在永恒的圆满中。',
    awakeningEssenceEn: 'Abundance never arrives tomorrow. Waiting for future abundance denies present richness. When bringing attention back to the breath, physical sensations, and inner stillness, you step out of time into eternal wholeness.',
    practiceKeyZh: '进行“五感接地”：看一眼周围的色彩，摸一摸身旁的物件，听一听背景的声音，感受一次清凉的吸气，对自己微笑：“此时此刻，我平安无事，本自富足。”',
    practiceKeyEn: 'Perform 5-sensory grounding: observe surrounding light, feel physical touch, hear ambient sound, take a conscious breath, and smile: "Here and now, all is well and complete."',
    goldenMantras: [
      {
        textZh: '不要把丰盛寄托在未来的某个目标上。就在此时、此地，深吸一口气，丰盛已然圆满。',
        textEn: 'Do not pin abundance on a future goal. Right here, right now, take a deep breath; abundance is already fulfilled.',
        insightZh: '当下这个瞬间，就是宇宙赋予你最神圣的礼物。'
      },
      {
        textZh: '当你从“我缺什么”的幻觉中醒来，每一刻、每一声呼吸都散发着大宇宙圆满无缺的荣光。',
        textEn: 'When you wake up from the illusion of lack, every moment and breath radiates cosmic fullness.',
        insightZh: '注意力回到呼吸，生命大能即刻苏醒。'
      }
    ],
    reflectionPrompts: [
      '我今天有多少时间是真正“活在此刻”，又有多少时间是在为未发生的事担忧？',
      '停下 10 秒钟，静静感受胸口那片深邃而平静的意识空间。'
    ]
  },
  {
    id: 'ch-6',
    chapterNumber: 6,
    titleZh: '神圣配得感与自性回归',
    titleEn: 'Divine Worthiness and Realizing the Self',
    subtitleZh: '你无需证明 • 存在即尊贵',
    subtitleEn: 'No Proof Needed • Existence Is Pure Dignity',
    corePhilosophyZh: '许多人无法显化丰盛的根源在于深层的“不配得感”。从小到大的条件化教育让我们误以为：必须吃尽苦头、必须十全十美、必须比别人更优秀，才配得到丰盛的生活。这是对生命神圣本质的最大误解。',
    corePhilosophyEn: 'The root impediment to manifesting abundance is a deeply buried sense of unworthiness. Conditional conditioning made us believe we must suffer, be flawless, or outperform others to deserve goodness. This is the ultimate misunderstanding of life.',
    awakeningEssenceZh: '你与宇宙的源头从未真正分离过。就像阳光无条件照耀每一株草木，造化对你的滋养与馈赠从不需要任何前置条件。认出自己的神圣身分，敞开胸怀领受世间极致的庄严与优雅。',
    awakeningEssenceEn: 'You have never been separated from the Source. Just as sunlight bathes every leaf unconditionally, life’s nourishing flow requires no worldly prerequisites. Claim your divine nature and welcome supreme grace.',
    practiceKeyZh: '每天对着镜子真诚地注视自己的眼睛，微笑着说：“我值得世间所有的爱、财富与美好，不是因为我做了什么，只因为我本就是神圣生命本身。”',
    practiceKeyEn: 'Look into the mirror with a loving smile: "I deserve all love, wealth, and elegance in this universe, simply because I am the living expression of the Divine."',
    goldenMantras: [
      {
        textZh: '丰盛是一种绝对的心境，它来自你对生命无条件信赖而产生的神圣大配得感。',
        textEn: 'Abundance is an absolute state of mind stemming from divine worthiness through unconditional trust in life.',
        insightZh: '你配得上宇宙所有极致的美好，不需任何世俗前提。'
      },
      {
        textZh: '只要你不把自己局限在小小的肉体和念头中，你就是整体，整体就是你。',
        textEn: 'As long as you do not confine yourself to a small body and fleeting thoughts, you are the Whole.',
        insightZh: '你不是大海中的一滴水，你就是整片大海融入了这一滴水之中。'
      }
    ],
    reflectionPrompts: [
      '在哪些领域我还在潜意识里觉得自己“不配拥有”极致的美好？',
      '如果我从今天起全然拥抱自己的神圣配得感，我的生活会发生怎样的改变？'
    ]
  },
  {
    id: 'ch-7',
    chapterNumber: 7,
    titleZh: '金钱与物质能量的顺流实相',
    titleEn: 'The Reality of Money as Energetic Flow',
    subtitleZh: '从紧抓匮乏到喜悦回流',
    subtitleEn: 'From Scarcity Grip to Joyful Circulation',
    corePhilosophyZh: '金钱本身没有任何属性，它只是宇宙中流动的能量载体。当你怀着匮乏与恐惧的心态对待金钱时，金钱的流动就会受阻；当你怀着喜悦、感恩与服务众生的心境时，金钱便会如大河入海般自然回流。',
    corePhilosophyEn: 'Money possesses no inherent nature; it is merely an energetic vessel. When approached with fear, its circulation stagnates. When met with joy, gratitude, and a desire to serve the Whole, wealth flows back like rivers into the sea.',
    awakeningEssenceZh: '金钱不是争夺来的，而是你在提供价值、传递爱与散发安宁时，能量自然而然的丰盛回响。把每一次花钱都视为对世界的祝福与支持，把每一次收款都视为宇宙对你的赞许与拥抱。',
    awakeningEssenceEn: 'Money is not conquered; it is the natural reverberation of value, love, and serenity you radiate into the world. View every expense as a blessing, and every receipt as an embrace from the cosmos.',
    practiceKeyZh: '在支付账单或购物付款时，在心中送出一句祝福：“感谢这笔金钱带来的便利与美好，愿它滋养每一个经手的人，并以成倍的丰盛顺流回归。”',
    practiceKeyEn: 'When paying bills or purchasing, send a blessing: "Thank you for this service. May this money nourish everyone it touches and return manifold in joyful flow."',
    goldenMantras: [
      {
        textZh: '金钱不是追逐来的，金钱是你在提供价值与散发安宁时，宇宙能量自然的回流。',
        textEn: 'Money is not chased; it is the natural backflow of universal energy when you radiate peace and value.',
        insightZh: '调整你的频率到喜悦与服务，财富便会顺着光明的轨道奔向你。'
      },
      {
        textZh: '天地万物从不匆忙，却无一匮乏。与大自然同步，便拥有无限资粮。',
        textEn: 'Nature never hurries, yet lacks nothing. Harmonize with nature to receive infinite sustenance.',
        insightZh: '把心念安放在丰盛的源头，外在的金钱不过是水到渠成的显化。'
      }
    ],
    reflectionPrompts: [
      '我在花钱时常带着担忧还是带着喜悦与感恩？',
      '我如何通过自己独特的才华与热情，为周围的人带来更多的轻松与价值？'
    ]
  },
  {
    id: 'ch-8',
    chapterNumber: 8,
    titleZh: '宽恕与清理潜意识包袱',
    titleEn: 'Forgiveness and Clearing Subconscious Baggage',
    subtitleZh: '以慈悲腾出承接奇迹的虚空',
    subtitleEn: 'Clearing Space for Miracles Through Compassion',
    corePhilosophyZh: '潜意识中未化解的怨恨、委屈与对过去的执念，就像屋子里堆满的陈旧垃圾，挡住了丰盛阳光的照入。原谅并非认同伤害，而是斩断困住你自身生命的负向能量绳索。',
    corePhilosophyEn: 'Unresolved resentment, grievance, and clingings in the subconscious are like accumulated clutter blocking sunlight. Forgiving is not condoning harm, but severing energetic chains that bind your life.',
    awakeningEssenceZh: '宽恕过去的一切人与事，是给心灵腾出空间接纳奇迹的最高雅举动。借助“对不起、请原谅我、谢谢你、我爱你”，将过往的所有创伤交付给无条件的爱，彻底回归清净明朗。',
    awakeningEssenceEn: 'Forgiving the past is the most elegant act to clear space in your soul for miracles. Through "I am sorry, please forgive me, thank you, I love you", surrender wounds to unconditional love.',
    practiceKeyZh: '当忆起某个让你心生芥蒂的人或经历时，深吸一口气，在心里对那个情境说：“我原谅你，我也原谅当时的自己。我们都解脱了，我选择走向丰盛与光明。”',
    practiceKeyEn: 'When a difficult memory arises, breathe in and softly say: "I forgive you, and I forgive my past self. We are free. I step forward into light and abundance."',
    goldenMantras: [
      {
        textZh: '原谅过去的一切人与事，是给心灵腾出空间接纳奇迹的最高雅的举动。',
        textEn: 'Forgiving all past people and events is the most elegant act to clear space for miracles.',
        insightZh: '原谅不是为了别人，而是为了还自己一片纯净明澈的天空。'
      },
      {
        textZh: '把所有的委屈与过往交给源头。在虚空之中，没有一件事能真正伤害真实的你。',
        textEn: 'Hand over all grievances to the Source. In absolute awareness, nothing can ever harm your true Self.',
        insightZh: '真实的我从未受损，丰盛之光常驻心间。'
      }
    ],
    reflectionPrompts: [
      '还有哪些过去的人或事我依然耿耿于怀？',
      '如果我今天选择彻底放手与宽恕，我的内心会有多轻松？'
    ]
  }
];

export const INITIAL_USER_NOTES: UserBookNote[] = [
  {
    id: 'note-1',
    chapterId: 'ch-1',
    chapterTitle: '第一章：认出丰盛的原初本质',
    quoteOrTitle: '真正的丰盛不是去占有什么，而是认出你本自具足的生命本质。',
    reflection: '今天读到这一句时深有感触。以前总觉得要买下多少奢侈品、拥有多少存款才算丰盛，其实越追求越害怕失去。真正让我感到安宁的，是认清我的内在从来就不缺什么。',
    category: 'worth',
    tags: ['本自具足', '放下内耗', '觉醒心得'],
    isFavorite: true,
    createdAt: '2026-08-20T10:15:00.000Z'
  },
  {
    id: 'note-2',
    chapterId: 'ch-3',
    chapterTitle: '第三章：全然臣服与交托给整体',
    quoteOrTitle: '一切都是最好的安排。放手，退后，让生命为你做主。',
    reflection: '上周项目受阻非常焦虑，强迫自己每天默念“臣服与交托”。没想到放下紧抓之后，反而遇到了更好的合作伙伴。顺流而行的力量太不可思议了！',
    category: 'surrender',
    tags: ['臣服', '最好的安排', '顺流显化'],
    isFavorite: true,
    createdAt: '2026-08-22T14:30:00.000Z'
  },
  {
    id: 'note-3',
    chapterId: 'ch-4',
    chapterTitle: '第四章：无条件感恩的共振奇迹',
    quoteOrTitle: '“谢谢”是消融一切匮乏、不满与恐惧最快、最直接的捷径。',
    reflection: '开始实践在洗碗、散步、喝咖啡时不断在心中默念“谢谢你，谢谢你”。奇妙的是，内心的浮躁瞬间平息，胸口升起一种极其温暖充实的喜悦感。',
    category: 'gratitude',
    tags: ['无条件感恩', '谢谢你', '高频调频'],
    isFavorite: false,
    createdAt: '2026-08-24T09:00:00.000Z'
  }
];
