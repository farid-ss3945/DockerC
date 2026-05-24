import { ArrowRight } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router';
import InfiniteBrandSlider from '../../components/UI/BrandSlider';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/SEO/SEO';

const About = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const software = useRef(null);
  const secure = useRef(null);

  // Make left one match right one's height
  useEffect(() => {
    if (software.current && secure.current) {
      const softwareHeight = software.current.offsetHeight;
      secure.current.style.height = `${softwareHeight}px`;
    }
  }, []);
  return (
    <>
      <SEO
        title="About Us - NeoTech Electronics"
        description="Learn about NeoTech Electronics - your trusted partner for premium electronics in Azerbaijan. We offer quality products, excellent service, and innovative solutions including HEMPOS software installation."
        keywords="about NeoTech, electronics store Azerbaijan, hempos, NeoTech electronics, company information"
        image="/Icons/logo.svg"
        type="website"
      />
      <section className='bg-[#F7FAFC] pt-5 inter'>
        <div className='flex flex-col p-12 md:p-7 md:pb-13 bg-white border-1 md:gap-10  md:max-w-[90vw] md:mx-auto md:rounded-lg border-[#dee2e6] md:flex-row'>

            <div className="relative md:order-2 md:flex-3">
              <img className="rounded-lg w-full md:hidden" src="/Banners/aboutBanner.svg" alt="" />
              <img className="rounded-lg  hidden md:block min-h-[250px] w-full object-cover" src="/Banners/aboutBannerDesk.svg" alt="" />

              <div className="absolute left-[-6%] md:left-[-10%] bottom-[-6%] md:bottom-[-5%] md:min-w-[270px]  md:text-[11px] text-white rounded-lg 
              border max-w-[280px] border-[#818686] bg-transparent backdrop-blur-[29px] p-4 w-[66%] md:w-[70%]  lg:text-[12px]   text-[6px] [@media(min-width:350px)]:text-[7px] [@media(min-width:360px)]:text-[8px] [@media(min-width:420px)]:text-[9px] [@media(min-width:460px)]:text-[11px] inter">
                <p >
                 {t('about.missionStatement')}
                </p>
              </div>
            </div>


            <div className='mt-15 md:mt-0 text-center flex flex-col md:flex-4 md:items-start md:text-start items-center md:order-1'>
                <h1 className='text-2xl font-semibold mb-4 '>{t('about.whoWeAre')}</h1>
                <span
                  className={`text-[#505050] md:line-clamp-none md:text-sm lg:text-lg max-w-[550px] ${expanded ? "" : "line-clamp-4 "}`}
                >
                {t('about.companyDescription')}
                </span>
            
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[#4F46E5] ml-1 font-medium md:hidden"
                >
                  {expanded ? t('about.less') : t('about.more')}
                </button>
            </div>
            

            
        </div>

         <section className="md:mt-12   md:max-w-[90vw] md:mx-auto lg:mx-auto">
          <InfiniteBrandSlider />
        </section>


        <div className='flex flex-col md:grid lg:flex lg:flex-row md:grid-cols-2 gap-4 max-w-[90vw] mx-auto mt-8'>
            <div className='flex flex-1 bg-white rounded-lg border-2 border-[#dee2e6] p-5 py-7 md:py-3 md:min-h-[140px]'>
                <img className='mr-7 ml-2 md:mr-3  md:w-[55px] md:h-[55px] md:object-contain shrink-0  md:self-center' src="/Icons/about1.svg" alt="" />

                <div className='flex flex-col justify-center  items-center'>
                    <h1 className='text-md font-semibold self-start '>{t('about.whoWeAreTitle')}</h1>
                    <p className='text-[#505050] text-xs md:text-base'>{t('about.whoWeAreDesc')}</p>
                </div>

            </div>

            <div className='flex flex-1  bg-white rounded-lg border-2 border-[#dee2e6] p-5 py-7 md:py-3 md:min-h-[140px]'>
                <img className='mr-7 md:mr-3  md:w-[55px] shrink-0 md:self-center' src="/Icons/about2.svg" alt="" />

                <div className='flex flex-col justify-center items-center'>
                    <h1 className='text-md font-semibold self-start'>{t('about.whatWeDo')}</h1>
                    <p className='text-[#505050] text-xs md:text-base'>{t('about.whatWeDoDesc')}</p>
                </div>

            </div>

            <div className='flex flex-1  bg-white rounded-lg border-2 border-[#dee2e6] p-5 py-7 md:py-3 md:min-h-[140px]'>
                <img className='mr-7 md:mr-3  md:w-[55px] shrink-0 md:self-center' src="/Icons/about3.svg" alt="" />

                <div className='flex flex-col justify-center items-center'>
                    <h1 className='text-md font-semibold self-start'>{t('about.ourMission')}</h1>
                    <p className='text-[#505050] text-xs md:text-base'>{t('about.ourMissionDesc')}</p>
                </div>

            </div>
        </div>
        <div className="pb-10 pt-18 max-w-[90vw] mx-auto text-2xl font-semibold">
          <h1>{t('about.extraServices')}</h1>
        </div>
            
        <div className="max-w-[90vw] mx-auto pb-25 flex flex-col md:flex-row md:gap-4">
          <Link
          ref={secure}
          to="/secure"
          className="flex-1 h-fit cursor-pointer bg-white rounded-lg border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-400"
        >
          <img
            className="w-full rounded-t-md h-[190px] lg:h-[220px] object-cover"
            src="./deals/security-system-monitoring.jpg"
            alt=""
          />
          <div className="relative bg-white p-5 pb-4 ">
            <h1 className="font-semibold text-xl">{t('about.securitySystems')}</h1>
            <p className="text-[#505050] text-sm mt-3 font-medium">
              {t('about.securitySystemsDesc')}
            </p>
          </div>
          <div className="bg-white p-7 pt-0 flex justify-end rounded-b-lg">
            <button className="flex self-end cursor-pointer items-center gap-4 border-1 border-[#dee2e6] rounded-full p-3 py-2">
              {t('about.learnMore')}
              <div className="p-1 bg-[#FF4B43] rounded-full ">
                <ArrowRight size={18} color="white" />
              </div>
            </button>
          </div>
          </Link>
            
          <Link
            ref={software}
            to="/software"
            className="flex-1 bg-white rounded-lg border-2 mt-4 md:mt-0 border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-400"
          >
            <img
              className="w-full rounded-t-md h-[190px] lg:h-[220px] object-contain p-4"
              src="./deals/hem.png"
              alt=""
            />
            <div className="relative bg-white p-5 pb-4 ">
              <h1 className="font-semibold text-xl">
                {t('about.hemsoftInstallation')}
              </h1>
              <p className="text-[#505050] text-sm mt-3 font-medium">
                {t('about.hemsoftDesc')}
              </p>
            </div>
            <div className="bg-white p-7 pt-0 flex justify-end rounded-b-lg">
              <button className="flex cursor-pointer self-end items-center gap-4 border-1 border-[#dee2e6] rounded-full p-3 py-2">
                {t('about.learnMore')}
                <div className="p-1 bg-[#FF4B43] rounded-full ">
                  <ArrowRight size={18} color="white" />
                </div>
              </button>
            </div>
          </Link>
        </div>

    </section>
    </>
  )
}

export default About

