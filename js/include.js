// Injecte le header
fetch("/header.html")
  .then(r => r.text())
  .then(html => { const h = document.getElementById("site-header"); if (h) h.innerHTML = html; })
  .catch(() => {});

// Au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("site-content");

  // IMPORTANT : si la page fournit déjà son HTML (contact/merci), on NE charge PAS le Markdown
  const skipMd =
    (container && container.hasAttribute("data-raw")) ||
    document.body.matches(".page-contact, .page-merci");

  if (skipMd || !container) return;

  // Déduire le fichier Markdown à partir de l’URL
  const rawPath = window.location.pathname.replace(/\/$/, "");
  const path = rawPath.replace(/\.html$/, "");
  const contentFile = "/content" + (path || "/index") + ".md";

  fetch(contentFile)
    .then(r => { if (!r.ok) throw new Error("Not found"); return r.text(); })
    .then(md => {
      // Front matter simple
      let meta = {};
      if (md.startsWith("---")) {
        const end = md.indexOf("\n---", 3);
        if (end !== -1) {
          const fm = md.slice(3, end).trim();
          md = md.slice(end + 4).trim();
          fm.split("\n").forEach(line => {
            const i = line.indexOf(":");
            if (i > -1) meta[line.slice(0,i).trim()] = line.slice(i+1).trim().replace(/^"|"$/g, "");
          });
        }
      }

      container.insertAdjacentHTML("beforeend", marked.parse(md));
      if (meta.title) document.title = meta.title + " – Ivry Échecs";
    })
    .catch(() => {
      if (!container.innerHTML.trim()) container.innerHTML = "<p>Contenu introuvable.</p>";
    });
});
