/* eslint-disable @next/next/no-img-element */

export default function Home() {
  return (
    <>
      <header className="bg-surface dark:bg-inverse-surface border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none docked full-width top-0 z-50 sticky">
        <div className="flex flex-col w-full px-md lg:px-lg max-w-container-max mx-auto">
          <div className="flex items-center justify-between h-[72px]">
            <a className="flex items-center gap-sm group" href="#">
              <img alt="Gram Panchayat Emblem" className="h-12 w-12 object-contain group-hover:scale-105 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwOt3btzGAHdEQqUYDDZKkpFf86hD13iuogwK5sJ6n1mHhFpvadD8fyKz3ofQitSvIvBCLiU2NPyoxgDk7RSvGKrf4kVNScPjE8n0G4SfDiAqxu12bjV7FyuoFMElaBCruoRSICbBWHnyOz2kn-Vy0sRzowqH1n3_IvlafFpvweNAkhbIMcTlmt59uiekLrgEFBfwmmIs3I1pEqxhL-hViuTS6SzNmg1mY_cD3-F7ILpzHTIINaSE"/>
              <span className="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed-dim">ग्रामपंचायत ग्राम</span>
            </a>
            <nav className="hidden md:flex items-center gap-md lg:gap-lg">
              <a className="text-primary dark:text-primary-fixed-dim border-b-2 border-primary font-bold pb-1 flex flex-col hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-all" href="#">Home</a>
              <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-all" href="#about">About</a>
              <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-all" href="#services">Services</a>
              <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-all" href="#notices">Notices</a>
              <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-all" href="#schemes">Schemes</a>
              <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-all" href="#development">Development</a>
            </nav>
            <div className="flex items-center gap-sm">
              <button aria-label="Language" className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors hidden sm:block" title="Language">
                <span className="material-symbols-outlined" data-icon="language">language</span>
              </button>
              <button aria-label="Accessibility" className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors hidden sm:block" title="Accessibility Settings">
                <span className="material-symbols-outlined" data-icon="settings_accessibility">settings_accessibility</span>
              </button>
              <a className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-2 px-4 rounded-full transition-colors whitespace-nowrap" href="#">
                Citizen Login
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="bg-cover bg-center bg-no-repeat w-full h-full" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCFlJ79KwYAEhDwk-4LHYL5yzTIfSZUxNMEMyQQCQ756zIKXlas1ZlIqHX_ugMBDsznNW5tVV6PGEp669KAb0huNdqrwR1KygDSD9NqVYswYvg3ecDZ_2i7ZsUO-M0U-_fwdt7clbkgya3iQUShPbkVyEMAhlcCvUO2exqSvEmjufBAEa4BOZw23YhLTimdphrqEy-nhYWiGlyU1gPQSp_An8O8cO-0r-fOREQGn3JeRTmtYQn_lM4')" }}></div>
          <div className="absolute inset-0 bg-surface/80 dark:bg-inverse-surface/90 backdrop-blur-sm"></div>
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-md lg:px-lg text-center flex flex-col items-center gap-md">
          <span className="text-secondary font-label-md text-label-md uppercase tracking-wider bg-secondary-container/20 px-4 py-1 rounded-full text-secondary-container-dark">Official Government Portal</span>
          <h1 className="text-display-lg font-display-lg text-on-surface max-w-4xl">
            Welcome to <span className="text-primary">Gram Panchayat</span><br/>
            <span className="text-headline-lg font-headline-lg text-on-surface-variant mt-2 block">ग्रामपंचायत मध्ये आपले स्वागत आहे</span>
          </h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mt-4">
            Serving our community through transparent governance, digital services, and sustainable village development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3 px-8 rounded-full transition-colors shadow-sm flex items-center justify-center gap-2 h-12" href="#services">
              Explore Citizen Services
              <span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">arrow_forward</span>
            </a>
            <a className="border border-primary text-primary hover:bg-primary/5 font-label-md text-label-md py-3 px-8 rounded-full transition-colors flex items-center justify-center h-12 bg-surface" href="#notices">
              View Latest Notices
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 bg-surface-container-lowest border-y border-outline-variant relative z-20 -mt-8 shadow-sm max-w-container-max mx-auto rounded-xl mx-md lg:mx-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 text-center divide-x-0 md:divide-x divide-outline-variant/30">
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-primary text-4xl" data-icon="group" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            <span className="text-headline-lg font-headline-lg text-on-surface">5,240+</span>
            <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Population</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-4xl" data-icon="home" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <span className="text-headline-lg font-headline-lg text-on-surface">1,280+</span>
            <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Households</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-4xl" data-icon="school" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            <span className="text-headline-lg font-headline-lg text-on-surface">4</span>
            <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Schools</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-primary text-4xl" data-icon="water_drop" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
            <span className="text-headline-lg font-headline-lg text-on-surface">1,050+</span>
            <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Water Connections</span>
          </div>
        </div>
      </section>

      <section className="py-lg px-md lg:px-lg max-w-container-max mx-auto" id="services">
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface">Citizen Services</h2>
            <p className="text-body-md font-body-md text-on-surface-variant mt-2">Access essential Gram Panchayat services online.</p>
          </div>
          <a className="text-primary font-label-md hover:underline flex items-center gap-1 justify-center" href="#">View All Services <span className="material-symbols-outlined text-[18px]">arrow_forward</span></a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <a className="group bg-surface-container-lowest border border-outline-variant hover:border-primary/50 hover:shadow-md p-6 rounded-xl flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden" href="#">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl" data-icon="account_balance">account_balance</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface text-[18px]">Property Tax</h3>
            <p className="text-caption font-caption text-on-surface-variant mt-2">Pay your house and land tax online.</p>
          </a>
          <a className="group bg-surface-container-lowest border border-outline-variant hover:border-primary/50 hover:shadow-md p-6 rounded-xl flex flex-col items-center text-center transition-all duration-300" href="#">
            <div className="w-16 h-16 rounded-full bg-secondary-container/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-3xl" data-icon="workspace_premium">workspace_premium</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface text-[18px]">Certificates</h3>
            <p className="text-caption font-caption text-on-surface-variant mt-2">Birth, Death &amp; Marriage certificates.</p>
          </a>
          <a className="group bg-surface-container-lowest border border-outline-variant hover:border-primary/50 hover:shadow-md p-6 rounded-xl flex flex-col items-center text-center transition-all duration-300" href="#">
            <div className="w-16 h-16 rounded-full bg-[#e0f2fe] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[#0284c7] text-3xl" data-icon="plumbing">plumbing</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface text-[18px]">Water Supply</h3>
            <p className="text-caption font-caption text-on-surface-variant mt-2">New connection &amp; bill payment.</p>
          </a>
          <a className="group bg-surface-container-lowest border border-outline-variant hover:border-primary/50 hover:shadow-md p-6 rounded-xl flex flex-col items-center text-center transition-all duration-300" href="#">
            <div className="w-16 h-16 rounded-full bg-tertiary-container/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-tertiary text-3xl" data-icon="cleaning_services">cleaning_services</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface text-[18px]">Sanitation</h3>
            <p className="text-caption font-caption text-on-surface-variant mt-2">Waste collection &amp; cleaning requests.</p>
          </a>
          <a className="group bg-surface-container-lowest border border-outline-variant hover:border-primary/50 hover:shadow-md p-6 rounded-xl flex flex-col items-center text-center transition-all duration-300" href="#">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl" data-icon="edit_document">edit_document</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface text-[18px]">Online Applications</h3>
            <p className="text-caption font-caption text-on-surface-variant mt-2">Apply for various NOCs and permits.</p>
          </a>
          <a className="group bg-surface-container-lowest border border-outline-variant hover:border-error/50 hover:shadow-md p-6 rounded-xl flex flex-col items-center text-center transition-all duration-300" href="#">
            <div className="w-16 h-16 rounded-full bg-error-container/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-error text-3xl" data-icon="campaign">campaign</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface text-[18px]">Complaints</h3>
            <p className="text-caption font-caption text-on-surface-variant mt-2">Register and track grievances.</p>
          </a>
          <a className="group bg-surface-container-lowest border border-outline-variant hover:border-secondary/50 hover:shadow-md p-6 rounded-xl flex flex-col items-center text-center transition-all duration-300" href="#">
            <div className="w-16 h-16 rounded-full bg-secondary-container/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-3xl" data-icon="savings">savings</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface text-[18px]">Schemes</h3>
            <p className="text-caption font-caption text-on-surface-variant mt-2">State &amp; Central Govt schemes info.</p>
          </a>
          <a className="group bg-surface-container-lowest border border-outline-variant hover:border-primary/50 hover:shadow-md p-6 rounded-xl flex flex-col items-center text-center transition-all duration-300" href="#">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl" data-icon="payments">payments</span>
            </div>
            <h3 className="text-headline-md font-headline-md text-on-surface text-[18px]">Tax Payments</h3>
            <p className="text-caption font-caption text-on-surface-variant mt-2">Commercial and miscellaneous taxes.</p>
          </a>
        </div>
      </section>

      <section className="py-lg bg-surface-container-lowest border-y border-outline-variant/50" id="notices">
        <div className="max-w-container-max mx-auto px-md lg:px-lg">
          <h2 className="text-headline-lg font-headline-lg text-on-surface mb-8">Latest Notices</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-surface border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-secondary text-[20px]" data-icon="event">event</span>
                <time className="text-label-md font-label-md text-on-surface-variant">October 15, 2024</time>
                <span className="ml-auto bg-error-container text-on-error-container text-[10px] font-bold px-2 py-1 rounded-full uppercase">Urgent</span>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface text-[18px] mb-2 leading-tight">Gram Sabha Meeting Scheduled</h3>
              <p className="text-body-md font-body-md text-on-surface-variant line-clamp-3 mb-4 flex-grow">All villagers are requested to attend the upcoming Gram Sabha meeting to discuss the annual development plan and budget allocation.</p>
              <a className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1 mt-auto" href="#">Read Document <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span></a>
            </article>
            <article className="bg-surface border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-[20px]" data-icon="event">event</span>
                <time className="text-label-md font-label-md text-on-surface-variant">October 12, 2024</time>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface text-[18px] mb-2 leading-tight">Property Tax Collection Drive</h3>
              <p className="text-body-md font-body-md text-on-surface-variant line-clamp-3 mb-4 flex-grow">Special camp organized at Panchayat office for property tax collection. Avail 5% rebate on early payment before Oct 30.</p>
              <a className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1 mt-auto" href="#">Read Document <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span></a>
            </article>
            <article className="bg-surface border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-[20px]" data-icon="event">event</span>
                <time className="text-label-md font-label-md text-on-surface-variant">October 05, 2024</time>
              </div>
              <h3 className="text-headline-md font-headline-md text-on-surface text-[18px] mb-2 leading-tight">Swachh Bharat Abhiyan Activities</h3>
              <p className="text-body-md font-body-md text-on-surface-variant line-clamp-3 mb-4 flex-grow">Schedule for ward-wise cleanliness drive and waste segregation awareness program under Swachh Bharat Mission.</p>
              <a className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1 mt-auto" href="#">Read Document <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span></a>
            </article>
          </div>
        </div>
      </section>

      <section className="py-lg px-md lg:px-lg max-w-container-max mx-auto" id="development">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Our Village Development</h2>
          <p className="text-body-lg font-body-lg text-on-surface-variant mt-2">A progressive journey towards a sustainable and self-reliant Gram Panchayat.</p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-sm border border-outline-variant mb-12">
          <img alt="Village Development Grid" className="w-full h-auto object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZoA3vEblUpjzjVCCgkwzvoodxSeOoBzUdoT7cQhlztUnE7xw_8tdcjipmRySsrZeeR30v43nj7ZPXSmesxUtXh6RU2ljZKoWKV7mxfcDkxuY27N0ER-U5JL66i0vHGQh4wdg4sMuo-3B6aIZ8KV1g7FeCX5yQwkNhf8aIqrSDbneuQm6lmo_NM1k84-IBDUnAhz1PJrOXkeUgJOYNS8zo-qCllgIfiY9VNAfEfIdVXxPFfHxsmuE"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface p-6 rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-3xl mb-3" data-icon="home_work">home_work</span>
            <h4 className="text-headline-md font-headline-md text-on-surface text-[16px] mb-2">PM Awas Yojana</h4>
            <p className="text-caption font-caption text-on-surface-variant">Housing for all eligible beneficiaries in the village.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-3xl mb-3" data-icon="recycling">recycling</span>
            <h4 className="text-headline-md font-headline-md text-on-surface text-[16px] mb-2">Swachh Bharat</h4>
            <p className="text-caption font-caption text-on-surface-variant">100% ODF status achieved with solid waste management.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-3xl mb-3" data-icon="solar_power">solar_power</span>
            <h4 className="text-headline-md font-headline-md text-on-surface text-[16px] mb-2">Jal Jeevan Mission</h4>
            <p className="text-caption font-caption text-on-surface-variant">Functional household tap connections provided.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-3xl mb-3" data-icon="agriculture">agriculture</span>
            <h4 className="text-headline-md font-headline-md text-on-surface text-[16px] mb-2">Kisan Samman Nidhi</h4>
            <p className="text-caption font-caption text-on-surface-variant">Direct income support for local farmers.</p>
          </div>
        </div>
      </section>

      <section className="py-lg bg-surface-container-low border-t border-outline-variant" id="about">
        <div className="max-w-container-max mx-auto px-md lg:px-lg grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-6">About Gram Panchayat</h2>
            <div className="prose prose-on-surface max-w-none text-body-md font-body-md text-on-surface-variant mb-6">
              <p className="mb-4">The Gram Panchayat serves as the cornerstone of local self-governance. We are committed to fostering inclusive growth, ensuring transparent administration, and providing efficient civic amenities to all citizens.</p>
              <p>Our vision is to transform the village into a model of sustainable development through active community participation and digital empowerment.</p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-sm h-64 bg-surface border border-outline-variant relative">
              <div className="bg-cover bg-center w-full h-full" style={{ backgroundImage: "url('https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg')" }}></div>
            </div>
          </div>
          <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant p-8 flex flex-col h-full">
            <h3 className="text-headline-md font-headline-md text-on-surface mb-6">Contact Us</h3>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1" data-icon="location_on">location_on</span>
                <div>
                  <span className="block text-label-md font-label-md text-on-surface">Office Address</span>
                  <span className="text-body-md font-body-md text-on-surface-variant">Gram Panchayat Karyalaya,<br/>Main Road, Near Village Square,<br/>District Center, State - 400001</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" data-icon="call">call</span>
                <div>
                  <span className="block text-label-md font-label-md text-on-surface">Phone Line</span>
                  <span className="text-body-md font-body-md text-on-surface-variant">0123-4567890</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" data-icon="mail">mail</span>
                <div>
                  <span className="block text-label-md font-label-md text-on-surface">Email Address</span>
                  <span className="text-body-md font-body-md text-on-surface-variant">contact@grampanchayat.gov.in</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" data-icon="schedule">schedule</span>
                <div>
                  <span className="block text-label-md font-label-md text-on-surface">Working Hours</span>
                  <span className="text-body-md font-body-md text-on-surface-variant">Mon-Sat: 10:00 AM - 05:00 PM</span>
                </div>
              </li>
            </ul>
            <div className="h-48 rounded-lg overflow-hidden border border-outline-variant relative bg-surface-variant flex items-center justify-center">
              <img className="object-cover w-full h-full opacity-80" alt="Map" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg"/>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-surface-container-highest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline flat no shadows full-width bottom-0">
        <div className="w-full py-lg px-md lg:px-lg max-w-container-max mx-auto flex flex-col gap-md">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 border-b border-outline-variant/30 pb-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <a className="flex items-center gap-sm" href="#">
                <img alt="Gram Panchayat Emblem" className="h-10 w-10 object-contain grayscale opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwOt3btzGAHdEQqUYDDZKkpFf86hD13iuogwK5sJ6n1mHhFpvadD8fyKz3ofQitSvIvBCLiU2NPyoxgDk7RSvGKrf4kVNScPjE8n0G4SfDiAqxu12bjV7FyuoFMElaBCruoRSICbBWHnyOz2kn-Vy0sRzowqH1n3_IvlafFpvweNAkhbIMcTlmt59uiekLrgEFBfwmmIs3I1pEqxhL-hViuTS6SzNmg1mY_cD3-F7ILpzHTIINaSE"/>
                <span className="font-headline-md text-headline-md font-bold text-on-surface dark:text-inverse-on-surface">Gram Panchayat</span>
              </a>
              <p className="text-caption font-caption text-on-surface-variant text-center md:text-left max-w-xs">
                Committed to transparent local governance and holistic village development.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              <a className="text-body-md font-body-md text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-colors underline-offset-4 hover:underline" href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
