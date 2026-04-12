"use client";

import { useRef, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

import type { BookingWizardData } from "./wizard/BookingWizard";

/* ─── Types — match BookingForm output exactly ────────────────────────────── */
type TicketData = BookingWizardData & {
  ref_code: string;
};

const meetingLabels: Record<TicketData["type"], string> = {
  phone:   "📞 PHONE CALL",
  onsite:  "📍 ON-SITE VISIT",
  zoom:    "🎥 ZOOM MEETING",
};

const NAVY = "#00203c";
const GOLD = "#e8c35e";
const FONT = "'Courier New', Courier, monospace";
const DOTS = Array.from({ length: 13 });

/* ─── TicketRender ────────────────────────────────────────────────────────── */
function TicketRender({ data }: { data: TicketData }) {
  const day   = data.date.toLocaleDateString("en-GB", { day: "2-digit" });
  const month = data.date.toLocaleDateString("en-GB", { month: "long" });
  const year  = data.date.toLocaleDateString("en-GB", { year: "numeric" });
  const session = meetingLabels[data.type] ?? data.type.toUpperCase();

  return (
    <div style={{
      position: "relative", width: "660px", height: "300px",
      backgroundColor: GOLD, display: "flex",
      fontFamily: FONT, color: NAVY, boxSizing: "border-box",
    }}>
      {/* Corner cutouts */}
      {[["top","-8px","left","-8px"],["bottom","-8px","left","-8px"],["top","-8px","right","-8px"],["bottom","-8px","right","-8px"]].map(([v,vo,h,ho], i) => (
        <div key={i} style={{ position:"absolute", [v]:vo, [h]:ho, width:"44px", height:"44px", borderRadius:"50%", backgroundColor: NAVY, zIndex:20 }} />
      ))}

      {/* Left punch-hole strip */}
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"5px", display:"flex", flexDirection:"column", justifyContent:"space-around", alignItems:"center", zIndex:10 }}>
        {DOTS.map((_, i) => <div key={i} style={{ width:"14px", height:"14px", borderRadius:"50%", backgroundColor: NAVY, flexShrink:0 }} />)}
      </div>

      {/* Right punch-hole strip */}
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"5px", display:"flex", flexDirection:"column", justifyContent:"space-around", alignItems:"center", zIndex:10 }}>
        {DOTS.map((_, i) => <div key={i} style={{ width:"14px", height:"14px", borderRadius:"50%", backgroundColor: NAVY, flexShrink:0 }} />)}
      </div>

      {/* ── LEFT MAIN SECTION ─────────────────────────────────────────────── */}
      <div style={{ flex:1, padding:"22px 26px 20px 40px", display:"flex", flexDirection:"column", justifyContent:"space-between", minWidth:0 }}>
        {/* Agency + Title */}
        <div>
          <p style={{ margin:"0 0 2px", fontSize:"10px", letterSpacing:"4px", opacity:0.65, textTransform:"uppercase", fontWeight:700 }}>BT-ADV</p>
          <h1 style={{ margin:"0 0 6px", fontSize:"34px", fontWeight:900, letterSpacing:"6px", textTransform:"uppercase", lineHeight:1 }}>SPACE TICKET</h1>
          <p style={{ margin:0, fontSize:"10px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", opacity:0.75 }}>
            {data.address ?? ""}
          </p>
        </div>

        {/* Date / Time / Session / Budget row */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:0, marginTop:"8px" }}>
          {/* Date */}
          <div style={{ marginRight:"14px" }}>
            <p style={{ margin:"0 0 2px", fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", opacity:0.55, fontWeight:700 }}>DATE</p>
            <p style={{ margin:0, fontSize:"36px", fontWeight:900, lineHeight:1 }}>{day}</p>
            <p style={{ margin:"2px 0 0", fontSize:"10px", fontWeight:800, textTransform:"uppercase", letterSpacing:"2px" }}>{month} {year}</p>
          </div>

          <div style={{ width:"2px", height:"52px", borderLeft:"2px dashed rgba(0,32,60,0.4)", marginRight:"14px", marginTop:"20px" }} />

          {/* Time — now from time_slot not date.getTime() */}
          <div style={{ marginRight:"14px" }}>
            <p style={{ margin:"0 0 2px", fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", opacity:0.55, fontWeight:700 }}>TIME</p>
            <p style={{ margin:0, fontSize:"36px", fontWeight:900, lineHeight:1, letterSpacing:"2px" }}>{data.time_slot}</p>
          </div>

          <div style={{ width:"2px", height:"52px", borderLeft:"2px dashed rgba(0,32,60,0.4)", marginRight:"14px", marginTop:"20px" }} />

          {/* Session */}
          <div style={{ marginRight:"14px" }}>
            <p style={{ margin:"0 0 2px", fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", opacity:0.55, fontWeight:700 }}>SESSION</p>
            <p style={{ margin:0, fontSize:"13px", fontWeight:800, textTransform:"uppercase", lineHeight:1.4, maxWidth:"110px" }}>{session}</p>
          </div>

          <div style={{ width:"2px", height:"52px", borderLeft:"2px dashed rgba(0,32,60,0.4)", marginRight:"14px", marginTop:"20px" }} />

          {/* Budget — renamed from budget → estimated_budget */}
          <div>
            <p style={{ margin:"0 0 2px", fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", opacity:0.55, fontWeight:700 }}>BUDGET</p>
            <p style={{ margin:0, fontSize:"18px", fontWeight:900, textTransform:"uppercase", lineHeight:1.4 }}>{data.estimated_budget}</p>
          </div>
        </div>

        <div style={{ height:"1px", backgroundColor: NAVY, opacity:0.2, margin:"4px 0" }} />

        {/* Passenger — renamed from fullName → name */}
        <div>
          <p style={{ margin:"0 0 3px", fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", opacity:0.55, fontWeight:700 }}>PASSENGER</p>
          <p style={{ margin:0, fontSize:"20px", fontWeight:900, textTransform:"uppercase", letterSpacing:"3px" }}>{data.name}</p>
        </div>
      </div>

      {/* ── PERFORATION LINE ──────────────────────────────────────────────── */}
      <div style={{ width:"3px", flexShrink:0, height:"100%", borderLeft:"3px dashed rgba(0,32,60,0.45)", position:"relative", zIndex:10 }}>
        <div style={{ position:"absolute", top:"-2px",   left:"-22px", width:"44px", height:"44px", borderRadius:"50%", backgroundColor: NAVY }} />
        <div style={{ position:"absolute", bottom:"-2px", left:"-22px", width:"44px", height:"44px", borderRadius:"50%", backgroundColor: NAVY }} />
      </div>

      {/* ── RIGHT STUB ─────────────────────────────────────────────────────── */}
      <div style={{ width:"146px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", padding:"12px", position:"relative", zIndex:0 }}>
        <div style={{ transform:"rotate(-90deg)", whiteSpace:"nowrap", display:"flex", flexDirection:"column", alignItems:"center", gap:"5px", width:"240px" }}>
          {/* ref_code in stub instead of hardcoded number */}
          <span style={{ fontSize:"11px", letterSpacing:"2px", opacity:0.5, fontWeight:700 }}>{data.ref_code}</span>
          <span style={{ fontSize:"22px", fontWeight:900, letterSpacing:"4px", textTransform:"uppercase" }}>BT-ADV</span>
          <span style={{ fontSize:"11px", letterSpacing:"3px", opacity:0.5, fontWeight:700 }}>
            {data.date.toLocaleDateString("en-GB")}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Export ─────────────────────────────────────────────────────────── */
export default function CinemaTicket({
  ticketData,
  onClose,
}: {
  ticketData: TicketData;
  onClose: () => void;
}) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const downloadTicket = async () => {
    if (!captureRef.current || saving) return;
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: NAVY,
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const link    = document.createElement("a");
      link.href     = canvas.toDataURL("image/png");
      link.download = `BT-Ticket-${ticketData.name.replace(/\s+/g, "-")}-${ticketData.ref_code}.png`;
      link.click();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Ticket download failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Ref code display */}
      <p className="text-yellow/60 text-xs font-mono tracking-widest uppercase">
        Booking Reference: <span className="text-yellow font-bold">{ticketData.ref_code}</span>
      </p>

      {/* Scaled ticket */}
      <div className="w-full flex justify-center mt-4 mb-2 overflow-visible" style={{ height: "clamp(150px, 24vw, 320px)" }}>
        <div style={{ transform:"scale(var(--ts))", transformOrigin:"top center" }} className="[--ts:0.43] sm:[--ts:0.68] md:[--ts:1]">
          <div ref={captureRef} style={{ backgroundColor: NAVY, padding:"28px 32px", display:"inline-block", lineHeight:1 }}>
            <TicketRender data={ticketData} />
          </div>
        </div>
      </div>

      {/* Countdown to booking date */}
      <CountdownTimer targetDate={ticketData.date} />

      {/* Buttons */}
      <div className="flex items-center gap-3 w-full justify-center flex-wrap mt-1">
        <button
          onClick={downloadTicket}
          disabled={saving}
          className={`flex items-center gap-2 text-xs font-bold px-7 py-3 rounded-md uppercase tracking-widest border transition-all duration-300
            ${saved
              ? "bg-green-500/20 border-green-400/50 text-green-400"
              : "bg-yellow text-navy border-yellow hover:shadow-[0_0_24px_rgba(255,238,52,0.6)] hover:scale-105"
            } disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100`}
        >
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
          : saved  ? <>✓ Saved!</>
          :           <><Download size={15} /> Save Ticket</>}
        </button>

        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white px-7 py-3 rounded-md border border-white/10 hover:border-white/40 transition-all duration-300 uppercase tracking-widest"
        >
          <X size={15} /> Book Another Slot
        </button>
      </div>
    </div>
  );
}
