document.addEventListener("DOMContentLoaded", () => {
  const panel = document.querySelector(".link-panel");
  const nextBtns = document.querySelectorAll(".nav-arrow");
  const choiceBtns = document.querySelectorAll(".choice-btn:not(.choice-btn--dodge)");

  function goToNextSlide() {
    const activeSlide = panel.querySelector(".slide.is-active");
    const nextSlide = activeSlide?.nextElementSibling;

    if (nextSlide && nextSlide.classList.contains("slide")) {
      activeSlide.classList.remove("is-active");
      nextSlide.classList.add("is-active");
    }
  }

  function goToSlide(slideId) {
    const activeSlide = panel.querySelector(".slide.is-active");
    const targetSlide = panel.querySelector(`.slide[data-slide="${slideId}"]`);

    if (activeSlide && targetSlide) {
      activeSlide.classList.remove("is-active");
      targetSlide.classList.add("is-active");
    }
  }

  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.target) {
        goToSlide(btn.dataset.target);
      } else {
        goToNextSlide();
      }
    });
  });

  choiceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      choiceBtns.forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");

      if (btn.dataset.target) {
        goToSlide(btn.dataset.target);
      } else if (btn.dataset.choice === "yes") {
        goToNextSlide();
      }
    });
  });

  const optionChecks = document.querySelectorAll(".option-check");
  const optionNote = document.getElementById("optionNote");
  const optionNoteInput = document.getElementById("optionNoteInput");
  const formNextBtn = document.getElementById("formNextBtn");
  const optionPlaceholders = {
    snack: "Ghi cụ thể muốn ăn gì nè...",
    drink: "Ghi cụ thể muốn uống gì nè...",
    both: "Ghi cụ thể muốn ăn/uống gì nè...",
  };

  optionChecks.forEach((btn) => {
    btn.addEventListener("click", () => {
      const wasSelected = btn.classList.contains("is-selected");

      optionChecks.forEach((b) => {
        b.classList.remove("is-selected");
        b.setAttribute("aria-pressed", "false");
      });

      if (wasSelected) {
        if (optionNote) optionNote.hidden = true;
        if (formNextBtn) formNextBtn.disabled = true;
        return;
      }

      btn.classList.add("is-selected");
      btn.setAttribute("aria-pressed", "true");

      if (optionNoteInput) {
        optionNoteInput.placeholder = optionPlaceholders[btn.dataset.option] || "";
      }
      if (optionNote) optionNote.hidden = false;
      if (formNextBtn) formNextBtn.disabled = false;
    });
  });

  const dodgeBtns = document.querySelectorAll(".choice-btn--dodge");

  dodgeBtns.forEach((dodgeBtn) => {
    const REQUIRED_CLICKS = 6;
    const targetSlide = dodgeBtn.dataset.target || "8";
    let dodgeClicks = 0;
    const originalParent = dodgeBtn.parentElement;
    const originalNextSibling = dodgeBtn.nextElementSibling;

    dodgeBtn.addEventListener("click", () => {
      dodgeClicks++;

      if (dodgeClicks < REQUIRED_CLICKS) {
        // .link-panel has backdrop-filter, which makes it the containing block
        // for any fixed-position descendant. Move the button out to <body>
        // first so "fixed" positions relative to the real viewport instead.
        document.body.appendChild(dodgeBtn);
        dodgeBtn.style.position = "fixed";

        const rect = dodgeBtn.getBoundingClientRect();
        const maxLeft = Math.max(16, window.innerWidth - rect.width - 16);
        const maxTop = Math.max(16, window.innerHeight - rect.height - 16);
        const randomLeft = 16 + Math.random() * (maxLeft - 16);
        const randomTop = 16 + Math.random() * (maxTop - 16);

        dodgeBtn.style.left = `${randomLeft}px`;
        dodgeBtn.style.top = `${randomTop}px`;
        dodgeBtn.style.zIndex = "50";
      } else {
        dodgeBtn.style.position = "";
        dodgeBtn.style.left = "";
        dodgeBtn.style.top = "";
        dodgeBtn.style.zIndex = "";
        originalParent.insertBefore(dodgeBtn, originalNextSibling);
        goToSlide(targetSlide);
      }
    });
  });
});
