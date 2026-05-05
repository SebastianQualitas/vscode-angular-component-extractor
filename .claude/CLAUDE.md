You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- **This project uses NgModule — NOT standalone components.** Always set `standalone: false` in `@Component` / `@Directive` / `@Pipe` decorators. Never omit it.
- Use signals for state management
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Routes are **eagerly loaded** — do not introduce lazy loading

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `input.required<T>()` instead of `@Input()` decorator
- Use `viewChild()` and `contentChild()` instead of `@ViewChild()` / `@ContentChild()` decorators
- Use `output()` instead of `@Output()` decorator
- Use `computed()` for derived state
- Use `styleUrl` (singular string) — never `styleUrls` (array)
- Declare `effect()` calls in the **constructor** (injection context) — never in lifecycle hooks
- Never use `async` callbacks directly inside `effect()`. Use `untracked(() => asyncFn())` instead
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- All code comments must be written in **English**

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
- Avoid `allowSignalWrites: true` in effect options — restructure the code instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`

## Services

- Design services around a single responsibility
- Use `providedIn: 'root'` for singleton services
- Use the `inject()` function instead of constructor injection
- Never hardcode API URLs — always use `ConfigurationService.API_ENDPOINT` or `configService.getConfig().apiEndpoint`

## Context pattern (project standard)

Reusable components receive a single `context` input that acts as a mediator between the caller and the component. The context is a plain TypeScript class (no `@Injectable`) with signals and computed properties.

```ts
// Caller sets these
readonly myInput = signal<T | undefined>(undefined);

// Component sets these (caller reads reactively)
readonly myOutput = signal<R | undefined>(undefined);

// Derived values
readonly derived = computed(() => /* ... */);
```

- Inputs the caller sets → writable `signal<T>()`
- Outputs the component updates → writable `signal<T>()` (caller reads them)
- Derived values → `computed<T>()`
- See `StandardListDetailContext` and `GenericTreeViewContext` as reference implementations

## Loading indicator

- Always use `<seq-loading>` (project loader) — never Bootstrap spinners or Kendo loaders
- Acquire the ref with: `private readonly loader = viewChild(SeqLoadingComponent)`
- Wrap async operations: `this.loader()?.open(false)` / `this.loader()?.close()`
- Use `[overlayType]="'APP'"` to cover the full viewport, `[overlayType]="'ELEMENT'"` to cover the host element

## CoreModule registration

Every new component, directive or pipe must be:
1. Added to `declarations` in `CoreModule`
2. Added to `exports` in `CoreModule` if used outside `CoreModule`
