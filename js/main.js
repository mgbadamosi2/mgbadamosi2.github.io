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

  // Render News (Home)
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
      body.appendChild(document.createTextNode(item.text));
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

  function renderAvatar(person) {
    if (person.photo) {
      const img = el("img", "avatar-img");
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

      top.appendChild(renderAvatar(pi));
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
        const card = el("article", "card");
        card.appendChild(el("h3", "", al.name));
        card.appendChild(el("div", "person-role", al.role));
        const p = el("p", "", al.destination);
        p.style.marginTop = "0.4rem";
        card.appendChild(p);
        alumniContainer.appendChild(card);
      });
    }
  }

  // Render Reflections (Faith, Quotes & Personal Notes)
  const reflContainer = document.getElementById("reflections-list");
  const reflFilters = document.getElementById("reflections-filters");
  if (reflContainer && Array.isArray(window.LAB_REFLECTIONS)) {
    let activeCat = "All";
    const cats = ["All"].concat(
      Array.from(new Set(window.LAB_REFLECTIONS.map(function (r) { return r.category; })))
    );

    function renderReflections() {
      reflContainer.innerHTML = "";
      const items = window.LAB_REFLECTIONS.filter(function (r) {
        return activeCat === "All" || r.category === activeCat;
      });
      items.forEach(function (r) {
        const card = el("article", "reflection-card");
        card.appendChild(el("span", "card-tag", r.category));
        card.appendChild(el("blockquote", "reflection-quote", "\u201C" + r.quote + "\u201D"));
        card.appendChild(el("div", "reflection-source", "— " + r.source));
        if (r.note) {
          card.appendChild(el("p", "reflection-note", r.note));
        }
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

    renderReflections();
  }
})();
