DB.Bars.initialize
({
	'Москва':
	[
		{name: 'Твой Бар №1', format: ['уютная', 'теплая'], feel: ['стриптиз'], name_eng: 'Your Number 1 Bar', point: [55.744381,37.566055], id: 'your-number-1-bar', address: 'Москва, ул. Остоженка, 32<br/>м. «Парк Культуры»<br/>+7 (495) 347-19-47', cocktails: ['Абсент без разрешения', 'Мохито'], recommended: ['Александр', 'Мохито']},
		{name: '9.1.1', format: ['нервозная', 'мокрая', 'противная'], feel: ['красивый вид', 'приятная музыка'], name_eng: '9.1.1.', point: [55.766834,37.381088], id: '9-1-1-', cocktails: ['Абсент Сауэр', 'Мохито'], recommended: ['Александр', 'Мохито']},
		{name: 'Chester-ferry', format: ['обалденная'], feel: ['стриптиз'], name_eng: 'Chester-ferry', point: [55.753445,37.612316], id: 'сhester-ferry', cocktails: ['Абсент Сауэр', 'Мохито'], recommended: ['Абсент Сауэр']},
		{name: '1-ая Библиотека', format: ['спокойная', 'умная', 'книжная'], name_eng: 'First Library', point: [55.910973,37.396004], id: 'first-library', cocktails: ['Александр', 'Мохито'], recommended: ['Александр', 'Мохито']},
		{name: 'Denis Simachev Shop & Bar', format: ['спокойная', 'умная', 'книжная'], name_eng: 'Denis Simachev Shop & Bar', point: [55.915,37.397], id: 'denis-simachev-shop-bar', cocktails: ['Александр', 'Мохито', 'Абсент Сауэр', 'Александр', 'Мохито', 'Абсент Сауэр', 'Александр', 'Мохито'], recommended: ['Александр', 'Мохито']},
		{name: '1 more', format: ['убойная', 'накуренная'], name_eng: '1 more', point: [55.803596,37.618732], id: '1-more', cocktails: ['Мохито'], recommended: ['Мохито']}
	],
	
	'Санкт-Петербург':
	[
		{name: '01 кафе', format: ['уютная', 'пахнет кофе'], name_eng: '01 Cafe', point: [59.95,30.39], id: '01-cafe', cocktails: ['Александр', 'Мохито'], recommended: ['Александр', 'Мохито']},
		{name: 'A.v.e.n.u.e', format: ['уютная', 'накуренная', 'обалденная'], name_eng: 'A.v.e.n.u.e', point: [59.9,30.3], id: 'a-v-e-n-u-e', cocktails: ['Беллини', 'Александр', 'Мохито'], recommended: ['Александр', 'Мохито']}
	],
	
	'Омск':
	[
		{name: '7 вечера', format: ['уютная', 'обалденная'], name_eng: 'At Seven o\'Clock', point: [55,73.4], id: 'at-seven-o-clock', cocktails: ['Беллини', 'Александр', 'Мохито'], recommended: ['Александр', 'Мохито']},
		{name: '33 зуба', format: ['уютная', 'омская'], name_eng: '33 teeth', point: [54.9,73.3], id: '33-teeth', cocktails: ['Беллини', 'Мохито'], recommended: ['Мохито']}
	]
})

DB.Cities.initialize
({
	'Москва': {point: [55.751,37.645], zoom: 10},
	'Санкт-Петербург': {point: [59.941084,30.315914], zoom: 10},
	'Омск': {point: [54.961,73.394165], zoom: 11}
})