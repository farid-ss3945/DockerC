import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router';
import icons from '../../../public/Icons/icons.jpg';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const Footer = () => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(i18next.language || 'ru');
    const dropdownRef = useRef(null);
    const { t } = useTranslation();
    
    const languages = [
        {
            name: "Russian",
            value: "ru",
            flag: "./Icons/ru-flag.svg"
        },
        {
            name: "English",
            value: "en",
            flag: "./Icons/usa-flag.svg"
        },
        {
            name: "Azerbaijan",
            value: "az",
            flag: "./Icons/az-flag.svg"
        }
    ];

    // Sync with i18next language changes
    useEffect(() => {
        const handleLanguageChange = (lng) => {
            setSelected(lng);
            // Store in cookie for persistence
            document.cookie = `language=${lng}; path=/; max-age=31536000`; // 1 year
        };

        i18next.on('languageChanged', handleLanguageChange);
        
        return () => {
            i18next.off('languageChanged', handleLanguageChange);
        };
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const handleLanguageChange = (langValue) => {
        setSelected(langValue);
        i18next.changeLanguage(langValue);
        document.cookie = `language=${langValue}; path=/; max-age=31536000`; // Store for 1 year
        setOpen(false);
    };

    const currentLanguage = languages.find(lang => lang.value === selected) || languages[0];

    return (
        <>
            <footer className='p-10 inter pb-0 '>
                <div className='bg-white flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start'>
                    <div>
                        <div className="font-bold text-4xl tracking-tighter text-gray-900 mb-6 mt-2">
                           Neo<span className="text-[#4F46E5]">Tech</span>
                        </div>
                        <p className='text-lg mt-5 text-gray-600'>{t("footer.desc1")} </p>
                        <p className='text-lg text-gray-600'>{t("footer.desc2")}  </p>
                        <p className='text-lg mb-5 text-gray-600'>{t("footer.desc3")}</p>
                    </div>
                    
                    <div className='flex justify-between  mt-15 lg:hidden'>
                        <div>
                            <h1 className='font-semibold text-xl text-[#1C1C1C]'>{t("footer.mainPages")}</h1>
                            <div className='text-[#8B96A5] flex flex-col gap-1 mt-3'>
                                <Link to='/'>{t("footer.home")}</Link>
                                <Link to='/download'>{t("footer.download")}</Link>
                                <Link to='/brands'>{t("admin.brands")}</Link>
                            </div>
                        </div>
                        <div>
                            <h1 className='font-semibold text-xl text-[#1C1C1C]'>{t("footer.auth")}</h1>
                            <div className='text-[#8B96A5] flex flex-col gap-1 mt-3'>
                                <Link to='/login'>{t("footer.login")}</Link>
                            </div>
                        </div>
                    </div>

                    <div className='hidden lg:block'>
                        <h1 className='font-semibold text-xl text-[#1C1C1C]'>{t("footer.mainPages")}</h1>
                        <div className='text-[#8B96A5] flex flex-col gap-1 mt-3'>
                            <Link to='/'>{t("footer.home")}</Link>
                            <Link to='/download'>{t("footer.download")}</Link>
                            <Link to='/brands'>{t("admin.brands")}</Link>
                        </div>
                    </div>

                    <div className='hidden lg:block'>
                        <h1 className='font-semibold text-xl text-[#1C1C1C]'>{t("footer.auth")}</h1>
                        <div className='text-[#8B96A5] flex flex-col gap-1 mt-3'>
                            <Link to="/login">{t("footer.login")}</Link >
                        </div>
                    </div>

                    <div className='mt-15 lg:mt-0 flex flex-col gap-2'>
                        <h1 className='font-semibold text-xl text-[#1C1C1C]'>{t("footer.contactUs")}</h1>

                        <div className='flex gap-2'>
                            <img className='w-[23px]' src="./Icons/footer-phone.svg" alt="" />
                            <p className='font-semibold text-md text-[#1C1C1C]'>+994702971707</p>
                        </div>
                    </div>
                </div>
            </footer>

            <div className='mt-4 border-t-1 border-[#DCDCDC] p-4 pl-10 lg:flex lg:px-30 lg:justify-between lg:border-[#DEE2E7] lg:bg-[#EFF2F4] lg:mt-8'>
                <p>&#169; {new Date().getFullYear()} neotech.az</p>
                <div className='cursor-pointer relative'>
                    <div 
                        onClick={() => setOpen(prev => !prev)} 
                        className='hidden lg:flex gap-1 items-center hover:opacity-80 transition-opacity'
                    >
                        <img src={currentLanguage.flag} alt="" className="w-5 h-4" />
                        <p>{currentLanguage.name}</p>
                        <img 
                            src="./Icons/arrow-up.svg" 
                            alt="" 
                            className={`transition-transform duration-200 ${open ? '' : 'rotate-180'}`}
                        />
                    </div>
                    
                    {open && (
                        <div 
                            ref={dropdownRef} 
                            className="absolute flex flex-col bottom-full gap-1 mb-1 right-0 bg-white border-[1.5px] border-black rounded-sm p-1 min-w-max z-10"
                        >
                            {languages.filter(lang => lang.value !== selected).map(lang => (
                                <div 
                                    key={lang.value}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleLanguageChange(lang.value)}
                                >
                                    <img src={lang.flag} alt={`${lang.name} flag`} className="w-5 h-4" />
                                    <span className="text-gray-700 inter text-sm lg:text-base">{lang.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Footer
