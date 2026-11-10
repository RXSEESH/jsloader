(function () {
    'use strict';

    // Если скрипт запускали раньше — аккуратно убираем старую копию
    window.__openguessrCleanup?.();

    const disposers = [];
    const listen = (target, evt, fn) => {
        target.addEventListener(evt, fn);
        disposers.push(() => target.removeEventListener(evt, fn));
    };

    // ───────────────────────── Главное меню ─────────────────────────
    const mainMenu = document.createElement('div');
    mainMenu.id = 'openguessr-main-menu';
    mainMenu.innerHTML = `
        <div id="main-menu-header" style="cursor: move; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">⚡</span>
                <div>
                    <div style="font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">OPENGUESSR</div>
                    <div style="font-size: 9px; color: rgba(139, 92, 246, 0.9); margin-top: 1px; font-weight: 600;">by rxseesh</div>
                </div>
            </div>
            <button id="minimize-menu" style="background: rgba(255,255,255,0.1); border: none; color: rgba(255,255,255,0.8); cursor: pointer; font-size: 14px; padding: 2px 8px; line-height: 1; border-radius: 4px; font-weight: 600;">−</button>
        </div>
        <div id="menu-content" style="padding: 10px;">
            <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Features</div>

            <div id="location-tracker-toggle" style="
                padding: 10px;
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 14px;">📍</span>
                    <span style="font-size: 11px; font-weight: 600;">Location Tracker</span>
                </div>
                <div id="tracker-status" style="
                    font-size: 9px;
                    padding: 3px 7px;
                    background: rgba(34, 197, 94, 0.2);
                    color: rgb(34, 197, 94);
                    border-radius: 3px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                ">ON</div>
            </div>

            <div id="marker-helper-toggle" style="
                padding: 10px;
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: space-between;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 14px;">🎯</span>
                    <span style="font-size: 11px; font-weight: 600;">Marker Helper</span>
                </div>
                <div id="marker-helper-status" style="
                    font-size: 9px;
                    padding: 3px 7px;
                    background: rgba(239, 68, 68, 0.2);
                    color: rgb(239, 68, 68);
                    border-radius: 3px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                ">OFF</div>
            </div>
        </div>
    `;

    mainMenu.style.cssText = `
        position: fixed;
        top: 15px;
        left: 15px;
        background: rgba(15, 15, 20, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(139, 92, 246, 0.1) inset;
        z-index: 10001;
        width: 240px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        color: rgba(255, 255, 255, 0.95);
        transition: box-shadow 0.2s ease;
    `;
    document.body.appendChild(mainMenu);

    // ───────────────────────── Панель трекера ─────────────────────────
    const infoPanel = document.createElement('div');
    infoPanel.id = 'location-info-panel';
    infoPanel.innerHTML = `
        <div id="tracker-drag-handle" style="cursor: move; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 14px;">📍</span>
                <span style="font-weight: 600; font-size: 11px;">Tracker</span>
            </div>
            <button id="close-tracker" style="background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 16px; padding: 2px; line-height: 1;">×</button>
        </div>
        <div id="location-data" style="padding: 10px;">
            <div style="margin-bottom: 8px;">
                <div style="font-size: 9px; color: rgba(255,255,255,0.5); margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Coords</div>
                <div id="coords" style="font-size: 11px; font-weight: 500; font-family: 'Courier New', monospace;">Loading...</div>
            </div>
            <div style="margin-bottom: 8px;">
                <div style="font-size: 9px; color: rgba(255,255,255,0.5); margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Country</div>
                <div id="country" style="font-size: 11px;">Loading...</div>
            </div>
            <div style="margin-bottom: 8px;">
                <div style="font-size: 9px; color: rgba(255,255,255,0.5); margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">City</div>
                <div id="city" style="font-size: 11px;">Loading...</div>
            </div>
            <div>
                <div style="font-size: 9px; color: rgba(255,255,255,0.5); margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Street</div>
                <div id="street" style="font-size: 11px;">Loading...</div>
            </div>
            <div style="margin-top: 8px;">
                <div style="font-size: 9px; color: rgba(255,255,255,0.5); margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px;">Marker</div>
                <div id="marker-status" style="font-size: 11px;">выкл</div>
            </div>
        </div>
    `;

    infoPanel.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        background: rgba(15, 15, 20, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        z-index: 10000;
        width: 260px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        color: rgba(255, 255, 255, 0.95);
        transition: box-shadow 0.2s ease;
        display: block;
    `;
    document.body.appendChild(infoPanel);

    // ───────────────────────── Состояние ─────────────────────────
    let trackerActive = true;
    let markerHelperActive = false;
    let currentCoords = null;
    let rafId = null;
    let geocodeToken = 0;

    const $ = (id) => document.getElementById(id);

    // ───────────────────────── Координаты ─────────────────────────
    function readCoords() {
        const iframe = document.getElementById('panorama-iframe');
        if (!iframe) return null;

        const src = iframe.src || '';
        let m = null;

        try {
            const value = new URL(src, location.href).searchParams.get('location');
            m = value && value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
        } catch (e) { /* игнорируем */ }

        if (!m) {
            let decoded = src;
            try { decoded = decodeURIComponent(src); } catch (e) { /* игнорируем */ }
            m = decoded.match(/location=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
        }

        return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null;
    }

    async function getLocationInfo(lat, lng) {
        const token = ++geocodeToken;
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
            );
            const data = await response.json();
            if (token !== geocodeToken) return; // пришёл устаревший ответ

            const a = data.address;
            $('country').textContent = a?.country || 'Not determined';
            $('city').textContent = a?.city || a?.town || a?.village || 'Not determined';
            $('street').textContent = a?.road || 'Not determined';
        } catch (error) {
            if (token !== geocodeToken) return;
            console.error('Error fetching data:', error);
            $('country').textContent = 'Error';
            $('city').textContent = 'Error';
            $('street').textContent = 'Error';
        }
    }

    // Читаем координаты часто (это дёшево), а геокодим только когда они реально поменялись
    function pollCoords(force) {
        const coords = readCoords();

        if (!coords) {
            currentCoords = null;
            $('coords').textContent = 'Coordinates not found';
            return;
        }

        const changed = !currentCoords ||
            currentCoords.lat !== coords.lat ||
            currentCoords.lng !== coords.lng;

        currentCoords = coords;

        if (changed || force) {
            $('coords').textContent = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
            if (trackerActive) getLocationInfo(coords.lat, coords.lng);
        }
    }

    // ───────────────────────── Маркер по координатам (через тайлы) ─────────────────────────
    // Маркер — это обычный position:fixed элемент в <body>, поэтому ему не мешают
    // ни overflow карты, ни перерисовка #map. Положение считаем из позиции Google-тайлов на экране.
    // Если точка за пределами видимой части карты — маркер прижимается к краю и показывает стрелку.
    const styleEl = document.createElement('style');
    styleEl.id = 'og-helper-style';
    styleEl.textContent = `
        @keyframes og-pulse {
            0%, 100% { transform: scale(1);    box-shadow: 0 0 12px 4px rgba(255, 48, 48, 0.6); }
            50%      { transform: scale(1.25); box-shadow: 0 0 22px 8px rgba(255, 48, 48, 0.9); }
        }
    `;
    document.head.appendChild(styleEl);

    const marker = document.createElement('div');
    marker.id = 'og-helper-marker';
    marker.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        z-index: 2147483000;
        pointer-events: none;
        display: none;
    `;
    marker.innerHTML = `
        <div id="og-helper-arrow" style="position: absolute; left: 0; top: 0; width: 0; height: 0; display: none;">
            <div style="
                position: absolute;
                left: 17px;
                top: -9px;
                width: 0;
                height: 0;
                border-left: 14px solid #ff3030;
                border-top: 9px solid transparent;
                border-bottom: 9px solid transparent;
                filter: drop-shadow(0 0 3px #fff);
            "></div>
        </div>
        <div style="
            position: absolute;
            left: -13px;
            top: -13px;
            width: 26px;
            height: 26px;
            box-sizing: border-box;
            border: 4px solid #fff;
            border-radius: 50%;
            background: #ff3030;
            animation: og-pulse 1.6s ease-in-out infinite;
        "></div>
    `;
    const markerArrow = marker.querySelector('#og-helper-arrow');

    function setMarkerStatus(text) {
        const el = $('marker-status');
        if (el && el.textContent !== text) el.textContent = text;
    }

    function hideMarker(reason) {
        marker.style.display = 'none';
        setMarkerStatus(reason);
    }

    // Кэш разбора тайлов: x/y/z берём из src один раз на картинку
    const tileCache = new WeakMap();

    function parseTile(img) {
        const src = img.currentSrc || img.src;
        const cached = tileCache.get(img);
        if (cached && cached.src === src) return cached.value;

        let value = null;
        // Google: https://mt1.google.com/vt/lyrs=m&x=1&y=2&z=2&hl=en&scale=2 — без «?», поэтому searchParams не подходит
        const gx = src.match(/[?&\/]x=(\d+)/);
        const gy = src.match(/[?&\/]y=(\d+)/);
        const gz = src.match(/[?&\/]z=(\d+)/);
        if (gx && gy && gz) {
            value = { x: Number(gx[1]), y: Number(gy[1]), z: Number(gz[1]) };
        } else {
            const m = src.match(/\/(\d+)\/(\d+)\/(\d+)(?:\.\w+)?(?:[?#].*)?$/); // запасной вариант: .../z/x/y.png
            if (m) value = { z: Number(m[1]), x: Number(m[2]), y: Number(m[3]) };
        }

        tileCache.set(img, { src, value });
        return value;
    }

    function updateMarker() {
        const map = document.getElementById('map');
        if (!map) return hideMarker('нет #map');
        if (!currentCoords) return hideMarker('нет координат');

        const mapRect = map.getBoundingClientRect();
        if (mapRect.width < 10 || mapRect.height < 10) return hideMarker('карта скрыта');

        // Загруженные тайлы самого крупного зума (во время анимации зума на карте бывает несколько уровней)
        let maxZ = -Infinity;
        let loaded = 0;
        let sampleSrc = '';
        const tiles = [];
        for (const img of map.querySelectorAll('.leaflet-tile-pane img.leaflet-tile')) {
            if (!img.complete || !img.naturalWidth) continue;
            loaded++;
            sampleSrc = img.currentSrc || img.src;
            const t = parseTile(img);
            if (!t) continue;
            tiles.push({ img, x: t.x, y: t.y, z: t.z });
            if (t.z > maxZ) maxZ = t.z;
        }

        const candidates = tiles.filter((t) => t.z === maxZ);
        if (!candidates.length) {
            if (loaded && !updateMarker.warned) {
                updateMarker.warned = true;
                console.warn('[OpenGuessr] не смог разобрать URL тайла:', sampleSrc);
            }
            return hideMarker(loaded ? 'не разобрал URL тайлов' : 'нет загруженных тайлов');
        }

        // Web Mercator → «мировые» пиксели этого зума
        const size = 256 * 2 ** maxZ;
        const latRad = currentCoords.lat * Math.PI / 180;
        const baseX = (currentCoords.lng + 180) / 360 * size;
        const worldY = (1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * size;

        // Тайл, ближайший к точке (учитываем «повторы» мира по долготе)
        let best = null;
        let bestDist = Infinity;
        for (const t of candidates) {
            const wx = baseX + Math.round((t.x * 256 + 128 - baseX) / size) * size;
            const dist = Math.hypot(t.x * 256 + 128 - wx, t.y * 256 + 128 - worldY);
            if (dist < bestDist) {
                bestDist = dist;
                best = { t, wx };
            }
        }

        const { t, wx } = best;
        const rect = t.img.getBoundingClientRect();

        // Координаты точки в окне браузера
        const px = rect.left + (wx - t.x * 256) * rect.width / 256;
        const py = rect.top + (worldY - t.y * 256) * rect.height / 256;

        // Если точка за кадром — прижимаем к краю карты по линии от центра карты
        const cx = mapRect.left + mapRect.width / 2;
        const cy = mapRect.top + mapRect.height / 2;
        const pad = Math.min(18, Math.min(mapRect.width, mapRect.height) / 4);
        const hw = mapRect.width / 2 - pad;
        const hh = mapRect.height / 2 - pad;
        const dx = px - cx;
        const dy = py - cy;

        let x = px;
        let y = py;
        const offscreen = Math.abs(dx) > hw || Math.abs(dy) > hh;

        if (offscreen) {
            const s = Math.min(hw / (Math.abs(dx) || 1e-9), hh / (Math.abs(dy) || 1e-9));
            x = cx + dx * s;
            y = cy + dy * s;
            markerArrow.style.display = 'block';
            markerArrow.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        } else {
            markerArrow.style.display = 'none';
        }

        if (!marker.isConnected) document.body.appendChild(marker);
        marker.style.transform = `translate(${x}px, ${y}px)`;
        marker.style.display = 'block';
        setMarkerStatus(offscreen ? 'за кадром — стрелка показывает направление' : 'на карте');
    }

    function markerLoop() {
        if (!markerHelperActive) return;
        try {
            updateMarker();
        } catch (e) {
            console.error('[OpenGuessr] marker error:', e);
            hideMarker('ошибка (см. консоль)');
        }
        rafId = requestAnimationFrame(markerLoop);
    }

    function startMarker() {
        if (!marker.isConnected) document.body.appendChild(marker);
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(markerLoop);
    }

    function stopMarker() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        marker.style.display = 'none';
        marker.remove();
        setMarkerStatus('выкл');
    }

    // ───────────────────────── Переключатели ─────────────────────────
    function toggleMarkerHelper() {
        markerHelperActive = !markerHelperActive;
        const statusEl = $('marker-helper-status');
        const toggleEl = $('marker-helper-toggle');

        if (markerHelperActive) {
            statusEl.textContent = 'ON';
            statusEl.style.background = 'rgba(34, 197, 94, 0.2)';
            statusEl.style.color = 'rgb(34, 197, 94)';
            toggleEl.style.borderColor = 'rgba(34, 197, 94, 0.5)';
            pollCoords(false);
            startMarker();
        } else {
            statusEl.textContent = 'OFF';
            statusEl.style.background = 'rgba(239, 68, 68, 0.2)';
            statusEl.style.color = 'rgb(239, 68, 68)';
            toggleEl.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            stopMarker();
        }
    }

    function toggleTracker() {
        trackerActive = !trackerActive;
        const statusEl = $('tracker-status');
        const toggleEl = $('location-tracker-toggle');

        if (trackerActive) {
            infoPanel.style.display = 'block';
            statusEl.textContent = 'ON';
            statusEl.style.background = 'rgba(34, 197, 94, 0.2)';
            statusEl.style.color = 'rgb(34, 197, 94)';
            toggleEl.style.borderColor = 'rgba(34, 197, 94, 0.5)';
            pollCoords(true);
        } else {
            infoPanel.style.display = 'none';
            statusEl.textContent = 'OFF';
            statusEl.style.background = 'rgba(239, 68, 68, 0.2)';
            statusEl.style.color = 'rgb(239, 68, 68)';
            toggleEl.style.borderColor = 'rgba(139, 92, 246, 0.3)';
        }
    }

    listen($('location-tracker-toggle'), 'click', toggleTracker);
    listen($('marker-helper-toggle'), 'click', toggleMarkerHelper);
    listen($('close-tracker'), 'click', toggleTracker);

    // Hover-эффекты для кнопок
    [$('location-tracker-toggle'), $('marker-helper-toggle')].forEach((el) => {
        listen(el, 'mouseenter', () => {
            el.style.background = 'rgba(255,255,255,0.08)';
            el.style.transform = 'translateX(2px)';
        });
        listen(el, 'mouseleave', () => {
            el.style.background = 'rgba(255,255,255,0.04)';
            el.style.transform = 'translateX(0)';
        });
    });

    // Сворачивание главного меню
    let menuMinimized = false;
    listen($('minimize-menu'), 'click', function () {
        menuMinimized = !menuMinimized;
        $('menu-content').style.display = menuMinimized ? 'none' : 'block';
        this.textContent = menuMinimized ? '+' : '−';
        mainMenu.style.width = menuMinimized ? '180px' : '240px';
    });

    // Тени при наведении
    listen(mainMenu, 'mouseenter', () => {
        mainMenu.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(139, 92, 246, 0.2) inset';
    });
    listen(mainMenu, 'mouseleave', () => {
        mainMenu.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(139, 92, 246, 0.1) inset';
    });
    listen(infoPanel, 'mouseenter', () => {
        infoPanel.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.8)';
    });
    listen(infoPanel, 'mouseleave', () => {
        infoPanel.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.6)';
    });

    // ───────────────────────── Перетаскивание ─────────────────────────
    let isDraggingMenu = false;
    let isDraggingTracker = false;
    let menuInitialX, menuInitialY, trackerInitialX, trackerInitialY;

    const menuHeader = $('main-menu-header');
    const trackerDragHandle = $('tracker-drag-handle');

    listen(menuHeader, 'mousedown', (e) => {
        if (e.target.id === 'minimize-menu') return;
        isDraggingMenu = true;
        menuInitialX = e.clientX - mainMenu.offsetLeft;
        menuInitialY = e.clientY - mainMenu.offsetTop;
        menuHeader.style.cursor = 'grabbing';
    });

    listen(trackerDragHandle, 'mousedown', (e) => {
        if (e.target.id === 'close-tracker') return;
        isDraggingTracker = true;
        trackerInitialX = e.clientX - infoPanel.offsetLeft;
        trackerInitialY = e.clientY - infoPanel.offsetTop;
        trackerDragHandle.style.cursor = 'grabbing';
    });

    listen(document, 'mousemove', (e) => {
        if (isDraggingMenu) {
            e.preventDefault();
            mainMenu.style.left = (e.clientX - menuInitialX) + 'px';
            mainMenu.style.top = (e.clientY - menuInitialY) + 'px';
        }
        if (isDraggingTracker) {
            e.preventDefault();
            infoPanel.style.left = (e.clientX - trackerInitialX) + 'px';
            infoPanel.style.top = (e.clientY - trackerInitialY) + 'px';
            infoPanel.style.right = 'auto';
        }
    });

    listen(document, 'mouseup', () => {
        isDraggingMenu = false;
        isDraggingTracker = false;
        menuHeader.style.cursor = 'move';
        trackerDragHandle.style.cursor = 'move';
    });

    // ───────────────────────── Запуск и очистка ─────────────────────────
    pollCoords(true);
    const coordsTimer = setInterval(() => pollCoords(false), 500);

    window.__openguessrCleanup = () => {
        clearInterval(coordsTimer);
        if (rafId) cancelAnimationFrame(rafId);
        disposers.forEach((fn) => fn());
        marker.remove();
        styleEl.remove();
        mainMenu.remove();
        infoPanel.remove();
        delete window.__openguessrCleanup;
    };

    console.log('%c[OpenGuessr] Cheat menu loaded by rxseesh', 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
})();
