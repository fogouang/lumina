declare module "@met4citizen/talkinghead" {
  export class TalkingHead {
    constructor(node: HTMLElement, opt?: Record<string, unknown>);

    audioCtx: AudioContext;
    audioSpeechGainNode: GainNode;
    mtAvatar: Record<string, { newvalue?: number; needsUpdate?: boolean }>;
    opt: Record<string, any>;

    showAvatar(
      avatar: Record<string, unknown>,
      onprogress?: (ev: ProgressEvent) => void,
    ): Promise<void>;

    lookAtCamera(t: number): void;
    stop(): void;
    dispose?(): void;
  }
}