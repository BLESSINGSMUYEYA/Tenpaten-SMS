import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-surface text-on-background min-h-screen flex flex-col font-sans transition-colors duration-300">

      {/* ─── TopNavBar ─── */}
      <header className="w-full top-0 sticky z-50 border-b border-outline-variant bg-surface/90 backdrop-blur-md">
        <div className="flex justify-between items-center px-margin-desktop h-16 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-md">
            <Logo height="60px" />
          </div>
          <nav className="hidden md:flex gap-lg">
            {['Features', 'About', 'Contact'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-md">
            <Link
              to="/login"
              className="hidden md:block font-body-md text-body-md font-bold text-primary hover:opacity-70 transition-opacity"
            >
              Login
            </Link>
            <button className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm">
              Request Demo
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">

        {/* ─── Hero Section ─── */}
        <section className="relative bg-surface-container-low py-20 lg:py-36 px-margin-desktop overflow-hidden">

          {/* Ambient glow blobs */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.18]"
              style={{ background: 'radial-gradient(circle, var(--md-sys-color-primary, #6750A4) 0%, transparent 70%)' }}
            />
            <div
              className="absolute -bottom-32 right-0 w-[480px] h-[480px] rounded-full opacity-[0.13]"
              style={{ background: 'radial-gradient(circle, var(--md-sys-color-secondary, #625B71) 0%, transparent 70%)' }}
            />
          </div>

          {/* Dot-grid overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center relative z-10">

            {/* ── Copy column — staggered entrance ── */}
            <div className="flex flex-col gap-lg">

              {/* Pill badge */}
              <div
                className="inline-flex items-center gap-xs w-fit px-md py-xs rounded-full border border-primary/30 bg-primary/10 text-primary font-bold"
                style={{ fontSize: '11px', animation: 'tpFadeUp 0.6s ease both', animationDelay: '0ms' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>auto_awesome</span>
                Built for African Schools
              </div>

              <h1
                className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary leading-tight"
                style={{ animation: 'tpFadeUp 0.7s ease both', animationDelay: '80ms' }}
              >
                Empowering African Schools with Modern Administrative Tools
              </h1>

              <p
                className="font-body-lg text-body-lg text-on-surface-variant max-w-xl"
                style={{ animation: 'tpFadeUp 0.7s ease both', animationDelay: '160ms' }}
              >
                Streamline your institution's operations, enhance communication, and foster academic excellence
                with MyKlasi's comprehensive school management system designed for the African context.
              </p>

              {/* CTAs */}
              <div
                className="flex gap-md mt-sm flex-wrap"
                style={{ animation: 'tpFadeUp 0.7s ease both', animationDelay: '240ms' }}
              >
                <button className="bg-primary text-on-primary font-label-md text-label-md px-lg py-md rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-sm">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
                  Request a Demo
                </button>
                <Link
                  to="/login"
                  className="bg-surface text-primary border-2 border-primary font-label-md text-label-md px-lg py-md rounded-lg hover:bg-primary/10 active:scale-95 transition-all flex items-center gap-sm"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
                  Login
                </Link>
              </div>

              {/* Trust indicators */}
              <div
                className="flex items-center gap-lg flex-wrap"
                style={{ animation: 'tpFadeUp 0.7s ease both', animationDelay: '320ms' }}
              >
                {[
                  { icon: 'verified_user', label: 'GDPR Compliant' },
                  { icon: 'cloud', label: 'Cloud Hosted' },
                  { icon: 'support_agent', label: '24/7 Support' },
                ].map(({ icon, label }) => (
                  <span key={label} className="flex items-center gap-xs text-label-sm text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '15px' }}>{icon}</span>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Hero image panel ── */}
            <div
              className="relative h-64 lg:h-auto lg:min-h-[500px] w-full rounded-2xl overflow-hidden shadow-xl border border-outline-variant"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA4bkL4-na9pECNwmoqrZDLdZb9J7wZj-LGE195yjceiN8WOqpxCA_NMoBiY_-Asif3cAM-dsvJK_dNKPttqB2gPIscCQr91FnJV3JqdUg6n0WnkHgxjJDmbE8PNiz-AbvUm0zXnTABryvZVJxcvrzBtAQ349Bp5p0irihHCiBs1yOcEYECDcXNcU66WDrtTt1CPVqIKrn-HwcWD6ktufqXgBgh8dLWasKnz6OLyFQ-ba3AbVzqGt1kS9arckZp7Zl6qhQ9mBQwfqY')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                animation: 'tpFadeUp 0.8s ease both',
                animationDelay: '100ms',
              }}
            >
              {/* gradient shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/10" />
              {/* mobile left fade */}
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low/80 to-transparent lg:hidden" />

              {/* Floating stat chip */}
              <div className="absolute bottom-5 left-5 bg-surface/90 backdrop-blur-sm border border-outline-variant rounded-xl px-md py-sm flex items-center gap-sm shadow-lg">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>trending_up</span>
                <div>
                  <p className="font-bold text-on-surface" style={{ fontSize: '12px' }}>94.6% Attendance</p>
                  <p className="text-on-surface-variant" style={{ fontSize: '10px' }}>School-wide average</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─── Features Bento Grid ─── */}
        <section id="features" className="py-20 px-margin-desktop bg-background">
          <div className="max-w-[1440px] mx-auto flex flex-col gap-xl">

            <div className="text-center max-w-2xl mx-auto flex flex-col gap-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Comprehensive Institutional Management
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Built for stability and accuracy, ensuring your focus remains on education, not administration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">

              {/* Feature 1 — Student Management */}
              <div className="group bg-surface border border-outline-variant rounded-2xl p-lg flex flex-col gap-md hover:shadow-lg hover:-translate-y-1.5 hover:border-primary/40 transition-all duration-300 cursor-default">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 scale-125 group-hover:scale-[1.5] transition-transform duration-500" />
                  <div className="relative w-full h-full rounded-full flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Student Management</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Centralized digital records, real-time attendance tracking, and comprehensive performance analytics to monitor student progress efficiently.
                  </p>
                </div>
              </div>

              {/* Feature 2 — Financial Tracking */}
              <div className="group bg-surface border border-outline-variant rounded-2xl p-lg flex flex-col gap-md hover:shadow-lg hover:-translate-y-1.5 hover:border-secondary/40 transition-all duration-300 cursor-default">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors" />
                  <div className="absolute inset-0 rounded-full border-2 border-secondary/20 scale-125 group-hover:scale-[1.5] transition-transform duration-500" />
                  <div className="relative w-full h-full rounded-full flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Financial Tracking</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Secure fee collection, automated invoicing, and detailed financial reporting to ensure institutional financial health and accuracy.
                  </p>
                </div>
              </div>

              {/* Feature 3 — Academic Excellence */}
              <div className="group bg-surface border border-outline-variant rounded-2xl p-lg flex flex-col gap-md hover:shadow-lg hover:-translate-y-1.5 hover:border-tertiary/40 transition-all duration-300 cursor-default">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full bg-secondary-container group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 rounded-full border-2 border-secondary/20 scale-125 group-hover:scale-[1.5] transition-transform duration-500" />
                  <div className="relative w-full h-full rounded-full flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Academic Excellence</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Curriculum planning tools, digital grading systems, and parent-teacher communication portals to foster a collaborative learning environment.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── About Section ─── */}
        <section id="about" className="py-20 lg:py-28 px-margin-desktop bg-surface-container-low relative overflow-hidden">

          {/* Subtle diagonal stripe pattern */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 12px)',
            }}
          />

          <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col gap-xl">

            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-sm">
              <span className="inline-flex items-center gap-xs w-fit mx-auto px-md py-xs rounded-full border border-primary/30 bg-primary/10 text-primary font-bold" style={{ fontSize: '11px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>info</span>
                Who We Are
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                About Tenpaten Solutions
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                We are a Malawian EdTech company on a mission to digitize and modernize school administration across Africa — starting right here at home.
              </p>
            </div>

            {/* Two-column: Story + Values */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-start">

              {/* Story Column */}
              <div className="flex flex-col gap-lg">
                <div className="bg-surface border border-outline-variant rounded-2xl p-lg flex flex-col gap-md shadow-sm">
                  <div className="flex items-center gap-sm">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>rocket_launch</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Our Mission</h3>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    MyKlasi was born from a simple observation: African schools deserve tools as powerful as the education they deliver. We build intuitive, reliable, and affordable school management software that works even in low-connectivity environments — empowering head teachers, bursars, teachers, and parents to focus on what matters most: <strong className="text-on-surface">student success</strong>.
                  </p>
                </div>

                <div className="bg-surface border border-outline-variant rounded-2xl p-lg flex flex-col gap-md shadow-sm">
                  <div className="flex items-center gap-sm">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>visibility</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Our Vision</h3>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    To become the leading school management platform across Sub-Saharan Africa — setting the standard for how technology can enhance education administration, bridge the digital divide, and create transparent, accountable, and efficient learning institutions.
                  </p>
                </div>
              </div>

              {/* Values + Stats Column */}
              <div className="flex flex-col gap-lg">

                {/* Values Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                  {[
                    { icon: 'lightbulb', title: 'Innovation', desc: 'Offline-first PWA architecture built for African infrastructure realities.', color: 'primary' },
                    { icon: 'handshake', title: 'Integrity', desc: 'Data privacy and transparency in every financial and academic record.', color: 'secondary' },
                    { icon: 'trending_up', title: 'Impact', desc: 'Measurable improvements in attendance, fee collection, and communication.', color: 'tertiary' },
                  ].map(({ icon, title, desc, color }) => (
                    <div
                      key={title}
                      className={`group bg-surface border border-outline-variant rounded-2xl p-md flex flex-col gap-sm text-center hover:shadow-lg hover:-translate-y-1 hover:border-${color}/40 transition-all duration-300`}
                    >
                      <div className={`mx-auto w-12 h-12 rounded-full bg-${color}/10 flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-${color}`} style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      </div>
                      <h4 className="font-label-lg text-label-lg font-bold text-on-surface">{title}</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">{desc}</p>
                    </div>
                  ))}
                </div>

                {/* Stats Bar */}
                <div className="bg-primary rounded-2xl p-lg grid grid-cols-3 gap-md text-center shadow-md">
                  {[
                    { value: '50+', label: 'Schools Onboarded' },
                    { value: '12K+', label: 'Students Managed' },
                    { value: '99.9%', label: 'Uptime SLA' },
                  ].map(({ value, label }) => (
                    <div key={label} className="flex flex-col gap-xs">
                      <p className="font-headline-md text-headline-md text-on-primary font-bold">{value}</p>
                      <p className="text-on-primary/80 font-medium" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>{label}</p>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ─── Contact Section ─── */}
        <section id="contact" className="py-20 lg:py-28 px-margin-desktop bg-background relative overflow-hidden">

          {/* Ambient glow */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.12]"
              style={{ background: 'radial-gradient(circle, var(--md-sys-color-primary, #0e7a3f) 0%, transparent 70%)' }}
            />
          </div>

          <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col gap-xl">

            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-sm">
              <span className="inline-flex items-center gap-xs w-fit mx-auto px-md py-xs rounded-full border border-secondary/30 bg-secondary/10 text-secondary font-bold" style={{ fontSize: '11px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>mail</span>
                Get In Touch
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Contact Us
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Ready to transform your school's administration? Reach out and we'll get you started.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-xl">

              {/* Contact Info Cards */}
              <div className="lg:col-span-2 flex flex-col gap-md">

                {/* Phone */}
                <a
                  href="tel:+265993232373"
                  className="group bg-surface border border-outline-variant rounded-2xl p-lg flex items-start gap-md hover:shadow-lg hover:border-primary/40 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>call</span>
                  </div>
                  <div>
                    <h4 className="font-label-lg text-label-lg font-bold text-on-surface mb-xs">Phone</h4>
                    <p className="font-body-md text-body-md text-primary font-semibold">+265 993 232 373</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Mon – Fri, 8:00 AM – 5:00 PM CAT</p>
                  </div>
                </a>

                {/* General Email */}
                <a
                  href="mailto:info@tenpaten.com"
                  className="group bg-surface border border-outline-variant rounded-2xl p-lg flex items-start gap-md hover:shadow-lg hover:border-secondary/40 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary/10 group-hover:bg-secondary/20 flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>mail</span>
                  </div>
                  <div>
                    <h4 className="font-label-lg text-label-lg font-bold text-on-surface mb-xs">General Inquiries</h4>
                    <p className="font-body-md text-body-md text-secondary font-semibold">info@tenpaten.com</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">For partnerships, demos, and general questions</p>
                  </div>
                </a>

                {/* Director Email */}
                <a
                  href="mailto:director@tenpaten.com"
                  className="group bg-surface border border-outline-variant rounded-2xl p-lg flex items-start gap-md hover:shadow-lg hover:border-primary/40 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>person</span>
                  </div>
                  <div>
                    <h4 className="font-label-lg text-label-lg font-bold text-on-surface mb-xs">Director's Office</h4>
                    <p className="font-body-md text-body-md text-primary font-semibold">director@tenpaten.com</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">For executive correspondence and strategic proposals</p>
                  </div>
                </a>

                {/* Location */}
                <div className="bg-surface border border-outline-variant rounded-2xl p-lg flex items-start gap-md">
                  <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  </div>
                  <div>
                    <h4 className="font-label-lg text-label-lg font-bold text-on-surface mb-xs">Location</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">Lilongwe, Malawi</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Serving schools across Southern Africa</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3 bg-surface border border-outline-variant rounded-2xl p-lg shadow-sm flex flex-col gap-md">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Send Us a Message</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Fill out the form below and we'll get back to you within 24 hours.</p>
                </div>

                <form className="flex flex-col gap-md" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label htmlFor="contact-name" className="font-label-sm text-label-sm font-semibold text-on-surface">Full Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder="e.g. John Phiri"
                        className="w-full px-md py-sm bg-surface-container border border-outline rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label htmlFor="contact-email" className="font-label-sm text-label-sm font-semibold text-on-surface">Email Address</label>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="e.g. john@school.mw"
                        className="w-full px-md py-sm bg-surface-container border border-outline rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label htmlFor="contact-school" className="font-label-sm text-label-sm font-semibold text-on-surface">School / Institution Name</label>
                    <input
                      id="contact-school"
                      type="text"
                      placeholder="e.g. Sunshine Secondary School"
                      className="w-full px-md py-sm bg-surface-container border border-outline rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label htmlFor="contact-subject" className="font-label-sm text-label-sm font-semibold text-on-surface">Subject</label>
                    <select
                      id="contact-subject"
                      className="w-full px-md py-sm bg-surface-container border border-outline rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    >
                      <option value="">Select a topic...</option>
                      <option value="demo">Request a Demo</option>
                      <option value="pricing">Pricing Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership Proposal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label htmlFor="contact-message" className="font-label-sm text-label-sm font-semibold text-on-surface">Message</label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder="Tell us about your school and how we can help..."
                      className="w-full px-md py-sm bg-surface-container border border-outline rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto self-end bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-sm"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                    Send Message
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ─── Footer ─── */}
      <footer className="w-full py-xl bg-surface-container-low border-t border-outline-variant mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-[1440px] mx-auto gap-md">
          <Logo height="52px" />
          <div className="flex flex-wrap justify-center gap-md">
            {['Privacy Policy', 'Terms of Service', 'Help Center', 'Accessibility'].map(link => (
              <a key={link} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
                {link}
              </a>
            ))}
          </div>
          <div className="font-label-sm text-label-sm text-on-surface-variant text-center md:text-right">
            © {new Date().getFullYear()} MyKlasi School Management System. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Scoped keyframes — staggered hero entrance */}
      <style>{`
        @keyframes tpFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

    </div>
  );
};
