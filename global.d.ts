declare const __DEBUG__: boolean;
declare const __VERSION__: string;
declare const __CHROME_VERSION__: string;

declare module "friendly-time" {
    export default function friendlyTime(date: Date): string;
}
