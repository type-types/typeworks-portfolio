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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isOpen = false;
    let targetOpen = false;
    let animationId = 0;
    let menuAnimations = [];
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

    const stopMenuAnimation = () => {
      animationId += 1;
      menuAnimations.forEach((animation) => animation.cancel());
      menuAnimations = [];
    };

    const updateMenu = (open, restoreFocus = false) => {
      stopMenuAnimation();
      isOpen = open && mobile.matches;
      targetOpen = isOpen;
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

    const animateMenu = (open, restoreFocus = false) => {
      const nextOpen = open && mobile.matches;
      if (nextOpen === targetOpen) return;
      if (!header || !header.animate || reducedMotion.matches || (!nextOpen && !isOpen)) {
        updateMenu(nextOpen, restoreFocus);
        return;
      }

      const links = [...navigation.querySelectorAll("a[href]")];
      const mounted = isOpen;
      const backgroundStart = mounted ? getComputedStyle(header).backgroundColor : "rgba(255, 255, 255, 0)";
      const linkStarts = links.map((link) => {
        const style = mounted ? getComputedStyle(link) : null;
        return { opacity: style?.opacity ?? "0", transform: style?.transform ?? "translateY(10px)" };
      });
      const paper = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim() || "#fff";

      if (nextOpen) updateMenu(true);
      else stopMenuAnimation();
      targetOpen = nextOpen;
      toggle.classList.toggle("is-open", nextOpen);
      const currentId = animationId;
      const easing = "cubic-bezier(.22, 1, .36, 1)";
      menuAnimations = [header.animate([
        { backgroundColor: backgroundStart },
        { backgroundColor: nextOpen ? paper : "rgba(255, 255, 255, 0)" },
      ], { duration: nextOpen ? 240 : 180, easing, fill: "both" })];
      links.forEach((link, index) => {
        menuAnimations.push(link.animate([
          linkStarts[index],
          { opacity: nextOpen ? "1" : "0", transform: nextOpen ? "translateY(0)" : "translateY(-6px)" },
        ], {
          duration: nextOpen ? 220 : 150,
          delay: nextOpen && !mounted ? 40 + index * 20 : 0,
          easing,
          fill: "both",
        }));
      });
      Promise.all(menuAnimations.map((animation) => animation.finished)).then(() => {
        if (currentId !== animationId) return;
        if (targetOpen) stopMenuAnimation();
        else updateMenu(false, restoreFocus);
      }, () => {});
    };

    toggle.type = "button";
    toggle.addEventListener("click", () => animateMenu(!targetOpen, targetOpen));
    document.addEventListener("keydown", (event) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        animateMenu(false, true);
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
    const handleMotionChange = () => {
      if (!reducedMotion.matches || !isOpen) return;
      if (targetOpen) stopMenuAnimation();
      else updateMenu(false, true);
    };
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener("change", handleMotionChange);
    } else {
      reducedMotion.addListener(handleMotionChange);
    }
    window.addEventListener("pagehide", () => updateMenu(false));
    window.addEventListener("pageshow", () => updateMenu(false));
    updateMenu(false);
  };

  const initializeContactForm = () => {
    const form = document.getElementById("contact-form");
    const fields = document.getElementById("contact-fields");
    const status = document.getElementById("form-status");
    const button = document.getElementById("contact-submit");
    const label = document.getElementById("contact-submit-label");
    const result = document.getElementById("contact-result");
    if (!form || !fields || !status || !button || !label || !result) return;

    let submitting = false;
    let sent = false;
    let controller;
    const value = (name) => String(form.elements.namedItem(name)?.value || "").trim();
    const requiredTextFields = ["company", "name", "message"];
    const resetResult = () => {
      if (submitting) return;
      sent = false;
      result.hidden = true;
      button.disabled = false;
      label.textContent = "상담 내용 보내기";
      status.textContent = "";
      status.classList.remove("is-error");
    };
    const handleInput = (event) => {
      if (requiredTextFields.includes(event.target.name)) event.target.setCustomValidity("");
      resetResult();
    };
    form.addEventListener("input", handleInput);
    form.addEventListener("change", handleInput);
    form.addEventListener("reset", () => {
      requiredTextFields.forEach((name) => form.elements.namedItem(name)?.setCustomValidity(""));
      resetResult();
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (submitting || sent) return;
      requiredTextFields.forEach((name) => {
        form.elements.namedItem(name)?.setCustomValidity(value(name) ? "" : "공백이 아닌 내용을 입력해 주세요.");
      });
      if (!form.reportValidity()) return;
      const payload = Object.fromEntries(["company", "name", "email", "projectType", "budget", "timeline", "message", "website"].map((name) => [name, value(name)]));
      submitting = true;
      fields.disabled = true;
      form.setAttribute("aria-busy", "true");
      label.textContent = "보내는 중…";
      status.classList.remove("is-error");
      status.textContent = "상담 내용을 보내고 있습니다. 잠시 기다려 주세요.";
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 25000);
      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "omit",
          referrerPolicy: "origin",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || data.ok !== true) {
          throw new Error(response.status === 429 ? "rate_limit" : "send_failed");
        }
        sent = true;
        label.textContent = "전송 완료";
        status.textContent = "이메일 전송이 완료되었습니다.";
        result.hidden = false;
        document.getElementById("contact-result-title")?.focus();
      } catch (error) {
        status.classList.add("is-error");
        status.textContent = error.message === "rate_limit"
          ? "잠시 요청이 많습니다. 1분 뒤 다시 보내주시거나 이메일로 직접 문의해 주세요. 입력한 내용은 그대로 남아 있습니다."
          : "전송 완료를 확인하지 못했습니다. 잠시 후 다시 시도하거나 이메일로 직접 문의해 주세요. 입력한 내용은 그대로 남아 있습니다.";
      } finally {
        window.clearTimeout(timeout);
        submitting = false;
        controller = null;
        fields.disabled = false;
        button.disabled = sent;
        form.removeAttribute("aria-busy");
        if (!sent) {
          label.textContent = "상담 내용 보내기";
          button.focus({ preventScroll: true });
        }
      }
    });
    window.addEventListener("pagehide", () => controller?.abort());
    fields.disabled = false;
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
