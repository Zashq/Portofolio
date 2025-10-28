document.addEventListener("DOMContentLoaded", () => {
  // ===== Scroll reveal animation =====
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  document
    .querySelectorAll(".cv-section, .profile-card")
    .forEach((section) => {
      observer.observe(section);
    });

  // ===== Certificates slider =====
// certificates slider scroll arrows
const sliderEl = document.querySelector(".certificates-slider");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

function scrollByAmount(dir) {
  const amount = 320; // pixels to scroll per click ~1 card
  sliderEl.scrollBy({
    left: dir * amount,
    behavior: "smooth",
  });
}

prevBtn.addEventListener("click", () => scrollByAmount(-1));
nextBtn.addEventListener("click", () => scrollByAmount(1));


  // ===== Modal / Contact form =====
  const modal = document.getElementById("contactModal");
  const openBtn = document.getElementById("openContactModal");
  const closeBtn = document.getElementById("closeModal");

  openBtn.addEventListener("click", () => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // ===== Contact form submit =====
  const form = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  const formMessage = document.getElementById("formMessage");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // reCAPTCHA check
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
      showMessage("Please complete the CAPTCHA!", "error");
      return;
    }

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      subject: document.getElementById("subject").value,
      message: document.getElementById("message").value,
      recaptcha: recaptchaResponse,
    };

    // disable button
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    setTimeout(() => {
      console.log("Form data:", formData);

      showMessage(
        "Thank you for your message! I'll get back to you soon.",
        "success"
      );

      form.reset();
      grecaptcha.reset();

      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";

      setTimeout(() => {
        closeModal();
        formMessage.style.display = "none";
      }, 2000);
    }, 1500);
  });

  function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;

    // auto-hide after 5s
    setTimeout(() => {
      formMessage.style.display = "none";
    }, 5000);
  }

  
  // ===== Certificate image modal =====
  const imgModal = document.getElementById("imgModal");
  const imgModalImg = document.getElementById("imgModalImg");
  const imgModalClose = document.getElementById("imgModalClose");


  document.querySelectorAll(".certificate-card").forEach((card) => {
    card.addEventListener("click", () => {
      const imgUrl = card.getAttribute("data-img");
      if (!imgUrl) return; 

      imgModalImg.src = imgUrl;
      imgModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  function closeImgModal() {
    imgModal.classList.remove("active");
    document.body.style.overflow = "";
    imgModalImg.src = "";
  }

  imgModalClose.addEventListener("click", closeImgModal);


  imgModal.addEventListener("click", (e) => {
    if (e.target === imgModal) {
      closeImgModal();
    }
  });


  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && imgModal.classList.contains("active")) {
      closeImgModal();
    }
  });
});

