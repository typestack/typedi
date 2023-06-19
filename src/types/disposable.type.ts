export interface Disposable {
    dispose (): Promise<void> | void;
}