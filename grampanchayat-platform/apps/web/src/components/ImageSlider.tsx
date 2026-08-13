/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

export interface SlideItem {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

interface ImageSliderProps {
  slides?: SlideItem[];
  autoPlayInterval?: number;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    src: '/slide1.png',
    alt: 'Gram Panchayat Portal Banner 1',
    title: 'Gram Panchayat Digital Portal',
    subtitle: 'Transparent Local Governance & Public Services'
  },
  {
    src: '/slide2.png',
    alt: 'Gram Panchayat Portal Banner 2',
    title: 'Sustainable Rural Agriculture',
    subtitle: 'Solar irrigation, soil health cards & farmer support'
  },
  {
    src: '/slide3.png',
    alt: 'Gram Panchayat Portal Banner 3',
    title: 'Clean & Smart Village Streets',
    subtitle: 'Swachh Bharat initiative, solar lights & paved roads'
  },
  {
    src: '/slide4.png',
    alt: 'Gram Panchayat Portal Banner 4',
    title: 'Digital E-Governance Services',
    subtitle: 'Grievances, Certificates, Asset Booking, and Bill Payments'
  }
];

export default function ImageSlider({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 5000
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      goToNext();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [goToNext, isPaused, autoPlayInterval, slides.length]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Tap Right / Left on Image handler
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // If clicked on the right half, go to next. If left half, go to prev.
    if (clickX > width / 2) {
      goToNext();
    } else {
      goToPrev();
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden select-none group rounded-2xl border border-outline-variant shadow-lg bg-black/5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Viewport */}
      <div
        className="relative w-full h-[400px] sm:h-[500px] lg:h-[550px] cursor-pointer"
        onClick={handleImageClick}
      >
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Image */}
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if user's image is not found yet
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.fallbackTried) {
                    target.dataset.fallbackTried = 'true';
                    target.src = '/village_hero.png';
                  }
                }}
              />

              {/* Gradient Overlay & Text Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white">
                {slide.title && (
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-md mb-2">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="text-sm sm:text-lg lg:text-xl font-medium text-gray-200 drop-shadow-sm max-w-3xl">
                    {slide.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Tap area indicator tooltips */}
        <div className="absolute inset-y-0 right-0 w-1/4 z-20 flex items-center justify-end pr-4 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none">
          <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
            Tap Right Next <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </span>
        </div>
        <div className="absolute inset-y-0 left-0 w-1/4 z-20 flex items-center justify-start pl-4 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none">
          <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
            <span className="material-symbols-outlined text-[16px]">chevron_left</span> Tap Left Prev
          </span>
        </div>
      </div>

      {/* Left Arrow Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goToPrev();
        }}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-md border border-white/20 shadow-md hover:scale-110"
      >
        <span className="material-symbols-outlined text-3xl">chevron_left</span>
      </button>

      {/* Right Arrow Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-md border border-white/20 shadow-md hover:scale-110"
      >
        <span className="material-symbols-outlined text-3xl">chevron_right</span>
      </button>

      {/* Slide Counter Badge */}
      <div className="absolute top-4 right-4 z-30 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">
        {currentIndex + 1} / {slides.length}
      </div>

      {/* Pagination Indicators (Dots) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-8 h-2.5 bg-primary'
                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/90'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
