import { products } from '../../supabase/functions/_shared/catalog'

// Display translations only. SKU, prices, stock and persisted order snapshots stay canonical.
export const chineseCatalog: Record<
  string,
  { name: string; description: string; material: string }
> = {
  'ee-47': {
    name: '暖光阅读灯',
    description:
      '为最后一章、悠闲的夜晚或安静的角落留一束暖光。富有造型感的台灯，让宅家也成为一件值得期待的事。',
    material: '装饰灯座与布艺灯罩',
  },
  'ee-46': {
    name: '雕塑感花盆',
    description:
      '给绿意一个简洁的家。富有造型感的花盆，为书架、边桌或洒满阳光的窗台增添生机。',
    material: '装饰花盆',
  },
  'ee-45': {
    name: '一抹小绿意',
    description:
      '为书架和被遗忘的角落添一点绿。这株装饰植物，让日常空间多一分柔和。',
    material: '仿真枝叶与装饰花盆',
  },
  'ee-44': {
    name: '橡木色相框',
    description:
      '让喜欢的人常在眼前。温润的木质相框，珍藏那些想要时常重温的瞬间。',
    material: '木纹装饰相框',
  },
  'ee-43': {
    name: '悠闲吊椅',
    description:
      '给自己一个暂停的理由。轻盈通透的吊椅，适合那个让你总想回去的角落。',
    material: '编织座椅与悬挂框架',
  },
  'ee-13': {
    name: '樱桃木色床头柜',
    description:
      '床边安静的陪伴。樱桃木色与实用台面，让书本、台灯和清晨的水杯触手可及。',
    material: '樱桃木色木材',
  },
  'ee-14': {
    name: '日常休闲椅',
    description:
      '一把有点个性的椅子。用心设计的轮廓，适合书桌、餐桌，也适合坐下来想一想。',
    material: '软包座面与金属底座',
  },
  'ee-48': {
    name: '竹制料理勺',
    description:
      '搅拌、翻炒、尝一口，再来一次。轻巧的竹制料理勺，陪你完成那些熟记于心的食谱。',
    material: '竹材',
  },
  'ee-49': {
    name: '日常随手杯',
    description:
      '给第一口饮品和随后的片刻停顿。简洁的铝制杯配有实用把手，融入你的日常仪式。',
    material: '铝',
  },
  'ee-50': {
    name: '午夜打蛋器',
    description:
      '厨房里的小小节奏。用来搅拌面糊、酱汁，也用来开启一个从容的周日早餐。',
    material: '金属打蛋器与深色手柄',
  },
  'ee-52': {
    name: '碳钢炒锅',
    description:
      '一口锅，许多种可能。碳钢炒锅，让快手晚餐和值得分享的料理都轻松上桌。',
    material: '碳钢',
  },
  'ee-53': {
    name: '实木砧板',
    description: '一顿好饭的开始。木质砧板，从备菜台自然走向餐桌中央。',
    material: '木材',
  },
  'ee-54': {
    name: '阳光柑橘榨汁器',
    description:
      '给一天一个明亮的开场。为水杯添一抹果香，或为晚餐挤一点新鲜滋味。',
    material: '厨房用塑料',
  },
  'ee-57': {
    name: '细网滤勺',
    description:
      '值得留一个位置的小工具。用来清洗、过筛，把料理的小细节照顾妥帖。',
    material: '不锈钢滤网',
  },
  'ee-59': {
    name: '日常玻璃杯',
    description:
      '餐桌上的清水，早餐时的果汁。一只简单透亮的玻璃杯，装下无需理由的日常仪式。',
    material: '玻璃',
  },
  'ee-62': {
    name: '慢融冰格',
    description:
      '给日常一点清凉。下班后的饮品、冰咖啡，还有一年中第一个温暖的午后。',
    material: '柔韧冰格',
  },
  'ee-65': {
    name: '随行午餐盒',
    description:
      '好好照顾午餐。实用的便当盒，装下昨晚的好味道和明天的午间休息。',
    material: '可重复使用的食品容器',
  },
  'ee-67': {
    name: '桌面杯架',
    description:
      '给晨间仪式腾一点空间。小巧的杯架，让常用杯子触手可及，也让台面更清爽。',
    material: '独立式杯架',
  },
  'ee-68': {
    name: '日常煎锅',
    description:
      '第一时间想拿起的那口锅。从快手早餐到简单晚餐，照顾每一餐的小心意。',
    material: '金属煎锅',
  },
  'ee-69': {
    name: '日常餐盘',
    description: '为平常的一餐认真摆盘。简洁的餐盘，让美食与陪伴成为餐桌主角。',
    material: '餐具',
  },
  'ee-71': {
    name: '慢煮汤锅',
    description:
      '好滋味值得等一等。宽敞的锅身配上玻璃锅盖，煮一锅汤，也煮一餐分享的温暖。',
    material: '金属锅身与玻璃锅盖',
  },
  'ee-73': {
    name: '桌面调味架',
    description:
      '多一点整齐，多许多滋味。让日常调料各归其位，做饭时顺手就能拿到。',
    material: '桌面收纳架',
  },
  'ee-75': {
    name: '日常托盘',
    description:
      '把好东西一起端上来。早餐、下午咖啡，或沙发上的安静片刻，都有它的位置。',
    material: '装饰托盘',
  },
  'ee-76': {
    name: '木制擀面杖',
    description:
      '慢下来，亲手做点什么。用木制擀面杖揉进新鲜面团，也延续值得保留的厨房传统。',
    material: '木材',
  },
  'ee-154': {
    name: '周末太阳镜',
    description:
      '为明亮的早晨和自由的周末而备。深色太阳镜，带着简洁的日常轮廓。',
    material: '深色镜框与染色镜片',
  },
  'ee-155': {
    name: '经典太阳镜',
    description: '轻松完成今日穿搭。经典镜型带一点个性，陪你走过忙碌的一天。',
    material: '镜框与染色镜片',
  },
  'ee-172': {
    name: '日常手提包',
    description:
      '把每日的小小必需品装在一起。蓝色手提包，陪你清晨出门，也陪你赴一场晚餐之约。',
    material: '立体手提包',
  },
  'ee-173': {
    name: '皮革大容量包',
    description:
      '总想再次背上的那只包。皮革大容量手提包，装下日常所需，也留一点余地给小惊喜。',
    material: '皮革',
  },
  'ee-175': {
    name: '日常双肩包',
    description:
      '解放双手，迎接新的一天。线条利落的仿皮双肩包，装下必需品、喜欢的书和接下来的安排。',
    material: '仿皮革',
  },
  'ee-176': {
    name: '城市托特包',
    description:
      '忙碌一天里的简单陪伴。黑色城市托特包，为你想随身带着的东西留足空间。',
    material: '立体手提包',
  },
}

export const catalogTranslations = Object.fromEntries(
  products.flatMap((product) => {
    const translated = chineseCatalog[product.id]
    return (['name', 'description', 'material'] as const).map((field) => [
      product[field],
      translated[field],
    ])
  }),
)
