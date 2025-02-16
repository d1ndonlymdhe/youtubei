"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var SearchResult_1;
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const common_1 = require("../common");
const _1 = require(".");
/**
 * Represents search result, usually returned from `client.search();`.
 *
 * {@link SearchResult} is a subclass of [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
 * with {@link SearchResult.next} method to navigate through pagination
 *
 * @example
 * ```ts
 * const searchResult = await youtube.search("Keyword");
 *
 * console.log(searchResult); // search result from first page
 *
 * let nextSearchResult = await searchResult.next();
 * console.log(nextSearchResult); // search result from second page
 *
 * nextSearchResult = await searchResult.next();
 * console.log(nextSearchResult); // search result from third page
 *
 * console.log(searchResult); // search result from first, second, and third page.
 * ```
 *
 * @noInheritDoc
 */
let SearchResult = SearchResult_1 = class SearchResult extends Array {
    /** @hidden */
    constructor() {
        super();
    }
    /**
     * Load this instance
     *
     * @hidden
     */
    load(client) {
        this.client = client;
        return this;
    }
    /**
     * Initialize data from search
     *
     * @param query Search query
     * @param options Search Options
     * @hidden
     */
    init(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.http.post(`${constants_1.I_END_POINT}/search`, {
                data: {
                    query,
                    params: options.params || SearchResult_1.getSearchTypeParam(options.type),
                },
            });
            this.estimatedResults = +response.data.estimatedResults;
            if (this.estimatedResults > 0) {
                this.loadSearchResult(response.data.contents.twoColumnSearchResultsRenderer.primaryContents
                    .sectionListRenderer.contents);
            }
            return this;
        });
    }
    /**
     * Load next search data. Youtube returns inconsistent amount of search result, it usually varies from 18 to 20
     *
     * @example
     * ```js
     * const videos = await youtube.search("keyword", { type: "video" });
     * console.log(videos) // first 18-20 videos from the search result
     *
     * let newVideos = await videos.next();
     * console.log(newVideos) // 18-20 loaded videos
     * console.log(videos) // 36-40 first videos from the search result
     * ```
     *
     * @param count How many times to load the next data
     */
    next(count = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const newSearchResults = [];
            for (let i = 0; i < count; i++) {
                if (!this.continuation)
                    break;
                const response = yield this.client.http.post(`${constants_1.I_END_POINT}/search`, {
                    data: { continuation: this.continuation },
                });
                newSearchResults.push(...this.loadSearchResult(response.data.onResponseReceivedCommands[0].appendContinuationItemsAction
                    .continuationItems));
            }
            this.push(...newSearchResults);
            return newSearchResults;
        });
    }
    /** Load videos data from youtube */
    loadSearchResult(sectionListContents) {
        const contents = sectionListContents
            .filter((c) => "itemSectionRenderer" in c)
            .pop().itemSectionRenderer.contents;
        this.continuation = (0, common_1.getContinuationFromItems)(sectionListContents);
        const newContent = [];
        for (const content of contents) {
            if ("playlistRenderer" in content)
                newContent.push(new _1.PlaylistCompact({ client: this.client }).load(content.playlistRenderer));
            else if ("videoRenderer" in content)
                newContent.push(new _1.VideoCompact({ client: this.client }).load(content.videoRenderer));
            else if ("channelRenderer" in content)
                newContent.push(new _1.ChannelCompact({ client: this.client }).load(content.channelRenderer));
        }
        this.push(...newContent);
        return newContent;
    }
    /**
     * Get type query value
     *
     * @param type Search type
     * @hidden
     */
    static getSearchTypeParam(type) {
        const searchType = {
            video: "EgIQAQ%3D%3D",
            playlist: "EgIQAw%3D%3D",
            channel: "EgIQAg%3D%3D",
            all: "",
        };
        return type in searchType ? searchType[type] : "";
    }
};
SearchResult = SearchResult_1 = __decorate([
    (0, common_1.extendsBuiltIn)()
], SearchResult);
exports.default = SearchResult;
