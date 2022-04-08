const MOBILE = !!(window.orientation !== undefined && window.DeviceOrientationEvent);

const headers = [

];

const widths = [
    1.10,
    1.10,
    1.10,
    1.10,
    1.10,
    1.10,
    1.10,
    1.10,
    1.10,
];

// movement based on a given 100vw image, so 1 is nothing, 2 is 50% in each side
const movement = [
    1 - 0.12,
    1 - 0.06,
    1 + 0.00,
    1 + 0.06,
    1 + 0.12,
    1 + 0.18,
    1 + 0.22,
    1 + 0.30,
    1 + 0.32,
];

for (let i = 0; i < movement.length; i++) {
    movement[i] = 1 + (movement[i] - 1) * 0.5;
}

const verticalMovement = [
    1 - 0.004,
    1 - 0.002,
    1 + 0.000,
    1 + 0.002,
    1 + 0.004,
    1 + 0.006,
    1 + 0.007,
    1 + 0.010,
    1,
];

let scrollArrowElement = null;
let scrollTargetElement = null;
let descriptionElement = null;
let topDescriptionElement = null;
let bottomDescriptionElement = null;
let mobileRotate = null;
let showedMobileControls = false;

let lastRenderTime = 0;
const realizedMouseOffset = [0, 0];
const mouseOffset = [0, 0];

let playingDefaultAnimation = true;
let defaultAnimationStartTime = 0;

window.addEventListener('load', () => {
    headers[0] = [document.getElementById('layer1-img')];
    headers[1] = [document.getElementById('layer2-img'), document.getElementById('layer2-webp')];
    headers[2] = [document.getElementById('layer3-img'), document.getElementById('layer3-webp')];
    headers[3] = [document.getElementById('layer4-img'), document.getElementById('layer4-webp')];
    headers[4] = [document.getElementById('layer5-img'), document.getElementById('layer5-webp')];
    headers[5] = [document.getElementById('layer6-img'), document.getElementById('layer6-webp')];
    headers[6] = [document.getElementById('layer7-img'), document.getElementById('layer7-webp')];
    headers[7] = [document.getElementById('layer8-img'), document.getElementById('layer8-webp')];
    headers[8] = [document.getElementById('layer9-img'), document.getElementById('layer9-webp')];

    let count = 0;
    for (let i = 0; i < headers.length; i++) {
        const loadCallback = () => {
            count++;

            if (count === headers.length) {
                loaded();
            }
        };

        if (headers[i][0].complete || (headers[i][1] && headers[i][1].complete)) {
            loadCallback();
        } else {
            headers[i][0].addEventListener('load', loadCallback);
            headers[i][0].addEventListener('error', event => {
                console.error('Error loading image. ', headers[i][0].src);
            });
            headers[i][1] && headers[i][1].addEventListener('load', loadCallback);
            headers[i][1] && headers[i][1].addEventListener('error', event => {
                console.error('Error loading image. ', headers[i][1].src);
            });
        }
    }

    initializeInformation(
        document.getElementById('callout-1'),
        document.getElementById('information-1'),
        document.getElementById('read-more-1'),
        document.getElementById('hide-1'),
    );

    initializeInformation(
        document.getElementById('callout-2'),
        document.getElementById('information-2'),
        document.getElementById('read-more-2'),
        document.getElementById('hide-2'),
    );

    initializeInformation(
        document.getElementById('callout-3'),
        document.getElementById('information-3'),
        document.getElementById('read-more-3'),
        document.getElementById('hide-3'),
    );

    initializeScrollButton(
        document.getElementById('scroll-arrow'),
        document.getElementById('scroll-target'),
    );

    descriptionElement = document.getElementById('description');
    topDescriptionElement = document.getElementById('description-top');
    bottomDescriptionElement = document.getElementById('description-bottom');
    mobileRotate = document.getElementById('mobile-rotate');

    document.getElementById('mc-embedded-subscribe').addEventListener('click', event => {
        subscribe();
    });
    document.getElementById('mce-EMAIL').addEventListener('keypress', event => {
        var keyCode = event.code || event.key;
        if (keyCode == 'Enter') {
            subscribe();
        }
    });

    scrollCallback();
    adjustBossImages();

    window.requestAnimationFrame(animationFrame);
});

const initializeInformation = (title, information, more, hide) => {
    more.addEventListener('click', event => {
        title.classList.remove('visible');
        information.classList.add('visible');
    });

    hide.addEventListener('click', event => {
        title.classList.add('visible');
        information.classList.remove('visible');
    });
};

const initializeScrollButton = (arrow, description) => {
    scrollArrowElement = arrow;
    scrollTargetElement = description;

    arrow.addEventListener('click', event => {
        if (arrow.classList.contains('hidden')) {
            return;
        }

        const bounding = description.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + bounding.top);
    });
};

const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};

const openSubscribeExternalPage = () => {
    window.location = 'https://mailchi.mp/8d6a81268f39/stay-updated';
};

const subscribeThankYou = () => {
    document.getElementById('subscribe-area').classList.add('thanks');
    setTimeout(() => {
        document.getElementById('subscribe-area').classList.remove('thanks');
        document.getElementById('mce-EMAIL').value = '';
    }, 4000);
};

const errorSubscribeBox = () => {

};

const subscribe = () => {
    const input = document.getElementById('mce-EMAIL');
    const email = input.value || '';

    if (!validateEmail(email)) {
        errorSubscribeBox();

        return;
    }

    if (document.getElementById('kinda-email').value) {
        subscribeThankYou();

        return;
    }

    const request = new XMLHttpRequest();
    request.onload = () => {
        if (request.status !== 200) {
            console.error('Unknown issue subscribing.', request.status, request.responseText);
            openSubscribeExternalPage();

            return;
        }

        // say thank you
        subscribeThankYou();
    };
    request.onerror = () => {
        console.error('Error subscribing.', request.responseText);
        openSubscribeExternalPage();
    };
    request.open('POST', 'https://server.intothespiritwell.com:4430/subscribe', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({email: email}));
};

const mouseMoveCallback = (x, y) => {
    mouseOffset[0] = x;
    mouseOffset[1] = y;
};

const scrollCallback = () => {
    if (topDescriptionElement) {
        const topDescriptionBottom = topDescriptionElement.getBoundingClientRect().bottom;
        if (topDescriptionBottom <= window.innerHeight * 0.85) {
            scrollArrowElement.classList.add('hidden');
            topDescriptionElement.classList.add('visible');
        }
    }
    if (bottomDescriptionElement) {
        const bottomDescriptionBottom = bottomDescriptionElement.getBoundingClientRect().bottom;
        if (bottomDescriptionBottom <= window.innerHeight * 0.85) {
            bottomDescriptionElement.classList.add('visible');
        }
    }
};

window.addEventListener('scroll', event => {
    scrollCallback();
});

window.addEventListener("deviceorientation", event => {
    if (!MOBILE) {
        return;
    }

    if (playingDefaultAnimation) {
        return;
    }

    const x = Math.min(Math.max((event.gamma || 0) / 25, -1), 1);
    const y = Math.min(Math.max(((event.beta || 0) - 45) / 25, -1), 1);

    const sign = -Math.sign(event.beta - 90) || 1;

    mouseMoveCallback(x * sign, y);
});

window.addEventListener('mousemove', event => {
    if (MOBILE) {
        return;
    }

    if (playingDefaultAnimation) {
        playingDefaultAnimation = false;
        showMobileControls();
    }

    const x = ((event.clientX || 0) / window.innerWidth - 0.5) * 2;
    const y = ((event.clientY || 0) / window.innerHeight - 0.5) * 2;

    mouseMoveCallback(x, y);
});

window.addEventListener('resize', event => {
    adjustBossImages();
});

const showMobileControls = () => {
    if (!showedMobileControls) {
        showedMobileControls = true;

        mobileRotate.classList.add('visible');
        setTimeout(() => {
            mobileRotate.classList.remove('visible');
        }, 4300);
    }
};

const loaded = () => {
    document.body.className = 'loaded';
};

const animationFrame = () => {
    if (!lastRenderTime) {
        lastRenderTime = Date.now();
    }

    const now = Date.now();
    const dt = now - lastRenderTime;
    lastRenderTime = now;

    const dx = mouseOffset[0] - realizedMouseOffset[0];
    const dy = mouseOffset[1] - realizedMouseOffset[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0 && dt > 0) {
        const applyDistance = distance / dt * 1;
        realizedMouseOffset[0] += dx / distance * applyDistance;
        realizedMouseOffset[1] += dy / distance * applyDistance;
    }

    if (playingDefaultAnimation) {
        if (defaultAnimationStartTime === 0) {
            defaultAnimationStartTime = now;
        }

        const progress = Math.min((now - defaultAnimationStartTime) / 4000, 1);
        realizedMouseOffset[0] = -Math.cos(progress * Math.PI);
        realizedMouseOffset[1] = -Math.cos(progress * Math.PI);

        if (progress >= 0.65) {
            showMobileControls();
        }
        if (progress >= 1) {
            playingDefaultAnimation = false;
        }
    }

    let headerOffsetX = 0;
    if (window.innerHeight > window.innerWidth) {
        headerOffsetX = (realizedMouseOffset[0] + 1) / 2;
        headerOffsetX *= -(window.innerHeight - window.innerWidth) / window.innerWidth;
    }
    for (let i = 0; i < headers.length; i++) {
        const scaledMouseOffsetX = (Math.sin(realizedMouseOffset[0] * Math.PI / 2) * 0.25 + realizedMouseOffset[0] * 0.75) * 0.625;
        // const scaledMouseOffsetX = realizedMouseOffset[0] * 0.625;
        // const availableMouseOffsetX = Math.min(Math.max(scaledMouseOffsetX, -0.625), 0.625);

        const defaultOffset = -(widths[i] - 1) / 2;
        const additionalOffsetX = -(movement[i] - 1) / 2 * scaledMouseOffsetX;
        const offset = defaultOffset + additionalOffsetX;

        const additionalOffsetY = -(verticalMovement[i] - 1) / 2 * (1 - realizedMouseOffset[1]);

        headers[i][0].style.left = (offset * 100 + headerOffsetX * 100) + 'vw';
        headers[i][0].style.top = (additionalOffsetY * 100) + 'vw';
        if (headers[i][1]) {
            headers[i][1].style.left = (offset * 100 + headerOffsetX * 100) + 'vw';
            headers[i][1].style.top = (additionalOffsetY * 100) + 'vw';
        }
    }

    window.requestAnimationFrame(animationFrame);
};

const adjustBossImages = () => {
    if (window.innerWidth <= 1200) {
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
    }

    const bottomPosition = getElementPosition('bottom');
    const bottomOffsetPosition = getElementPosition('bottom-offset');
    const bossPlantImages = [document.getElementById('boss-image-img'), document.getElementById('boss-image-webp')];
    positionImages(bossPlantImages, {x: 682, y: 1970}, bottomPosition, {x: 1648, y: 1970}, bottomOffsetPosition);

    const kodamaVineStart = getElementPosition('kodama-vine-start');
    const kodamaVineP1 = getElementPosition('kodama-vine-p1');
    const kodamaVineP2 = getElementPosition('kodama-vine-p2');
    const kodamaVineEnd = getElementPosition('kodama-vine-end');
    const kodamaVine1 = [document.getElementById('kodama-vine-1-img'), document.getElementById('kodama-vine-1-webp')];
    const kodamaVine2 = [document.getElementById('kodama-vine-2-img'), document.getElementById('kodama-vine-2-webp')];
    positionImages(kodamaVine1, {x: 20, y: 100}, kodamaVineStart, {x: 760, y: 170}, kodamaVineP1);
    positionImages(kodamaVine2, {x: 60, y: 464}, kodamaVineP2, {x: 430, y: 94}, kodamaVineEnd);

    const fireVineStart = getElementPosition('fire-vine-start');
    const fireVineEnd = getElementPosition('fire-vine-end');
    const fireVine = [document.getElementById('fire-vine-img'), document.getElementById('fire-vine-webp')];
    positionImages(fireVine, {x: 35, y: 328}, fireVineStart, {x: 1322, y: 20}, fireVineEnd);

    const wrappedVineStart = getElementPosition('wrapped-vine-start');
    const wrappedVineP1 = getElementPosition('wrapped-vine-p1');
    const wrappedVineP2 = getElementPosition('wrapped-vine-p2');
    const wrappedVineEnd = getElementPosition('wrapped-vine-end');
    const wrappedVine1 = [document.getElementById('wrapped-vine-1-img'), document.getElementById('wrapped-vine-1-webp')];
    const wrappedVine2 = [document.getElementById('wrapped-vine-2-img'), document.getElementById('wrapped-vine-2-webp')];
    positionImages(wrappedVine1, {x: 18, y: 416}, wrappedVineStart, {x: 765, y: 0}, wrappedVineP1);
    positionImages(wrappedVine2, {x: 60, y: 50}, wrappedVineP2, {x: 162, y: 50}, wrappedVineEnd);

    const verticalVineRightStart = getElementPosition('vertical-vine-right-start');
    const verticalVineRightEnd = getElementPosition('vertical-vine-right-end');
    const verticalVineRight = [document.getElementById('vertical-vine-right-img'), document.getElementById('vertical-vine-right-webp')];
    positionImages(verticalVineRight, {x: 222, y: 968}, verticalVineRightStart, {x: 430, y: 4}, verticalVineRightEnd);

    const verticalVineLeftStart = getElementPosition('vertical-vine-left-start');
    const verticalVineLeftEnd = getElementPosition('vertical-vine-left-end');
    const verticalVineLeft = [document.getElementById('vertical-vine-left-img'), document.getElementById('vertical-vine-left-webp')];
    positionImages(verticalVineLeft, {x: 128, y: 768}, verticalVineLeftStart, {x: 28, y: 8}, verticalVineLeftEnd);

    const wallVineStart = getElementPosition('wall-vine-start');
    const wallVineEnd = getElementPosition('wall-vine-end');
    const wallVine = [document.getElementById('wall-vine-img'), document.getElementById('wall-vine-webp')];
    positionImages(wallVine, {x: 650, y: 1130}, wallVineStart, {x: 14, y: 16}, wallVineEnd);
};

const positionImages = (elements, anchorOffsetA, positionA, anchorOffsetB, positionB, uniformScale) => {
    if (elements[0]) {
        positionImage(elements[0], anchorOffsetA, positionA, anchorOffsetB, positionB, uniformScale);
    }
    if (elements[1]) {
        positionImage(elements[1], anchorOffsetA, positionA, anchorOffsetB, positionB, uniformScale);
    }
};

const positionImage = (element, anchorOffsetA, positionA, anchorOffsetB, positionB, uniformScale) => {
    if (uniformScale === undefined) {
        uniformScale = true;
    }

    let scaleX;
    let scaleY;
    let rotation = 0;
    if (uniformScale) {
        const anchorDX = anchorOffsetB.x - anchorOffsetA.x;
        const anchorDY = anchorOffsetB.y - anchorOffsetA.y;
        const anchorD = Math.sqrt(anchorDX * anchorDX + anchorDY * anchorDY);

        const positionDX = positionB.x - positionA.x;
        const positionDY = positionB.y - positionA.y;
        const positionD = Math.sqrt(positionDX * positionDX + positionDY * positionDY);

        scaleX = positionD / anchorD;
        scaleY = positionD / anchorD;

        const originalAngle = Math.atan2(anchorDY, anchorDX);
        const newAngle = Math.atan2(positionDY, positionDX);

        const deltaAngle = radiansBetweenAngles(originalAngle, newAngle);
        rotation = deltaAngle * (180 / Math.PI);
    } else {
        const anchorDX = anchorOffsetB.x - anchorOffsetA.x;
        const anchorDY = anchorOffsetB.y - anchorOffsetA.y;

        const positionDX = positionB.x - positionA.x;
        const positionDY = positionB.y - positionA.y;
        const positionD = Math.sqrt(positionDX * positionDX + positionDY * positionDY);

        const scaledDX = Math.sqrt(positionD * positionD - anchorDY * anchorDY);
        scaleX = scaledDX / anchorDX;
        scaleY = 1;

        const originalAngle = Math.atan2(anchorDY, anchorDX);
        const newAngle = Math.atan2(positionDY, positionDX);

        const deltaAngle = radiansBetweenAngles(originalAngle, newAngle);
        rotation = deltaAngle * (180 / Math.PI);
    }

    // const width = element.clientWidth * scaleX;
    // const height = element.clientHeight * scaleY;

    const transformOriginX = anchorOffsetA.x;
    const transformOriginY = anchorOffsetA.y;

    const left = positionA.x - anchorOffsetA.x;
    const top = positionA.y - anchorOffsetA.y;

    element.style.left = left + 'px';
    element.style.top = top + 'px';
    element.style.transformOrigin = transformOriginX + 'px ' + transformOriginY + 'px';
    element.style.transform = 'scale(' + scaleX + ', ' + scaleY + ') rotate(' + rotation + 'deg)';
};

const getElementPosition = (id) => {
    const bounding = document.getElementById(id).getBoundingClientRect();
    return {x: bounding.x + window.scrollX, y: bounding.y + window.scrollY}
};

const radiansBetweenAngles = (angleFrom, angleTo) => {
    if (angleTo < angleFrom) {
        if (angleFrom - angleTo > Math.PI) {
            return Math.PI * 2 - (angleFrom - angleTo);
        } else {
            return -(angleFrom - angleTo);
        }
    } else {
        if (angleTo - angleFrom > Math.PI) {
            return -(Math.PI * 2 - (angleTo - angleFrom));
        } else {
            return angleTo - angleFrom;
        }
    }
};