import { ArrowRight } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import BranchesSection from './BranchSelection';
import SEO from '../../components/SEO/SEO';

const Contact = () => {
    const { t } = useTranslation();
    const [isSwapped, setIsSwapped] = useState(false);

    const handleBranchClick = () => {
      setIsSwapped(!isSwapped);
    };
  return (
    <>
      <SEO
        title="Contact Us - NeoTech Electronics"
        description="Get in touch with NeoTech Electronics. Visit our branches in Azerbaijan or contact us via phone, email, or social media. We're here to help with all your electronics needs."
        keywords="contact NeoTech, electronics store contact, Azerbaijan electronics, NeoTech phone, NeoTech email"
        image="/Icons/logo.svg"
        type="website"
      />
      <section className='bg-[#f7fafc] pt-10 inter min-h-screen'>
        <div className='bg-white md:max-w-[80vw] mx-auto md:rounded-lg border-1 border-[#dee2e6]'>
            
            <div className='border-1 border-[#dee2e6] text-2xl font-bold text-center py-5 md:rounded-t-lg md:border-0 md:text-start md:p-9'>
                <h1>{t('contact.contactUs')}</h1>
            </div>
            <div className='border-b-1 md:border-0 border-[#dee2e6] md:flex justify-between'>
                <div className='flex p-9 md:pt-0 gap-3 flex-col text-md whitespace-nowrap font-semibold'>
                    <div className='flex items-center gap-4'>
                        <img className = 'w-8 shrink-0' src="./Icons/phone.svg" alt="" />
                        <p className='text-sm'>{t('contact.phoneNumber')}: +994702971707</p>
                    </div>

                    <div className='flex items-center gap-4'>
                        <img className = 'w-8' src="./Icons/email-icon.svg" alt="" />
                        <p className='text-sm'>{t('contact.email')}: Ä°nfo@neotech.az</p>
                    </div>

                </div>
                

            </div>

        </div>

        <BranchesSection />



    </section>
    </>
)
}

export default Contact

