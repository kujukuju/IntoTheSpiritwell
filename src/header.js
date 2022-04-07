const MOBILE = window.orientation !== undefined && window.DeviceOrientationEvent;

const headers = [

];

// [
//     [root, [
//         [element, position, movement],
//         ...,
//     ]],
//     ...,
// ]
const parallax = [

];

// [0, 0.4, 1.0, ...]
const parallaxDistances = [

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


    // 1.00,
    // 1.04,
    // 1.08,
    // 1.12,
    // 1.16,
    // 1.20,
    // 1.24,
    // 1.28,
    // 1.32,
    // 1.32,
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
    // 1.00,
    // 1.04,
    // 1.08,
    // 1.12,
    // 1.16,
    // 1.20,
    // 1.24,
    // 1.28,
    // 1.32,
    // 1.32,
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

    // 1,
    // 1,
    // 1,
    // 1,
    // 1,
    // 1,
    // 1,
    // 1,
    // 1,

    // 1 - 0.012,
    // 1 - 0.006,
    // 1 + 0.000,
    // 1 + 0.006,
    // 1 + 0.012,
    // 1 + 0.018,
    // 1 + 0.012,
    // 1 + 0.030,
    // 1,
];

let scrollArrowElement = null;
let scrollTargetElement = null;
let descriptionElement = null;

let lastRenderTime = 0;
const realizedMouseOffset = [0, 0];
const mouseOffset = [0, 0];

let playingDefaultAnimation = true;
let defaultAnimationStartTime = 0;

window.addEventListener('load', () => {
    headers[0] = document.getElementById('layer1');
    headers[1] = document.getElementById('layer2');
    headers[2] = document.getElementById('layer3');
    headers[3] = document.getElementById('layer4');
    headers[4] = document.getElementById('layer5');
    headers[5] = document.getElementById('layer6');
    headers[6] = document.getElementById('layer7');
    headers[7] = document.getElementById('layer8');
    headers[8] = document.getElementById('layer9');

    let count = 0;
    for (let i = 0; i < headers.length; i++) {
        const loadCallback = () => {
            count++;

            if (count === headers.length) {
                loaded();
            }
        };

        if (headers[i].complete) {
            loadCallback();
        } else {
            headers[i].addEventListener('load', loadCallback);
            headers[i].addEventListener('error', event => {
                console.error('Error loading image. ', headers[i].src);
            });
        }
    }

    // initializeParallax(document.getElementById('parallax-1'), [
    //     document.getElementById('1-1'),
    //     document.getElementById('1-2'),
    //     document.getElementById('1-3'),
    //     document.getElementById('1-4'),
    //     document.getElementById('1-5'),
    //     document.getElementById('1-6'),
    // ], [
    //     [-248, -155],
    //     [194, -92],
    //     [-242, -20],
    //     [-14, 167],
    //     [0, 0],
    //     [200, 90],
    // ], [
    //     1.35,
    //     1.25,
    //     1.15,
    //     1.05,
    //     1,
    //     0.9,
    // ]);

    // initializeParallax(document.getElementById('parallax-2'), [
    //     document.getElementById('2-1'),
    //     document.getElementById('2-2'),
    //     document.getElementById('2-3'),
    //     document.getElementById('2-4'),
    //     document.getElementById('2-5'),
    // ], [
    //     [-145, -232],
    //     [140, -200],
    //     [-288, -148],
    //     [0, 0],
    //     [321, -64],
    // ], [
    //     1.2,
    //     1.15,
    //     1.1,
    //     1,
    //     0.85,
    // ]);

    // initializeParallax(document.getElementById('parallax-3'), [
    //     document.getElementById('3-1'),
    //     document.getElementById('3-2'),
    //     document.getElementById('3-3'),
    //     document.getElementById('3-4'),
    //     document.getElementById('3-5'),
    // ], [
    //     [-214, -360],
    //     [130, -230],
    //     [350, 60],
    //     [-40, -20],
    //     [-170, 170],
    // ], [
    //     1.15,
    //     1.1,
    //     1.05,
    //     1,
    //     0.95,
    // ]);

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

    scrollCallback();
    adjustBossImages();

    window.requestAnimationFrame(animationFrame);
});

const initializeParallax = (root, elements, positions, movements) => {
    if (elements.length !== movements.length || elements.length !== positions.length) {
        console.error('Movements must match elements must match positions.');
        return;
    }

    const list = [];
    parallax.push([root, list]);
    parallaxDistances.push(0);

    for (let i = 0; i < elements.length; i++) {
        list.push([elements[i], positions[i], movements[i]]);

        elements[i].style.left = positions[i][0] + 'px';
        elements[i].style.top = positions[i][1] + 'px';
    }
};

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

const mouseMoveCallback = (x, y) => {
    mouseOffset[0] = x;
    mouseOffset[1] = y;
};

const scrollCallback = () => {
    for (let i = 0; i < parallax.length; i++) {
        const root = parallax[i][0];
        const bounding = root.getBoundingClientRect();
        const rootTop = bounding.top;

        const rangeTop = -bounding.height;
        const rangeBottom = window.innerHeight;

        const progress = Math.max(Math.min((rootTop - rangeTop) / (rangeBottom - rangeTop), 1), 0);
        parallaxDistances[i] = 1 - progress;
    }

    if (descriptionElement) {
        const descriptionBottom = descriptionElement.getBoundingClientRect().bottom;
        if (descriptionBottom <= window.innerHeight) {
            scrollArrowElement.classList.add('hidden');
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

    playingDefaultAnimation = false;

    const x = Math.min(Math.max((event.gamma || 0) / 25, -1), 1);
    const y = Math.min(Math.max(((event.beta || 0) - 45) / 25, -1), 1);

    const sign = -Math.sign(event.beta - 90) || 1;

    mouseMoveCallback(x * sign, y);
});

window.addEventListener('mousemove', event => {
    if (MOBILE) {
        return;
    }

    playingDefaultAnimation = false;

    const x = ((event.clientX || 0) / window.innerWidth - 0.5) * 2;
    const y = ((event.clientY || 0) / window.innerHeight - 0.5) * 2;

    mouseMoveCallback(x, y);
});

window.addEventListener('resize', event => {
    adjustBossImages();
});

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
    }

    for (let i = 0; i < headers.length; i++) {
        const scaledMouseOffsetX = (Math.sin(realizedMouseOffset[0] * Math.PI / 2) * 0.25 + realizedMouseOffset[0] * 0.75) * 0.625;
        // const scaledMouseOffsetX = realizedMouseOffset[0] * 0.625;
        // const availableMouseOffsetX = Math.min(Math.max(scaledMouseOffsetX, -0.625), 0.625);

        const defaultOffset = -(widths[i] - 1) / 2;
        const additionalOffsetX = -(movement[i] - 1) / 2 * scaledMouseOffsetX;
        const offset = defaultOffset + additionalOffsetX;

        const additionalOffsetY = -(verticalMovement[i] - 1) / 2 * (1 - realizedMouseOffset[1]);

        headers[i].style.left = (offset * 100) + 'vw';
        headers[i].style.top = (additionalOffsetY * 100) + 'vw';
    }

    for (let i = 0; i < parallax.length; i++) {
        const [root, list] = parallax[i];
        for (let a = 0; a < list.length; a++) {
            const [element, position, movement] = list[a];

            const parallaxStrength = Math.pow(Math.sin(parallaxDistances[i] * Math.PI), 2);

            const additionalOffsetX = -(movement - 1) / 2 * realizedMouseOffset[0] * 960 * parallaxStrength;
            const additionalOffsetY = -(movement - 1) / 4 * 960 * (parallaxDistances[i] - 0.5) * 2;
            // const additionalOffsetY = -(movement - 1) / 2 / 8 * realizedMouseOffset[1] * 960;

            element.style.left = (position[0] + additionalOffsetX) + 'px';
            element.style.top = (position[1] + additionalOffsetY) + 'px';
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
    const bossPlantImage = document.getElementById('boss-image');
    positionImage(bossPlantImage, {x: 682, y: 1970}, bottomPosition, {x: 1648, y: 1970}, bottomOffsetPosition);

    const kodamaVineStart = getElementPosition('kodama-vine-start');
    const kodamaVineP1 = getElementPosition('kodama-vine-p1');
    const kodamaVineP2 = getElementPosition('kodama-vine-p2');
    const kodamaVineEnd = getElementPosition('kodama-vine-end');
    const kodamaVine1 = document.getElementById('kodama-vine-1');
    const kodamaVine2 = document.getElementById('kodama-vine-2');
    positionImage(kodamaVine1, {x: 344, y: 164}, kodamaVineStart, {x: 1094, y: 234}, kodamaVineP1);
    positionImage(kodamaVine2, {x: 60, y: 464}, kodamaVineP2, {x: 430, y: 94}, kodamaVineEnd);

    const fireVineStart = getElementPosition('fire-vine-start');
    const fireVineEnd = getElementPosition('fire-vine-end');
    const fireVine = document.getElementById('fire-vine');
    positionImage(fireVine, {x: 388, y: 278}, fireVineStart, {x: 1322, y: 20}, fireVineEnd);

    const wrappedVineStart = getElementPosition('wrapped-vine-start');
    const wrappedVineP1 = getElementPosition('wrapped-vine-p1');
    const wrappedVineP2 = getElementPosition('wrapped-vine-p2');
    const wrappedVineEnd = getElementPosition('wrapped-vine-end');
    const wrappedVine1 = document.getElementById('wrapped-vine-1');
    const wrappedVine2 = document.getElementById('wrapped-vine-2');
    positionImage(wrappedVine1, {x: 18, y: 416}, wrappedVineStart, {x: 765, y: 0}, wrappedVineP1);
    positionImage(wrappedVine2, {x: 60, y: 50}, wrappedVineP2, {x: 162, y: 50}, wrappedVineEnd);

    const verticalVineRightStart = getElementPosition('vertical-vine-right-start');
    const verticalVineRightEnd = getElementPosition('vertical-vine-right-end');
    const verticalVineRight = document.getElementById('vertical-vine-right');
    positionImage(verticalVineRight, {x: 222, y: 968}, verticalVineRightStart, {x: 430, y: 4}, verticalVineRightEnd);

    const verticalVineLeftStart = getElementPosition('vertical-vine-left-start');
    const verticalVineLeftEnd = getElementPosition('vertical-vine-left-end');
    const verticalVineLeft = document.getElementById('vertical-vine-left');
    positionImage(verticalVineLeft, {x: 128, y: 768}, verticalVineLeftStart, {x: 28, y: 8}, verticalVineLeftEnd);

    const wallVineStart = getElementPosition('wall-vine-start');
    const wallVineEnd = getElementPosition('wall-vine-end');
    const wallVine = document.getElementById('wall-vine');
    positionImage(wallVine, {x: 650, y: 1130}, wallVineStart, {x: 14, y: 16}, wallVineEnd);
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