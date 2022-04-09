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

const languageElements = [];
const translationElements = {};

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

let ready = false;

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

    descriptionElement = document.getElementById('description');
    topDescriptionElement = document.getElementById('description-top');
    bottomDescriptionElement = document.getElementById('description-bottom');
    mobileRotate = document.getElementById('mobile-rotate');

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

    fillLanguage('english');
    const queryLanguageElements = document.querySelectorAll('[data-language]');
    queryLanguageElements.forEach(element => {
        languageElements.push(element);
    });
    for (const elementID in languageContent) {
        translationElements[elementID] = document.getElementById(elementID);
    }
    initializeLanguages();
    selectDefaultLanguage();

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

    ready = true;

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
    if (!ready) {
        return;
    }

    scrollCallback();
});

window.addEventListener("deviceorientation", event => {
    if (!MOBILE) {
        return;
    }

    if (!ready) {
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

    if (!ready) {
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
    if (!ready) {
        return;
    }

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
    document.body.classList.add('loaded');
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

const fillLanguage = (language) => {
    for (const id in languageContent) {
        const element = document.getElementById(id);

        if (element.tagName === 'INPUT' && element.type === 'submit') {
            languageContent[id][language] = element.value;
        } else if (element.tagName === 'INPUT' && element.type === 'email') {
            languageContent[id][language] = element.placeholder;
        } else {
            languageContent[id][language] = element.innerText;
        }
    }
};

const initializeLanguages = () => {
    for (let i = 0; i < languageElements.length; i++) {
        const languageElement = languageElements[i];
        const language = languageElement.dataset.language;

        languageElement.addEventListener('click', () => {
            selectLanguage(language);
        });
    }
};

const selectLanguage = (language) => {
    let languageElement = null;
    for (let i = 0; i < languageElements.length; i++) {
        if (languageElements[i].dataset.language === language) {
            languageElement = languageElements[i];
            break;
        }
    }
    if (!languageElement) {
        console.error('Unknown language. ', language);
        return;
    }
    if (languageElement.classList.contains('selected')) {
        return;
    }

    for (let i = 0; i < languageElements.length; i++) {
        languageElements[i].classList.remove('selected');
        document.body.classList.remove(languageElements[i].dataset.language);
    }
    languageElement.classList.add('selected');
    document.body.classList.add(language);

    document.getElementById('language-selected').innerText = languageElement.innerText;

    for (const elementID in translationElements) {
        if (translationElements[elementID].tagName === 'INPUT' && translationElements[elementID].type === 'submit') {
            translationElements[elementID].value = languageContent[elementID][language];
        } else if (translationElements[elementID].tagName === 'INPUT' && translationElements[elementID].type === 'email') {
            translationElements[elementID].placeholder = languageContent[elementID][language];
        } else {
            translationElements[elementID].innerText = languageContent[elementID][language];
        }
    }

    adjustBossImages();
};

const selectDefaultLanguage = () => {
    const language = window.navigator.language;
    if (!language) {
        return;
    }

    for (const code in languageCodeMap) {
        if (language.toLowerCase().startsWith(code)) {
            selectLanguage(languageCodeMap[code]);
            return;
        }
    }

    console.error('Unknown default language. ', language);
};

const printEnglish = () => {
    let string = '';
    for (const id in languageContent) {
        string += languageContent[id]['english'] + '\n';
    }
    console.log(string);
};

const languageCodeMap = {
    'en': 'english',
    'ja': 'japanese',
    'zh': 'chinese',
    'es': 'spanish',
    'de': 'german',
    'fr': 'french',
    'pt': 'portuguese',
    'fi': 'finnish',
    'ko': 'korean',
    'pl': 'polish',
    'uk': 'ukrainian',
    'ru': 'russian',
};

const languageContent = {
    'description-top': {
        'english': null,
        'japanese': '腐敗した森と戦い、さまざまな元素の変身を発見し、ユニークな組み合わせを見つけて、仲間と一緒にスピリットウェルに帰ろう!',
        'chinese': '与腐败的森林作斗争，发现不同的元素转化，并找到独特的组合，与你的朋友一起返回灵井',
        'spanish': 'Lucha contra el bosque corrompido, descubre diferentes transformaciones elementales y encuentra combinaciones únicas para volver al Pozo de los Espíritus con tus amigos.',
        'german': 'Kämpfe gegen den verderbten Wald, entdecke verschiedene elementare Verwandlungen und finde einzigartige Kombinationen, um mit deinen Freunden zum Geisterbrunnen zurückzukehren!',
        'french': "Combattez la forêt corrompue, découvrez différentes transformations élémentaires et trouvez des combinaisons uniques pour retourner au Puits des esprits avec vos amis !",
        'portuguese': 'Lute contra a floresta corrompida, descubra diferentes transformações elementais e encontre combinações únicas para voltar ao Spiritwell com seus amigos!',
        'finnish': 'Taistele turmeltunutta metsää vastaan, löydä erilaisia elementtimuunnoksia ja löydä ainutlaatuisia yhdistelmiä palataksesi henkikaivoon ystävien kanssa!',
        'korean': '타락한 숲에 맞서 싸우고 다양한 원소 변형을 발견하고 독특한 조합을 찾아 친구들과 함께 Spiritwell로 돌아가세요!',
        'polish': 'Walcz ze zniszczonym lasem, odkryj różne transformacje żywiołów i znajdź unikalne kombinacje, aby powrócić z przyjaciółmi do Studni Duchów!',
        'ukrainian': 'Боріться проти зіпсованого лісу, відкрийте для себе різні перетворення стихій і знайдіть унікальні комбінації, щоб повернутися до Духовної криниці зі своїми друзями!',
        'russian': 'Сражайтесь с испорченным лесом, открывайте различные трансформации элементов и находите уникальные комбинации, чтобы вернуться в Колодец Духов вместе со своими друзьями!',
    },
    'description-bottom': {
        'english': null,
        'japanese': 'シェアライフに気をつけよう 一度外に出てしまうと、次の挑戦のためにスピリットウェルを通して一部の知識しか持ち帰ることができなくなります。',
        'chinese': '小心你的共享生命。一旦你出去了，你就只能通过灵井把一些知识带回来，供你下次尝试。',
        'spanish': 'Cuidado con las vidas compartidas. Una vez que estés fuera, sólo podrás traer algunos conocimientos a través del Pozo de los Espíritus para tu próximo intento.',
        'german': 'Seid vorsichtig mit euren gemeinsamen Leben. Wenn ihr einmal draußen seid, könnt ihr nur ein gewisses Wissen für euren nächsten Versuch durch den Geisterbrunnen mitnehmen.',
        'french': "Attention à vos vies partagées. Une fois que vous serez sortis, vous ne pourrez ramener que certaines connaissances par le Puits des Esprits pour votre prochaine tentative.",
        'portuguese': 'Cuidado com suas vidas compartilhadas. Uma vez fora, você só poderá trazer algum conhecimento de volta através do Spiritwell para sua próxima tentativa.',
        'finnish': 'Varokaa yhteisiä elämiänne. Kun olette ulkona, voitte tuoda vain osan tiedoista takaisin henkikaivon kautta seuraavaa yritystä varten.',
        'korean': '공유 생활에주의하십시오. 일단 나가면 다음 시도를 위해 Spiritwell을 통해 일부 지식을 다시 가져올 수 있습니다.',
        'polish': 'Uważaj na swoje wspólne życie. Kiedy już wyjdziecie, będziecie mogli przywrócić tylko część wiedzy przez Studnię Duchów, aby podjąć następną próbę.',
        'ukrainian': 'Бережіть спільне життя. Після того, як ви вийдете, ви зможете лише повернути певні знання через Spiritwell для наступної спроби.',
        'russian': 'Будьте осторожны с вашими общими жизнями. Выйдя из игры, вы сможете вернуть некоторые знания только через Колодец Духов для следующей попытки.',
    },
    'sub-thank-you': {
        'english': null,
        'japanese': 'ありがとうございました。',
        'chinese': '谢谢你',
        'spanish': '¡Gracias!',
        'german': 'Vielen Dank an euch!',
        'french': "Merci !",
        'portuguese': 'Obrigado!',
        'finnish': 'Kiitos!',
        'korean': '감사합니다!',
        'polish': 'Dziękujemy!',
        'ukrainian': 'Дякую!',
        'russian': 'Спасибо!',
    },
    'mce-EMAIL': {
        'english': null,
        'japanese': 'メール',
        'chinese': '电子邮件',
        'spanish': 'Envía un correo electrónico a',
        'german': 'E-Mail an',
        'french': "Envoyer un courriel à",
        'portuguese': 'Envie um e-mail para',
        'finnish': 'Sähköposti',
        'korean': '이메일',
        'polish': 'Wyślij e-mail na adres',
        'ukrainian': 'Електронна пошта',
        'russian': 'Эл. адрес',
    },
    'mc-embedded-subscribe': {
        'english': null,
        'japanese': '登録する',
        'chinese': '订阅',
        'spanish': 'Suscríbase a',
        'german': 'Abonnieren',
        'french': "S'abonner à",
        'portuguese': 'Assine',
        'finnish': 'Tilaa',
        'korean': '구독하다',
        'polish': 'Subskrybuj',
        'ukrainian': 'Підписатися',
        'russian': 'Подписаться',
    },
    'stay-tuned-title': {
        'english': null,
        'japanese': '注目',
        'chinese': '敬请关注',
        'spanish': 'SIGUE CONTINUANDO',
        'german': 'DRANBLEIBEN',
        'french': "RESTEZ À L'ÉCOUTE",
        'portuguese': 'FIQUE ATENTO',
        'finnish': 'PYSY AJAN TASALLA',
        'korean': '계속 지켜봐 주세요',
        'polish': 'POZOSTAŃ NA BIEŻĄCO',
        'ukrainian': 'Стежте за оновленнями',
        'russian': 'СЛЕДИТЕ ЗА НОВОСТЯМИ',
    
    },
    'stay-tuned-text': {
        'english': null,
        'japanese': '2023年のSteam Next Festに参加します!',
        'chinese': '我们会在2023年的Steam Next Fest上出现!',
        'spanish': '¡Estaremos en el Steam Next Fest en 2023!',
        'german': 'Wir sind beim nächsten Steam-Fest im Jahr 2023 dabei!',
        'french': "Nous serons présents au prochain Steam Fest en 2023 !",
        'portuguese': 'Estaremos no Steam Next Fest em 2023!',
        'finnish': 'Olemme mukana Steam Next Festissä vuonna 2023!',
        'korean': '2023년에는 Steam Next Fest에 참석할 예정입니다!',
        'polish': 'Będziemy na Steam Next Fest w 2023 roku!',
        'ukrainian': 'Ми будемо на Steam Next Fest у 2023 році!',
        'russian': 'Мы будем на Steam Next Fest в 2023 году!',
    
    },
    'feature-title-1': {
        'english': null,
        'japanese': 'エレメンタルアルケミーの反応',
        'chinese': '元素炼金术的反应',
        'spanish': 'Reacciones de Alquimia Elemental',
        'german': 'Elementare Alchemie-Reaktionen',
        'french': "Réactions de l'alchimie élémentaire",
        'portuguese': 'Reações de Alquimia Elementar',
        'finnish': 'Elementaalinen alkemia Reaktiot',
        'korean': '원소 연금술 반응',
        'polish': 'Alchemia Żywiołów Reakcje',
        'ukrainian': 'Реакції елементарної алхімії',
        'russian': 'Реакции Элементарной Алхимии',
    },
    'read-more-1': {
        'english': null,
        'japanese': 'もっと読む',
        'chinese': '阅读更多',
        'spanish': 'LEER MÁS',
        'german': 'LESEN SIE MEHR',
        'french': "LIRE PLUS",
        'portuguese': 'LEIA MAIS',
        'finnish': 'LUE LISÄÄ',
        'korean': '더 읽어보기',
        'polish': 'CZYTAJ WIĘCEJ',
        'ukrainian': 'ЧИТАЙТЕ БІЛЬШЕ',
        'russian': 'ЧИТАЙТЕ ДАЛЕЕ',
    },
    'feature-1-text-1': {
        'english': null,
        'japanese': 'キャラクターを犠牲にして元素を生成し、それらを組み合わせることで強力な結果を得ることができます。',
        'chinese': '牺牲你的角色来产生元素，并将它们结合起来以获得强大的效果!',
        'spanish': '¡Sacrifica a tu personaje para producir elementos y combínalos para obtener poderosos resultados!',
        'german': 'Opfere deinen Charakter, um Elemente zu erzeugen und sie für mächtige Ergebnisse zu kombinieren!',
        'french': "Sacrifiez votre personnage pour produire des éléments et combinez-les pour obtenir des résultats puissants !",
        'portuguese': 'Sacrifique seu caráter para produzir elementos e combiná-los para obter resultados poderosos!',
        'finnish': 'Uhraa hahmosi tuottaaksesi elementtejä ja yhdistämällä niitä saat voimakkaita tuloksia!',
        'korean': '캐릭터를 희생하여 요소를 생성하고 강력한 결과를 위해 결합하십시오!',
        'polish': 'Poświęć swoją postać, aby wytworzyć żywioły i połącz je, aby uzyskać potężne efekty!',
        'ukrainian': 'Пожертвуйте своїм персонажем, щоб створити елементи та комбінуйте їх для потужних результатів!',
        'russian': 'Принесите в жертву своего персонажа, чтобы получить элементы и объединить их для получения мощных результатов!',
    
    },
    'feature-1-text-2': {
        'english': null,
        'japanese': 'この元素の効果を利用して、新しいエリアのロックを解除し、敵を倒し、前進することができます。',
        'chinese': '使用这些元素效果来解锁新的区域，击败敌人，并取得进展。',
        'spanish': 'Utiliza estos efectos elementales para desbloquear nuevas áreas, derrotar enemigos y progresar.',
        'german': 'Nutze diese elementaren Effekte, um neue Gebiete freizuschalten, Feinde zu besiegen und voranzukommen.',
        'french': "Utilisez ces effets élémentaires pour débloquer de nouvelles zones, vaincre des ennemis et progresser.",
        'portuguese': 'Use estes efeitos elementares para destravar novas áreas, derrotar inimigos e progredir.',
        'finnish': 'Käytä näitä elementtivaikutuksia avataksesi uusia alueita, voittaaksesi vihollisia ja edetäksesi.',
        'korean': '이러한 원소 효과를 사용하여 새로운 영역을 잠금 해제하고 적을 물리치고 진행하십시오.',
        'polish': 'Wykorzystaj te efekty żywiołów, aby odblokować nowe obszary, pokonać wrogów i robić postępy.',
        'ukrainian': 'Використовуйте ці елементарні ефекти, щоб відкривати нові області, перемогти ворогів і прогресувати.',
        'russian': 'Используйте эти элементарные эффекты, чтобы открывать новые области, побеждать врагов и продвигаться вперед.',
    
    },
    'feature-1-text-3': {
        'english': null,
        'japanese': 'チームメイトと協力して、さまざまな相互作用を発見してください。',
        'chinese': '与你的队友合作，发现所有不同的相互作用。',
        'spanish': 'Trabaja con tus compañeros de equipo para descubrir todas las diferentes interacciones.',
        'german': 'Arbeite mit deinen Teamkameraden zusammen, um alle verschiedenen Interaktionen zu entdecken.',
        'french': "Travaillez avec vos coéquipiers pour découvrir toutes les différentes interactions.",
        'portuguese': 'Trabalhe com seus colegas de equipe para descobrir todas as diferentes interações.',
        'finnish': 'Tee yhteistyötä joukkuetovereidesi kanssa, jotta voit löytää kaikki erilaiset vuorovaikutukset.',
        'korean': '팀원들과 협력하여 다양한 상호 작용을 모두 발견하십시오.',
        'polish': 'Współpracuj z członkami swojej drużyny, aby odkryć wszystkie różne interakcje.',
        'ukrainian': 'Попрацюйте зі своїми товаришами по команді, щоб дізнатися про різні взаємодії.',
        'russian': 'Работайте с товарищами по команде, чтобы открыть всевозможные взаимодействия.',
    
    },
    'hide-1': {
        'english': null,
        'japanese': 'ヒデ',
        'chinese': '隐蔽',
        'spanish': 'OCULTAR',
        'german': 'VERSTECKEN',
        'french': "CACHEZ",
        'portuguese': 'SEJA',
        'finnish': 'HIDE',
        'korean': '숨다',
        'polish': 'UKRYJ',
        'ukrainian': 'СХОВАТИ',
        'russian': 'СКРЫТЬ',
    },
    'feature-title-2': {
        'english': null,
        'japanese': 'オンライン多人数同時参加',
        'chinese': '在线多人合作游戏',
        'spanish': 'Co-op online para varios jugadores',
        'german': 'Online-Mutliplayer-Koop',
        'french': "Coopération multijoueur en ligne",
        'portuguese': 'Mutliplayer Co-op Online',
        'finnish': 'Online Mutliplayer Co-op',
        'korean': '온라인 멀티플레이어 협동',
        'polish': 'Sieciowa kooperacja dla wielu graczy',
        'ukrainian': 'Кооператив для кількох гравців онлайн',
        'russian': 'Кооперативный сетевой мультиплеер',
    },
    'read-more-2': {
        'english': null,
        'japanese': 'もっと読む',
        'chinese': '阅读更多',
        'spanish': 'LEER MÁS',
        'german': 'LESEN SIE MEHR',
        'french': "LIRE PLUS",
        'portuguese': 'LEIA MAIS',
        'finnish': 'LUE LISÄÄ',
        'korean': '더 읽어보기',
        'polish': 'CZYTAJ WIĘCEJ',
        'ukrainian': 'ЧИТАЙТЕ БІЛЬШЕ',
        'russian': 'ЧИТАТЬ ДАЛЕЕ',
    },
    'feature-2-text-1': {
        'english': null,
        'japanese': '仲間と一緒に...。',
        'chinese': '与你的朋友一起工作...',
        'spanish': 'Trabaja junto a tus amigos...',
        'german': 'Arbeite mit deinen Freunden zusammen...',
        'french': "Travaillez ensemble avec vos amis...",
        'portuguese': 'Trabalhe junto com seus amigos...',
        'finnish': 'Tee yhteistyötä ystäviesi kanssa...',
        'korean': '친구와 함께 작업...',
        'polish': 'Współpracuj z przyjaciółmi...',
        'ukrainian': 'Працюйте разом з друзями...',
        'russian': 'Работайте вместе со своими друзьями...',
    
    },
    'feature-2-text-2': {
        'english': null,
        'japanese': 'そうでない場合も。',
        'chinese': '或不合作。',
        'spanish': 'O no.',
        'german': 'Oder auch nicht.',
        'french': "Ou pas.",
        'portuguese': 'Ou não.',
        'finnish': 'Tai sitten et.',
        'korean': '아니면.',
        'polish': 'Albo i nie.',
        'ukrainian': 'Чи ні.',
        'russian': 'Или нет.',
    
    },
    'hide-2': {
        'english': null,
        'japanese': 'ヒデ',
        'chinese': '隐藏',
        'spanish': 'OCULTAR',
        'german': 'HIDE',
        'french': "HIDE",
        'portuguese': 'SEJA',
        'finnish': 'HIDE',
        'korean': '숨다',
        'polish': 'UKRYJ',
        'ukrainian': 'СХОВАТИ',
        'russian': 'HIDE',
    },
    'feature-title-3': {
        'english': null,
        'japanese': 'チームによるボス戦',
        'chinese': '基于团队的BOSS战',
        'spanish': 'Peleas de jefes en equipo',
        'german': 'Teambasierte Bosskämpfe',
        'french': "Combats de boss en équipe",
        'portuguese': 'Lutas de chefes em equipe',
        'finnish': 'Tiimipohjaiset pomotaistelut',
        'korean': '팀 기반 보스전',
        'polish': 'Drużynowe walki z bossami',
        'ukrainian': 'Командні бої з босами',
        'russian': 'Командные бои с боссами',
    },
    'read-more-3': {
        'english': null,
        'japanese': 'もっと読む',
        'chinese': '查看更多',
        'spanish': 'LEER MÁS',
        'german': 'LESEN SIE MEHR',
        'french': "LIRE PLUS",
        'portuguese': 'LEIA MAIS',
        'finnish': 'LUE LISÄÄ',
        'korean': '더 읽어보기',
        'polish': 'CZYTAJ WIĘCEJ',
        'ukrainian': 'ЧИТАЙТЕ БІЛЬШЕ',
        'russian': 'ЧИТАТЬ ДАЛЕЕ',
    },
    'feature-3-text-1': {
        'english': null,
        'japanese': 'ボスはストレートな戦いであり、複雑なパズルでもある。',
        'chinese': '老板们既是直接的战斗，又是复杂的谜题。',
        'spanish': 'Los jefes son tanto peleas directas como complejos rompecabezas.',
        'german': 'Bosse sind sowohl direkte Kämpfe als auch komplexe Puzzles.',
        'french': "Les boss sont à la fois des combats directs et des énigmes complexes.",
        'portuguese': 'Os patrões são tanto lutas diretas quanto quebra-cabeças complexos.',
        'finnish': 'Pomot ovat sekä suoria taisteluita että monimutkaisia pulmia.',
        'korean': '보스는 직접적인 싸움이자 복잡한 퍼즐입니다.',
        'polish': 'Bossowie to zarówno zwykłe walki, jak i skomplikowane łamigłówki.',
        'ukrainian': 'Боси - це як прямі бої, так і складні головоломки.',
        'russian': 'Боссы - это и прямые схватки, и сложные головоломки.',
    
    },
    'feature-3-text-2': {
        'english': null,
        'japanese': 'エレメント変換で弱点を突け',
        'chinese': '用你的元素转换来利用他们的弱点。',
        'spanish': 'Aprovecha sus debilidades con tus transformaciones elementales.',
        'german': 'Nutze ihre Schwächen mit deinen elementaren Verwandlungen aus.',
        'french': "Tirez parti de leurs faiblesses grâce à vos transformations élémentaires.",
        'portuguese': 'Tire proveito de suas fraquezas com suas transformações elementais.',
        'finnish': 'Hyödynnä niiden heikkouksia elementtimuunnoksillasi.',
        'korean': '당신의 원소 변형으로 그들의 약점을 이용하십시오.',
        'polish': 'Wykorzystaj ich słabości dzięki transformacjom żywiołów.',
        'ukrainian': 'Скористайтеся їхніми слабкостями за допомогою своїх стихійних трансформацій.',
        'russian': 'Воспользуйтесь их слабостями с помощью своих элементарных превращений.',
    
    },
    'feature-3-text-3': {
        'english': null,
        'japanese': 'ボスを倒すと、そのパワーを奪い、さらに多くのインタラクションを発見することができます。',
        'chinese': '打败他们，窃取他们的力量，发现更多的互动。',
        'spanish': 'Derrótalos para robar sus poderes y descubrir aún más interacciones.',
        'german': 'Besiege sie, um ihre Kräfte zu stehlen und noch mehr Interaktionen zu entdecken.',
        'french': "Battez-les pour voler leurs pouvoirs et découvrir encore plus d'interactions.",
        'portuguese': 'Derrote-os para roubar seus poderes e descobrir ainda mais interações.',
        'finnish': 'Voittaaksesi heidät voit varastaa heidän voimansa ja löytää vielä enemmän vuorovaikutusta.',
        'korean': '그들을 물리치고 그들의 힘을 훔치고 더 많은 상호작용을 발견하세요.',
        'polish': 'Pokonaj ich, aby ukraść ich moce i odkryć jeszcze więcej interakcji.',
        'ukrainian': 'Перемагайте їх, щоб вкрасти їхні сили та відкрити ще більше взаємодій.',
        'russian': 'Победите их, чтобы украсть их силы и открыть еще больше взаимодействий.',
    
    },
    'feature-3-text-4': {
        'english': null,
        'japanese': 'その意気だ!',
        'chinese': '这就是精神!',
        'spanish': '¡Ese es el espíritu!',
        'german': 'Das ist die richtige Einstellung!',
        'french': "C'est ça l'esprit !",
        'portuguese': 'Esse é o espírito!',
        'finnish': 'Siinä on henki!',
        'korean': '그 정신이야!',
        'polish': 'To jest właśnie duch!',
        'ukrainian': 'Це дух!',
        'russian': 'Вот это дух!',
    
    },
    'hide-3': {
        'english': null,
        'japanese': 'ヒデ',
        'chinese': '隐蔽',
        'spanish': 'OCULTAR',
        'german': 'VERSTECKEN',
        'french': "CACHEZ",
        'portuguese': 'SEJA',
        'finnish': 'HIDE',
        'korean': '숨다',
        'polish': 'UKRYJ',
        'ukrainian': 'СХОВАТИ',
        'russian': 'СКРЫТЬ',
    },
};