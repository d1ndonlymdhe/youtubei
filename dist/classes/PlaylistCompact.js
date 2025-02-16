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
const _1 = require(".");
const common_1 = require("../common");
/** Represents a Compact Playlist (e.g. from search result, upNext / related of a video) */
class PlaylistCompact extends _1.Base {
    /** @hidden */
    constructor(playlist = {}) {
        super();
        Object.assign(this, playlist);
    }
    /**
     * Load this instance with raw data from Youtube
     *
     * @hidden
     */
    load(data) {
        var _a;
        const { playlistId, title, thumbnail, shortBylineText, videoCount, videoCountShortText, } = data;
        this.id = playlistId;
        this.title = title.simpleText || title.runs[0].text;
        this.videoCount = (0, common_1.stripToInt)(videoCount || videoCountShortText.simpleText) || 0;
        // Thumbnail
        this.thumbnails = new _1.Thumbnails().load(((_a = data.thumbnails) === null || _a === void 0 ? void 0 : _a[0].thumbnails) || thumbnail.thumbnails);
        // Channel
        if (shortBylineText && shortBylineText.simpleText !== "YouTube") {
            const shortByLine = shortBylineText.runs[0];
            this.channel = new _1.ChannelCompact({
                id: shortByLine.navigationEndpoint.browseEndpoint.browseId,
                name: shortByLine.text,
                client: this.client,
            });
        }
        return this;
    }
    /**
     * Get {@link Playlist} object based on current playlist id
     *
     * Equivalent to
     * ```js
     * client.getPlaylist(playlistCompact.id);
     * ```
     */
    getPlaylist() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.client.getPlaylist(this.id));
        });
    }
}
exports.default = PlaylistCompact;
