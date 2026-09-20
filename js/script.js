/* =========================================================
   PORTFOLIO - MAIN SCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            navLinks.classList.toggle("mobile-open");

            const isOpen = navLinks.classList.contains("mobile-open");

            menuToggle.setAttribute("aria-expanded", isOpen);

            menuToggle.textContent = isOpen ? "✕" : "☰";
        });


        /* Close menu after clicking a link */

        navLinks.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("mobile-open");

                menuToggle.setAttribute("aria-expanded", "false");

                menuToggle.textContent = "☰";
            });

        });
    }


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const sections = document.querySelectorAll("section[id]");
    const navItems = document.querySelectorAll(".nav-links a");

    if (sections.length && navItems.length) {

        const updateActiveNav = () => {

            let currentSection = "";

            sections.forEach(section => {

                const sectionTop = section.offsetTop - 150;
                const sectionHeight = section.offsetHeight;

                if (
                    window.scrollY >= sectionTop &&
                    window.scrollY < sectionTop + sectionHeight
                ) {
                    currentSection = section.getAttribute("id");
                }

            });

            navItems.forEach(link => {

                link.classList.remove("active");

                const href = link.getAttribute("href");

                if (href === `#${currentSection}`) {
                    link.classList.add("active");
                }

            });
        };

        window.addEventListener("scroll", updateActiveNav);

        updateActiveNav();
    }


    /* =====================================================
       SMOOTH SCROLL
    ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const yearElements = document.querySelectorAll("[data-year]");

    yearElements.forEach(element => {
        element.textContent = new Date().getFullYear();
    });

});