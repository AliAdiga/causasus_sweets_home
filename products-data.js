// Menu data. Each size has a price in Jordanian dinar (JD). A product with an empty
// `sizes` list shows "Ask for price".
window.CATEGORIES = [
  { id: 'all',     ar: 'الكل',            en: 'All' },
  { id: 'cakes',   ar: 'الكعك',           en: 'Cakes',
    title: { ar: 'كعكات على قد الفرحة', en: 'Cakes sized to your happiness' },
    sub:   { ar: 'صغيرة للجلسة الهادية، وكبيرة للّمّة كلها', en: 'Small for a quiet moment, big for the whole crowd' } },
  { id: 'cookies', ar: 'بسكويت وكرات',    en: 'Cookies & bites',
    title: { ar: 'لقمة ولقمة ولقمة…', en: 'One bite, then another, then another…' },
    sub:   { ar: 'ممنوع تاخد حبة وحدة، جرّبنا وما زبطت', en: 'Taking just one is not allowed. We tried, it did not work' } },
  { id: 'cups',    ar: 'كاسات وشعيرية',   en: 'Cups & vermicelli',
    title: { ar: 'كاسات وأعشاش… حلا بإيدك', en: 'Cups and nests: dessert in hand' },
    sub:   { ar: 'ملعقة، كاسة، وركنة هادية', en: 'A spoon, a cup and a quiet corner' } },
  { id: 'boxes',   ar: 'علب الهدايا',     en: 'Gift boxes',
    title: { ar: 'علب بتفرّح مين بتحب', en: 'Boxes that make someone’s day' },
    sub:   { ar: 'اختار التشكيلة والحجم، وإحنا بنجهّزها لإلك', en: 'Pick the mix and the size and we will prepare it for you' } }
];

window.PRODUCTS = [
  {
    id: 'honey', cat: 'cakes', img: '/img/p-honey.webp',
    name: { ar: 'كعكة العسل', en: 'Honey Cake' },
    desc: { ar: 'الميدوفيك الأصلية: طبقات رقيقة بنكهة العسل مع كريمة ناعمة، من أشهر الحلويات القوقازية.',
            en: 'The original Medovik: thin honey-flavoured layers with smooth cream, a Caucasian favourite.' },
    pair: { ar: 'مع الشاي أو القهوة', en: 'Lovely with tea or coffee' },
    sizes: [ { ar: 'صغير', en: 'Small', price: 6 }, { ar: 'وسط', en: 'Medium', price: 9 }, { ar: 'كبير', en: 'Large', price: 12 } ]
  },
  {
    id: 'choc', cat: 'cakes', img: '/img/p-choc.webp',
    name: { ar: 'كعكة الشوكولاتة', en: 'Chocolate Cake' },
    desc: { ar: 'طبقات غنية بالشوكولاتة تُزيَّن برقائق الشوكولاتة، لعشّاق الكاكاو.',
            en: 'Rich chocolate layers topped with chocolate shavings, for cocoa lovers.' },
    pair: { ar: 'مع كأس حليب بارد', en: 'Great with a cold glass of milk' },
    sizes: [ { ar: 'صغير', en: 'Small', price: 6 }, { ar: 'كبير', en: 'Large', price: 12, note: { ar: 'تُطلب قبل يوم', en: 'order one day ahead' } } ]
  },
  {
    id: 'walnutcake', cat: 'cakes', img: '/img/p-walnutcake.webp',
    name: { ar: 'كعكة الجوز', en: 'Walnut Cake' },
    desc: { ar: 'كعكة طرية بالجوز، رفيقة فنجان القهوة.',
            en: 'A soft walnut cake, the perfect companion to a cup of coffee.' },
    pair: { ar: 'مع القهوة', en: 'Perfect with coffee' },
    sizes: [ { ar: 'حجم واحد', en: 'One size', price: 8 } ]
  },
  {
    id: 'caramel', cat: 'cookies', imgs: ['/img/p-caramel.webp', '/img/g12.webp'],
    name: { ar: 'الجوزية بالكراميل', en: 'Caramel Walnut Cookies' },
    desc: { ar: 'بسكويت على شكل حبة الجوز بحشوة كراميل كريمية. من أكثر ما يُطلب من الدار.',
            en: 'Walnut-shaped cookies with a creamy caramel filling, one of the house favourites.' },
    pair: { ar: 'للضيافة والعلب', en: 'Ideal for guests and gift boxes' },
    sizes: [ { ar: 'صغير', en: 'Small', price: 4 }, { ar: 'وسط', en: 'Medium', price: 6 }, { ar: 'كبير', en: 'Large', price: 8 } ]
  },
  {
    id: 'balls', cat: 'cookies', img: '/img/p-balls.webp',
    name: { ar: 'كرات الشوكولاتة', en: 'Chocolate Balls' },
    desc: { ar: 'كرات شوكولاتة مغطّاة بجوز الهند، لقمة وحدة ما بتكفي.',
            en: 'Chocolate balls rolled in coconut. One bite is never enough.' },
    pair: { ar: 'مع فنجان قهوة', en: 'Nice with a cup of coffee' },
    sizes: [ { ar: 'حجم واحد', en: 'One size', price: 4 } ]
  },
  {
    id: 'custard', cat: 'cups', img: '/img/p-custard.webp',
    name: { ar: 'كاسات الكستر', en: 'Custard Cups' },
    desc: { ar: 'حلويات فردية بالكستر والبسكويت والشعيرية المقرمشة.',
            en: 'Individual desserts with custard, biscuit and crunchy vermicelli.' },
    pair: { ar: 'حلا فردي جاهز', en: 'A ready single-serve dessert' },
    sizes: [ { ar: 'كاسة', en: 'One cup', price: 1 } ]
  },
  {
    id: 'nests', cat: 'cups', img: '/img/g01.webp',
    name: { ar: 'أعشاش الشعيرية', en: 'Vermicelli Nests' },
    desc: { ar: 'شعيرية ذهبية مقرمشة على شكل عش، تُقدَّم في كاسات ورقية ملوّنة.',
            en: 'Golden crunchy vermicelli shaped into nests, served in colourful paper cups.' },
    pair: { ar: 'للجمعات والمناسبات', en: 'For gatherings and celebrations' },
    sizes: [ { ar: 'كاسة صغيرة', en: 'Small cup', price: 0.5 } ]
  }
  ,{
    id: 'boxes', cat: 'boxes', img: '/img/g08.webp',
    name: { ar: 'علب الهدايا', en: 'Gift Boxes' },
    desc: { ar: 'علب أنيقة بتصميم الدار، مناسبة للهدايا والأعياد والمناسبات.',
            en: 'Elegant boxes in the house design, made for gifts, holidays and celebrations.' },
    pair: { ar: 'اسأل عن الأحجام والتشكيلات المتوفرة', en: 'Ask about the sizes and mixes available' },
    sizes: []
  }
];
