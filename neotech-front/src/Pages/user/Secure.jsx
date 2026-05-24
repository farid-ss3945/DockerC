import React from 'react'
import { Breadcrumb } from '../../products/Breadcrumb'
import { useTranslation } from 'react-i18next';
const Secure = () => {
  const { t } = useTranslation();

   const contactWp = () => {
      const url = `https://hemsoft.az`;
    
      window.open(url, "_blank");
    };
  return (
    <section className='bg-[#f7fafc]  inter pt-4'>
        <div className='hidden md:block md:max-w-[80vw] mx-auto'>
            <Breadcrumb />
        </div>
        
        <div className='bg-white p-5 border-1 border-[#dee2e6] flex flex-col md:flex-row md:gap-4 md:max-w-[85vw] lg:max-w-[75vw] mx-auto md:mt-8 md:rounded-lg md:shadow-md lg:p-8 lg:gap-5'>
            <div className='md:hidden'>
                <Breadcrumb  />
            </div>
            

            <div className='max-w-[80vw] lg:max-h-[30vh] mt-9 md:mt-0  mx-auto rounded-xl md:flex-3 lg:flex-5'>
                <img className='rounded-xl aspect-[7/6] md:aspect-[5/4]  object-cover md:h-full lg:max-h-[280px] lg:w-full ' src="./Banners/aboutExtra.svg" alt="" />
            </div>

            <div className='text-center my-7 md:my-0 flex flex-col gap-3 md:flex-8 md:text-start   [@media(min-width:1100px)]:p-7'>
                <h1 className='font-semibold text-xl lg:text-2xl'>{t('secure.smartPosTitle')}</h1>
                <p className='max-w-[83vw] mx-auto text-[#505050] md:text-sm md:mb-4  lg:text-lg'>{t('secure.hemsoftDesc')}</p>
                <button onClick={() => {contactWp()}} className=' py-4 my-4 cursor-pointer bg-gradient-to-b from-[#FF1206] to-[#D91205] rounded-lg mx-3 text-white md:w-fit md:py-3 md:text-sm md:px-7 md:mx-0'>{t('secure.checkoutHemsoft')}</button>
            </div>
        </div>

        <div className='max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] md:mt-10 mx-auto pb-25'>
            <div className='py-6 pt-8 text-center '>
                <h1 className='text-xl font-semibold'>{t('secure.ourServices')}</h1>
                <p className='text-[#505050]  max-w-[50vw] mx-auto mt-3'>{t('secure.ourServicesDesc')}</p>
            </div>
            <div className='flex flex-col gap-5 max-w-[90vw] mx-auto md:grid md:grid-cols-2 [@media(min-width:1100px)]:flex lg:flex-row'>
                <div className='relative bg-white border-1 border-[#dee2e6] p-7 pt-19 rounded-lg'>
                    <img className='absolute top-4 right-4 bg-[#ff4b43] p-3 rounded-full' src="./Icons/service-1-1.svg" alt="" />
                    <h1 className='font-semibold text-lg'>{t('secure.fastInstallation')}</h1>
                    <p className='text-md text-[#7D7D7D] font-medium max-w-[84%]'>{t('secure.fastInstallationDesc')}</p>
                </div>

                <div className='relative bg-white border-1 border-[#dee2e6] p-7 pt-19 rounded-lg'>
                    <img className='absolute top-4 right-4 bg-[#ff4b43] p-3 rounded-full' src="./Icons/service-1-2.svg" alt="" />
                    <h1 className='font-semibold text-lg'>{t('secure.customizedSetup')}</h1>
                    <p className='text-md text-[#7D7D7D] font-medium max-w-[84%]'>{t('secure.customizedSetupDesc')}</p>
                </div>

                <div className='relative bg-white border-1 border-[#dee2e6] p-7 pt-19 rounded-lg'>
                    <img className='absolute top-4 right-4 bg-[#ff4b43] p-3 rounded-full' src="./Icons/service-1-3.svg" alt="" />
                    <h1 className='font-semibold text-lg'>{t('secure.staffTraining')}</h1>
                    <p className='text-md text-[#7D7D7D] font-medium max-w-[84%]'>{t('secure.staffTrainingDesc')}</p>
                </div>

                <div className='relative bg-white border-1 border-[#dee2e6] p-7 pt-19 rounded-lg'>
                    <img className='absolute top-4 right-4 bg-[#ff4b43] p-3 rounded-full' src="./Icons/service-1-4.svg" alt="" />
                    <h1 className='font-semibold text-lg'>{t('secure.continuousAssistance')}</h1>
                    <p className='text-md text-[#7D7D7D] font-medium max-w-[84%]'>{t('secure.continuousAssistanceDesc')}</p>
                </div>
            </div>
            
        </div>


    </section>
  )
}

export default Secure
