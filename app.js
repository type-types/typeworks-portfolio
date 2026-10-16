(() => {
  "use strict";

  const initialize = () => {
    document.documentElement.classList.add("js");
    initializeReveals();
    initializeMenu();
    initializeContactForm();
    initializeGallery();
  };

  const initializeReveals = () => {
    const elements = [...document.querySelectorAll(".reveal")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const showAll = () => {
      elements.forEach((element) => element.classList.add("is-visible"));
    };

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08 },
    );

    elements.forEach((element) => observer.observe(element));
    const handleMotionChange = (event) => {
      if (!event.matches) return;
      showAll();
      observer.disconnect();
    };
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener("change", handleMotionChange);
    } else {
      reducedMotion.addListener(handleMotionChange);
    }
  };

  const initializeMenu = () => {
    const toggle = document.getElementById("menu-toggle");
    const navigation = document.getElementById("site-nav");
    const header = document.querySelector(".site-header");
    if (!toggle || !navigation) return;

    const mobile = window.matchMedia("(max-width: 900px)");
    const background = [...document.querySelectorAll("main, .site-footer, .skip-link")];
    let isOpen = false;
    let navigationHadFocus = navigation.contains(document.activeElement);
    let toggleHadFocus = toggle.contains(document.activeElement);

    document.addEventListener("focusin", (event) => {
      if (event.target === document.body) return;
      navigationHadFocus = navigation.contains(event.target);
      toggleHadFocus = toggle.contains(event.target);
    });
    document.addEventListener("pointerdown", (event) => {
      if (!navigation.contains(event.target)) navigationHadFocus = false;
      if (!toggle.contains(event.target)) toggleHadFocus = false;
    }, { capture: true });

    const updateMenu = (open, restoreFocus = false) => {
      isOpen = open && mobile.matches;
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-controls", "site-nav");
      toggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
      toggle.classList.toggle("is-open", isOpen);
      navigation.classList.toggle("is-open", isOpen);
      header?.classList.toggle("is-open", isOpen);
      document.documentElement.classList.toggle("menu-open", isOpen);
      background.forEach((element) => { element.inert = isOpen; });
      if (isOpen) {
        header?.setAttribute("role", "dialog");
        header?.setAttribute("aria-modal", "true");
        header?.setAttribute("aria-label", "사이트 메뉴");
      } else {
        header?.removeAttribute("role");
        header?.removeAttribute("aria-modal");
        header?.removeAttribute("aria-label");
      }

      const isHidden = mobile.matches && !isOpen;
      navigation.inert = isHidden;
      if (isHidden) {
        navigation.setAttribute("aria-hidden", "true");
      } else {
        navigation.removeAttribute("aria-hidden");
      }
      if (restoreFocus) toggle.focus({ preventScroll: true });
      else if (isOpen) navigation.querySelector("a[href]")?.focus({ preventScroll: true });
    };

    toggle.type = "button";
    toggle.addEventListener("click", () => updateMenu(!isOpen, isOpen));
    document.addEventListener("keydown", (event) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        updateMenu(false, true);
        return;
      }
      if (event.key !== "Tab" || !header) return;
      const links = [...header.querySelectorAll("a[href], button:not([disabled])")];
      const first = links[0];
      const last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus({ preventScroll: true });
      }
    });
    navigation.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link || !navigation.contains(link) || !isOpen) return;
      updateMenu(false);
      const href = link.getAttribute("href");
      if (!href?.startsWith("#") || href === "#") return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
    });

    const handleViewportChange = () => {
      const activeElement = document.activeElement;
      const restoreFocus = mobile.matches && (
        navigation.contains(activeElement) ||
        (activeElement === document.body && navigationHadFocus)
      );
      const restoreNavigationFocus = !mobile.matches && (
        toggle.contains(activeElement) ||
        (activeElement === document.body && toggleHadFocus)
      );
      updateMenu(false, restoreFocus);
      if (restoreNavigationFocus) {
        navigation.querySelector("a[href]")?.focus({ preventScroll: true });
      }
    };
    if (mobile.addEventListener) {
      mobile.addEventListener("change", handleViewportChange);
    } else {
      mobile.addListener(handleViewportChange);
    }
    window.addEventListener("pagehide", () => updateMenu(false));
    window.addEventListener("pageshow", () => updateMenu(false));
    updateMenu(false);
  };

  const initializeContactForm = () => {
    const form = document.getElementById("contact-form");
    const summary = document.getElementById("contact-summary");
    const panel = document.getElementById("summary-panel");
    const status = document.getElementById("form-status");
    const copyButton = document.getElementById("copy-summary");
    if (!form || !summary || !panel || !status || !copyButton) return;

    copyButton.type = "button";
    copyButton.disabled = true;
    summary.readOnly = true;
    status.setAttribute("role", "status");

    const fieldValue = (name) => {
      const field = form.elements.namedItem(name);
      if (!field) return "";
      const value = String(field.value || "").trim();
      if (!value) return "";
      if (field instanceof HTMLSelectElement) {
        return field.selectedOptions[0]?.textContent.trim() || value;
      }
      return value;
    };

    const clearSummary = (message = "") => {
      summary.value = "";
      panel.hidden = true;
      copyButton.disabled = true;
      status.textContent = message;
    };

    const requiredTextFields = ["company", "name", "message"];
    const clearTextValidation = () => {
      requiredTextFields.forEach((name) => {
        const field = form.elements.namedItem(name);
        field?.setCustomValidity("");
      });
    };

    const handleInput = (event) => {
      const field = event.target;
      if (requiredTextFields.includes(field.name)) field.setCustomValidity("");
      if (!summary.value) return;
      clearSummary("입력한 내용이 바뀌었습니다. 상담 내용을 다시 만들어 주세요.");
    };
    form.addEventListener("input", handleInput);
    form.addEventListener("change", handleInput);
    form.addEventListener("reset", () => {
      clearTextValidation();
      clearSummary();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      requiredTextFields.forEach((name) => {
        const field = form.elements.namedItem(name);
        field?.setCustomValidity(fieldValue(name) ? "" : "공백이 아닌 내용을 입력해 주세요.");
      });
      if (!form.reportValidity()) return;

      summary.value = [
        "타입웍스 프로젝트 상담",
        "",
        `회사 또는 팀: ${fieldValue("company")}`,
        `담당자: ${fieldValue("name")}`,
        `이메일: ${fieldValue("email")}`,
        `프로젝트 유형: ${fieldValue("projectType") || "상담 후 결정"}`,
        `예산: ${fieldValue("budget") || "상담 후 결정"}`,
        `희망 일정: ${fieldValue("timeline") || "상담 후 결정"}`,
        "",
        "필요한 제품과 현재 상황",
        fieldValue("message"),
      ].join("\n");
      panel.hidden = false;
      copyButton.disabled = false;
      status.textContent = "상담 내용을 정리했습니다. 내용을 확인한 뒤 복사해 전달해 주세요.";
    });

    copyButton.addEventListener("click", async () => {
      const text = summary.value;
      if (!text || panel.hidden) return;
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(text);
        if (summary.value === text && !panel.hidden) {
          status.textContent = "상담 내용을 복사했습니다. 전달할 곳에 붙여 넣어 주세요.";
        }
      } catch {
        if (summary.value !== text || panel.hidden) return;
        summary.focus({ preventScroll: true });
        summary.select();
        status.textContent = "자동 복사를 사용할 수 없습니다. 선택된 상담 내용을 직접 복사해 주세요.";
      }
    });

    const fields = form.querySelector("#contact-fields");
    if (fields) fields.disabled = false;
  };

  const initializeGallery = () => {
    const dialog = document.getElementById("image-dialog");
    const image = document.getElementById("dialog-image");
    const closeButton = document.getElementById("dialog-close");
    const title = document.getElementById("dialog-title");
    if (!dialog || !image || !closeButton) return;

    let opener = null;
    const restoreFocus = () => {
      if (opener?.isConnected) opener.focus({ preventScroll: true });
      opener = null;
    };
    const closeDialog = () => {
      if (!dialog.open) return;
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
        restoreFocus();
      }
    };

    closeButton.type = "button";
    closeButton.addEventListener("click", closeDialog);
    dialog.addEventListener("close", restoreFocus);
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        closeDialog();
      }
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && typeof dialog.showModal !== "function") {
        event.preventDefault();
        closeDialog();
      }
    });

    document.querySelectorAll("[data-gallery-open]").forEach((button) => {
      if (button.tagName === "BUTTON") button.type = "button";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const source = button.getAttribute("data-gallery-src");
        if (!source || dialog.open) return;
        opener = button;
        image.src = source;
        image.alt = button.getAttribute("data-gallery-alt") || "제품 화면";
        if (title) title.textContent = button.getAttribute("data-gallery-title") || "제품 화면";
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          dialog.setAttribute("open", "");
        }
        closeButton.focus({ preventScroll: true });
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
