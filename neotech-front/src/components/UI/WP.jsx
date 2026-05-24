import React, { useState, useEffect } from "react";

const WhatsAppIcon = () => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.body.offsetHeight;

      // If user is near the bottom (100px threshold)
      if (scrollTop + windowHeight >= docHeight - 100) {
        setOpacity(0.3); // fade out
      } else {
        setOpacity(1); // full opacity
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <a
      className="p-4 lg:p-5 bg-white border-1 border-[#d7d7d7] fixed bottom-5 right-5 z-[999] rounded-full shadow-sm transition-opacity duration-500"
      href="https://wa.me/+994702971707"
      target="_blank"
      rel="noopener noreferrer"
      style={{ opacity }}
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
        alt="WhatsApp"
        className="w-[40px] h-[40px] md:w-[45px] md:h-[45px] lg:w-[50px] lg:h-[50px]"
      />
    </a>
  );
};

export default WhatsAppIcon;
