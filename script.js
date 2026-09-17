document.addEventListener("DOMContentLoaded", () => {
  const panel = document.querySelector(".link-panel");
  const nextBtns = document.querySelectorAll(".nav-arrow:not(.nav-arrow--send)");
  const choiceBtns = document.querySelectorAll(".choice-btn:not(.choice-btn--dodge)");
  const dodgeResetters = [];
  const replayHint = document.getElementById("replayHint");

  function resetStrayDodgeButtons() {
    dodgeResetters.forEach((reset) => reset());
  }

  function syncReplayHint() {
    if (!replayHint) return;
    const activeSlide = panel.querySelector(".slide.is-active");
    replayHint.hidden = !activeSlide?.classList.contains("slide--end");
  }

  function goToNextSlide() {
    resetStrayDodgeButtons();

    const activeSlide = panel.querySelector(".slide.is-active");
    const nextSlide = activeSlide?.nextElementSibling;

    if (nextSlide && nextSlide.classList.contains("slide")) {
      activeSlide.classList.remove("is-active");
      nextSlide.classList.add("is-active");
    }

    syncReplayHint();
  }

  function goToSlide(slideId) {
    resetStrayDodgeButtons();

    const activeSlide = panel.querySelector(".slide.is-active");
    const targetSlide = panel.querySelector(`.slide[data-slide="${slideId}"]`);

    if (activeSlide && targetSlide) {
      activeSlide.classList.remove("is-active");
      targetSlide.classList.add("is-active");
    }

    syncReplayHint();
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
  const optionHint = document.getElementById("optionHint");
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
        if (optionHint) optionHint.hidden = true;
        if (formNextBtn) formNextBtn.disabled = true;
        return;
      }

      btn.classList.add("is-selected");
      btn.setAttribute("aria-pressed", "true");

      if (optionNoteInput) {
        optionNoteInput.placeholder = optionPlaceholders[btn.dataset.option] || "";
      }
      if (optionNote) optionNote.hidden = false;
      if (optionHint) optionHint.hidden = false;
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

    function resetDodgeBtn() {
      dodgeClicks = 0;
      dodgeBtn.style.position = "";
      dodgeBtn.style.left = "";
      dodgeBtn.style.top = "";
      dodgeBtn.style.zIndex = "";

      // If the user left mid-escape (clicked "Có" before finishing all
      // 6 clicks), the button was moved out to <body> and needs to come
      // back to its original spot instead of being left stranded.
      if (dodgeBtn.parentElement !== originalParent) {
        originalParent.insertBefore(dodgeBtn, originalNextSibling);
      }
    }

    dodgeResetters.push(resetDodgeBtn);

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
        resetDodgeBtn();
        goToSlide(targetSlide);
      }
    });
  });

  const FORMSPREE_ENDPOINT = "https://formspree.io/f/mjykvwoa";
  const sendPlanBtn = document.getElementById("sendPlanBtn");
  const timeInput = document.getElementById("timeInput");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const loadingText = document.getElementById("loadingText");
  const loadingBar = document.getElementById("loadingBar");
  const loadingBarFill = document.getElementById("loadingBarFill");
  const loadingSuccess = document.getElementById("loadingSuccess");
  const LOADING_TEXT_DEFAULT = "Đang gửi thông tin tới tài xế, xin chờ trong giây lát...";

  sendPlanBtn?.addEventListener("click", () => {
    const selectedOption = document.querySelector(".option-check.is-selected");
    const optionLabel = selectedOption
      ? selectedOption.closest(".option-item")?.querySelector(".option-item__label")?.textContent || ""
      : "Để Tài xế Khang tự chọn";
    const note = optionNoteInput?.value.trim() || "(không ghi gì)";
    const time = timeInput?.value || "";

    const sendPromise = fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        "Giờ đi": time,
        "Ăn nhẹ / Uống nước": optionLabel,
        "Ghi chú": note,
      }),
    }).catch(() => {});

    if (!loadingOverlay || !loadingBarFill) {
      sendPromise.then(() => goToNextSlide());
      return;
    }

    loadingBarFill.style.width = "0%";
    if (loadingBar) loadingBar.hidden = false;
    if (loadingSuccess) loadingSuccess.hidden = true;
    if (loadingText) loadingText.textContent = LOADING_TEXT_DEFAULT;
    loadingOverlay.hidden = false;

    const BAR_DURATION = 2800;
    const start = performance.now();

    function animateBar(now) {
      const elapsed = now - start;
      const percent = Math.min(100, (elapsed / BAR_DURATION) * 100);
      loadingBarFill.style.width = `${percent}%`;

      if (percent < 100) {
        requestAnimationFrame(animateBar);
      } else {
        sendPromise.then(() => {
          if (loadingBar) loadingBar.hidden = true;
          if (loadingText) loadingText.textContent = "Đã gửi thành công!";
          if (loadingSuccess) loadingSuccess.hidden = false;

          setTimeout(() => {
            loadingOverlay.hidden = true;
            goToNextSlide();
          }, 1300);
        });
      }
    }

    requestAnimationFrame(animateBar);
  });

  const declineNotifyBtn = document.getElementById("declineNotifyBtn");

  declineNotifyBtn?.addEventListener("click", () => {
    fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        "Thông báo": "Người đẹp đã chọn KHÔNG đi ăn nhẹ / uống nước 😢",
      }),
    }).catch(() => {});
  });
});
