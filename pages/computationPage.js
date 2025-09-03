//pages/computationPage.js 
(function () {
  const { el, e, ReactDOM, Header, Sidebar } = window.App;
  const { useState, useMemo, useEffect } = React;

  // --- Helpers ---
  const colorSurcharge = (n) => n <= 0 ? 0 : 3 + (n - 1) * 1.5;
  const safeLower = (v) => (typeof v === "string" ? v.toLowerCase() : "");
  const isRow = (p) =>
    p && typeof p === "object" &&
    "Style" in p && "Name" in p && "DecorationMethod" in p && "BasePrice" in p;

  function loadData() {
    if (!Array.isArray(window.PRICE_LIST)) {
      throw new Error("PRICE_LIST not found or not an array");
    }
    return window.PRICE_LIST;
  }

  // --- Computation component (calculator UI) ---
  function Computation() {
    const priceListRaw = loadData();
    const priceList = useMemo(() => priceListRaw.filter(isRow), [priceListRaw]);

    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(null);     // representative row of (Style, Name)
    const [method, setMethod] = useState("Printing");
    const [selectedColor, setSelectedColor] = useState(null);
    const [qty, setQty] = useState(1);
    const [frontColors, setFrontColors] = useState(1);
    const [backColors, setBackColors] = useState(0);

    // Search by Style or Name, grouping results by (Style, Name) and showing available methods
    const results = useMemo(() => {
      const q = safeLower(query).trim();
      if (!q) return [];
      const matches = priceList.filter(p =>
        safeLower(p.Style).includes(q) || safeLower(p.Name).includes(q)
      );

      const map = new Map();
      for (const r of matches) {
        const key = `${r.Style}__${r.Name}`;
        if (!map.has(key)) {
          map.set(key, {
            style: r.Style,
            name:  r.Name,
            methods: new Set(),
            sample: r, // representative row to pass into selection
          });
        }
        map.get(key).methods.add(r.DecorationMethod);
      }

      return Array.from(map.values())
        .map(g => ({ ...g, methods: Array.from(g.methods) }))
        .sort((a, b) => {
          if (a.style !== b.style) return a.style.localeCompare(b.style);
          return a.name.localeCompare(b.name);
        });
    }, [query, priceList]);

    function selectProduct(sampleRow) {
      setSelected(sampleRow);
      setMethod(sampleRow.DecorationMethod || "Printing");
      setSelectedColor(null); // reset; effect below will set a valid one
      setQuery("");
    }

    // Methods available for the selected style
    const methodsAvailable = useMemo(() => {
      if (!selected) return [];
      const set = new Set(
        priceList
          .filter(r => r.Style === selected.Style)
          .map(r => r.DecorationMethod)
      );
      return Array.from(set);
    }, [selected, priceList]);

    // Colors available for selected style + method
    const colorsAvailable = useMemo(() => {
      if (!selected) return [];
      return priceList
        .filter(r => r.Style === selected.Style && r.DecorationMethod === method)
        .map(r => ({ color: r.Color, hex: r.HexColor, base: r.BasePrice }));
    }, [selected, method, priceList]);

    // Ensure selectedColor is valid whenever method/style changes
    useEffect(() => {
      if (!selected) return;
      const exists = colorsAvailable.some(c => c.color === selectedColor);
      if (!exists) {
        setSelectedColor(colorsAvailable.length ? colorsAvailable[0].color : null);
      }
    }, [selected, method, colorsAvailable, selectedColor]);

    // Base row for the current choice
    const baseRow = useMemo(() => {
      if (!selected || !selectedColor) return null;
      return priceList.find(r =>
        r.Style === selected.Style &&
        r.DecorationMethod === method &&
        r.Color === selectedColor
      ) || null;
    }, [selected, selectedColor, method, priceList]);

    // Pricing
    const frontSurcharge = colorSurcharge(frontColors);
    const backSurcharge = colorSurcharge(backColors);
    const unitPrice = useMemo(() => {
      if (!baseRow) return 0;
      return (baseRow.BasePrice || 0) + frontSurcharge + backSurcharge;
    }, [baseRow, frontSurcharge, backSurcharge]);

    const totalPrice = useMemo(() => unitPrice * (qty > 0 ? qty : 0), [unitPrice, qty]);

    return e('div', { className: 'comp-page content' },
      e('div', { className: 'calculator-card' },
        e('h2', { className: 'product-title' }, 'Product Detail & Pricing Calculator'),

        // Search
        e('div', { className: 'field' },
          e('label', null, 'Search by Style or Name'),
          e('input', {
            className: 'input',
            type: 'text',
            placeholder: 'e.g. 5000 / Classic Tee',
            value: query,
            onChange: (ev) => setQuery(ev.target.value || '')
          }),
          results.length > 0 && e('ul', { className: 'results' },
            results.map((g, i) =>
              e('li', { key: i },
                e('button', {
                  onClick: () => selectProduct(g.sample)
                }, `${g.style} - ${g.name}`,
                g.methods?.length
                  ? e('span', { style:{ marginLeft: 8, color:'#6b7280' } }, `(${g.methods.join(' / ')})`)
                  : null
                )
              )
            )
          )
        ),

        // Details (only when a product is selected)
        selected && e('div', { className: 'calc-grid' },
          e('div', null,
            e('div', { className: 'product-head' },
              e('span', { className: 'sku' }, selected.Style),
              e('span', { className: 'name' }, `— ${selected.Name}`)
            ),

            e('div', { className: 'field' },
              e('label', null, 'Decoration Method'),
              e('select', {
                className: 'input',
                value: method,
                onChange: (ev) => setMethod(ev.target.value)
              },
                methodsAvailable.map(m => e('option', { key: m, value: m }, m))
              )
            ),

            e('div', { className: 'field' },
              e('div', { className: 'label-row', style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                e('label', null, 'Color'),
                selectedColor && e('span', { className: 'muted' }, `${selectedColor}`)
              ),
              colorsAvailable.length
                ? e('div', { className: 'swatch-row' },
                    colorsAvailable.map(c =>
                      e('button', {
                        key: c.color,
                        className: 'swatch' + (c.color === selectedColor ? ' selected' : ''),
                        style: { '--swatch': c.hex || '#e5e7eb' },
                        onClick: () => setSelectedColor(c.color),
                        title: c.color
                      })
                    )
                  )
                : e('div', { className: 'muted' }, 'No colors for this method/style.')
            ),

            e('div', { className: 'field' },
              e('label', null, 'Quantity'),
              e('input', {
                className: 'input',
                type: 'number',
                min: 1,
                value: qty,
                onChange: (ev) => {
                  const n = Number(ev.target.value);
                  setQty(Number.isFinite(n) && n > 0 ? n : 1);
                }
              })
            ),

            e('div', { className: 'field' },
              e('div', { className: 'label-row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
                e('label', null, 'Front Colors'),
                e('span', { className: 'muted' }, 'First color +$3, additional +$1.5 each (per unit).')
              ),
              e('input', {
                className: 'input',
                type: 'number',
                min: 0,
                value: frontColors,
                onChange: (ev) => {
                  const n = Number(ev.target.value);
                  setFrontColors(Number.isFinite(n) && n >= 0 ? n : 0);
                }
              })
            ),

            e('div', { className: 'field' },
              e('div', { className: 'label-row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
                e('label', null, 'Back Colors'),
                e('span', { className: 'muted' }, 'First color +$3, additional +$1.5 each (per unit).')
              ),
              e('input', {
                className: 'input',
                type: 'number',
                min: 0,
                value: backColors,
                onChange: (ev) => {
                  const n = Number(ev.target.value);
                  setBackColors(Number.isFinite(n) && n >= 0 ? n : 0);
                }
              })
            )
          ),

          e('div', { className: 'calc-summary' },
            e('div', { className: 'totals' },
              e('div', { className: 'line' },
                e('span', null, 'Base Price'),
                e('strong', null, `$${baseRow ? baseRow.BasePrice.toFixed(2) : '0.00'}`)
              ),
              e('div', { className: 'line' },
                e('span', null, 'Front Surcharge'),
                e('strong', null, `$${frontSurcharge.toFixed(2)}`)
              ),
              e('div', { className: 'line' },
                e('span', null, 'Back Surcharge'),
                e('strong', null, `$${backSurcharge.toFixed(2)}`)
              ),
              e('div', { className: 'line', style: { marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' } },
                e('span', null, 'Unit Price'),
                e('strong', null, `$${unitPrice.toFixed(2)}`)
              ),
              e('div', { className: 'grand' },
                e('span', { className: 'label' }, `Total for ${qty} unit${qty !== 1 ? 's' : ''}`),
                e('span', { className: 'value' }, `$${totalPrice.toFixed(2)}`)
              )
            )
          )
        )
      )
    );
  }

  // --- Page shell ---
  function App() {
    return el('div', { className: 'app' },
      el(Header),
      el(Sidebar),
      el(Computation)
    );
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(el(App));
})();
