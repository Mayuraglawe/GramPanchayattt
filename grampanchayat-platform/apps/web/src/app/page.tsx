/* eslint-disable @next/next/no-img-element */
import dynamic from 'next/dynamic';
import ImageSlider from '@/components/ImageSlider';
import Navbar from '@/components/Navbar';

const VillageMap = dynamic(() => import('@/components/VillageMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface-variant animate-pulse flex items-center justify-center text-on-surface-variant text-sm">Loading map...</div>
});

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="bg-cover bg-center bg-no-repeat w-full h-full" style={{ backgroundImage: "url('/village_hero.png')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-surface/85 via-surface/75 to-surface/95 dark:from-inverse-surface/90 dark:to-inverse-surface/85 backdrop-blur-xs"></div>
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-md lg:px-lg text-center flex flex-col items-center gap-md py-12">
          <h1 className="text-display-lg font-display-lg text-on-surface max-w-4xl leading-tight">
            Welcome to <span className="text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Gram Panchayat</span><br/>
            <span className="text-headline-lg font-headline-lg text-on-surface-variant mt-2 block font-normal">आपल्या डिजिटल ग्रामपंचायतीमध्ये आपले सहर्ष स्वागत आहे</span>
          </h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mt-2">
            Submit grievances, request certificates, book community halls, and pay taxes instantly using your Tracking ID or Mobile Number.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <a className="bg-primary hover:bg-primary/90 text-on-primary font-label-md py-3 px-8 rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 h-12 text-base font-semibold" href="#services">
              Explore Services
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </a>
            <a className="bg-surface hover:bg-surface-container-high border border-outline-variant text-on-surface font-label-md py-3 px-8 rounded-full transition-all flex items-center justify-center gap-2 h-12 shadow-xs font-semibold" href="/track-status">
              <span className="material-symbols-outlined text-primary text-[20px]">search</span>
              Track Application Status
            </a>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="py-8 bg-surface-container-lowest border-y border-outline-variant/60 relative z-20 -mt-6 shadow-sm max-w-container-max mx-auto rounded-2xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-outline-variant/30">
          <div className="flex flex-col items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-3xl">groups</span>
            <span className="text-headline-lg font-bold text-on-surface">5,240+</span>
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Villagers Served</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-3xl">domain</span>
            <span className="text-headline-lg font-bold text-on-surface">1,280+</span>
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Properties</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-3xl">verified</span>
            <span className="text-headline-lg font-bold text-on-surface">2,410+</span>
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Certificates Issued</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-3xl">offline_pin</span>
            <span className="text-headline-lg font-bold text-on-surface">100%</span>
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Tracking-ID Enabled</span>
          </div>
        </div>
      </section>

      {/* Main Citizen Services Grid */}
      <section className="py-16 px-md lg:px-lg max-w-container-max mx-auto" id="services">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-primary font-bold text-label-md uppercase tracking-wider bg-primary/10 px-3.5 py-1 rounded-full">Automated Public Services</span>
          <h2 className="text-headline-lg font-bold text-on-surface mt-3">Citizen Services • नागरिक सेवा</h2>
          <p className="text-body-md text-on-surface-variant mt-2">Access all Gram Panchayat services directly without any login requirement.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Track Status */}
          <a className="group bg-surface hover:bg-surface-container-lowest border border-outline-variant hover:border-primary/60 hover:shadow-xl p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between" href="/track-status">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-primary">
                <span className="material-symbols-outlined text-3xl">search_check</span>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface text-[18px]">Track Status</h3>
              <p className="text-caption text-on-surface-variant mt-2 leading-relaxed">Check grievance, certificate, or booking status using your Mobile Number or Ticket ID.</p>
            </div>
            <span className="text-primary font-semibold text-label-md flex items-center gap-1 mt-6 group-hover:translate-x-1 transition-transform">
              Track Now <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </a>

          {/* Card 2: Complaints */}
          <a className="group bg-surface hover:bg-surface-container-lowest border border-outline-variant hover:border-error/60 hover:shadow-xl p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between" href="/complaints">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-error/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-error">
                <span className="material-symbols-outlined text-3xl">campaign</span>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface text-[18px]">Grievance Ticketing</h3>
              <p className="text-caption text-on-surface-variant mt-2 leading-relaxed">Report broken water pumps, streetlights, or roads. Upload photos and receive a Ticket ID.</p>
            </div>
            <span className="text-error font-semibold text-label-md flex items-center gap-1 mt-6 group-hover:translate-x-1 transition-transform">
              File Grievance <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </a>

          {/* Card 3: Certificates */}
          <a className="group bg-surface hover:bg-surface-container-lowest border border-outline-variant hover:border-secondary/60 hover:shadow-xl p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between" href="/certificates">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-secondary">
                <span className="material-symbols-outlined text-3xl">workspace_premium</span>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface text-[18px]">Certificates</h3>
              <p className="text-caption text-on-surface-variant mt-2 leading-relaxed">Apply for Birth, Death, Income, and Domicile certificates with instant Application ID.</p>
            </div>
            <span className="text-secondary font-semibold text-label-md flex items-center gap-1 mt-6 group-hover:translate-x-1 transition-transform">
              Apply Now <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </a>

          {/* Card 4: Asset Booking */}
          <a className="group bg-surface hover:bg-surface-container-lowest border border-outline-variant hover:border-emerald-500/60 hover:shadow-xl p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between" href="/assets">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-emerald-600">
                <span className="material-symbols-outlined text-3xl">agriculture</span>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface text-[18px]">Asset Booking</h3>
              <p className="text-caption text-on-surface-variant mt-2 leading-relaxed">View availability calendar and reserve Community Halls, Tractors, or Water Tankers.</p>
            </div>
            <span className="text-emerald-600 font-semibold text-label-md flex items-center gap-1 mt-6 group-hover:translate-x-1 transition-transform">
              View Calendar <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </a>

          {/* Card 5: Tax & Bill Payments */}
          <a className="group bg-surface hover:bg-surface-container-lowest border border-outline-variant hover:border-primary/60 hover:shadow-xl p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between" href="/payments">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-primary">
                <span className="material-symbols-outlined text-3xl">payments</span>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface text-[18px]">Tax & Water Bills</h3>
              <p className="text-caption text-on-surface-variant mt-2 leading-relaxed">Enter House No or Water Connection No to view due amounts and pay instantly via UPI.</p>
            </div>
            <span className="text-primary font-semibold text-label-md flex items-center gap-1 mt-6 group-hover:translate-x-1 transition-transform">
              Pay Bills <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </a>

          {/* Card 6: Government Schemes */}
          <a className="group bg-surface hover:bg-surface-container-lowest border border-outline-variant hover:border-amber-500/60 hover:shadow-xl p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between" href="/schemes">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-amber-600">
                <span className="material-symbols-outlined text-3xl">savings</span>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface text-[18px]">Govt Schemes</h3>
              <p className="text-caption text-on-surface-variant mt-2 leading-relaxed">Explore Central and State welfare schemes, eligibility rules, and helpline numbers.</p>
            </div>
            <span className="text-amber-600 font-semibold text-label-md flex items-center gap-1 mt-6 group-hover:translate-x-1 transition-transform">
              Explore Schemes <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </a>

          {/* Card 7: Public Feedback */}
          <a className="group bg-surface hover:bg-surface-container-lowest border border-outline-variant hover:border-purple-500/60 hover:shadow-xl p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between" href="/feedback">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-purple-600">
                <span className="material-symbols-outlined text-3xl">star_rate</span>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface text-[18px]">Public Feedback</h3>
              <p className="text-caption text-on-surface-variant mt-2 leading-relaxed">Rate Gram Panchayat facilities, water supply, and local school services to drive improvements.</p>
            </div>
            <span className="text-purple-600 font-semibold text-label-md flex items-center gap-1 mt-6 group-hover:translate-x-1 transition-transform">
              Give Feedback <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </a>

          {/* Card 8: Village Map */}
          <a className="group bg-surface hover:bg-surface-container-lowest border border-outline-variant hover:border-indigo-500/60 hover:shadow-xl p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between" href="/village-map">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-indigo-600">
                <span className="material-symbols-outlined text-3xl">map</span>
              </div>
              <h3 className="text-headline-md font-bold text-on-surface text-[18px]">Interactive Map</h3>
              <p className="text-caption text-on-surface-variant mt-2 leading-relaxed">Locate Gram Panchayat office, primary health center, water pumps, and local wards.</p>
            </div>
            <span className="text-indigo-600 font-semibold text-label-md flex items-center gap-1 mt-6 group-hover:translate-x-1 transition-transform">
              View Map <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </a>
        </div>
      </section>

      {/* Village Development & Infrastructure Showcase */}
      <section className="py-16 bg-surface-container-low border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-md lg:px-lg">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-secondary font-bold text-label-md uppercase tracking-wider bg-secondary-container/20 px-3.5 py-1 rounded-full text-secondary-container-dark">Model Village Initiatives</span>
            <h2 className="text-headline-lg font-bold text-on-surface mt-3">Development & Infrastructure • ग्राम विकास</h2>
            <p className="text-body-lg text-on-surface-variant mt-2">A progressive journey towards a sustainable and self-reliant Gram Panchayat.</p>
          </div>
          <div className="mb-12">
            <ImageSlider
              slides={[
                {
                  src: '/slide1.png',
                  alt: 'Gram Panchayat Image 1',
                  title: 'Gram Panchayat Digital Administration',
                  subtitle: 'Transparent Governance & Public Civic Services'
                },
                {
                  src: '/slide2.png',
                  alt: 'Gram Panchayat Image 2',
                  title: 'Sustainable Rural Agriculture',
                  subtitle: 'Solar irrigation, soil health cards & farmer direct benefit transfers'
                },
                {
                  src: '/slide3.png',
                  alt: 'Gram Panchayat Image 3',
                  title: 'Clean & Modern Village Infrastructure',
                  subtitle: 'Swachh Bharat initiative, solar street lighting, and paved roads'
                },
                {
                  src: '/slide4.png',
                  alt: 'Gram Panchayat Image 4',
                  title: 'E-Governance & Citizen Services',
                  subtitle: 'Instant grievance tracking, certificate issuance, asset booking, and quick pay'
                }
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-primary text-3xl mb-3">home_work</span>
              <h4 className="text-headline-md font-bold text-on-surface text-[16px] mb-2">PM Awas Yojana</h4>
              <p className="text-caption text-on-surface-variant">Housing for all eligible beneficiaries in the village with direct bank transfers.</p>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-primary text-3xl mb-3">recycling</span>
              <h4 className="text-headline-md font-bold text-on-surface text-[16px] mb-2">Swachh Bharat Mission</h4>
              <p className="text-caption text-on-surface-variant">100% ODF status achieved with doorstep solid waste collection & segregation.</p>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-primary text-3xl mb-3">solar_power</span>
              <h4 className="text-headline-md font-bold text-on-surface text-[16px] mb-2">Jal Jeevan Mission</h4>
              <p className="text-caption text-on-surface-variant">Functional household tap connections provided to every rural residence.</p>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-primary text-3xl mb-3">agriculture</span>
              <h4 className="text-headline-md font-bold text-on-surface text-[16px] mb-2">Kisan Samman Nidhi</h4>
              <p className="text-caption text-on-surface-variant">Direct income support and soil health card services for local farmers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Footer Section */}
      <section className="py-12 bg-surface-container border-t border-outline-variant" id="about">
        <div className="max-w-container-max mx-auto px-md lg:px-lg grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <span className="text-primary font-bold text-label-md uppercase tracking-wider">Contact & Location</span>
            <h2 className="text-headline-lg font-bold text-on-surface mt-2 mb-6">Grampanchayt Hudkeshwar Khurd • कार्यालय माहिती</h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1">location_on</span>
                <div>
                  <span className="block font-semibold text-on-surface">Office Address</span>
                  <span className="text-body-md text-on-surface-variant">Grampanchayt Karyalaya, Hudkeshwar Khurd, District Nagpur, Maharashtra - 440034</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">call</span>
                <div>
                  <span className="block font-semibold text-on-surface">Helpline</span>
                  <span className="text-body-md text-on-surface-variant">0123-4567890 / 1800-233-4567</span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-64 rounded-2xl overflow-hidden border border-outline-variant shadow-md relative bg-surface-variant">
            <VillageMap />
          </div>
        </div>
      </section>

      <footer className="bg-surface-container-highest dark:bg-inverse-surface border-t border-outline-variant py-8 px-md">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-on-surface-variant text-sm">
          <div className="flex items-center gap-3">
            <img alt="Gram Panchayat Emblem" className="h-8 w-8 object-contain" src="/emblem.png"/>
            <span className="font-bold text-on-surface">Gram Panchayat Digital Portal</span>
          </div>
          <p>© 2026 Gram Panchayat Digital Portal • Powered by Direct Public Access &amp; Offline PWA</p>
        </div>
      </footer>
    </>
  );
}
