/* =========================================================
   PORTFOLIO - INTERACTIVE MOTION SYSTEM
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /* =====================================================
       1. REPEATING SCROLL REVEAL
       ===================================================== */

    const revealElements = document.querySelectorAll(
        ".section-header, .project-card, .skill-card, " +
        ".experience-card, .education-card, " +
        ".about-content, .contact-wrapper, .stat"
    );

    if (!reduceMotion && "IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("is-visible");

                    } else {

                        /* Reset when leaving viewport */
                        entry.target.classList.remove("is-visible");

                    }

                });

            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -80px 0px"
            }
        );

        revealElements.forEach((element, index) => {

            element.classList.add("reveal");

            if (
                element.classList.contains("project-card") ||
                element.classList.contains("skill-card") ||
                element.classList.contains("education-card")
            ) {

                element.classList.add(
                    index % 2 === 0
                        ? "reveal-left"
                        : "reveal-right"
                );

            } else {

                element.classList.add("reveal-up");

            }

            element.style.setProperty(
                "--delay",
                `${(index % 5) * 0.09}s`
            );

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });

    }


    /* =====================================================
       2. ADVANCED CARD TILT
       ===================================================== */

    const cards = document.querySelectorAll(
        ".project-card, .skill-card, .education-card, .experience-card"
    );

    if (!reduceMotion) {

        cards.forEach(card => {

            card.addEventListener("mousemove", event => {

                const rect = card.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;

                const percentX =
                    (x / rect.width) - 0.5;

                const percentY =
                    (y / rect.height) - 0.5;

                const rotateX =
                    percentY * -9;

                const rotateY =
                    percentX * 9;

                const moveX =
                    percentX * 8;

                const moveY =
                    percentY * 8;

                card.style.setProperty(
                    "--mouse-x",
                    `${x}px`
                );

                card.style.setProperty(
                    "--mouse-y",
                    `${y}px`
                );

                card.style.transform =
                    `perspective(1000px)
                     rotateX(${rotateX}deg)
                     rotateY(${rotateY}deg)
                     translate3d(${moveX}px, ${moveY}px, 0)
                     scale(1.025)`;

                card.classList.add("cursor-active");

            });


            card.addEventListener("mouseleave", () => {

                card.style.transform =
                    "perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0,0,0) scale(1)";

                card.classList.remove("cursor-active");

            });

        });

    }


    /* =====================================================
       3. GLOBAL CURSOR GLOW
       ===================================================== */

    if (!reduceMotion) {

        const cursorGlow =
            document.createElement("div");

        cursorGlow.className =
            "cursor-glow";

        document.body.appendChild(cursorGlow);

        let mouseX = 0;
        let mouseY = 0;

        let glowX = 0;
        let glowY = 0;

        window.addEventListener("mousemove", event => {

            mouseX = event.clientX;
            mouseY = event.clientY;

        });

        function animateCursor() {

            glowX += (mouseX - glowX) * 0.12;
            glowY += (mouseY - glowY) * 0.12;

            cursorGlow.style.transform =
                `translate3d(${glowX}px, ${glowY}px, 0)`;

            requestAnimationFrame(animateCursor);

        }

        animateCursor();


        /* Bigger glow on interactive elements */

        const interactiveElements =
            document.querySelectorAll(
                "a, button, .project-card, .skill-card, .education-card"
            );

        interactiveElements.forEach(element => {

            element.addEventListener("mouseenter", () => {
                cursorGlow.classList.add("cursor-hover");
            });

            element.addEventListener("mouseleave", () => {
                cursorGlow.classList.remove("cursor-hover");
            });

        });

    }


    /* =====================================================
       4. MAGNETIC BUTTONS
       ===================================================== */

    const buttons = document.querySelectorAll(
        ".btn, .project-link, .certificate-link"
    );

    if (!reduceMotion) {

        buttons.forEach(button => {

            button.addEventListener("mousemove", event => {

                const rect =
                    button.getBoundingClientRect();

                const x =
                    event.clientX -
                    rect.left -
                    rect.width / 2;

                const y =
                    event.clientY -
                    rect.top -
                    rect.height / 2;

                button.style.transform =
                    `translate(${x * 0.16}px, ${y * 0.16}px)`;

            });

            button.addEventListener("mouseleave", () => {

                button.style.transform = "";

            });

        });

    }


    /* =====================================================
       5. SCROLL PARALLAX
       ===================================================== */

    const parallaxElements =
        document.querySelectorAll(
            ".section-header, .hero-visual, .about-content"
        );

    let ticking = false;

    function updateParallax() {

        const scrollY =
            window.scrollY;

        parallaxElements.forEach(element => {

            const rect =
                element.getBoundingClientRect();

            const center =
                rect.top + rect.height / 2;

            const distance =
                center - window.innerHeight / 2;

            const movement =
                distance * -0.025;

            if (
                rect.bottom > -200 &&
                rect.top < window.innerHeight + 200
            ) {

                element.style.setProperty(
                    "--parallax-y",
                    `${movement}px`
                );

            }

        });

        ticking = false;

    }

    window.addEventListener("scroll", () => {

        if (!ticking) {

            requestAnimationFrame(updateParallax);

            ticking = true;

        }

    }, { passive: true });


    /* =====================================================
       6. NAVBAR
       ===================================================== */

    const navbar =
        document.querySelector(".navbar");

    if (navbar) {

        window.addEventListener(
            "scroll",
            () => {

                if (window.scrollY > 40) {

                    navbar.classList.add("scrolled");

                } else {

                    navbar.classList.remove("scrolled");

                }

            },
            { passive: true }
        );

    }


    /* =====================================================
       7. CONTINUOUS ORBIT ROTATION
       ===================================================== */

    const orbitOne =
        document.querySelector(".orbit-one");

    const orbitTwo =
        document.querySelector(".orbit-two");

    const orbitThree =
        document.querySelector(".orbit-three");

    if (!reduceMotion) {

        let rotationOne = 0;
        let rotationTwo = 55;
        let rotationThree = -55;

        function animateOrbits() {

            rotationOne += 0.18;
            rotationTwo += 0.12;
            rotationThree -= 0.08;

            if (orbitOne) {

                orbitOne.style.transform =
                    `rotate(${rotationOne}deg)`;

            }

            if (orbitTwo) {

                orbitTwo.style.transform =
                    `rotate(${rotationTwo}deg)`;

            }

            if (orbitThree) {

                orbitThree.style.transform =
                    `rotate(${rotationThree}deg)`;

            }

            requestAnimationFrame(animateOrbits);

        }

        animateOrbits();

    }


    /* =====================================================
       8. BUTTON RIPPLE
       ===================================================== */

    buttons.forEach(button => {

        button.addEventListener("click", event => {

            const ripple =
                document.createElement("span");

            ripple.className =
                "button-ripple";

            const rect =
                button.getBoundingClientRect();

            ripple.style.left =
                `${event.clientX - rect.left}px`;

            ripple.style.top =
                `${event.clientY - rect.top}px`;

            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 700);

        });

    });


    /* =====================================================
       9. SMOOTH ANCHOR SCROLL
       ===================================================== */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(link => {

        link.addEventListener("click", event => {

            const id =
                link.getAttribute("href");

            if (!id || id === "#") return;

            const target =
                document.querySelector(id);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: reduceMotion
                    ? "auto"
                    : "smooth",
                block: "start"
            });

        });

    });

});