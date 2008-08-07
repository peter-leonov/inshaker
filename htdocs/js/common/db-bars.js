DB.Bars.initialize
({
	'Москва':
	[
		{name: 'Твой Бар №1', format: ['уютная', 'теплая'], feel: ['стриптиз'], name_eng: 'Your Number 1 Bar', point: [55.744381,37.566055], address: 'Москва, ул. Остоженка, 32<br/>м. «Парк Культуры»<br/>+7 (495) 347-19-47', carte: ['Абсент без разрешения', 'Мохито'], recs: ['Александр', 'Мохито']},
		{name: '9.1.1', format: ['нервозная', 'мокрая', 'противная'], feel: ['красивый вид', 'приятная музыка'], name_eng: '9.1.1.', point: [55.766834,37.381088], carte: ['Абсент Сауэр', 'Мохито'], recs: ['Александр', 'Мохито']},
		{name: 'Chester-ferry', format: ['обалденная'], feel: ['стриптиз'], name_eng: 'Chester-ferry', point: [55.753445,37.612316], carte: ['Абсент Сауэр', 'Мохито'], recs: ['Абсент Сауэр']},
		{name: '1-ая Библиотека', format: ['спокойная', 'умная', 'книжная'], name_eng: 'First Library', point: [55.910973,37.396004], carte: ['Александр', 'Мохито'], recs: ['Александр', 'Мохито']},
		{name: 'Denis Simachev Shop & Bar', format: ['спокойная', 'умная', 'книжная'], name_eng: 'Denis Simachev Shop & Bar', point: [55.915,37.397], carte: ['Александр', 'Мохито', 'Абсент Сауэр', 'Александр', 'Мохито', 'Абсент Сауэр', 'Александр', 'Мохито'], recs: ['Александр', 'Мохито']},
		{name: '1 more', format: ['убойная', 'накуренная'], name_eng: '1 more', point: [55.803596,37.618732], carte: ['Мохито'], recs: ['Мохито']}
	],
	
	'Санкт-Петербург':
	[
		{name: '01 кафе', format: ['уютная', 'пахнет кофе'], name_eng: '01 Cafe', point: [59.95,30.39], carte: ['Абсент Сауэр', 'Мохито'], recs: ['Абсент Сауэр', 'Мохито']},
		{name: 'A.v.e.n.u.e', format: ['уютная', 'накуренная', 'обалденная'], name_eng: 'A.v.e.n.u.e', point: [59.9,30.3], carte: ['Беллини', 'Абсент Сауэр', 'Мохито'], recs: ['Абсент Сауэр', 'Мохито']}
	],
	
	'Омск':
	[
		{name: '7 вечера', format: ['уютная', 'обалденная'], name_eng: 'At Seven o\'Clock', point: [55,73.4], carte: ['Беллини', 'Абсент Сауэр', 'Мохито'], recs: ['Абсент Сауэр', 'Мохито']},
		{name: '33 зуба', format: ['уютная', 'омская'], name_eng: '33 teeth', point: [54.9,73.3], carte: ['Беллини', 'Мохито'], recs: ['Мохито']}
	]
})

DB.Cities.initialize
({
	'Москва': {point: [55.751,37.645], zoom: 10},
	'Санкт-Петербург': {point: [59.941084,30.315914], zoom: 10},
	'Омск': {point: [54.961,73.394165], zoom: 11}
})