# Fix: MainLayout Preload Emitter

Brief: I'll document how to fix the `MainLayout` preload issue so `allPagesLoaded` is driven reliably by preloaded pages when they mount. This file is a concise checklist, recommended implementation (with code snippets), testing steps, edge-cases, and rollout guidance you can return to later.

One-line problem summary
- `MainLayout.vue` attempted to listen for a `@vue:mounted` event on dynamically-mounted `<component>` instances. Vue does not emit lifecycle hooks as DOM events, so that handler never fires and `allPagesLoaded` may never become true except via the fallback timer.

High-level plan
- Replace the invalid `@vue:mounted` usage with a custom emitted event (e.g. `preload-mounted`).
- Have each preloaded page emit `preload-mounted` in its `mounted()` / `onMounted()` hook.
- Parent listens for that event and tracks unique pages (use `route.path` as id) in a Set; mark `allPagesLoaded` true when all preload routes have reported or on fallback timeout.

Checklist (implement in order)
- [ ] Update `src/layouts/MainLayout.vue` preload block to listen for `@preload-mounted` and pass a stable id (route.path) for each preloaded component.
- [ ] In each preloaded page (those listed in `preloadRoutes`), add an emitter in `mounted()` (Options API) or `onMounted()` (Composition API): `this.$emit('preload-mounted')` or `emit('preload-mounted')`.
- [ ] Implement `onComponentLoaded(id)` in `MainLayout` to add `id` to a Set and set `allPagesLoaded` to true when the Set size >= number of preloadRoutes.
- [ ] Keep a fallback timer (e.g., 1500–3000 ms), but cancel it when all pages report in.
- [ ] Test locally with the dev server; verify `allPagesLoaded` toggles as pages mount and preloader hides early.

Recommended implementation (concise)

1) Parent: `MainLayout.vue` — preload render (replace your existing preload block)

```vue
<!-- parent: MainLayout.vue (preload container) -->
<div v-show="false" class="preload-container">
  <component
    v-for="route in preloadRoutes"
    :key="route.path"
    :is="route.component"
    @preload-mounted="onComponentLoaded(route.path)" />
</div>
```

Notes:
- We pass `route.path` inline to the handler. That keeps child pages unchanged (no extra payload required).
- `onComponentLoaded(route.path)` will be called when the child emits `preload-mounted`.

2) Parent: `setup()` pieces (Composition API)

```js
// inside setup()
const loadedComponents = ref(new Set());
const allPagesLoaded = ref(false);
let fallbackTimer = null;

function onComponentLoaded(path) {
  loadedComponents.value.add(path);
  if (loadedComponents.value.size >= preloadRoutes.length) {
    allPagesLoaded.value = true;
    if (fallbackTimer) clearTimeout(fallbackTimer);
  }
}

onMounted(() => {
  // fallback safety
  fallbackTimer = setTimeout(() => {
    if (!allPagesLoaded.value) allPagesLoaded.value = true;
  }, 2000); // adjust timeout as needed
});
```

3) Child pages: emit on mount
- If page uses Options API:

```js
export default {
  name: 'IndexPage',
  mounted() {
    this.$emit('preload-mounted');
  },
  // ...existing code...
}
```

- If page uses Composition API:

```js
import { onMounted } from 'vue';
export default {
  name: 'RandomizerPage',
  setup(props, { emit }) {
    onMounted(() => {
      emit('preload-mounted');
    });
    // ...existing setup code...
  }
}
```

Alternative: emit your id from the child (e.g. `emit('preload-mounted', '/randomizer')`) and listen with `@preload-mounted="onComponentLoaded"` (the handler will receive the id). Passing `route.path` inline in the parent is simpler because it avoids altering many child files.

Edge cases & gotchas
- If a preloaded page never mounts (e.g., guarded, conditionally returns early), it won't emit; fallback covers this.
- Use a stable id (route.path or route.name). Do not use timestamps or random values — they can't dedupe.
- If pages are lazy-loaded async components, they still mount when used via `<component :is=
