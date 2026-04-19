const { useState, useCallback, useEffect } = React;

// ─── CONSTANTS ────────────────────────────────────────────
const COLORS = {
  navy: "#0D1B2A", navyMid: "#1B2D45", navyLight: "#243B53",
  electric: "#1E88E5", electricLight: "#42A5F5",
  gold: "#FFB300", goldDark: "#E6A200",
  dark: "#0A1628", white: "#FFFFFF",
  midGray: "#7B8FA1", border: "#2A3E55",
  success: "#43A047", danger: "#E53935",
  textLight: "#CBD5E0", textBody: "#E2E8F0",
};

// Default PDF theme - this is what each user can override
const THEME_DEFAULT = {
  fondo: "#0D1B2A",      // Background navy
  fondoOscuro: "#0A1628", // Darker background
  acento: "#1E88E5",     // Electric blue accent
  acentoClaro: "#42A5F5",
  dorado: "#FFB300",     // Gold
  doradoOscuro: "#E6A200",
  logo: null,            // Base64 image or null
};

const EMPRESA_DEFAULT = {
  nombre: "",
  subtitulo: "Instalaciones • Certificaciones • Consultoría Técnica",
  titular: "",
  titulo: "Téc. Electromecánico Matriculado",
  matricula1: "",
  matricula2: "",
  direccion: "",
  telefono: "",
  email: "",
  validez: 15,
};

const SERVICIOS_CATALOGO = [
  { cat: "Instalaciones", items: [
    "Instalación eléctrica domiciliaria completa",
    "Instalación eléctrica comercial / industrial",
    "Instalación de tablero seccional",
    "Instalación de puesta a tierra (PAT)",
    "Instalación de disyuntor diferencial",
    "Tendido de cableado y cañerías",
    "Instalación de iluminación LED",
    "Armado de pilar T2 según proyecto",
    "Instalación de tomacorrientes y llaves",
  ]},
  { cat: "Mantenimiento y Reparación", items: [
    "Mantenimiento preventivo de instalación eléctrica",
    "Reparación de cortocircuitos",
    "Cambio de termomagnéticas y diferenciales",
    "Reparación de tablero eléctrico",
    "Búsqueda y reparación de fallas eléctricas",
  ]},
  { cat: "Certificaciones y Mediciones", items: [
    "Medición de puesta a tierra y continuidad (Res. SRT 900/15)",
    "Certificado de instalación eléctrica (DCI)",
    "Informe técnico de instalación",
    "Relevamiento eléctrico completo",
  ]},
  { cat: "Trámites y Gestiones", items: [
    "Ampliación de potencia eléctrica ante EDESUR",
    "Ampliación de potencia eléctrica ante EDENOR",
    "Tramitación de Encomienda profesional",
    "Gestión de documentación técnica ante distribuidora",
    "Proyecto eléctrico para habilitación comercial",
  ]},
  { cat: "Obras Especiales", items: [
    "Automatización de iluminación",
    "Instalación de grupo electrógeno",
    "Canalización y bandejas portacables",
  ]},
];

// Preset palettes for quick selection
const PRESETS = [
  { name: "Azul Profesional", fondo: "#0D1B2A", fondoOscuro: "#0A1628", acento: "#1E88E5", acentoClaro: "#42A5F5", dorado: "#FFB300", doradoOscuro: "#E6A200" },
  { name: "Bordó Elegante",   fondo: "#1A0F14", fondoOscuro: "#120A0E", acento: "#C62828", acentoClaro: "#E53935", dorado: "#FFB300", doradoOscuro: "#E6A200" },
  { name: "Verde Ecológico",   fondo: "#0F1A14", fondoOscuro: "#0A120E", acento: "#2E7D32", acentoClaro: "#43A047", dorado: "#FFB300", doradoOscuro: "#E6A200" },
  { name: "Grafito Minimal",   fondo: "#1A1A1A", fondoOscuro: "#0F0F0F", acento: "#616161", acentoClaro: "#9E9E9E", dorado: "#FFB300", doradoOscuro: "#E6A200" },
  { name: "Negro Premium",     fondo: "#000000", fondoOscuro: "#0A0A0A", acento: "#D4AF37", acentoClaro: "#F5C842", dorado: "#D4AF37", doradoOscuro: "#B8941F" },
  { name: "Celeste Claro",     fondo: "#F5F7FA", fondoOscuro: "#FFFFFF", acento: "#0277BD", acentoClaro: "#0288D1", dorado: "#F57F17", doradoOscuro: "#E65100" },
];

const formatCurrency = (n) => {
  if (!n && n !== 0) return "$0";
  return "$ " + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 });
};

const numberToWords = (n) => {
  if (!n || n === 0) return "cero";
  const u = ["","un","dos","tres","cuatro","cinco","seis","siete","ocho","nueve"];
  const d = ["","diez","veinte","treinta","cuarenta","cincuenta","sesenta","setenta","ochenta","noventa"];
  const ds = ["diez","once","doce","trece","catorce","quince","dieciséis","diecisiete","dieciocho","diecinueve"];
  const c = ["","cien","doscientos","trescientos","cuatrocientos","quinientos","seiscientos","setecientos","ochocientos","novecientos"];
  const convertGroup = (num) => {
    if (num === 0) return "";
    if (num === 100) return "cien";
    let r = "";
    if (num >= 100) { r += c[Math.floor(num/100)] + " "; num %= 100; }
    if (num >= 20) { r += d[Math.floor(num/10)]; if (num%10) r += " y " + u[num%10]; }
    else if (num >= 10) r += ds[num-10];
    else if (num > 0) r += u[num];
    return r.trim();
  };
  if (n >= 1000000) {
    const mill = Math.floor(n/1000000); const rest = n % 1000000;
    const millStr = mill === 1 ? "un millón" : convertGroup(mill) + " millones";
    if (rest === 0) return millStr;
    const thousands = Math.floor(rest/1000); const units = rest % 1000;
    let restStr = "";
    if (thousands > 0) restStr += (thousands === 1 ? "mil" : convertGroup(thousands) + " mil");
    if (units > 0) restStr += (restStr ? " " : "") + convertGroup(units);
    return millStr + " " + restStr;
  }
  if (n >= 1000) {
    const th = Math.floor(n/1000); const rest = n % 1000;
    const thStr = th === 1 ? "mil" : convertGroup(th) + " mil";
    if (rest === 0) return thStr;
    return thStr + " " + convertGroup(rest);
  }
  return convertGroup(n);
};

// Detect if a color is light (so we pick dark text over it)
const isLight = (hex) => {
  try {
    const h = hex.replace("#","");
    const r = parseInt(h.substr(0,2),16), g = parseInt(h.substr(2,2),16), b = parseInt(h.substr(4,2),16);
    return (r*299 + g*587 + b*114)/1000 > 155;
  } catch(e) { return false; }
};

const today = () => new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
const genNro = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`; };

// ─── PDF HTML GENERATOR ────────────────────────────────────
function generatePDFHTML(data) {
  const { empresa, theme, cliente, direccionObra, nroPresupuesto, tituloPresupuesto, objetoServicio, servicios, responsabilidad, honorarios, condicionPago, montoEnLetras } = data;
  const t = theme || THEME_DEFAULT;
  const lightBg = isLight(t.fondo);
  const textMain = lightBg ? "#1A1A1A" : "#E2E8F0";
  const textMuted = lightBg ? "#6B7280" : "#CBD5E0";
  const textSoft = lightBg ? "#9CA3AF" : "#7B8FA1";
  const borderColor = lightBg ? "#E5E7EB" : "#2A3E55";
  const cardBg = lightBg ? "#FFFFFF" : t.fondoOscuro;
  const sectionBg = lightBg ? "#F9FAFB" : "#1B2D45";

  const matriculasHeader = [empresa.matricula1, empresa.matricula2].filter(Boolean).map(m => `Mat. ${m}`).join(" | ");
  const matriculasFooter = [empresa.matricula1, empresa.matricula2].filter(Boolean).map(m => `<span class="footer-mat">Mat. ${m}</span>`).join(" ");

  const logoHTML = t.logo
    ? `<img src="${t.logo}" style="width:44px;height:44px;object-fit:contain;border-radius:10px;background:#fff;padding:4px;box-shadow:0 4px 16px ${t.dorado}44;flex-shrink:0" alt="Logo" />`
    : `<div style="width:44px;height:44px;background:linear-gradient(135deg,${t.dorado},${t.doradoOscuro});border-radius:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px ${t.dorado}44;flex-shrink:0"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${t.fondo}" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>`;

  const serviciosHTML = servicios.map((s, i) => `
    <div style="margin-bottom:18px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:7px;">
        <div style="background:linear-gradient(135deg,${t.acento},${t.acentoClaro});color:#fff;font-size:12px;font-weight:800;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${String(i+1).padStart(2,'0')}</div>
        <div style="font-size:13px;font-weight:700;color:${textMain};line-height:1.3;">${s.titulo}</div>
      </div>
      <div style="margin-left:44px;">
        ${s.items.map(item => `<div style="display:flex;gap:7px;align-items:flex-start;margin-bottom:4px;"><span style="color:${t.acento};font-size:10px;margin-top:3px;flex-shrink:0;">■</span><span style="font-size:12px;color:${textMuted};line-height:1.5;">${item}</span></div>`).join("")}
      </div>
    </div>
  `).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=794, initial-scale=0.48, minimum-scale=0.2, maximum-scale=2">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
@page{size:A4;margin:0}*{margin:0;padding:0;box-sizing:border-box}
html{width:794px}
html,body{min-height:1123px}
body{font-family:'Inter',sans-serif;background:${t.fondo};color:${textMain};display:flex;flex-direction:column;width:794px;margin:0 auto}
.page{width:794px;min-height:1123px;padding:0;position:relative;background:${t.fondo};display:flex;flex-direction:column;flex:1 0 auto}
@media print{html,body{width:210mm;min-height:297mm}.page{width:210mm;min-height:297mm;height:297mm}}
.header{background:linear-gradient(135deg,${t.fondoOscuro} 0%,${t.fondo} 40%,${lightBg?"#F3F4F6":"#1B2D45"} 100%);padding:24px 34px 20px;border-bottom:3px solid ${t.acento};position:relative;overflow:hidden;flex-shrink:0}
.header::before{content:'';position:absolute;top:-20px;right:-20px;width:120px;height:120px;background:radial-gradient(circle,${t.dorado}15 0%,transparent 70%)}
.header-top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}
.logo-section{display:flex;align-items:center;gap:12px;flex:1;min-width:0}
.company-name{font-size:20px;font-weight:900;color:${lightBg?"#111":"#fff"};letter-spacing:0.5px;line-height:1.1}
.company-sub{font-size:10px;color:${t.acentoClaro};margin-top:3px;letter-spacing:0.3px}
.header-info{font-size:9.5px;color:${textSoft};text-align:right;line-height:1.7;margin-top:2px;white-space:nowrap}
.header-mat{font-size:9.5px;color:${t.acentoClaro};font-weight:600}
.presup-bar{background:${sectionBg};border:1px solid ${borderColor};border-radius:10px;margin:16px 34px 0;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-shrink:0}
.presup-nro{font-size:9px;color:${textSoft};text-transform:uppercase;letter-spacing:1.5px;flex-shrink:0}
.presup-nro span{font-size:18px;color:${t.dorado};font-weight:800;display:block;margin-top:2px}
.presup-titulo{font-size:13px;color:${textMain};font-weight:600;text-align:center;line-height:1.4;flex:1}
.presup-fecha{font-size:9px;color:${textSoft};text-align:right;flex-shrink:0}
.presup-fecha span{font-size:13px;color:${textMain};font-weight:600;display:block;margin-top:2px;white-space:nowrap}
.info-cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:14px 34px 0;flex-shrink:0}
.info-card{background:${cardBg};border:1px solid ${borderColor};border-radius:8px;padding:13px 15px;min-width:0}
.info-card-label{font-size:8.5px;color:${t.acento};text-transform:uppercase;letter-spacing:1.2px;font-weight:700;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.info-card-value{font-size:12.5px;color:${textMain};font-weight:500;line-height:1.4;word-wrap:break-word}
.content{padding:0 34px;flex:1 1 auto;display:flex;flex-direction:column}
.section-header{display:flex;align-items:center;gap:10px;margin:22px 0 12px;flex-shrink:0}
.section-header-text{font-size:9.5px;text-transform:uppercase;letter-spacing:1.8px;color:${t.dorado};font-weight:700;white-space:nowrap}
.section-header-line{flex:1;height:1px;background:linear-gradient(90deg,${t.dorado}66,transparent)}
.objeto-box{background:${sectionBg};border:1px solid ${borderColor};border-radius:10px;padding:16px 20px;font-size:12.5px;color:${textMuted};line-height:1.7;text-align:justify;flex-shrink:0}
.alcance-wrapper{flex-shrink:0}
.responsabilidad-box{background:${cardBg};border:1px solid ${borderColor};border-left:3px solid ${t.acento};border-radius:0 8px 8px 0;padding:14px 18px;font-size:11px;color:${textSoft};line-height:1.7;text-align:justify;flex-shrink:0}
.spacer{flex:1 1 auto;min-height:20px}
.honorarios-box{background:linear-gradient(135deg,${t.fondoOscuro},${sectionBg});border:2px solid ${t.dorado}44;border-radius:12px;padding:22px 26px;display:flex;justify-content:space-between;align-items:center;gap:24px;margin-top:8px;flex-shrink:0}
.honorarios-left{flex:1;min-width:0}
.honorarios-right{flex-shrink:0;text-align:right;min-width:180px}
.honorarios-label{font-size:9.5px;color:${t.dorado};text-transform:uppercase;letter-spacing:1.8px;font-weight:700;margin-bottom:5px}
.honorarios-monto{font-size:30px;font-weight:900;color:${t.dorado};line-height:1.1;white-space:nowrap}
.honorarios-letras{font-size:10.5px;color:${textSoft};margin-top:5px;font-style:italic;line-height:1.4}
.condicion-label{font-size:9.5px;color:${t.acento};text-transform:uppercase;letter-spacing:1.2px;font-weight:700;margin-bottom:7px;white-space:nowrap}
.condicion-item{font-size:11.5px;color:${textMuted};margin-bottom:4px;line-height:1.5;white-space:nowrap}
.firma-section{display:flex;justify-content:space-between;align-items:flex-end;margin:32px 0 20px;gap:40px;flex-shrink:0}
.firma-box{flex:1;text-align:center}
.firma-line{border-top:1px solid ${borderColor};margin-bottom:8px;padding-top:4px}
.firma-label{font-size:10px;color:${textSoft};text-transform:uppercase;letter-spacing:1.5px;font-weight:600}
.firma-nombre{font-size:11px;color:${textMain};font-weight:600;margin-top:3px}
.firma-mat{font-size:9px;color:${t.acentoClaro};margin-top:2px}
.footer{background:${t.fondoOscuro};border-top:2px solid ${t.acento};padding:12px 34px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;margin-top:auto}
.footer-text{font-size:8.5px;color:${textSoft};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.footer-mat{display:inline-block;background:${sectionBg};border:1px solid ${borderColor};border-radius:4px;padding:2px 7px;font-size:8px;color:${t.acentoClaro};margin:0 2px}
</style></head><body>
<div class="page">
  <div class="header"><div class="header-top">
    <div class="logo-section">
      ${logoHTML}
      <div><div class="company-name">${(empresa.nombre || "").toUpperCase()}</div>${empresa.subtitulo ? `<div class="company-sub">${empresa.subtitulo}</div>` : ""}</div>
    </div>
    <div class="header-info">${empresa.direccion ? empresa.direccion + "<br>" : ""}${empresa.telefono ? "Tel.: " + empresa.telefono + "<br>" : ""}${(empresa.titulo || matriculasHeader) ? `<span class="header-mat">${[empresa.titulo, matriculasHeader].filter(Boolean).join(" | ")}</span>` : ""}</div>
  </div></div>
  <div class="presup-bar">
    <div class="presup-nro">Presupuesto N°<span>${nroPresupuesto}</span></div>
    <div class="presup-titulo">${tituloPresupuesto}</div>
    <div class="presup-fecha">Fecha<span>${today()}</span></div>
  </div>
  <div class="info-cards">
    <div class="info-card"><div class="info-card-label">Cliente</div><div class="info-card-value">${cliente || "A quien corresponda"}</div></div>
    <div class="info-card"><div class="info-card-label">Dirección de la Obra</div><div class="info-card-value">${direccionObra || "—"}</div></div>
    <div class="info-card"><div class="info-card-label">Validez del Presupuesto</div><div class="info-card-value">${empresa.validez || 15} días corridos</div></div>
  </div>
  <div class="content">
    ${objetoServicio ? `<div class="section-header"><div class="section-header-text">Objetivo del Servicio</div><div class="section-header-line"></div></div><div class="objeto-box">${objetoServicio.replace(/\n/g,"<br>")}</div>` : ""}
    <div class="alcance-wrapper">
      <div class="section-header"><div class="section-header-text">Tipo de Servicio</div><div class="section-header-line"></div></div>
      ${serviciosHTML}
    </div>
    ${responsabilidad ? `<div class="section-header"><div class="section-header-text">Responsabilidad Profesional</div><div class="section-header-line"></div></div><div class="responsabilidad-box">${responsabilidad.replace(/\n/g,"<br>")}</div>` : ""}
    <div class="spacer"></div>
    <div class="section-header"><div class="section-header-text">Honorarios Profesionales</div><div class="section-header-line"></div></div>
    <div class="honorarios-box">
      <div class="honorarios-left"><div class="honorarios-label">Honorarios Profesionales</div><div class="honorarios-monto">${formatCurrency(honorarios)}</div><div class="honorarios-letras">Pesos ${montoEnLetras} – Precio total de los ${servicios.length} trabajo${servicios.length===1?"":"s"}</div></div>
      <div class="honorarios-right"><div class="condicion-label">Condición de Pago</div>${condicionPago.map(c=>`<div class="condicion-item">${c}</div>`).join("")}</div>
    </div>
    <div style="height:30px;flex-shrink:0"></div>
  </div>
  <div class="footer"><div class="footer-text">${(empresa.nombre || "").toUpperCase()}${empresa.direccion ? " · " + empresa.direccion : ""}${empresa.telefono ? " · Tel.: " + empresa.telefono : ""} ${matriculasFooter} · Validez: ${empresa.validez || 15} días</div></div>
</div></body></html>`;
}

// ─── UI COMPONENTS ────────────────────────────────────────
function BoltIcon({ size = 20, color = COLORS.electric }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function Btn({ children, onClick, variant = "primary", disabled, style = {} }) {
  const base = { display:"inline-flex", alignItems:"center", gap:"6px", padding:"10px 18px", borderRadius:"8px", border:"none", fontFamily:"inherit", fontSize:"13px", fontWeight:"600", cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.5:1, transition:"all 0.2s" };
  const v = { primary:{background:`linear-gradient(135deg,${COLORS.electric},${COLORS.electricLight})`,color:"#fff"}, gold:{background:`linear-gradient(135deg,${COLORS.gold},${COLORS.goldDark})`,color:COLORS.navy}, ghost:{background:"transparent",color:COLORS.electric,border:`1px solid ${COLORS.border}`}, danger:{background:"transparent",color:COLORS.danger,border:`1px solid ${COLORS.danger}33`} };
  return <button style={{...base,...v[variant],...style}} onClick={onClick} disabled={disabled}>{children}</button>;
}
function Field({ label, value, onChange, placeholder, multiline, rows = 3, style = {} }) {
  const s = { width:"100%", background:COLORS.dark, border:`1px solid ${COLORS.border}`, borderRadius:"8px", padding:"10px 14px", color:COLORS.white, fontSize:"14px", fontFamily:"inherit", outline:"none", transition:"border 0.2s", resize:"vertical", lineHeight:"1.6" };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"4px", ...style }}>
      {label && <label style={{ fontSize:"11px", color:COLORS.midGray, textTransform:"uppercase", letterSpacing:"1px", fontWeight:"600" }}>{label}</label>}
      {multiline ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={s} onFocus={e=>e.target.style.borderColor=COLORS.electric} onBlur={e=>e.target.style.borderColor=COLORS.border} />
        : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s} onFocus={e=>e.target.style.borderColor=COLORS.electric} onBlur={e=>e.target.style.borderColor=COLORS.border} />}
    </div>
  );
}
function SectionLabel({ text, color = COLORS.gold }) {
  return (<div style={{ display:"flex", alignItems:"center", gap:"10px", margin:"22px 0 12px" }}>
    <span style={{ fontSize:"10px", textTransform:"uppercase", letterSpacing:"2px", color, fontWeight:"700", whiteSpace:"nowrap" }}>{text}</span>
    <div style={{ flex:1, height:"1px", background:`linear-gradient(90deg,${color}66,transparent)` }} />
  </div>);
}

// Color picker component
function ColorPicker({ label, value, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
      <label style={{ fontSize:"11px", color:COLORS.midGray, textTransform:"uppercase", letterSpacing:"1px", fontWeight:"600" }}>{label}</label>
      <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
        <div style={{ position:"relative", width:"44px", height:"44px", borderRadius:"10px", overflow:"hidden", border:`2px solid ${COLORS.border}`, cursor:"pointer", flexShrink:0 }}>
          <div style={{ width:"100%", height:"100%", background:value }} />
          <input type="color" value={value} onChange={e=>onChange(e.target.value)}
            style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", width:"100%", height:"100%" }} />
        </div>
        <input type="text" value={value} onChange={e=>onChange(e.target.value)}
          style={{ flex:1, background:COLORS.dark, border:`1px solid ${COLORS.border}`, borderRadius:"8px", padding:"10px 14px", color:COLORS.white, fontSize:"13px", fontFamily:"monospace", outline:"none", textTransform:"uppercase" }} />
      </div>
    </div>
  );
}

// ─── CONFIG SCREEN ─────────────────────────────────────────
function ConfigScreen({ empresa, setEmpresa, onSave, onCancel, isFirstTime }) {
  const [local, setLocal] = useState(empresa);
  const canSave = local.nombre.trim().length > 0 && local.titular.trim().length > 0;

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif", background:COLORS.navy, minHeight:"100vh", color:COLORS.white }}>
      <div style={{ background:`linear-gradient(135deg,${COLORS.dark},${COLORS.navy},${COLORS.navyMid})`, padding:"24px", borderBottom:`3px solid ${COLORS.electric}`, textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:"60px", height:"60px", background:`linear-gradient(135deg,${COLORS.gold},${COLORS.goldDark})`, borderRadius:"14px", marginBottom:"14px", boxShadow:`0 6px 24px ${COLORS.gold}55` }}>
          <BoltIcon size={32} color={COLORS.navy} />
        </div>
        <div style={{ fontSize:"22px", fontWeight:"900", letterSpacing:"1px", marginBottom:"6px" }}>{isFirstTime ? "¡BIENVENIDO!" : "CONFIGURACIÓN"}</div>
        <div style={{ fontSize:"13px", color:COLORS.electricLight, maxWidth:"500px", margin:"0 auto", lineHeight:"1.6" }}>
          {isFirstTime
            ? "Antes de empezar, configurá los datos de tu empresa. Solo se cargan una vez y aparecerán automáticamente en todos tus presupuestos."
            : "Modificá los datos de tu empresa. Los cambios se aplicarán a todos los presupuestos que generes a partir de ahora."}
        </div>
      </div>

      <div style={{ padding:"24px", maxWidth:"720px", margin:"0 auto" }}>
        <SectionLabel text="Datos de la Empresa" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          <Field label="Nombre de la empresa *" value={local.nombre} onChange={v=>setLocal({...local,nombre:v})} placeholder="Ej: Soluciones Eléctricas" style={{ gridColumn:"1/-1" }} />
          <Field label="Lema / Subtítulo" value={local.subtitulo} onChange={v=>setLocal({...local,subtitulo:v})} placeholder="Ej: Instalaciones • Certificaciones • Consultoría" style={{ gridColumn:"1/-1" }} />
        </div>

        <SectionLabel text="Datos del Matriculado" color={COLORS.electric} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          <Field label="Nombre del matriculado *" value={local.titular} onChange={v=>setLocal({...local,titular:v})} placeholder="Ej: Juan Pérez" style={{ gridColumn:"1/-1" }} />
          <Field label="Título profesional" value={local.titulo} onChange={v=>setLocal({...local,titulo:v})} placeholder="Ej: Téc. Electromecánico Matriculado" style={{ gridColumn:"1/-1" }} />
          <Field label="Matrícula principal" value={local.matricula1} onChange={v=>setLocal({...local,matricula1:v})} placeholder="Ej: COPIME T000000" />
          <Field label="Matrícula adicional (opcional)" value={local.matricula2} onChange={v=>setLocal({...local,matricula2:v})} placeholder="Ej: COPIME R000000" />
        </div>

        <SectionLabel text="Contacto" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          <Field label="Dirección" value={local.direccion} onChange={v=>setLocal({...local,direccion:v})} placeholder="Ej: Av. Corrientes 1234, Of. 5 – CABA" style={{ gridColumn:"1/-1" }} />
          <Field label="Teléfono" value={local.telefono} onChange={v=>setLocal({...local,telefono:v})} placeholder="Ej: 11 1234-5678" />
          <Field label="Email" value={local.email} onChange={v=>setLocal({...local,email:v})} placeholder="Ej: contacto@empresa.com" />
          <Field label="Validez por defecto (días)" value={String(local.validez)} onChange={v=>setLocal({...local,validez:Number(v)||15})} placeholder="15" />
          <div />
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"30px", paddingTop:"20px", borderTop:`1px solid ${COLORS.border}` }}>
          {!isFirstTime ? (
            <Btn variant="ghost" onClick={onCancel}>← Cancelar</Btn>
          ) : <div style={{ fontSize:"11px", color:COLORS.midGray }}>* Campos obligatorios</div>}
          <Btn variant="gold" disabled={!canSave} onClick={()=>{ setEmpresa(local); onSave(local); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            {isFirstTime ? "Empezar a usar" : "Guardar cambios"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────
function Presupuestador() {
  const [empresa, setEmpresa] = useState(() => {
    try {
      const saved = localStorage.getItem("empresa_config");
      if (saved) return { ...EMPRESA_DEFAULT, ...JSON.parse(saved) };
    } catch (e) {}
    return EMPRESA_DEFAULT;
  });

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("theme_config");
      if (saved) return { ...THEME_DEFAULT, ...JSON.parse(saved) };
    } catch (e) {}
    return THEME_DEFAULT;
  });

  const [showConfig, setShowConfig] = useState(() => {
    try { return !localStorage.getItem("empresa_config"); } catch(e) { return true; }
  });
  const [isFirstTime, setIsFirstTime] = useState(() => {
    try { return !localStorage.getItem("empresa_config"); } catch(e) { return true; }
  });

  const saveEmpresaToStorage = (data) => { try { localStorage.setItem("empresa_config", JSON.stringify(data)); } catch(e) {} };
  const saveThemeToStorage = (data) => { try { localStorage.setItem("theme_config", JSON.stringify(data)); } catch(e) {} };

  const handleSaveConfig = (data) => {
    saveEmpresaToStorage(data);
    setShowConfig(false);
    setIsFirstTime(false);
  };

  const [step, setStep] = useState(0);
  const [cliente, setCliente] = useState("");
  const [direccionObra, setDireccionObra] = useState("");
  const [nroPresupuesto, setNroPresupuesto] = useState(genNro);
  const [tituloPresupuesto, setTituloPresupuesto] = useState("");
  const [objetoServicio, setObjetoServicio] = useState("");
  const [servicios, setServicios] = useState([]);
  const [responsabilidad, setResponsabilidad] = useState("");
  const [honorarios, setHonorarios] = useState("");
  const [condicionPago, setCondicionPago] = useState(["50% Antes de comenzar el trabajo", "50% Contra entrega del trabajo finalizado"]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [newSvcTitulo, setNewSvcTitulo] = useState("");
  const [newSvcItems, setNewSvcItems] = useState("");

  useEffect(() => {
    if (empresa.matricula1 && !responsabilidad) {
      const mats = [empresa.matricula1, empresa.matricula2].filter(Boolean).join(" y ");
      setResponsabilidad(`Todos los trabajos se ejecutan bajo responsabilidad civil y profesional conforme normativa vigente. La certificación y encomiendas se emiten bajo matrículas ${mats}, garantizando el cumplimiento de la reglamentación AEA aplicable. Se deja constancia que cualquier modificación posterior a la instalación certificada invalida los protocolos emitidos.`);
    }
  }, [empresa.matricula1, empresa.matricula2]); // eslint-disable-line

  const updateTheme = (partial) => {
    const newTheme = { ...theme, ...partial };
    setTheme(newTheme);
    saveThemeToStorage(newTheme);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("El logo debe pesar menos de 500 KB. Usá una imagen más liviana.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => updateTheme({ logo: ev.target.result });
    reader.readAsDataURL(file);
  };

  const addServicio = (titulo, items) => setServicios(prev => [...prev, { titulo, items: items.filter(i=>i.trim()) }]);
  const removeServicio = (idx) => setServicios(prev => prev.filter((_,i)=>i!==idx));

  const handleDownload = useCallback(() => {
    const html = generatePDFHTML({ empresa, theme, cliente, direccionObra, nroPresupuesto, tituloPresupuesto, objetoServicio, servicios, responsabilidad, honorarios:Number(honorarios), condicionPago, montoEnLetras:numberToWords(Number(honorarios)) });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Presupuesto_${nroPresupuesto}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [empresa, theme, cliente, direccionObra, nroPresupuesto, tituloPresupuesto, objetoServicio, servicios, responsabilidad, honorarios, condicionPago]);

  const stepTitles = ["Datos Generales", "Servicios", "Honorarios", "Personalización", "Vista Previa"];
  const canNext = () => { if(step===0) return tituloPresupuesto.trim().length>0; if(step===1) return servicios.length>0; if(step===2) return Number(honorarios)>0; return true; };

  if (showConfig) {
    return <ConfigScreen empresa={empresa} setEmpresa={setEmpresa} onSave={handleSaveConfig} onCancel={()=>setShowConfig(false)} isFirstTime={isFirstTime} />;
  }

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif", background:COLORS.navy, minHeight:"100vh", color:COLORS.white }}>
      {/* HEADER */}
      <div style={{ background:`linear-gradient(135deg,${COLORS.dark},${COLORS.navy},${COLORS.navyMid})`, padding:"16px 18px", borderBottom:`3px solid ${COLORS.electric}` }}>
        {/* Top row: logo + title + config button */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", minWidth:0, flex:1 }}>
            <div style={{ width:"42px", height:"42px", background:`linear-gradient(135deg,${COLORS.gold},${COLORS.goldDark})`, borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 16px ${COLORS.gold}44`, flexShrink:0 }}>
              <BoltIcon size={22} color={COLORS.navy} />
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:"15px", fontWeight:"800", letterSpacing:"1px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>PRESUPUESTADOR</div>
              <div style={{ fontSize:"10px", color:COLORS.electricLight, letterSpacing:"0.5px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{empresa.nombre || "Configurá tu empresa"}</div>
            </div>
          </div>
          <button onClick={()=>setShowConfig(true)} aria-label="Configuración" style={{ background:"transparent", border:`1px solid ${COLORS.border}`, color:COLORS.electricLight, width:"38px", height:"38px", borderRadius:"10px", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>

        {/* Second row: N° Presupuesto badge */}
        <div style={{ marginTop:"12px", display:"flex", justifyContent:"center" }}>
          <div style={{ background:`${COLORS.gold}15`, border:`1px solid ${COLORS.gold}33`, borderRadius:"8px", padding:"6px 16px", display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ fontSize:"10px", color:COLORS.gold, letterSpacing:"1px", fontWeight:"600", textTransform:"uppercase" }}>N° Presupuesto</span>
            <span style={{ fontSize:"14px", fontWeight:"700", color:COLORS.gold }}>{nroPresupuesto}</span>
          </div>
        </div>
      </div>

      {/* STEPS */}
      <div style={{ display:"flex", background:COLORS.dark, overflowX:"auto" }}>
        {stepTitles.map((t, i) => (
          <div key={i} onClick={()=>{if(i<=step||canNext())setStep(i);}} style={{ flex:"1 1 0", minWidth:"80px", padding:"12px 6px", textAlign:"center", fontSize:"10px", fontWeight:"600", cursor:"pointer", transition:"all 0.2s", color:i===step?COLORS.gold:i<step?COLORS.electric:COLORS.midGray, borderBottom:i===step?`3px solid ${COLORS.gold}`:i<step?`3px solid ${COLORS.electric}33`:"3px solid transparent", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"4px", lineHeight:"1.2" }}>
            <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:"22px", height:"22px", borderRadius:"50%", fontSize:"11px", background:i===step?COLORS.gold:i<step?COLORS.electric:COLORS.border, color:i<=step?COLORS.navy:COLORS.midGray, fontWeight:"700" }}>{i<step?"✓":i+1}</span>
            <span>{t}</span>
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ padding:"20px 24px", maxHeight:"calc(100vh - 160px)", overflowY:"auto" }}>

        {step === 0 && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <SectionLabel text="Identificación del Presupuesto" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <Field label="Título del Presupuesto *" value={tituloPresupuesto} onChange={setTituloPresupuesto} placeholder="Ej: Instalación eléctrica comercial y certificación" style={{ gridColumn:"1/-1" }} />
              <Field label="N° Presupuesto" value={nroPresupuesto} onChange={setNroPresupuesto} placeholder="2026-0401" />
              <div />
            </div>
            <SectionLabel text="Datos del Cliente" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <Field label="Cliente / Empresa" value={cliente} onChange={setCliente} placeholder="A quien corresponda" style={{ gridColumn:"1/-1" }} />
              <Field label="Dirección de la Obra" value={direccionObra} onChange={setDireccionObra} placeholder="Ej: Calle Falsa 123 – CABA" style={{ gridColumn:"1/-1" }} />
            </div>
            <SectionLabel text="Objetivo del Servicio" color={COLORS.electric} />
            <Field multiline rows={4} value={objetoServicio} onChange={setObjetoServicio} placeholder="Describí brevemente el trabajo. Ej: Se realizarán los trabajos técnicos necesarios para la instalación eléctrica del inmueble, incluyendo tablero seccional, puesta a tierra y certificación correspondiente." />
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"20px" }}>
              <Btn onClick={()=>setStep(1)} disabled={!canNext()}>Siguiente →</Btn>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ display:"flex", gap:"10px", marginBottom:"14px" }}>
              <Btn variant={showCatalog?"primary":"ghost"} onClick={()=>setShowCatalog(!showCatalog)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                {showCatalog?"Cerrar catálogo":"Catálogo rápido"}
              </Btn>
            </div>
            {showCatalog && (
              <div style={{ background:COLORS.dark, border:`1px solid ${COLORS.border}`, borderRadius:"12px", padding:"14px", marginBottom:"16px", maxHeight:"280px", overflowY:"auto" }}>
                {SERVICIOS_CATALOGO.map(cat=>(
                  <div key={cat.cat} style={{ marginBottom:"10px" }}>
                    <div style={{ fontSize:"10px", fontWeight:"700", color:COLORS.electric, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"5px" }}>{cat.cat}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                      {cat.items.map(item=>(
                        <button key={item} onClick={()=>{addServicio(item,[item]);setShowCatalog(false);}} style={{ background:COLORS.navyMid, border:`1px solid ${COLORS.border}`, borderRadius:"6px", padding:"5px 10px", color:COLORS.white, fontSize:"11px", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}
                          onMouseEnter={e=>e.target.style.borderColor=COLORS.electric} onMouseLeave={e=>e.target.style.borderColor=COLORS.border}>
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ background:COLORS.dark, border:`1px solid ${COLORS.border}`, borderRadius:"12px", padding:"14px", marginBottom:"16px" }}>
              <div style={{ fontSize:"10px", fontWeight:"700", color:COLORS.gold, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"10px" }}>Agregar Servicio</div>
              <Field label="Título del servicio" value={newSvcTitulo} onChange={setNewSvcTitulo} placeholder="Ej: Instalación de tablero eléctrico" />
              <div style={{ marginTop:"10px" }}>
                <Field label="Ítems / tareas (una por línea)" multiline rows={4} value={newSvcItems} onChange={setNewSvcItems}
                  placeholder={"Medición de la jabalina del TSG.\nVerificación de continuidad de masas.\nElaboración del Protocolo conforme Res. SRT 900/15."} />
              </div>
              <div style={{ marginTop:"10px", display:"flex", justifyContent:"flex-end" }}>
                <Btn variant="gold" onClick={()=>{if(newSvcTitulo.trim()){addServicio(newSvcTitulo,newSvcItems.split("\n").filter(l=>l.trim()));setNewSvcTitulo("");setNewSvcItems("");}}}>+ Agregar servicio</Btn>
              </div>
            </div>
            {servicios.length > 0 && (
              <div>
                <SectionLabel text={`Servicios agregados (${servicios.length})`} color={COLORS.electric} />
                {servicios.map((s,idx)=>(
                  <div key={idx} style={{ background:COLORS.dark, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"14px", marginBottom:"10px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                      <div style={{ background:`linear-gradient(135deg,${COLORS.electric},${COLORS.electricLight})`, color:"#fff", fontSize:"12px", fontWeight:"800", width:"30px", height:"30px", borderRadius:"7px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{String(idx+1).padStart(2,"0")}</div>
                      <div style={{ fontSize:"14px", fontWeight:"600", flex:1 }}>{s.titulo}</div>
                      <button onClick={()=>removeServicio(idx)} style={{ background:"transparent", border:"none", color:COLORS.danger, cursor:"pointer", fontSize:"18px", fontFamily:"inherit", padding:"4px 8px" }}>×</button>
                    </div>
                    <div style={{ marginLeft:"40px" }}>
                      {s.items.map((item,ii)=>(
                        <div key={ii} style={{ display:"flex", gap:"6px", alignItems:"flex-start", marginBottom:"3px" }}>
                          <span style={{ color:COLORS.electric, fontSize:"10px", marginTop:"3px" }}>■</span>
                          <span style={{ fontSize:"12px", color:COLORS.textLight }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {servicios.length === 0 && (
              <div style={{ textAlign:"center", padding:"36px", color:COLORS.midGray }}>
                <BoltIcon size={30} color={COLORS.border} /><div style={{ marginTop:"8px", fontSize:"13px" }}>Agregá servicios desde el catálogo o manualmente</div>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:"20px" }}>
              <Btn variant="ghost" onClick={()=>setStep(0)}>← Atrás</Btn>
              <Btn onClick={()=>setStep(2)} disabled={!canNext()}>Siguiente →</Btn>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <SectionLabel text="Honorarios Profesionales" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
              <div>
                <Field label="Monto total ($) *" value={honorarios} onChange={setHonorarios} placeholder="Ej: 4800000" />
                {honorarios && Number(honorarios)>0 && <div style={{ marginTop:"6px", fontSize:"12px", color:COLORS.gold, fontStyle:"italic" }}>Pesos {numberToWords(Number(honorarios))}</div>}
              </div>
              <div>
                <label style={{ fontSize:"11px", color:COLORS.midGray, textTransform:"uppercase", letterSpacing:"1px", fontWeight:"600", display:"block", marginBottom:"4px" }}>Condición de Pago</label>
                {condicionPago.map((c,i)=>(
                  <div key={i} style={{ display:"flex", gap:"6px", marginBottom:"6px", alignItems:"center" }}>
                    <input value={c} onChange={e=>{const cp=[...condicionPago];cp[i]=e.target.value;setCondicionPago(cp);}} style={{ flex:1, background:COLORS.dark, border:`1px solid ${COLORS.border}`, borderRadius:"6px", padding:"8px 12px", color:COLORS.white, fontSize:"13px", fontFamily:"inherit", outline:"none" }} />
                    {condicionPago.length>1 && <button onClick={()=>setCondicionPago(prev=>prev.filter((_,ii)=>ii!==i))} style={{ background:"transparent", border:"none", color:COLORS.danger, cursor:"pointer", fontSize:"16px" }}>×</button>}
                  </div>
                ))}
                <button onClick={()=>setCondicionPago(prev=>[...prev,""])} style={{ background:"transparent", border:`1px dashed ${COLORS.border}`, borderRadius:"6px", padding:"6px 12px", color:COLORS.midGray, fontSize:"12px", cursor:"pointer", fontFamily:"inherit", width:"100%" }}>+ Agregar condición</button>
              </div>
            </div>
            <SectionLabel text="Responsabilidad Profesional" color={COLORS.electric} />
            <Field multiline rows={4} value={responsabilidad} onChange={setResponsabilidad} />
            <SectionLabel text="Resumen" />
            <div style={{ background:`linear-gradient(135deg,${COLORS.dark},${COLORS.navyMid})`, border:`1px solid ${COLORS.border}`, borderRadius:"12px", padding:"18px" }}>
              {[["Cliente",cliente||"A quien corresponda"],["Obra",direccionObra||"—"],["Título",tituloPresupuesto],["Servicios",`${servicios.length} servicio(s)`]].map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", fontSize:"13px" }}>
                  <span style={{ color:COLORS.midGray }}>{l}</span><span style={{ fontWeight:"500" }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 0", marginTop:"8px", borderTop:`2px solid ${COLORS.electric}`, fontSize:"20px", fontWeight:"800" }}>
                <span>HONORARIOS</span><span style={{ color:COLORS.gold }}>{formatCurrency(Number(honorarios)||0)}</span>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:"20px" }}>
              <Btn variant="ghost" onClick={()=>setStep(1)}>← Atrás</Btn>
              <Btn onClick={()=>setStep(3)} disabled={!canNext()}>Siguiente →</Btn>
            </div>
          </div>
        )}

        {/* ─── STEP 3: PERSONALIZACIÓN ─── */}
        {step === 3 && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ background:`linear-gradient(135deg,${COLORS.dark},${COLORS.navyMid})`, border:`1px solid ${COLORS.gold}44`, borderRadius:"12px", padding:"16px", marginBottom:"18px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.gold} strokeWidth="2"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="13" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="10" cy="19" r="2.5"/><path d="M12 2v20"/></svg>
                <div style={{ fontSize:"14px", fontWeight:"700", color:COLORS.gold }}>Personalización del presupuesto</div>
              </div>
              <div style={{ fontSize:"12px", color:COLORS.textLight, lineHeight:"1.6" }}>
                Elegí los colores y subí el logo de tu empresa. Estos ajustes se guardan automáticamente y se aplican a todos tus presupuestos futuros.
              </div>
            </div>

            {/* LOGO */}
            <SectionLabel text="Logo de la Empresa" color={COLORS.electric} />
            <div style={{ background:COLORS.dark, border:`1px solid ${COLORS.border}`, borderRadius:"12px", padding:"18px", marginBottom:"16px", display:"flex", gap:"18px", alignItems:"center" }}>
              <div style={{ width:"90px", height:"90px", borderRadius:"12px", background:theme.logo ? "#fff" : COLORS.navyMid, border:`2px dashed ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:"6px", flexShrink:0 }}>
                {theme.logo
                  ? <img src={theme.logo} alt="Logo" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }} />
                  : <BoltIcon size={32} color={COLORS.border} />}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"13px", fontWeight:"600", marginBottom:"4px" }}>
                  {theme.logo ? "Logo actual" : "Sin logo cargado"}
                </div>
                <div style={{ fontSize:"11px", color:COLORS.midGray, marginBottom:"10px", lineHeight:"1.5" }}>
                  Recomendado: imagen PNG cuadrada, fondo transparente, máximo 500 KB. Si no cargás un logo, se usa el ícono de rayo por defecto.
                </div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <label style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"8px 14px", borderRadius:"8px", background:`linear-gradient(135deg,${COLORS.electric},${COLORS.electricLight})`, color:"#fff", fontSize:"12px", fontWeight:"600", cursor:"pointer" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    {theme.logo ? "Cambiar logo" : "Subir logo"}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display:"none" }} />
                  </label>
                  {theme.logo && (
                    <button onClick={()=>updateTheme({ logo: null })} style={{ padding:"8px 14px", borderRadius:"8px", background:"transparent", border:`1px solid ${COLORS.danger}55`, color:COLORS.danger, fontSize:"12px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit" }}>
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* PRESETS */}
            <SectionLabel text="Paletas predefinidas" />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"10px", marginBottom:"16px" }}>
              {PRESETS.map((preset) => {
                const isActive = theme.fondo.toLowerCase() === preset.fondo.toLowerCase() && theme.acento.toLowerCase() === preset.acento.toLowerCase();
                return (
                  <button key={preset.name} onClick={()=>updateTheme(preset)}
                    style={{ background:COLORS.dark, border:`2px solid ${isActive ? COLORS.gold : COLORS.border}`, borderRadius:"10px", padding:"10px", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.2s" }}>
                    <div style={{ display:"flex", gap:"4px", marginBottom:"8px" }}>
                      <div style={{ flex:1, height:"28px", background:preset.fondo, borderRadius:"4px" }} />
                      <div style={{ flex:1, height:"28px", background:preset.acento, borderRadius:"4px" }} />
                      <div style={{ flex:1, height:"28px", background:preset.dorado, borderRadius:"4px" }} />
                    </div>
                    <div style={{ fontSize:"11px", fontWeight:"600", color:isActive ? COLORS.gold : COLORS.white }}>{preset.name}</div>
                  </button>
                );
              })}
            </div>

            {/* CUSTOM COLORS */}
            <SectionLabel text="Colores personalizados" color={COLORS.electric} />
            <div style={{ background:COLORS.dark, border:`1px solid ${COLORS.border}`, borderRadius:"12px", padding:"16px", marginBottom:"16px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                <ColorPicker label="Color de fondo" value={theme.fondo} onChange={v=>updateTheme({ fondo: v })} />
                <ColorPicker label="Fondo oscuro (secundario)" value={theme.fondoOscuro} onChange={v=>updateTheme({ fondoOscuro: v })} />
                <ColorPicker label="Color de acento" value={theme.acento} onChange={v=>updateTheme({ acento: v })} />
                <ColorPicker label="Acento claro" value={theme.acentoClaro} onChange={v=>updateTheme({ acentoClaro: v })} />
                <ColorPicker label="Color dorado (destacados)" value={theme.dorado} onChange={v=>updateTheme({ dorado: v })} />
                <ColorPicker label="Dorado oscuro" value={theme.doradoOscuro} onChange={v=>updateTheme({ doradoOscuro: v })} />
              </div>
              <div style={{ marginTop:"14px", paddingTop:"14px", borderTop:`1px solid ${COLORS.border}`, display:"flex", justifyContent:"flex-end" }}>
                <button onClick={()=>{ setTheme(THEME_DEFAULT); saveThemeToStorage(THEME_DEFAULT); }}
                  style={{ background:"transparent", border:`1px solid ${COLORS.border}`, color:COLORS.midGray, fontSize:"11px", padding:"6px 12px", borderRadius:"6px", cursor:"pointer", fontFamily:"inherit" }}>
                  Restablecer paleta original
                </button>
              </div>
            </div>

            {/* MINI PREVIEW */}
            <SectionLabel text="Vista previa rápida" />
            <div style={{ background:"#fff", borderRadius:"12px", overflow:"hidden", marginBottom:"16px", boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }}>
              <iframe srcDoc={generatePDFHTML({ empresa, theme, cliente, direccionObra, nroPresupuesto, tituloPresupuesto, objetoServicio, servicios, responsabilidad, honorarios:Number(honorarios), condicionPago, montoEnLetras:numberToWords(Number(honorarios)) })}
                style={{ width:"100%", height:"400px", border:"none" }} title="MiniPreview" />
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", marginTop:"20px" }}>
              <Btn variant="ghost" onClick={()=>setStep(2)}>← Atrás</Btn>
              <div style={{ display:"flex", gap:"10px" }}>
                <Btn onClick={()=>setStep(4)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Vista Previa Completa
                </Btn>
                <Btn variant="gold" onClick={handleDownload}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Descargar Presupuesto
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 4: VISTA PREVIA ─── */}
        {step === 4 && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ background:"#fff", borderRadius:"12px", overflow:"hidden", boxShadow:`0 8px 40px rgba(0,0,0,0.4)` }}>
              <iframe srcDoc={generatePDFHTML({ empresa, theme, cliente, direccionObra, nroPresupuesto, tituloPresupuesto, objetoServicio, servicios, responsabilidad, honorarios:Number(honorarios), condicionPago, montoEnLetras:numberToWords(Number(honorarios)) })}
                style={{ width:"100%", height:"70vh", border:"none" }} title="Preview" />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:"20px" }}>
              <Btn variant="ghost" onClick={()=>setStep(3)}>← Editar diseño</Btn>
              <div style={{ display:"flex", gap:"10px" }}>
                <Btn onClick={()=>{setCliente("");setDireccionObra("");setTituloPresupuesto("");setObjetoServicio("");setServicios([]);setHonorarios("");setNroPresupuesto(genNro());setCondicionPago(["50% Antes de comenzar el trabajo","50% Contra entrega del trabajo finalizado"]);setStep(0);}}>+ Nuevo Presupuesto</Btn>
                <Btn variant="gold" onClick={handleDownload}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Descargar Presupuesto
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:${COLORS.dark}}
        ::-webkit-scrollbar-thumb{background:${COLORS.border};border-radius:3px}::-webkit-scrollbar-thumb:hover{background:${COLORS.electric}}
      `}</style>
    </div>
  );
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Presupuestador />
  </React.StrictMode>
);
