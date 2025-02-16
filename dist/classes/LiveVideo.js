"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const common_1 = require("../common");
const _1 = require(".");
const constants_1 = require("../constants");
/** Represents a video that's currently live, usually returned from `client.getVideo()` */
class LiveVideo extends _1.BaseVideo {
    /** @hidden */
    constructor(video = {}) {
        super();
        this._delay = 0;
        this._timeoutMs = 0;
        this._isChatPlaying = false;
        this._chatQueue = [];
        Object.assign(this, video);
    }
    /**
     * Load this instance with raw data from Youtube
     *
     * @hidden
     */
    load(data) {
        super.load(data);
        const videoInfo = _1.BaseVideo.parseRawData(data);
        this.watchingCount = +videoInfo.viewCount.videoViewCountRenderer.viewCount.runs
            .map((r) => r.text)
            .join(" ")
            .replace(/[^0-9]/g, "");
        this.chatContinuation =
            data[3].response.contents.twoColumnWatchNextResults.conversationBar.liveChatRenderer.continuations[0].reloadContinuationData.continuation;
        return this;
    }
    /**
     * Start polling for get live chat request
     *
     * @param delay chat delay in millisecond
     */
    playChat(delay = 0) {
        if (this._isChatPlaying)
            return;
        this._delay = delay;
        this._isChatPlaying = true;
        this.pollChatContinuation();
    }
    /** Stop request polling for live chat */
    stopChat() {
        if (!this._chatRequestPoolingTimeout)
            return;
        this._isChatPlaying = false;
        clearTimeout(this._chatRequestPoolingTimeout);
    }
    /** Start request polling */
    pollChatContinuation() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.http.post(constants_1.LIVE_CHAT_END_POINT, {
                data: { continuation: this.chatContinuation },
            });
            this.parseChat(response.data);
            const timedContinuation = response.data.continuationContents.liveChatContinuation.continuations[0]
                .timedContinuationData;
            this._timeoutMs = timedContinuation.timeoutMs;
            this.chatContinuation = timedContinuation.continuation;
            this._chatRequestPoolingTimeout = setTimeout(() => this.pollChatContinuation(), this._timeoutMs);
        });
    }
    /** Parse chat data from Youtube and add to chatQueue */
    parseChat(data) {
        const chats = data.continuationContents.liveChatContinuation.actions.flatMap((a) => { var _a; return ((_a = a.addChatItemAction) === null || _a === void 0 ? void 0 : _a.item.liveChatTextMessageRenderer) || []; });
        for (const rawChatData of chats) {
            const chat = new _1.Chat({ client: this.client }).load(rawChatData);
            if (this._chatQueue.find((c) => c.id === chat.id))
                continue;
            this._chatQueue.push(chat);
            setTimeout(() => {
                this.emit("chat", chat);
            }, chat.timestamp / 1000 - (new Date().getTime() - this._delay));
        }
    }
}
(0, common_1.applyMixins)(LiveVideo, [events_1.EventEmitter]);
exports.default = LiveVideo;
