import type { CustomCoverTone, FoodItem, ProvinceMeta, RegionInfo } from '../types/food';

export const REGIONS: RegionInfo[] = [
  { key: 'all', label: '全国 34 省' },
  { key: 'north', label: '华北' },
  { key: 'northeast', label: '东北' },
  { key: 'east', label: '华东' },
  { key: 'central', label: '华中' },
  { key: 'south', label: '华南' },
  { key: 'southwest', label: '西南' },
  { key: 'northwest', label: '西北' },
  { key: 'custom', label: '自定义' },
];

export const PROVINCES: ProvinceMeta[] = [
  // 华北 (5)
  { id: 'beijing', name: '北京', region: 'north', regionLabel: '华北' },
  { id: 'tianjin', name: '天津', region: 'north', regionLabel: '华北' },
  { id: 'hebei', name: '河北', region: 'north', regionLabel: '华北' },
  { id: 'shanxi', name: '山西', region: 'north', regionLabel: '华北' },
  { id: 'neimenggu', name: '内蒙古', region: 'north', regionLabel: '华北' },
  // 东北 (3)
  { id: 'liaoning', name: '辽宁', region: 'northeast', regionLabel: '东北' },
  { id: 'jilin', name: '吉林', region: 'northeast', regionLabel: '东北' },
  { id: 'heilongjiang', name: '黑龙江', region: 'northeast', regionLabel: '东北' },
  // 华东 (8)
  { id: 'shanghai', name: '上海', region: 'east', regionLabel: '华东' },
  { id: 'jiangsu', name: '江苏', region: 'east', regionLabel: '华东' },
  { id: 'zhejiang', name: '浙江', region: 'east', regionLabel: '华东' },
  { id: 'anhui', name: '安徽', region: 'east', regionLabel: '华东' },
  { id: 'fujian', name: '福建', region: 'east', regionLabel: '华东' },
  { id: 'jiangxi', name: '江西', region: 'east', regionLabel: '华东' },
  { id: 'shandong', name: '山东', region: 'east', regionLabel: '华东' },
  { id: 'taiwan', name: '台湾', region: 'east', regionLabel: '华东' },
  // 华中 (3)
  { id: 'henan', name: '河南', region: 'central', regionLabel: '华中' },
  { id: 'hubei', name: '湖北', region: 'central', regionLabel: '华中' },
  { id: 'hunan', name: '湖南', region: 'central', regionLabel: '华中' },
  // 华南 (5)
  { id: 'guangdong', name: '广东', region: 'south', regionLabel: '华南' },
  { id: 'guangxi', name: '广西', region: 'south', regionLabel: '华南' },
  { id: 'hainan', name: '海南', region: 'south', regionLabel: '华南' },
  { id: 'hongkong', name: '香港', region: 'south', regionLabel: '华南' },
  { id: 'macau', name: '澳门', region: 'south', regionLabel: '华南' },
  // 西南 (5)
  { id: 'chongqing', name: '重庆', region: 'southwest', regionLabel: '西南' },
  { id: 'sichuan', name: '四川', region: 'southwest', regionLabel: '西南' },
  { id: 'guizhou', name: '贵州', region: 'southwest', regionLabel: '西南' },
  { id: 'yunnan', name: '云南', region: 'southwest', regionLabel: '西南' },
  { id: 'xizang', name: '西藏', region: 'southwest', regionLabel: '西南' },
  // 西北 (5)
  { id: 'shaanxi', name: '陕西', region: 'northwest', regionLabel: '西北' },
  { id: 'gansu', name: '甘肃', region: 'northwest', regionLabel: '西北' },
  { id: 'qinghai', name: '青海', region: 'northwest', regionLabel: '西北' },
  { id: 'ningxia', name: '宁夏', region: 'northwest', regionLabel: '西北' },
  { id: 'xinjiang', name: '新疆', region: 'northwest', regionLabel: '西北' },
];

const provinceMap = new Map<string, ProvinceMeta>(PROVINCES.map((p) => [p.id, p]));
const BASE_URL = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';

function dish(id: string, provinceId: string, name: string, note: string): FoodItem {
  const meta = provinceMap.get(provinceId);
  if (!meta) {
    throw new Error(`Unknown provinceId: ${provinceId}`);
  }
  return {
    id,
    name,
    provinceId: meta.id,
    provinceName: meta.name,
    region: meta.region,
    regionLabel: meta.regionLabel,
    image: `${BASE_URL}src/assets/dishes/${id}.jpg`,
    note,
  };
}

export const BUILTIN_FOODS: FoodItem[] = [
  // 北京
  dish('bj-zhajiangmian', 'beijing', '炸酱面', '黄酱肉丁配菜码'),
  dish('bj-luzhu', 'beijing', '卤煮火烧', '老汤焖火烧豆腐'),
  dish('bj-shuanrou', 'beijing', '铜锅涮肉', '清汤手切鲜羊肉'),
  // 天津
  dish('tj-jianbing', 'tianjin', '煎饼果子', '绿豆面摊蛋夹薄脆'),
  dish('tj-baozi', 'tianjin', '狗不理包子', '十八褶鲜肉汤包'),
  dish('tj-gabacai', 'tianjin', '嘎巴菜', '绿豆锅巴淋卤汁'),
  // 河北
  dish('he-lvrou', 'hebei', '驴肉火烧', '酥脆方火烧夹热驴肉'),
  dish('he-banmian', 'hebei', '牛肉板面', '宽面红油配卤蛋'),
  dish('he-menzi', 'hebei', '焖子', '煎淀粉块浇麻酱蒜汁'),
  // 山西
  dish('sx-daoxiaomian', 'shanxi', '刀削面', '筋道削面配西红柿肉卤'),
  dish('sx-guoyourou', 'shanxi', '过油肉', '木耳冬笋醋香嫩肉片'),
  dish('sx-youmian', 'shanxi', '莜面栲栳栳', '蜂窝莜面卷蘸臊子'),
  // 内蒙古
  dish('nm-shaomai', 'neimenggu', '羊肉烧麦', '薄皮羊肉大葱现蒸'),
  dish('nm-shoubarou', 'neimenggu', '手把肉', '清水白煮蘸韭菜花'),
  dish('nm-naicha', 'neimenggu', '咸奶茶配炒米', '砖茶奶皮配酥香炒米'),
  // 辽宁
  dish('ln-jijia', 'liaoning', '沈阳鸡架', '熏烤焦香撒孜然辣椒'),
  dish('ln-chenmian', 'liaoning', '老四季抻面', '鸡汤清鲜配香菜辣油'),
  dish('ln-xunrou', 'liaoning', '熏肉大饼', '油酥层次饼卷熏肉葱丝'),
  // 吉林
  dish('jl-lengmian', 'jilin', '延吉冷面', '荞麦冰汤配辣白菜梨片'),
  dish('jl-guobaorou', 'jilin', '锅包肉', '外酥里嫩酸甜挂汁'),
  dish('jl-kaolengmian', 'jilin', '烤冷面', '铁板刷酱加蛋烤肠'),
  // 黑龙江
  dish('hl-tieguodun', 'heilongjiang', '铁锅炖大鹅', '大鹅炖土豆贴玉米饼'),
  dish('hl-hongchang', 'heilongjiang', '哈尔滨红肠', '果木烟熏蒜香切片'),
  dish('hl-shazhucai', 'heilongjiang', '杀猪菜', '酸菜五花肉烩血肠'),
  // 上海
  dish('sh-shengjian', 'shanghai', '生煎包', '脆底爆汁撒黑芝麻葱花'),
  dish('sh-congyoumian', 'shanghai', '葱油拌面', '熬香焦葱拌浓酱拌面'),
  dish('sh-paiguniangao', 'shanghai', '排骨年糕', '酥炸大排配软糯年糕'),
  // 江苏
  dish('js-yaxuefensi', 'jiangsu', '鸭血粉丝汤', '鲜汤鸭血油豆腐粉丝'),
  dish('js-yangzhouchaofan', 'jiangsu', '扬州炒饭', '粒粒分明虾仁蛋炒饭'),
  dish('js-yangchunmian', 'jiangsu', '阳春面', '清雅酱油高汤细面'),
  // 浙江
  dish('zj-pianerchuan', 'zhejiang', '片儿川', '雪菜冬笋瘦肉汤面'),
  dish('zj-congbaohui', 'zhejiang', '葱包桧', '春饼压油条小葱刷甜酱'),
  dish('zj-meigancaikourou', 'zhejiang', '梅干菜扣肉', '肥而不腻梅干菜蒸肉'),
  // 安徽
  dish('ah-niuroutang', 'anhui', '淮南牛肉汤', '牛骨浓汤千张粉丝'),
  dish('ah-chouguiyu', 'anhui', '臭鳜鱼', '蒜瓣鱼肉浓油微辣'),
  dish('ah-maodoufu', 'anhui', '徽州毛豆腐', '两面煎黄蘸红椒辣酱'),
  // 福建
  dish('fj-shachamian', 'fujian', '沙茶面', '浓香沙茶汤配鲜虾油豆腐'),
  dish('fj-yuwan', 'fujian', '福州鱼丸', '弹牙包心鱼丸清汤'),
  dish('fj-jiangmuya', 'fujian', '姜母鸭', '砂锅老姜麻油焖鸭'),
  // 江西
  dish('jx-banfen', 'jiangxi', '南昌拌粉', '爽滑米粉拌萝卜干花生'),
  dish('jx-waguantang', 'jiangxi', '瓦罐汤', '炭火慢煨排骨莲藕汤'),
  dish('jx-xueya', 'jiangxi', '莲花血鸭', '香辣干香爆炒鸭块'),
  // 山东
  dish('sd-bazirou', 'shandong', '把子肉', '酱香厚切五花配米饭'),
  dish('sd-jianbingcong', 'shandong', '煎饼卷大葱', '杂粮薄煎饼抹酱卷大葱'),
  dish('sd-bayushuijiao', 'shandong', '鲅鱼水饺', '鲜嫩弹滑大海鱼馅饺'),
  // 台湾
  dish('tw-luroufan', 'taiwan', '卤肉饭', '胶质红葱卤肉配卤蛋'),
  dish('tw-niuroumian', 'taiwan', '台湾牛肉面', '红烧浓汤大块牛腱面'),
  dish('tw-ezijian', 'taiwan', '蚵仔煎', '鲜蚵滑蛋番薯粉甜辣酱'),
  // 河南
  dish('ha-hulatang', 'henan', '胡辣汤', '胡椒浓香牛肉面筋汤'),
  dish('ha-huimian', 'henan', '河南烩面', '羊骨白汤宽扯面海带'),
  dish('ha-jidanguanbing', 'henan', '鸡蛋灌饼', '酥皮灌蛋夹生菜刷酱'),
  // 湖北
  dish('hb-reganmian', 'hubei', '热干面', '浓稠芝麻酱拌碱水面'),
  dish('hb-doupi', 'hubei', '三鲜豆皮', '金黄蛋皮裹糯米香菇'),
  dish('hb-lianoutang', 'hubei', '莲藕排骨汤', '粉糯煨汤排骨洪湖藕'),
  // 湖南
  dish('hn-lajiaochaorou', 'hunan', '辣椒炒肉', '青椒猛火爆炒五花肉'),
  dish('hn-choudoufu', 'hunan', '长沙臭豆腐', '外焦内嫩浇蒜蓉辣萝卜'),
  dish('hn-niuroutangfen', 'hunan', '常德牛肉粉', '红油麻辣炖牛肉圆粉'),
  // 广东
  dish('gd-changfen', 'guangdong', '肠粉', '薄滑米皮包鲜虾淋豉油'),
  dish('gd-shaola', 'guangdong', '烧腊双拼饭', '蜜汁叉烧脆皮烧鸭饭'),
  dish('gd-yuntunmian', 'guangdong', '鲜虾云吞面', '大地鱼清汤竹升面云吞'),
  // 广西
  dish('gx-luosifen', 'guangxi', '柳州螺蛳粉', '酸笋腐竹花生红油螺汤'),
  dish('gx-guilinmifen', 'guangxi', '桂林米粉', '卤水锅烧酸豆角干捞粉'),
  dish('gx-laoyoufen', 'guangxi', '老友粉', '豆豉酸笋现炒酸辣河粉'),
  // 海南
  dish('hi-wenchangji', 'hainan', '文昌鸡饭', '皮黄肉嫩白切鸡配鸡油饭'),
  dish('hi-qingbuliang', 'hainan', '海南清补凉', '冰爽椰奶芋圆红豆凉粉'),
  dish('hi-baoluofen', 'hainan', '抱罗粉', '粗米粉配牛肉干花生卤汁'),
  // 香港
  dish('hk-chezaimian', 'hongkong', '港式车仔面', '咖喱鱼蛋萝卜牛腩粗面'),
  dish('hk-boluoyou', 'hongkong', '菠萝油配冻奶茶', '酥皮热包夹冰黄油丝袜奶茶'),
  dish('hk-chashaofan', 'hongkong', '叉烧滑蛋饭', '嫩滑炒蛋配蜜汁叉烧饭'),
  // 澳门
  dish('mo-zhubabao', 'macau', '猪扒包', '酥脆猪仔包夹现炸猪扒'),
  dish('mo-danta', 'macau', '葡式蛋挞', '焦糖布丁酥皮热蛋挞'),
  dish('mo-shuixiezhou', 'macau', '水蟹粥', '金黄蟹膏绵密砂锅粥'),
  // 重庆
  dish('cq-xiaomian', 'chongqing', '重庆小面', '麻辣红油豌豆杂酱碱面'),
  dish('cq-huoguo', 'chongqing', '重庆麻辣火锅', '牛油红锅涮肥牛脆藕'),
  dish('cq-suanlafen', 'chongqing', '酸辣粉', '红薯粉配酥黄豆酸辣汤'),
  // 四川
  dish('sc-mapodoufu', 'sichuan', '麻婆豆腐', '麻辣滚烫豆瓣牛肉豆腐'),
  dish('sc-huiguorou', 'sichuan', '回锅肉', '灯盏窝五花肉炒蒜苗'),
  dish('sc-dandanmian', 'sichuan', '担担面', '麻酱红油芽菜脆肉臊面'),
  // 贵州
  dish('gz-suantangyu', 'guizhou', '酸汤鱼', '红酸汤煮鲜鱼豆腐豆芽'),
  dish('gz-changwangmian', 'guizhou', '肠旺面', '肥肠血旺脆哨红油鸡蛋面'),
  dish('gz-siwawa', 'guizhou', '丝娃娃', '薄面皮卷十余种素菜蘸水'),
  // 云南
  dish('yn-guoqiaomixian', 'yunnan', '过桥米线', '滚烫鸡汤现烫火腿米线'),
  dish('yn-qiguoji', 'yunnan', '汽锅鸡', '蒸汽凝汤原汁枸杞鸡肉'),
  dish('yn-kaoerkuai', 'yunnan', '烤饵块', '炭烤软糯米饼卷油条甜酱'),
  // 西藏
  dish('xz-zangmian', 'xizang', '藏面', '牦牛骨汤碱面配牛肉丁'),
  dish('xz-tiancha', 'xizang', '甜茶配炸土豆', '温热甜奶茶配狼牙辣土豆'),
  dish('xz-suyoucha', 'xizang', '酥油茶配糌粑', '醇厚咸酥油茶配青稞糌粑'),
  // 陕西
  dish('sn-roujiamo', 'shaanxi', '肉夹馍', '白吉馍酥皮夹满腊汁肉'),
  dish('sn-youpomian', 'shaanxi', '油泼面', '手工扯面热油激香辣子蒜'),
  dish('sn-paomo', 'shaanxi', '羊肉泡馍', '手掰馍块烩浓鲜羊肉汤'),
  // 甘肃
  dish('gs-lanzhoumian', 'gansu', '兰州牛肉面', '一清二白三红四绿手工拉面'),
  dish('gs-niangpi', 'gansu', '酿皮', '筋道厚酿皮配面筋辣醋汁'),
  dish('gs-laozao', 'gansu', '牛奶鸡蛋醪糟', '奶香蛋花醪糟撒芝麻枸杞'),
  // 青海
  dish('qh-kangguo', 'qinghai', '炕锅羊肉', '铸铁锅焦香羊肉炕土豆洋葱'),
  dish('qh-suannai', 'qinghai', '青海老酸奶', '厚实金黄奶皮撒白糖'),
  dish('qh-youbing', 'qinghai', '狗浇尿油饼', '薄脆千层螺旋煎油饼'),
  // 宁夏
  dish('nx-shouzhuayangrou', 'ningxia', '手抓羊肉', '盐池滩羊清蒸鲜嫩不膻'),
  dish('nx-lahuhu', 'ningxia', '辣糊糊', '浓稠芝麻辣椒糊裹签串'),
  dish('nx-yangzasui', 'ningxia', '羊杂碎', '红油粉条鲜香羊杂暖汤'),
  // 新疆
  dish('xj-dapanji', 'xinjiang', '大盘鸡', '香辣土豆炖鸡垫皮带面'),
  dish('xj-zhuafan', 'xinjiang', '羊肉抓饭', '黄萝卜葡萄干油润焖羊肉饭'),
  dish('xj-yangrouchuan', 'xinjiang', '烤羊肉串配馕', '炭火孜然大串配芝麻烤馕'),
];

export const DEFAULT_SELECTED_IDS: string[] = [
  'bj-zhajiangmian',
  'sc-mapodoufu',
  'gd-changfen',
  'sn-roujiamo',
  'hb-reganmian',
  'gx-luosifen',
  'sh-shengjian',
  'tw-luroufan',
];

export const COVER_TONES: Record<
  CustomCoverTone,
  { label: string; bg: string; accent: string; text: string; sub: string }
> = {
  vermilion: {
    label: '朱砂红',
    bg: '#C23B22',
    accent: '#F8D7CE',
    text: '#FFFDF9',
    sub: '#F6C2B5',
  },
  ochre: {
    label: '琥珀姜',
    bg: '#B46924',
    accent: '#F7E2C6',
    text: '#FFFDF9',
    sub: '#F4D5AE',
  },
  jade: {
    label: '青瓷绿',
    bg: '#2D6A54',
    accent: '#CFE7DD',
    text: '#FFFDF9',
    sub: '#B9DCCE',
  },
  indigo: {
    label: '靛青蓝',
    bg: '#2B4C7E',
    accent: '#D2E0F5',
    text: '#FFFDF9',
    sub: '#BDD2F0',
  },
  ink: {
    label: '松烟墨',
    bg: '#262320',
    accent: '#E2DCD3',
    text: '#FAF8F5',
    sub: '#C7BFB4',
  },
};
