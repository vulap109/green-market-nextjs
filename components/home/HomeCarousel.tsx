"use client";

import Image from "next/image";
import type { FormEvent, TouchEvent } from "react";
import { useEffect, useState } from "react";
import { getEmailJsBrowser } from "@/lib/emailjs-browser";
import {
  buildConsultationEmailTemplateParams,
  EMAILJS_CONSULTATION_TEMPLATE_ID,
  EMAILJS_SERVICE_ID
} from "@/lib/order";

type Slide = {
  desktopSrc: string;
  mobileSrc: string;
  productName: string;
  title: string;
};

type ConsultationState = {
  message: string;
  name: string;
  phone: string;
  submittedName: string;
  submittedPhone: string;
};

const AUTO_ADVANCE_MS = 5000;
const SWIPE_THRESHOLD = 48;

const slides: Slide[] = [
  {
    desktopSrc: "/images/cover-trao-yeu-thuong-large.jpg",
    mobileSrc: "/images/cover-trao-yeu-thuong-mb.jpg",
    productName: "Giỏ Quà Trao Yêu Thương",
    title: "Giỏ Quà Trao Yêu Thương"
  },
  {
    desktopSrc: "/images/cover-kinh-vieng-large.jpg",
    mobileSrc: "/images/cover-kinh-vieng-mb.jpg",
    productName: "Giỏ Quà Kính Viếng",
    title: "Giỏ Quà Kính Viếng"
  },
  {
    desktopSrc: "/images/cover-tuoi-ngon-large.jpg",
    mobileSrc: "/images/cover-tuoi-ngon-mb.jpg",
    productName: "Giỏ Quà Tươi Ngon",
    title: "Giỏ Quà Tươi Ngon"
  }
];

const defaultConsultationState: ConsultationState = {
  message: "",
  name: "",
  phone: "",
  submittedName: "",
  submittedPhone: ""
};

function getConsultationMessage(productName: string): string {
  return productName ? `Tôi muốn tư vấn về sản phẩm: ${productName}` : "";
}

function getNextIndex(currentIndex: number, direction: 1 | -1): number {
  return (currentIndex + direction + slides.length) % slides.length;
}

export default function HomeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingConsultation, setIsSubmittingConsultation] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [consultationError, setConsultationError] = useState("");
  const [consultation, setConsultation] = useState<ConsultationState>(defaultConsultationState);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex((value) => getNextIndex(value, 1));
    }, AUTO_ADVANCE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [currentIndex]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isModalOpen]);

  function openConsultation(productName: string) {
    setConsultation({
      ...defaultConsultationState,
      message: getConsultationMessage(productName)
    });
    setConsultationError("");
    setIsSubmitSuccess(false);
    setIsModalOpen(true);
  }

  function closeConsultation() {
    setIsModalOpen(false);
  }

  function goToSlide(index: number) {
    setCurrentIndex(index);
  }

  function moveSlide(direction: 1 | -1) {
    setCurrentIndex((value) => getNextIndex(value, direction));
  }

  async function handleConsultationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = consultation.name.trim();
    const phone = consultation.phone.trim();
    const message = consultation.message.trim();

    if (!name || !phone) {
      return;
    }

    try {
      setIsSubmittingConsultation(true);
      setConsultationError("");

      const emailjs = await getEmailJsBrowser();
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_CONSULTATION_TEMPLATE_ID,
        buildConsultationEmailTemplateParams({
          message,
          name,
          phone
        })
      );

      setConsultation((currentValue) => ({
        ...currentValue,
        submittedName: name,
        submittedPhone: phone,
        name: "",
        phone: "",
        message
      }));
      setIsSubmitSuccess(true);
    } catch (error) {
      console.error("consultation submit error:", error);
      setConsultationError(
        "Gửi thông tin thất bại. Vui lòng thử lại sau ít phút hoặc liên hệ hotline để được hỗ trợ."
      );
    } finally {
      setIsSubmittingConsultation(false);
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchEndX - touchStartX;
    setTouchStartX(null);

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return;
    }

    moveSlide(deltaX > 0 ? -1 : 1);
  }

  return (
    <>
      <section className="relative w-full overflow-hidden bg-[#f4f7f2]">
        <div
          className="carousel"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-roledescription="carousel"
          aria-label="Bộ sưu tập nổi bật Green Market"
        >
          <div
            className="carousel-inner"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide) => (
              <button
                key={slide.desktopSrc}
                type="button"
                className="carousel-item"
                title={slide.title}
                onClick={() => openConsultation(slide.productName)}
              >
                <span className="sr-only">{slide.title}</span>
                <span className="block md:hidden">
                  <Image
                    src={slide.mobileSrc}
                    alt={slide.title}
                    width={400}
                    height={400}
                    priority={slide === slides[0]}
                    sizes="100vw"
                    className="h-auto w-full select-none"
                  />
                </span>
                <span className="hidden md:block">
                  <Image
                    src={slide.desktopSrc}
                    alt={slide.title}
                    width={1911}
                    height={553}
                    priority={slide === slides[0]}
                    sizes="100vw"
                    className="h-auto w-full select-none"
                  />
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="carousel-control control-prev"
            onClick={() => moveSlide(-1)}
            aria-label="Ảnh trước"
          >
            <i className="fa-solid fa-chevron-left text-sm" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="carousel-control control-next"
            onClick={() => moveSlide(1)}
            aria-label="Ảnh tiếp theo"
          >
            <i className="fa-solid fa-chevron-right text-sm" aria-hidden="true" />
          </button>

          <div className="carousel-indicators" role="tablist" aria-label="Chọn slide">
            {slides.map((slide, index) => (
              <button
                key={slide.desktopSrc}
                type="button"
                className={`carousel-indicator ${index === currentIndex ? "active" : ""}`}
                aria-label={`Chuyển đến ${slide.title}`}
                aria-pressed={index === currentIndex}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeConsultation}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white transition hover:bg-red-500"
              aria-label="Đóng tư vấn"
            >
              <i className="fa-solid fa-xmark text-sm" aria-hidden="true" />
            </button>

            <div className="bg-primary p-8 text-center text-white">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <i className="fa-solid fa-seedling text-4xl" aria-hidden="true" />
              </div>
              <h2 className="serif text-2xl font-bold uppercase tracking-[0.28em]">Nhận Tư Vấn</h2>
              <p className="mt-2 text-xs font-medium text-white/90">
                Để lại thông tin, chúng tôi sẽ gọi lại ngay.
              </p>
            </div>

            {isSubmitSuccess ? (
              <div className="space-y-5 p-8">
                <div className="rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-sm leading-7 text-gray-700">
                  <p className="font-bold text-primary">Gửi thành công</p>
                  <p className="mt-2">
                    Cảm ơn <strong>{consultation.submittedName}</strong>. Green Market sẽ liên hệ qua số{" "}
                    <strong>{consultation.submittedPhone}</strong> trong ít phút tới để tư vấn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeConsultation}
                  className="w-full rounded-xl bg-[#c48e58] py-4 text-sm font-black uppercase tracking-[0.24em] text-white transition hover:bg-black"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <form className="space-y-5 p-8" onSubmit={handleConsultationSubmit} aria-busy={isSubmittingConsultation}>
                {consultationError ? (
                  <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
                    {consultationError}
                  </p>
                ) : null}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmittingConsultation}
                    value={consultation.name}
                    onChange={(event) =>
                      setConsultation((currentValue) => ({
                        ...currentValue,
                        name: event.target.value
                      }))
                    }
                    placeholder="Nhập tên của bạn..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Số điện thoại (Zalo) *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10,11}"
                    disabled={isSubmittingConsultation}
                    value={consultation.phone}
                    onChange={(event) =>
                      setConsultation((currentValue) => ({
                        ...currentValue,
                        phone: event.target.value
                      }))
                    }
                    placeholder="Ví dụ: 0973074063"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Lời nhắn (Không bắt buộc)
                  </label>
                  <textarea
                    rows={3}
                    disabled={isSubmittingConsultation}
                    value={consultation.message}
                    onChange={(event) =>
                      setConsultation((currentValue) => ({
                        ...currentValue,
                        message: event.target.value
                      }))
                    }
                    placeholder="Sản phẩm bạn đang quan tâm..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingConsultation}
                  className="mt-4 w-full rounded-xl bg-[#c48e58] py-4 text-sm font-black uppercase tracking-[0.24em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingConsultation ? "Đang gửi..." : "Gửi thông tin"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
