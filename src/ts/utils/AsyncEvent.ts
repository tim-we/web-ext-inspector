export default class AsyncEvent {
    private resolve: () => void;
    private promise: Promise<void>;
    private fired: boolean = false;
    private name: string;

    public constructor(name?: string) {
        this.promise = new Promise((resolve) => {
            this.resolve = resolve;
        });
        this.name = name ?? "";
    }

    public fire(): void {
        if (!this.fired) {
            this.fired = true;
            this.resolve();
        } else {
            console.warn(`Event '${this.name}' already fired.`);
        }
    }

    public get hasFired(): boolean {
        return this.fired;
    }

    public waitFor(): Promise<void> {
        return this.promise;
    }
}
