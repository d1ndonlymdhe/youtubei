import { PlaylistCompact, VideoCompact, ChannelCompact, Base, BaseAttributes, Thumbnails } from ".";
import { YoutubeRawData } from "../common";
/** @hidden */
export interface BaseVideoAttributes extends BaseAttributes {
    title: string;
    thumbnails: Thumbnails;
    description: string;
    channel: ChannelCompact;
    uploadDate: string;
    viewCount: number | null;
    likeCount: number | null;
    dislikeCount: number | null;
    isLiveContent: boolean;
    tags: string[];
    upNext: VideoCompact | PlaylistCompact | null;
    related: (VideoCompact | PlaylistCompact)[];
    relatedContinuation?: string;
}
/** Represents a Video  */
export default class BaseVideo extends Base implements BaseVideoAttributes {
    /** The title of this video */
    title: string;
    /** Thumbnails of the video with different sizes */
    thumbnails: Thumbnails;
    /** The description of this video */
    description: string;
    /** The channel that uploaded this video */
    channel: ChannelCompact;
    /** The date this video is uploaded at */
    uploadDate: string;
    /** How many view does this video have, null if the view count is hidden */
    viewCount: number | null;
    /** How many like does this video have, null if the like count hidden */
    likeCount: number | null;
    /** How many dislike does this video have, null if the dislike count is hidden */
    dislikeCount: number | null;
    /** Whether this video is a live content or not */
    isLiveContent: boolean;
    /** The tags of this video */
    tags: string[];
    /** Next video / playlist recommended by Youtube */
    upNext: VideoCompact | PlaylistCompact | null;
    /** Videos / playlists related to this video  */
    related: (VideoCompact | PlaylistCompact)[];
    /** Current continuation token to load next related content  */
    relatedContinuation?: string;
    /** @hidden */
    constructor(video?: Partial<BaseVideoAttributes>);
    /**
     * Load this instance with raw data from Youtube
     *
     * @hidden
     */
    load(data: YoutubeRawData): BaseVideo;
    /** Load next related videos / playlists */
    nextRelated(count?: number): Promise<(VideoCompact | PlaylistCompact)[]>;
    /** @hidden */
    static parseRawData(data: YoutubeRawData): YoutubeRawData;
    private static parseRelated;
    private static parseCompactRenderer;
    private static parseButtonRenderer;
}
