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
  const track = document.getElementById("certTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  let currentIndex = 0;
  const cardWidth = 296;

  function getMaxIndex() {
    const visibleWidth = track.parentElement.offsetWidth;
    const totalCards = track.children.length;
    const cardsVisible = Math.floor(visibleWidth / cardWidth);
    return Math.max(0, totalCards - cardsVisible);
  }

  function updateSlider() {
    const maxIndex = getMaxIndex();
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
    }
  });

  nextBtn.addEventListener("click", () => {
    const maxIndex = getMaxIndex();
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateSlider();
    }
  });

  // init slider
  updateSlider();

  // responsive resize => recompute
  window.addEventListener("resize", () => {
    currentIndex = Math.min(currentIndex, getMaxIndex());
    updateSlider();
  });

  // drag to scroll


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

    // TODO: replace this with actual backend call (fetch to your serverless endpoint)
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

  // kattintás minden kártyára
  document.querySelectorAll(".certificate-card").forEach((card) => {
    card.addEventListener("click", () => {
      const imgUrl = card.getAttribute("data-img");
      if (!imgUrl) return; // ha nincs kép hozzá, akkor nincs preview

      imgModalImg.src = imgUrl;
      imgModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  function closeImgModal() {
    imgModal.classList.remove("active");
    document.body.style.overflow = "";
    // reseteljük a src-t hogy mobilon ne maradjon memóriafogva
    imgModalImg.src = "";
  }

  imgModalClose.addEventListener("click", closeImgModal);

  // háttérre kattintva is zárjon
  imgModal.addEventListener("click", (e) => {
    // csak akkor zárjuk, ha a sötét háttérre kattintasz, nem a képre
    if (e.target === imgModal) {
      closeImgModal();
    }
  });

  // Esc gomb zárja
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && imgModal.classList.contains("active")) {
      closeImgModal();
    }
  });
});

