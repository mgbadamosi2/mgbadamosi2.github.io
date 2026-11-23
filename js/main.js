(function () {
  const root = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle");
  const menuBtn = document.getElementById("menu-toggle");
  const navList = document.getElementById("primary-nav");

  function updateThemeButton(theme) {
    if (!themeBtn) return;
    const isDark = theme === "dark";
    themeBtn.setAttribute("aria-pressed", String(isDark));
    themeBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
    themeBtn.title = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
  }

  function currentTheme() {
    return root.getAttribute("data-theme") || "light";
  }

  updateThemeButton(currentTheme());

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      const next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("gbadamosi-lab-theme", next);
      } catch (_) {}
      updateThemeButton(next);
    });
  }

  if (menuBtn && navList) {
    menuBtn.addEventListener("click", function () {
      const expanded = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!expanded));
      navList.classList.toggle("is-open", !expanded);
    });
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  // Render Lab Photos Carousel (People page)
  const collageContainer = document.getElementById("lab-collage");
  if (collageContainer && Array.isArray(window.LAB_GALLERY) && window.LAB_GALLERY.length > 0) {
    const photos = window.LAB_GALLERY;
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const stage = el("div", "gallery-stage");
    const imgs = photos.map(function (p, idx) {
      const img = el("img", idx === 0 ? "is-active" : "");
      img.src = p.src;
      img.alt = p.caption;
      img.loading = idx === 0 ? "eager" : "lazy";
      stage.appendChild(img);
      return img;
    });

    const prevBtn = el("button", "carousel-btn carousel-btn--prev", "\u2039");
    prevBtn.type = "button";
    prevBtn.setAttribute("aria-label", "Previous photo");

    const nextBtn = el("button", "carousel-btn carousel-btn--next", "\u203A");
    nextBtn.type = "button";
    nextBtn.setAttribute("aria-label", "Next photo");

    stage.appendChild(prevBtn);
    stage.appendChild(nextBtn);

    const bar = el("div", "gallery-bar");
    const captionEl = el("div", "gallery-caption", photos[0].caption);
    const controls = el("div", "gallery-controls");
    const pauseBtn = el("button", "icon-btn", reducedMotion ? "Play" : "Pause");
    pauseBtn.type = "button";
    pauseBtn.setAttribute("aria-pressed", String(reducedMotion));
    pauseBtn.setAttribute("aria-label", reducedMotion ? "Play slideshow" : "Pause slideshow");
    const counterEl = el("div", "gallery-counter", "1 / " + photos.length);
    controls.appendChild(pauseBtn);
    controls.appendChild(counterEl);
    bar.appendChild(captionEl);
    bar.appendChild(controls);

    collageContainer.setAttribute("role", "region");
    collageContainer.setAttribute("aria-roledescription", "carousel");
    collageContainer.appendChild(stage);
    collageContainer.appendChild(bar);

    let current = 0;
    let timer = null;
    let userPaused = reducedMotion;

    function showSlide(nextIndex) {
      imgs[current].classList.remove("is-active");
      current = (nextIndex + photos.length) % photos.length;
      imgs[current].classList.add("is-active");
      captionEl.textContent = photos[current].caption;
      counterEl.textContent = (current + 1) + " / " + photos.length;
    }

    function startTimer() {
      if (userPaused || photos.length <= 1) return;
      stopTimer();
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 6500);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    pauseBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      pauseBtn.textContent = userPaused ? "Play" : "Pause";
      pauseBtn.setAttribute("aria-pressed", String(userPaused));
      pauseBtn.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
      if (userPaused) stopTimer();
      else startTimer();
    });

    prevBtn.addEventListener("click", function () {
      showSlide(current - 1);
      startTimer();
    });

    nextBtn.addEventListener("click", function () {
      showSlide(current + 1);
      startTimer();
    });

    collageContainer.addEventListener("mouseenter", stopTimer);
    collageContainer.addEventListener("mouseleave", startTimer);

    startTimer();
  }

  // Render News (Home & News page)
  const newsContainer = document.getElementById("news-list");
  if (newsContainer && Array.isArray(window.LAB_NEWS)) {
    window.LAB_NEWS.forEach(function (item) {
      const row = el("article", "news-item");
      row.appendChild(el("div", "news-date", item.date));
      const body = el("div");
      const tag = el("span", "card-tag", item.tag);
      tag.style.marginRight = "0.55rem";
      tag.style.marginBottom = "0";
      body.appendChild(tag);
      if (item.linkText && item.linkUrl && item.text.indexOf(item.linkText) !== -1) {
        const idx = item.text.indexOf(item.linkText);
        const before = item.text.slice(0, idx);
        const after = item.text.slice(idx + item.linkText.length);
        if (before) body.appendChild(document.createTextNode(before));
        const a = el("a", "", item.linkText);
        a.href = item.linkUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        body.appendChild(a);
        if (after) body.appendChild(document.createTextNode(after));
      } else {
        body.appendChild(document.createTextNode(item.text));
      }
      if (item.image) {
        const img = el("img", "news-photo");
        img.src = item.image;
        img.alt = item.imageAlt || item.tag;
        img.loading = "lazy";
        body.appendChild(img);
      }
      if (item.embedUrl) {
        const iframe = el("iframe", "news-embed");
        iframe.src = item.embedUrl;
        iframe.title = item.embedTitle || item.tag;
        iframe.loading = "lazy";
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("frameborder", "0");
        body.appendChild(iframe);
      }
      row.appendChild(body);
      newsContainer.appendChild(row);
    });
  }

  // Render Publications
  const pubContainer = document.getElementById("pub-list");
  const pubFilters = document.getElementById("pub-filters");
  const pubSearch = document.getElementById("pub-search");

  if (pubContainer && Array.isArray(window.LAB_PUBLICATIONS)) {
    let activeTopic = "All";
    let query = "";

    const topics = ["All"].concat(
      Array.from(new Set(window.LAB_PUBLICATIONS.map(function (p) { return p.topic; })))
    );

    function renderPubs() {
      pubContainer.innerHTML = "";
      const q = query.trim().toLowerCase();
      const filtered = window.LAB_PUBLICATIONS.filter(function (p) {
        const matchTopic = activeTopic === "All" || p.topic === activeTopic;
        const matchQuery =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.authors.toLowerCase().includes(q) ||
          p.journal.toLowerCase().includes(q);
        return matchTopic && matchQuery;
      });

      if (filtered.length === 0) {
        pubContainer.appendChild(el("p", "section-subtitle", "No matching publications found."));
        return;
      }

      filtered.forEach(function (p) {
        const card = el("article", "pub-card");
        const meta = el("div", "pub-meta");
        meta.appendChild(el("span", "pub-year", String(p.year)));
        meta.appendChild(el("span", "", "· " + p.journal));
        meta.appendChild(el("span", "card-tag", p.topic));
        card.appendChild(meta);

        card.appendChild(el("div", "pub-title", p.title));
        card.appendChild(el("div", "pub-authors", p.authors));
        if (p.summary) {
          const sum = el("p", "", p.summary);
          sum.style.color = "var(--text-muted)";
          sum.style.fontSize = "0.92rem";
          sum.style.margin = "0 0 0.65rem";
          card.appendChild(sum);
        }
        if (p.doi) {
          const links = el("div", "pub-links");
          const a = el("a", "", "View Paper / PubMed ->");
          a.href = p.doi;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.setAttribute("aria-label", "View paper: " + p.title);
          links.appendChild(a);
          card.appendChild(links);
        }
        pubContainer.appendChild(card);
      });
    }

    if (pubFilters) {
      topics.forEach(function (topic) {
        const btn = el("button", "pill-btn", topic);
        btn.type = "button";
        btn.setAttribute("aria-pressed", String(topic === activeTopic));
        btn.addEventListener("click", function () {
          activeTopic = topic;
          Array.from(pubFilters.children).forEach(function (b) {
            b.setAttribute("aria-pressed", String(b.textContent === activeTopic));
          });
          renderPubs();
        });
        pubFilters.appendChild(btn);
      });
    }

    if (pubSearch) {
      pubSearch.addEventListener("input", function (e) {
        query = e.target.value;
        renderPubs();
      });
    }

    renderPubs();
  }

  function renderAvatar(person, isPi) {
    if (person.photo) {
      const img = el("img", isPi ? "avatar-img avatar-img--pi" : "avatar-img");
      img.src = person.photo;
      img.alt = person.name + " headshot";
      img.loading = "lazy";
      return img;
    }
    return el("div", "avatar-placeholder", person.initials);
  }

  // Render People
  const piContainer = document.getElementById("pi-card");
  const membersContainer = document.getElementById("members-grid");
  const alumniContainer = document.getElementById("alumni-grid");

  if (window.LAB_PEOPLE) {
    const pi = window.LAB_PEOPLE.pi;
    if (piContainer && pi) {
      const top = el("div");
      top.style.display = "flex";
      top.style.flexWrap = "wrap";
      top.style.gap = "1.25rem";
      top.style.alignItems = "center";
      top.style.marginBottom = "1rem";

      top.appendChild(renderAvatar(pi, true));
      const info = el("div");
      info.appendChild(el("h3", "", pi.name));
      info.appendChild(el("div", "person-role", pi.role));
      const aff = el("div", "", pi.affiliation);
      aff.style.fontSize = "0.9rem";
      aff.style.color = "var(--text-muted)";
      info.appendChild(aff);
      top.appendChild(info);
      piContainer.appendChild(top);

      piContainer.appendChild(el("p", "", pi.bio));

      const links = el("div", "pub-links");
      links.style.marginTop = "1rem";
      if (pi.email) {
        const mail = el("a", "", pi.email);
        mail.href = "mailto:" + pi.email;
        links.appendChild(mail);
      }
      if (pi.cv) {
        const cvLink = el("a", "", "Curriculum Vitae (PDF)");
        cvLink.href = pi.cv;
        cvLink.target = "_blank";
        cvLink.rel = "noopener noreferrer";
        links.appendChild(cvLink);
      }
      (pi.links || []).forEach(function (l) {
        const a = el("a", "", l.label);
        a.href = l.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        links.appendChild(a);
      });
      piContainer.appendChild(links);
    }

    if (membersContainer && Array.isArray(window.LAB_PEOPLE.members)) {
      window.LAB_PEOPLE.members.forEach(function (m) {
        const card = el("article", "card person-card");
        card.appendChild(renderAvatar(m));
        card.appendChild(el("h3", "", m.name));
        card.appendChild(el("div", "person-role", m.role));
        card.appendChild(el("p", "", m.focus));
        membersContainer.appendChild(card);
      });
    }

    if (alumniContainer && Array.isArray(window.LAB_PEOPLE.alumni)) {
      window.LAB_PEOPLE.alumni.forEach(function (al) {
        const card = el("article", "card person-card");
        if (al.photo || al.initials) {
          card.appendChild(renderAvatar(al));
        }
        card.appendChild(el("h3", "", al.name));
        card.appendChild(el("div", "person-role", al.role));
        if (al.focus) {
          card.appendChild(el("p", "", al.focus));
        }
        if (al.nextPosition) {
          const np = el("p", "next-position");
          np.appendChild(el("strong", "", "Next Position: "));
          np.appendChild(document.createTextNode(al.nextPosition));
          card.appendChild(np);
        }
        alumniContainer.appendChild(card);
      });
    }
  }

  // Render Reflections (Faith, Quotes & Personal Notes)
  const reflContainer = document.getElementById("reflections-list");
  const reflFilters = document.getElementById("reflections-filters");
  const reflSearch = document.getElementById("reflections-search");
  if (reflContainer && Array.isArray(window.LAB_REFLECTIONS)) {
    let activeCat = "All";
    let reflQuery = "";
    function getCats(r) {
      if (Array.isArray(r.categories)) return r.categories;
      return r.category ? [r.category] : [];
    }
    const allCats = [];
    window.LAB_REFLECTIONS.forEach(function (r) {
      getCats(r).forEach(function (c) {
        if (allCats.indexOf(c) === -1) allCats.push(c);
      });
    });
    const cats = ["All"].concat(allCats);

    function renderReflections() {
      reflContainer.innerHTML = "";
      const q = reflQuery.trim().toLowerCase();
      let items = window.LAB_REFLECTIONS.filter(function (r) {
        const itemCats = getCats(r);
        const matchCat = activeCat === "All" || itemCats.indexOf(activeCat) !== -1;
        const matchQuery =
          !q ||
          r.quote.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q);
        return matchCat && matchQuery;
      });
      if (activeCat === "Quotes of the Week") {
        items = items.slice().sort(function (a, b) {
          return (b.date || "").localeCompare(a.date || "");
        });
      } else if (activeCat === "All") {
        const faithAndCulture = items.filter(function (r) {
          const c = getCats(r);
          return c.indexOf("Faith & Gospel") !== -1 || c.indexOf("Lab Culture") !== -1;
        });
        const quotesOnly = items.filter(function (r) {
          const c = getCats(r);
          return c.indexOf("Faith & Gospel") === -1 && c.indexOf("Lab Culture") === -1;
        }).sort(function (a, b) {
          return (b.date || "").localeCompare(a.date || "");
        });
        items = faithAndCulture.concat(quotesOnly);
      }
      if (items.length === 0) {
        reflContainer.appendChild(el("p", "section-subtitle", "No matching reflections found."));
        return;
      }
      items.forEach(function (r) {
        const card = el("article", "reflection-card");
        const tagsRow = el("div");
        tagsRow.style.display = "flex";
        tagsRow.style.flexWrap = "wrap";
        tagsRow.style.gap = "0.45rem";
        tagsRow.style.marginBottom = "0.35rem";
        getCats(r).forEach(function (c, idx) {
          const tag = el("span", "card-tag", idx === 0 && r.date ? c + " · " + r.date : c);
          tag.style.marginBottom = "0";
          tagsRow.appendChild(tag);
        });
        card.appendChild(tagsRow);
        card.appendChild(el("blockquote", "reflection-quote", "\u201C" + r.quote + "\u201D"));
        card.appendChild(el("div", "reflection-source", "- " + r.source));
        reflContainer.appendChild(card);
      });
    }

    if (reflFilters) {
      cats.forEach(function (cat) {
        const btn = el("button", "pill-btn", cat);
        btn.type = "button";
        btn.setAttribute("aria-pressed", String(cat === activeCat));
        btn.addEventListener("click", function () {
          activeCat = cat;
          Array.from(reflFilters.children).forEach(function (b) {
            b.setAttribute("aria-pressed", String(b.textContent === activeCat));
          });
          renderReflections();
        });
        reflFilters.appendChild(btn);
      });
    }

    if (reflSearch) {
      reflSearch.addEventListener("input", function (e) {
        reflQuery = e.target.value;
        renderReflections();
      });
    }

    renderReflections();
  }
})();
