"use strict";
// Existing prices and discount rules are preserved here for easy editing.
const PRICING = Object.freeze({
  page: { single: 80, unlimited: 400 },
  copy: { english: 250, bm: 300, both: 460 },
  design: { single: 50, unlimited: 200 },
  images: 20,
  domain: 90,
  hosting: 50,
  seo: { "technical-seo": 150, "onpage-seo": 100, "both-seo": 250 },
  packageSeo: 50,
  adhoc: 80,
  basic: { single: 100, unlimited: 300 },
  full: 800,
});

const money = (amount) =>
  new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(
    amount,
  );

function calculateQuote(s) {
  const lines = [],
    errors = [];
  const add = (label, amount, period = "once") =>
    lines.push({ label, amount, period });
  const multi = s.pageType === "unlimited";
  add(
    multi ? "Multiple-page development" : "Single-page development",
    PRICING.page[s.pageType] ?? PRICING.page.single,
  );
  if (s.copywriting === "yes")
    add(
      "Copywriting: " +
        ({ english: "English", bm: "BM", both: "English & BM" }[s.language] ||
          "English"),
      PRICING.copy[s.language] ?? 250,
    );
  if (s.images === "no") add("Image sourcing", PRICING.images);
  if (s.design === "yes")
    add("Unique design", PRICING.design[s.pageType] ?? 50);
  if (s.hostingDomain === "yes") {
    if (s.domain === "yes")
      add(
        multi ? "Domain - first year included" : "Domain - annual",
        multi ? 0 : PRICING.domain,
        "annual",
      );
    if (s.hosting === "yes")
      add(
        multi ? "Hosting - first year included" : "Hosting - annual",
        multi ? 0 : PRICING.hosting,
        "annual",
      );
  }
  if (s.seo !== "no" && PRICING.seo[s.seo]) {
    const labels = {
      "technical-seo": "Technical SEO",
      "onpage-seo": "On-page SEO",
      "both-seo": "Technical & on-page SEO",
    };
    const discounted = multi || s.copywriting === "yes";
    add(
      labels[s.seo] + (discounted ? " (package rate)" : ""),
      discounted ? PRICING.packageSeo : PRICING.seo[s.seo],
    );
  }
  if (s.maintenance === "yes") {
    if (!s.maintenanceType)
      errors.push("Choose a maintenance plan or select No for support.");
    else if (s.maintenanceType === "adhoc") {
      const hours = Number(s.hours);
      if (!Number.isInteger(hours) || hours < 1 || hours > 10000)
        errors.push(
          "Enter a whole number of support hours between 1 and 10,000.",
        );
      else
        add(
          `Ad hoc support (${hours} ${hours === 1 ? "hour" : "hours"})`,
          hours * PRICING.adhoc,
        );
    } else if (s.maintenanceType === "monthly-basic")
      add("Basic website support", PRICING.basic[s.pageType] ?? 100, "monthly");
    else if (s.maintenanceType === "monthly-full") {
      if (!multi)
        errors.push(
          "Full support is available for multiple pages only. Choose another plan.",
        );
      else add("Full website support", PRICING.full, "monthly");
    }
  }
  // A bundle replaces its individual items, rather than adding to them.
  const selected = (s.features || []).filter((f) => f.id !== "content-blocks");
  const bundle = selected.some((f) => f.id === "testimonial-all");
  const cart = selected.some((f) => f.id === "cart-with-payment");
  const automatic = selected.some((f) => f.id === "booking-form-auto-whatsapp");
  for (const f of selected) {
    if (
      bundle &&
      ["testimonial-text", "testimonial-image", "testimonial-video"].includes(
        f.id,
      )
    )
      continue;
    if (cart && f.id === "cart-without-payment") continue;
    if (automatic && f.id === "booking-form-click") continue;
    if (Number.isFinite(f.price) && f.price >= 0) add(f.label, f.price);
  }
  const sum = (p) =>
    lines.filter((l) => l.period === p).reduce((a, l) => a + l.amount, 0);
  const once = sum("once"),
    monthly = sum("monthly"),
    annual = sum("annual");
  return {
    lines,
    errors,
    once,
    monthly,
    annual,
    initial: once + monthly + annual,
  };
}
if (typeof module !== "undefined" && module.exports)
  module.exports = { calculateQuote, PRICING };
if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id),
    form = $("pricing-form");
  const testimonials = [
    "testimonial-text",
    "testimonial-image",
    "testimonial-video",
  ];
  let lastTrigger = null;
  function selectedFeatures() {
    return [...form.querySelectorAll("input[type=checkbox]:checked")].map(
      (el) => ({
        id: el.id,
        label: document
          .querySelector(`label[for="${el.id}"]`)
          .childNodes[0].textContent.trim(),
        price: Number(el.value),
      }),
    );
  }
  function readState() {
    return {
      pageType: $("page-type").value,
      copywriting: $("copywriting").value,
      language: $("copywriting-language").value,
      images: $("images").value,
      design: $("design-reference").value,
      hostingDomain: $("hosting-domain").value,
      domain: $("domain").value,
      hosting: $("hosting").value,
      seo: $("seo-optimization").value,
      maintenance: $("maintenance-support").value,
      maintenanceType: $("maintenance-type").value,
      hours: $("adhoc-hours").value,
      features: selectedFeatures(),
    };
  }
  function sync() {
    for (const [id, show] of [
      ["copywriting-options", $("copywriting").value === "yes"],
      ["design-reference-url", $("design-reference").value === "yes"],
      ["hosting-domain-options", $("hosting-domain").value === "yes"],
      ["maintenance-support-options", $("maintenance-support").value === "yes"],
      ["maintenance-support-details", $("maintenance-support").value === "yes"],
      [
        "adhoc-options",
        $("maintenance-support").value === "yes" &&
          $("maintenance-type").value === "adhoc",
      ],
    ]) {
      $(id).hidden = !show;
      for (const control of $(id).querySelectorAll("input,select,textarea"))
        control.disabled = !show;
    }
    const full = form.querySelector('option[value="monthly-full"]');
    full.disabled = $("page-type").value === "single";
    full.hidden = full.disabled;
    if (full.disabled && $("maintenance-type").value === "monthly-full")
      $("maintenance-type").value = "";
    for (const id of testimonials) {
      $(id).disabled = $("testimonial-all").checked;
      if ($(id).disabled) $(id).checked = false;
    }
    $("maintenance-type").required = $("maintenance-support").value === "yes";
    $("adhoc-hours").required = !$("adhoc-options").hidden;
  }
  function render() {
    sync();
    const q = calculateQuote(readState());
    $("one-time-total").textContent = money(q.once);
    $("monthly-total").textContent = money(q.monthly);
    $("annual-total").textContent = money(q.annual);
    $("total").textContent = q.errors.length
      ? "Complete options"
      : money(q.initial);
    $("mobile-total").textContent = q.errors.length
      ? "Complete options"
      : money(q.initial);
    $("estimate-lines").replaceChildren();
    for (const l of q.lines) {
      const row = document.createElement("div");
      row.className = "estimate-line";
      const label = document.createElement("span"),
        price = document.createElement("b");
      label.textContent = l.label;
      price.textContent =
        money(l.amount) +
        (l.period === "monthly"
          ? " /mo"
          : l.period === "annual" && l.amount
            ? " /yr"
            : "");
      row.append(label, price);
      $("estimate-lines").append(row);
    }
    $("estimate-error").hidden = !q.errors.length;
    $("estimate-error").textContent = q.errors.join(" ");
    return q;
  }
  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("input", () => {
    $("reset-status").textContent = "";
    $("print-quote").hidden = true;
    render();
  });
  form.addEventListener("change", (e) => {
    const id = e.target.id;
    // Switch between alternatives directly without trapping disabled selections.
    const pairs = [
      ["cart-with-payment", "cart-without-payment"],
      ["booking-form-auto-whatsapp", "booking-form-click"],
    ];
    for (const pair of pairs)
      if (pair.includes(id) && e.target.checked)
        $(pair.find((x) => x !== id)).checked = false;
    render();
  });
  $("review-estimate").addEventListener("click", () =>
    $("estimate-title").scrollIntoView({ behavior: "smooth", block: "start" }),
  );
  // Restore explicit application defaults, including disabled/conditional controls.
  // Do not depend on native reset defaults, which browsers may restore from history.
  function resetCalculator() {
    const defaults = {
      "page-type": "single",
      copywriting: "no",
      "copywriting-language": "english",
      images: "yes",
      "design-reference": "no",
      "hosting-domain": "no",
      domain: "no",
      hosting: "no",
      "seo-optimization": "no",
      "maintenance-support": "no",
      "maintenance-type": "",
    };
    for (const [id, value] of Object.entries(defaults)) $(id).value = value;
    for (const box of form.querySelectorAll("input[type=checkbox]")) {
      box.checked = box.id === "content-blocks";
      box.disabled = box.id === "content-blocks";
    }
    for (const field of form.querySelectorAll("textarea")) field.value = "";
    $("adhoc-hours").value = "1";
    $("user-name").value = "";
    $("user-contact").value = "";
    for (const field of document.querySelectorAll("input,select,textarea"))
      field.setCustomValidity("");
    $("contact-error").hidden = true;
    $("contact-error").textContent = "";
    $("print-quote").hidden = true;
    $("print-quote").replaceChildren();
    for (const dialog of document.querySelectorAll("dialog[open]"))
      dialog.close();
    render();
    $("reset-status").textContent =
      "Reset complete. Starting price: " + money(PRICING.page.single) + ".";
  }
  form.addEventListener("reset", (e) => {
    e.preventDefault();
    resetCalculator();
  });
  function openDialog(id) {
    lastTrigger = document.activeElement;
    $(id).showModal();
  }
  function closeDialog(id) {
    $(id).close();
    lastTrigger?.focus();
  }
  for (const id of ["rfq-dialog", "buy-dialog"])
    $(id).addEventListener("click", (e) => {
      if (e.target === $(id)) {
        const r = e.target.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          closeDialog(id);
      }
    });
  $("rfq-button").addEventListener("click", () => {
    const q = render();
    if (q.errors.length) {
      form.reportValidity();
      $("estimate-error").scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
      return;
    }
    openDialog("rfq-dialog");
  });
  $("close-rfq").addEventListener("click", () => closeDialog("rfq-dialog"));
  $("cancel-rfq").addEventListener("click", () => closeDialog("rfq-dialog"));
  $("buy-calculator").addEventListener("click", () => openDialog("buy-dialog"));
  $("close-buy").addEventListener("click", () => closeDialog("buy-dialog"));
  $("cancel-buy").addEventListener("click", () => closeDialog("buy-dialog"));
  function node(tag, text, className) {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    if (className) n.className = className;
    return n;
  }
  function buildPreview(q) {
    const root = $("print-quote");
    root.replaceChildren();
    root.hidden = false;
    const toolbar = node("div", undefined, "preview-toolbar");
    const back = node("button", "Back to calculator", "secondary");
    back.type = "button";
    back.addEventListener("click", () => {
      root.hidden = true;
      $("rfq-button").focus();
    });
    const print = node("button", "Print / Save as PDF", "primary");
    print.type = "button";
    print.addEventListener("click", () => window.print());
    const contact = node("a", "Contact on WhatsApp ↗", "secondary");
    contact.href = "https://wa.link/mgectq";
    contact.target = "_blank";
    contact.rel = "noopener noreferrer";
    toolbar.append(back, print, contact);
    root.append(toolbar);
    const paper = node("article", undefined, "quote-paper");
    paper.append(
      node("p", "PROJECT ESTIMATE", "eyebrow"),
      node("h1", "Landing page quotation"),
      node(
        "p",
        "Prepared: " +
          new Date().toLocaleDateString("en-MY", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
      ),
      node("p", "Prepared for: " + $("user-name").value.trim()),
      node("p", "Contact: " + $("user-contact").value.trim()),
    );
    const table = node("table"),
      head = node("thead"),
      hr = node("tr");
    for (const t of ["Service", "Billing", "Amount"]) hr.append(node("th", t));
    head.append(hr);
    table.append(head);
    const body = node("tbody");
    for (const l of q.lines) {
      const row = node("tr");
      for (const t of [
        l.label,
        {
          once: "One-time",
          monthly: "Monthly",
          annual: l.amount ? "Annual" : "First year",
        }[l.period],
        money(l.amount),
      ])
        row.append(node("td", t));
      body.append(row);
    }
    table.append(body);
    paper.append(table);
    paper.append(node("h2", "Cost summary"));
    for (const [label, value] of [
      ["One-time project cost", q.once],
      ["Monthly support", q.monthly],
      ["Annual services", q.annual],
      ["Initial payment estimate", q.initial],
    ])
      paper.append(node("p", label + ": " + money(value)));
    const detail = (title, text) => {
      if (text?.trim()) {
        paper.append(node("h2", title), node("p", text, "preserve-lines"));
      }
    };
    detail(
      "Page scope",
      $("page-type").selectedOptions[0].textContent +
        "; unlimited text and image content blocks included. Final page count, content and deliverables must be agreed before work begins.",
    );
    if ($("design-reference").value === "yes")
      detail("Design references", $("design-reference-textarea").value);
    if ($("maintenance-support").value === "yes")
      detail("Support requirements", $("maintenance-details").value);
    detail(
      "Additional requirements - priced separately",
      $("additional-features").value,
    );
    detail(
      "Notes",
      "Initial estimate includes the project cost, first month of support and first-year annual services. Multiple-page hosting/domain selections are included for the first year under the multiple-page package; renewal pricing requires confirmation. Additional requirements, paid assets, payment gateway and WhatsApp provider fees, and applicable taxes are excluded unless agreed. SEO does not guarantee rankings. This estimate is subject to scope confirmation.",
    );
    paper.append(
      node(
        "p",
        "No request has been sent. Save this estimate and attach it when contacting us.",
        "quote-note",
      ),
    );
    root.append(paper);
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  $("rfq-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("user-name").value.trim(),
      contact = $("user-contact").value.trim();
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact),
      phone =
        /^\+?[\d\s().-]+$/.test(contact) &&
        contact.replace(/\D/g, "").length >= 7 &&
        contact.replace(/\D/g, "").length <= 15;
    if (!name || (!email && !phone)) {
      $("contact-error").textContent =
        "Enter your name and a valid email address or phone number.";
      $("contact-error").hidden = false;
      return;
    }
    $("contact-error").hidden = true;
    const q = render();
    if (q.errors.length) return;
    closeDialog("rfq-dialog");
    buildPreview(q);
  });
  render();
}
