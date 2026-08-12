'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';

interface Scheme {
  id: string;
  scheme_code: string;
  name: string;
  name_mr: string;
  description: string;
  description_mr: string;
  government_level: string;
  ministry: string | null;
  eligibility: Record<string, string>;
  benefits: string;
  benefits_mr: string;
  application_url: string | null;
  helpline: string | null;
}

interface SchemesClientProps {
  initialSchemes: Scheme[];
}

export default function SchemesClient({ initialSchemes }: SchemesClientProps) {
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'CENTRAL' | 'STATE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [locale, setLocale] = useState<'mr' | 'en'>('mr'); // Marathi first by default

  const filteredSchemes = initialSchemes.filter((s) => {
    // 1. Filter by level
    if (filterLevel !== 'ALL' && s.government_level !== filterLevel) {
      return false;
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q) || s.name_mr.toLowerCase().includes(q);
      const matchCode = s.scheme_code.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q) || s.description_mr.toLowerCase().includes(q);
      return matchName || matchCode || matchDesc;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-surface-container-lowest dark:bg-inverse-surface flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-surface dark:bg-surface-container-highest border-b border-outline-variant shadow-sm top-0 z-40 sticky">
        <div className="flex items-center justify-between h-[72px] px-md lg:px-lg max-w-container-max mx-auto w-full">
          <a className="flex items-center gap-sm" href="/">
            <img
              alt="Gram Panchayat Emblem"
              className="h-12 w-12 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwOt3btzGAHdEQqUYDDZKkpFf86hD13iuogwK5sJ6n1mHhFpvadD8fyKz3ofQitSvIvBCLiU2NPyoxgDk7RSvGKrf4kVNScPjE8n0G4SfDiAqxu12bjV7FyuoFMElaBCruoRSICbBWHnyOz2kn-Vy0sRzowqH1n3_IvlafFpvweNAkhbIMcTlmt59uiekLrgEFBfwmmIs3I1pEqxhL-hViuTS6SzNmg1mY_cD3-F7ILpzHTIINaSE"
            />
            <div className="flex flex-col">
              <span className="text-headline-md font-bold text-primary dark:text-primary-fixed-dim leading-none">ग्रामपंचायत</span>
              <span className="text-caption text-on-surface-variant mt-1">Schemes Directory (योजना)</span>
            </div>
          </a>
          
          <div className="flex items-center gap-sm">
            {/* Locale Toggle */}
            <button
              onClick={() => setLocale(locale === 'mr' ? 'en' : 'mr')}
              className="border border-primary text-primary hover:bg-primary/5 font-semibold py-1.5 px-4 rounded-full transition-all text-body-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">language</span>
              {locale === 'mr' ? 'English' : 'मराठी'}
            </button>
            <a
              className="border border-outline hover:bg-surface-container-high text-on-surface-variant font-label-md py-1.5 px-4 rounded-full transition-all text-body-sm flex items-center gap-1"
              href="/"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Home
            </a>
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      <main className="flex-grow max-w-container-max w-full mx-auto px-md lg:px-lg py-xl flex flex-col gap-6">
        {/* Search & Filter Section */}
        <div className="bg-surface dark:bg-surface-container-high border border-outline-variant rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-headline-lg font-bold text-on-surface">
                {locale === 'mr' ? 'सरकारी योजना आणि सेवा' : 'Government Welfare Schemes'}
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                {locale === 'mr' 
                  ? 'केंद्र आणि राज्य सरकारद्वारे राबवल्या जाणाऱ्या योजनांची यादी.' 
                  : 'Browse active Central and State welfare programs for citizens.'}
              </p>
            </div>
            {/* Level Selector */}
            <div className="flex bg-surface-container-high dark:bg-surface-container-lowest p-1 rounded-full border border-outline-variant/60 self-start md:self-center">
              <button
                onClick={() => setFilterLevel('ALL')}
                className={`py-2 px-5 rounded-full font-bold text-body-sm transition-all ${
                  filterLevel === 'ALL'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {locale === 'mr' ? 'सर्व योजना' : 'All Schemes'}
              </button>
              <button
                onClick={() => setFilterLevel('CENTRAL')}
                className={`py-2 px-5 rounded-full font-bold text-body-sm transition-all ${
                  filterLevel === 'CENTRAL'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {locale === 'mr' ? 'केंद्र सरकार' : 'Central Govt'}
              </button>
              <button
                onClick={() => setFilterLevel('STATE')}
                className={`py-2 px-5 rounded-full font-bold text-body-sm transition-all ${
                  filterLevel === 'STATE'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {locale === 'mr' ? 'राज्य सरकार' : 'State Govt'}
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'mr' ? 'योजनेचे नाव, कोड किंवा माहिती शोधा...' : 'Search by scheme name, code or details...'}
              className="w-full pl-12 pr-5 py-3 border border-outline rounded-xl bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
            />
          </div>
        </div>

        {/* Schemes Grid List */}
        {filteredSchemes.length === 0 ? (
          <div className="text-center py-16 bg-surface dark:bg-surface-container-high rounded-3xl border border-outline-variant/60 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant text-5xl">folder_off</span>
            <h3 className="text-headline-md font-bold text-on-surface">
              {locale === 'mr' ? 'कोणत्याही योजना आढळल्या नाहीत' : 'No Schemes Found'}
            </h3>
            <p className="text-body-md text-on-surface-variant max-w-sm">
              {locale === 'mr' 
                ? 'कृपया शोध संज्ञा तपासा किंवा वेगळा गट निवडा.' 
                : 'Try adjusting your search criteria or changing the filter settings.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-surface dark:bg-surface-container-high border border-outline-variant rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                {/* Government Level Badge */}
                <div className="absolute top-0 right-0 bg-primary/10 text-primary text-label-md font-bold px-4 py-1.5 rounded-bl-2xl">
                  {scheme.government_level === 'CENTRAL' 
                    ? (locale === 'mr' ? 'केंद्र सरकार योजना' : 'Central Scheme') 
                    : (locale === 'mr' ? 'राज्य सरकार योजना' : 'State Scheme')}
                </div>

                <div className="flex flex-col gap-3">
                  {/* Title & Code */}
                  <div>
                    <span className="text-primary text-caption font-bold font-mono uppercase tracking-wider block">
                      Code: {scheme.scheme_code}
                    </span>
                    <h3 className="text-headline-md font-bold text-on-surface mt-1 leading-tight pr-28">
                      {locale === 'mr' ? scheme.name_mr : scheme.name}
                    </h3>
                    {scheme.ministry && (
                      <span className="text-caption text-on-surface-variant block mt-1">
                        Ministry: {scheme.ministry}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {locale === 'mr' ? scheme.description_mr : scheme.description}
                  </p>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 gap-2 pt-2 border-t border-outline-variant/30">
                    {/* Benefits */}
                    <div>
                      <span className="font-bold text-body-sm text-on-surface block">
                        {locale === 'mr' ? 'Benefits (फायदे):' : 'Benefits:'}
                      </span>
                      <span className="text-body-sm text-on-surface-variant">
                        {locale === 'mr' ? scheme.benefits_mr : scheme.benefits}
                      </span>
                    </div>

                    {/* Eligibility details */}
                    {scheme.eligibility && Object.keys(scheme.eligibility).length > 0 && (
                      <div className="mt-1">
                        <span className="font-bold text-body-sm text-on-surface block">
                          {locale === 'mr' ? 'Eligibility (पात्रता):' : 'Eligibility:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {Object.entries(scheme.eligibility).map(([key, val]) => (
                            <span key={key} className="bg-surface-container-high dark:bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant text-[11px] font-semibold py-0.5 px-2.5 rounded-full">
                              {key}: {String(val)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4 mt-auto">
                  {scheme.helpline ? (
                    <span className="text-body-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                      Helpline: {scheme.helpline}
                    </span>
                  ) : (
                    <span></span>
                  )}

                  {scheme.application_url && (
                    <a
                      href={scheme.application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-primary hover:bg-primary-container text-on-primary font-bold py-2 px-6 rounded-full transition-all text-body-sm flex items-center gap-1.5 shadow-sm"
                    >
                      {locale === 'mr' ? 'अर्ज करा' : 'Apply Now'}
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
