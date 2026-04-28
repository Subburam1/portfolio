document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('particle-canvas');

    if (canvas) {
        const context = canvas.getContext('2d');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const state = {
            width: 0,
            height: 0,
            mouseX: null,
            mouseY: null,
            particles: []
        };

        function createParticles() {
            const particleCount = reducedMotion ? 18 : 40;
            state.particles = Array.from({ length: particleCount }, function () {
                return {
                    x: Math.random() * state.width,
                    y: Math.random() * state.height,
                    vx: (Math.random() - 0.5) * (reducedMotion ? 0.08 : 0.26),
                    vy: (Math.random() - 0.5) * (reducedMotion ? 0.08 : 0.26),
                    radius: Math.random() * 1.6 + 0.8
                };
            });
        }

        function resizeCanvas() {
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            state.width = window.innerWidth;
            state.height = window.innerHeight;
            canvas.width = state.width * pixelRatio;
            canvas.height = state.height * pixelRatio;
            canvas.style.width = state.width + 'px';
            canvas.style.height = state.height + 'px';
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            createParticles();
        }

        function drawConnection(first, second) {
            const dx = first.x - second.x;
            const dy = first.y - second.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 150) {
                return;
            }

            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.strokeStyle = 'rgba(15, 23, 42, ' + (0.12 - distance / 1250) + ')';
            context.lineWidth = 1;
            context.stroke();
        }

        function updateParticle(particle) {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < -20) {
                particle.x = state.width + 20;
            } else if (particle.x > state.width + 20) {
                particle.x = -20;
            }

            if (particle.y < -20) {
                particle.y = state.height + 20;
            } else if (particle.y > state.height + 20) {
                particle.y = -20;
            }

            if (state.mouseX !== null && state.mouseY !== null) {
                const dx = particle.x - state.mouseX;
                const dy = particle.y - state.mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const force = (150 - distance) / 150;
                    particle.x += dx * force * 0.02;
                    particle.y += dy * force * 0.02;
                }
            }
        }

        function renderBackground() {
            context.clearRect(0, 0, state.width, state.height);

            const glow = context.createRadialGradient(
                state.mouseX || state.width * 0.72,
                state.mouseY || state.height * 0.22,
                0,
                state.mouseX || state.width * 0.72,
                state.mouseY || state.height * 0.22,
                220
            );
            glow.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
            glow.addColorStop(1, 'rgba(59, 130, 246, 0)');
            context.fillStyle = glow;
            context.fillRect(0, 0, state.width, state.height);

            state.particles.forEach(function (particle) {
                updateParticle(particle);
            });

            for (let index = 0; index < state.particles.length; index += 1) {
                const particle = state.particles[index];

                for (let nextIndex = index + 1; nextIndex < state.particles.length; nextIndex += 1) {
                    drawConnection(particle, state.particles[nextIndex]);
                }
            }

            state.particles.forEach(function (particle) {
                context.beginPath();
                context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                context.fillStyle = 'rgba(15, 23, 42, 0.16)';
                context.fill();
            });

            if (reducedMotion) {
                return;
            }

            requestAnimationFrame(renderBackground);
        }

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('pointermove', function (event) {
            state.mouseX = event.clientX;
            state.mouseY = event.clientY;
        }, { passive: true });

        window.addEventListener('pointerleave', function () {
            state.mouseX = null;
            state.mouseY = null;
        });

        resizeCanvas();

        if (reducedMotion) {
            renderBackground();
        } else {
            requestAnimationFrame(renderBackground);
        }
    }

    const revealTargets = document.querySelectorAll(
        '.fade-in, .slide-up, .hero h1, .subtitle, .hero-summary, .location, .cta-buttons, .theme-switcher, .hero-preview, .studio-card, .info-card, .skill-card, .project-card, .cert-item, .contact-link, .section-title'
    );

    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: '0px 0px -60px 0px'
        }
    );

    revealTargets.forEach(function (target) {
        observer.observe(target);
    });

    const navLinks = document.querySelectorAll('.nav-links a');
    const sectionMap = {
        home: '#hero',
        about: '#about',
        skills: '#skills',
        projects: '#projects',
        certifications: '#certifications',
        contact: '#contact'
    };

    navLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();

            const label = link.textContent.trim().toLowerCase();
            const targetSelector = sectionMap[label];
            const targetSection = targetSelector ? document.querySelector(targetSelector) : null;

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const sections = document.querySelectorAll('section[id]');

    function setActiveNavLink() {
        let currentId = 'hero';

        sections.forEach(function (section) {
            const sectionTop = section.offsetTop - 140;
            if (window.scrollY >= sectionTop) {
                currentId = section.id;
            }
        });

        navLinks.forEach(function (link) {
            const linkText = link.textContent.trim().toLowerCase();
            const isActive =
                (linkText === 'home' && currentId === 'hero') ||
                linkText === currentId;

            link.classList.toggle('active', isActive);
        });
    }

    setActiveNavLink();
    window.addEventListener('scroll', setActiveNavLink, { passive: true });

    const studioCards = document.querySelectorAll('.studio-card');
    studioCards.forEach(function (card) {
        card.addEventListener('mouseenter', function () {
            studioCards.forEach(function (otherCard) {
                otherCard.classList.toggle('active', otherCard === card);
            });
        });

        card.addEventListener('focus', function () {
            studioCards.forEach(function (otherCard) {
                otherCard.classList.toggle('active', otherCard === card);
            });
        });
    });

    const themeChips = document.querySelectorAll('.theme-chip');
    themeChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            const selectedTheme = chip.getAttribute('data-ui-theme');
            document.body.setAttribute('data-theme', selectedTheme);
            localStorage.setItem('preferredTheme', selectedTheme);
            themeChips.forEach(function (otherChip) {
                otherChip.classList.toggle('active', otherChip === chip);
            });
        });
    });
    
    // Load saved theme on page load
    const savedTheme = localStorage.getItem('preferredTheme') || 'editorial';
    document.body.setAttribute('data-theme', savedTheme);
    const activeThemeChip = document.querySelector('[data-ui-theme="' + savedTheme + '"]');
    if (activeThemeChip) {
        themeChips.forEach(chip => chip.classList.remove('active'));
        activeThemeChip.classList.add('active');
    }
});