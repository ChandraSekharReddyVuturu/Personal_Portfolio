/**
 * Vuturu Chandra Sekhar Reddy - Portfolio Website Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initParticleSystem();
    initCursorGlow();
    initTypewriter();
    initMobileNavigation();
    initScrollInteractions();
    initContactForm();
});

/* ==========================================================================
   1. Interactive Canvas Particle Background
   ========================================================================== */
function initParticleSystem() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    let scale = window.devicePixelRatio || 1;
    let width, height;
    
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * scale;
        canvas.height = height * scale;
        ctx.scale(scale, scale);
        
        // Re-initialize particles on resize
        initParticles();
    }
    
    window.addEventListener('resize', () => {
        // Debounce resize to prevent stuttering
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(resizeCanvas, 150);
    });

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            // Check boundaries
            if (this.x > width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Mouse interact (push away slightly)
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Move away from mouse
                    this.x -= dx / distance * force * 2;
                    this.y -= dy / distance * force * 2;
                }
            }

            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;
            
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        // Determine number of particles based on screen width (fewer on mobile)
        const numberOfParticles = Math.min(Math.floor((width * height) / 11000), 100);
        
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 0.8;
            let x = (Math.random() * ((width - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((height - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            
            // Randomly style color: 60% cyan, 40% purple
            let color = Math.random() > 0.4 ? 'rgba(0, 242, 254, 0.25)' : 'rgba(157, 78, 221, 0.25)';
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Connect particles with translucent gradient lines
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 110) {
                    opacityValue = 1 - (distance / 110);
                    ctx.strokeStyle = `rgba(0, 242, 254, ${opacityValue * 0.12})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
        requestAnimationFrame(animate);
    }

    // Initialize
    resizeCanvas();
    animate();
}

/* ==========================================================================
   2. Custom Cursor Glow Effect
   ========================================================================== */
function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    
    // Smooth interpolation factor
    const ease = 0.08; 

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    function updateGlowPosition() {
        // Lerp coordinates for lag-free trailing effect
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;
        
        glow.style.left = `${currentX}px`;
        glow.style.top = `${currentY}px`;
        
        requestAnimationFrame(updateGlowPosition);
    }
    
    // Start animation loop
    updateGlowPosition();
}

/* ==========================================================================
   3. Tagline Auto-Typewriter Animation
   ========================================================================== */
function initTypewriter() {
    const textElement = document.getElementById('typed-text');
    if (!textElement) return;

    const words = [
        "Full Stack & Java Developer",
        "Spring Boot & Backend Engineer",
        "AI & Machine Learning Developer",
        "Software Problem Solver"
    ];
    
    let wordIndex = 0;
    let letterIndex = 0;
    let isDeleting = false;
    let currentText = '';

    function type() {
        const fullWord = words[wordIndex];
        
        if (isDeleting) {
            currentText = fullWord.substring(0, letterIndex - 1);
            letterIndex--;
        } else {
            currentText = fullWord.substring(0, letterIndex + 1);
            letterIndex++;
        }
        
        textElement.textContent = currentText;
        
        let typingSpeed = 80;
        
        if (isDeleting) {
            typingSpeed /= 2; // Delete twice as fast
        }
        
        if (!isDeleting && currentText === fullWord) {
            typingSpeed = 2200; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 400; // Pause before starting next word
        }
        
        setTimeout(type, typingSpeed);
    }

    // Start typewriter
    setTimeout(type, 1000);
}

/* ==========================================================================
   4. Mobile Navigation Drawer / Side Panel
   ========================================================================== */
function initMobileNavigation() {
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    const backdrop = document.getElementById('menu-backdrop');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!hamburger || !navMenu || !backdrop) return;

    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        backdrop.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    hamburger.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', closeMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });
}

/* ==========================================================================
   5. Scroll Interactions (Indicator, Sticky Header, Scroll Reveal, Active Link)
   ========================================================================== */
function initScrollInteractions() {
    const header = document.querySelector('.navbar-header');
    const progress = document.getElementById('scroll-progress');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    
    // Intersection Observer for scroll triggers
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const skillBars = document.querySelectorAll('.progress-fill');
    
    // Active Navigation Highlighting
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    // 1. Reveal Elements on Scroll
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it is the skills section, animate progress bars
                if (entry.target.id === 'skills') {
                    animateSkillBars();
                }
                
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Helper to animate progress bars to their data-width
    function animateSkillBars() {
        skillBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width;
        });
    }

    // Scroll handler for indicators and buttons
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Progress bar width
        if (progress && scrollHeight > 0) {
            const percentage = (scrollTop / scrollHeight) * 100;
            progress.style.width = `${percentage}%`;
        }

        // Sticky header styling
        if (header) {
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Scroll to Top visibility
        if (scrollToTopBtn) {
            if (scrollTop > 400) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }

        // Highlight Active Link matching Current Section
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    // Scroll-to-Top Button trigger click
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/* ==========================================================================
   6. Contact Form Email Handling (FormSubmit AJAX Integration)
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const statusMsg = document.getElementById('form-status-msg');
    const submitBtn = document.getElementById('contact-submit-btn');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        if (!name || !email || !message) return;

        // UI Feedback: Sending state
        if (submitBtn) {
            submitBtn.disabled = true;
            const btnSpan = submitBtn.querySelector('span');
            if (btnSpan) btnSpan.textContent = 'Sending...';
        }

        if (statusMsg) {
            statusMsg.className = 'form-status-msg';
            statusMsg.style.display = 'none';
        }

        try {
            const response = await fetch('https://formsubmit.co/ajax/chandrasekhar2782@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message,
                    _subject: `New Portfolio Message from ${name}`
                })
            });

            const data = await response.json();

            if (response.ok && data.success !== "false") {
                if (statusMsg) {
                    statusMsg.textContent = '✓ Message sent successfully! I will get back to you soon.';
                    statusMsg.className = 'form-status-msg success';
                }
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (err) {
            console.error('Submission error:', err);
            if (statusMsg) {
                statusMsg.textContent = '✕ Could not send message automatically. Please reach out directly to chandrasekhar2782@gmail.com';
                statusMsg.className = 'form-status-msg error';
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                const btnSpan = submitBtn.querySelector('span');
                if (btnSpan) btnSpan.textContent = 'Send Message';
            }
        }
    });
}
