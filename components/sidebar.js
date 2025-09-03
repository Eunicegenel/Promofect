//components/Sidebar.js
(function () {
	const { el, Icon, routes, categories, getActiveCat } = window.App;

	function Sidebar() {
		const active = getActiveCat();
		return el('aside', { className: 'sidebar', 'aria-label': 'Categories' },
			el('div', { className: 'sidebar-head' },
				el(Icon.filter),
				el('span', null, 'Browse')
			),
			el('ul', { className: 'cat-list' },
				...categories.map(c =>
					el('li', { key: c.id },
						el('a', {
							className: 'cat-item' + (c.id === active ? ' active' : ''),
							href: routes[c.id],
						}, c.name)
					)
				)
			)
		);
	}

	window.App = Object.assign(window.App || {}, { Sidebar });
})();
