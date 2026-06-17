import { H as Hls } from './hls-dru42stk.js';

function setStatus(container, message) {
    const status = container.querySelector('[data-player-status]');
    if (status) {
        status.textContent = message;
    }
}

function markReady(container) {
    container.classList.add('is-ready');
}

function initPlayer(container) {
    const video = container.querySelector('video[data-src]');
    const toggle = container.querySelector('[data-player-toggle]');
    if (!video) {
        return;
    }

    const source = video.dataset.src;
    let hlsInstance = null;

    if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            markReady(container);
        });
        hlsInstance.on(Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
                return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setStatus(container, '网络波动，正在重新加载播放源…');
                hlsInstance.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                setStatus(container, '媒体解码异常，正在恢复播放…');
                hlsInstance.recoverMediaError();
            } else {
                setStatus(container, '当前浏览器无法播放该视频源');
                hlsInstance.destroy();
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
            markReady(container);
        });
    } else {
        setStatus(container, '当前浏览器不支持 HLS 播放');
    }

    async function togglePlayback() {
        try {
            if (video.paused) {
                await video.play();
            } else {
                video.pause();
            }
        } catch (error) {
            setStatus(container, '请再次点击播放按钮启动视频');
        }
    }

    if (toggle) {
        toggle.addEventListener('click', togglePlayback);
    }
    video.addEventListener('click', togglePlayback);
    video.addEventListener('play', function () {
        container.classList.add('is-playing');
        markReady(container);
    });
    video.addEventListener('pause', function () {
        container.classList.remove('is-playing');
    });
    video.addEventListener('ended', function () {
        container.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

document.querySelectorAll('.hls-player').forEach(initPlayer);
