document.addEventListener("DOMContentLoaded", function () {
  const userLang = navigator.language || navigator.userLanguage;
  const savedLang = localStorage.getItem("preferredLanguage");

  // Get current page filename or default to 'index.html' if root is accessed
  const currentPath = window.location.pathname;
  let fileName = currentPath.substring(currentPath.lastIndexOf("/") + 1);

  // If visiting the root ("/"), assume "index.html"
  if (fileName === "" || fileName === "/") {
    fileName = "index.html";
  }

  // Determine if the current page is Spanish
  const isSpanish = fileName.includes("-es.html");

  // Extract base filename (removing "-es" if present)
  const baseFileName = isSpanish
    ? fileName.replace("-es.html", ".html")
    : fileName;

  // Determine English and Spanish versions correctly
  const englishVersion = baseFileName; // Already has .html
  const spanishVersion = baseFileName.replace(".html", "-es.html"); // Ensure proper naming

  // Auto-detect language and redirect (only if no preference is set)
  if (!savedLang) {
    if (userLang.startsWith("es") && !isSpanish) {
      localStorage.setItem("preferredLanguage", "es");
      window.location.href = spanishVersion;
    } else if (!userLang.startsWith("es") && isSpanish) {
      localStorage.setItem("preferredLanguage", "en");
      window.location.href = englishVersion;
    }
  }

  // Language Switcher
  const languageSwitcher = document.querySelectorAll(".language-switcher");
  languageSwitcher.forEach((langSwitch) => {
    if (langSwitch) {
      let selectedLanguage = savedLang || (isSpanish ? "es" : "en");

      // If we're on the base domain ("/"), ensure it matches the actual file displayed
      if (
        currentPath === "" ||
        currentPath === "/" ||
        currentPath === "/index.html"
      ) {
        selectedLanguage = "en"; // Since index.html is the default English page
      }

      langSwitch.value = selectedLanguage;

      langSwitch.addEventListener("change", function () {
        const selectedLang = langSwitch.value;
        localStorage.setItem("preferredLanguage", selectedLang);
        window.location.href =
          selectedLang === "es" ? spanishVersion : englishVersion;
      });
    }
  });
});
