function createSitePet(gfx, phrases = [], promotional = false) {
    if (!gfx) {
        gfx = 'sprite';
    }
    const ANI = {
        IDEL1: 0,
        IDEL2: 1,
        IDEL3: 2,
        RIGHT: 3,
        DOWN: 4,
        LEFT: 5,
        UP: 6,
        PET: 7,
        SLEEP: 8
    };

    const MODES = {
        RANDOM: 'random',
        FOLLOW: 'follow',
        FLEE: 'flee',
        CURIOUS: 'curious',
        SLEEPY: 'sleepy',
        PROMOTIONAL: 'promotional'
    };

    var ele = document.createElement("div");
    ele.style.position = 'fixed';
    ele.style.width = '64px';
    ele.style.height = '64px';
    ele.style.backgroundImage = `url(img/pet1.png)`;
    ele.style.backgroundRepeat = 'no-repeat';
    ele.style.backgroundPosition = '0px 0px';
    ele.style.zIndex = '1000';
    document.body.appendChild(ele);

    var speechBubble = document.createElement("div");
    speechBubble.style.position = 'fixed';
    speechBubble.style.backgroundColor = 'white';
    speechBubble.style.border = '2px solid black';
    speechBubble.style.borderRadius = '10px';
    speechBubble.style.padding = '8px';
    speechBubble.style.maxWidth = '200px';
    speechBubble.style.zIndex = '1000';
    speechBubble.style.display = 'none';
    speechBubble.style.fontSize = '14px';
    speechBubble.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(speechBubble);

    const MaxFrame = 8;
    var anim = 0;
    var frame = 0;
    var sleep = 0;
    // Start the pet at a safer position on screen
    var x = 64; // Start slightly inside the screen instead of -64
    var y = Math.floor(Math.floor(window.innerHeight / 2) / 64) * 64;
    var moving = false;
    var mouseX = 0;
    var mouseY = 0;
    var petCount = 0;
    var currentMode = promotional ? MODES.PROMOTIONAL : MODES.RANDOM;
    var modeTimer = 0;
    var modeChangeCooldown = 0;
    var navbarHeight = 70; // Estimated navbar height + safety margin
    var targetElement = null; // Track the current target element in CURIOUS mode
    var exploreAttempts = 0; // Track how many attempts we've made to explore the current element

    // Last position to detect if pet is stuck
    var lastX = x;
    var lastY = y;
    var stuckCounter = 0;

    // Ensure the pet doesn't enter the navbar area
    if (y < navbarHeight) {
        y = navbarHeight;
    }

    ele.style.top = `${y}px`;
    ele.style.left = `${x}px`;
    ele.style.transition = 'top 1500ms linear, left 1500ms linear';

    var usedPhrases = [];
    var currentPromotionalIndex = 0;
    var lastInteractionTime = Date.now();

    var setAnim = (a) => {
        frame = 0;
        anim = a;
    };

    var updateSpeechBubblePosition = () => {
        // Position speech bubble based on pet's direction
        let bubbleX = x;
        let bubbleY = y;

        // Adjust based on animation direction
        if (anim === ANI.LEFT) {
            bubbleX = x - 150; // Bubble to the left
            bubbleY = y - 30;
        } else {
            bubbleX = x + 70; // Default to the right
            bubbleY = y - 30;
        }

        // Make sure bubble stays on screen
        if (bubbleX < 10) bubbleX = 10;
        if (bubbleX + 200 > window.innerWidth) bubbleX = window.innerWidth - 210;
        if (bubbleY < 10) bubbleY = 10;
        if (bubbleY + 100 > window.innerHeight) bubbleY = window.innerHeight - 110;

        speechBubble.style.left = `${bubbleX}px`;
        speechBubble.style.top = `${bubbleY}px`;
    };

    var showPhrase = (phrase) => {
        speechBubble.textContent = phrase;
        speechBubble.style.display = 'block';
        updateSpeechBubblePosition();

        setTimeout(() => {
            speechBubble.style.display = 'none';
        }, 7000);
    };

    var showRandomPhrase = () => {
        // If sleeping, just show sleep message
        if (sleep > 0 && anim === ANI.SLEEP) {
            showPhrase("Zzzz... Estou com sono...");
            return;
        }

        if (usedPhrases.length >= phrases.length && phrases.length > 0) {
            usedPhrases = [];
        }

        if (phrases.length === 0) return;

        let availablePhrases = phrases.filter(phrase => !usedPhrases.includes(phrase));
        if (availablePhrases.length === 0) {
            usedPhrases = [];
            availablePhrases = phrases;
        }

        const randomIndex = Math.floor(Math.random() * availablePhrases.length);
        const selectedPhrase = availablePhrases[randomIndex];

        usedPhrases.push(selectedPhrase);
        showPhrase(selectedPhrase);
    };

    var showPromotionalPhrase = () => {
        if (phrases.length === 0) return;

        // Move to next promotional phrase in sequence
        currentPromotionalIndex = (currentPromotionalIndex + 1) % phrases.length;
        showPhrase(phrases[currentPromotionalIndex]);
    };

    var changeMode = (newMode) => {
        console.log(`Changing mode to ${newMode}`);

        // In promotional mode, ignore changes that aren't PROMOTIONAL or FLEE
        if (promotional && newMode !== MODES.PROMOTIONAL && newMode !== MODES.FLEE) {
            newMode = MODES.PROMOTIONAL;
        }

        if (modeChangeCooldown <= 0) {
            // Reset exploration state when changing modes
            targetElement = null;
            exploreAttempts = 0;

            currentMode = newMode;
            modeTimer = {
                [MODES.RANDOM]: 50 + Math.floor(Math.random() * 100),
                [MODES.FOLLOW]: 30 + Math.floor(Math.random() * 50),
                [MODES.FLEE]: 100,
                [MODES.CURIOUS]: 40 + Math.floor(Math.random() * 60),
                [MODES.SLEEPY]: 15 + Math.floor(Math.random() * 5),
                [MODES.PROMOTIONAL]: 60 + Math.floor(Math.random() * 60)
            }[newMode];

            if (newMode === MODES.SLEEPY && !promotional) {
                sleep = 5;
                moving = false;
                setAnim(ANI.SLEEP);
            }

            modeChangeCooldown = 10;

            if (!(sleep > 0 && anim === ANI.SLEEP)) {
                let modePhrase = {
                    [MODES.RANDOM]: "Vou explorar um pouco!",
                    [MODES.FOLLOW]: "Olha, o que você está fazendo?",
                    [MODES.FLEE]: "Aah! Pare de cutucar!",
                    [MODES.CURIOUS]: "O que tem por aqui?",
                    [MODES.SLEEPY]: "Estou com sono...",
                    [MODES.PROMOTIONAL]: "Deixe-me mostrar os cursos!"
                }[newMode];

                showPhrase(modePhrase);
            }
        }
    };

    var getRandomMode = () => {
        if (promotional) {
            return MODES.PROMOTIONAL;
        }

        // Reduce chance of SLEEPY mode
        const modes = [
            MODES.RANDOM, MODES.RANDOM, MODES.RANDOM,
            MODES.FOLLOW, MODES.FOLLOW, MODES.FOLLOW,
            MODES.CURIOUS, MODES.CURIOUS, MODES.CURIOUS, MODES.CURIOUS,
            MODES.SLEEPY // Only one chance for SLEEPY
        ];

        // If user hasn't interacted in a while, increase chance of CURIOUS mode
        if (Date.now() - lastInteractionTime > 30000) { // 30 seconds
            return Math.random() < 0.7 ? MODES.CURIOUS : modes[Math.floor(Math.random() * modes.length)];
        }

        return modes[Math.floor(Math.random() * modes.length)];
    };

    var moveTowards = (targetX, targetY, speed) => {
        let dx = targetX - x;
        let dy = targetY - y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) return false;

        // Adjust speed based on distance for smoother movement
        let adjustedSpeed = Math.min(speed, dist / 2);

        let moveX = (dx / dist) * adjustedSpeed;
        let moveY = (dy / dist) * adjustedSpeed;

        let newX = x + moveX;
        let newY = y + moveY;

        // Screen boundaries with navbar protection
        if (newX < 0) newX = 0;
        if (newX > window.innerWidth - 64) newX = window.innerWidth - 64;
        if (newY < navbarHeight) newY = navbarHeight;
        if (newY > window.innerHeight - 64) newY = window.innerHeight - 64;

        // Determine animation based on primary movement direction
        let anim;
        if (Math.abs(moveX) > Math.abs(moveY)) {
            anim = moveX > 0 ? ANI.RIGHT : ANI.LEFT;
        } else {
            anim = moveY > 0 ? ANI.DOWN : ANI.UP;
        }

        // Check if we're stuck at the same position
        if (Math.abs(newX - lastX) < 1 && Math.abs(newY - lastY) < 1) {
            stuckCounter++;
            if (stuckCounter > 5) {
                // If stuck for too long, try a different direction
                stuckCounter = 0;
                return false;
            }
        } else {
            stuckCounter = 0;
        }

        lastX = x;
        lastY = y;

        x = newX;
        y = newY;
        ele.style.top = `${y}px`;
        ele.style.left = `${x}px`;
        setAnim(anim);

        return true;
    };

    var moveAway = (targetX, targetY, speed) => {
        let dx = targetX - x;
        let dy = targetY - y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 300) return false;

        let moveX = -(dx / dist) * speed;
        let moveY = -(dy / dist) * speed;

        let newX = x + moveX;
        let newY = y + moveY;

        // Add random variation to avoid getting stuck in corners
        newX += (Math.random() - 0.5) * 10;
        newY += (Math.random() - 0.5) * 10;

        // Screen boundaries with navbar protection
        if (newX < 0) newX = 0;
        if (newX > window.innerWidth - 64) newX = window.innerWidth - 64;
        if (newY < navbarHeight) newY = navbarHeight;
        if (newY > window.innerHeight - 64) newY = window.innerHeight - 64;

        // Determine animation based on primary movement direction
        let anim;
        if (Math.abs(moveX) > Math.abs(moveY)) {
            anim = moveX > 0 ? ANI.RIGHT : ANI.LEFT;
        } else {
            anim = moveY > 0 ? ANI.DOWN : ANI.UP;
        }

        x = newX;
        y = newY;
        ele.style.top = `${y}px`;
        ele.style.left = `${x}px`;
        setAnim(anim);

        return true;
    };

    // Get all interactive elements on the page
    var findInteractiveElements = () => {
        const selector = promotional
            ? '.service-item, button, a'
            : 'button, a, input, select, textarea, img, h1, h2, h3, .interactive, [role="button"]';

        const elements = Array.from(document.querySelectorAll(selector));
        return elements.filter(el => {
            const rect = el.getBoundingClientRect();
            // Filter out elements that are:
            // 1. Not visible on screen
            // 2. Too small to be interesting
            // 3. In the navbar area
            return rect.width > 10 &&
                rect.height > 10 &&
                rect.top >= navbarHeight &&
                rect.left >= 0 &&
                rect.right <= window.innerWidth &&
                rect.bottom <= window.innerHeight &&
                window.getComputedStyle(el).display !== 'none' &&
                window.getComputedStyle(el).visibility !== 'hidden';
        });
    };

    // Find a random element to explore
    var findRandomElement = () => {
        const elements = findInteractiveElements();
        if (elements.length === 0) return null;

        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        const rect = randomElement.getBoundingClientRect();

        return {
            element: randomElement,
            x: rect.left + (rect.width / 2) - 32,
            y: rect.top + (rect.height / 2) - 32
        };
    };

    // Find a new element that's not the current one
    var findNewElement = () => {
        const elements = findInteractiveElements();
        if (elements.length <= 1) return findRandomElement();

        // Filter out the current target element
        const availableElements = elements.filter(el =>
            !targetElement || el !== targetElement.element
        );

        if (availableElements.length === 0) return findRandomElement();

        const randomElement = availableElements[Math.floor(Math.random() * availableElements.length)];
        const rect = randomElement.getBoundingClientRect();

        return {
            element: randomElement,
            x: rect.left + (rect.width / 2) - 32,
            y: rect.top + (rect.height / 2) - 32
        };
    };

    // Find the closest element to the pet
    var findClosestElement = () => {
        const elements = findInteractiveElements();
        if (elements.length === 0) return null;

        let closestElement = null;
        let closestDistance = Infinity;

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elementX = rect.left + (rect.width / 2);
            const elementY = rect.top + (rect.height / 2);

            const distance = Math.sqrt(
                Math.pow(elementX - (x + 32), 2) +
                Math.pow(elementY - (y + 32), 2)
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                closestElement = {
                    element: el,
                    x: elementX - 32,
                    y: elementY - 32
                };
            }
        });

        return closestElement;
    };

    // Move randomly within screen boundaries
    var moveRandomly = () => {
        // Generate a random position within screen boundaries
        let newX, newY;

        // Higher chance to move horizontally than vertically
        if (Math.random() < 0.7) {
            newX = x + (Math.random() < 0.5 ? -64 : 64);
            newY = y;
        } else {
            newX = x;
            newY = y + (Math.random() < 0.5 ? -64 : 64);
        }

        // Ensure we stay within screen boundaries
        if (newX < 0) newX = 64;
        if (newX > window.innerWidth - 64) newX = window.innerWidth - 128;
        if (newY < navbarHeight) newY = navbarHeight + 64;
        if (newY > window.innerHeight - 64) newY = window.innerHeight - 128;

        // Set animation based on movement direction
        let anim;
        if (newX > x) {
            anim = ANI.RIGHT;
        } else if (newX < x) {
            anim = ANI.LEFT;
        } else if (newY > y) {
            anim = ANI.DOWN;
        } else {
            anim = ANI.UP;
        }

        x = newX;
        y = newY;
        ele.style.top = `${y}px`;
        ele.style.left = `${x}px`;
        setAnim(anim);

        return true;
    };

    var update = () => {
        let bgX = -64 * frame;
        let bgY = -64 * anim;
        let pos = `${bgX}px ${bgY}px`;
        ele.style.backgroundPosition = pos;
        frame += 1;

        if (modeChangeCooldown > 0) {
            modeChangeCooldown--;
        }

        if (modeTimer > 0) {
            modeTimer--;
        } else if (currentMode !== MODES.FLEE) {
            changeMode(getRandomMode());
        }

        // If pet is thinking about clicking something, show a small bubble
        if (currentMode === MODES.CURIOUS && targetElement && Math.random() < 0.05) {
            showPhrase("Hmm, o que é isso?");
        }

        if (frame >= MaxFrame) {
            moving = false;

            if (sleep > 0 && !promotional) {
                sleep -= 1;
                setAnim(ANI.SLEEP);
            } else {
                switch (currentMode) {
                    case MODES.FOLLOW:
                        if (moveTowards(mouseX - 32, mouseY - 32, 64)) {
                            moving = true;
                        } else {
                            setAnim(ANI.IDEL1);
                        }
                        break;

                    case MODES.FLEE:
                        if (moveAway(mouseX, mouseY, 96)) {
                            moving = true;
                        } else {
                            setAnim(ANI.IDEL2);
                            if (modeTimer <= 0) {
                                changeMode(promotional ? MODES.PROMOTIONAL : MODES.RANDOM);
                            }
                        }
                        break;

                    case MODES.CURIOUS:
                        // If we don't have a target or we've tried too many times, find a new target
                        if (!targetElement || exploreAttempts > 15) {
                            targetElement = findNewElement();
                            exploreAttempts = 0;
                        }

                        if (targetElement) {
                            // Update target position in case the element moved
                            const rect = targetElement.element.getBoundingClientRect();
                            targetElement.x = rect.left + (rect.width / 2) - 32;
                            targetElement.y = rect.top + (rect.height / 2) - 32;

                            if (moveTowards(targetElement.x, targetElement.y, 64)) {
                                moving = true;
                                exploreAttempts++;
                            } else {
                                // We reached the target, act like we're examining it
                                setAnim(ANI.IDEL3);

                                // Small chance to "interact" with the element
                                if (Math.random() < 0.1) {
                                    showPhrase("Isso parece interessante!");
                                }

                                // Find a new target after a bit
                                exploreAttempts++;
                            }
                        } else {
                            setAnim(ANI.IDEL3);
                            moveRandomly();
                            moving = true;
                        }
                        break;

                    case MODES.PROMOTIONAL:
                        // First try to find service items, but fall back to any element if none found
                        let serviceItem = findRandomElement();

                        if (serviceItem && moveTowards(serviceItem.x, serviceItem.y, 64)) {
                            moving = true;

                            // Chance to show promotional phrase when moving to an item
                            if (Math.random() < 0.1) {  // 10% chance each update
                                showPromotionalPhrase();
                            }
                        } else {
                            // If we can't find or reach a service item, move randomly
                            if (moveRandomly()) {
                                moving = true;
                            } else {
                                setAnim(ANI.IDEL1);
                            }
                        }
                        break;

                    case MODES.SLEEPY:
                        if (sleep <= 0) {
                            sleep = 5;
                        }
                        setAnim(ANI.SLEEP);
                        break;

                    case MODES.RANDOM:
                    default:
                        // Decide between idle animations or movement
                        if (Math.random() < 0.3) {
                            // 30% chance to just do an idle animation
                            let idleAnim = Math.floor(Math.random() * 3);
                            setAnim(idleAnim);
                        } else {
                            // 70% chance to move
                            if (moveRandomly()) {
                                moving = true;
                            } else {
                                setAnim(ANI.IDEL1);
                            }
                        }
                        break;
                }
            }
        }

        if (speechBubble.style.display !== 'none') {
            updateSpeechBubblePosition();
        }

        // Always make the pet clickable regardless of mode
        ele.style.cursor = 'pointer';
    };

    setInterval(update, 150);

    var click = () => {
        lastInteractionTime = Date.now();

        // Always respond to clicks in any mode
        if (promotional) {
            // In promotional mode, always show a phrase when clicked
            showPromotionalPhrase();
            return;
        }

        if (sleep > 0 && anim === ANI.SLEEP) {
            // If sleeping, just show sleep message
            showPhrase("Zzzz... Estou com sono...");
            return;
        }

        // Save current state and mode
        const currentAnim = anim;
        const wasMoving = moving;
        const currentPetMode = currentMode;

        // Always show the pet animation
        setAnim(ANI.PET);
        petCount++;

        if (petCount > 5) {
            petCount = 0;
            changeMode(MODES.FLEE);
        } else {
            showRandomPhrase();

            // Return to previous mode after petting
            setTimeout(() => {
                if (currentPetMode !== MODES.FLEE) {
                    if (!wasMoving) {
                        setAnim(currentAnim);
                    }
                }
            }, 500);
        }
    };

    var trackMouse = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        lastInteractionTime = Date.now();
    };

    // Event handlers for clicks and mouse movement
    ele.addEventListener('click', click);
    document.addEventListener('mousemove', trackMouse);

    // Handle window resize to keep pet within bounds
    window.addEventListener('resize', () => {
        // Check if pet is out of bounds after resize
        if (x < 0) x = 0;
        if (x > window.innerWidth - 64) x = window.innerWidth - 64;
        if (y < navbarHeight) y = navbarHeight;
        if (y > window.innerHeight - 64) y = window.innerHeight - 64;

        // Update position
        ele.style.top = `${y}px`;
        ele.style.left = `${x}px`;
    });

    return ele;
}