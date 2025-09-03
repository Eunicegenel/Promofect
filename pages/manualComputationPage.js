(function () {
  const { el, e, ReactDOM, Header, Sidebar } = window.App;
  const { useState, useMemo, useEffect } = React;

  // ---------- Helpers ----------
  const clampNum = (v, { min = 0, fallback = 0 } = {}) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(min, n) : fallback;
  };
  const colorSurcharge = (n) => (n <= 0 ? 0 : 3 + (n - 1) * 1.5);

  const moneyFmt = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const intFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const money = (n) => `$${moneyFmt.format(n)}`;

  // ---------- Default price breaks ----------
  const defaultBreaks = [
    { id: 1,  minQty: 12,  deduct: 0 },
    { id: 2,  minQty: 24,  deduct: 0 },
    { id: 3,  minQty: 36,  deduct: 0 },
    { id: 4,  minQty: 48,  deduct: 0 },
    { id: 5,  minQty: 60,  deduct: 0 },
    { id: 6,  minQty: 72,  deduct: 0 },
    { id: 7,  minQty: 84,  deduct: 0 },
    { id: 8,  minQty: 96,  deduct: 0 },
    { id: 9,  minQty: 108, deduct: 0 },
    { id: 10, minQty: 120, deduct: 0 }
  ];

  const defaultBreaksFrontColor = [
    { id: 1,  minQty: 1,  deduct: 0 },
    { id: 2,  minQty: 2,  deduct: 0 },
    { id: 3,  minQty: 3,  deduct: 0 },
    { id: 4,  minQty: 4,  deduct: 0 },
    { id: 5,  minQty: 5,  deduct: 0 },
    { id: 6,  minQty: 6,  deduct: 0 },
    { id: 7,  minQty: 7,  deduct: 0 },
    { id: 8,  minQty: 8,  deduct: 0 },
    { id: 9,  minQty: 9,  deduct: 0 },
    { id: 10, minQty: 10, deduct: 0 }
  ];

  const defaultBreaksBackColor = [
    { id: 1,  minQty: 1,  deduct: 0 },
    { id: 2,  minQty: 2,  deduct: 0 },
    { id: 3,  minQty: 3,  deduct: 0 },
    { id: 4,  minQty: 4,  deduct: 0 },
    { id: 5,  minQty: 5,  deduct: 0 },
    { id: 6,  minQty: 6,  deduct: 0 },
    { id: 7,  minQty: 7,  deduct: 0 },
    { id: 8,  minQty: 8,  deduct: 0 },
    { id: 9,  minQty: 9,  deduct: 0 },
    { id: 10, minQty: 10, deduct: 0 }
  ];

  // ---------- Little UI helpers ----------
  const btnSecondary = {
    padding: '6px 10px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    boxShadow: '0 1px 1px rgba(0,0,0,.03)',
  };
  const btnSecondaryHover = { background: '#f9fafb' };
  const dialogOverlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 999
  };
  const dialogStyle = {
    background: '#fff', width: 'min(720px, 92vw)', borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,.25)',
    padding: '18px'
  };

  // ---------- Dialog Component ----------
  function PriceBreaksDialog({ open, breaks, setBreaks, onClose, onReset }) {
    const [rows, setRows] = useState(breaks);
    useEffect(() => { if (open) setRows(breaks); }, [open, breaks]);

    useEffect(() => {
      if (!open) return;
      const onKey = (ev) => { if (ev.key === 'Escape') onClose(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    const updateVal = (id, field, val) => {
      setRows(prev => prev.map(r => r.id === id
        ? { ...r, [field]: clampNum(val, { min: 0, fallback: 0 }) }
        : r
      ));
    };

    const save = () => {
      const sorted = [...rows].sort((a,b) => a.minQty - b.minQty);
      setBreaks(sorted);
      onClose();
    };

    return e('div', {
      className: 'dialog-overlay',
      style: dialogOverlayStyle,
      onClick: (ev) => { if (ev.target === ev.currentTarget) onClose(); }
    },
      e('div', { className: 'dialog', style: dialogStyle },
        e('div', { style:{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8} },
          e('h3', { style:{margin:0, fontSize:'18px'} }, 'Price Breaks'),
          e('button', {
            onClick: onClose,
            style: { ...btnSecondary, padding:'4px 8px' },
            onMouseEnter: (e)=>Object.assign(e.currentTarget.style, btnSecondaryHover),
            onMouseLeave: (e)=>e.currentTarget.removeAttribute('style')
          }, 'Close')
        ),
        e('p', { className:'muted', style:{marginTop:0, marginBottom:12} },
          'Set the minimum quantity and flat deduction (applied per unit). Only the highest eligible break with a non-zero deduction applies.'
        ),
        e('table', {
          className:'breaks-table',
          style:{ width:'100%', borderCollapse:'separate', borderSpacing:'0 8px' }
        },
          e('thead', null,
            e('tr', null,
              e('th', { style:{textAlign:'left', fontWeight:700, fontSize:12, color:'#6b7280'} }, 'Min Qty'),
              e('th', { style:{textAlign:'left', fontWeight:700, fontSize:12, color:'#6b7280'} }, 'Deduction ($)')
            )
          ),
          e('tbody', null,
            rows.map(r =>
              e('tr', { key:r.id },
                e('td', { style:{ width:'40%', paddingRight:8 } },
                  e('input', {
                    type:'number', min:1,
                    className:'input',
                    value:r.minQty,
                    onChange:(ev)=>updateVal(r.id, 'minQty', ev.target.value)
                  })
                ),
                e('td', { style:{ width:'60%' } },
                  e('input', {
                    type:'number', min:0, step:'0.01',
                    className:'input',
                    value:r.deduct,
                    onChange:(ev)=>updateVal(r.id, 'deduct', ev.target.value)
                  })
                )
              )
            )
          )
        ),
        e('div', { style:{ display:'flex', justifyContent:'space-between', marginTop:14 } },
          e('button', {
            onClick: onReset,
            style: btnSecondary,
            onMouseEnter: (e)=>Object.assign(e.currentTarget.style, btnSecondaryHover),
            onMouseLeave: (e)=>e.currentTarget.removeAttribute('style')
          }, 'Reset to defaults'),
          e('div', null,
            e('button', {
              onClick: onClose,
              style:{ ...btnSecondary, marginRight:8 },
              onMouseEnter: (e)=>Object.assign(e.currentTarget.style, btnSecondaryHover),
              onMouseLeave: (e)=>e.currentTarget.removeAttribute('style')
            }, 'Cancel'),
            e('button', {
              onClick: save,
              style:{
                padding:'8px 14px', borderRadius:'10px', border:'1px solid #111827',
                background:'#111827', color:'#fff', fontWeight:700, cursor:'pointer'
              }
            }, 'Save')
          )
        )
      )
    );
  }

  function FrontColorDialog({ open, breaks, setBreaks, onClose, onReset }) {
    const [rows, setRows] = useState(breaks);
    useEffect(() => { if (open) setRows(breaks); }, [open, breaks]);

    useEffect(() => {
      if (!open) return;
      const onKey = (ev) => { if (ev.key === 'Escape') onClose(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    const updateVal = (id, field, val) => {
      setRows(prev => prev.map(r => r.id === id
        ? { ...r, [field]: clampNum(val, { min: 0, fallback: 0 }) }
        : r
      ));
    };

    const save = () => {
      const sorted = [...rows].sort((a,b) => a.minQty - b.minQty);
      setBreaks(sorted);
      onClose();
    };

    return e('div', {
      className: 'dialog-overlay',
      style: dialogOverlayStyle,
      onClick: (ev) => { if (ev.target === ev.currentTarget) onClose(); }
    },
      e('div', { className: 'dialog', style: dialogStyle },
        e('div', { style:{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8} },
          e('h3', { style:{margin:0, fontSize:'18px'} }, 'Front Color Price Breaks'),
          e('button', {
            onClick: onClose,
            style: { ...btnSecondary, padding:'4px 8px' },
            onMouseEnter: (e)=>Object.assign(e.currentTarget.style, btnSecondaryHover),
            onMouseLeave: (e)=>e.currentTarget.removeAttribute('style')
          }, 'Close')
        ),
        e('p', { className:'muted', style:{marginTop:0, marginBottom:12} },
          'Set the minimum number of colors and flat deduction (applied per unit to the front surcharge). Only the highest eligible break with a non-zero deduction applies.'
        ),
        e('table', {
          className:'breaks-table',
          style:{ width:'100%', borderCollapse:'separate', borderSpacing:'0 8px' }
        },
          e('thead', null,
            e('tr', null,
              e('th', { style:{textAlign:'left', fontWeight:700, fontSize:12, color:'#6b7280'} }, 'Min Colors'),
              e('th', { style:{textAlign:'left', fontWeight:700, fontSize:12, color:'#6b7280'} }, 'Deduction ($)')
            )
          ),
          e('tbody', null,
            rows.map(r =>
              e('tr', { key:r.id },
                e('td', { style:{ width:'40%', paddingRight:8 } },
                  e('input', {
                    type:'number', min:1,
                    className:'input',
                    value:r.minQty,
                    onChange:(ev)=>updateVal(r.id, 'minQty', ev.target.value)
                  })
                ),
                e('td', { style:{ width:'60%' } },
                  e('input', {
                    type:'number', min:0, step:'0.01',
                    className:'input',
                    value:r.deduct,
                    onChange:(ev)=>updateVal(r.id, 'deduct', ev.target.value)
                  })
                )
              )
            )
          )
        ),
        e('div', { style:{ display:'flex', justifyContent:'space-between', marginTop:14 } },
          e('button', {
            onClick: onReset,
            style: btnSecondary,
            onMouseEnter: (e)=>Object.assign(e.currentTarget.style, btnSecondaryHover),
            onMouseLeave: (e)=>e.currentTarget.removeAttribute('style')
          }, 'Reset to defaults'),
          e('div', null,
            e('button', {
              onClick: onClose,
              style:{ ...btnSecondary, marginRight:8 },
              onMouseEnter: (e)=>Object.assign(e.currentTarget.style, btnSecondaryHover),
              onMouseLeave: (e)=>e.currentTarget.removeAttribute('style')
            }, 'Cancel'),
            e('button', {
              onClick: save,
              style:{
                padding:'8px 14px', borderRadius:'10px', border:'1px solid #111827',
                background:'#111827', color:'#fff', fontWeight:700, cursor:'pointer'
              }
            }, 'Save')
          )
        )
      )
    );
  }

  function BackColorDialog({ open, breaks, setBreaks, onClose, onReset }) {
    const [rows, setRows] = useState(breaks);
    useEffect(() => { if (open) setRows(breaks); }, [open, breaks]);

    useEffect(() => {
      if (!open) return;
      const onKey = (ev) => { if (ev.key === 'Escape') onClose(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    const updateVal = (id, field, val) => {
      setRows(prev => prev.map(r => r.id === id
        ? { ...r, [field]: clampNum(val, { min: 0, fallback: 0 }) }
        : r
      ));
    };

    const save = () => {
      const sorted = [...rows].sort((a,b) => a.minQty - b.minQty);
      setBreaks(sorted);
      onClose();
    };

    return e('div', {
      className: 'dialog-overlay',
      style: dialogOverlayStyle,
      onClick: (ev) => { if (ev.target === ev.currentTarget) onClose(); }
    },
      e('div', { className: 'dialog', style: dialogStyle },
        e('div', { style:{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8} },
          e('h3', { style:{margin:0, fontSize:'18px'} }, 'Back Color Price Breaks'),
          e('button', {
            onClick: onClose,
            style: { ...btnSecondary, padding:'4px 8px' },
            onMouseEnter: (e)=>Object.assign(e.currentTarget.style, btnSecondaryHover),
            onMouseLeave: (e)=>e.currentTarget.removeAttribute('style')
          }, 'Close')
        ),
        e('p', { className:'muted', style:{marginTop:0, marginBottom:12} },
          'Set the minimum number of colors and flat deduction (applied per unit to the back surcharge). Only the highest eligible break with a non-zero deduction applies.'
        ),
        e('table', {
          className:'breaks-table',
          style:{ width:'100%', borderCollapse:'separate', borderSpacing:'0 8px' }
        },
          e('thead', null,
            e('tr', null,
              e('th', { style:{textAlign:'left', fontWeight:700, fontSize:12, color:'#6b7280'} }, 'Min Colors'),
              e('th', { style:{textAlign:'left', fontWeight:700, fontSize:12, color:'#6b7280'} }, 'Deduction ($)')
            )
          ),
          e('tbody', null,
            rows.map(r =>
              e('tr', { key:r.id },
                e('td', { style:{ width:'40%', paddingRight:8 } },
                  e('input', {
                    type:'number', min:1,
                    className:'input',
                    value:r.minQty,
                    onChange:(ev)=>updateVal(r.id, 'minQty', ev.target.value)
                  })
                ),
                e('td', { style:{ width:'60%' } },
                  e('input', {
                    type:'number', min:0, step:'0.01',
                    className:'input',
                    value:r.deduct,
                    onChange:(ev)=>updateVal(r.id, 'deduct', ev.target.value)
                  })
                )
              )
            )
          )
        ),
        e('div', { style:{ display:'flex', justifyContent:'space-between', marginTop:14 } },
          e('button', {
            onClick: onReset,
            style: btnSecondary,
            onMouseEnter: (e)=>Object.assign(e.currentTarget.style, btnSecondaryHover),
            onMouseLeave: (e)=>e.currentTarget.removeAttribute('style')
          }, 'Reset to defaults'),
          e('div', null,
            e('button', {
              onClick: onClose,
              style:{ ...btnSecondary, marginRight:8 },
              onMouseEnter: (e)=>Object.assign(e.currentTarget.style, btnSecondaryHover),
              onMouseLeave: (e)=>e.currentTarget.removeAttribute('style')
            }, 'Cancel'),
            e('button', {
              onClick: save,
              style:{
                padding:'8px 14px', borderRadius:'10px', border:'1px solid #111827',
                background:'#111827', color:'#fff', fontWeight:700, cursor:'pointer'
              }
            }, 'Save')
          )
        )
      )
    );
  }

  // ---------- Main component ----------
  function Computation() {
    const [basePrice, setBasePrice]     = useState(0);
    const [qty, setQty]                 = useState(1);
    const [frontColors, setFrontColors] = useState(1);
    const [backColors, setBackColors]   = useState(0);

    const [priceBreaks, setPriceBreaks] = useState(() => {
      const saved = localStorage.getItem('threadco_price_breaks_v1');
      return saved ? JSON.parse(saved) : defaultBreaks;
    });
    useEffect(() => {
      localStorage.setItem('threadco_price_breaks_v1', JSON.stringify(priceBreaks));
    }, [priceBreaks]);

    const [priceBreaksFrontColor, setPriceBreaksFrontColor] = useState(() => {
      const saved = localStorage.getItem('threadco_price_breaks_front_color_v1');
      return saved ? JSON.parse(saved) : defaultBreaksFrontColor;
    });
    useEffect(() => {
      localStorage.setItem('threadco_price_breaks_front_color_v1', JSON.stringify(priceBreaksFrontColor));
    }, [priceBreaksFrontColor]);

    const [priceBreaksBackColor, setPriceBreaksBackColor] = useState(() => {
      const saved = localStorage.getItem('threadco_price_breaks_back_color_v1');
      return saved ? JSON.parse(saved) : defaultBreaksBackColor;
    });
    useEffect(() => {
      localStorage.setItem('threadco_price_breaks_back_color_v1', JSON.stringify(priceBreaksBackColor));
    }, [priceBreaksBackColor]);

    const [openDialog, setOpenDialog] = useState(false);
    const [openFrontColorDialog, setOpenFrontColorDialog] = useState(false);
    const [openBackColorDialog, setOpenBackColorDialog] = useState(false);

    const qtySafe = useMemo(() => clampNum(qty, { min: 1, fallback: 1 }), [qty]);
    const frontColorsSafe = useMemo(() => clampNum(frontColors, { min: 0, fallback: 0 }), [frontColors]);
    const backColorsSafe = useMemo(() => clampNum(backColors, { min: 0, fallback: 0 }), [backColors]);
    const frontSurcharge = useMemo(() => colorSurcharge(frontColorsSafe), [frontColorsSafe]);
    const backSurcharge  = useMemo(() => colorSurcharge(backColorsSafe), [backColorsSafe]);

    // NEW: choose the last non-zero deduction among eligible thresholds
    const appliedBreak = useMemo(() => {
      const eligible = priceBreaks
        .filter(b => qtySafe >= b.minQty)
        .sort((a,b) => a.minQty - b.minQty);
      for (let i = eligible.length - 1; i >= 0; i--) {
        if (clampNum(eligible[i].deduct, { min: 0 }) > 0) return eligible[i];
      }
      return null; // none with non-zero deduction
    }, [qtySafe, priceBreaks]);

    const appliedBreakFrontColor = useMemo(() => {
      const eligible = priceBreaksFrontColor
        .filter(b => frontColorsSafe >= b.minQty)
        .sort((a,b) => a.minQty - b.minQty);
      for (let i = eligible.length - 1; i >= 0; i--) {
        if (clampNum(eligible[i].deduct, { min: 0 }) > 0) return eligible[i];
      }
      return null; // none with non-zero deduction
    }, [frontColorsSafe, priceBreaksFrontColor]);

    const appliedBreakBackColor = useMemo(() => {
      const eligible = priceBreaksBackColor
        .filter(b => backColorsSafe >= b.minQty)
        .sort((a,b) => a.minQty - b.minQty);
      for (let i = eligible.length - 1; i >= 0; i--) {
        if (clampNum(eligible[i].deduct, { min: 0 }) > 0) return eligible[i];
      }
      return null; // none with non-zero deduction
    }, [backColorsSafe, priceBreaksBackColor]);

    const unitPrice = useMemo(() => {
      const frontAppliedDeduct = appliedBreakFrontColor?.deduct || 0;
      const backAppliedDeduct = appliedBreakBackColor?.deduct || 0;
      const raw = clampNum(basePrice, { min: 0 }) + Math.max(0, frontSurcharge - frontAppliedDeduct) + Math.max(0, backSurcharge - backAppliedDeduct);
      return Math.max(0, raw - (appliedBreak?.deduct || 0));
    }, [basePrice, frontSurcharge, backSurcharge, appliedBreak, appliedBreakFrontColor, appliedBreakBackColor]);

    const totalPrice = useMemo(() => unitPrice * qtySafe, [unitPrice, qtySafe]);

    // inputs helpers
    const clearZeroOnFocus = (val, setter) => { if (String(val) === "0") setter(""); };
    const parseOnChange = (setter, opts) => (ev) => {
      const v = ev.target.value;
      setter(v === "" ? "" : clampNum(v, opts));
    };

    const resetBreaks = () => setPriceBreaks(defaultBreaks);
    const resetBreaksFrontColor = () => setPriceBreaksFrontColor(defaultBreaksFrontColor);
    const resetBreaksBackColor = () => setPriceBreaksBackColor(defaultBreaksBackColor);

    return e('div', { className: 'comp-page content' },
      e('div', { className: 'calculator-card' },
        e('h2', { className: 'product-title' }, 'Manual Pricing Calculator'),

        e('div', { className: 'calc-grid' },

          // LEFT: inputs
          e('div', null,

            // Base price
            e('div', { className: 'field' },
              e('div', {
                className: 'label-row',
                style: { display:'flex', alignItems:'center', justifyContent:'space-between' }
              },
                e('label', null, 'Base Price (per unit)'),
                e('span', { className: 'muted' }, 'Manually entered')
              ),
              e('input', {
                className: 'input',
                type: 'number', min: 0, step: '0.01', inputMode: 'decimal',
                value: basePrice,
                onFocus: () => clearZeroOnFocus(basePrice, setBasePrice),
                onChange: parseOnChange(setBasePrice, { min: 0, fallback: 0 }),
                onBlur: () => setBasePrice((v) => (v === "" ? 0 : v))
              })
            ),

            // Quantity + button
            e('div', { className: 'field' },
              e('div', {
                className: 'label-row',
                style: { display:'flex', alignItems:'center', justifyContent:'space-between', gap: '8px' }
              },
                e('label', null, 'Quantity'),
                e('button', {
                  type:'button',
                  'aria-label':'Edit price breaks',
                  onClick: () => setOpenDialog(true),
                  style: btnSecondary,
                  onMouseEnter: (e)=>Object.assign(e.currentTarget.style, btnSecondaryHover),
                  onMouseLeave: (e)=>e.currentTarget.removeAttribute('style')
                }, '⚙️', ' ', 'Price Breaks')
              ),
              e('input', {
                className: 'input',
                type: 'number', min: 1, inputMode: 'numeric',
                value: qty,
                onFocus: () => clearZeroOnFocus(qty, setQty),
                onChange: parseOnChange(setQty, { min: 1, fallback: 1 }),
                onBlur: () => setQty((v) => (v === "" ? 1 : v))
              }),
              appliedBreak
                ? e('div', { className: 'muted', style:{ marginTop: '4px' } },
                    `Applying −${money(appliedBreak.deduct)} at ≥ ${appliedBreak.minQty}`)
                : e('div', { className: 'muted', style:{ marginTop: '4px' } },
                    'No price break applied')
            ),

            // Front & Back colors
            e('div', { className: 'field' },
              e('div', { style: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' } },
                e('div', null,
                  e('div', {
                    className: 'label-row',
                    style: { display:'flex', alignItems:'center', justifyContent:'space-between', gap: '8px' }
                  },
                    e('label', null, 'Front Colors'),
                    e('button', {
                      type:'button',
                      'aria-label':'Edit price breaks',
                      onClick: () => setOpenFrontColorDialog(true),
                      style: btnSecondary,
                      onMouseEnter: (e)=>Object.assign(e.currentTarget.style, btnSecondaryHover),
                      onMouseLeave: (e)=>e.currentTarget.removeAttribute('style')
                    }, '⚙️', ' ', 'Price Breaks'),
                  ),
                  e('input', {
                    className: 'input',
                    type: 'number', min: 0, inputMode: 'numeric',
                    value: frontColors,
                    onFocus: () => clearZeroOnFocus(frontColors, setFrontColors),
                    onChange: parseOnChange(setFrontColors, { min: 0, fallback: 0 }),
                    onBlur: () => setFrontColors((v) => (v === "" ? 0 : v))
                  }),
                  e('span', { className: 'muted' }, 'First color +$3, +$1.5 each addl.'),
                  appliedBreakFrontColor
                    ? e('div', { className: 'muted', style:{ marginTop: '4px' } },
                        `Applying −${money(appliedBreakFrontColor.deduct)} at ≥ ${appliedBreakFrontColor.minQty} colors`)
                    : e('div', { className: 'muted', style:{ marginTop: '4px' } },
                        'No front color break applied')
                ),
                e('div', null,
                  e('div', {
                    className: 'label-row',
                    style: { display:'flex', alignItems:'center', justifyContent:'space-between', gap: '8px' }
                  },
                    e('label', null, 'Back Colors'),
                    e('button', {
                      type:'button',
                      'aria-label':'Edit price breaks',
                      onClick: () => setOpenBackColorDialog(true),
                      style: btnSecondary,
                      onMouseEnter: (e)=>Object.assign(e.currentTarget.style, btnSecondaryHover),
                      onMouseLeave: (e)=>e.currentTarget.removeAttribute('style')
                    }, '⚙️', ' ', 'Price Breaks'),
                  ),
                  e('input', {
                    className: 'input',
                    type: 'number', min: 0, inputMode: 'numeric',
                    value: backColors,
                    onFocus: () => clearZeroOnFocus(backColors, setBackColors),
                    onChange: parseOnChange(setBackColors, { min: 0, fallback: 0 }),
                    onBlur: () => setBackColors((v) => (v === "" ? 0 : v))
                  }),
                  e('span', { className: 'muted' }, 'First color +$3, +$1.5 each addl.'),
                  appliedBreakBackColor
                    ? e('div', { className: 'muted', style:{ marginTop: '4px' } },
                        `Applying −${money(appliedBreakBackColor.deduct)} at ≥ ${appliedBreakBackColor.minQty} colors`)
                    : e('div', { className: 'muted', style:{ marginTop: '4px' } },
                        'No back color break applied')
                )
              )
            )
          ),

          // RIGHT: summary
          e('div', { className: 'calc-summary' },
            e('div', { className: 'totals' },
              e('div', { className: 'line' },
                e('span', null, 'Base Price'),
                e('strong', null, money(clampNum(basePrice, { min: 0 })))
              ),
              e('div', { className: 'line' },
                e('span', null, 'Front Surcharge'),
                e('strong', null, money(frontSurcharge))
              ),
              appliedBreakFrontColor && e('div', { className: 'line' },
                e('span', null, `Front Color Deduction`),
                e('strong', { className: 'deduction' }, `−${money(appliedBreakFrontColor.deduct)}`)
              ),
              e('div', { className: 'line' },
                e('span', null, 'Back Surcharge'),
                e('strong', null, money(backSurcharge))
              ),
              appliedBreakBackColor && e('div', { className: 'line' },
                e('span', null, `Back Color Deduction`),
                e('strong', { className: 'deduction' }, `−${money(appliedBreakBackColor.deduct)}`)
              ),
              appliedBreak && e('div', { className: 'line' },
                e('span', null, `Quantity Deduction`),
                e('strong', { className: 'deduction' }, `−${money(appliedBreak.deduct)}`)
              ),
              e('div', { className: 'line', style: { marginTop:'8px', borderTop:'1px solid #e5e7eb', paddingTop:'8px' } },
                e('span', null, 'Unit Price'),
                e('strong', null, money(unitPrice))
              ),
              e('div', { className: 'grand' },
                e('span', { className: 'label' }, `Total for ${intFmt.format(qtySafe)} unit${qtySafe !== 1 ? 's' : ''}`),
                e('span', { className: 'value' }, money(totalPrice))
              )
            )
          )
        ),

        // Modal
        el(PriceBreaksDialog, {
          open: openDialog,
          breaks: priceBreaks,
          setBreaks: setPriceBreaks,
          onClose: () => setOpenDialog(false),
          onReset: resetBreaks
        }),

        el(FrontColorDialog, {
          open: openFrontColorDialog,
          breaks: priceBreaksFrontColor,
          setBreaks: setPriceBreaksFrontColor,
          onClose: () => setOpenFrontColorDialog(false),
          onReset: resetBreaksFrontColor
        }),

        el(BackColorDialog, {
          open: openBackColorDialog,
          breaks: priceBreaksBackColor,
          setBreaks: setPriceBreaksBackColor,
          onClose: () => setOpenBackColorDialog(false),
          onReset: resetBreaksBackColor
        })
      )
    );
  }

  // ---------- Page shell ----------
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
