declare interface App {
  /**
   * Should be called on the initial page load, and renders the app to the specified root.
   */
  render: (component: Component) => void;

  /**
   * Registers an event, that can be cancelled by returning false in a synchronous function or by calling `e.preventDefault()`
   * @param event The eventname to listen for, this can be a globale event e.g. `load` or it can listen to a specific namespace e.g. `router:navigate`
   * @param fn The callback that gets fired when an event is emitted
   */
  on: (event: string, fn: (e: EventData) => false | void) => void;

  /**
   * The current environment on vite, either `development` or `production`
   */
  environment: "development" | "production";
}

declare interface EventData {
  /**
   * Indicates whether an event can be cancelled using `event.preventDefault()`
   */
  cancelable: boolean;
  /**
   * Indicates whether or not an event has been cancelled using `event.preventDefault()`
   */
  defaultPrevented: boolean;
  /**
   * Cancels an event if `cancelable` is set to `true`
   */
  preventDefault: () => void;
}

/**
 * Creates a signal with `value`
 * @param value The initial value that the signal has
 */
export function createSignal(
  value: any,
  options?: {
    /**
     * Whether or not to rerun the effects when the setter value is the same as the previous value.
     * If it is false, the effects will rerun everytime the setter is called, doesn't matter if the value has changed
     * @default true
     */
    equals: boolean;
  }
): [get: () => any, set: (value: any) => any];

/**
 * Creates an effect that runs when a signal used in the effect function changes
 * @param fn The effect function itself
 */
export function createEffect(fn: (prev: any) => any): void;

/**
 * Creates a memoization function, this helps with performance as it caches previous results
 * @param fn The memo function
 */
export function createMemo(fn: Function): () => any;

/**
 * Creates a ref, link it to an element by adding it to the ref property of an element
 * returns a getter
 */
export function createRef(): () => Component;

/**
 * Fires when the element are mounted; when the app is loaded.
 * Usefull for refs and creating one-time side effects
 */
export function onMount(fn: Function): void;

/**
 * Fires when the app is unloaded, usefull for cleaning up effect
 */
export function onCleanup(fn: Function): void;

// External Types
export type Color = string;
export type Component = Function | HTMLElement;
