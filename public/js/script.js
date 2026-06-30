(() => {
  "use strict";

  document.body.classList.add("is-loading");
  window.addEventListener("load", () => {
    window.setTimeout(() => document.body.classList.remove("is-loading"), 650);
  });

  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });

  const revealItems = document.querySelectorAll(".reveal-on-scroll");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const searchForm = document.getElementById("listingSearchForm");
  const searchInput = document.getElementById("listingSearchInput");
  const listingItems = document.querySelectorAll(".listing-search-item");
  const emptyState = document.getElementById("emptyListings");
  const listingCount = document.getElementById("listingCount");

  const filterListings = () => {
    if (!listingItems.length || !searchInput) return;

    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    listingItems.forEach((item) => {
      const text = [
        item.dataset.title,
        item.dataset.location,
        item.dataset.country,
      ]
        .join(" ")
        .toLowerCase();
      const isVisible = text.includes(query);

      item.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount !== 0;
    if (listingCount) {
      listingCount.textContent = `${visibleCount} ${
        visibleCount === 1 ? "stay" : "stays"
      } available`;
    }
  };

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      filterListings();
      const grid = document.getElementById("listingGrid");
      if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    searchInput.addEventListener("input", filterListings);
  }

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || link.target === "_blank") return;

    link.addEventListener("click", () => {
      document.body.classList.add("is-loading");
    });
  });
})();
