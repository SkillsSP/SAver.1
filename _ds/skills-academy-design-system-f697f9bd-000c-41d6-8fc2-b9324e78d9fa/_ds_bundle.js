/* @ds-bundle: {"format":4,"namespace":"SkillsAcademyDesignSystem_f697f9","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Navbar","sourcePath":"components/navigation/Navbar.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Dialog","sourcePath":"components/overlay/Dialog.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"b35b21c3f9d6","components/core/Button.jsx":"712303e27c6b","components/core/Card.jsx":"9125426e55cd","components/core/Tag.jsx":"1018add9409d","components/feedback/Toast.jsx":"7fd0378679dc","components/feedback/Tooltip.jsx":"1fae3a310274","components/forms/Checkbox.jsx":"22cef7ef9a11","components/forms/Input.jsx":"acdffb7aafd0","components/forms/Select.jsx":"060515866bca","components/forms/Switch.jsx":"6be3f24d1a3a","components/navigation/Navbar.jsx":"3e900d16ea8a","components/navigation/Tabs.jsx":"0639a2a9bcf5","components/overlay/Dialog.jsx":"a5e6d7bf2d3b","ui_kits/marketing-site/CTABand.jsx":"6195a2badba0","ui_kits/marketing-site/Evidence.jsx":"39dd2582c57a","ui_kits/marketing-site/FAQ.jsx":"a14834ad0253","ui_kits/marketing-site/Footer.jsx":"e4b3a7345294","ui_kits/marketing-site/Hero.jsx":"c6fa1e7b240a","ui_kits/marketing-site/JourneyPath.jsx":"1f999a6640fe","ui_kits/marketing-site/Positioning.jsx":"f157012051d4","ui_kits/marketing-site/Pricing.jsx":"268f049f2406","ui_kits/marketing-site/ProcessSteps.jsx":"337fb71c4f4d","ui_kits/marketing-site/ProgramPillars.jsx":"500e36058f63","ui_kits/marketing-site/SeniorSection.jsx":"87ff820dd8ad","ui_kits/marketing-site/Testimonials.jsx":"f5881c04567d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SkillsAcademyDesignSystem_f697f9 = window.SkillsAcademyDesignSystem_f697f9 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
const TONES = {
  kids: {
    background: 'rgba(255,255,255,.22)',
    color: 'var(--text-on-brand)'
  },
  junior: {
    background: 'rgba(255,255,255,.22)',
    color: 'var(--text-on-brand)'
  },
  senior: {
    background: 'var(--accent-senior)',
    color: 'var(--text-on-brand)'
  },
  neutral: {
    background: 'var(--surface-tint-kobalt)',
    color: 'var(--brand-primary-deep)'
  }
};
function Badge({
  tone = 'neutral',
  children
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sage)',
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 11px',
      borderRadius: 'var(--radius-pill)',
      display: 'inline-block',
      lineHeight: 1.4,
      ...t
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const VARIANT_STYLES = {
  primary: {
    background: 'var(--action-primary)',
    color: 'var(--text-on-brand)',
    border: '1.5px solid transparent'
  },
  secondary: {
    background: 'var(--brand-primary)',
    color: 'var(--text-on-brand)',
    border: '1.5px solid transparent'
  },
  outline: {
    background: 'transparent',
    color: 'var(--brand-primary)',
    border: '1.5px solid var(--brand-primary)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-on-brand)',
    border: '1.5px solid rgba(255,255,255,.5)'
  }
};
const SIZE_STYLES = {
  sm: {
    fontSize: 12.5,
    padding: '8px 15px',
    borderRadius: 'var(--radius-sm)'
  },
  md: {
    fontSize: 13,
    padding: '11px 22px',
    borderRadius: 'var(--radius-md)'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children
}) {
  const v = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const s = SIZE_STYLES[size] || SIZE_STYLES.md;
  return /*#__PURE__*/React.createElement("button", {
    onClick: disabled ? undefined : onClick,
    disabled: disabled,
    style: {
      fontFamily: 'var(--font-sage)',
      fontWeight: 600,
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      outline: 'none',
      ...v,
      ...s
    }
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  padding = 20,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: 'var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      padding,
      boxShadow: 'var(--shadow-card)',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function Tag({
  children,
  onRemove
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sage)',
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--text-primary)',
      background: 'var(--surface-card)',
      border: 'var(--border-hairline)',
      borderRadius: 'var(--radius-pill)',
      padding: '5px 12px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, children, onRemove && /*#__PURE__*/React.createElement("span", {
    onClick: onRemove,
    style: {
      cursor: 'pointer',
      color: 'var(--text-secondary)',
      fontWeight: 700
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const TONE_ACCENT = {
  info: 'var(--brand-primary)',
  success: '#1E7A4D',
  warning: 'var(--action-primary)'
};
function Toast({
  tone = 'info',
  message,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: 'var(--surface-card)',
      border: 'var(--border-hairline)',
      borderLeft: `3px solid ${TONE_ACCENT[tone] || TONE_ACCENT.info}`,
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      fontFamily: 'var(--font-sage)',
      fontSize: 13,
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, message), onClose && /*#__PURE__*/React.createElement("span", {
    onClick: onClose,
    style: {
      cursor: 'pointer',
      color: 'var(--text-secondary)',
      fontWeight: 700
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function Tooltip({
  label,
  children
}) {
  const [show, setShow] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-block'
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false)
  }, children, show && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: '120%',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--text-primary)',
      color: '#fff',
      fontFamily: 'var(--font-sage)',
      fontSize: 11.5,
      padding: '6px 10px',
      borderRadius: 'var(--radius-sm)',
      whiteSpace: 'nowrap',
      zIndex: 10
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  checked,
  onChange
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9,
      fontFamily: 'var(--font-sage)',
      fontSize: 13.5,
      color: 'var(--text-primary)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 5,
      border: checked ? '1.5px solid var(--brand-primary)' : 'var(--border-hairline)',
      background: checked ? 'var(--brand-primary)' : 'var(--surface-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none'
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1
    }
  }, "\u2713")), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    style: {
      display: 'none'
    }
  }), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-sage)',
      width: '100%'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: value,
    onChange: onChange,
    style: {
      font: 'inherit',
      fontSize: 14,
      padding: '11px 14px',
      borderRadius: 'var(--radius-md)',
      border: error ? '1.5px solid var(--action-primary)' : 'var(--border-hairline)',
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      outline: 'none'
    }
  }), error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--action-primary)'
    }
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select({
  label,
  options = [],
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-sage)',
      width: '100%'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: onChange,
    style: {
      font: 'inherit',
      fontSize: 14,
      padding: '11px 14px',
      borderRadius: 'var(--radius-md)',
      border: 'var(--border-hairline)',
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      outline: 'none'
    }
  }, options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  checked,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: 'var(--font-sage)',
      fontSize: 13.5,
      color: 'var(--text-primary)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => onChange && onChange(!checked),
    style: {
      width: 38,
      height: 22,
      borderRadius: 'var(--radius-pill)',
      background: checked ? 'var(--brand-primary)' : 'var(--slate-100)',
      position: 'relative',
      transition: 'background .15s ease',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: checked ? 18 : 2,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left .15s ease'
    }
  })), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Navbar.jsx
try { (() => {
function Navbar({
  links = [],
  ctaLabel,
  onCtaClick,
  logoSrc = '../../assets/logo-color.svg'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px 26px',
      background: 'var(--surface-page)',
      borderBottom: 'var(--border-hairline)',
      fontFamily: 'var(--font-sage)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 16,
      color: 'var(--text-primary)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "",
    style: {
      width: 22,
      height: 22
    }
  }), "Skills Academy"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      fontSize: 12.5,
      color: 'var(--text-secondary)'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      cursor: 'pointer'
    }
  }, l)), ctaLabel && /*#__PURE__*/React.createElement("span", {
    onClick: onCtaClick,
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: '#fff',
      background: 'var(--action-primary)',
      padding: '8px 15px',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer'
    }
  }, ctaLabel)));
}
Object.assign(__ds_scope, { Navbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Navbar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  tabs,
  defaultIndex = 0,
  onChange
}) {
  const [active, setActive] = React.useState(defaultIndex);
  const select = i => {
    setActive(i);
    onChange && onChange(i);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sage)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      borderBottom: 'var(--border-hairline)'
    }
  }, tabs.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: t.label,
    onClick: () => select(i),
    style: {
      padding: '10px 16px',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      color: i === active ? 'var(--brand-primary)' : 'var(--text-secondary)',
      borderBottom: i === active ? '2px solid var(--brand-primary)' : '2px solid transparent',
      marginBottom: -1
    }
  }, t.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 2px',
      color: 'var(--text-primary)',
      fontSize: 14
    }
  }, tabs[active] && tabs[active].content));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/overlay/Dialog.jsx
try { (() => {
function Dialog({
  open,
  title,
  children,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(26,34,48,.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sage)',
      zIndex: 50
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      border: 'var(--border-hairline)',
      padding: 24,
      width: 340,
      maxWidth: '90%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 18,
      color: 'var(--brand-primary)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    onClick: onClose,
    style: {
      cursor: 'pointer',
      color: 'var(--text-secondary)',
      fontSize: 16
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--text-primary)'
    }
  }, children)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/Dialog.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/CTABand.jsx
try { (() => {
function CTABand({
  onCta
}) {
  const {
    Button
  } = window.SkillsAcademyDesignSystem_f697f9;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '52px 32px',
      fontFamily: 'var(--font-sage)',
      background: 'var(--brand-primary)',
      color: '#fff',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 26,
      margin: '0 0 10px'
    }
  }, "Gotowi na pierwsz\u0105 misj\u0119?"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'rgba(255,255,255,.85)',
      margin: '0 0 24px'
    }
  }, "Um\xF3w bezp\u0142atne zaj\u0119cia pr\xF3bne \u2014 odezwiemy si\u0119 w 24h, \u017Ceby ustali\u0107 termin."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: onCta
  }, "Um\xF3w zaj\u0119cia pr\xF3bne"));
}
window.CTABand = CTABand;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/CTABand.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Evidence.jsx
try { (() => {
const SOURCES = ['OECD', 'UNESCO', 'UNICEF', 'WHO', 'EEF', 'TPR', 'PBL'];
function Evidence() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '32px',
      fontFamily: 'var(--font-sage)',
      background: 'var(--surface-page)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-secondary)',
      margin: '0 0 14px'
    }
  }, "Program oparty o metodologi\u0119 i badania:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 22,
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, SOURCES.map(s => /*#__PURE__*/React.createElement("span", {
    key: s,
    style: {
      fontFamily: 'var(--font-sage)',
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--brand-primary-deep)'
    }
  }, s))));
}
window.Evidence = Evidence;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Evidence.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/FAQ.jsx
try { (() => {
const QA = [{
  q: 'Czym różni się to od szkoły językowej?',
  a: 'Nie uczymy słówek na pamięć — uczymy dzieci działać po angielsku: pytać, negocjować, rozwiązywać problemy w realnych misjach. Angielski jest narzędziem, nie samym celem zajęć.'
}, {
  q: 'Co to jest Rdzeń i fakultety?',
  a: 'Rdzeń to obowiązkowe zajęcia bazowe — Useful Skills i Life Skills (a dla Teens Junior dodatkowo Exams, przygotowanie do ósmoklasisty). Fakultety to zajęcia wybierane wg zainteresowań dziecka, np. programowanie, teatr czy sport.'
}, {
  q: 'Na jakich badaniach opiera się program?',
  a: 'Metodologia czerpie z rekomendacji OECD, UNESCO, UNICEF i WHO oraz z metod TPR (Total Physical Response) i PBL (nauka przez projekty), a nie z autorskich, niesprawdzonych pomysłów.'
}, {
  q: 'Dlaczego oferta dla Teens Senior wygląda inaczej?',
  a: 'Teens Senior (16–19 lat) to osobna, wynikowa oferta przygotowania do matury — świadomie bez metafor przygody, skupiona na konkretnych progach punktowych i poziomach B1/B2.'
}];
function FAQ() {
  const [openIndex, setOpenIndex] = React.useState(0);
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '48px 32px',
      fontFamily: 'var(--font-sage)',
      background: 'var(--surface-card)',
      borderTop: 'var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--brand-primary-deep)',
      fontWeight: 600,
      margin: '0 0 8px'
    }
  }, "Pytania rodzic\xF3w"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 24,
      margin: '0 0 20px',
      color: 'var(--text-primary)'
    }
  }, "Zanim zapiszesz dziecko"), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 680
    }
  }, QA.map((item, i) => {
    const open = i === openIndex;
    return /*#__PURE__*/React.createElement("div", {
      key: item.q,
      style: {
        borderBottom: 'var(--border-hairline)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setOpenIndex(open ? -1 : i),
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 4px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: 14.5,
        color: 'var(--text-primary)'
      }
    }, item.q, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--brand-primary)',
        fontSize: 18,
        lineHeight: 1
      }
    }, open ? '−' : '+')), open && /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '0 0 16px 4px',
        fontSize: 13.5,
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        maxWidth: 600
      }
    }, item.a));
  })));
}
window.FAQ = FAQ;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/FAQ.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Footer.jsx
try { (() => {
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      padding: '32px',
      fontFamily: 'var(--font-sage)',
      background: 'var(--surface-page)',
      borderTop: 'var(--border-hairline)',
      fontSize: 12,
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-color.svg",
    alt: "",
    style: {
      width: 18,
      height: 18
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--text-primary)'
    }
  }, "Skills Academy")), "Wspieranie dzieci w rozwijaniu kompetencji potrzebnych do \u017Cycia w XXI wieku \u2014 angielski, umiej\u0119tno\u015Bci \u017Cyciowe, edukacja medialna, nauka przez do\u015Bwiadczenie.");
}
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Hero.jsx
try { (() => {
function Hero({
  onCta
}) {
  const {
    Navbar,
    Button,
    Badge
  } = window.SkillsAcademyDesignSystem_f697f9;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Navbar, {
    links: ['Program', 'O nas'],
    ctaLabel: "Zapisz dziecko",
    onCtaClick: onCta,
    logoSrc: "../../assets/logo-color.svg"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--brand-primary)',
      color: '#fff',
      padding: '48px 32px',
      fontFamily: 'var(--font-sage)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "kids"
  }, "Kids"), /*#__PURE__*/React.createElement(Badge, {
    tone: "junior"
  }, "Teens Junior"), /*#__PURE__*/React.createElement(Badge, {
    tone: "senior"
  }, "Teens Senior \xB7 Matura")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 34,
      maxWidth: 520,
      lineHeight: 1.15,
      margin: '0 0 12px'
    }
  }, "Dzi\u015B jeste\u015B detektywem lotniska"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: 'rgba(255,255,255,.85)',
      maxWidth: 440,
      margin: '0 0 22px'
    }
  }, "Angielski dla \u017Cycia, nie tylko dla szko\u0142y. Misje, realne umiej\u0119tno\u015Bci i pewno\u015B\u0107 siebie \u2014 po angielsku, bo to j\u0119zyk dzia\u0142ania."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: onCta
  }, "Um\xF3w zaj\u0119cia pr\xF3bne"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, "Zobacz program \u2192"))));
}
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/JourneyPath.jsx
try { (() => {
const STAGES = [{
  age: '5–7',
  label: 'Kids 1',
  tone: 'Ton zabawowy, powtórzenia',
  branch: false
}, {
  age: '8–10',
  label: 'Kids 2',
  tone: 'Ton misji — wyzwania i odkrycia',
  branch: false
}, {
  age: '11–12',
  label: 'Kids 3',
  tone: 'Ton partnerski, mniej infantylny',
  branch: false
}, {
  age: '13–15',
  label: 'Teens Junior',
  tone: 'Ton rówieśniczy, cel: ósmoklasista',
  branch: false
}, {
  age: '16–19',
  label: 'Teens Senior',
  tone: 'Osobna ścieżka — wynik, matura',
  branch: true
}];
function JourneyPath() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '48px 32px',
      fontFamily: 'var(--font-sage)',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--brand-primary-deep)',
      fontWeight: 600,
      margin: '0 0 8px'
    }
  }, "\u015Acie\u017Cka rozwoju"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 24,
      margin: '0 0 28px',
      color: 'var(--text-primary)'
    }
  }, "Jedna Akademia, od 5 do 19 lat"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 0,
      position: 'relative'
    }
  }, STAGES.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative'
    }
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 9,
      right: '50%',
      width: '100%',
      height: 2,
      background: s.branch ? 'var(--accent-senior)' : 'var(--surface-tint-kobalt)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      borderRadius: '50%',
      zIndex: 1,
      background: s.branch ? 'var(--accent-senior)' : 'var(--brand-primary)',
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-secondary)',
      marginBottom: 2
    }
  }, s.age, " lat"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 15,
      color: s.branch ? 'var(--accent-senior)' : 'var(--text-primary)',
      marginBottom: 4
    }
  }, s.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-secondary)',
      maxWidth: 140,
      lineHeight: 1.4
    }
  }, s.tone)))));
}
window.JourneyPath = JourneyPath;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/JourneyPath.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Positioning.jsx
try { (() => {
function Positioning() {
  const {
    Tag
  } = window.SkillsAcademyDesignSystem_f697f9;
  const values = ['Rozwój', 'Samodzielność', 'Odpowiedzialność', 'Kreatywność', 'Współpraca', 'Bezpieczeństwo'];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '48px 32px',
      fontFamily: 'var(--font-sage)',
      background: 'var(--surface-card)',
      borderBottom: 'var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--brand-primary-deep)',
      fontWeight: 600,
      margin: '0 0 10px'
    }
  }, "Pozycjonowanie"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 26,
      margin: '0 0 12px',
      color: 'var(--text-primary)',
      maxWidth: 620
    }
  }, "\u015Awiadomie nie szko\u0142a j\u0119zykowa \u2014 centrum kompetencji przysz\u0142o\u015Bci dla dzieci"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14.5,
      color: 'var(--text-secondary)',
      maxWidth: 620,
      lineHeight: 1.65,
      margin: '0 0 20px'
    }
  }, "Wspieramy dzieci w rozwijaniu kompetencji potrzebnych do \u017Cycia w XXI wieku, \u0142\u0105cz\u0105c angielski, umiej\u0119tno\u015Bci \u017Cyciowe, edukacj\u0119 medialn\u0105 i nauk\u0119 przez do\u015Bwiadczenie \u2014 nie tylko nauk\u0119 s\u0142\xF3wek na pami\u0119\u0107."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, values.map(v => /*#__PURE__*/React.createElement(Tag, {
    key: v
  }, v))));
}
window.Positioning = Positioning;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Positioning.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Pricing.jsx
try { (() => {
function Pricing({
  onCta,
  onCtaSenior
}) {
  const {
    Card,
    Button,
    Badge
  } = window.SkillsAcademyDesignSystem_f697f9;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '48px 32px',
      fontFamily: 'var(--font-sage)',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--brand-primary-deep)',
      fontWeight: 600,
      margin: '0 0 8px'
    }
  }, "Karnety"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 24,
      margin: '0 0 6px',
      color: 'var(--text-primary)'
    }
  }, "Wybierz karnet dla dziecka"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      margin: '0 0 24px',
      maxWidth: 560
    }
  }, "Ceny ustalane indywidualnie wg liczby zaj\u0119\u0107 w tygodniu \u2014 poni\u017Cej zakres ka\u017Cdego karnetu. ", /*#__PURE__*/React.createElement("em", null, "Miejsce na cennik: uzupe\u0142nij realne stawki, gdy b\u0119d\u0105 gotowe.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "Pierwszy krok"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 18,
      color: 'var(--text-primary)',
      margin: '10px 0 6px'
    }
  }, "Zaj\u0119cia pr\xF3bne"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      marginBottom: 14,
      lineHeight: 1.5
    }
  }, "Jedno spotkanie, poznanie grupy i prowadz\u0105cego. 45 minut, stacjonarnie lub online."), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    onClick: onCta
  }, "Um\xF3w bezp\u0142atnie")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Badge, {
    tone: "kids"
  }, "Kids + Teens Junior"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 18,
      color: 'var(--text-primary)',
      margin: '10px 0 6px'
    }
  }, "Karnet miesi\u0119czny"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      marginBottom: 14,
      lineHeight: 1.5
    }
  }, "Rdze\u0144 (Useful Skills + Life Skills) + jeden fakultet do wyboru. Liczba spotka\u0144 tygodniowo do ustalenia."), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    onClick: onCta
  }, "Zapytaj o cennik")), /*#__PURE__*/React.createElement(Card, {
    style: {
      background: 'var(--slate-100)'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "senior"
  }, "Teens Senior"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sage)',
      fontWeight: 600,
      fontSize: 18,
      color: 'var(--text-primary)',
      margin: '10px 0 6px'
    }
  }, "Karnet maturalny"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      marginBottom: 14,
      lineHeight: 1.5
    }
  }, "Harmonogram dopasowany do terminu matury, praca na arkuszach CKE, poziom B1/B2."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    onClick: onCtaSenior
  }, "Um\xF3w konsultacj\u0119"))));
}
window.Pricing = Pricing;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Pricing.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/ProcessSteps.jsx
try { (() => {
const STEPS = [{
  n: '01',
  title: 'Umów zajęcia próbne',
  desc: 'Wybierasz termin online — zajmuje to mniej niż dwie minuty.'
}, {
  n: '02',
  title: 'Dobieramy grupę i program',
  desc: 'Krótka rozmowa o wieku i poziomie dziecka, dopasowanie do Rdzenia i fakultetów.'
}, {
  n: '03',
  title: 'Dziecko zaczyna pierwszą misję',
  desc: 'Start w grupie rówieśniczej, w tonie dopasowanym do wieku.'
}];
function ProcessSteps() {
  const {
    Card
  } = window.SkillsAcademyDesignSystem_f697f9;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '48px 32px',
      fontFamily: 'var(--font-sage)',
      background: 'var(--surface-card)',
      borderTop: 'var(--border-hairline)',
      borderBottom: 'var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--brand-primary-deep)',
      fontWeight: 600,
      margin: '0 0 8px'
    }
  }, "Jak to dzia\u0142a"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 24,
      margin: '0 0 24px',
      color: 'var(--text-primary)'
    }
  }, "Trzy kroki do pierwszej misji"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: 14
    }
  }, STEPS.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.n
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 22,
      color: 'var(--action-primary)',
      marginBottom: 8
    }
  }, s.n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 15,
      color: 'var(--text-primary)',
      marginBottom: 6
    }
  }, s.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      lineHeight: 1.5
    }
  }, s.desc)))));
}
window.ProcessSteps = ProcessSteps;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/ProcessSteps.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/ProgramPillars.jsx
try { (() => {
const PILLARS = [{
  name: 'Useful Skills',
  desc: 'Angielski jako narzędzie działania — pytania, negocjacje, rozwiązywanie problemów w realnych misjach.'
}, {
  name: 'Life Skills',
  desc: 'Samodzielność, współpraca i odpowiedzialność — kompetencje życiowe ćwiczone przy okazji języka.'
}, {
  name: 'Exams',
  desc: 'Trzeci filar Rdzenia dla Teens Junior — przygotowanie do egzaminu ósmoklasisty.'
}];
function ProgramPillars() {
  const {
    Card,
    Tag
  } = window.SkillsAcademyDesignSystem_f697f9;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '48px 32px',
      fontFamily: 'var(--font-sage)',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--brand-primary-deep)',
      fontWeight: 600,
      margin: '0 0 8px'
    }
  }, "Program \xB7 Kids + Teens Junior"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 24,
      margin: '0 0 24px',
      color: 'var(--text-primary)'
    }
  }, "Rdze\u0144 \u2014 obowi\u0105zkowe zaj\u0119cia bazowe"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: 14,
      marginBottom: 24
    }
  }, PILLARS.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.name
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 17,
      color: 'var(--brand-primary)',
      marginBottom: 6
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      lineHeight: 1.5
    }
  }, p.desc)))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      margin: '0 0 10px'
    }
  }, "Fakultety \u2014 wyb\xF3r wg zainteresowa\u0144:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, ['Programowanie', 'Teatr', 'Sport', 'Media i kreatywność'].map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t
  }, t))));
}
window.ProgramPillars = ProgramPillars;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/ProgramPillars.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/SeniorSection.jsx
try { (() => {
function SeniorSection({
  onCta
}) {
  const {
    Button,
    Badge
  } = window.SkillsAcademyDesignSystem_f697f9;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '48px 32px',
      fontFamily: 'var(--font-sage)',
      background: 'var(--slate-100)'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "senior"
  }, "Teens Senior \xB7 16\u201319 lat"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-sage)',
      fontWeight: 600,
      fontSize: 24,
      margin: '14px 0 8px',
      color: 'var(--text-primary)'
    }
  }, "Konkretny plan na matur\u0119 z angielskiego"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-secondary)',
      maxWidth: 560,
      margin: '0 0 20px',
      lineHeight: 1.6
    }
  }, "Osobna oferta, poza modelem filarowym. Bez metafor przygody \u2014 konkretne progi punktowe, poziomy B1/B2 i realne przyk\u0142ady poprawy wyniku na arkuszach CKE."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onCta
  }, "Um\xF3w konsultacj\u0119 maturaln\u0105"));
}
window.SeniorSection = SeniorSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/SeniorSection.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Testimonials.jsx
try { (() => {
const STARS = '★★★★★';
function Testimonials() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '48px 32px',
      fontFamily: 'var(--font-sage)',
      background: 'var(--surface-card)',
      borderTop: 'var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--brand-primary-deep)',
      fontWeight: 600,
      margin: '0 0 8px'
    }
  }, "Opinie"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-explorer)',
      fontWeight: 600,
      fontSize: 24,
      margin: '0 0 6px',
      color: 'var(--text-primary)'
    }
  }, "Co m\xF3wi\u0105 rodzice"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-secondary)',
      margin: '0 0 20px'
    }
  }, "Przyk\u0142adowe miejsca na opinie \u2014 podmie\u0144 na realne cytaty rodzic\xF3w, gdy je zbierzesz."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
      gap: 14
    }
  }, [1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      border: 'var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: 18,
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--action-primary)',
      fontSize: 14,
      letterSpacing: 2,
      marginBottom: 10
    }
  }, STARS), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      fontStyle: 'italic',
      lineHeight: 1.55,
      marginBottom: 12
    }
  }, "\u201EMiejsce na opini\u0119 rodzica \u2014 kr\xF3tki cytat o zauwa\u017Conej zmianie u dziecka.\""), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, "Imi\u0119 rodzica, grupa dziecka")))));
}
window.Testimonials = Testimonials;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Testimonials.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Navbar = __ds_scope.Navbar;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Dialog = __ds_scope.Dialog;

})();
