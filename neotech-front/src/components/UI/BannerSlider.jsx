import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useGetBannersQuery } from '../../store/API';
import { useTranslation } from 'react-i18next';
import { translateDynamicField } from '../../i18n';

const BannerSlider = () => {
  const { i18n } = useTranslation();
  const { data: bannersD = [] } = useGetBannersQuery(); // 👈 Default to empty array to simplify checks
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [translatedBanners, setTranslatedBanners] = useState([]);

  // Autoplay Effect
  useEffect(() => {
    if (!isAutoPlaying || bannersD.length <= 1) return; // 👈 Don't loop if there is only 1 slide

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannersD.length);
    }, 4000); 

    return () => clearInterval(interval);
  }, [bannersD.length, isAutoPlaying]);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % bannersD.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + bannersD.length) % bannersD.length);

  // Fix mouse hover handlers (leave was accidentally setting autoplay to false)
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true); // 👈 Re-enable autoplay when mouse leaves!

  // Dynamic translation effect
  useEffect(() => {
    async function performTranslation() {
      if (!bannersD || bannersD.length === 0) return;
      
      const targetLang = i18n.language;
      if (targetLang === 'en') {
        const translated = await Promise.all(
          bannersD.map(async (banner) => ({
            ...banner,
            title: await translateDynamicField(banner.title || '', targetLang),
            description: await translateDynamicField(banner.description || '', targetLang),
            buttonText: await translateDynamicField(banner.buttonText || '', targetLang)
          }))
        );
        setTranslatedBanners(translated);
      } else {
        // Clear translated state if we are back to default language 
        // to prevent reference-trigger loops
        setTranslatedBanners([]); 
      }
    }
    performTranslation();
  }, [i18n.language, bannersD]);

  // Determine active data subset
  const activeBanners = translatedBanners.length > 0 ? translatedBanners : bannersD;

  if (!activeBanners || activeBanners.length === 0) return null;

  return (
    <div className='w-full h-full'>
      <div 
        className="w-full relative flex-1 overflow-hidden h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Banner Container */}
        <div 
          className="flex transition-transform duration-500 h-full w-full ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {activeBanners.map((banner, index) => (
            <div 
              onClick={() => banner.linkUrl && navigate(`${banner.linkUrl}`)} 
              key={banner.id || index} 
              className="w-full cursor-pointer flex-shrink-0 h-full relative"
            >
              {/* Desktop Image */}
              {/* <img 
                className="hidden md:block w-full h-full object-cover md:rounded-lg lg:p-2" 
                src={`${banner.imageUrl}`}
                alt={`Banner ${index + 1}`} 
                onError={(e) => {
                  e.target.onerror = null; // 👈 Prevent loop if missing asset logs 404
                  e.target.src = '/Icons/logo.svg';
                  e.target.className = 'hidden md:block w-[70%] h-[70%] mx-auto md:rounded-lg md:h-[40vh] lg:p-2';
                }}
              /> */}
              
              {/* Mobile Image */}
              {/* <img 
                className="block md:hidden w-full md:rounded-lg md:h-[40vh] lg:p-2" 
                src={banner.mobileImageUrl ? `${banner.mobileImageUrl}` : `${banner.imageUrl}`}
                alt={`Banner ${index + 1}`} 
                onError={(e) => {
                  e.target.onerror = null; // 👈 Prevent loop if missing asset logs 404
                  e.target.src = '/Icons/logo.svg';
                  e.target.className = 'block md:hidden w-[70%] h-[70%] mx-auto object-contain md:rounded-lg h-[26vh] md:h-[40vh] lg:p-2';
                }}
              /> */}
              
              <div className="absolute top-[13%] left-[8%] lg:left-[100px] lg:top-[13%] flex flex-col gap-9 max-w-[80%]">
                <div className='flex flex-col gap-5'>
                  {/* Small Screen Title */}
                  <h1 className={`${banner.titleVisible ? 'block' : 'hidden'} inter text-xl lg:text-3xl lg:hidden font-medium`}>
                    {(banner.title || "")
                      .split(" ")
                      .map((word, wordIdx) => (
                        <React.Fragment key={wordIdx}>
                          {word}{" "}
                          {(wordIdx + 1) % 3 === 0 && <br />}
                        </React.Fragment>
                      ))}
                  </h1>
                  
                  {/* Large Screen Title */}
                  <h1 className={`${banner.titleVisible ? 'block' : 'hidden'} hidden lg:block text-3xl font-semibold inter`}>
                    {(banner.title || "")
                      .split(" ")
                      .map((word, wordIdx) => (
                        <React.Fragment key={wordIdx}>
                          {word}{" "}
                          {(wordIdx + 1) % 3 === 0 && <br />}
                        </React.Fragment>
                      ))}
                  </h1>

                  <p className={`${banner.descriptionVisible ? 'block' : 'hidden'} hidden md:block text-xl inter`}>
                    {(banner.description || "")
                      .split(" ")
                      .map((word, wordIdx) => (
                        <React.Fragment key={wordIdx}>
                          {word}{" "}
                          {(wordIdx + 1) % 5 === 0 && <br />}
                        </React.Fragment>
                      ))}
                  </p>
                </div>
                
                {banner.buttonText && (
                  <Link 
                    to={`${banner.linkUrl}`}
                    className={`px-7 py-3 lg:py-3 rounded-lg ${!banner.buttonVisible && 'hidden'} text-sm inter lg:text-lg bg-gradient-to-b from-[#FD1206] to-[#DD1205] transition text-white font-medium w-fit hover:shadow-lg transform hover:scale-105`}
                  >
                    {banner.buttonText}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Elements */}
        {bannersD.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="hidden lg:block cursor-pointer absolute top-1/2 left-8 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="hidden lg:block absolute top-1/2 right-8 cursor-pointer transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {bannersD.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    currentSlide === index 
                      ? 'bg-white shadow-lg scale-110' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BannerSlider;