import * as THREE from "three";

const container = document.getElementById("three-background");

if (container) {
    startBackground(container);
}


/* =========================================================
   ENTRY POINT
========================================================= */

function startBackground(container) {

    let renderer = null;

    try {
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: window.innerWidth > 900,
            powerPreference: "default",
            failIfMajorPerformanceCaveat: false
        });
    } catch (err) {
        console.warn("WebGL unavailable, using 2D fallback.", err);
        start2DFallback(container);
        return;
    }

    if (!renderer || !renderer.getContext()) {
        start2DFallback(container);
        return;
    }

    startWebGL(container, renderer);
}


/* =========================================================
   WEBGL BACKGROUND
========================================================= */

function startWebGL(container, renderer) {

    const isMobile = Math.min(window.innerWidth, window.innerHeight) < 700;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        60,
        1,
        0.1,
        100
    );

    camera.position.z = 12;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.domElement.style.display = "block";

    container.innerHTML = "";
    container.appendChild(renderer.domElement);


    /* -----------------------------------------------------
       VIEW BOUNDS — recalculated from camera frustum
       so the network always fills the screen, portrait too
    ----------------------------------------------------- */

    const bounds = {
        x: 18,
        y: 10
    };

    function updateBounds(width, height) {

        const aspect = width / height;

        camera.aspect = aspect;
        camera.updateProjectionMatrix();

        const vFov = (camera.fov * Math.PI) / 180;

        const visibleHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
        const visibleWidth = visibleHeight * aspect;

        // 1.25 = slight overflow so nodes wrap off-screen, not mid-screen
        bounds.x = visibleWidth * 1.25;
        bounds.y = visibleHeight * 1.25;
    }


    function currentSize() {
        return {
            width: container.clientWidth || window.innerWidth,
            height: container.clientHeight || window.innerHeight
        };
    }

    let size = currentSize();

    updateBounds(size.width, size.height);
    renderer.setSize(size.width, size.height, false);


    /* -----------------------------------------------------
       NETWORK SETTINGS
    ----------------------------------------------------- */

    const nodeCount = isMobile ? 38 : 60;

    // distance scales with how wide the view actually is
    const connectionDistance = Math.max(2.2, bounds.x * 0.16);

    const nodes = [];
    const connections = [];
    const particles = [];


    /* -----------------------------------------------------
       NODES
    ----------------------------------------------------- */

    const nodeGeometry = new THREE.SphereGeometry(isMobile ? 0.07 : 0.055, 8, 8);

    const nodeMaterial = new THREE.MeshBasicMaterial({
        color: 0xe39808
    });

    for (let i = 0; i < nodeCount; i++) {

        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);

        node.position.set(
            (Math.random() - 0.5) * bounds.x,
            (Math.random() - 0.5) * bounds.y,
            (Math.random() - 0.5) * 2
        );

        node.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.006,
            (Math.random() - 0.5) * 0.006,
            0
        );

        node.userData.offset = Math.random() * Math.PI * 2;

        scene.add(node);
        nodes.push(node);
    }


    /* -----------------------------------------------------
       CONNECTION LINES
    ----------------------------------------------------- */

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x8b1e2d,
        transparent: true,
        opacity: isMobile ? 0.42 : 0.28
    });

    for (let i = 0; i < nodeCount; i++) {

        for (let j = i + 1; j < nodeCount; j++) {

            const distance = nodes[i].position.distanceTo(nodes[j].position);

            if (distance < connectionDistance) {

                const geometry = new THREE.BufferGeometry();

                geometry.setAttribute(
                    "position",
                    new THREE.BufferAttribute(new Float32Array(6), 3)
                );

                const line = new THREE.Line(geometry, lineMaterial);

                line.userData.nodeA = i;
                line.userData.nodeB = j;

                scene.add(line);
                connections.push(line);
            }
        }
    }


    /* -----------------------------------------------------
       MOVING PARTICLES
    ----------------------------------------------------- */

    const particleGeometry = new THREE.SphereGeometry(isMobile ? 0.045 : 0.035, 6, 6);

    const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xe39808
    });

    const particleCount = isMobile ? 12 : 20;

    for (let i = 0; i < particleCount; i++) {

        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        particle.position.set(
            (Math.random() - 0.5) * bounds.x,
            (Math.random() - 0.5) * bounds.y,
            (Math.random() - 0.5) * 2
        );

        particle.userData.speed = 0.006 + Math.random() * 0.004;
        particle.userData.offset = Math.random() * Math.PI * 2;

        scene.add(particle);
        particles.push(particle);
    }


    /* -----------------------------------------------------
       POINTER / TOUCH PARALLAX
    ----------------------------------------------------- */

    const pointer = { x: 0, y: 0 };

    window.addEventListener("mousemove", (event) => {
        pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener("touchmove", (event) => {

        const touch = event.touches[0];
        if (!touch) return;

        pointer.x = (touch.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (touch.clientY / window.innerHeight - 0.5) * 2;

    }, { passive: true });

    // Phones without pointer movement still get gentle drift
    let autoDrift = isMobile;


    /* -----------------------------------------------------
       ANIMATION
    ----------------------------------------------------- */

    const clock = new THREE.Clock();
    let running = true;

    document.addEventListener("visibilitychange", () => {
        running = !document.hidden;
        if (running) clock.getDelta();
    });

    function wrap(object) {

        const halfX = bounds.x / 2;
        const halfY = bounds.y / 2;

        if (object.position.x > halfX) object.position.x = -halfX;
        if (object.position.x < -halfX) object.position.x = halfX;
        if (object.position.y > halfY) object.position.y = -halfY;
        if (object.position.y < -halfY) object.position.y = halfY;
    }

    function animate() {

        requestAnimationFrame(animate);

        if (!running) return;

        const delta = Math.min(clock.getDelta(), 0.033);
        const time = clock.elapsedTime;

        nodes.forEach((node) => {

            const velocity = node.userData.velocity;
            const offset = node.userData.offset;

            node.position.x += velocity.x * delta * 60;
            node.position.y += velocity.y * delta * 60;

            node.position.x += Math.sin(time * 0.45 + offset) * 0.0015;
            node.position.y += Math.cos(time * 0.4 + offset) * 0.0015;

            wrap(node);
        });

        connections.forEach((line) => {

            const a = nodes[line.userData.nodeA].position;
            const b = nodes[line.userData.nodeB].position;

            const positions = line.geometry.attributes.position.array;

            positions[0] = a.x;
            positions[1] = a.y;
            positions[2] = a.z;

            positions[3] = b.x;
            positions[4] = b.y;
            positions[5] = b.z;

            line.geometry.attributes.position.needsUpdate = true;
        });

        particles.forEach((particle) => {

            particle.position.x += particle.userData.speed * delta * 60;

            particle.position.y +=
                Math.sin(time * 0.8 + particle.userData.offset) * 0.002;

            wrap(particle);
        });

        const targetY = autoDrift
            ? Math.sin(time * 0.15) * 0.06
            : pointer.x * 0.07;

        const targetX = autoDrift
            ? Math.cos(time * 0.12) * 0.03
            : -pointer.y * 0.035;

        scene.rotation.y += (targetY - scene.rotation.y) * 0.025;
        scene.rotation.x += (targetX - scene.rotation.x) * 0.025;

        renderer.render(scene, camera);
    }

    animate();


    /* -----------------------------------------------------
       RESIZE — ignores mobile URL-bar height jitter
    ----------------------------------------------------- */

    let resizeTimer = null;

    function handleResize() {

        const next = currentSize();

        const widthChanged = Math.abs(next.width - size.width) > 1;
        const heightChanged = Math.abs(next.height - size.height) > 120;

        if (!widthChanged && !heightChanged) return;

        size = next;

        updateBounds(size.width, size.height);

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2)
        );

        renderer.setSize(size.width, size.height, false);
    }

    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 150);
    });

    window.addEventListener("orientationchange", () => {
        setTimeout(handleResize, 300);
    });


    /* -----------------------------------------------------
       CONTEXT LOSS (common on low-memory phones)
    ----------------------------------------------------- */

    renderer.domElement.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        running = false;
        console.warn("WebGL context lost — switching to 2D fallback.");
        start2DFallback(container);
    });
}


/* =========================================================
   2D CANVAS FALLBACK
========================================================= */

function start2DFallback(container) {

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    container.innerHTML = "";
    container.appendChild(canvas);

    let width = 0;
    let height = 0;
    let dots = [];

    const dpr = Math.min(window.devicePixelRatio, 1.5);

    function resize() {

        width = container.clientWidth || window.innerWidth;
        height = container.clientHeight || window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.round((width * height) / 22000);

        dots = Array.from({ length: Math.min(count, 60) }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35
        }));
    }

    resize();

    let resizeTimer = null;

    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 200);
    });

    const linkDistance = () => Math.min(width, height) * 0.22;

    function draw() {

        requestAnimationFrame(draw);

        ctx.clearRect(0, 0, width, height);

        const maxDistance = linkDistance();

        for (const dot of dots) {

            dot.x += dot.vx;
            dot.y += dot.vy;

            if (dot.x < 0) dot.x = width;
            if (dot.x > width) dot.x = 0;
            if (dot.y < 0) dot.y = height;
            if (dot.y > height) dot.y = 0;
        }

        for (let i = 0; i < dots.length; i++) {

            for (let j = i + 1; j < dots.length; j++) {

                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;

                const distance = Math.hypot(dx, dy);

                if (distance < maxDistance) {

                    ctx.strokeStyle =
                        "rgba(139, 30, 45, " +
                        (0.45 * (1 - distance / maxDistance)).toFixed(3) +
                        ")";

                    ctx.lineWidth = 1;

                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    ctx.stroke();
                }
            }
        }

        ctx.fillStyle = "#E39808";

        for (const dot of dots) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    draw();
}