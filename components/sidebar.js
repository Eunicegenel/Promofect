// /components/Sidebar.js
(function () {
  const { el, Icon, routes, categories, getActiveCat } = window.App;

  function Sidebar() {
    const active = getActiveCat();
    return el(
      'aside',
      { className: 'sidebar', 'aria-label': 'Navigation' },
      el(
        'ul',
        { className: 'cat-list', role: 'list' },
        ...categories.map((c) =>
          el(
            'li',
            { key: c.id },
            el(
              'a',
              {
                className: 'cat-item' + (c.id === active ? ' active' : ''),
                href: routes[c.id],
              },
              // left-aligned icon (neutral, no colors)
              el('span', { className: 'cat-icon' }, el(Icon[c.icon] || Icon.filter)),
              el('span', { className: 'cat-label' }, c.name)
            )
          )
        )
      )
    );
  }

  window.App = Object.assign(window.App || {}, { Sidebar });
})();
