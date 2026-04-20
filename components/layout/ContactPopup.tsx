"use client";

import Image from "next/image";
import { useState } from "react";

const contactItems = [
  {
    href: "tel:0973074063",
    label: "Hotline: 0973 074 063",
    iconSrc: "/images/phone-call.png",
    iconAlt: "Hotline",
    iconClassName: "bg-red-600",
    external: false
  },
  {
    href: "https://m.me/947058711834583",
    label: "Tư vấn Messenger",
    iconSrc: "/images/messenger.png",
    iconAlt: "Messenger",
    iconClassName: "bg-blue-500",
    external: true
  },
  {
    href: "https://zalo.me/0973074063",
    label: "Tư vấn Zalo",
    customText: "Zalo",
    iconClassName: "bg-blue-400",
    external: true
  },
  {
    href: "mailto:contact@greenmarket.com",
    label: "Email hỗ trợ",
    iconSrc: "/images/mail.png",
    iconAlt: "Email",
    iconClassName: "bg-cyan-400",
    external: true
  }
];

export default function ContactPopup() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed bottom-24 right-6 z-[90] flex flex-col items-end">
      <div
        className={`absolute bottom-full right-0 mb-3 w-52 origin-bottom-right rounded-lg border border-gray-100 bg-white shadow-xl transition-all duration-300 ease-out ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
      >
        <ul className="flex flex-col text-gray-600">
          {contactItems.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === contactItems.length - 1;

            return (
              <li key={item.href} className={!isLast ? "border-b border-gray-50" : undefined}>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className={`flex items-center px-3 py-2.5 transition-colors hover:bg-gray-50 ${isFirst ? "rounded-t-lg" : ""} ${isLast ? "rounded-b-lg" : ""}`}
                >
                  <div className={`mr-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${item.iconClassName}`}>
                    {item.iconSrc ? (
                      <Image src={item.iconSrc} alt={item.iconAlt || item.label} width={18} height={18} />
                    ) : (
                      <span className="text-[10px] font-bold tracking-tight text-white">{item.customText}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="pointer-events-auto relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#164e87] text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-[#113d69] focus:outline-none"
        aria-expanded={isOpen}
        aria-label="Liên hệ"
      >
        {isOpen ? (
          <span className="text-lg font-semibold">×</span>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Image src="/images/chat.png" alt="Liên hệ" width={18} height={18} />
            <span className="text-[9px] font-semibold leading-none">Liên hệ</span>
          </div>
        )}
      </button>
    </div>
  );
}
