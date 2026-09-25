const menuButton = document.querySelector<HTMLButtonElement>(".menu-toggle");
const nav = document.querySelector<HTMLElement>("#main-nav");
function closeDropdowns(except?: Element) {
  document
    .querySelectorAll<HTMLButtonElement>(".dropdown-toggle")
    .forEach((button) => {
      if (button === except) return;
      button.setAttribute("aria-expanded", "false");
      document.getElementById(button.getAttribute("aria-controls")!)!.hidden =
        true;
    });
}
menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("is-open", open);
  if (!open) closeDropdowns();
});
document
  .querySelectorAll<HTMLButtonElement>(".dropdown-toggle")
  .forEach((button) =>
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      closeDropdowns(button);
      button.setAttribute("aria-expanded", String(open));
      document.getElementById(button.getAttribute("aria-controls")!)!.hidden =
        !open;
    }),
  );
document.addEventListener("click", (e) => {
  if (!(e.target as Element).closest(".has-dropdown")) closeDropdowns();
  if (!(e.target as Element).closest(".site-header")) {
    nav?.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const open = document.querySelector<HTMLButtonElement>(
      '.dropdown-toggle[aria-expanded="true"]',
    );
    if (open) {
      closeDropdowns();
      open.focus();
    } else if (menuButton?.getAttribute("aria-expanded") === "true") {
      nav?.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.focus();
    }
  }
});
document.querySelectorAll<HTMLDialogElement>("dialog").forEach((dialog) => {
  let trigger: HTMLElement | null = null;
  let current = 0;
  const slides = [...dialog.querySelectorAll<HTMLElement>(".slide")];
  function show(index: number) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => (s.hidden = i !== current));
    dialog.querySelector(".slide-status")!.textContent =
      `${current + 1} / ${slides.length}`;
  }
  document
    .querySelectorAll<HTMLElement>(`[data-modal="${dialog.id}"]`)
    .forEach((button) =>
      button.addEventListener("click", (event) => {
        // Keep normal link behavior for new-tab/modified clicks.
        if (button instanceof HTMLAnchorElement &&
            (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return;
        event.preventDefault();
        trigger = button;
        if (button.closest("#main-nav")) {
          trigger = menuButton?.getAttribute("aria-expanded") === "true"
            ? menuButton
            : button.closest(".has-dropdown")?.querySelector<HTMLElement>(".dropdown-toggle") || button;
          closeDropdowns();
          nav?.classList.remove("is-open");
          menuButton?.setAttribute("aria-expanded", "false");
        }
        show(0);
        dialog.showModal();
        document.body.classList.add("modal-open");
      }),
    );
  dialog
    .querySelector(".modal-close")
    ?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    trigger?.focus({ preventScroll: true });
  });
  dialog
    .querySelectorAll<HTMLButtonElement>("[data-slide]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        show(current + Number(b.dataset.slide)),
      ),
    );
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      show(current - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      show(current + 1);
    }
    if (e.key === "Tab") {
      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>(
          'button,a[href],[tabindex="0"]',
        ),
      ].filter((el) => !el.closest("[hidden]"));
      const first = focusable[0],
        last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  });
});
document
  .querySelectorAll<HTMLButtonElement>(".faq-item button")
  .forEach((button) =>
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      document.getElementById(button.getAttribute("aria-controls")!)!.hidden =
        !open;
      button.querySelector("span")!.textContent = open ? "−" : "+";
    }),
  );
const banner = document.querySelector<HTMLElement>(".cookie-banner");
const key = "mrdc-cookie-preference";
try {
  if (banner)
    banner.hidden = ["accepted", "declined"].includes(
      localStorage.getItem(key) || "",
    );
} catch {
  if (banner) banner.hidden = false;
}
document
  .querySelectorAll<HTMLButtonElement>("[data-consent]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      try {
        localStorage.setItem(key, button.dataset.consent!);
      } catch {}
      if (banner) banner.hidden = true;
    }),
  );
document.querySelector("[data-cookie-reset]")?.addEventListener("click", () => {
  if (banner) {
    banner.hidden = false;
    banner.querySelector<HTMLButtonElement>("button")?.focus();
  }
});
