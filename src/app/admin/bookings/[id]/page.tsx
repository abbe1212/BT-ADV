import { getBookingById } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, DollarSign, Mail, MapPin, Phone, User, Briefcase, Target, Monitor, FileText, CheckCircle, XCircle, Building2, Clapperboard, Rocket, CalendarCheck } from "lucide-react";
import { BookingStatusBadge } from "@/components/admin/bookings/BookingStatusBadge";

export const dynamic = 'force-dynamic';

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const booking = await getBookingById(resolvedParams.id);

  if (!booking) {
    notFound();
  }

  const typeLabel = booking.type === 'phone' ? 'Phone Call' : booking.type === 'onsite' ? 'On-Site' : 'Zoom';
  const platformsText = booking.platforms?.length ? booking.platforms.join(', ') : 'None specified';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0A1F33] p-6 rounded-2xl border border-[#14304A]">
        <div className="flex items-center gap-4">
          <Link href="/admin/bookings" className="w-10 h-10 rounded-xl bg-[#14304A] flex items-center justify-center text-white/50 hover:text-white transition-colors hover:bg-[#1a3d5c]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="text-xs text-white/50 mb-1 flex items-center gap-2">
              <Link href="/admin/bookings" className="hover:text-white transition-colors">Bookings</Link>
              <span>/</span>
              <span className="text-white/80 font-mono">{booking.ref_code}</span>
            </div>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Booking Details</h2>
              <BookingStatusBadge status={booking.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Client & Meeting Info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Client Details */}
          <div className="bg-[#0A1F33] rounded-xl border border-[#14304A] overflow-hidden">
            <div className="bg-[#061520] px-5 py-3 border-b border-[#14304A]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#FFEE34]" />
                Client Contact
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-white/40 uppercase tracking-widest">Full Name</p>
                <p className="text-white font-medium">{booking.name}</p>
              </div>
              {booking.company_name && (
                <div className="space-y-1">
                  <p className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-1.5"><Building2 className="w-3 h-3"/> Company</p>
                  <p className="text-white font-medium">{booking.company_name}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-1.5"><Phone className="w-3 h-3"/> Phone Number</p>
                <p className="text-white font-medium">{booking.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-1.5"><Mail className="w-3 h-3"/> Email Address</p>
                <p className="text-white font-medium">{booking.email}</p>
              </div>
              {booking.address && (
                <div className="space-y-1">
                  <p className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3 h-3"/> Address</p>
                  <p className="text-white font-medium">{booking.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Meeting Details */}
          <div className="bg-[#0A1F33] rounded-xl border border-[#14304A] overflow-hidden">
            <div className="bg-[#061520] px-5 py-3 border-b border-[#14304A]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FFEE34]" />
                Meeting Details
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3"/> Preferred Time</p>
                <p className="text-[#FFEE34] font-bold">{booking.time_slot || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-1.5"><Phone className="w-3 h-3"/> Meeting Type</p>
                <p className="text-white font-medium">{typeLabel}</p>
              </div>
              {booking.planning_start && (
                <div className="space-y-1">
                  <p className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-1.5"><CalendarCheck className="w-3 h-3"/> Planning to Start</p>
                  <p className="text-white font-medium">{booking.planning_start}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-white/40 uppercase tracking-widest flex items-center gap-1.5"><DollarSign className="w-3 h-3"/> Estimated Budget</p>
                <p className="text-white font-medium">
                  {(() => {
                    const n = Number(booking.estimated_budget);
                    if (!booking.estimated_budget || isNaN(n)) return 'Not specified';
                    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
                    if (n >= 1_000)     return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
                    return String(n);
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Company Brief, Project Details & Notes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Company Brief Box */}
          <div className="bg-[#0A1F33] rounded-xl border border-[#14304A] overflow-hidden">
            <div className="bg-[#061520] px-5 py-3 border-b border-[#14304A]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#FFEE34]" />
                Company &amp; Project Brief
              </h3>
            </div>
            
            <div className="p-6 space-y-8">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Industry</p>
                  <p className="text-white font-bold">{booking.industry || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1"><Target className="w-3 h-3"/> Audience</p>
                  <p className="text-white font-bold">{booking.target_audience || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1">
                    {booking.has_brand_guide ? <CheckCircle className="w-3 h-3 text-emerald-400"/> : <XCircle className="w-3 h-3 text-red-400"/>}
                    Brand Guide
                  </p>
                  <p className="text-white font-bold">{booking.has_brand_guide ? 'Yes, available' : 'No brand guide'}</p>
                </div>
                <div>
                   <p className="text-xs text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1">
                    {booking.previous_ads ? <CheckCircle className="w-3 h-3 text-emerald-400"/> : <XCircle className="w-3 h-3 text-white/20"/>}
                    Prev Ads
                  </p>
                  <p className="text-white font-bold">{booking.previous_ads ? 'Has run ads' : 'First time'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Monitor className="w-3 h-3"/> Target Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {booking.platforms?.length ? (
                    booking.platforms.map(p => (
                      <span key={p} className="bg-[#14304A] border border-[#1c4060] text-white/90 px-3 py-1 rounded-md text-sm">
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/40 text-sm italic">None specified</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5"><FileText className="w-3 h-3"/> Company Brief</p>
                {booking.company_brief ? (
                  <div className="bg-[#061520] p-4 rounded-lg border border-[#14304A]">
                    <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{booking.company_brief}</p>
                  </div>
                ) : (
                  <p className="text-white/40 text-sm italic">No brief provided.</p>
                )}
              </div>

            </div>
          </div>

          {/* Project Details Box */}
          <div className="bg-[#0A1F33] rounded-xl border border-[#14304A] overflow-hidden">
            <div className="bg-[#061520] px-5 py-3 border-b border-[#14304A]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-[#FFEE34]" />
                Project Details
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1"><Clapperboard className="w-3 h-3"/> Project Type</p>
                  <p className="text-white font-bold">
                    {booking.project_type || '—'}
                    {booking.project_type === 'Other' && booking.project_type_other && (
                      <span className="block text-sm text-white/60 font-normal mt-0.5">↳ {booking.project_type_other}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1"><Rocket className="w-3 h-3"/> Main Goal</p>
                  <p className="text-white font-bold">
                    {booking.project_goal || '—'}
                    {booking.project_goal === 'Other' && booking.project_goal_other && (
                      <span className="block text-sm text-white/60 font-normal mt-0.5">↳ {booking.project_goal_other}</span>
                    )}
                  </p>
                </div>
              </div>
              {booking.notes && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widests mb-2 flex items-center gap-1.5"><FileText className="w-3 h-3"/> Additional Notes</p>
                  <div className="bg-[#061520] p-4 rounded-lg border border-[#14304A]">
                    <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{booking.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
